import React, { useState, useEffect, useMemo } from 'react';
import {
  KeyRound, Plus, Copy, Check, Power, Laptop, Trash2, Search,
  Phone, RefreshCw, Sliders, Sparkles, Cpu,
  UtensilsCrossed, ShoppingCart, ChefHat, Tag, Package,
  BookOpen, Receipt, BarChart3, Globe, Settings, X, Sun, Moon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

/* ─── Types ─────────────────────────────────────────────────────────────────── */
interface LicenseDevice { hwid: string; deviceName: string; activatedAt: string; }
interface LicenseRecord {
  id: string; key: string; userName: string; whatsappNumber: string;
  isEnabled: boolean; maxDevices: number; licenseType: string;
  expiresAt: string | null; modules: Record<string, boolean>;
  businessProfiles?: string[];
  activeDevices: LicenseDevice[]; createdAt?: string;
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
    key: 'standard',
    label: 'Standard Retail (General / Mart)',
    shortTag: 'Mart / Grocery',
    desc: 'General supermarket, packaged items & FMCG',
    color: '#6366f1',
    activeClasses: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-200 shadow-[0_0_12px_rgba(99,102,241,0.25)]',
    dotColor: 'bg-indigo-400',
  },
  {
    key: 'food',
    label: 'Restaurant & Fast Food',
    shortTag: 'Food & Cafe',
    desc: 'Burgers, pizzas, portions & kitchen items',
    color: '#f59e0b',
    activeClasses: 'bg-amber-500/20 border-amber-500/40 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
    dotColor: 'bg-amber-400',
  },
  {
    key: 'hardware',
    label: 'Hardware, Iron & Building',
    shortTag: 'Hardware & Iron',
    desc: 'Steel, pipes, keel, sanitary & loose decimals',
    color: '#10b981',
    activeClasses: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
    dotColor: 'bg-emerald-400',
  },
  {
    key: 'apparel',
    label: 'Apparel & Clothing',
    shortTag: 'Apparel',
    desc: 'Garments & clothing with size matrix XS-3XL',
    color: '#8b5cf6',
    activeClasses: 'bg-violet-500/20 border-violet-500/40 text-violet-200 shadow-[0_0_12px_rgba(139,92,246,0.25)]',
    dotColor: 'bg-violet-400',
  },
  {
    key: 'footwear',
    label: 'Footwear & Shoes',
    shortTag: 'Footwear',
    desc: 'Shoes, boots & sandals with size 38-45 matrix',
    color: '#ec4899',
    activeClasses: 'bg-pink-500/20 border-pink-500/40 text-pink-200 shadow-[0_0_12px_rgba(236,72,153,0.25)]',
    dotColor: 'bg-pink-400',
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

export default function LicensesPage() {
  const { isDark, toggleTheme } = useTheme();

  const [licenses, setLicenses]         = useState<LicenseRecord[]>([]);
  const [loading, setLoading]           = useState(false);
  const [copied, setCopied]             = useState<string | null>(null);
  const [search, setSearch]             = useState('');
  const [filter, setFilter]             = useState<'all' | 'active' | 'disabled'>('all');
  const [showCreate, setCreate]         = useState(false);
  const [newName, setNewName]           = useState('');
  const [newPhone, setNewPhone]         = useState('');
  const [newMax, setNewMax]             = useState(4);
  const [saving, setSaving]             = useState(false);
  const [selProfiles, setSelProfiles]   = useState<string[]>(['standard']);
  const [selMods, setSelMods]           = useState<Record<string, boolean>>({
    fastfood: true, omnimart: true, kitchen: true, catalog: true, inventory: true,
    khata: true, expenses: true, reports: true, webStore: false, admin: true,
  });

  const load = async () => {
    try {
      setLoading(true);
      const r = await fetch('/api/admin/licenses');
      if (r.ok) {
        const j = await r.json();
        setLicenses(j.data || []);
      }
    } catch {
      toast.error('Failed to load licenses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

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
    <div className="flex-1 overflow-y-auto h-full p-8 max-w-[1400px] mx-auto space-y-7">

      {/* ── Top Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25 dark:border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.25)]">
            <KeyRound className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight m-0">Client Licenses</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/25 dark:border-indigo-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                Control Hub
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-indigo-200/60 mt-0.5 m-0">
              Remote module authority, client management &amp; HWID terminal locking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer bg-white/80 dark:bg-white/5 text-slate-700 dark:text-indigo-200/80 border border-indigo-200/80 dark:border-white/10 backdrop-blur-md hover:bg-indigo-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all duration-150 shadow-xs"
            title="Toggle Theme"
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-indigo-500" />
            )}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {/* Refresh Action */}
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer bg-white/80 dark:bg-white/5 text-slate-700 dark:text-indigo-200/80 border border-indigo-200/80 dark:border-white/10 backdrop-blur-md hover:bg-indigo-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all duration-150 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Syncing...' : 'Refresh'}
          </button>

          {/* Issue New License Action */}
          <button
            type="button"
            onClick={() => setCreate((p) => !p)}
            className="flex items-center gap-2 px-4.5 py-2 rounded-xl text-xs font-semibold tracking-wide text-white cursor-pointer bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 border border-white/20 shadow-lg shadow-indigo-500/25 transition-all duration-200"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Issue New License
          </button>
        </div>
      </div>

      {/* ── Create License Drawer (Glassmorphic Card) ────────────────────── */}
      {showCreate && (
        <div className="bg-white/90 dark:bg-white/[0.05] backdrop-blur-2xl border border-indigo-100 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl p-6 space-y-5 transition-all duration-300">
          <div className="flex items-center justify-between pb-3.5 border-b border-indigo-100 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span className="font-bold text-sm text-slate-900 dark:text-white">Issue Enterprise License Key</span>
            </div>
            <button
              type="button"
              onClick={() => setCreate(false)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-indigo-200/60 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-3 h-3" /> Close
            </button>
          </div>

          <form onSubmit={create} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-indigo-200/70 mb-1.5">Store / Client Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Madina Cafe"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-white/5 border border-indigo-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-indigo-200/40 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-indigo-200/70 mb-1.5">WhatsApp Contact</label>
                <input
                  type="text"
                  placeholder="+92 300 1234567"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-white/5 border border-indigo-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-indigo-200/40 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-indigo-200/70 mb-1.5">Max Terminal Devices</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={newMax}
                  onChange={(e) => setNewMax(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-white/5 border border-indigo-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-indigo-200/40 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors shadow-xs"
                />
              </div>
            </div>

            {/* Initial Module Selectors */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-indigo-200/70 mb-2">Initial Module Authority:</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {MODULES.map((m) => {
                  const on = selMods[m.key];
                  const Ic = m.icon;
                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setSelMods((p) => ({ ...p, [m.key]: !p[m.key] }))}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-medium cursor-pointer text-left transition-all duration-200 border ${
                        on
                          ? 'bg-indigo-50 dark:bg-white/[0.07] border-indigo-200 dark:border-white/15 text-slate-900 dark:text-white shadow-xs'
                          : 'bg-slate-50/80 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 text-slate-500 dark:text-indigo-200/50 hover:bg-slate-100 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${m.accent.iconBg} ${m.accent.iconText}`}>
                        <Ic className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Business Profile Selection */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-indigo-200/70">
                  Assigned Business Profiles (Industry Presets):
                </label>
                <span className="text-[11px] text-slate-400 dark:text-indigo-200/50">
                  Single profile locks category creation, multiple profiles gives options
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {BUSINESS_PROFILES.map((bp) => {
                  const on = selProfiles.includes(bp.key);
                  return (
                    <button
                      key={bp.key}
                      type="button"
                      onClick={() => {
                        setSelProfiles((prev) =>
                          prev.includes(bp.key)
                            ? (prev.length > 1 ? prev.filter((k) => k !== bp.key) : prev)
                            : [...prev, bp.key]
                        );
                      }}
                      className={`flex flex-col gap-1 p-2.5 rounded-xl text-xs font-medium cursor-pointer text-left transition-all duration-200 border ${
                        on
                          ? bp.activeClasses
                          : 'bg-slate-50/80 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 text-slate-500 dark:text-indigo-200/50 hover:bg-slate-100 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="font-semibold text-xs">{bp.shortTag}</span>
                      <span className="text-[10px] opacity-75 truncate">{bp.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCreate(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium cursor-pointer bg-transparent text-slate-600 dark:text-indigo-200/60 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !newName.trim()}
                className="px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white border border-white/20 shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-all"
              >
                {saving ? 'Creating...' : 'Confirm & Issue Key'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Stats & Search Filter Bar (Glassmorphic HUD) ──────────────────── */}
      <div className="bg-white/90 dark:bg-white/[0.05] backdrop-blur-2xl border border-indigo-100 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl p-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-7">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none m-0">{licenses.length}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-indigo-200/60 mt-1.5 m-0">Total Clients</p>
            </div>
            <div className="w-px h-8 bg-indigo-100 dark:bg-white/10" />
            <div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 leading-none m-0">{activeN}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-indigo-200/60 mt-1.5 m-0">Active Licenses</p>
            </div>
            <div className="w-px h-8 bg-indigo-100 dark:bg-white/10" />
            <div>
              <p className="text-2xl font-bold text-rose-500 dark:text-pink-400 leading-none m-0">{licenses.length - activeN}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-indigo-200/60 mt-1.5 m-0">Suspended</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-indigo-200/40" />
            <input
              type="text"
              placeholder="Search store name, license key..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 pl-9 pr-3 h-9 text-xs rounded-xl bg-white dark:bg-white/5 border border-indigo-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-indigo-200/40 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-xs"
            />
          </div>

          <div className="flex items-center p-1 rounded-xl bg-indigo-50/80 dark:bg-black/25 border border-indigo-100 dark:border-white/5">
            {(['all', 'active', 'disabled'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1 rounded-lg text-xs font-semibold cursor-pointer capitalize transition-all duration-150 ${
                  filter === f
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-600 dark:text-indigo-200/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Client License Cards Stack (Glassmorphic Containers) ───────────── */}
      <div className="flex flex-col gap-6">
        {shown.length === 0 ? (
          <div className="bg-white/90 dark:bg-white/[0.05] backdrop-blur-2xl border border-indigo-100 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl p-12 text-center text-slate-500 dark:text-indigo-200/60 text-sm">
            No client licenses found matching your search.
          </div>
        ) : shown.map((lic) => {
          const ratio = (lic.activeDevices?.length || 0) / (lic.maxDevices || 1);
          const enCount = MODULES.filter((m) => lic.modules?.[m.key] === true).length;
          const initials = lic.userName.slice(0, 2).toUpperCase();

          return (
            <div
              key={lic.id}
              className={`rounded-2xl backdrop-blur-2xl border transition-all duration-300 overflow-hidden relative shadow-xl dark:shadow-2xl p-6 ${
                lic.isEnabled
                  ? 'bg-white/90 dark:bg-white/[0.05] border-indigo-100 dark:border-white/10'
                  : 'bg-rose-50/50 dark:bg-white/[0.02] border-rose-300 dark:border-rose-500/30'
              }`}
            >
              {/* Soft Ambient Top Accent Glow */}
              <div
                className={`absolute top-0 left-0 right-0 h-[2px] ${
                  lic.isEnabled
                    ? 'bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent'
                    : 'bg-gradient-to-r from-transparent via-rose-500/60 to-transparent'
                }`}
              />

              {/* ── Top Bar of Card ─────────────────────────────────────── */}
              <div className="p-5 px-6 border-b border-indigo-100 dark:border-white/10 flex items-center justify-between flex-wrap gap-4">
                {/* Left: Client Identity */}
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-xl shrink-0 flex items-center justify-center font-bold text-sm text-white ${
                      lic.isEnabled
                        ? 'bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 shadow-md shadow-indigo-500/25 border border-white/20'
                        : 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {initials}
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-base font-bold text-slate-900 dark:text-white m-0 tracking-tight">
                        {lic.userName}
                      </h2>
                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                          lic.isEnabled
                            ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 dark:border-emerald-500/30 shadow-xs'
                            : 'bg-rose-500/15 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/25 dark:border-rose-500/30'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${lic.isEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        {lic.isEnabled ? 'Active License' : 'Suspended'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 mt-1 text-xs text-slate-500 dark:text-indigo-200/60">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-indigo-500 dark:text-indigo-300/60" /> {lic.whatsappNumber || 'No phone'}
                      </span>
                      <span className="opacity-40">•</span>
                      <span className="font-mono text-indigo-700 dark:text-indigo-300 font-semibold bg-indigo-50 dark:bg-indigo-500/15 px-2 py-0.5 rounded-md border border-indigo-200/80 dark:border-indigo-500/25">
                        {enCount}/10 modules active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Key Container + Power Button */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Encrypted License Key Badge */}
                  <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-indigo-50/70 dark:bg-black/25 border border-indigo-200/80 dark:border-white/10 shadow-inner">
                    <KeyRound className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="font-mono text-xs font-bold text-indigo-900 dark:text-indigo-200 tracking-wider">
                      {lic.key}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyKey(lic.key)}
                      className={`p-1 rounded-md cursor-pointer transition-colors border ${
                        copied === lic.key
                          ? 'bg-indigo-500/30 text-indigo-700 dark:text-indigo-300 border-indigo-500/40 shadow-xs'
                          : 'bg-white dark:bg-white/5 text-slate-600 dark:text-indigo-200/60 border-slate-200 dark:border-transparent hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
                      }`}
                      title="Copy Key"
                    >
                      {copied === lic.key ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>

                  {/* Power Button */}
                  <button
                    type="button"
                    onClick={() => toggleLic(lic.id, lic.isEnabled, lic.userName)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider cursor-pointer transition-all duration-150 border ${
                      lic.isEnabled
                        ? 'bg-white dark:bg-white/5 text-slate-700 dark:text-indigo-200/70 border-indigo-200/80 dark:border-white/10 hover:bg-rose-500/15 hover:text-rose-600 dark:hover:text-rose-300 hover:border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {lic.isEnabled ? 'Suspend' : 'Activate'}
                  </button>
                </div>
              </div>

              {/* ── Body: Two Panels ─────────────────────────────────────── */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">

                {/* LEFT: Hardware Terminals (Inner Sub-Card) ──────────────── */}
                <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-black/20 border border-indigo-100 dark:border-white/5 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Hardware Terminals</span>
                    </div>
                    <span
                      className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        ratio >= 1
                          ? 'bg-rose-500/15 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/25 dark:border-rose-500/30'
                          : 'bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/25 dark:border-indigo-500/30'
                      }`}
                    >
                      {lic.activeDevices?.length || 0} / {lic.maxDevices} In Use
                    </span>
                  </div>

                  {/* Progress Bar with Glowing Gradient (Guideline 6) */}
                  <div className="h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        ratio >= 1
                          ? 'w-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]'
                          : ratio >= 0.75
                          ? 'w-3/4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                          : ratio >= 0.5
                          ? 'w-1/2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                          : ratio > 0
                          ? 'w-1/4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                          : 'w-0'
                      }`}
                    />
                  </div>

                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-indigo-200/50 m-0">
                    Linked HWID Machines:
                  </p>

                  {!lic.activeDevices?.length ? (
                    <div className="p-3 rounded-xl text-center bg-white/60 dark:bg-white/[0.02] border border-dashed border-indigo-200/80 dark:border-white/10 text-xs text-slate-400 dark:text-indigo-200/40 italic">
                      No machines registered yet.
                    </div>
                  ) : lic.activeDevices.map((dev) => (
                    <div
                      key={dev.hwid}
                      className="flex items-center justify-between bg-white dark:bg-white/[0.03] border border-indigo-100 dark:border-white/5 rounded-xl p-4 hover:bg-indigo-50/70 dark:hover:bg-white/[0.07] transition-all shadow-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1.5 rounded-lg bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 shrink-0">
                          <Laptop className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white m-0 truncate max-w-[130px]">
                            {dev.deviceName || 'Cashier PC'}
                          </p>
                          <p className="font-mono text-[10px] text-slate-400 dark:text-indigo-200/40 m-0 truncate max-w-[130px]">
                            {dev.hwid.slice(0, 14)}...
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDevice(lic.id, dev.hwid, dev.deviceName)}
                        className="p-1.5 rounded-md cursor-pointer text-slate-400 dark:text-indigo-200/40 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Unlink Machine"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* RIGHT: Live Module Switchboard & Business Profile Switchboard */}
                <div className="space-y-4">
                  {/* Live Business Profile Selector */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider m-0">
                          Business Profiles / Industry Types
                        </h3>
                      </div>
                      <span className="text-[11px] text-slate-400 dark:text-indigo-200/50">
                        {(lic.businessProfiles || ['standard']).length === 1 ? 'Single Profile (Auto-Locked in Category)' : 'Multi-Profile (Filtered in Category)'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {BUSINESS_PROFILES.map((bp) => {
                        const active = (lic.businessProfiles || ['standard']).includes(bp.key);
                        return (
                          <button
                            key={bp.key}
                            type="button"
                            onClick={() => toggleProfile(lic, bp.key)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 border ${
                              active
                                ? bp.activeClasses
                                : 'bg-slate-100/80 dark:bg-black/20 border-slate-200 dark:border-white/5 text-slate-600 dark:text-indigo-200/50 hover:bg-slate-200 dark:hover:bg-black/30 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${active ? bp.dotColor : 'bg-slate-400 dark:bg-indigo-200/30'}`} />
                            {bp.shortTag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Live Module Switchboard (Inner Sub-Cards with Pastel Icon Blocks) */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider m-0">
                          Live Module Switchboard
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => bulkMod(lic, true)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25 dark:border-indigo-500/30 hover:bg-indigo-500/25 transition-colors"
                        >
                          Enable All
                        </button>
                        <button
                          type="button"
                          onClick={() => bulkMod(lic, false)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-indigo-200/60 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                          Disable All
                        </button>
                      </div>
                    </div>

                    {/* 10 Module Grid (Matching Image 2 ShikshaQ Style) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {MODULES.map((m) => {
                        const on = lic.modules?.[m.key] === true;
                        const Ic = m.icon;
                        return (
                          <div
                            key={m.key}
                            onClick={() => toggleMod(lic, m.key)}
                            className={`flex items-center justify-between bg-white dark:bg-white/[0.03] border border-indigo-100 dark:border-white/5 rounded-xl p-4 hover:bg-indigo-50/70 dark:hover:bg-white/[0.07] transition-all cursor-pointer select-none ${
                              on
                                ? 'bg-indigo-50/60 dark:bg-white/[0.07] border-indigo-200 dark:border-white/15 shadow-xs'
                                : 'opacity-65 hover:opacity-100'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Saturated Pastel Gradient Icon Block (Image 2) */}
                              <div
                                className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center transition-colors ${m.accent.iconBg} ${m.accent.iconText}`}
                              >
                                <Ic className="w-4 h-4" />
                              </div>

                              <div className="min-w-0">
                                <p
                                  className={`text-xs font-semibold m-0 truncate ${
                                    on ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-indigo-200/40 line-through'
                                  }`}
                                >
                                  {m.label}
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-indigo-200/50 m-0 truncate">
                                  {m.desc}
                                </p>
                              </div>
                            </div>

                            {/* Glowing Indigo Toggle Switch (Image 2 Guideline 4) */}
                            <div className="pl-1.5 shrink-0">
                              <div
                                className={`w-8 h-4.5 rounded-full p-0.5 flex items-center transition-colors duration-200 ${
                                  on
                                    ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]'
                                    : 'bg-slate-300 dark:bg-white/10'
                                }`}
                              >
                                <div
                                  className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                                    on ? 'translate-x-3.5' : 'translate-x-0 bg-white dark:bg-indigo-200/40'
                                  }`}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
