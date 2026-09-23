import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { BackupRepository } from './backup.repository';
import { LicenseRepository } from '../license/license.repository';
import { LicenseBackupRecord } from './backup.types';

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly baseStorageDir: string;
  private readonly maxRetainedBackups = 3;

  constructor(
    private readonly backupRepo: BackupRepository,
    private readonly licenseRepo: LicenseRepository,
  ) {
    this.baseStorageDir = process.env.VERCEL
      ? path.join('/tmp', 'omnipos_backups')
      : path.resolve(process.cwd(), 'storage', 'backups');

    try {
      if (!fs.existsSync(this.baseStorageDir)) {
        fs.mkdirSync(this.baseStorageDir, { recursive: true });
      }
    } catch (e: any) {
      this.logger.warn(`[BackupService] Local storage directory initialization skipped: ${e.message}`);
    }
  }

  private sanitizeFileName(name: string): string {
    return name.replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  private getLicenseFolder(licenseKey: string): string | null {
    try {
      const safeKey = this.sanitizeFileName(licenseKey.trim().toUpperCase());
      const folder = path.join(this.baseStorageDir, safeKey);
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
      }
      return folder;
    } catch (e: any) {
      this.logger.warn(`[BackupService] Could not create local folder (${licenseKey}): ${e.message}`);
      return null;
    }
  }

  /**
   * Save uploaded backup (.zip or .db) from POS terminal or Admin portal
   */
  async saveBackup(params: {
    licenseKey: string;
    file: Express.Multer.File;
    hwid?: string;
    deviceName?: string;
    backupType?: string;
    notes?: string;
    recordCount?: number;
  }): Promise<LicenseBackupRecord> {
    const { licenseKey, file, hwid, deviceName, backupType, notes, recordCount } = params;

    if (!licenseKey || !licenseKey.trim()) {
      throw new BadRequestException('License key is required.');
    }
    if (!file || !file.buffer) {
      throw new BadRequestException('Backup file payload is missing.');
    }

    const license = await this.licenseRepo.findByKey(licenseKey);
    if (!license) {
      throw new NotFoundException(`License key "${licenseKey}" does not exist.`);
    }
    if (!license.isEnabled) {
      throw new ForbiddenException(`License "${licenseKey}" is disabled.`);
    }

    const originalName = file.originalname || `Omnipos_Backup_${new Date().toISOString().replace(/[:.]/g, '-')}.zip`;
    const sanitizedName = this.sanitizeFileName(originalName);
    const diskFileName = `${Date.now()}_${sanitizedName}`;

    const isZip = originalName.toLowerCase().endsWith('.zip');
    const format = isZip ? 'zip' : 'db';

    // Attempt to write file to local disk or /tmp as cache, but NEVER crash if filesystem is read-only (e.g. Vercel)
    let destinationPath = `cloud://${license.key}/${diskFileName}`;
    try {
      const folder = this.getLicenseFolder(license.key);
      if (folder) {
        const localPath = path.join(folder, diskFileName);
        await fs.promises.writeFile(localPath, file.buffer);
        destinationPath = localPath;
      }
    } catch (fsErr: any) {
      this.logger.warn(`[BackupService] Local disk write skipped (${fsErr.message}). Backup persisted safely in PostgreSQL vault.`);
    }

    // Save record to DB (storing binary payload in Neon PostgreSQL bytea column)
    const record = await this.backupRepo.create({
      licenseId: license.id,
      licenseKey: license.key,
      fileName: diskFileName,
      originalName,
      filePath: destinationPath,
      fileData: file.buffer,
      fileSize: file.size || file.buffer.length,
      mimeType: file.mimetype || (isZip ? 'application/zip' : 'application/octet-stream'),
      format,
      deviceHwid: hwid,
      deviceName: deviceName || 'POS Terminal',
      backupType: backupType || 'auto',
      notes: notes || undefined,
      recordCount: recordCount ? Number(recordCount) : 0,
    });

    // Enforce retention policy (keep last 10 backups)
    await this.enforceRetention(license.id);

    this.logger.log(`[BackupService] Backup saved for ${license.key}: ${diskFileName} (${format.toUpperCase()}, ${file.size || file.buffer.length} bytes)`);
    return record;
  }

  /**
   * Enforce retention policy for a license
   */
  private async enforceRetention(licenseId: string) {
    try {
      const oldBackups = await this.backupRepo.getBackupsExceedingLimit(licenseId, this.maxRetainedBackups);
      for (const old of oldBackups) {
        if (old.filePath && fs.existsSync(old.filePath)) {
          try {
            await fs.promises.unlink(old.filePath);
          } catch (e: any) {
            this.logger.warn(`Failed to unlink old backup file: ${old.filePath}: ${e.message}`);
          }
        }
        await this.backupRepo.deleteById(old.id);
        this.logger.log(`[BackupService] Pruned old backup ${old.id} (${old.fileName})`);
      }
    } catch (err: any) {
      this.logger.error(`Error enforcing retention for license ${licenseId}: ${err.message}`);
    }
  }

  /**
   * Get all backups for a license (by ID or Key)
   */
  async getBackupsForLicense(identifier: string): Promise<LicenseBackupRecord[]> {
    let license = await this.licenseRepo.findById(identifier);
    if (!license) {
      license = await this.licenseRepo.findByKey(identifier);
    }
    if (!license) {
      throw new NotFoundException(`License not found for "${identifier}".`);
    }

    return await this.backupRepo.findByLicenseId(license.id);
  }

  /**
   * Get latest backup status for a license key
   */
  async getLatestBackup(licenseKey: string) {
    const license = await this.licenseRepo.findByKey(licenseKey);
    if (!license) {
      throw new NotFoundException(`License key not found.`);
    }

    const latest = await this.backupRepo.findLatestByLicenseKey(license.key);
    return {
      success: true,
      data: latest,
    };
  }

  /**
   * Get backup counts for all licenses
   */
  async getBackupCounts(): Promise<Record<string, number>> {
    return await this.backupRepo.getBackupCounts();
  }

  /**
   * Get single backup metadata and path for download
   */
  async getBackupFileForDownload(id: string): Promise<{
    record: LicenseBackupRecord;
    buffer?: Buffer;
    filePath?: string;
  }> {
    const record = await this.backupRepo.findByIdWithData(id);
    if (!record) {
      throw new NotFoundException('Backup file record not found.');
    }

    if (record.fileData && Buffer.isBuffer(record.fileData)) {
      return {
        record,
        buffer: record.fileData,
      };
    }

    if (record.filePath && fs.existsSync(record.filePath)) {
      return {
        record,
        filePath: record.filePath,
      };
    }

    throw new NotFoundException('Backup file content is missing from storage.');
  }

  /**
   * Delete backup
   */
  async deleteBackup(id: string): Promise<boolean> {
    const record = await this.backupRepo.findById(id);
    if (!record) {
      throw new NotFoundException('Backup not found.');
    }

    if (record.filePath && fs.existsSync(record.filePath)) {
      try {
        await fs.promises.unlink(record.filePath);
      } catch (err: any) {
        this.logger.warn(`Failed to remove file ${record.filePath}: ${err.message}`);
      }
    }

    return await this.backupRepo.deleteById(id);
  }

  /**
   * Global stats
   */
  async getGlobalStats() {
    return await this.backupRepo.getGlobalStats();
  }
}
