/** Shared contract for GET /api/admin/overview (used by the API and the admin UI). */

export type AttentionKind = 'expired' | 'expiring' | 'suspended' | 'capacity' | 'inactive' | 'no_backup';

export interface AttentionItem {
  licenseId: string;
  name: string;
  key: string;
  kind: AttentionKind;
  /** Short human detail, e.g. "in 5 days", "4/4 terminals". */
  detail: string;
  /** Lower = more urgent. */
  severity: number;
}

export type ActivityKind = 'license_created' | 'device_activated' | 'backup_uploaded';

export interface ActivityItem {
  kind: ActivityKind;
  licenseId: string;
  name: string;
  label: string;
  at: string;
}

export interface OverviewStore {
  id: string;
  name: string;
  key: string;
  isEnabled: boolean;
  licenseType: string;
  profiles: string[];
  devicesUsed: number;
  maxDevices: number;
  expiresAt: string | null;
  lastBackupAt: string | null;
  createdAt: string | null;
}

export interface OverviewData {
  generatedAt: string;
  licenses: {
    total: number;
    active: number;
    suspended: number;
    expired: number;
    expiringSoon: number;
    neverActivated: number;
  };
  terminals: { used: number; capacity: number };
  backups: { total: number; totalBytes: number; last7d: number; storesCovered: number };
  byType: Record<string, number>;
  byProfile: Record<string, number>;
  attention: AttentionItem[];
  activity: ActivityItem[];
  stores: OverviewStore[];
}

/** Days ahead that count as "expiring soon". */
export const EXPIRING_WINDOW_DAYS = 30;
/** A live store without a backup for this many days is flagged. */
export const BACKUP_STALE_DAYS = 7;
