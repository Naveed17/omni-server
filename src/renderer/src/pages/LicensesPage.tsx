import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Plus,
  Copy,
  Check,
  Power,
  Laptop,
  Trash2,
  Layers,
} from 'lucide-react';

interface LicenseDevice {
  hwid: string;
  deviceName: string;
  activatedAt: string;
}

interface LicenseRecord {
  id: string;
  key: string;
  userName: string;
  whatsappNumber: string;
  isEnabled: boolean;
  maxDevices: number;
  licenseType: string;
  expiresAt: string | null;
  modules: Record<string, boolean>;
  activeDevices: LicenseDevice[];
}

const ALL_MODULES: { key: string; label: string }[] = [
  { key: 'fastfood', label: 'Fast Food' },
  { key: 'omnimart', label: 'Omnimart' },
  { key: 'kitchen', label: 'Kitchen KDS' },
  { key: 'catalog', label: 'Catalog' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'khata', label: 'Khata' },
  { key: 'expenses', label: 'Expenses' },
  { key: 'reports', label: 'Reports' },
  { key: 'webStore', label: 'Web Store' },
  { key: 'admin', label: 'Admin Settings' },
];

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<LicenseRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Form state
  const [newStoreName, setNewStoreName] = useState('');
  const [newWhatsapp, setNewWhatsapp] = useState('');
  const [newMaxDevices, setNewMaxDevices] = useState(4);
  const [selectedModules, setSelectedModules] = useState<Record<string, boolean>>({
    fastfood: true,
    omnimart: true,
    kitchen: true,
    catalog: true,
    inventory: true,
    khata: true,
    expenses: true,
    reports: true,
    webStore: false,
    admin: true,
  });

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/licenses');
      if (res.ok) {
        const json = await res.json();
        setLicenses(json.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch licenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenses();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;

    try {
      const res = await fetch('/api/admin/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: newStoreName.trim(),
          whatsappNumber: newWhatsapp.trim() || '+92 300 0000000',
          maxDevices: Number(newMaxDevices) || 4,
          modules: selectedModules,
        }),
      });

      if (res.ok) {
        setNewStoreName('');
        setNewWhatsapp('');
        await fetchLicenses();
      }
    } catch (err) {
      console.error('Failed to create license:', err);
    }
  };

  const toggleLicense = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/licenses/${id}/toggle`, { method: 'POST' });
      if (res.ok) {
        await fetchLicenses();
      }
    } catch (err) {
      console.error('Failed to toggle license:', err);
    }
  };

  const toggleModule = async (license: LicenseRecord, moduleKey: string) => {
    const nextModules = {
      ...license.modules,
      [moduleKey]: !license.modules[moduleKey],
    };

    try {
      const res = await fetch(`/api/admin/licenses/${license.id}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modules: nextModules }),
      });
      if (res.ok) {
        await fetchLicenses();
      }
    } catch (err) {
      console.error('Failed to toggle module:', err);
    }
  };

  const removeDevice = async (licenseId: string, hwid: string) => {
    if (!confirm(`Unlink device ${hwid}?`)) return;
    try {
      const res = await fetch(`/api/admin/licenses/${licenseId}/devices/${encodeURIComponent(hwid)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchLicenses();
      }
    } catch (err) {
      console.error('Failed to unlink device:', err);
    }
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="p-8 space-y-8 flex-1 overflow-y-auto max-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-blue-500" />
            OmniPos Licenses &amp; Module Authority
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Issue client licenses, toggle individual modules remotely, and manage active terminal locks
          </p>
        </div>
        <button
          onClick={fetchLicenses}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-all"
        >
          {loading ? 'Refreshing...' : 'Refresh List'}
        </button>
      </div>

      {/* Generator Form */}
      <form onSubmit={handleCreate} className="p-6 rounded-2xl bg-[#141a24] border border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-400" />
          Generate New License Key
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Store / Client Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Al-Madina Cafe &amp; Supermart"
              value={newStoreName}
              onChange={(e) => setNewStoreName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1b2331] border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">WhatsApp Number</label>
            <input
              type="text"
              placeholder="+92 300 1234567"
              value={newWhatsapp}
              onChange={(e) => setNewWhatsapp(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1b2331] border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Max Terminals (Devices)</label>
            <input
              type="number"
              min={1}
              max={50}
              value={newMaxDevices}
              onChange={(e) => setNewMaxDevices(parseInt(e.target.value, 10))}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1b2331] border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">Initial Enabled Modules:</label>
          <div className="flex flex-wrap gap-2">
            {ALL_MODULES.map((m) => {
              const active = selectedModules[m.key] === true;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() =>
                    setSelectedModules((prev) => ({ ...prev, [m.key]: !prev[m.key] }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    active
                      ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                      : 'bg-white/5 text-slate-500 border-white/10'
                  }`}
                >
                  {m.label} {active ? '✓' : '✕'}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25"
        >
          <Plus className="w-4 h-4" />
          <span>Issue License Key</span>
        </button>
      </form>

      {/* Licenses Table */}
      <div className="rounded-2xl bg-[#141a24] border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Issued Licenses ({licenses.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#1b2331] text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Store &amp; Contact</th>
                <th className="px-6 py-3.5">License Key</th>
                <th className="px-6 py-3.5">Remote Modules (Click to Toggle)</th>
                <th className="px-6 py-3.5">Active Devices</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {licenses.map((lic) => (
                <tr key={lic.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{lic.userName}</div>
                    <div className="text-xs text-slate-400">{lic.whatsappNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <code className="px-2.5 py-1 rounded bg-[#1b2331] border border-white/10 text-xs font-mono text-blue-400 font-bold">
                        {lic.key}
                      </code>
                      <button
                        onClick={() => copyToClipboard(lic.key)}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Copy Key"
                      >
                        {copied === lic.key ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5 max-w-[340px]">
                      {ALL_MODULES.map((m) => {
                        const isEnabled = lic.modules?.[m.key] === true;
                        return (
                          <button
                            key={m.key}
                            onClick={() => toggleModule(lic, m.key)}
                            title={`Click to ${isEnabled ? 'Disable' : 'Enable'} ${m.label}`}
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-all ${
                              isEnabled
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-red-500/20 hover:text-red-300'
                                : 'bg-red-500/10 text-red-400/60 border-red-500/20 line-through hover:bg-emerald-500/20 hover:text-emerald-300'
                            }`}
                          >
                            {m.label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-300 font-medium mb-1">
                      {lic.activeDevices.length} / {lic.maxDevices} Devices
                    </div>
                    {lic.activeDevices.map((dev) => (
                      <div
                        key={dev.hwid}
                        className="flex items-center justify-between text-[11px] text-slate-400 bg-white/5 px-2 py-1 rounded mb-1 border border-white/5"
                      >
                        <span className="flex items-center gap-1 font-mono truncate max-w-[120px]" title={dev.hwid}>
                          <Laptop className="w-3 h-3 text-slate-500" />
                          {dev.deviceName || dev.hwid.slice(0, 8)}
                        </span>
                        <button
                          onClick={() => removeDevice(lic.id, dev.hwid)}
                          className="text-red-400 hover:text-red-300 p-0.5"
                          title="Unlink Device"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                        lic.isEnabled
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                          : 'bg-red-500/15 text-red-400 border-red-500/20'
                      }`}
                    >
                      {lic.isEnabled ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => toggleLicense(lic.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ml-auto border transition-all ${
                        lic.isEnabled
                          ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{lic.isEnabled ? 'Disable License' : 'Enable License'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
