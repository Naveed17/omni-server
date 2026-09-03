import React, { useState } from 'react';
import {
  KeyRound,
  Plus,
  Copy,
  Check,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';

export default function LicensesPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [newStoreName, setNewStoreName] = useState('');
  const [newModule, setNewModule] = useState<'fastfood' | 'minimart'>('fastfood');
  const [licenses, setLicenses] = useState([
    { id: '1', key: 'OMNI-FAST-9021-AF72', store: 'Al-Madina Fast Food & Cafe', module: 'Fast Food', devices: 2, maxDevices: 3, status: 'Active', hwid: 'HWID-9842-XB81' },
    { id: '2', key: 'OMNI-MART-4410-BC99', store: 'Gourmet Mart & Bakery', module: 'Mini Mart', devices: 3, maxDevices: 5, status: 'Active', hwid: 'HWID-1102-MM30' },
    { id: '3', key: 'OMNI-FAST-7729-QR01', store: 'Crispy Byte Express', module: 'Fast Food', devices: 1, maxDevices: 2, status: 'Active', hwid: 'HWID-5589-KL94' },
  ]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;

    const randomKey = `OMNI-${newModule === 'fastfood' ? 'FAST' : 'MART'}-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    setLicenses((prev) => [
      {
        id: String(Date.now()),
        key: randomKey,
        store: newStoreName,
        module: newModule === 'fastfood' ? 'Fast Food' : 'Mini Mart',
        devices: 0,
        maxDevices: 3,
        status: 'Active',
        hwid: 'Unregistered',
      },
      ...prev,
    ]);

    setNewStoreName('');
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="p-8 space-y-8 flex-1 overflow-y-auto max-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-white">Store Licenses & Hardware Locks</h1>
        <p className="text-sm text-slate-400 mt-1">
          Issue new client license keys, lock HWID registers, and manage store modules
        </p>
      </div>

      {/* Generator Form */}
      <form onSubmit={handleCreate} className="p-6 rounded-2xl bg-[#141a24] border border-white/10 flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[240px]">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Store / Client Business Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Al-Rehman Super Market"
            value={newStoreName}
            onChange={(e) => setNewStoreName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-[#1b2331] border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="w-[180px]">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Module Type</label>
          <select
            value={newModule}
            onChange={(e) => setNewModule(e.target.value as any)}
            className="w-full px-4 py-2.5 rounded-xl bg-[#1b2331] border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="fastfood">Fast Food (Kitchen KDS)</option>
            <option value="minimart">Mini Mart (Barcode POS)</option>
          </select>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25"
        >
          <Plus className="w-4 h-4" />
          <span>Generate License Key</span>
        </button>
      </form>

      {/* Licenses Table */}
      <div className="rounded-2xl bg-[#141a24] border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Issued Licenses ({licenses.length})</h2>
        </div>

        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-[#1b2331] text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3.5">Store Name</th>
              <th className="px-6 py-3.5">License Key</th>
              <th className="px-6 py-3.5">Module</th>
              <th className="px-6 py-3.5">Hardware HWID</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {licenses.map((lic) => (
              <tr key={lic.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 font-semibold text-white">{lic.store}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <code className="px-2.5 py-1 rounded bg-[#1b2331] border border-white/10 text-xs font-mono text-blue-400">
                      {lic.key}
                    </code>
                    <button
                      onClick={() => copyToClipboard(lic.key)}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Copy Key"
                    >
                      {copied === lic.key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {lic.module}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-mono text-slate-400">{lic.hwid}</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    {lic.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => copyToClipboard(lic.key)}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                  >
                    Copy Key
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
