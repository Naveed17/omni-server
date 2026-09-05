import React from 'react';
import {
  Store,
  KeyRound,
  RefreshCw,
  TrendingUp,
  HardDrive,
  Users,
  ShieldCheck,
} from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { label: 'Active Store Licenses', value: '8', change: '+2 this month', icon: KeyRound, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Connected Cashier Registers', value: '14', change: 'Online Now', icon: HardDrive, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Today Synced Transactions', value: '284', change: '100% synced', icon: RefreshCw, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Cloud Processed Volume', value: 'PKR 482,900', change: 'Live Aggregate', icon: TrendingUp, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="p-8 space-y-8 flex-1 overflow-y-auto max-h-screen max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight m-0">Central Provider Overview</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 m-0">
            Real-time multi-counter cloud synchronization, license activation mesh &amp; client telemetry
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white/85 dark:bg-[#0C1222]/85 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] space-y-3.5 relative overflow-hidden group transition-all"
            >
              {/* Top Cyber Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{stat.label}</span>
                <div className={`p-2 rounded-xl ${stat.bg} ${stat.color} border border-current/20`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight m-0">{stat.value}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {stat.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Store Status & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white/85 dark:bg-[#0C1222]/85 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] space-y-5 relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider m-0">Registered Stores &amp; POS Stations</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 m-0">Live heartbeat telemetry from client desktop nodes</p>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Engine Online
            </span>
          </div>

          <div className="space-y-2.5">
            {[
              { name: 'Al-Madina Fast Food & Cafe', license: 'OMNI-FAST-9021', type: 'Fast Food', devices: '2 Registers (Kitchen KDS)', status: 'Active', synced: '2m ago' },
              { name: 'Gourmet Mart & Bakery', license: 'OMNI-MART-4410', type: 'Mini Mart', devices: '3 Registers (Barcode Scanner)', status: 'Active', synced: 'Just now' },
              { name: 'Crispy Byte Express', license: 'OMNI-FAST-7729', type: 'Fast Food', devices: '1 Register', status: 'Active', synced: '5m ago' },
            ].map((store, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#080D1A]/80 border border-slate-200/60 dark:border-white/5 flex items-center justify-between transition-colors hover:border-cyan-500/30"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white m-0">{store.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 m-0">{store.license} • {store.devices}</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                    {store.status}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1 m-0">Synced: {store.synced}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cloud Architecture */}
        <div className="p-6 rounded-2xl bg-white/85 dark:bg-[#0C1222]/85 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] space-y-4 relative overflow-hidden transition-colors">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-500" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider m-0">Cloud Architecture</h2>
          </div>
          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-[#080D1A]/80 border border-slate-200/60 dark:border-white/5 space-y-1">
              <p className="font-bold text-xs text-slate-900 dark:text-white m-0">Multi-Tenant PostgreSQL</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 m-0">Stores have separate schemas (<code>lic_hash</code>) isolated for privacy.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-[#080D1A]/80 border border-slate-200/60 dark:border-white/5 space-y-1">
              <p className="font-bold text-xs text-slate-900 dark:text-white m-0">Offline-First Outbox</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 m-0">Client desktops push queued orders automatically when internet is available.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-[#080D1A]/80 border border-slate-200/60 dark:border-white/5 space-y-1">
              <p className="font-bold text-xs text-slate-900 dark:text-white m-0">Machine HWID Lock</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 m-0">Binds client licenses to hardware motherboard IDs to prevent unauthorized duplication.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
