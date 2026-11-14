import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  RefreshCw,
  HardDrive,
  ShieldCheck,
  Database,
  ArrowUpRight,
  Layers,
  WifiOff,
  Cpu,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageShell, PageHeader, LiveChip, StatTile, SectionTitle } from '../components/ui';

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

  const activePct = data.totalLicenses > 0 ? Math.round((data.activeLicenses / data.totalLicenses) * 100) : 0;

  const stats = [
    {
      label: 'Active licenses',
      value: (
        <>
          {data.activeLicenses}
          <span className="text-faint text-[18px] ml-1">/{data.totalLicenses}</span>
        </>
      ),
      meta: `${activePct}% of issued keys in service`,
      icon: KeyRound,
    },
    {
      label: 'Paired registers',
      value: data.connectedDevices,
      meta: data.connectedDevices > 0 ? 'HWID-locked terminals online' : 'No devices paired yet',
      icon: HardDrive,
    },
    {
      label: 'License authority',
      value: 'Online',
      meta: 'Zero-bandwidth verification',
      icon: ShieldCheck,
    },
    {
      label: 'Storage engine',
      value: 'Neon',
      meta: 'Licenses only · protected',
      icon: Database,
    },
  ];

  const architecture = [
    {
      icon: Layers,
      title: 'Multi-tenant PostgreSQL',
      body: (
        <>
          Each store lives in an isolated schema (<code className="font-mono text-fg">lic_hash</code>) for complete data separation.
        </>
      ),
    },
    {
      icon: WifiOff,
      title: 'Offline-first outbox',
      body: 'Cashier nodes queue transactions during outages and flush instantly on reconnect.',
    },
    {
      icon: Cpu,
      title: 'Motherboard HWID lock',
      body: 'Cryptographic hardware binding prevents licenses from being cloned.',
    },
  ];

  return (
    <PageShell>
      <PageHeader
        index="01"
        section="Overview"
        status={<LiveChip label="Live" />}
        title="Provider overview"
        subtitle="License mesh, paired registers and store telemetry across the OmniPos cloud — refreshed every 30 seconds."
        actions={
          <button type="button" onClick={fetchOverview} disabled={loading} className="btn">
            <RefreshCw className={`w-3.5 h-3.5 text-muted ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing' : 'Refresh'}
          </button>
        }
      />

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatTile key={s.label} label={s.label} value={s.value} meta={s.meta} icon={s.icon} loading={loading} delay={i * 60} />
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Store registry */}
        <div className="panel rise lg:col-span-2 overflow-hidden" style={{ animationDelay: '240ms' }}>
          <div className="p-5 border-b border-line">
            <SectionTitle
              title="Registered stores"
              hint="Live instances in the central Neon database"
              right={
                <Link to="/licenses" className="btn btn-sm btn-ghost no-underline">
                  Manage <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              }
            />
          </div>

          {/* Column header */}
          <div className="hidden sm:grid grid-cols-[1fr_120px_96px] gap-4 px-5 py-2.5 border-b border-line eyebrow text-faint">
            <span>Store</span>
            <span>Last sync</span>
            <span className="text-right">Status</span>
          </div>

          <div className="divide-y divide-line">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="px-5 py-4 flex items-center gap-3">
                  <span className="skeleton w-9 h-9 rounded-[9px]" />
                  <div className="flex-1 space-y-2">
                    <span className="skeleton block w-40 h-3" />
                    <span className="skeleton block w-56 h-2.5" />
                  </div>
                  <span className="skeleton w-16 h-5" />
                </div>
              ))
            ) : data.stores.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <p className="text-[13px] text-fg m-0">No stores registered yet</p>
                <p className="text-[12px] text-muted mt-1 m-0">Issue a license key to bring the first store online.</p>
              </div>
            ) : (
              data.stores.map((store) => {
                const active = store.status === 'Active';
                return (
                  <div
                    key={store.id}
                    className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_96px] gap-4 items-center px-5 py-3.5 hover:bg-surface-2 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-[9px] bg-surface-3 border border-line flex items-center justify-center font-mono text-[11px] font-medium text-muted shrink-0">
                        {store.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-fg m-0 truncate">{store.name}</p>
                        <p className="font-mono text-[11px] text-faint mt-0.5 m-0 truncate">
                          {store.license} · {store.devices}
                        </p>
                      </div>
                    </div>
                    <span className="hidden sm:block font-mono text-[11.5px] text-muted">{store.synced}</span>
                    <span className="flex justify-end">
                      <span className={`chip ${active ? 'chip-ok' : 'chip-bad'}`}>
                        <span className="dot" />
                        {store.status}
                      </span>
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Architecture */}
        <div className="panel ticks rise p-5 flex flex-col gap-5" style={{ animationDelay: '300ms' }}>
          <SectionTitle icon={ShieldCheck} title="Cloud architecture" hint="How the platform stays fast and secure" />
          <ol className="m-0 p-0 list-none space-y-0 relative">
            {architecture.map((a, i) => (
              <li key={a.title} className="relative pl-10 pb-5 last:pb-0">
                {i < architecture.length - 1 && (
                  <span className="absolute left-[13px] top-8 bottom-0 w-px bg-line" />
                )}
                <span className="absolute left-0 top-0 w-[27px] h-[27px] rounded-[8px] bg-surface-2 border border-line flex items-center justify-center">
                  <a.icon className="w-3.5 h-3.5 text-accent-ink" />
                </span>
                <p className="text-[13px] font-medium text-fg m-0 pt-1">{a.title}</p>
                <p className="text-[12px] text-muted mt-1 m-0 leading-relaxed">{a.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </PageShell>
  );
}
