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
    <div className="p-8 space-y-8 flex-1 overflow-y-auto max-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Central Provider Overview</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Monitor all Omnipos client installations, license activations, and multi-counter cloud sync
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="p-6 rounded-2xl bg-white/90 dark:bg-[#141a24]/90 border border-slate-200/80 dark:border-white/10 shadow-sm dark:shadow-none space-y-4 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</span>
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">{stat.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Store Status & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white/90 dark:bg-[#141a24]/90 border border-slate-200/80 dark:border-white/10 shadow-sm dark:shadow-none space-y-6 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Registered Stores & POS Stations</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Live heartbeat from client desktop apps</p>
            </div>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Sync Engine Online
            </span>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Al-Madina Fast Food & Cafe', license: 'OMNI-FAST-9021', type: 'Fast Food', devices: '2 Registers (Kitchen KDS)', status: 'Active', synced: '2m ago' },
              { name: 'Gourmet Mart & Bakery', license: 'OMNI-MART-4410', type: 'Mini Mart', devices: '3 Registers (Barcode Scanner)', status: 'Active', synced: 'Just now' },
              { name: 'Crispy Byte Express', license: 'OMNI-FAST-7729', type: 'Fast Food', devices: '1 Register', status: 'Active', synced: '5m ago' },
            ].map((store, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-[#1b2331] border border-slate-200/60 dark:border-white/5 flex items-center justify-between transition-colors">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{store.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{store.license} • {store.devices}</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {store.status}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">Synced: {store.synced}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 rounded-2xl bg-white/90 dark:bg-[#141a24]/90 border border-slate-200/80 dark:border-white/10 shadow-sm dark:shadow-none space-y-6 transition-colors">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Cloud Architecture</h2>
          <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1b2331] border border-slate-200/60 dark:border-white/5 space-y-1 transition-colors">
              <p className="font-semibold text-slate-900 dark:text-white">Multi-Tenant PostgreSQL</p>
              <p className="text-slate-500 dark:text-slate-400">Stores have separate schemas (<code>lic_hash</code>) isolated for privacy.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1b2331] border border-slate-200/60 dark:border-white/5 space-y-1 transition-colors">
              <p className="font-semibold text-slate-900 dark:text-white">Offline-First Outbox</p>
              <p className="text-slate-500 dark:text-slate-400">Client desktops push queued orders automatically when internet is available.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1b2331] border border-slate-200/60 dark:border-white/5 space-y-1 transition-colors">
              <p className="font-semibold text-slate-900 dark:text-white">Machine HWID Lock</p>
              <p className="text-slate-500 dark:text-slate-400">Prevents license piracy by binding client licenses to hardware motherboard IDs.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
