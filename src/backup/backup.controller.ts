import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Headers,
  Query,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { BackupService } from './backup.service';

@Controller('api/backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  /**
   * Health & info
   */
  @Get('health')
  health() {
    return { ok: true, service: 'omnipos-cloud-backup-engine' };
  }

  /**
   * Client POS uploads daily / manual backup (.zip or .db)
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    }),
  )
  async uploadBackup(
    @UploadedFile() file: Express.Multer.File,
    @Headers('x-license-key') headerKey?: string,
    @Body('key') bodyKey?: string,
    @Body('hwid') hwid?: string,
    @Body('deviceName') deviceName?: string,
    @Body('backupType') backupType?: string,
    @Body('notes') notes?: string,
    @Body('recordCount') recordCount?: number,
  ) {
    const key = (headerKey || bodyKey || '').trim().toUpperCase();
    if (!key) {
      throw new BadRequestException('License key is required (x-license-key header or body.key).');
    }
    if (!file) {
      throw new BadRequestException('File is required in multipart form data (field name: "file").');
    }

    const record = await this.backupService.saveBackup({
      licenseKey: key,
      file,
      hwid,
      deviceName,
      backupType: backupType || 'auto',
      notes,
      recordCount,
    });

    return {
      success: true,
      message: 'Backup securely vaulted in OmniPos Cloud',
      data: record,
    };
  }

  /**
   * Check latest backup for a license key
   */
  @Get('latest')
  async getLatest(
    @Headers('x-license-key') headerKey?: string,
    @Query('key') queryKey?: string,
  ) {
    const key = (headerKey || queryKey || '').trim().toUpperCase();
    if (!key) {
      throw new BadRequestException('License key is required.');
    }
    return await this.backupService.getLatestBackup(key);
  }

  /**
   * Download a backup by ID (e.g. for disaster recovery or machine replacement)
   */
  @Get(':id/download')
  async downloadBackup(@Param('id') id: string, @Res() res: Response) {
    const { record, buffer, filePath } = await this.backupService.getBackupFileForDownload(id);
    res.setHeader('Content-Type', record.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${record.originalName}"`);
    if (buffer) {
      return res.send(buffer);
    }
    if (filePath) {
      return res.download(filePath, record.originalName);
    }
  }
}
