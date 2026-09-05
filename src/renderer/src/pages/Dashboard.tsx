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
    { label: 'Active Store Licenses', value: '8', change: '+2 this month', icon: KeyRound, color: 'text-violet-400', bg: 'bg-violet-500/20' },
    { label: 'Connected Cashier Registers', value: '14', change: 'Online Now', icon: HardDrive, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    { label: 'Today Synced Transactions', value: '284', change: '100% synced', icon: RefreshCw, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { label: 'Cloud Processed Volume', value: 'PKR 482,900', change: 'Live Aggregate', icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/20' },
  ];

  return (
    <div className="p-8 space-y-8 flex-1 overflow-y-auto max-h-screen max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold text-white tracking-tight m-0">Central Provider Overview</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Telemetry
            </span>
          </div>
          <p className="text-sm text-indigo-200/60 mt-1 m-0">
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
              className="p-5 rounded-2xl bg-white/[0.06] backdrop-blur-xl border border-white/10 shadow-xl hover:border-white/20 space-y-3.5 relative overflow-hidden group transition-all duration-300"
            >
              {/* Top Ambient Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-indigo-200/60">{stat.label}</span>
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} shadow-sm`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-semibold text-white tracking-tight m-0">{stat.value}</p>
                <p className="text-xs text-emerald-400 mt-1 font-medium flex items-center gap-1.5">
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
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.06] backdrop-blur-xl border border-white/10 shadow-xl hover:border-white/20 space-y-5 relative overflow-hidden transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider m-0">Registered Stores &amp; POS Stations</h2>
              <p className="text-xs text-indigo-200/60 mt-0.5 m-0">Live heartbeat telemetry from client desktop nodes</p>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Engine Online
            </span>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Al-Madina Fast Food & Cafe', license: 'OMNI-FAST-9021', type: 'Fast Food', devices: '2 Registers (Kitchen KDS)', status: 'Active', synced: '2m ago' },
              { name: 'Gourmet Mart & Bakery', license: 'OMNI-MART-4410', type: 'Mini Mart', devices: '3 Registers (Barcode Scanner)', status: 'Active', synced: 'Just now' },
              { name: 'Crispy Byte Express', license: 'OMNI-FAST-7729', type: 'Fast Food', devices: '1 Register', status: 'Active', synced: '5m ago' },
            ].map((store, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-black/20 border border-white/5 flex items-center justify-between transition-all hover:border-white/15"
              >
                <div>
                  <p className="text-xs font-semibold text-white m-0">{store.name}</p>
                  <p className="text-[11px] text-indigo-200/50 font-mono mt-0.5 m-0">{store.license} • {store.devices}</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {store.status}
                  </span>
                  <p className="text-[11px] text-indigo-200/40 mt-1 m-0">Synced: {store.synced}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cloud Architecture */}
        <div className="p-6 rounded-2xl bg-white/[0.06] backdrop-blur-xl border border-white/10 shadow-xl hover:border-white/20 space-y-4 relative overflow-hidden transition-all duration-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider m-0">Cloud Architecture</h2>
          </div>
          <div className="space-y-3 text-xs text-indigo-200/70">
            <div className="p-3 rounded-xl bg-black/20 border border-white/5 space-y-1">
              <p className="font-semibold text-xs text-white m-0">Multi-Tenant PostgreSQL</p>
              <p className="text-[11px] text-indigo-200/50 m-0">Stores have separate schemas (<code>lic_hash</code>) isolated for privacy.</p>
            </div>
            <div className="p-3 rounded-xl bg-black/20 border border-white/5 space-y-1">
              <p className="font-semibold text-xs text-white m-0">Offline-First Outbox</p>
              <p className="text-[11px] text-indigo-200/50 m-0">Client desktops push queued orders automatically when internet is available.</p>
            </div>
            <div className="p-3 rounded-xl bg-black/20 border border-white/5 space-y-1">
              <p className="font-semibold text-xs text-white m-0">Machine HWID Lock</p>
              <p className="text-[11px] text-indigo-200/50 m-0">Binds client licenses to hardware motherboard IDs to prevent unauthorized duplication.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
