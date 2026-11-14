import React, { useState, useEffect } from 'react';
import {
  Server,
  Database,
  ShieldCheck,
  RefreshCw,
  Radio,
  Globe,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageShell, PageHeader, LiveChip, StatTile, SectionTitle } from '../components/ui';

export default function SettingsPage() {
  const [pinging, setPinging] = useState(false);
  const [healthStatus, setHealthStatus] = useState<{
    online: boolean;
    timestamp?: string;
    responseTime?: number;
  }>({ online: true });
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const testConnection = async () => {
    try {
      setPinging(true);
      const start = Date.now();
      const res = await fetch('/api/health');
      const time = Date.now() - start;
      if (res.ok) {
        const json = await res.json();
        setHealthStatus({
          online: true,
          timestamp: json.timestamp || new Date().toISOString(),
          responseTime: time,
        });
        toast.success(`Server responds in ${time}ms`);
      } else {
        setHealthStatus({ online: false, responseTime: time });
        toast.error('Server returned non-200 status');
      }
    } catch {
      setHealthStatus({ online: false });
      toast.error('Failed to reach provider API');
    } finally {
      setPinging(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(label);
    toast.success(`Copied: ${label}`);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const endpoints = [
    { method: 'POST', path: '/api/license/verify', desc: 'Client POS startup license authority & HWID validation' },
    { method: 'POST', path: '/api/license/activate', desc: 'Hardware machine activation & initial counter binding' },
    { method: 'GET', path: '/api/admin/licenses', desc: 'Cloud console master license registry & module switchboard' },
    { method: 'GET', path: '/api/admin/overview', desc: 'Real-time telemetry, active counters & store sync status' },
    { method: 'GET', path: '/api/health', desc: 'Provider health check & latency telemetry ping' },
  ];

  const params: { k: string; v: React.ReactNode }[] = [
    { k: 'Listening port', v: <span className="num text-fg">4000</span> },
    { k: 'Host environment', v: 'Vercel serverless · local NestJS' },
    {
      k: 'CORS',
      v: (
        <span className="text-ok flex items-center gap-1.5">
          <span className="dot" /> Enabled · universal POS clients
        </span>
      ),
    },
    { k: 'Offline grace period', v: '30-day token expiry' },
    { k: 'Connection pool', v: 'Neon serverless PgBouncer' },
  ];

  return (
    <PageShell>
      <PageHeader
        index="03"
        section="Server"
        status={<LiveChip label="NestJS 11" tone="accent" />}
        title="Server & gateway"
        subtitle="Central cloud authority, database connectivity, zero-bandwidth verification and public API surface."
        actions={
          <button type="button" onClick={testConnection} disabled={pinging} className="btn">
            <RefreshCw className={`w-3.5 h-3.5 text-muted ${pinging ? 'animate-spin' : ''}`} />
            {pinging ? 'Pinging' : 'Ping health'}
          </button>
        }
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatTile
          label="API gateway"
          icon={Server}
          value={
            <span className={healthStatus.online ? 'text-fg' : 'text-bad'}>
              {healthStatus.online ? 'Online' : 'Degraded'}
            </span>
          }
          meta={
            <span className="flex items-center gap-1.5">
              <span className={`dot ${healthStatus.online ? 'text-ok dot-live' : 'text-bad'}`} />
              {healthStatus.responseTime ? `${healthStatus.responseTime} ms latency` : 'Port 4000 active'}
            </span>
          }
        />
        <StatTile label="Database" icon={Database} value="Neon" meta="PostgreSQL 16 · SSL pool" delay={60} />
        <StatTile label="Security" icon={ShieldCheck} value="AES-256" meta="CPU / motherboard HWID binding" delay={120} />
        <StatTile label="Mode" icon={Zap} value="Zero-BW" meta="Cloud license · offline POS" delay={180} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Runtime parameters */}
        <div className="panel ticks rise p-5" style={{ animationDelay: '240ms' }}>
          <SectionTitle icon={Radio} title="Runtime parameters" hint="Effective configuration of the provider process" />
          <dl className="mt-4 m-0 divide-y divide-line border-t border-line">
            {params.map((p) => (
              <div key={p.k} className="py-3 flex items-center justify-between gap-4 text-[12.5px]">
                <dt className="font-mono text-[11px] uppercase tracking-[0.1em] text-faint">{p.k}</dt>
                <dd className="m-0 text-fg text-right">{p.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Endpoints */}
        <div className="panel ticks rise p-5" style={{ animationDelay: '300ms' }}>
          <SectionTitle icon={Globe} title="API endpoints" hint="Public routes consumed by POS clients and this console" />
          <div className="mt-4 space-y-1.5">
            {endpoints.map((ep) => (
              <div
                key={ep.path}
                className="group flex items-center justify-between gap-3 px-3 py-2.5 rounded-[10px] border border-transparent hover:border-line hover:bg-surface-2 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`font-mono text-[10px] font-semibold w-10 shrink-0 ${
                        ep.method === 'POST' ? 'text-warn' : 'text-accent-ink'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-[12.5px] text-fg truncate">{ep.path}</span>
                  </div>
                  <p className="text-[11.5px] text-muted mt-1 m-0 pl-[50px] truncate">{ep.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(ep.path, ep.path)}
                  className="btn btn-sm btn-icon btn-ghost opacity-60 group-hover:opacity-100"
                  title="Copy path"
                  aria-label={`Copy ${ep.path}`}
                >
                  {copiedEndpoint === ep.path ? <Check className="w-3.5 h-3.5 text-ok" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
