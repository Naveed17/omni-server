import React, { useState, useEffect } from 'react';
import {
  Server,
  Database,
  ShieldCheck,
  Cpu,
  RefreshCw,
  CheckCircle2,
  Lock,
  Radio,
  Globe,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

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

  return (
    <div className="p-8 space-y-8 flex-1 overflow-y-auto max-h-screen max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight m-0">
              Server &amp; Cloud Gateway Config
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25 dark:border-indigo-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              NodeJS / NestJS 11 Engine
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-indigo-200/60 mt-1 m-0">
            OmniPos central cloud authority, database connectivity, zero-bandwidth verification &amp; API parameters
          </p>
        </div>

        <button
          type="button"
          onClick={testConnection}
          disabled={pinging}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer bg-white/80 dark:bg-white/5 text-slate-700 dark:text-indigo-200/80 border border-indigo-200/80 dark:border-white/10 backdrop-blur-md hover:bg-indigo-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all duration-150 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 ${pinging ? 'animate-spin' : ''}`} />
          {pinging ? 'Pinging API...' : 'Ping Live Health'}
        </button>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white/90 dark:bg-white/[0.05] backdrop-blur-2xl border border-indigo-100 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl p-6 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-indigo-200/60">
              API Gate Status
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight m-0">
              {healthStatus.online ? 'Online' : 'Degraded'}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {healthStatus.responseTime ? `${healthStatus.responseTime}ms Latency` : 'Port 4000 Active'}
            </p>
          </div>
        </div>

        <div className="bg-white/90 dark:bg-white/[0.05] backdrop-blur-2xl border border-indigo-100 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl p-6 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-indigo-200/60">
              Database Engine
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight m-0">
              Neon Cloud
            </p>
            <p className="text-xs text-indigo-600 dark:text-indigo-300 mt-1 font-semibold">
              PostgreSQL 16 SSL Pool
            </p>
          </div>
        </div>

        <div className="bg-white/90 dark:bg-white/[0.05] backdrop-blur-2xl border border-indigo-100 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl p-6 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-indigo-200/60">
              Security Protocol
            </span>
            <div className="p-2.5 rounded-xl bg-violet-500/15 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight m-0">
              AES-256
            </p>
            <p className="text-xs text-violet-600 dark:text-violet-300 mt-1 font-semibold">
              HWID CPU/Motherboard Binding
            </p>
          </div>
        </div>

        <div className="bg-white/90 dark:bg-white/[0.05] backdrop-blur-2xl border border-indigo-100 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl p-6 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-indigo-200/60">
              Mode Architecture
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight m-0">
              Zero-Bandwidth
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-semibold">
              Cloud License • Local Offline POS
            </p>
          </div>
        </div>
      </div>

      {/* Main Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Environment & Architecture Parameters */}
        <div className="bg-white/90 dark:bg-white/[0.05] backdrop-blur-2xl border border-indigo-100 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider m-0">
              Core Runtime Parameters
            </h2>
          </div>

          <div className="divide-y divide-indigo-50 dark:divide-white/5 text-xs">
            <div className="py-3 flex items-center justify-between">
              <span className="text-slate-500 dark:text-indigo-200/60">Server Listening Port</span>
              <span className="font-mono font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded">
                4000
              </span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <span className="text-slate-500 dark:text-indigo-200/60">Host Environment</span>
              <span className="font-semibold text-slate-800 dark:text-white">Vercel Serverless / Local NestJS</span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <span className="text-slate-500 dark:text-indigo-200/60">Cross-Origin Resource Sharing (CORS)</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Enabled (Universal POS Clients)
              </span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <span className="text-slate-500 dark:text-indigo-200/60">Offline Grace Period</span>
              <span className="font-semibold text-slate-800 dark:text-white">30 Days Token Expiry</span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <span className="text-slate-500 dark:text-indigo-200/60">Database Connection Pool</span>
              <span className="font-semibold text-slate-800 dark:text-white">Neon Serverless PgBouncer Pool</span>
            </div>
          </div>
        </div>

        {/* Cloud API Endpoints Catalog */}
        <div className="bg-white/90 dark:bg-white/[0.05] backdrop-blur-2xl border border-indigo-100 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider m-0">
              Cloud API Endpoints
            </h2>
          </div>

          <div className="space-y-2.5">
            {endpoints.map((ep) => (
              <div
                key={ep.path}
                className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-indigo-50 dark:border-white/5 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        ep.method === 'POST'
                          ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                          : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-white truncate">
                      {ep.path}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-indigo-200/50 mt-1 m-0 truncate">
                    {ep.desc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(ep.path, ep.path)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-indigo-200/60 shrink-0 cursor-pointer transition-colors"
                  title="Copy Path"
                >
                  {copiedEndpoint === ep.path ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
