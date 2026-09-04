import { OmniposModuleFlags, normalizeModules } from '../common/modules';

export type LicenseType = 'monthly' | 'annual' | 'lifetime';

export interface LicenseDevice {
  hwid: string;
  deviceName: string;
  activatedAt: Date | string;
}

export interface LicenseRecord {
  id: string;
  key: string;
  userName: string;
  whatsappNumber: string;
  isEnabled: boolean;
  maxDevices: number;
  licenseType: LicenseType | string;
  expiresAt: Date | string | null;
  modules: OmniposModuleFlags;
  databaseMode: 'local' | 'online';
  schemaId: string | null;
  adminUsername?: string;
  adminPassword?: string;
  businessProfiles: string[];
  activeDevices: LicenseDevice[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export function mapLicenseRow(
  row: Record<string, any>,
  devices: LicenseDevice[] = [],
): LicenseRecord {
  const id = String(row.id);

  let businessProfiles: string[] = ['standard'];
  if (row.business_profiles || row.businessProfiles) {
    const raw = row.business_profiles || row.businessProfiles;
    if (Array.isArray(raw)) {
      businessProfiles = raw;
    } else if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) businessProfiles = parsed;
      } catch {
        businessProfiles = [raw];
      }
    }
  } else {
    const mods = normalizeModules(row.modules as Partial<OmniposModuleFlags>);
    if (mods.fastfood && !mods.omnimart) businessProfiles = ['food'];
    else if (!mods.fastfood && mods.omnimart) businessProfiles = ['standard'];
    else if (mods.fastfood && mods.omnimart) businessProfiles = ['standard', 'food'];
  }

  return {
    id,
    key: String(row.key),
    userName: String(row.userName || row.user_name || ''),
    whatsappNumber: String(row.whatsappNumber || row.whatsapp_number || ''),
    isEnabled: Boolean(row.isEnabled ?? row.is_enabled),
    maxDevices: Number(row.maxDevices ?? row.max_devices ?? 4),
    licenseType: String(row.licenseType || row.license_type || 'annual'),
    expiresAt: (row.expiresAt ?? row.expires_at) ? new Date(row.expiresAt ?? row.expires_at).toISOString() : null,
    modules: normalizeModules(row.modules as Partial<OmniposModuleFlags>),
    databaseMode: 'online',
    schemaId: row.schemaId || row.schema_id || null,
    adminUsername: String(row.adminUsername || row.admin_username || 'admin'),
    adminPassword: String(row.adminPassword || row.admin_password || '1234'),
    businessProfiles,
    activeDevices: devices,
    createdAt: row.createdAt ?? row.created_at,
    updatedAt: row.updatedAt ?? row.updated_at,
  };
}
