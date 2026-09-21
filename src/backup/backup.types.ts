export interface LicenseBackupRecord {
  id: string;
  licenseId: string;
  licenseKey: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  format: 'zip' | 'db' | string;
  deviceHwid?: string;
  deviceName?: string;
  backupType: 'auto' | 'manual' | 'eod_closing' | 'manual_admin' | string;
  notes?: string;
  recordCount?: number;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export function mapBackupRow(row: Record<string, any>): LicenseBackupRecord {
  const originalName = String(row.original_name || row.originalName || row.file_name || '');
  const lowerName = originalName.toLowerCase();
  const format = row.format || (lowerName.endsWith('.zip') ? 'zip' : 'db');

  return {
    id: String(row.id),
    licenseId: String(row.license_id || row.licenseId),
    licenseKey: String(row.license_key || row.licenseKey),
    fileName: String(row.file_name || row.fileName),
    originalName,
    filePath: String(row.file_path || row.filePath),
    fileSize: Number(row.file_size || row.fileSize || 0),
    mimeType: String(row.mime_type || row.mimeType || (format === 'zip' ? 'application/zip' : 'application/octet-stream')),
    format,
    deviceHwid: row.device_hwid || row.deviceHwid || undefined,
    deviceName: row.device_name || row.deviceName || 'POS Terminal',
    backupType: row.backup_type || row.backupType || 'auto',
    notes: row.notes || undefined,
    recordCount: Number(row.record_count || row.recordCount || 0),
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt,
  };
}
