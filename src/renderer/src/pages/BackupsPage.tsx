import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Search, FileArchive, Database, Download, Trash2, ChevronRight, AlertTriangle } from 'lucide-react';
import { BACKUP_STALE_DAYS } from '@common/overview';
import { formatBytes, timeAgo, useOverview } from '../lib/api';
import {
  backupDownloadUrl, licenseStatus, useAllBackups, useBackupCounts, useDeleteBackup, useLicenses,
  type StoreBackup,
} from '../lib/licenses';

const DAY = 86_400_000;

type Freshness = 'fresh' | 'ok' | 'stale' | 'never' | 'idle';

const FRESH_META: Record<Freshness, { label: string; tone: string; bar: string }> = {
  fresh: { label: 'Last 24h', tone: 'text-ok', bar: 'bg-ok' },
  ok: { label: 'This week', tone: 'text-fg', bar: 'bg-accent' },
  stale: { label: 'Stale', tone: 'text-warn', bar: 'bg-warn' },
  never: { label: 'Never', tone: 'text-bad', bar: 'bg-bad' },
  idle: { label: 'No terminals', tone: 'text-faint', bar: 'bg-surface-3' },
};

function freshness(lastAt: string | null, hasTerminals: boolean, now: number): Freshness {
  if (!hasTerminals && !lastAt) return 'idle';
  if (!lastAt) return 'never';
  const age = now - new Date(lastAt).getTime();
  if (age < DAY) return 'fresh';
  if (age <= BACKUP_STALE_DAYS * DAY) return 'ok';
  return 'stale';
}

function dayLabel(iso: string, now: number) {
  const d = new Date(iso);
  const today = new Date(now);
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((startOf(today) - startOf(d)) / DAY);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}

export default function BackupsPage() {
  const { data: backups = [], isLoading, isError, refetch, isFetching } = useAllBackups();
  const { data: licenses = [] } = useLicenses();
  const { data: counts = {} } = useBackupCounts();
  const { data: overview } = useOverview();
  const del = useDeleteBackup();

  const [q, setQ] = useState('');
  const [fmt, setFmt] = useState<'all' | 'zip' | 'db'>('all');
  const now = Date.now();

  const isZip = (b: StoreBackup) => b.format === 'zip' || b.originalName.toLowerCase().endsWith('.zip');

  /* Coverage: one row per license, worst first */
  const coverage = useMemo(() => {
    const lastById = new Map((overview?.stores || []).map((s) => [s.id, s.lastBackupAt]));
    const sizeById = new Map<string, number>();
    for (const b of backups) sizeById.set(b.licenseId, (sizeById.get(b.licenseId) || 0) + (b.fileSize || 0));
    const rank: Record<Freshness, number> = { never: 0, stale: 1, ok: 2, fresh: 3, idle: 4 };
    return licenses
      .filter((l) => licenseStatus(l, now) === 'active')
      .map((l) => {
        const lastAt = lastById.get(l.id) ?? null;
        const f = freshness(lastAt, (l.activeDevices?.length || 0) > 0, now);
        return { lic: l, lastAt, f, count: counts[l.id] || 0, bytes: sizeById.get(l.id) || 0 };
      })
      .sort((a, b) => rank[a.f] - rank[b.f] || a.lic.userName.localeCompare(b.lic.userName));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [licenses, overview, counts, backups]);

  const covered = coverage.filter((c) => c.f === 'fresh' || c.f === 'ok').length;
  const needing = coverage.filter((c) => c.f !== 'idle').length;
  const totalBytes = backups.reduce((s, b) => s + (b.fileSize || 0), 0);
  const last7 = backups.filter((b) => now - new Date(b.createdAt).getTime() <= 7 * DAY).length;

  /* Snapshots: filtered + grouped by day */
  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = backups.filter((b) => {
      if (fmt === 'zip' && !isZip(b)) return false;
      if (fmt === 'db' && isZip(b)) return false;
      if (!needle) return true;
      return (
        b.storeName.toLowerCase().includes(needle) ||
        b.originalName.toLowerCase().includes(needle) ||
        (b.deviceName || '').toLowerCase().includes(needle) ||
        b.licenseKey.toLowerCase().includes(needle)
      );
    });
    const out: { label: string; items: StoreBackup[] }[] = [];
    for (const b of list) {
      const label = dayLabel(b.createdAt, now);
      const last = out[out.length - 1];
      if (last && last.label === label) last.items.push(b);
      else out.push({ label, items: [b] });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backups, q, fmt]);

  const shownCount = groups.reduce((s, g) => s + g.items.length, 0);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1320px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
        <header className="rise flex items-end justify-between gap-4 flex-wrap">
          <div>
            <span className="eyebrow">Data safety</span>
            <h1 className="text-[28px] sm:text-[32px] leading-none font-medium tracking-[-0.035em] text-fg m-0 mt-2.5">Backups</h1>
          </div>
          <button type="button" onClick={() => refetch()} disabled={isFetching} className="btn btn-ghost btn-sm">
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </header>

        {/* Stat strip */}
        <section className="panel rise grid grid-cols-2 lg:grid-cols-4 divide-line [&>*]:border-line" style={{ animationDelay: '40ms' }}>
          {[
            { label: 'Coverage', value: <>{covered}<span className="text-faint text-[18px]">/{needing}</span></>, foot: `live stores backed up ≤ ${BACKUP_STALE_DAYS}d` },
            { label: 'Snapshots', value: backups.length, foot: 'kept across all stores' },
            { label: 'Last 7 days', value: last7, foot: 'new snapshots received' },
            { label: 'Storage', value: formatBytes(totalBytes), foot: 'in Neon PostgreSQL' },
          ].map((s, i) => (
            <div
              key={s.label}
              className={`p-4 sm:p-5 ${i % 2 === 1 ? 'border-l' : ''} ${i >= 2 ? 'border-t lg:border-t-0' : ''} ${i === 2 ? 'lg:border-l' : ''}`}
            >
              <span className="eyebrow">{s.label}</span>
              <div className="num text-[26px] sm:text-[30px] leading-none font-medium tracking-[-0.04em] text-fg mt-4">
                {isLoading ? <span className="skeleton inline-block w-14 h-7 align-middle" /> : s.value}
              </div>
              <div className="text-[11.5px] text-muted mt-2">{s.foot}</div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] gap-4 items-start">
          {/* Coverage */}
          <div className="panel rise overflow-hidden" style={{ animationDelay: '80ms' }}>
            <div className="px-5 h-14 flex items-center justify-between border-b border-line">
              <h2 className="text-[14px] font-medium text-fg m-0 tracking-tight">Coverage by store</h2>
              <span className="eyebrow text-faint">active only</span>
            </div>
            {coverage.length === 0 ? (
              <p className="text-[12.5px] text-faint m-0 px-5 py-10 text-center">No active licenses.</p>
            ) : (
              <ul className="m-0 p-0 list-none divide-y divide-line">
                {coverage.map((c) => {
                  const meta = FRESH_META[c.f];
                  return (
                    <li key={c.lic.id}>
                      <Link
                        to={`/licenses/${c.lic.id}?tab=backups`}
                        className="group flex items-center gap-3 px-5 py-3 no-underline hover:bg-surface-2 transition-colors"
                      >
                        <span className={`w-1 self-stretch rounded-full ${meta.bar}`} />
                        <span className="flex-1 min-w-0">
                          <span className="block text-[13px] font-medium text-fg truncate">{c.lic.userName}</span>
                          <span className="block font-mono text-[11px] text-faint">
                            {c.count} snap · {formatBytes(c.bytes)}
                          </span>
                        </span>
                        <span className="text-right shrink-0">
                          <span className={`block text-[12px] font-medium ${meta.tone}`}>{meta.label}</span>
                          <span className="block font-mono text-[11px] text-faint">{c.lastAt ? timeAgo(c.lastAt, now) : '—'}</span>
                        </span>
                        <ChevronRight className="w-4 h-4 text-faint group-hover:text-fg transition-colors" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Snapshots */}
          <div className="panel rise overflow-hidden" style={{ animationDelay: '120ms' }}>
            <div className="px-4 sm:px-5 py-3 flex items-center gap-2 flex-wrap border-b border-line">
              <h2 className="text-[14px] font-medium text-fg m-0 tracking-tight mr-auto">All snapshots</h2>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-faint pointer-events-none" />
                <input
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Store, file, device…"
                  className="input h-8 pl-8 w-48 text-[12.5px]"
                  aria-label="Filter snapshots"
                />
              </div>
              <div className="flex p-[3px] rounded-[9px] bg-surface-2 border border-line" role="group" aria-label="Format">
                {(['all', 'zip', 'db'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={fmt === f}
                    onClick={() => setFmt(f)}
                    className={`h-6 px-2.5 rounded-[6px] font-mono text-[10.5px] uppercase tracking-[0.08em] border-0 cursor-pointer ${
                      fmt === f ? 'bg-surface-3 text-fg shadow-[0_0_0_1px_var(--line-strong)]' : 'bg-transparent text-faint hover:text-muted'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="p-5 space-y-3">{[0, 1, 2, 3].map((i) => <span key={i} className="skeleton block h-11" />)}</div>
            ) : isError ? (
              <div className="py-14 text-center">
                <AlertTriangle className="w-5 h-5 text-warn mx-auto mb-2" />
                <p className="text-[13px] text-fg m-0">Couldn’t load backups</p>
                <button type="button" className="btn btn-sm mt-4" onClick={() => refetch()}>Try again</button>
              </div>
            ) : shownCount === 0 ? (
              <div className="py-14 text-center">
                <Database className="w-5 h-5 text-faint mx-auto mb-2" />
                <p className="text-[13px] text-fg m-0">{backups.length === 0 ? 'No backups yet' : 'No snapshots match'}</p>
                <p className="text-[12px] text-muted mt-1 mb-0">
                  {backups.length === 0 ? 'Day-close backups from POS terminals land here automatically.' : 'Try a different filter.'}
                </p>
              </div>
            ) : (
              <div className="max-h-[640px] overflow-y-auto">
                {groups.map((g) => (
                  <div key={g.label}>
                    <div className="sticky top-0 z-[1] px-5 h-8 flex items-center justify-between bg-surface-2/95 backdrop-blur border-b border-line">
                      <span className="eyebrow text-faint">{g.label}</span>
                      <span className="font-mono text-[10.5px] text-faint">
                        {g.items.length} · {formatBytes(g.items.reduce((s, b) => s + (b.fileSize || 0), 0))}
                      </span>
                    </div>
                    <ul className="m-0 p-0 list-none divide-y divide-line">
                      {g.items.map((b) => {
                        const zip = isZip(b);
                        return (
                          <li key={b.id} className="group flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-surface-2 transition-colors">
                            <span className="w-8 h-8 rounded-[8px] bg-surface-2 border border-line flex items-center justify-center shrink-0">
                              {zip ? <FileArchive className="w-3.5 h-3.5 text-accent-ink" /> : <Database className="w-3.5 h-3.5 text-muted" />}
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className="flex items-center gap-2 min-w-0">
                                <Link to={`/licenses/${b.licenseId}?tab=backups`} className="text-[13px] font-medium text-fg truncate no-underline hover:text-accent-ink">
                                  {b.storeName}
                                </Link>
                                <span className="font-mono text-[11px] text-faint shrink-0">{new Date(b.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                              </span>
                              <span className="block font-mono text-[11px] text-faint truncate" title={b.originalName}>
                                {b.originalName}
                              </span>
                            </span>
                            <span className="hidden sm:block text-right shrink-0 w-28">
                              <span className="block num text-[12px] text-fg">{formatBytes(b.fileSize)}</span>
                              <span className="block text-[11px] text-faint truncate">{b.deviceName || 'Terminal'}</span>
                            </span>
                            <a
                              href={backupDownloadUrl(b.licenseId, b.id)}
                              download={b.originalName}
                              className="btn btn-sm btn-icon btn-ghost w-8 h-8"
                              aria-label={`Download ${b.originalName}`}
                              title="Download"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Permanently delete "${b.originalName}" from ${b.storeName}? This cannot be undone.`)) {
                                  del.mutate({ licenseId: b.licenseId, backupId: b.id });
                                }
                              }}
                              className="btn btn-sm btn-icon btn-ghost btn-danger w-8 h-8 opacity-50 group-hover:opacity-100"
                              aria-label={`Delete ${b.originalName}`}
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
