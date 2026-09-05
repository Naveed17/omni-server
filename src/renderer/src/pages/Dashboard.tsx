import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  RefreshCw,
  TrendingUp,
  HardDrive,
  ShieldCheck,
  Store as StoreIcon,
  Laptop,
} from 'lucide-react';

interface StoreTelemetry {
  id: string;
  name: string;
  license: string;
  type: string;
  devices: string;
  devicesCount: number;
  status: string;
  synced: string;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    activeLicenses: number;
    totalLicenses: number;
    connectedDevices: number;
    totalOrders: number;
    volume: number;
    formattedVolume: string;
    stores: StoreTelemetry[];
  }>({
    activeLicenses: 0,
    totalLicenses: 0,
    connectedDevices: 0,
    totalOrders: 0,
    volume: 0,
    formattedVolume: 'PKR 0',
    stores: [],
  });

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/overview');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
          return;
        }
      }

      // Fallback to /api/admin/licenses if /api/admin/overview route isn't hit
      const licRes = await fetch('/api/admin/licenses');
      if (licRes.ok) {
        const licJson = await licRes.json();
        const lics: any[] = licJson.data || [];
        const active = lics.filter((l) => l.isEnabled).length;
        const devices = lics.reduce((sum, l) => sum + (l.activeDevices?.length || 0), 0);

        setData((prev) => ({
          ...prev,
          activeLicenses: active,
          totalLicenses: lics.length,
          connectedDevices: devices,
          stores: lics.map((l) => ({
            id: l.id,
            name: l.userName,
            license: l.key,
            type: l.businessProfiles?.[0] ? l.businessProfiles[0].toUpperCase() : 'RETAIL',
            devices: `${l.activeDevices?.length || 0} Registers`,
            devicesCount: l.activeDevices?.length || 0,
            status: l.isEnabled ? 'Active' : 'Suspended',
            synced: l.activeDevices?.[0]?.activatedAt
              ? new Date(l.activeDevices[0].activatedAt).toLocaleDateString()
              : 'Never',
          })),
        }));
      }
    } catch (err) {
      console.error('[Dashboard] Error fetching overview telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    const timer = setInterval(fetchOverview, 30000); // auto-refresh every 30s
    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      label: 'Active Store Licenses',
      value: String(data.activeLicenses),
      change: `${data.totalLicenses} Total Issued`,
      icon: KeyRound,
      color: 'text-violet-500 dark:text-violet-400',
      bg: 'bg-violet-500/15 dark:bg-violet-500/20',
    },
    {
      label: 'Connected Cashier Registers',
      value: String(data.connectedDevices),
      change: data.connectedDevices > 0 ? 'Machines Online' : 'No Devices Paired',
      icon: HardDrive,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/15 dark:bg-emerald-500/20',
    },
    {
      label: 'Cloud Synced Transactions',
      value: String(data.totalOrders),
      change: '100% Ingested',
      icon: RefreshCw,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-500/15 dark:bg-blue-500/20',
    },
    {
      label: 'Cloud Processed Volume',
      value: data.formattedVolume,
      change: 'Live Database Aggregate',
      icon: TrendingUp,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/15 dark:bg-amber-500/20',
    },
  ];

  return (
    <div className="p-8 space-y-8 flex-1 overflow-y-auto max-h-screen max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight m-0">
              Central Provider Overview
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25 dark:border-indigo-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Neon Telemetry
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-indigo-200/60 mt-1 m-0">
            Real-time multi-counter cloud synchronization, license activation mesh &amp; client telemetry
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOverview}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer bg-white/80 dark:bg-white/5 text-slate-700 dark:text-indigo-200/80 border border-indigo-200/80 dark:border-white/10 backdrop-blur-md hover:bg-indigo-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all duration-150 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Live Refresh'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white/90 dark:bg-white/[0.05] backdrop-blur-2xl border border-indigo-100 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl p-6 space-y-3.5 relative overflow-hidden group transition-all duration-300 hover:border-indigo-200 dark:hover:border-white/20"
            >
              {/* Top Ambient Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-indigo-200/60">
                  {stat.label}
                </span>
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} shadow-sm`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight m-0">
                  {stat.value}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {stat.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Store Status & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/90 dark:bg-white/[0.05] backdrop-blur-2xl border border-indigo-100 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl p-6 space-y-5 relative overflow-hidden transition-all duration-300 hover:border-indigo-200 dark:hover:border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider m-0">
                Registered Stores &amp; POS Stations
              </h2>
              <p className="text-xs text-slate-500 dark:text-indigo-200/60 mt-0.5 m-0">
                Actual live store instances registered in central Neon cloud database
              </p>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 dark:border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Engine Online
            </span>
          </div>

          <div className="space-y-3">
            {data.stores.length === 0 ? (
              <div className="p-8 text-center bg-white/50 dark:bg-white/[0.02] border border-dashed border-indigo-200 dark:border-white/10 rounded-xl text-xs text-slate-500 dark:text-indigo-200/50">
                {loading ? 'Fetching active store registry...' : 'No stores registered yet. Issue a license key to register.'}
              </div>
            ) : (
              data.stores.map((store) => (
                <div
                  key={store.id}
                  className="bg-white dark:bg-white/[0.03] border border-indigo-100 dark:border-white/5 rounded-xl p-4 hover:bg-indigo-50/70 dark:hover:bg-white/[0.07] transition-all flex items-center justify-between shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-sm shrink-0 border border-indigo-500/25">
                      {store.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white m-0 truncate">
                        {store.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-indigo-200/50 font-mono mt-0.5 m-0 truncate">
                        {store.license} • {store.devices}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md border ${
                        store.status === 'Active'
                          ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 dark:border-emerald-500/30'
                          : 'bg-rose-500/15 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/25 dark:border-rose-500/30'
                      }`}
                    >
                      {store.status}
                    </span>
                    <p className="text-[11px] text-slate-400 dark:text-indigo-200/40 mt-1 m-0">
                      Sync: {store.synced}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cloud Architecture */}
        <div className="bg-white/90 dark:bg-white/[0.05] backdrop-blur-2xl border border-indigo-100 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl p-6 space-y-4 relative overflow-hidden transition-all duration-300 hover:border-indigo-200 dark:hover:border-white/20">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider m-0">
              Cloud Architecture
            </h2>
          </div>
          <div className="space-y-3 text-xs text-slate-600 dark:text-indigo-200/70">
            <div className="bg-white dark:bg-white/[0.03] border border-indigo-100 dark:border-white/5 rounded-xl p-4 hover:bg-indigo-50/70 dark:hover:bg-white/[0.07] transition-all space-y-1 shadow-xs">
              <p className="font-semibold text-xs text-slate-900 dark:text-white m-0">Multi-Tenant Neon PostgreSQL</p>
              <p className="text-[11px] text-slate-500 dark:text-indigo-200/50 m-0">
                Stores have isolated schemas (<code>lic_hash</code>) ensuring complete private data separation.
              </p>
            </div>
            <div className="bg-white dark:bg-white/[0.03] border border-indigo-100 dark:border-white/5 rounded-xl p-4 hover:bg-indigo-50/70 dark:hover:bg-white/[0.07] transition-all space-y-1 shadow-xs">
              <p className="font-semibold text-xs text-slate-900 dark:text-white m-0">Offline-First Outbox Synchronization</p>
              <p className="text-[11px] text-slate-500 dark:text-indigo-200/50 m-0">
                Cashier nodes queue local transactions during outages and flush instantly upon reconnection.
              </p>
            </div>
            <div className="bg-white dark:bg-white/[0.03] border border-indigo-100 dark:border-white/5 rounded-xl p-4 hover:bg-indigo-50/70 dark:hover:bg-white/[0.07] transition-all space-y-1 shadow-xs">
              <p className="font-semibold text-xs text-slate-900 dark:text-white m-0">Hardware Motherboard HWID Locking</p>
              <p className="text-[11px] text-slate-500 dark:text-indigo-200/50 m-0">
                Cryptographic hardware binding ensures licenses cannot be pirated or cloned.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
