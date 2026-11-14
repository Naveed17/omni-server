import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  UtensilsCrossed, ShoppingCart, ChefHat, Tag, Package,
  BookOpen, Receipt, BarChart3, Globe, Settings,
} from 'lucide-react';
import { queryKeys } from './api';

/* ── Types ──────────────────────────────────────────────────────────────── */

export interface LicenseDevice { hwid: string; deviceName: string; activatedAt: string; }

export interface LicenseRecord {
  id: string;
  key: string;
  userName: string;
  whatsappNumber: string;
  isEnabled: boolean;
  maxDevices: number;
  licenseType: string;
  expiresAt: string | null;
  modules: Record<string, boolean>;
  businessProfiles?: string[];
  activeDevices: LicenseDevice[];
  createdAt?: string;
}

export interface LicenseBackup {
  id: string;
  licenseId: string;
  licenseKey: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  format: string;
  deviceHwid?: string;
  deviceName?: string;
  backupType: string;
  notes?: string;
  createdAt: string;
}

export type LicenseStatus = 'active' | 'suspended' | 'expired';

export function licenseStatus(l: Pick<LicenseRecord, 'isEnabled' | 'expiresAt'>, now = Date.now()): LicenseStatus {
  if (l.expiresAt && new Date(l.expiresAt).getTime() < now) return 'expired';
  return l.isEnabled ? 'active' : 'suspended';
}

/* ── Catalogues ─────────────────────────────────────────────────────────── */

export interface ModuleMeta {
  key: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const MODULES: ModuleMeta[] = [
  { key: 'fastfood', label: 'Fast Food POS', desc: 'Dine-in, takeaway, KDS', icon: UtensilsCrossed },
  { key: 'omnimart', label: 'Omnimart Retail', desc: 'Barcode & wholesale billing', icon: ShoppingCart },
  { key: 'kitchen', label: 'Kitchen KDS', desc: 'Chef order display tickets', icon: ChefHat },
  { key: 'catalog', label: 'Product Catalog', desc: 'Items, variants & categories', icon: Tag },
  { key: 'inventory', label: 'Stock Control', desc: 'In/out audit & low stock', icon: Package },
  { key: 'khata', label: 'Customer Khata', desc: 'Udhaar ledger & credit', icon: BookOpen },
  { key: 'expenses', label: 'Expense Tracker', desc: 'Daily outflows & cash drawer', icon: Receipt },
  { key: 'reports', label: 'Profit Analytics', desc: 'Gross margin, COGS & sales', icon: BarChart3 },
  { key: 'webStore', label: 'Online Web Store', desc: 'Public customer ordering', icon: Globe },
  { key: 'admin', label: 'Admin Settings', desc: 'Staff roles & print layout', icon: Settings },
];

export const DEFAULT_NEW_MODULES: Record<string, boolean> = {
  fastfood: true, omnimart: true, kitchen: true, catalog: true, inventory: true,
  khata: true, expenses: true, reports: true, webStore: false, admin: true,
};

export interface BusinessProfileMeta {
  key: string;
  label: string;
  shortTag: string;
  color: string;
}

export const BUSINESS_PROFILES: BusinessProfileMeta[] = [
  { key: 'standard', label: 'Standard Retail (General / Mart)', shortTag: 'General Retail', color: '#8b8ff5' },
  { key: 'grocery', label: 'Grocery, Supermarket & Mini Mart', shortTag: 'Grocery', color: '#10b981' },
  { key: 'food', label: 'Fast Food, Cafe & Restaurant', shortTag: 'Food & Restaurant', color: '#ef4444' },
  { key: 'bakery', label: 'Bakery & Sweets / Confectionery', shortTag: 'Bakery & Sweets', color: '#f59e0b' },
  { key: 'pharmacy', label: 'Pharmacy & Medical Store', shortTag: 'Pharmacy', color: '#0ea5e9' },
  { key: 'apparel', label: 'Garments, Clothing & Boutique', shortTag: 'Garments', color: '#8b5cf6' },
  { key: 'footwear', label: 'Footwear & Shoes Store', shortTag: 'Footwear', color: '#ec4899' },
  { key: 'cosmetics', label: 'Cosmetics & Beauty Store', shortTag: 'Cosmetics', color: '#d946ef' },
  { key: 'electronics', label: 'Mobile, Electronics & Accessories', shortTag: 'Electronics', color: '#3b82f6' },
  { key: 'hardware', label: 'Hardware, Sanitary & Paint Store', shortTag: 'Hardware', color: '#d97706' },
  { key: 'electric', label: 'Electrical Store & Lighting', shortTag: 'Electrical', color: '#eab308' },
];

export const PROFILE_BY_KEY = new Map(BUSINESS_PROFILES.map((p) => [p.key, p]));

export const PLANS = [
  { key: 'monthly', label: 'Monthly', days: 30 },
  { key: 'annual', label: 'Annual', days: 365 },
  { key: 'lifetime', label: 'Lifetime', days: null },
] as const;

export const PLAN_LABEL: Record<string, string> = Object.fromEntries(PLANS.map((p) => [p.key, p.label]));

/* ── Queries ────────────────────────────────────────────────────────────── */

export const licenseKeys = {
  all: ['licenses'] as const,
  backupCounts: ['backupCounts'] as const,
  backups: (id: string) => ['backups', id] as const,
  allBackups: ['backups', '__all'] as const,
};

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed (${res.status})`);
  }
  return res.json();
}

export function useLicenses() {
  return useQuery({
    queryKey: licenseKeys.all,
    queryFn: async () => (await json<{ data: LicenseRecord[] }>(await fetch('/api/admin/licenses'))).data || [],
  });
}

export function useBackupCounts() {
  return useQuery({
    queryKey: licenseKeys.backupCounts,
    queryFn: async () =>
      (await json<{ data: Record<string, number> }>(await fetch('/api/admin/backups/counts'))).data || {},
  });
}

export type StoreBackup = LicenseBackup & { storeName: string };

export function useAllBackups() {
  return useQuery({
    queryKey: licenseKeys.allBackups,
    queryFn: async () => (await json<{ data: StoreBackup[] }>(await fetch('/api/admin/backups'))).data || [],
  });
}

/** Delete any backup by license + id (used where there is no single license in scope). */
export function useDeleteBackup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ licenseId, backupId }: { licenseId: string; backupId: string }) =>
      json(await fetch(`/api/admin/licenses/${licenseId}/backups/${backupId}`, { method: 'DELETE' })),
    onSuccess: () => {
      toast.success('Backup deleted');
      qc.invalidateQueries({ queryKey: ['backups'] });
      qc.invalidateQueries({ queryKey: licenseKeys.backupCounts });
      qc.invalidateQueries({ queryKey: queryKeys.overview });
    },
    onError: (e: any) => toast.error(e?.message || 'Delete failed'),
  });
}

export const backupDownloadUrl = (licenseId: string, backupId: string) =>
  `/api/admin/licenses/${licenseId}/backups/${backupId}/download`;

export function useLicenseBackups(licenseId: string | undefined) {
  return useQuery({
    queryKey: licenseKeys.backups(licenseId || ''),
    enabled: !!licenseId,
    queryFn: async () =>
      (await json<{ data: LicenseBackup[] }>(await fetch(`/api/admin/licenses/${licenseId}/backups`))).data || [],
  });
}

/* ── Mutations ──────────────────────────────────────────────────────────── */

const post = (url: string, body?: unknown) =>
  fetch(url, {
    method: 'POST',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  }).then((r) => json<any>(r));

export function useLicenseActions() {
  const qc = useQueryClient();

  const refresh = () => {
    qc.invalidateQueries({ queryKey: licenseKeys.all });
    qc.invalidateQueries({ queryKey: queryKeys.overview });
  };

  /** Patch a license in the cache immediately; roll back on error. */
  const optimistic = (id: string, patch: Partial<LicenseRecord>) => {
    const prev = qc.getQueryData<LicenseRecord[]>(licenseKeys.all);
    qc.setQueryData<LicenseRecord[]>(licenseKeys.all, (list) => list?.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    return () => qc.setQueryData(licenseKeys.all, prev);
  };

  const run = async (fn: () => Promise<unknown>, ok: string, rollback?: () => void) => {
    try {
      await fn();
      toast.success(ok);
    } catch (e: any) {
      rollback?.();
      toast.error(e?.message || 'Something went wrong');
      throw e;
    } finally {
      refresh();
    }
  };

  return {
    toggleEnabled: (l: LicenseRecord) => {
      const undo = optimistic(l.id, { isEnabled: !l.isEnabled });
      return run(() => post(`/api/admin/licenses/${l.id}/toggle`), l.isEnabled ? `${l.userName} suspended` : `${l.userName} activated`, undo);
    },
    setModules: (l: LicenseRecord, modules: Record<string, boolean>, msg: string) => {
      const undo = optimistic(l.id, { modules });
      return run(() => post(`/api/admin/licenses/${l.id}/modules`, { modules }), msg, undo);
    },
    setProfiles: (l: LicenseRecord, businessProfiles: string[]) => {
      const undo = optimistic(l.id, { businessProfiles });
      return run(() => post(`/api/admin/licenses/${l.id}/profiles`, { businessProfiles }), 'Business profiles updated', undo);
    },
    unlinkDevice: (l: LicenseRecord, hwid: string) => {
      const undo = optimistic(l.id, { activeDevices: l.activeDevices.filter((d) => d.hwid !== hwid) });
      return run(
        () => fetch(`/api/admin/licenses/${l.id}/devices/${encodeURIComponent(hwid)}`, { method: 'DELETE' }).then((r) => json(r)),
        'Terminal unlinked',
        undo,
      );
    },
  };
}

export function useCreateLicense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      userName: string;
      whatsappNumber: string;
      maxDevices: number;
      licenseType: string;
      expiresAt: string | null;
      modules: Record<string, boolean>;
      businessProfiles: string[];
    }) => post('/api/admin/licenses', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: licenseKeys.all });
      qc.invalidateQueries({ queryKey: queryKeys.overview });
    },
  });
}

export function useBackupActions(licenseId: string) {
  const qc = useQueryClient();
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['backups'] });
    qc.invalidateQueries({ queryKey: licenseKeys.backupCounts });
    qc.invalidateQueries({ queryKey: queryKeys.overview });
  };

  const upload = useMutation({
    mutationFn: async ({ file, notes }: { file: File; notes: string }) => {
      const fd = new FormData();
      fd.append('file', file);
      if (notes.trim()) fd.append('notes', notes.trim());
      fd.append('deviceName', 'Admin Console');
      return json(await fetch(`/api/admin/licenses/${licenseId}/backups/upload`, { method: 'POST', body: fd }));
    },
    onSuccess: () => { toast.success('Backup uploaded'); refresh(); },
    onError: (e: any) => toast.error(e?.message || 'Upload failed'),
  });

  const remove = useMutation({
    mutationFn: async (backupId: string) =>
      json(await fetch(`/api/admin/licenses/${licenseId}/backups/${backupId}`, { method: 'DELETE' })),
    onSuccess: () => { toast.success('Backup deleted'); refresh(); },
    onError: (e: any) => toast.error(e?.message || 'Delete failed'),
  });

  const downloadUrl = (backupId: string) => backupDownloadUrl(licenseId, backupId);

  return { upload, remove, downloadUrl };
}
