import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { BackupService } from './backup.service';
import { LicenseRepository } from '../license/license.repository';

@Controller('api/admin')
export class AdminBackupController {
  constructor(
    private readonly backupService: BackupService,
    private readonly licenseRepo: LicenseRepository,
  ) {}

  /**
   * Global backup storage overview
   */
  @Get('backups/overview')
  async getOverview() {
    const stats = await this.backupService.getGlobalStats();
    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Get backup count map for all licenses { [licenseId]: count }
   */
  @Get('backups/counts')
  async getCounts() {
    const counts = await this.backupService.getBackupCounts();
    return {
      success: true,
      data: counts,
    };
  }

  /**
   * Get all backups for a specific license ID
   */
  @Get('licenses/:licenseId/backups')
  async getLicenseBackups(@Param('licenseId') licenseId: string) {
    const backups = await this.backupService.getBackupsForLicense(licenseId);
    return {
      success: true,
      count: backups.length,
      data: backups,
    };
  }

  /**
   * Admin manual backup upload for a specific license
   */
  @Post('licenses/:licenseId/backups/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 100 * 1024 * 1024 },
    }),
  )
  async uploadBackupForLicense(
    @Param('licenseId') licenseId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('notes') notes?: string,
    @Body('deviceName') deviceName?: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required.');
    }

    const license = await this.licenseRepo.findById(licenseId);
    if (!license) {
      throw new BadRequestException('License not found.');
    }

    const record = await this.backupService.saveBackup({
      licenseKey: license.key,
      file,
      deviceName: deviceName || 'Admin Console',
      backupType: 'manual_admin',
      notes: notes || 'Uploaded via Admin Dashboard',
    });

    return {
      success: true,
      message: 'Backup uploaded successfully by admin',
      data: record,
    };
  }

  /**
   * Admin download backup
   */
  @Get('licenses/:licenseId/backups/:backupId/download')
  async downloadBackup(
    @Param('licenseId') _licenseId: string,
    @Param('backupId') backupId: string,
    @Res() res: Response,
  ) {
    const { record, filePath } = await this.backupService.getBackupFileForDownload(backupId);
    res.setHeader('Content-Type', record.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${record.originalName}"`);
    return res.download(filePath, record.originalName);
  }

  /**
   * Admin delete backup
   */
  @Delete('licenses/:licenseId/backups/:backupId')
  async deleteBackup(
    @Param('licenseId') _licenseId: string,
    @Param('backupId') backupId: string,
  ) {
    await this.backupService.deleteBackup(backupId);
    return {
      success: true,
      message: 'Backup purged successfully from disk and cloud vault',
    };
  }
}
