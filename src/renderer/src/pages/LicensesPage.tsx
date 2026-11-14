import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/api';
import {
  KeyRound, Plus, Copy, Check, Power, Laptop, Trash2, Search,
  Phone, RefreshCw, Sliders, Sparkles, Cpu,
  UtensilsCrossed, ShoppingCart, ChefHat, Tag, Package,
  BookOpen, Receipt, BarChart3, Globe, Settings, X, Sun, Moon,
  Archive, Download, UploadCloud, HardDrive, FileArchive, Clock, FileText, AlertCircle, ShieldCheck, Database,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageShell, PageHeader } from '../components/ui';

/* ─── Types ─────────────────────────────────────────────────────────────────── */
interface LicenseDevice { hwid: string; deviceName: string; activatedAt: string; }
interface LicenseRecord {
  id: string; key: string; userName: string; whatsappNumber: string;
  isEnabled: boolean; maxDevices: number; licenseType: string;
  expiresAt: string | null; modules: Record<string, boolean>;
  businessProfiles?: string[];
  activeDevices: LicenseDevice[]; createdAt?: string;
}
export interface LicenseBackup {
  id: string;
  licenseId: string;
  licenseKey: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  format: 'zip' | 'db' | string;
  deviceHwid?: string;
  deviceName?: string;
  backupType: string;
  notes?: string;
  recordCount?: number;
  createdAt: string;
}
interface ModuleMeta {
  key: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: {
    activeBg: string;
    activeBorder: string;
    activeText: string;
    iconBg: string;
    iconText: string;
    pillBg: string;
  };
}

export interface BusinessProfileMeta {
  key: string;
  label: string;
  shortTag: string;
  desc: string;
  color: string;
  activeClasses: string;
  dotColor: string;
}

export const BUSINESS_PROFILES: BusinessProfileMeta[] = [
  {
    key: 'footwear',
    label: 'Footwear & Shoes Store',
    shortTag: 'Footwear & Shoes',
    desc: 'Sizes 38-45 matrix, pairs, colors & articles',
    color: '#ec4899',
    activeClasses: 'bg-pink-100/80 border-pink-300 text-pink-700 font-bold dark:bg-pink-500/20 dark:border-pink-500/40 dark:text-pink-200 shadow-[0_0_12px_rgba(236,72,153,0.25)]',
    dotColor: 'bg-pink-600 dark:bg-pink-400',
  },
  {
    key: 'apparel',
    label: 'Garments, Clothing & Boutique',
    shortTag: 'Garments & Boutique',
    desc: 'Garments & clothing with sizes XS-3XL & fabrics',
    color: '#8b5cf6',
    activeClasses: 'bg-violet-100/80 border-violet-300 text-violet-700 font-bold dark:bg-violet-500/20 dark:border-violet-500/40 dark:text-violet-200 shadow-[0_0_12px_rgba(139,92,246,0.25)]',
    dotColor: 'bg-violet-600 dark:bg-violet-400',
  },
  {
    key: 'grocery',
    label: 'Grocery, Supermarket & Mini Mart',
    shortTag: 'Grocery & Supermarket',
    desc: 'Weighed grains, loose items (KG/Grams) & FMCG',
    color: '#10b981',
    activeClasses: 'bg-emerald-100/80 border-emerald-300 text-emerald-800 font-bold dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
    dotColor: 'bg-emerald-600 dark:bg-emerald-400',
  },
  {
    key: 'cosmetics',
    label: 'Cosmetics & Beauty Store',
    shortTag: 'Cosmetics & Beauty',
    desc: 'Shades, lipstick/nail colors, volumes (50-250ml)',
    color: '#d946ef',
    activeClasses: 'bg-fuchsia-100/80 border-fuchsia-300 text-fuchsia-800 font-bold dark:bg-fuchsia-500/20 dark:border-fuchsia-500/40 dark:text-fuchsia-200 shadow-[0_0_12px_rgba(217,70,239,0.25)]',
    dotColor: 'bg-fuchsia-600 dark:bg-fuchsia-400',
  },
  {
    key: 'pharmacy',
    label: 'Pharmacy & Medical Store',
    shortTag: 'Pharmacy & Medical',
    desc: 'Medicines, strips, boxes, batches & expiry tracking',
    color: '#0284c7',
    activeClasses: 'bg-sky-100/80 border-sky-300 text-sky-800 font-bold dark:bg-sky-500/20 dark:border-sky-500/40 dark:text-sky-200 shadow-[0_0_12px_rgba(2,132,199,0.25)]',
    dotColor: 'bg-sky-600 dark:bg-sky-400',
  },
  {
    key: 'electronics',
    label: 'Mobile, Electronics & Accessories',
    shortTag: 'Mobile & Electronics',
    desc: 'Smartphones, unique IMEI/Serial numbers & warranty',
    color: '#3b82f6',
    activeClasses: 'bg-blue-100/80 border-blue-300 text-blue-800 font-bold dark:bg-blue-500/20 dark:border-blue-500/40 dark:text-blue-200 shadow-[0_0_12px_rgba(59,130,246,0.25)]',
    dotColor: 'bg-blue-600 dark:bg-blue-400',
  },
  {
    key: 'bakery',
    label: 'Bakery & Sweets / Confectionery',
    shortTag: 'Bakery & Sweets',
    desc: 'Fresh confectionery, sweets & weighed dabba boxes',
    color: '#f59e0b',
    activeClasses: 'bg-amber-100/80 border-amber-300 text-amber-900 font-bold dark:bg-amber-500/20 dark:border-amber-500/40 dark:text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
    dotColor: 'bg-amber-600 dark:bg-amber-400',
  },
  {
    key: 'food',
    label: 'Fast Food, Cafe & Restaurant',
    shortTag: 'Food & Restaurant',
    desc: 'Burgers, pizzas, portions & KDS kitchen dispatch',
    color: '#ef4444',
    activeClasses: 'bg-red-100/80 border-red-300 text-red-800 font-bold dark:bg-red-500/20 dark:border-red-500/40 dark:text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.25)]',
    dotColor: 'bg-red-600 dark:bg-red-400',
  },
  {
    key: 'hardware',
    label: 'Hardware, Sanitary & Paint Store',
    shortTag: 'Hardware & Sanitary',
    desc: 'Paints, distemper, plumbing pipes, sanitary & tools',
    color: '#d97706',
    activeClasses: 'bg-amber-100/80 border-amber-400/60 text-amber-950 font-bold dark:bg-yellow-600/20 dark:border-yellow-600/40 dark:text-yellow-200 shadow-[0_0_12px_rgba(217,119,6,0.25)]',
    dotColor: 'bg-amber-600 dark:bg-yellow-500',
  },
  {
    key: 'electric',
    label: 'Electrical Store & Lighting',
    shortTag: 'Electric & Lighting',
    desc: 'Cables, flexible wires, LED lights, switches & breakers',
    color: '#eab308',
    activeClasses: 'bg-yellow-100/90 border-yellow-400/60 text-yellow-950 font-bold dark:bg-yellow-500/20 dark:border-yellow-500/40 dark:text-yellow-100 shadow-[0_0_12px_rgba(234,179,8,0.25)]',
    dotColor: 'bg-yellow-600 dark:bg-yellow-400',
  },
  {
    key: 'standard',
    label: 'Standard Retail (General / Mart)',
    shortTag: 'General Retail',
    desc: 'General supermarket, packaged items & FMCG',
    color: '#6366f1',
    activeClasses: 'bg-indigo-100/80 border-indigo-300 text-indigo-800 font-bold dark:bg-indigo-500/20 dark:border-indigo-500/40 dark:text-indigo-200 shadow-[0_0_12px_rgba(99,102,241,0.25)]',
    dotColor: 'bg-indigo-600 dark:bg-indigo-400',
  },
];

/* ─── Modules with Vibrant Pastel Icon Blocks (Image 2 ShikshaQ Style) ────────── */
const MODULES: ModuleMeta[] = [
  {
    key: 'fastfood',
    label: 'Fast Food POS',
    desc: 'Dine-In, Takeaway, KDS',
    icon: UtensilsCrossed,
    accent: {
      activeBg: 'bg-white/[0.07]',
      activeBorder: 'border-white/15',
      activeText: 'text-white',
      iconBg: 'bg-blue-500/20',
      iconText: 'text-blue-400',
      pillBg: 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]',
    },
  },
  {
    key: 'omnimart',
    label: 'Omnimart Retail',
    desc: 'Barcode & wholesale billing',
    icon: ShoppingCart,
    accent: {
      activeBg: 'bg-white/[0.07]',
      activeBorder: 'border-white/15',
      activeText: 'text-white',
      iconBg: 'bg-emerald-500/20',
      iconText: 'text-emerald-400',
      pillBg: 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]',
    },
  },
  {
    key: 'kitchen',
    label: 'Kitchen KDS',
    desc: 'Chef order display tickets',
    icon: ChefHat,
    accent: {
      activeBg: 'bg-white/[0.07]',
      activeBorder: 'border-white/15',
      activeText: 'text-white',
      iconBg: 'bg-amber-500/20',
      iconText: 'text-amber-400',
      pillBg: 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]',
    },
  },
  {
    key: 'catalog',
    label: 'Product Catalog',
    desc: 'Items, variants & categories',
    icon: Tag,
    accent: {
      activeBg: 'bg-white/[0.07]',
      activeBorder: 'border-white/15',
      activeText: 'text-white',
      iconBg: 'bg-violet-500/20',
      iconText: 'text-violet-400',
      pillBg: 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]',
    },
  },
  {
    key: 'inventory',
    label: 'Stock Control',
    desc: 'In/Out audit & low stock',
    icon: Package,
    accent: {
      activeBg: 'bg-white/[0.07]',
      activeBorder: 'border-white/15',
      activeText: 'text-white',
      iconBg: 'bg-indigo-500/20',
      iconText: 'text-indigo-400',
      pillBg: 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]',
    },
  },
  {
    key: 'khata',
    label: 'Customer Khata',
    desc: 'Udhaar ledger & credit',
    icon: BookOpen,
    accent: {
      activeBg: 'bg-white/[0.07]',
      activeBorder: 'border-white/15',
      activeText: 'text-white',
      iconBg: 'bg-sky-500/20',
      iconText: 'text-sky-400',
      pillBg: 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]',
    },
  },
  {
    key: 'expenses',
    label: 'Expense Tracker',
    desc: 'Daily outflows & cash drawer',
    icon: Receipt,
    accent: {
      activeBg: 'bg-white/[0.07]',
      activeBorder: 'border-white/15',
      activeText: 'text-white',
      iconBg: 'bg-pink-500/20',
      iconText: 'text-pink-400',
      pillBg: 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]',
    },
  },
  {
    key: 'reports',
    label: 'Profit Analytics',
    desc: 'Gross margin, COGS & sales',
    icon: BarChart3,
    accent: {
      activeBg: 'bg-white/[0.07]',
      activeBorder: 'border-white/15',
      activeText: 'text-white',
      iconBg: 'bg-teal-500/20',
      iconText: 'text-teal-400',
      pillBg: 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]',
    },
  },
  {
    key: 'webStore',
    label: 'Online Web Store',
    desc: 'Public customer ordering',
    icon: Globe,
    accent: {
      activeBg: 'bg-white/[0.07]',
      activeBorder: 'border-white/15',
      activeText: 'text-white',
      iconBg: 'bg-purple-500/20',
      iconText: 'text-purple-400',
      pillBg: 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]',
    },
  },
  {
    key: 'admin',
    label: 'Admin Settings',
    desc: 'Staff roles & print layout',
    icon: Settings,
    accent: {
      activeBg: 'bg-white/[0.07]',
      activeBorder: 'border-white/15',
      activeText: 'text-white',
      iconBg: 'bg-slate-500/20',
      iconText: 'text-slate-300',
      pillBg: 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]',
    },
  },
];

function LicenseCardSkeleton() {
  return (
    <div className="panel p-5 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <span className="skeleton w-10 h-10 rounded-[10px]" />
          <div className="space-y-2">
            <span className="skeleton block w-40 h-3.5" />
            <span className="skeleton block w-56 h-2.5" />
          </div>
        </div>
        <div className="flex gap-2">
          <span className="skeleton w-44 h-8" />
          <span className="skeleton w-24 h-8" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
        <span className="skeleton h-40 rounded-[10px]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <span key={i} className="skeleton h-14 rounded-[10px]" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LicensesPage() {
  const [params, setParams] = useSearchParams();
  const qc = useQueryClient();

  const [licenses, setLicenses]         = useState<LicenseRecord[]>([]);
  const [loading, setLoading]           = useState(true);
  const [copied, setCopied]             = useState<string | null>(null);
  const [search, setSearch]             = useState(() => params.get('q') || '');
  const [filter, setFilter]             = useState<'all' | 'active' | 'disabled'>('all');
  const [showCreate, setCreate]         = useState(() => params.get('new') === '1');

  // Deep links from the top bar / command palette: ?q=<key> and ?new=1
  useEffect(() => {
    const q = params.get('q');
    const isNew = params.get('new') === '1';
    if (q !== null) setSearch(q);
    if (isNew) setCreate(true);
    if (q !== null || isNew) setParams({}, { replace: true });
  }, [params, setParams]);
  const [newName, setNewName]           = useState('');
  const [newPhone, setNewPhone]         = useState('');
  const [newMax, setNewMax]             = useState(4);
  const [saving, setSaving]             = useState(false);
  const [selProfiles, setSelProfiles]   = useState<string[]>(['standard']);
  const [selMods, setSelMods]           = useState<Record<string, boolean>>({
    fastfood: true, omnimart: true, kitchen: true, catalog: true, inventory: true,
    khata: true, expenses: true, reports: true, webStore: false, admin: true,
  });

  // ── Cloud Backups State ──
  const [backupCounts, setBackupCounts]             = useState<Record<string, number>>({});
  const [selectedBackupLic, setSelectedBackupLic]   = useState<LicenseRecord | null>(null);
  const [backupsList, setBackupsList]               = useState<LicenseBackup[]>([]);
  const [loadingBackups, setLoadingBackups]         = useState(false);
  const [uploadingBackup, setUploadingBackup]       = useState(false);
  const [uploadNotes, setUploadNotes]               = useState('');
  const [backupFile, setBackupFile]                 = useState<File | null>(null);

  const loadBackupCounts = async () => {
    try {
      const res = await fetch('/api/admin/backups/counts');
      if (res.ok) {
        const j = await res.json();
        setBackupCounts(j.data || {});
      }
    } catch {
      /* ignore */
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      const [r] = await Promise.all([
        fetch('/api/admin/licenses'),
        loadBackupCounts(),
      ]);
      if (r.ok) {
        const j = await r.json();
        setLicenses(j.data || []);
        qc.invalidateQueries({ queryKey: queryKeys.overview });
      }
    } catch {
      toast.error('Failed to load licenses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openBackupsDrawer = async (lic: LicenseRecord) => {
    setSelectedBackupLic(lic);
    setBackupFile(null);
    setUploadNotes('');
    setLoadingBackups(true);
    try {
      const res = await fetch(`/api/admin/licenses/${lic.id}/backups`);
      if (res.ok) {
        const j = await res.json();
        setBackupsList(j.data || []);
      } else {
        toast.error('Failed to load backups for this store.');
      }
    } catch {
      toast.error('Network error loading backups.');
    } finally {
      setLoadingBackups(false);
    }
  };

  const downloadBackup = (backup: LicenseBackup) => {
    const url = `/api/admin/licenses/${backup.licenseId}/backups/${backup.id}/download`;
    const a = document.createElement('a');
    a.href = url;
    a.download = backup.originalName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Downloading ${backup.originalName}`);
  };

  const deleteBackup = async (backupId: string, name: string) => {
    if (!confirm(`Permanently delete backup "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/licenses/${selectedBackupLic?.id}/backups/${backupId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Backup deleted successfully.');
        if (selectedBackupLic) {
          setBackupsList((prev) => prev.filter((b) => b.id !== backupId));
          setBackupCounts((prev) => ({
            ...prev,
            [selectedBackupLic.id]: Math.max(0, (prev[selectedBackupLic.id] || 1) - 1),
          }));
        }
      } else {
        toast.error('Failed to delete backup.');
      }
    } catch {
      toast.error('Network error deleting backup.');
    }
  };

  const handleUploadBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!backupFile || !selectedBackupLic) {
      toast.error('Please select an Omnipos backup file (.zip or .db)');
      return;
    }
    try {
      setUploadingBackup(true);
      const formData = new FormData();
      formData.append('file', backupFile);
      if (uploadNotes.trim()) formData.append('notes', uploadNotes.trim());
      formData.append('deviceName', 'Admin Console');

      const res = await fetch(`/api/admin/licenses/${selectedBackupLic.id}/backups/upload`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        toast.success('Backup uploaded successfully!');
        setBackupFile(null);
        setUploadNotes('');
        const updatedRes = await fetch(`/api/admin/licenses/${selectedBackupLic.id}/backups`);
        if (updatedRes.ok) {
          const d = await updatedRes.json();
          setBackupsList(d.data || []);
        }
        setBackupCounts((prev) => ({
          ...prev,
          [selectedBackupLic.id]: (prev[selectedBackupLic.id] || 0) + 1,
        }));
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || 'Upload failed.');
      }
    } catch {
      toast.error('Network error during upload.');
    } finally {
      setUploadingBackup(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      setSaving(true);
      const r = await fetch('/api/admin/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: newName.trim(),
          whatsappNumber: newPhone.trim() || '+92 300 0000000',
          maxDevices: newMax,
          modules: selMods,
          businessProfiles: selProfiles.length > 0 ? selProfiles : ['standard'],
        }),
      });
      if (r.ok) {
        toast.success(`License issued for "${newName}"`);
        setNewName('');
        setNewPhone('');
        setSelProfiles(['standard']);
        setCreate(false);
        await load();
      } else {
        toast.error('Failed to generate license.');
      }
    } catch {
      toast.error('Server error.');
    } finally {
      setSaving(false);
    }
  };

  const toggleProfile = async (lic: LicenseRecord, profileKey: string) => {
    const current = lic.businessProfiles || ['standard'];
    const next = current.includes(profileKey)
      ? current.filter((k) => k !== profileKey)
      : [...current, profileKey];
    if (next.length === 0) {
      toast.error('At least one business profile must remain active.');
      return;
    }
    setLicenses((p) => p.map((l) => (l.id === lic.id ? { ...l, businessProfiles: next } : l)));
    try {
      const r = await fetch(`/api/admin/licenses/${lic.id}/profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessProfiles: next }),
      });
      if (r.ok) {
        toast.success(`Business profiles updated for ${lic.userName}`);
      } else {
        toast.error('Failed to update business profiles');
      }
    } catch {
      toast.error('Network error');
    }
  };

  const toggleLic = async (id: string, cur: boolean, name: string) => {
    const r = await fetch(`/api/admin/licenses/${id}/toggle`, { method: 'POST' });
    if (r.ok) {
      toast(cur ? `"${name}" suspended` : `"${name}" activated`);
      await load();
    }
  };

  const toggleMod = async (lic: LicenseRecord, key: string) => {
    const next = { ...lic.modules, [key]: !lic.modules[key] };
    setLicenses((p) => p.map((l) => (l.id === lic.id ? { ...l, modules: next } : l)));
    try {
      const r = await fetch(`/api/admin/licenses/${lic.id}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modules: next }),
      });
      if (r.ok) {
        toast.success(`${key.toUpperCase()} ${next[key] ? 'enabled' : 'disabled'}`, { duration: 1500 });
        await load();
      }
    } catch {
      await load();
    }
  };

  const bulkMod = async (lic: LicenseRecord, on: boolean) => {
    const next: Record<string, boolean> = {};
    MODULES.forEach((m) => { next[m.key] = on; });
    const r = await fetch(`/api/admin/licenses/${lic.id}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modules: next }),
    });
    if (r.ok) {
      toast.success(`All modules ${on ? 'enabled' : 'disabled'}`);
      await load();
    }
  };

  const removeDevice = async (lid: string, hwid: string, n: string) => {
    if (!confirm(`Unlink machine "${n || hwid}"?`)) return;
    const r = await fetch(`/api/admin/licenses/${lid}/devices/${encodeURIComponent(hwid)}`, { method: 'DELETE' });
    if (r.ok) {
      toast.success('Machine unlinked.');
      await load();
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(key);
    toast.success('Key copied!');
    setTimeout(() => setCopied(null), 2500);
  };

  const shown = useMemo(() => licenses.filter((l) => {
    const q = search.toLowerCase();
    const m = l.userName.toLowerCase().includes(q) || l.key.toLowerCase().includes(q) || (l.whatsappNumber || '').includes(search);
    if (!m) return false;
    if (filter === 'active') return l.isEnabled;
    if (filter === 'disabled') return !l.isEnabled;
    return true;
  }), [licenses, search, filter]);

  const activeN = useMemo(() => licenses.filter((l) => l.isEnabled).length, [licenses]);

  /* ── Render ────────────────────────────────────────────────────────────── */
  return (
    <PageShell>
      <PageHeader
        index="02"
        section="Licenses"
        title="Client licenses"
        subtitle="Remote module authority, client management and HWID terminal locking."
        actions={
          <>
            <button type="button" onClick={load} disabled={loading} className="btn">
              <RefreshCw className={`w-3.5 h-3.5 text-muted ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Syncing' : 'Refresh'}
            </button>
            <button type="button" onClick={() => setCreate((p) => !p)} className="btn btn-primary">
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Issue license
            </button>
          </>
        }
      />

      {/* ── Create license ─────────────────────────────────────────────── */}
      {showCreate && (
        <div className="panel ticks rise p-5 sm:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-accent-ink" />
              <span className="text-[14px] font-medium text-fg tracking-tight">Issue a new license key</span>
            </div>
            <button type="button" onClick={() => setCreate(false)} className="btn btn-sm btn-icon btn-ghost" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={create} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="block">
                <span className="eyebrow block mb-2">Store / client name *</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Madina Cafe"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="input"
                />
              </label>
              <label className="block">
                <span className="eyebrow block mb-2">WhatsApp contact</span>
                <input
                  type="text"
                  placeholder="+92 300 1234567"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="input"
                />
              </label>
              <label className="block">
                <span className="eyebrow block mb-2">Max terminals</span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={newMax}
                  onChange={(e) => setNewMax(parseInt(e.target.value, 10) || 1)}
                  className="input num"
                />
              </label>
            </div>

            <div>
              <span className="eyebrow block mb-2.5">Initial modules</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {MODULES.map((m) => {
                  const on = selMods[m.key];
                  const Ic = m.icon;
                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setSelMods((p) => ({ ...p, [m.key]: !p[m.key] }))}
                      aria-pressed={on}
                      className={`flex items-center gap-2.5 h-10 px-3 rounded-[9px] text-[12.5px] cursor-pointer text-left transition-colors border ${
                        on
                          ? 'bg-surface-2 border-line-strong text-fg'
                          : 'bg-transparent border-line text-faint hover:text-muted'
                      }`}
                    >
                      <Ic className={`w-3.5 h-3.5 shrink-0 ${on ? 'text-accent-ink' : ''}`} />
                      <span className="truncate">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-baseline gap-3 mb-2.5 flex-wrap">
                <span className="eyebrow">Business profiles</span>
                <span className="text-[11.5px] text-faint">One profile locks categories · several give options</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {BUSINESS_PROFILES.map((bp) => {
                  const on = selProfiles.includes(bp.key);
                  return (
                    <button
                      key={bp.key}
                      type="button"
                      aria-pressed={on}
                      onClick={() => {
                        setSelProfiles((prev) =>
                          prev.includes(bp.key)
                            ? (prev.length > 1 ? prev.filter((k) => k !== bp.key) : prev)
                            : [...prev, bp.key]
                        );
                      }}
                      className={`flex flex-col gap-1 p-3 rounded-[9px] cursor-pointer text-left transition-colors border ${
                        on ? 'bg-surface-2 border-line-strong' : 'bg-transparent border-line hover:border-line-strong'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-[12.5px] font-medium text-fg">
                        <span className="dot" style={{ color: on ? bp.color : 'var(--faint)' }} />
                        {bp.shortTag}
                      </span>
                      <span className="text-[11px] text-faint truncate">{bp.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-5 border-t border-line">
              <button type="button" onClick={() => setCreate(false)} className="btn btn-ghost">
                Cancel
              </button>
              <button type="submit" disabled={saving || !newName.trim()} className="btn btn-primary">
                {saving ? 'Issuing…' : 'Confirm & issue key'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── HUD: stats + search + filter ───────────────────────────────── */}
      <div className="panel rise p-4 sm:p-5 flex items-center justify-between flex-wrap gap-5" style={{ animationDelay: '60ms' }}>
        <div className="flex items-center gap-6 sm:gap-8">
          {[
            { label: 'Total', value: licenses.length, cls: 'text-fg' },
            { label: 'Active', value: activeN, cls: 'text-ok' },
            { label: 'Suspended', value: licenses.length - activeN, cls: 'text-bad' },
          ].map((s, i) => (
            <div key={s.label} className="flex items-center gap-6 sm:gap-8">
              {i > 0 && <span className="w-px h-8 bg-line" />}
              <div>
                <p className={`num text-[26px] font-medium leading-none m-0 ${s.cls}`}>
                  {loading ? <span className="skeleton inline-block w-8 h-6 align-middle" /> : s.value}
                </p>
                <p className="eyebrow mt-2 m-0 text-faint">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-faint pointer-events-none" />
            <input
              type="text"
              placeholder="Search name or key…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9 sm:w-64"
            />
          </div>

          <div className="flex p-[3px] rounded-[10px] bg-surface-2 border border-line" role="group" aria-label="Filter">
            {(['all', 'active', 'disabled'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`h-7 px-3 rounded-[7px] text-[12px] cursor-pointer capitalize transition-colors border-0 ${
                  filter === f
                    ? 'bg-surface-3 text-fg shadow-[0_0_0_1px_var(--line-strong)]'
                    : 'bg-transparent text-faint hover:text-muted'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── License cards ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <>
            <LicenseCardSkeleton />
            <LicenseCardSkeleton />
          </>
        ) : shown.length === 0 ? (
          <div className="panel py-16 text-center">
            <p className="text-[13px] text-fg m-0">No licenses match</p>
            <p className="text-[12px] text-muted mt-1 m-0">Try a different search term or filter.</p>
          </div>
        ) : shown.map((lic, idx) => {
          const used = lic.activeDevices?.length || 0;
          const ratio = used / (lic.maxDevices || 1);
          const enCount = MODULES.filter((m) => lic.modules?.[m.key] === true).length;
          const initials = lic.userName.slice(0, 2).toUpperCase();
          const profiles = lic.businessProfiles || ['standard'];

          return (
            <article
              key={lic.id}
              className={`panel ticks rise overflow-hidden ${lic.isEnabled ? '' : 'opacity-80'}`}
              style={{ animationDelay: `${Math.min(idx, 6) * 50 + 100}ms` }}
            >
              {/* Status rail */}
              <span
                className={`absolute left-0 top-5 bottom-5 w-[2px] rounded-r-full ${lic.isEnabled ? 'bg-accent' : 'bg-bad'}`}
                aria-hidden
              />

              {/* Header */}
              <div className="px-5 sm:px-6 py-5 border-b border-line flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-[10px] bg-surface-3 border border-line flex items-center justify-center font-mono text-[12px] font-medium text-fg shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-[16px] font-medium text-fg m-0 tracking-tight truncate">{lic.userName}</h2>
                      <span className={`chip ${lic.isEnabled ? 'chip-ok' : 'chip-bad'}`}>
                        <span className={`dot ${lic.isEnabled ? 'dot-live' : ''}`} />
                        {lic.isEnabled ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-[12px] text-muted flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-faint" /> {lic.whatsappNumber || 'No phone'}
                      </span>
                      <span className="text-faint">·</span>
                      <span className="font-mono text-[11.5px]">
                        <span className="text-fg">{enCount}</span>/{MODULES.length} modules
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-2 h-[34px] pl-3 pr-1 rounded-[9px] bg-surface-2 border border-line">
                    <KeyRound className="w-3.5 h-3.5 text-faint shrink-0" />
                    <span className="font-mono text-[12px] text-fg tracking-wider">{lic.key}</span>
                    <button
                      type="button"
                      onClick={() => copyKey(lic.key)}
                      className="btn btn-sm btn-icon btn-ghost w-7 h-7"
                      title="Copy key"
                      aria-label="Copy license key"
                    >
                      {copied === lic.key ? <Check className="w-3.5 h-3.5 text-ok" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <button type="button" onClick={() => openBackupsDrawer(lic)} className="btn" title="Cloud backups">
                    <Archive className="w-3.5 h-3.5 text-muted" />
                    Backups
                    <span className="num text-[11px] text-muted bg-surface-3 border border-line rounded-[5px] px-1.5 leading-[18px]">
                      {backupCounts[lic.id] || 0}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleLic(lic.id, lic.isEnabled, lic.userName)}
                    className={`btn ${lic.isEnabled ? 'btn-danger' : 'btn-primary'}`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {lic.isEnabled ? 'Suspend' : 'Activate'}
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
                {/* Terminals */}
                <div className="well p-4 space-y-4 self-start">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[12.5px] font-medium text-fg">
                      <Cpu className="w-3.5 h-3.5 text-accent-ink" /> Terminals
                    </span>
                    <span className={`num text-[12px] ${ratio >= 1 ? 'text-bad' : 'text-muted'}`}>
                      {used}<span className="text-faint">/{lic.maxDevices}</span>
                    </span>
                  </div>

                  {/* Segmented capacity meter */}
                  <div className="flex gap-1" aria-label={`${used} of ${lic.maxDevices} terminals used`}>
                    {Array.from({ length: Math.min(lic.maxDevices || 1, 20) }).map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${
                          i < used ? (ratio >= 1 ? 'bg-bad' : 'bg-accent') : 'bg-surface-3'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    {!lic.activeDevices?.length ? (
                      <div className="py-4 text-center rounded-[8px] border border-dashed border-line text-[12px] text-faint">
                        No machines linked yet
                      </div>
                    ) : lic.activeDevices.map((dev) => (
                      <div
                        key={dev.hwid}
                        className="group flex items-center justify-between gap-2 px-2.5 py-2 rounded-[8px] bg-surface border border-line"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Laptop className="w-3.5 h-3.5 text-faint shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[12px] font-medium text-fg m-0 truncate">{dev.deviceName || 'Cashier PC'}</p>
                            <p className="font-mono text-[10.5px] text-faint m-0 truncate">{dev.hwid.slice(0, 16)}…</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDevice(lic.id, dev.hwid, dev.deviceName)}
                          className="btn btn-sm btn-icon btn-ghost btn-danger w-7 h-7 opacity-50 group-hover:opacity-100"
                          title="Unlink machine"
                          aria-label="Unlink machine"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6 min-w-0">
                  {/* Business profiles */}
                  <div>
                    <div className="flex items-baseline justify-between gap-3 mb-3 flex-wrap">
                      <span className="eyebrow flex items-center gap-2">
                        <Tag className="w-3 h-3" /> Business profiles
                      </span>
                      <span className="text-[11.5px] text-faint">
                        {profiles.length === 1 ? 'Single · locked in category' : 'Multi · filtered in category'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {BUSINESS_PROFILES.map((bp) => {
                        const active = profiles.includes(bp.key);
                        return (
                          <button
                            key={bp.key}
                            type="button"
                            onClick={() => toggleProfile(lic, bp.key)}
                            aria-pressed={active}
                            className={`flex items-center gap-2 h-7 px-2.5 rounded-[7px] text-[12px] cursor-pointer transition-colors border ${
                              active
                                ? 'bg-surface-3 border-line-strong text-fg'
                                : 'bg-transparent border-line text-faint hover:text-muted hover:border-line-strong'
                            }`}
                          >
                            <span className="dot" style={{ color: active ? bp.color : 'var(--faint)' }} />
                            {bp.shortTag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Module switchboard */}
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                      <span className="eyebrow flex items-center gap-2">
                        <Sliders className="w-3 h-3" /> Module switchboard
                      </span>
                      <div className="flex gap-1">
                        <button type="button" onClick={() => bulkMod(lic, true)} className="btn btn-sm btn-ghost">
                          Enable all
                        </button>
                        <button type="button" onClick={() => bulkMod(lic, false)} className="btn btn-sm btn-ghost">
                          Disable all
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                      {MODULES.map((m) => {
                        const on = lic.modules?.[m.key] === true;
                        const Ic = m.icon;
                        return (
                          <button
                            key={m.key}
                            type="button"
                            role="switch"
                            aria-checked={on}
                            onClick={() => toggleMod(lic, m.key)}
                            className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-[10px] cursor-pointer select-none text-left transition-colors border ${
                              on
                                ? 'bg-surface-2 border-line-strong'
                                : 'bg-transparent border-line hover:border-line-strong'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Ic className={`w-4 h-4 shrink-0 transition-colors ${on ? 'text-accent-ink' : 'text-faint'}`} />
                              <div className="min-w-0">
                                <p className={`text-[12.5px] font-medium m-0 truncate ${on ? 'text-fg' : 'text-muted'}`}>
                                  {m.label}
                                </p>
                                <p className="text-[11px] text-faint m-0 truncate">{m.desc}</p>
                              </div>
                            </div>
                            <span className="switch" data-on={on} aria-hidden />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* ── Cloud backups vault ────────────────────────────────────────── */}
      {selectedBackupLic && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedBackupLic(null); }}
        >
          <div className="panel rise w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]" role="dialog" aria-modal="true" aria-label="Cloud backups">
            {/* Header */}
            <div className="px-5 sm:px-6 py-5 border-b border-line flex items-start justify-between gap-4">
              <div className="min-w-0">
                <span className="eyebrow"><span className="text-accent-ink">Vault</span><span className="mx-2 text-faint">/</span>{selectedBackupLic.userName}</span>
                <h2 className="text-[20px] font-medium text-fg m-0 mt-2 tracking-tight">Cloud backups</h2>
                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  <span className="chip">{backupsList.length} {backupsList.length === 1 ? 'snapshot' : 'snapshots'}</span>
                  <span className="chip">{formatBytes(backupsList.reduce((acc, b) => acc + (b.fileSize || 0), 0))} used</span>
                  <span className="font-mono text-[11.5px] text-faint">{selectedBackupLic.key}</span>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedBackupLic(null)} className="btn btn-icon btn-ghost" aria-label="Close vault">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
              {/* Upload */}
              <form onSubmit={handleUploadBackup} className="well p-4 space-y-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="flex items-center gap-2 text-[12.5px] font-medium text-fg">
                    <UploadCloud className="w-4 h-4 text-accent-ink" /> Upload backup archive
                  </span>
                  <span className="font-mono text-[11px] text-faint">.zip · .db</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 h-9 px-3 rounded-[9px] border border-dashed border-line-strong bg-surface cursor-pointer hover:border-faint transition-colors min-w-0">
                    <FileArchive className="w-4 h-4 text-faint shrink-0" />
                    <span className={`text-[12.5px] truncate ${backupFile ? 'text-fg' : 'text-faint'}`}>
                      {backupFile ? backupFile.name : 'Choose file…'}
                    </span>
                    <input
                      type="file"
                      accept=".zip,.db,.sqlite,.dbbackup"
                      onChange={(e) => setBackupFile(e.target.files?.[0] || null)}
                      disabled={uploadingBackup}
                      className="sr-only"
                    />
                  </label>
                  <input
                    type="text"
                    placeholder="Note (optional) — e.g. day close"
                    value={uploadNotes}
                    onChange={(e) => setUploadNotes(e.target.value)}
                    disabled={uploadingBackup}
                    className="input bg-surface"
                  />
                </div>

                <div className="flex justify-end">
                  <button type="submit" disabled={!backupFile || uploadingBackup} className="btn btn-primary">
                    <UploadCloud className={`w-3.5 h-3.5 ${uploadingBackup ? 'animate-bounce' : ''}`} />
                    {uploadingBackup ? 'Uploading…' : 'Save to vault'}
                  </button>
                </div>
              </form>

              {/* List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="eyebrow flex items-center gap-2"><HardDrive className="w-3 h-3" /> Snapshot history</span>
                  <span className="text-[11.5px] text-faint">Keeps latest 3</span>
                </div>

                {loadingBackups ? (
                  <div className="py-10 text-center text-[12px] text-muted flex items-center justify-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Loading vault…
                  </div>
                ) : backupsList.length === 0 ? (
                  <div className="py-10 px-6 rounded-[10px] border border-dashed border-line text-center">
                    <Database className="w-6 h-6 text-faint mx-auto mb-3" />
                    <p className="text-[13px] text-fg m-0">No backups yet</p>
                    <p className="text-[12px] text-muted mt-1 m-0 max-w-sm mx-auto">
                      When a counter runs day closing or syncs a system backup, it is vaulted here.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-[10px] border border-line divide-y divide-line overflow-hidden">
                    {backupsList.map((bk) => {
                      const isZip = bk.format === 'zip' || bk.originalName.toLowerCase().endsWith('.zip');
                      const formattedDate = new Date(bk.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return (
                        <div key={bk.id} className="px-4 py-3.5 flex items-center justify-between gap-4 flex-wrap hover:bg-surface-2 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-[9px] bg-surface-2 border border-line flex items-center justify-center shrink-0">
                              {isZip ? <FileArchive className="w-4 h-4 text-accent-ink" /> : <Database className="w-4 h-4 text-muted" />}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-[12px] text-fg truncate max-w-[260px] sm:max-w-sm">{bk.originalName}</span>
                                <span className="chip">{isZip ? 'zip · db+img' : 'db'}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-[11.5px] text-muted flex-wrap">
                                <span className="num text-fg">{formatBytes(bk.fileSize)}</span>
                                <span className="text-faint">·</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-faint" />{formattedDate}</span>
                                <span className="text-faint">·</span>
                                <span className="flex items-center gap-1"><Laptop className="w-3 h-3 text-faint" />{bk.deviceName || 'Counter terminal'}</span>
                              </div>
                              {bk.notes && <p className="text-[11.5px] text-muted mt-1 m-0 italic">“{bk.notes}”</p>}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button type="button" onClick={() => downloadBackup(bk)} className="btn btn-sm" title="Download backup">
                              <Download className="w-3.5 h-3.5" /> Download
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteBackup(bk.id, bk.originalName)}
                              className="btn btn-sm btn-icon btn-ghost btn-danger w-7 h-7"
                              title="Delete backup"
                              aria-label="Delete backup"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 sm:px-6 py-3.5 border-t border-line flex items-center justify-between gap-3 flex-wrap">
              <span className="flex items-center gap-2 text-[11.5px] text-muted">
                <ShieldCheck className="w-3.5 h-3.5 text-ok" /> Isolated, encrypted storage per license
              </span>
              <button type="button" onClick={() => setSelectedBackupLic(null)} className="btn btn-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
