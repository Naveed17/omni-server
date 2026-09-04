import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { LicenseRecord, LicenseDevice, mapLicenseRow } from './license.types';

@Injectable()
export class LicenseRepository {
  constructor(private readonly db: DatabaseService) {}

  async findByKey(key: string): Promise<LicenseRecord | null> {
    const normalizedKey = String(key || '').trim().toUpperCase();
    const res = await this.db.query('SELECT * FROM licenses WHERE UPPER(key) = $1', [normalizedKey]);
    if (!res.rows.length) return null;

    const devices = await this.getDevices(res.rows[0].id);
    return mapLicenseRow(res.rows[0], devices);
  }

  async findById(id: string): Promise<LicenseRecord | null> {
    const res = await this.db.query('SELECT * FROM licenses WHERE id = $1', [id]);
    if (!res.rows.length) return null;

    const devices = await this.getDevices(id);
    return mapLicenseRow(res.rows[0], devices);
  }

  async findAll(): Promise<LicenseRecord[]> {
    const res = await this.db.query('SELECT * FROM licenses ORDER BY created_at DESC');
    const allDevicesRes = await this.db.query('SELECT * FROM license_devices ORDER BY activated_at ASC');

    const devicesByLicense = new Map<string, LicenseDevice[]>();
    for (const d of allDevicesRes.rows) {
      const licId = d.license_id;
      if (!devicesByLicense.has(licId)) {
        devicesByLicense.set(licId, []);
      }
      devicesByLicense.get(licId)!.push({
        hwid: d.hwid,
        deviceName: d.device_name || 'Unknown PC',
        activatedAt: d.activated_at,
      });
    }

    return res.rows.map((row) => mapLicenseRow(row, devicesByLicense.get(row.id) || []));
  }

  async existsKey(key: string): Promise<boolean> {
    const normalizedKey = String(key || '').trim().toUpperCase();
    const res = await this.db.query('SELECT 1 FROM licenses WHERE UPPER(key) = $1 LIMIT 1', [normalizedKey]);
    return res.rows.length > 0;
  }

  async create(data: {
    id?: string;
    key: string;
    userName: string;
    whatsappNumber: string;
    isEnabled?: boolean;
    maxDevices?: number;
    licenseType?: string;
    expiresAt?: Date | string | null;
    modules: Record<string, boolean>;
    schemaId?: string | null;
    adminUsername?: string;
    adminPassword?: string;
    businessProfiles?: string[];
  }): Promise<LicenseRecord> {
    const id = data.id || `lic_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const res = await this.db.query(
      `INSERT INTO licenses (id, key, user_name, whatsapp_number, is_enabled, max_devices, license_type, expires_at, modules, schema_id, admin_username, admin_password, business_profiles)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        id,
        data.key.trim().toUpperCase(),
        data.userName,
        data.whatsappNumber,
        data.isEnabled !== false,
        data.maxDevices || 4,
        data.licenseType || 'annual',
        data.expiresAt ? new Date(data.expiresAt) : null,
        JSON.stringify(data.modules),
        data.schemaId || null,
        data.adminUsername || 'admin',
        data.adminPassword || '1234',
        JSON.stringify(data.businessProfiles || ['standard']),
      ]
    );

    return mapLicenseRow(res.rows[0], []);
  }

  async saveFlags(
    id: string,
    patch: {
      isEnabled?: boolean;
      maxDevices?: number;
      licenseType?: string;
      expiresAt?: Date | string | null;
      modules?: Record<string, boolean>;
      schemaId?: string | null;
      businessProfiles?: string[];
    }
  ): Promise<LicenseRecord | null> {
    const current = await this.findById(id);
    if (!current) return null;

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (patch.isEnabled !== undefined) {
      fields.push(`is_enabled = $${idx++}`);
      values.push(patch.isEnabled);
    }
    if (patch.maxDevices !== undefined) {
      fields.push(`max_devices = $${idx++}`);
      values.push(patch.maxDevices);
    }
    if (patch.licenseType !== undefined) {
      fields.push(`license_type = $${idx++}`);
      values.push(patch.licenseType);
    }
    if (patch.expiresAt !== undefined) {
      fields.push(`expires_at = $${idx++}`);
      values.push(patch.expiresAt ? new Date(patch.expiresAt) : null);
    }
    if (patch.modules !== undefined) {
      fields.push(`modules = $${idx++}`);
      values.push(JSON.stringify(patch.modules));
    }
    if (patch.schemaId !== undefined) {
      fields.push(`schema_id = $${idx++}`);
      values.push(patch.schemaId);
    }
    if (patch.businessProfiles !== undefined) {
      fields.push(`business_profiles = $${idx++}`);
      values.push(JSON.stringify(patch.businessProfiles));
    }

    if (fields.length === 0) return current;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `UPDATE licenses SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const res = await this.db.query(query, values);
    if (!res.rows.length) return null;

    const devices = await this.getDevices(id);
    return mapLicenseRow(res.rows[0], devices);
  }

  async addDevice(licenseId: string, hwid: string, deviceName: string): Promise<void> {
    const devId = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await this.db.query(
      `INSERT INTO license_devices (id, license_id, hwid, device_name, activated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (license_id, hwid)
       DO UPDATE SET device_name = EXCLUDED.device_name, activated_at = NOW()`,
      [devId, licenseId, hwid, deviceName || 'Unknown PC']
    );
  }

  async removeDevice(licenseId: string, hwid: string): Promise<boolean> {
    const res = await this.db.query(
      'DELETE FROM license_devices WHERE license_id = $1 AND hwid = $2',
      [licenseId, hwid]
    );
    return (res.rowCount ?? 0) > 0;
  }

  async getDevices(licenseId: string): Promise<LicenseDevice[]> {
    const res = await this.db.query(
      'SELECT * FROM license_devices WHERE license_id = $1 ORDER BY activated_at ASC',
      [licenseId]
    );
    return res.rows.map((row) => ({
      hwid: row.hwid,
      deviceName: row.device_name || 'Unknown PC',
      activatedAt: row.activated_at,
    }));
  }

  async getSupportSettings(): Promise<{ phone: string; email: string }> {
    try {
      const res = await this.db.query('SELECT support_phone, support_email FROM license_settings WHERE id = $1', ['default']);
      if (res.rows.length) {
        return {
          phone: res.rows[0].support_phone || '+92 300 0000000',
          email: res.rows[0].support_email || 'support@omnipos.pk',
        };
      }
    } catch {
      /* ignore */
    }
    return { phone: '+92 300 0000000', email: 'support@omnipos.pk' };
  }
}
