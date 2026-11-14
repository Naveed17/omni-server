import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ArrowUp, ArrowDown, RefreshCw, AlertTriangle } from 'lucide-react';
import { useOverview, timeAgo } from '../../lib/api';
import {
  useLicenses, useBackupCounts, licenseStatus, MODULES, PLAN_LABEL,
  type LicenseRecord, type LicenseStatus,
} from '../../lib/licenses';
import { BACKUP_STALE_DAYS } from '@common/overview';
import { StatusChip, expiryInfo } from './shared';
import { CreateLicenseDrawer } from './CreateLicenseDrawer';

type Filter = 'all' | LicenseStatus;
type SortKey = 'name' | 'expires' | 'terminals' | 'backup';

const DAY = 86_400_000;

interface Row {
  lic: LicenseRecord;
  status: LicenseStatus;
  used: number;
  modulesOn: number;
  lastBackupAt: string | null;
  backups: number;
}

function SortHeader({
  label, k, sort, setSort, className = '',
}: {
  label: string; k: SortKey; sort: { key: SortKey; dir: 1 | -1 }; setSort: (s: { key: SortKey; dir: 1 | -1 }) => void; className?: string;
}) {
  const on = sort.key === k;
  return (
    <button
      type="button"
      onClick={() => setSort({ key: k, dir: on ? (sort.dir === 1 ? -1 : 1) : 1 })}
      className={`eyebrow inline-flex items-center gap-1 bg-transparent border-0 p-0 cursor-pointer hover:text-fg ${on ? 'text-fg' : 'text-faint'} ${className}`}
    >
      {label}
      {on && (sort.dir === 1 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
    </button>
  );
}

const GRID = 'md:grid md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.3fr)_minmax(0,1fr)_96px_80px_minmax(0,0.9fr)_96px] md:items-center md:gap-4';

export default function LicensesPage() {
  const [params, setParams] = useSearchParams();
  const { data: licenses = [], isLoading, isError, refetch, isFetching } = useLicenses();
  const { data: counts = {} } = useBackupCounts();
  const { data: overview } = useOverview();

  const [search, setSearch] = useState(() => params.get('q') || '');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'name', dir: 1 });
  const [creating, setCreating] = useState(() => params.get('new') === '1');

  // Deep links: ?q=<text>, ?new=1
  useEffect(() => {
    const q = params.get('q');
    const isNew = params.get('new') === '1';
    if (q !== null) setSearch(q);
    if (isNew) setCreating(true);
    if (q !== null || isNew) setParams({}, { replace: true });
  }, [params, setParams]);

  const now = Date.now();
  const lastBackupById = useMemo(
    () => new Map((overview?.stores || []).map((s) => [s.id, s.lastBackupAt])),
    [overview],
  );

  const rows: Row[] = useMemo(
    () =>
      licenses.map((lic) => ({
        lic,
        status: licenseStatus(lic, now),
        used: lic.activeDevices?.length || 0,
        modulesOn: MODULES.filter((m) => lic.modules?.[m.key]).length,
        lastBackupAt: lastBackupById.get(lic.id) ?? null,
        backups: counts[lic.id] || 0,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [licenses, counts, lastBackupById],
  );

  const tally = useMemo(() => {
    const t = { all: rows.length, active: 0, suspended: 0, expired: 0 };
    rows.forEach((r) => t[r.status]++);
    return t;
  }, [rows]);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = rows.filter((r) => {
      if (filter !== 'all' && r.status !== filter) return false;
      if (!q) return true;
      return (
        r.lic.userName.toLowerCase().includes(q) ||
        r.lic.key.toLowerCase().includes(q) ||
        (r.lic.whatsappNumber || '').toLowerCase().includes(q)
      );
    });
    const val = (r: Row): string | number => {
      switch (sort.key) {
        case 'name': return r.lic.userName.toLowerCase();
        case 'expires': return r.lic.expiresAt ? new Date(r.lic.expiresAt).getTime() : Number.MAX_SAFE_INTEGER;
        case 'terminals': return r.used / (r.lic.maxDevices || 1);
        case 'backup': return r.lastBackupAt ? new Date(r.lastBackupAt).getTime() : 0;
      }
    };
    return [...list].sort((a, b) => (val(a) > val(b) ? 1 : val(a) < val(b) ? -1 : 0) * sort.dir);
  }, [rows, search, filter, sort]);


  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1320px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-5">
        <header className="rise flex items-end justify-between gap-4 flex-wrap">
          <div>
            <span className="eyebrow">Client management</span>
            <h1 className="text-[28px] sm:text-[32px] leading-none font-medium tracking-[-0.035em] text-fg m-0 mt-2.5">
              Licenses
            </h1>
          </div>
          <button type="button" onClick={() => refetch()} disabled={isFetching} className="btn btn-ghost btn-sm">
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </header>

        {/* Toolbar */}
        <div className="rise flex items-center gap-2 flex-wrap" style={{ animationDelay: '40ms' }}>
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-faint pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by store, key or phone…"
              className="input pl-9"
              aria-label="Filter licenses"
            />
          </div>
          <div className="flex p-[3px] rounded-[10px] bg-surface-2 border border-line overflow-x-auto" role="group" aria-label="Status">
            {(['all', 'active', 'suspended', 'expired'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`h-7 px-3 rounded-[7px] text-[12px] cursor-pointer capitalize border-0 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  filter === f ? 'bg-surface-3 text-fg shadow-[0_0_0_1px_var(--line-strong)]' : 'bg-transparent text-faint hover:text-muted'
                }`}
              >
                {f}
                <span className="num text-[10.5px] text-faint">{tally[f]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="panel rise overflow-hidden" style={{ animationDelay: '80ms' }}>
          <div className={`hidden ${GRID} px-5 h-10 border-b border-line`}>
            <SortHeader label="Store" k="name" sort={sort} setSort={setSort} />
            <span className="eyebrow text-faint">Key</span>
            <SortHeader label="Expires" k="expires" sort={sort} setSort={setSort} />
            <SortHeader label="Terminals" k="terminals" sort={sort} setSort={setSort} />
            <span className="eyebrow text-faint">Modules</span>
            <SortHeader label="Last backup" k="backup" sort={sort} setSort={setSort} />
            <span className="eyebrow text-faint text-right">Status</span>
          </div>

          {isLoading ? (
            <div className="divide-y divide-line">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="px-5 py-4 flex items-center gap-3">
                  <span className="skeleton w-9 h-9 rounded-[9px]" />
                  <span className="skeleton h-3 w-40" />
                  <span className="skeleton h-3 w-28 ml-auto" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="py-14 text-center">
              <AlertTriangle className="w-5 h-5 text-warn mx-auto mb-2" />
              <p className="text-[13px] text-fg m-0">Couldn’t load licenses</p>
              <button type="button" className="btn btn-sm mt-4" onClick={() => refetch()}>Try again</button>
            </div>
          ) : shown.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-[13px] text-fg m-0">{licenses.length === 0 ? 'No licenses yet' : 'No licenses match'}</p>
              <p className="text-[12px] text-muted mt-1 mb-0">
                {licenses.length === 0 ? 'Issue the first key to bring a store online.' : 'Try a different search or status.'}
              </p>
              {licenses.length === 0 && (
                <button type="button" className="btn btn-primary mt-5" onClick={() => setCreating(true)}>Issue license</button>
              )}
            </div>
          ) : (
            <ul className="m-0 p-0 list-none divide-y divide-line">
              {shown.map((r) => {
                const exp = expiryInfo(r.lic.expiresAt, now);
                const full = r.used >= (r.lic.maxDevices || 1);
                const backupStale =
                  r.status === 'active' && r.used > 0 &&
                  (!r.lastBackupAt || now - new Date(r.lastBackupAt).getTime() > BACKUP_STALE_DAYS * DAY);
                return (
                  <li key={r.lic.id}>
                    <Link
                      to={`/licenses/${r.lic.id}`}
                      className={`w-full text-left no-underline px-5 py-3.5 transition-colors flex flex-col gap-2 hover:bg-surface-2 ${GRID} ${
                        r.status !== 'active' ? 'opacity-75' : ''
                      }`}
                    >
                      {/* Store */}
                      <span className="flex items-center gap-3 min-w-0">
                        <span className="w-9 h-9 rounded-[9px] bg-surface-3 border border-line flex items-center justify-center font-mono text-[11px] text-muted shrink-0">
                          {r.lic.userName.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-medium text-fg truncate">{r.lic.userName}</span>
                          <span className="block text-[11.5px] text-faint truncate">
                            {PLAN_LABEL[r.lic.licenseType] || r.lic.licenseType} · {r.lic.whatsappNumber || 'No phone'}
                          </span>
                        </span>
                        <span className="md:hidden"><StatusChip status={r.status} /></span>
                      </span>

                      {/* Key */}
                      <span className="font-mono text-[11.5px] text-muted truncate pl-12 md:pl-0">{r.lic.key}</span>

                      {/* Expires */}
                      <span className="hidden md:block min-w-0">
                        <span className={`block text-[12.5px] ${exp.tone}`}>{exp.label}</span>
                        <span className="block font-mono text-[10.5px] text-faint truncate">{exp.sub}</span>
                      </span>

                      {/* Terminals */}
                      <span className="hidden md:flex flex-col gap-1.5">
                        <span className={`num text-[12.5px] ${full ? 'text-warn' : 'text-fg'}`}>
                          {r.used}<span className="text-faint">/{r.lic.maxDevices}</span>
                        </span>
                        <span className="h-1 rounded-full bg-surface-3 overflow-hidden">
                          <span
                            className={`block h-full rounded-full ${full ? 'bg-warn' : 'bg-accent'}`}
                            style={{ width: `${Math.min(100, (r.used / (r.lic.maxDevices || 1)) * 100)}%` }}
                          />
                        </span>
                      </span>

                      {/* Modules */}
                      <span className="hidden md:block num text-[12.5px] text-fg">
                        {r.modulesOn}<span className="text-faint">/{MODULES.length}</span>
                      </span>

                      {/* Backup */}
                      <span className="hidden md:block min-w-0">
                        <span className={`block text-[12.5px] ${backupStale ? 'text-warn' : 'text-fg'}`}>
                          {r.lastBackupAt ? timeAgo(r.lastBackupAt, now) : 'Never'}
                        </span>
                        <span className="block font-mono text-[10.5px] text-faint">{r.backups} stored</span>
                      </span>

                      {/* Status */}
                      <span className="hidden md:flex justify-end"><StatusChip status={r.status} /></span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {!isLoading && shown.length > 0 && (
          <p className="font-mono text-[11px] text-faint m-0">
            Showing {shown.length} of {licenses.length}
          </p>
        )}
      </div>

      <CreateLicenseDrawer
        open={creating}
        onClose={() => setCreating(false)}
      />
    </div>
  );
}
