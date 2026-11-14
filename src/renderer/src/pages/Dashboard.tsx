import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  RefreshCw,
  CalendarX,
  CalendarClock,
  PowerOff,
  Gauge,
  Plug,
  ArchiveX,
  ChevronRight,
  CheckCircle2,
  KeyRound,
  Monitor,
  UploadCloud,
  AlertTriangle,
} from 'lucide-react';
import type { AttentionKind, ActivityKind } from '@common/overview';
import { useOverview, formatBytes, timeAgo } from '../lib/api';
import { BUSINESS_PROFILES } from './LicensesPage';

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function useNow(intervalMs = 15_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

const ATTENTION_META: Record<AttentionKind, { label: string; icon: React.ComponentType<{ className?: string }>; tone: string }> = {
  expired: { label: 'Expired', icon: CalendarX, tone: 'text-bad' },
  expiring: { label: 'Expiring', icon: CalendarClock, tone: 'text-warn' },
  suspended: { label: 'Suspended', icon: PowerOff, tone: 'text-bad' },
  capacity: { label: 'At capacity', icon: Gauge, tone: 'text-warn' },
  no_backup: { label: 'Backup stale', icon: ArchiveX, tone: 'text-warn' },
  inactive: { label: 'Not activated', icon: Plug, tone: 'text-muted' },
};

const ACTIVITY_META: Record<ActivityKind, { verb: string; icon: React.ComponentType<{ className?: string }> }> = {
  license_created: { verb: 'License issued', icon: KeyRound },
  device_activated: { verb: 'Terminal activated', icon: Monitor },
  backup_uploaded: { verb: 'Backup received', icon: UploadCloud },
};

const PLAN_LABEL: Record<string, string> = { monthly: 'Monthly', annual: 'Annual', lifetime: 'Lifetime' };

/* ── Building blocks ─────────────────────────────────────────────────────── */

function Kpi({
  label,
  children,
  foot,
  delay,
}: {
  label: string;
  children: React.ReactNode;
  foot: React.ReactNode;
  delay: number;
}) {
  return (
    <div className="panel ticks rise p-4 sm:p-5 flex flex-col justify-between gap-4 sm:gap-5 min-h-[132px] sm:min-h-[148px] min-w-0" style={{ animationDelay: `${delay}ms` }}>
      <span className="eyebrow">{label}</span>
      <div className="text-[28px] sm:text-[34px] leading-none font-medium tracking-[-0.04em] num text-fg">{children}</div>
      <div className="text-[11.5px] sm:text-[12px] text-muted">{foot}</div>
    </div>
  );
}

function SplitBar({ parts }: { parts: { value: number; className: string }[] }) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  return (
    <div className="flex h-1.5 rounded-full overflow-hidden bg-surface-3 gap-px">
      {total > 0 &&
        parts
          .filter((p) => p.value > 0)
          .map((p, i) => <span key={i} className={p.className} style={{ width: `${(p.value / total) * 100}%` }} />)}
    </div>
  );
}

function BarList({ rows }: { rows: { label: React.ReactNode; value: number; color?: string }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (rows.length === 0) return <p className="text-[12px] text-faint m-0 py-4">No data yet</p>;
  return (
    <ul className="m-0 p-0 list-none space-y-2.5">
      {rows.map((r, i) => (
        <li key={i} className="grid grid-cols-[minmax(0,140px)_1fr_32px] items-center gap-3">
          <span className="text-[12.5px] text-muted truncate flex items-center gap-2">{r.label}</span>
          <span className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
            <span
              className="block h-full rounded-full"
              style={{ width: `${(r.value / max) * 100}%`, background: r.color || 'var(--fg)', opacity: r.color ? 1 : 0.55 }}
            />
          </span>
          <span className="num text-[12px] text-fg text-right">{r.value}</span>
        </li>
      ))}
    </ul>
  );
}

function Skeleton() {
  return (
    <>
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="panel p-5 space-y-6 min-h-[148px]">
            <span className="skeleton block w-24 h-2.5" />
            <span className="skeleton block w-20 h-8" />
            <span className="skeleton block w-36 h-2.5" />
          </div>
        ))}
      </section>
      <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-4">
        <div className="panel p-5 space-y-3 h-72">
          {[0, 1, 2, 3].map((i) => <span key={i} className="skeleton block h-11" />)}
        </div>
        <div className="panel p-5 h-72" />
      </section>
    </>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export default function Dashboard() {
  const { data, isLoading, isError, isFetching, refetch, dataUpdatedAt } = useOverview();
  const now = useNow();

  const today = new Date(now).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
  const profileMeta = new Map(BUSINESS_PROFILES.map((p) => [p.key, p]));

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1320px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
        {/* Header */}
        <header className="rise flex items-end justify-between gap-4 flex-wrap">
          <div>
            <span className="eyebrow">{today}</span>
            <h1 className="text-[28px] sm:text-[32px] leading-none font-medium tracking-[-0.035em] text-fg m-0 mt-2.5">
              Overview
            </h1>
          </div>
          <button type="button" onClick={() => refetch()} disabled={isFetching} className="btn btn-ghost btn-sm font-mono">
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            {dataUpdatedAt ? `Updated ${timeAgo(new Date(dataUpdatedAt).toISOString(), now)}` : 'Refresh'}
          </button>
        </header>

        {isLoading ? (
          <Skeleton />
        ) : isError || !data ? (
          <div className="panel p-10 text-center">
            <AlertTriangle className="w-6 h-6 text-warn mx-auto mb-3" />
            <p className="text-[14px] text-fg m-0">Couldn’t load overview</p>
            <p className="text-[12.5px] text-muted mt-1 mb-5">The provider API didn’t respond. Check that it’s running.</p>
            <button type="button" className="btn" onClick={() => refetch()}>
              <RefreshCw className="w-3.5 h-3.5" /> Try again
            </button>
          </div>
        ) : (
          <>
            {/* KPIs */}
            <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
              <Kpi
                label="Active licenses"
                delay={0}
                foot={
                  <div className="space-y-2.5">
                    <SplitBar
                      parts={[
                        { value: data.licenses.active, className: 'bg-ok' },
                        { value: data.licenses.suspended, className: 'bg-faint' },
                        { value: data.licenses.expired, className: 'bg-bad' },
                      ]}
                    />
                    <div className="flex gap-3 font-mono text-[10.5px] text-faint">
                      <span>{data.licenses.suspended} suspended</span>
                      <span>{data.licenses.expired} expired</span>
                    </div>
                  </div>
                }
              >
                {data.licenses.active}
                <span className="text-faint text-[20px]">/{data.licenses.total}</span>
              </Kpi>

              <Kpi
                label="Terminals in use"
                delay={60}
                foot={
                  <div className="space-y-2.5">
                    <SplitBar
                      parts={[
                        { value: data.terminals.used, className: 'bg-accent' },
                        { value: Math.max(0, data.terminals.capacity - data.terminals.used), className: 'bg-transparent' },
                      ]}
                    />
                    <div className="font-mono text-[10.5px] text-faint">
                      {data.terminals.capacity > 0
                        ? `${Math.round((data.terminals.used / data.terminals.capacity) * 100)}% of seat capacity`
                        : 'No seats issued'}
                    </div>
                  </div>
                }
              >
                {data.terminals.used}
                <span className="text-faint text-[20px]">/{data.terminals.capacity}</span>
              </Kpi>

              <Kpi
                label="Expiring · 30 days"
                delay={120}
                foot={data.licenses.expiringSoon > 0 ? 'Renew before customers lose access' : 'No renewals due this month'}
              >
                <span className={data.licenses.expiringSoon > 0 ? 'text-warn' : ''}>{data.licenses.expiringSoon}</span>
              </Kpi>

              <Kpi
                label="Backups · 7 days"
                delay={180}
                foot={`${data.backups.storesCovered} stores covered · ${formatBytes(data.backups.totalBytes)} stored`}
              >
                {data.backups.last7d}
              </Kpi>
            </section>

            {/* Attention + activity */}
            <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-4 items-start">
              <div className="panel rise overflow-hidden" style={{ animationDelay: '220ms' }}>
                <div className="px-5 h-14 flex items-center justify-between border-b border-line">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-[14px] font-medium text-fg m-0 tracking-tight">Needs attention</h2>
                    {data.attention.length > 0 && <span className="chip">{data.attention.length}</span>}
                  </div>
                  <Link to="/licenses" className="btn btn-sm btn-ghost no-underline">
                    All licenses <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {data.attention.length === 0 ? (
                  <div className="px-5 py-14 text-center">
                    <CheckCircle2 className="w-6 h-6 text-ok mx-auto mb-3" />
                    <p className="text-[13.5px] text-fg m-0">All clear</p>
                    <p className="text-[12px] text-muted mt-1 m-0">Every license is active, backed up and within limits.</p>
                  </div>
                ) : (
                  <ul className="m-0 p-0 list-none divide-y divide-line max-h-[460px] overflow-y-auto">
                    {data.attention.map((a, i) => {
                      const meta = ATTENTION_META[a.kind];
                      return (
                        <li key={`${a.licenseId}-${a.kind}-${i}`}>
                          <Link
                            to={`/licenses?q=${encodeURIComponent(a.key)}`}
                            className="group grid grid-cols-[28px_minmax(0,1fr)_auto_16px] items-center gap-3.5 px-5 py-3 no-underline hover:bg-surface-2 transition-colors"
                          >
                            <span className={`w-7 h-7 rounded-[8px] bg-surface-2 border border-line flex items-center justify-center ${meta.tone}`}>
                              <meta.icon className="w-3.5 h-3.5" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-[13px] font-medium text-fg truncate">{a.name}</span>
                              <span className="block font-mono text-[11px] text-faint truncate">{a.key}</span>
                            </span>
                            <span className="text-right">
                              <span className={`block text-[12px] font-medium ${meta.tone}`}>{meta.label}</span>
                              <span className="block font-mono text-[11px] text-faint">{a.detail}</span>
                            </span>
                            <ChevronRight className="w-4 h-4 text-faint group-hover:text-fg transition-colors" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="panel rise" style={{ animationDelay: '280ms' }}>
                <div className="px-5 h-14 flex items-center border-b border-line">
                  <h2 className="text-[14px] font-medium text-fg m-0 tracking-tight">Recent activity</h2>
                </div>
                {data.activity.length === 0 ? (
                  <p className="text-[12.5px] text-faint m-0 px-5 py-10 text-center">Nothing has happened yet.</p>
                ) : (
                  <ol className="m-0 list-none px-5 py-4 max-h-[460px] overflow-y-auto">
                    {data.activity.map((ev, i) => {
                      const meta = ACTIVITY_META[ev.kind];
                      const last = i === data.activity.length - 1;
                      return (
                        <li key={`${ev.kind}-${ev.at}-${i}`} className="relative pl-9 pb-4 last:pb-0">
                          {!last && <span className="absolute left-[11px] top-7 bottom-0 w-px bg-line" />}
                          <span className="absolute left-0 top-0 w-[23px] h-[23px] rounded-full bg-surface-2 border border-line flex items-center justify-center">
                            <meta.icon className={`w-3 h-3 ${ev.kind === 'backup_uploaded' ? 'text-accent-ink' : 'text-muted'}`} />
                          </span>
                          <p className="text-[12.5px] text-fg m-0 leading-snug">
                            {meta.verb} <span className="text-muted">·</span> <span className="font-medium">{ev.name}</span>
                          </p>
                          <p className="text-[11.5px] text-faint m-0 mt-0.5 truncate">
                            {ev.kind !== 'license_created' && <>{ev.label} · </>}
                            <span className="font-mono">{timeAgo(ev.at, now)}</span>
                          </p>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>
            </section>

            {/* Mix */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="panel rise p-5" style={{ animationDelay: '320ms' }}>
                <div className="flex items-baseline justify-between mb-5">
                  <h2 className="text-[14px] font-medium text-fg m-0 tracking-tight">Licenses by plan</h2>
                  <span className="eyebrow text-faint">{data.licenses.total} total</span>
                </div>
                <BarList
                  rows={Object.entries(data.byType)
                    .sort((a, b) => b[1] - a[1])
                    .map(([k, v]) => ({ label: PLAN_LABEL[k] || k, value: v }))}
                />
              </div>
              <div className="panel rise p-5" style={{ animationDelay: '360ms' }}>
                <div className="flex items-baseline justify-between mb-5">
                  <h2 className="text-[14px] font-medium text-fg m-0 tracking-tight">Stores by industry</h2>
                  <span className="eyebrow text-faint">{Object.keys(data.byProfile).length} industries</span>
                </div>
                <BarList
                  rows={Object.entries(data.byProfile)
                    .sort((a, b) => b[1] - a[1])
                    .map(([k, v]) => {
                      const p = profileMeta.get(k);
                      return {
                        label: (
                          <>
                            <span className="dot" style={{ color: p?.color || 'var(--faint)' }} />
                            {p?.shortTag || k}
                          </>
                        ),
                        value: v,
                        color: p?.color,
                      };
                    })}
                />
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
