import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { LicenseRepository } from './license.repository';
import { DatabaseService } from '../database/database.service';
import { normalizeModules, OmniposModuleFlags } from '../common/modules';
import { schemaIdForLicenseKey } from '../common/database-mode';
import { LicenseRecord } from './license.types';
import {
  ActivityItem,
  AttentionItem,
  BACKUP_STALE_DAYS,
  EXPIRING_WINDOW_DAYS,
  OverviewData,
  OverviewStore,
} from '../common/overview';

function generateKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segment = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `OMNI-${segment()}-${segment()}-${segment()}`;
}

@Injectable()
export class LicenseService {
  constructor(
    private readonly licenses: LicenseRepository,
    private readonly db: DatabaseService,
  ) {}

  async activate(body: { key?: string; hwid?: string; deviceName?: string }) {
    const { key, hwid, deviceName } = body;
    if (!key || !hwid) {
      return { status: 400 as const, body: { ok: false, error: 'key and hwid are required' } };
    }

    let license = await this.licenses.findByKey(key);
    if (!license) {
      return { status: 403 as const, body: { ok: false, error: 'License key not found.' } };
    }

    if (!license.isEnabled) {
      return { status: 403 as const, body: { ok: false, error: 'License invalid or disabled.' } };
    }

    if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
      await this.licenses.saveFlags(license.id, { isEnabled: false });
      return { status: 403 as const, body: { ok: false, error: 'License has expired.' } };
    }

    const isAlreadyActive = license.activeDevices.some((dev) => dev.hwid === hwid);
    if (!isAlreadyActive) {
      if (license.activeDevices.length >= license.maxDevices) {
        return { status: 400 as const, body: { ok: false, error: `Maximum devices limit (${license.maxDevices}) reached.` } };
      }
      await this.licenses.addDevice(license.id, hwid, deviceName || 'Unknown PC');
      license = (await this.licenses.findById(license.id))!;
    }

    const schemaId = license.schemaId || schemaIdForLicenseKey(license.key);
    if (!license.schemaId) {
      await this.licenses.saveFlags(license.id, { schemaId });
    }

    return {
      status: 200 as const,
      body: {
        ok: true,
        message: 'License active!',
        key: license.key,
        userName: license.userName,
        expiresAt: license.expiresAt ?? null,
        modules: normalizeModules(license.modules),
        databaseMode: 'online' as const,
        schemaId,
        businessProfiles: license.businessProfiles || ['standard'],
        adminUser: {
          username: license.adminUsername || 'admin',
          password: license.adminPassword || '1234',
          name: license.userName || 'Store Manager (Admin)',
          role: 'admin' as const,
        },
      },
    };
  }

  async validate(body: { key?: string; hwid?: string }) {
    const { key, hwid } = body;
    if (!key || !hwid) {
      return { status: 400 as const, body: { ok: false, error: 'key and hwid are required' } };
    }

    const invalid = (error: string, code?: 'not_found' | 'disabled' | 'expired' | 'device') => ({
      status: 200 as const,
      body: {
        ok: true,
        valid: false as const,
        error,
        code,
        expiresAt: null,
        modules: null,
      },
    });

    const found = await this.licenses.findByKey(key);
    if (!found) {
      return invalid('License key not found.', 'not_found');
    }

    if (!found.isEnabled) {
      return invalid('This license has been disabled. Contact OmniPos customer support.', 'disabled');
    }

    if (found.expiresAt && new Date(found.expiresAt) < new Date()) {
      await this.licenses.saveFlags(found.id, { isEnabled: false });
      return invalid('License has expired. Contact OmniPos customer support.', 'expired');
    }

    if (!found.activeDevices.some((dev) => dev.hwid === hwid)) {
      return invalid('This device is not activated for this license. Please activate.', 'device');
    }

    const schemaId = found.schemaId || schemaIdForLicenseKey(found.key);

    return {
      status: 200 as const,
      body: {
        ok: true,
        valid: true as const,
        key: found.key,
        userName: found.userName,
        expiresAt: found.expiresAt ?? null,
        modules: normalizeModules(found.modules),
        databaseMode: 'online' as const,
        schemaId,
        businessProfiles: found.businessProfiles || ['standard'],
        adminUser: {
          username: found.adminUsername || 'admin',
          password: found.adminPassword || '1234',
          name: found.userName || 'Store Manager (Admin)',
          role: 'admin' as const,
        },
      },
    };
  }

  async getModules(body: { key?: string }) {
    const { key } = body;
    if (!key) {
      return { status: 400 as const, body: { ok: false, error: 'key is required' } };
    }

    const found = await this.licenses.findByKey(key);
    if (!found) {
      return { status: 403 as const, body: { ok: false, error: 'License key not found.' } };
    }

    if (!found.isEnabled) {
      return { status: 403 as const, body: { ok: false, error: 'License invalid or disabled.' } };
    }

    if (found.expiresAt && new Date(found.expiresAt) < new Date()) {
      await this.licenses.saveFlags(found.id, { isEnabled: false });
      return {
        status: 200 as const,
        body: { ok: false, error: 'License has expired.', expiresAt: found.expiresAt },
      };
    }

    return {
      status: 200 as const,
      body: {
        ok: true,
        modules: normalizeModules(found.modules),
        businessProfiles: found.businessProfiles || ['standard'],
        expiresAt: found.expiresAt ?? null,
      },
    };
  }

  async getSupport() {
    const contact = await this.licenses.getSupportSettings();
    return {
      status: 200 as const,
      body: {
        ok: true,
        phone: contact.phone,
        email: contact.email,
      },
    };
  }

  // ── Admin Management ──────────────────────────────────────────────────────────

  async getAllLicenses(): Promise<LicenseRecord[]> {
    return await this.licenses.findAll();
  }

  async getOverviewStats(): Promise<{ success: true; data: OverviewData }> {
    const now = Date.now();
    const DAY = 86_400_000;
    const toIso = (v: unknown): string | null => {
      if (!v) return null;
      const d = new Date(v as string);
      return isNaN(d.getTime()) ? null : d.toISOString();
    };

    const [licenses, backupAggRes, backupTotalsRes, recentBackupsRes] = await Promise.all([
      this.licenses.findAll(),
      this.db.query(
        `SELECT license_id, MAX(created_at) AS last_at FROM license_backups GROUP BY license_id`,
      ),
      this.db.query(
        `SELECT COUNT(*)::int AS total,
                COALESCE(SUM(file_size), 0)::bigint AS bytes,
                COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days')::int AS last7d,
                COUNT(DISTINCT license_id)::int AS stores
         FROM license_backups`,
      ),
      this.db.query(
        `SELECT license_id, original_name, device_name, created_at
         FROM license_backups ORDER BY created_at DESC LIMIT 15`,
      ),
    ]);

    const lastBackup = new Map<string, string | null>();
    for (const row of backupAggRes.rows) lastBackup.set(String(row.license_id), toIso(row.last_at));
    const nameById = new Map(licenses.map((l) => [l.id, l.userName]));

    const counts = { total: licenses.length, active: 0, suspended: 0, expired: 0, expiringSoon: 0, neverActivated: 0 };
    const terminals = { used: 0, capacity: 0 };
    const byType: Record<string, number> = {};
    const byProfile: Record<string, number> = {};
    const attention: AttentionItem[] = [];
    const activity: ActivityItem[] = [];

    const stores: OverviewStore[] = licenses.map((l) => {
      const used = l.activeDevices?.length || 0;
      const expiresAt = toIso(l.expiresAt);
      const lastBackupAt = lastBackup.get(l.id) ?? null;
      const base = { licenseId: l.id, name: l.userName, key: l.key };

      terminals.used += used;
      terminals.capacity += l.maxDevices || 0;
      byType[l.licenseType || 'annual'] = (byType[l.licenseType || 'annual'] || 0) + 1;
      for (const p of l.businessProfiles || ['standard']) byProfile[p] = (byProfile[p] || 0) + 1;

      const msLeft = expiresAt ? new Date(expiresAt).getTime() - now : Infinity;
      const isExpired = msLeft < 0;

      if (isExpired) {
        counts.expired++;
        attention.push({ ...base, kind: 'expired', detail: `${Math.ceil(-msLeft / DAY)}d ago`, severity: 0 });
      } else if (!l.isEnabled) {
        counts.suspended++;
        attention.push({ ...base, kind: 'suspended', detail: 'Suspended', severity: 3 });
      } else {
        counts.active++;
        if (msLeft <= EXPIRING_WINDOW_DAYS * DAY) {
          counts.expiringSoon++;
          attention.push({ ...base, kind: 'expiring', detail: `in ${Math.max(1, Math.ceil(msLeft / DAY))}d`, severity: 1 });
        }
        if (used === 0) {
          attention.push({ ...base, kind: 'inactive', detail: 'No terminal activated', severity: 4 });
        } else {
          if (used >= (l.maxDevices || 1)) {
            attention.push({ ...base, kind: 'capacity', detail: `${used}/${l.maxDevices} terminals`, severity: 2 });
          }
          const backupAge = lastBackupAt ? now - new Date(lastBackupAt).getTime() : Infinity;
          if (backupAge > BACKUP_STALE_DAYS * DAY) {
            attention.push({
              ...base,
              kind: 'no_backup',
              detail: lastBackupAt ? `${Math.floor(backupAge / DAY)}d since backup` : 'Never backed up',
              severity: 2,
            });
          }
        }
      }
      if (used === 0) counts.neverActivated++;

      const createdAt = toIso(l.createdAt);
      if (createdAt) activity.push({ kind: 'license_created', licenseId: l.id, name: l.userName, label: 'License issued', at: createdAt });
      for (const d of l.activeDevices || []) {
        const at = toIso(d.activatedAt);
        if (at) activity.push({ kind: 'device_activated', licenseId: l.id, name: l.userName, label: d.deviceName || 'Terminal', at });
      }

      return {
        id: l.id,
        name: l.userName,
        key: l.key,
        isEnabled: l.isEnabled && !isExpired,
        licenseType: l.licenseType || 'annual',
        profiles: l.businessProfiles || ['standard'],
        devicesUsed: used,
        maxDevices: l.maxDevices || 0,
        expiresAt,
        lastBackupAt,
        createdAt,
      };
    });

    for (const row of recentBackupsRes.rows) {
      const at = toIso(row.created_at);
      const id = String(row.license_id);
      if (at) {
        activity.push({
          kind: 'backup_uploaded',
          licenseId: id,
          name: nameById.get(id) || 'Unknown store',
          label: row.device_name || row.original_name,
          at,
        });
      }
    }

    attention.sort((a, b) => a.severity - b.severity || a.name.localeCompare(b.name));
    activity.sort((a, b) => b.at.localeCompare(a.at));

    const t = backupTotalsRes.rows[0] || {};
    return {
      success: true,
      data: {
        generatedAt: new Date(now).toISOString(),
        licenses: counts,
        terminals,
        backups: {
          total: Number(t.total || 0),
          totalBytes: Number(t.bytes || 0),
          last7d: Number(t.last7d || 0),
          storesCovered: Number(t.stores || 0),
        },
        byType,
        byProfile,
        attention,
        activity: activity.slice(0, 15),
        stores,
      },
    };
  }

  async createLicense(body: {
    userName: string;
    whatsappNumber: string;
    maxDevices?: number;
    licenseType?: string;
    modules?: Partial<OmniposModuleFlags>;
    expiresAt?: string | null;
    adminUsername?: string;
    adminPassword?: string;
    businessProfiles?: string[];
  }) {
    if (!body.userName || !body.whatsappNumber) {
      throw new BadRequestException('userName and whatsappNumber are required');
    }

    let key = generateKey();
    while (await this.licenses.existsKey(key)) {
      key = generateKey();
    }

    const adminUsername = body.adminUsername?.trim() || 'admin';
    const adminPassword = body.adminPassword?.trim() || '1234';

    let profiles = body.businessProfiles;
    if (!profiles || !Array.isArray(profiles) || profiles.length === 0) {
      const norm = normalizeModules(body.modules);
      if (norm.fastfood && !norm.omnimart) profiles = ['food'];
      else if (!norm.fastfood && norm.omnimart) profiles = ['standard'];
      else profiles = ['standard', 'food'];
    }

    const license = await this.licenses.create({
      key,
      userName: body.userName,
      whatsappNumber: body.whatsappNumber,
      isEnabled: true,
      maxDevices: body.maxDevices || 4,
      licenseType: body.licenseType || 'annual',
      // lifetime never expires; otherwise honour an explicit date or default by plan length
      expiresAt:
        body.licenseType === 'lifetime'
          ? null
          : body.expiresAt
            ? new Date(body.expiresAt)
            : new Date(Date.now() + (body.licenseType === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000),
      modules: normalizeModules(body.modules),
      schemaId: schemaIdForLicenseKey(key),
      adminUsername,
      adminPassword,
      businessProfiles: profiles,
    });

    return { success: true, message: 'License created successfully with Admin credentials', data: license };
  }

  async toggleLicense(id: string) {
    const license = await this.licenses.findById(id);
    if (!license) throw new NotFoundException('License not found');

    const updated = await this.licenses.saveFlags(id, { isEnabled: !license.isEnabled });
    return {
      success: true,
      message: `License ${updated!.isEnabled ? 'enabled' : 'disabled'} successfully`,
      data: updated,
    };
  }

  async updateModules(id: string, modules?: Partial<OmniposModuleFlags>, businessProfiles?: string[]) {
    const license = await this.licenses.findById(id);
    if (!license) throw new NotFoundException('License not found');

    const patch: any = {};
    if (modules && typeof modules === 'object') {
      patch.modules = normalizeModules({ ...license.modules, ...modules });
    }
    if (businessProfiles && Array.isArray(businessProfiles)) {
      patch.businessProfiles = businessProfiles;
    }

    const updated = await this.licenses.saveFlags(id, patch);

    return {
      success: true,
      message: 'Modules and profiles updated successfully',
      data: updated,
    };
  }

  async updateProfiles(id: string, businessProfiles: string[]) {
    if (!businessProfiles || !Array.isArray(businessProfiles)) {
      throw new BadRequestException('businessProfiles array is required');
    }
    const license = await this.licenses.findById(id);
    if (!license) throw new NotFoundException('License not found');

    const updated = await this.licenses.saveFlags(id, { businessProfiles });
    return {
      success: true,
      message: 'Business profiles updated successfully',
      data: updated,
    };
  }

  async removeDevice(id: string, hwid: string) {
    if (!hwid) throw new BadRequestException('hwid is required');
    const license = await this.licenses.findById(id);
    if (!license) throw new NotFoundException('License not found');

    const removed = await this.licenses.removeDevice(id, hwid);
    if (!removed) throw new NotFoundException('Device not found on this license');

    const updated = await this.licenses.findById(id);
    return {
      success: true,
      message: 'Device unlinked successfully',
      data: updated,
    };
  }
}
