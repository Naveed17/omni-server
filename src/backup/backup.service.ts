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
  private readonly maxRetainedBackups = 10;

  constructor(
    private readonly backupRepo: BackupRepository,
    private readonly licenseRepo: LicenseRepository,
  ) {
    this.baseStorageDir = path.resolve(process.cwd(), 'storage', 'backups');
    if (!fs.existsSync(this.baseStorageDir)) {
      fs.mkdirSync(this.baseStorageDir, { recursive: true });
    }
  }

  private sanitizeFileName(name: string): string {
    return name.replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  private getLicenseFolder(licenseKey: string): string {
    const safeKey = this.sanitizeFileName(licenseKey.trim().toUpperCase());
    const folder = path.join(this.baseStorageDir, safeKey);
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    return folder;
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

    const folder = this.getLicenseFolder(license.key);
    const originalName = file.originalname || `Omnipos_Backup_${new Date().toISOString().replace(/[:.]/g, '-')}.zip`;
    const sanitizedName = this.sanitizeFileName(originalName);
    const diskFileName = `${Date.now()}_${sanitizedName}`;
    const destinationPath = path.join(folder, diskFileName);

    const isZip = originalName.toLowerCase().endsWith('.zip');
    const format = isZip ? 'zip' : 'db';

    // Write file to disk
    await fs.promises.writeFile(destinationPath, file.buffer);

    // Save record to DB
    const record = await this.backupRepo.create({
      licenseId: license.id,
      licenseKey: license.key,
      fileName: diskFileName,
      originalName,
      filePath: destinationPath,
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

    this.logger.log(`[BackupService] Backup saved for ${license.key}: ${diskFileName} (${format.toUpperCase()}, ${file.size} bytes)`);
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
    filePath: string;
  }> {
    const record = await this.backupRepo.findById(id);
    if (!record) {
      throw new NotFoundException('Backup file record not found.');
    }

    if (!fs.existsSync(record.filePath)) {
      throw new NotFoundException('Backup file is missing from storage.');
    }

    return {
      record,
      filePath: record.filePath,
    };
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
