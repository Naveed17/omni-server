import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { LicenseBackupRecord, mapBackupRow } from './backup.types';

@Injectable()
export class BackupRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(data: {
    id?: string;
    licenseId: string;
    licenseKey: string;
    fileName: string;
    originalName: string;
    filePath?: string;
    fileData?: Buffer;
    fileSize: number;
    mimeType?: string;
    format?: string;
    deviceHwid?: string;
    deviceName?: string;
    backupType?: string;
    notes?: string;
    recordCount?: number;
  }): Promise<LicenseBackupRecord> {
    const id = data.id || `bk_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const lowerName = data.originalName.toLowerCase();
    const format = data.format || (lowerName.endsWith('.zip') ? 'zip' : 'db');

    const res = await this.db.query(
      `INSERT INTO license_backups (
        id, license_id, license_key, file_name, original_name,
        file_path, file_data, file_size, mime_type, format, device_hwid, device_name,
        backup_type, notes, record_count
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id, license_id, license_key, file_name, original_name, file_path, file_size, mime_type, format, device_hwid, device_name, backup_type, notes, record_count, created_at, updated_at`,
      [
        id,
        data.licenseId,
        data.licenseKey.trim().toUpperCase(),
        data.fileName,
        data.originalName,
        data.filePath || `cloud://${data.licenseKey}/${data.fileName}`,
        data.fileData || null,
        data.fileSize,
        data.mimeType || (format === 'zip' ? 'application/zip' : 'application/octet-stream'),
        format,
        data.deviceHwid || null,
        data.deviceName || 'POS Terminal',
        data.backupType || 'auto',
        data.notes || null,
        data.recordCount || 0,
      ],
    );

    return mapBackupRow(res.rows[0]);
  }

  async findByLicenseId(licenseId: string): Promise<LicenseBackupRecord[]> {
    const res = await this.db.query(
      `SELECT id, license_id, license_key, file_name, original_name, file_path, file_size, mime_type, format, device_hwid, device_name, backup_type, notes, record_count, created_at, updated_at
       FROM license_backups 
       WHERE license_id = $1 
       ORDER BY created_at DESC`,
      [licenseId],
    );
    return res.rows.map(mapBackupRow);
  }

  async findByLicenseKey(licenseKey: string): Promise<LicenseBackupRecord[]> {
    const normalized = licenseKey.trim().toUpperCase();
    const res = await this.db.query(
      `SELECT id, license_id, license_key, file_name, original_name, file_path, file_size, mime_type, format, device_hwid, device_name, backup_type, notes, record_count, created_at, updated_at
       FROM license_backups 
       WHERE UPPER(license_key) = $1 
       ORDER BY created_at DESC`,
      [normalized],
    );
    return res.rows.map(mapBackupRow);
  }

  async findById(id: string): Promise<LicenseBackupRecord | null> {
    const res = await this.db.query(
      `SELECT id, license_id, license_key, file_name, original_name, file_path, file_size, mime_type, format, device_hwid, device_name, backup_type, notes, record_count, created_at, updated_at
       FROM license_backups WHERE id = $1`,
      [id],
    );
    if (!res.rows.length) return null;
    return mapBackupRow(res.rows[0]);
  }

  async findByIdWithData(id: string): Promise<LicenseBackupRecord | null> {
    const res = await this.db.query('SELECT * FROM license_backups WHERE id = $1', [id]);
    if (!res.rows.length) return null;
    return mapBackupRow(res.rows[0]);
  }

  async findLatestByLicenseKey(licenseKey: string): Promise<LicenseBackupRecord | null> {
    const normalized = licenseKey.trim().toUpperCase();
    const res = await this.db.query(
      `SELECT id, license_id, license_key, file_name, original_name, file_path, file_size, mime_type, format, device_hwid, device_name, backup_type, notes, record_count, created_at, updated_at
       FROM license_backups 
       WHERE UPPER(license_key) = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [normalized],
    );
    if (!res.rows.length) return null;
    return mapBackupRow(res.rows[0]);
  }

  async deleteById(id: string): Promise<boolean> {
    const res = await this.db.query('DELETE FROM license_backups WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }

  async getBackupsExceedingLimit(licenseId: string, limit: number = 3): Promise<LicenseBackupRecord[]> {
    const res = await this.db.query(
      `SELECT * FROM license_backups 
       WHERE license_id = $1 
       ORDER BY created_at DESC 
       OFFSET $2`,
      [licenseId, limit],
    );
    return res.rows.map(mapBackupRow);
  }

  async getBackupCounts(): Promise<Record<string, number>> {
    const res = await this.db.query(
      `SELECT license_id, COUNT(*)::int as count 
       FROM license_backups 
       GROUP BY license_id`,
    );
    const map: Record<string, number> = {};
    for (const row of res.rows) {
      map[row.license_id] = Number(row.count || 0);
    }
    return map;
  }

  async getGlobalStats(): Promise<{ totalBackups: number; totalBytes: number; storesWithBackups: number }> {
    const res = await this.db.query(
      `SELECT 
        COUNT(*)::int as total_backups,
        COALESCE(SUM(file_size), 0)::bigint as total_bytes,
        COUNT(DISTINCT license_id)::int as stores_with_backups
       FROM license_backups`,
    );
    const row = res.rows[0];
    return {
      totalBackups: Number(row?.total_backups || 0),
      totalBytes: Number(row?.total_bytes || 0),
      storesWithBackups: Number(row?.stores_with_backups || 0),
    };
  }
}
