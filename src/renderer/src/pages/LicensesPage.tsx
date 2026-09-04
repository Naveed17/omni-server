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
  key: string; label: string; desc: string;
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
}

export interface BusinessProfileMeta {
  key: string;
  label: string;
  shortTag: string;
  desc: string;
  color: string;
}

export const BUSINESS_PROFILES: BusinessProfileMeta[] = [
  { key: 'standard', label: 'Standard Retail (General / Mart)', shortTag: 'Mart / Grocery', desc: 'General supermarket, packaged items & FMCG', color: '#38bdf8' },
  { key: 'food', label: 'Restaurant & Fast Food', shortTag: 'Food & Cafe', desc: 'Burgers, pizzas, portions & kitchen items', color: '#fb7185' },
  { key: 'hardware', label: 'Hardware, Iron & Building', shortTag: 'Hardware & Iron', desc: 'Steel, pipes, keel, sanitary & loose decimals', color: '#f59e0b' },
  { key: 'apparel', label: 'Apparel & Clothing', shortTag: 'Apparel', desc: 'Garments & clothing with size matrix XS-3XL', color: '#a855f7' },
  { key: 'footwear', label: 'Footwear & Shoes', shortTag: 'Footwear', desc: 'Shoes, boots & sandals with size 38-45 matrix', color: '#ec4899' },
];

/* ─── Modules (Primary Red & Secondary Blue Style) ───────────────────────────── */
const MODULES: ModuleMeta[] = [
  { key: 'fastfood',  label: 'Fast Food POS',    desc: 'Dine-In, Takeaway, KDS',       icon: UtensilsCrossed },
  { key: 'omnimart',  label: 'Omnimart Retail',  desc: 'Barcode & wholesale billing',   icon: ShoppingCart },
  { key: 'kitchen',   label: 'Kitchen KDS',      desc: 'Chef order display tickets',    icon: ChefHat },
  { key: 'catalog',   label: 'Product Catalog',  desc: 'Items, variants & categories',  icon: Tag },
  { key: 'inventory', label: 'Stock Control',    desc: 'In/Out audit & low stock',      icon: Package },
  { key: 'khata',     label: 'Customer Khata',   desc: 'Udhaar ledger & credit',        icon: BookOpen },
  { key: 'expenses',  label: 'Expense Tracker',  desc: 'Daily outflows & cash drawer',  icon: Receipt },
  { key: 'reports',   label: 'Profit Analytics', desc: 'Gross margin, COGS & sales',    icon: BarChart3 },
  { key: 'webStore',  label: 'Online Web Store', desc: 'Public customer ordering',      icon: Globe },
  { key: 'admin',     label: 'Admin Settings',   desc: 'Staff roles & print layout',    icon: Settings },
];

/* ─── Matte Glassy Design Tokens ─────────────────────────────────────────────── */
const S = {
  // Main frosted matte glass card
  card: {
    background: 'rgba(20, 12, 26, 0.65)',
    backdropFilter: 'blur(26px)',
    WebkitBackdropFilter: 'blur(26px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    boxShadow: '0 16px 40px -12px rgba(0, 0, 0, 0.55)',
  } as React.CSSProperties,

  cardSuspended: {
    background: 'rgba(38, 10, 20, 0.60)',
    backdropFilter: 'blur(26px)',
    WebkitBackdropFilter: 'blur(26px)',
    border: '1px solid rgba(225, 29, 72, 0.35)',
    borderRadius: 20,
    boxShadow: '0 16px 40px -12px rgba(0, 0, 0, 0.55)',
  } as React.CSSProperties,

  // Inner recessed panel (matte secondary blue undertone)
  innerPanel: {
    background: 'rgba(10, 8, 20, 0.60)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
  } as React.CSSProperties,

  // Matte input
  input: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    color: '#f8fafc',
    outline: 'none',
    padding: '9px 14px',
    fontSize: 13,
    width: '100%',
    transition: 'border-color 0.15s',
  } as React.CSSProperties,
};

/* ─── Component ──────────────────────────────────────────────────────────────── */
export default function LicensesPage() {
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
    <div style={{ flex: 1, overflowY: 'auto', height: '100%', scrollbarWidth: 'thin', scrollbarColor: 'rgba(225, 29, 72, 0.25) transparent' }}>
      <div style={{ padding: '26px 32px', maxWidth: 1380, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Top Header ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Primary Red Emblem with Blue secondary halo */}
            <div style={{
              width: 46, height: 46, borderRadius: 14, flexShrink: 0,
              background: 'linear-gradient(135deg, #e11d48 0%, #be123c 60%, #2563eb 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(225, 29, 72, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}>
              <KeyRound style={{ width: 22, height: 22, color: '#ffffff' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.3px', margin: 0 }}>
                  Client Licenses
                </h1>
                {/* Secondary Blue Pill */}
                <span style={{
                  padding: '2px 9px', borderRadius: 999, fontSize: 9, fontWeight: 800,
                  letterSpacing: 1.2, textTransform: 'uppercase',
                  background: 'rgba(37, 99, 235, 0.18)', color: '#93c5fd',
                  border: '1px solid rgba(59, 130, 246, 0.35)',
                }}>
                  Control Hub
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#64748b', margin: '3px 0 0' }}>
                Remote module authority, client management &amp; HWID terminal locking
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {/* Secondary Blue Action */}
            <button
              onClick={load}
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px',
                borderRadius: 11, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1',
                border: '1px solid rgba(255, 255, 255, 0.09)',
                backdropFilter: 'blur(16px)', transition: 'all 0.15s ease',
              }}
            >
              <RefreshCw style={{ width: 13, height: 13, color: '#38bdf8', ...(loading ? { animation: 'spin 1s linear infinite' } : {}) }} />
              {loading ? 'Syncing...' : 'Refresh'}
            </button>

            {/* Primary Red Action Button */}
            <button
              onClick={() => setCreate((p) => !p)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px',
                borderRadius: 11, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                background: 'linear-gradient(135deg, #e11d48, #be123c)',
                color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 4px 18px rgba(225, 29, 72, 0.4)',
                letterSpacing: 0.3, textTransform: 'uppercase', transition: 'all 0.15s ease',
              }}
            >
              <Plus style={{ width: 15, height: 15, strokeWidth: 2.5 }} />
              Issue New License
            </button>
          </div>
        </div>

        {/* ── Create License Drawer ───────────────────────────────────────── */}
        {showCreate && (
          <div style={{ ...S.card, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, marginBottom: 18, borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles style={{ width: 16, height: 16, color: '#fb7185' }} />
                <span style={{ fontWeight: 700, fontSize: 14, color: '#f8fafc' }}>Issue Enterprise License Key</span>
              </div>
              <button
                onClick={() => setCreate(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
                  borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  background: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <X style={{ width: 12, height: 12 }} /> Close
              </button>
            </div>

            <form onSubmit={create}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 18 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 5 }}>Store / Client Name *</label>
                  <input type="text" required placeholder="e.g. Al-Madina Cafe" value={newName} onChange={(e) => setNewName(e.target.value)} style={S.input} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 5 }}>WhatsApp Contact</label>
                  <input type="text" placeholder="+92 300 1234567" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} style={S.input} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 5 }}>Max Terminal Devices</label>
                  <input type="number" min={1} max={50} value={newMax} onChange={(e) => setNewMax(parseInt(e.target.value, 10) || 1)} style={{ ...S.input, fontWeight: 700 }} />
                </div>
              </div>

              {/* Initial Module Selectors */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 8 }}>Initial Module Authority:</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                  {MODULES.map((m) => {
                    const on = selMods[m.key];
                    const Ic = m.icon;
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setSelMods((p) => ({ ...p, [m.key]: !p[m.key] }))}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
                          borderRadius: 10, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                          textAlign: 'left', transition: 'all 0.15s ease',
                          ...(on ? {
                            background: 'rgba(225, 29, 72, 0.18)',
                            border: '1px solid rgba(225, 29, 72, 0.4)',
                            color: '#fecdd3',
                          } : {
                            background: 'rgba(255, 255, 255, 0.025)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            color: '#64748b',
                          }),
                        }}
                      >
                        <Ic style={{ width: 13, height: 13, flexShrink: 0, color: on ? '#fb7185' : '#64748b' }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Business Profile Selection (Industry Presets) */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', display: 'block' }}>
                    Assigned Business Profiles (Industry Presets):
                  </label>
                  <span style={{ fontSize: 10, color: '#64748b' }}>
                    Single profile locks category creation, multiple profiles gives options
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
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
                        style={{
                          display: 'flex', flexDirection: 'column', gap: 3, padding: '9px 12px',
                          borderRadius: 10, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                          textAlign: 'left', transition: 'all 0.15s ease',
                          ...(on ? {
                            background: `${bp.color}22`,
                            border: `1px solid ${bp.color}88`,
                            color: bp.color,
                          } : {
                            background: 'rgba(255, 255, 255, 0.025)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            color: '#64748b',
                          }),
                        }}
                      >
                        <span style={{ fontWeight: 700, fontSize: 11.5 }}>{bp.shortTag}</span>
                        <span style={{ fontSize: 9.5, opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bp.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setCreate(false)}
                  style={{ padding: '9px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'transparent', color: '#64748b', border: 'none' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !newName.trim()}
                  style={{
                    padding: '9px 20px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    background: 'linear-gradient(135deg, #e11d48, #be123c)', color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.15)', textTransform: 'uppercase',
                    boxShadow: '0 4px 16px rgba(225, 29, 72, 0.4)', opacity: (saving || !newName.trim()) ? 0.5 : 1,
                  }}
                >
                  {saving ? 'Creating...' : 'Confirm & Issue Key'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Matte Stats & Search Filter Bar ─────────────────────────────── */}
        <div style={{ ...S.card, padding: '14px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {[
              { val: licenses.length, label: 'Total Clients', color: '#f8fafc' },
              { val: activeN, label: 'Active Licenses', color: '#38bdf8' }, // Secondary Blue
              { val: licenses.length - activeN, label: 'Suspended', color: '#fb7185' }, // Primary Red
            ].map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <div style={{ width: 1, height: 30, background: 'rgba(255, 255, 255, 0.08)' }} />}
                <div>
                  <p style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1, margin: 0 }}>{s.val}</p>
                  <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.2, color: '#64748b', margin: '3px 0 0' }}>{s.label}</p>
                </div>
              </React.Fragment>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: '#64748b' }} />
              <input
                type="text"
                placeholder="Search store name, license key..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ ...S.input, width: 250, paddingLeft: 32, paddingRight: 12, height: 34, boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', padding: 3, borderRadius: 10, background: 'rgba(10, 8, 20, 0.5)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              {(['all', 'active', 'disabled'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '5px 12px', borderRadius: 7, fontSize: 11, fontWeight: 600,
                    cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s ease',
                    ...(filter === f ? {
                      background: 'rgba(225, 29, 72, 0.22)',
                      color: '#fecdd3',
                      border: '1px solid rgba(225, 29, 72, 0.4)',
                    } : {
                      background: 'transparent',
                      color: '#64748b',
                      border: '1px solid transparent',
                    }),
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Client License Cards Stack ──────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {shown.length === 0 ? (
            <div style={{ ...S.card, padding: 50, textAlign: 'center', color: '#64748b', fontSize: 13 }}>
              No client licenses found matching your search.
            </div>
          ) : shown.map((lic) => {
            const ratio = (lic.activeDevices?.length || 0) / (lic.maxDevices || 1);
            const enCount = MODULES.filter((m) => lic.modules?.[m.key] === true).length;
            const initials = lic.userName.slice(0, 2).toUpperCase();

            return (
              <div key={lic.id} style={lic.isEnabled ? S.card : S.cardSuspended}>

                {/* ── Top Bar of Card ─────────────────────────────────────── */}
                <div style={{
                  padding: '18px 24px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14,
                }}>
                  {/* Left: Client Identity */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 15, color: '#ffffff',
                      ...(lic.isEnabled ? {
                        background: 'linear-gradient(135deg, #e11d48, #be123c)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        boxShadow: '0 4px 14px rgba(225, 29, 72, 0.35)',
                      } : {
                        background: 'rgba(225, 29, 72, 0.15)',
                        color: '#fb7185',
                        border: '1px solid rgba(225, 29, 72, 0.3)',
                      }),
                    }}>
                      {initials}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                          {lic.userName}
                        </h2>
                        {/* Status Badge */}
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700,
                          letterSpacing: 0.8, textTransform: 'uppercase',
                          ...(lic.isEnabled ? {
                            background: 'rgba(56, 189, 248, 0.14)',
                            color: '#38bdf8',
                            border: '1px solid rgba(56, 189, 248, 0.35)',
                          } : {
                            background: 'rgba(225, 29, 72, 0.12)',
                            color: '#fb7185',
                            border: '1px solid rgba(225, 29, 72, 0.3)',
                          }),
                        }}>
                          <span style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: lic.isEnabled ? '#38bdf8' : '#e11d48',
                          }} />
                          {lic.isEnabled ? 'Active License' : 'Suspended'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 3, fontSize: 11, color: '#64748b' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Phone style={{ width: 11, height: 11 }} /> {lic.whatsappNumber || 'No phone'}
                        </span>
                        <span style={{ color: 'rgba(255, 255, 255, 0.1)' }}>•</span>
                        <span style={{ fontFamily: 'monospace', color: '#fb7185', fontWeight: 600 }}>
                          {enCount}/10 modules enabled
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Key Container (Secondary Blue) + Action Button (Primary Red) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    {/* License Key Badge (Secondary Blue) */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 9, padding: '7px 14px', borderRadius: 10,
                      background: 'rgba(10, 8, 20, 0.65)',
                      border: '1px solid rgba(59, 130, 246, 0.25)',
                    }}>
                      <KeyRound style={{ width: 13, height: 13, color: '#60a5fa', flexShrink: 0 }} />
                      <span style={{ fontFamily: 'monospace', fontSize: 12.5, fontWeight: 700, color: '#93c5fd', letterSpacing: 1.5 }}>
                        {lic.key}
                      </span>
                      <button
                        onClick={() => copyKey(lic.key)}
                        style={{
                          display: 'flex', padding: 5, borderRadius: 6, cursor: 'pointer',
                          background: copied === lic.key ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                          color: copied === lic.key ? '#38bdf8' : '#94a3b8',
                          border: `1px solid ${copied === lic.key ? 'rgba(56, 189, 248, 0.35)' : 'rgba(255, 255, 255, 0.08)'}`,
                          transition: 'all 0.15s ease',
                        }}
                        title="Copy Key"
                      >
                        {copied === lic.key ? <Check style={{ width: 12, height: 12 }} /> : <Copy style={{ width: 12, height: 12 }} />}
                      </button>
                    </div>

                    {/* Master Power Toggle Button (Primary Red) */}
                    <button
                      onClick={() => toggleLic(lic.id, lic.isEnabled, lic.userName)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px',
                        borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                        letterSpacing: 0.5, textTransform: 'uppercase', transition: 'all 0.15s ease',
                        ...(lic.isEnabled ? {
                          background: 'rgba(225, 29, 72, 0.14)',
                          color: '#fb7185',
                          border: '1px solid rgba(225, 29, 72, 0.35)',
                        } : {
                          background: 'rgba(37, 99, 235, 0.18)',
                          color: '#93c5fd',
                          border: '1px solid rgba(59, 130, 246, 0.4)',
                        }),
                      }}
                    >
                      <Power style={{ width: 13, height: 13 }} />
                      {lic.isEnabled ? 'Suspend' : 'Activate'}
                    </button>
                  </div>
                </div>

                {/* ── Body: Two Panels ─────────────────────────────────────── */}
                <div style={{ padding: '18px 24px', display: 'grid', gridTemplateColumns: '290px 1fr', gap: 20 }}>

                  {/* LEFT: Hardware Terminals (Matte recessed) */}
                  <div style={{ ...S.innerPanel, padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <Cpu style={{ width: 13, height: 13, color: '#fb7185' }} />
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: '#f8fafc' }}>Hardware Terminals</span>
                      </div>
                      <span style={{
                        fontFamily: 'monospace', fontSize: 10.5, fontWeight: 700,
                        padding: '2px 8px', borderRadius: 999,
                        background: ratio >= 1 ? 'rgba(225, 29, 72, 0.15)' : 'rgba(37, 99, 235, 0.15)',
                        color: ratio >= 1 ? '#fb7185' : '#93c5fd',
                        border: `1px solid ${ratio >= 1 ? 'rgba(225, 29, 72, 0.3)' : 'rgba(37, 99, 235, 0.3)'}`,
                      }}>
                        {lic.activeDevices?.length || 0} / {lic.maxDevices} In Use
                      </span>
                    </div>

                    {/* Primary Red Progress Bar */}
                    <div style={{ height: 4, borderRadius: 999, background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden', marginBottom: 14 }}>
                      <div style={{
                        height: '100%', borderRadius: 999, transition: 'width 0.4s ease',
                        width: `${Math.min(100, Math.max(5, ratio * 100))}%`,
                        background: ratio >= 1 ? '#e11d48' : 'linear-gradient(90deg, #e11d48, #2563eb)',
                      }} />
                    </div>

                    <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#64748b', margin: '0 0 7px' }}>
                      Linked HWID Machines:
                    </p>

                    {!lic.activeDevices?.length ? (
                      <div style={{
                        padding: '12px', borderRadius: 10, textAlign: 'center',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px dashed rgba(255, 255, 255, 0.08)',
                        fontSize: 11, color: '#475569', fontStyle: 'italic',
                      }}>
                        No machines registered yet.
                      </div>
                    ) : lic.activeDevices.map((dev) => (
                      <div
                        key={dev.hwid}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '7px 10px', borderRadius: 9, marginBottom: 5,
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                          <div style={{ padding: 4, borderRadius: 6, background: 'rgba(37, 99, 235, 0.18)', color: '#60a5fa', flexShrink: 0 }}>
                            <Laptop style={{ width: 12, height: 12 }} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: 11, fontWeight: 600, color: '#f8fafc', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 125 }}>
                              {dev.deviceName || 'Cashier PC'}
                            </p>
                            <p style={{ fontFamily: 'monospace', fontSize: 9.5, color: '#64748b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 125 }}>
                              {dev.hwid.slice(0, 14)}...
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeDevice(lic.id, dev.hwid, dev.deviceName)}
                          style={{
                            padding: 4, borderRadius: 6, cursor: 'pointer',
                            background: 'transparent', color: '#64748b', border: 'none', transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#fb7185'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#64748b'; }}
                          title="Unlink Machine"
                        >
                          <Trash2 style={{ width: 12, height: 12 }} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* RIGHT: Live Module Switchboard & Business Profile Switchboard */}
                  <div>
                    {/* Live Business Profile Selector */}
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <Tag style={{ width: 13, height: 13, color: '#38bdf8' }} />
                          <h3 style={{ fontSize: 11, fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: 1.2, margin: 0 }}>
                            Business Profiles / Industry Types
                          </h3>
                        </div>
                        <span style={{ fontSize: 10, color: '#94a3b8' }}>
                          {(lic.businessProfiles || ['standard']).length === 1 ? 'Single Profile (Auto-Locked in Category)' : 'Multi-Profile (Filtered in Category)'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {BUSINESS_PROFILES.map((bp) => {
                          const active = (lic.businessProfiles || ['standard']).includes(bp.key);
                          return (
                            <button
                              key={bp.key}
                              type="button"
                              onClick={() => toggleProfile(lic, bp.key)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                                cursor: 'pointer', transition: 'all 0.15s ease',
                                ...(active ? {
                                  background: `${bp.color}20`,
                                  border: `1px solid ${bp.color}80`,
                                  color: bp.color,
                                } : {
                                  background: 'rgba(255, 255, 255, 0.025)',
                                  border: '1px solid rgba(255, 255, 255, 0.05)',
                                  color: '#64748b',
                                }),
                              }}
                            >
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? bp.color : '#64748b' }} />
                              {bp.shortTag}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <Sliders style={{ width: 13, height: 13, color: '#fb7185' }} />
                        <h3 style={{ fontSize: 11, fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: 1.2, margin: 0 }}>
                          Live Module Switchboard
                        </h3>
                      </div>
                      <div style={{ display: 'flex', gap: 7 }}>
                        {[
                          { label: 'Enable All', on: true, c: '#fb7185' },
                          { label: 'Disable All', on: false, c: '#94a3b8' },
                        ].map((b) => (
                          <button
                            key={b.label}
                            onClick={() => bulkMod(lic, b.on)}
                            style={{
                              padding: '4px 10px', borderRadius: 7, fontSize: 10.5, fontWeight: 600, cursor: 'pointer',
                              background: b.on ? 'rgba(225, 29, 72, 0.16)' : 'rgba(255, 255, 255, 0.04)',
                              color: b.c,
                              border: b.on ? '1px solid rgba(225, 29, 72, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 10 Module Grid (Primary Red Active Switch & Icons) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                      {MODULES.map((m) => {
                        const on = lic.modules?.[m.key] === true;
                        const Ic = m.icon;
                        return (
                          <div
                            key={m.key}
                            onClick={() => toggleMod(lic, m.key)}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '9px 12px', borderRadius: 12, cursor: 'pointer',
                              userSelect: 'none', transition: 'all 0.15s ease',
                              ...(on ? {
                                background: 'rgba(225, 29, 72, 0.14)',
                                border: '1px solid rgba(225, 29, 72, 0.35)',
                              } : {
                                background: 'rgba(255, 255, 255, 0.025)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                opacity: 0.5,
                              }),
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                              {/* Primary Red Icon Container */}
                              <div style={{
                                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                ...(on ? {
                                  background: 'rgba(225, 29, 72, 0.22)',
                                  color: '#fda4af',
                                } : {
                                  background: 'rgba(255, 255, 255, 0.04)',
                                  color: '#64748b',
                                }),
                              }}>
                                <Ic style={{ width: 14, height: 14 }} />
                              </div>

                              <div style={{ minWidth: 0 }}>
                                <p style={{
                                  fontSize: 11, fontWeight: 600, margin: 0,
                                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                  color: on ? '#f8fafc' : '#64748b',
                                  textDecoration: on ? 'none' : 'line-through',
                                }}>
                                  {m.label}
                                </p>
                                <p style={{ fontSize: 9.5, margin: 0, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {m.desc}
                                </p>
                              </div>
                            </div>

                            {/* Primary Red Switch */}
                            <div style={{ paddingLeft: 6, flexShrink: 0 }}>
                              <div style={{
                                width: 34, height: 18, borderRadius: 999, padding: 2,
                                display: 'flex', alignItems: 'center',
                                transition: 'all 0.2s ease',
                                ...(on ? {
                                  background: 'linear-gradient(135deg, #e11d48, #f43f5e)',
                                  boxShadow: '0 2px 8px rgba(225, 29, 72, 0.4)',
                                } : {
                                  background: 'rgba(255, 255, 255, 0.12)',
                                }),
                              }}>
                                <div style={{
                                  width: 14, height: 14, borderRadius: '50%', background: '#ffffff',
                                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
                                  transform: on ? 'translateX(16px)' : 'translateX(0)',
                                  transition: 'transform 0.2s ease',
                                }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
