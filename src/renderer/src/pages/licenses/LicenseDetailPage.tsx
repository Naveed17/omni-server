import React from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Power, MessageCircle, AlertTriangle } from 'lucide-react';
import { Tabs } from '../../components/Drawer';
import { timeAgo, useOverview } from '../../lib/api';
import {
  MODULES, PLAN_LABEL, PROFILE_BY_KEY, licenseStatus, useBackupCounts, useLicenseActions, useLicenses,
} from '../../lib/licenses';
import { StatusChip, expiryInfo, formatDate } from './shared';
import { BackupsSection, CopyKey, Field, ModulesSection, TerminalsSection } from './sections';

type TabKey = 'terminals' | 'modules' | 'backups';
const TABS: TabKey[] = ['terminals', 'modules', 'backups'];

function Stat({
  label, value, sub, meter, tone = 'text-fg', onClick,
}: {
  label: string; value: React.ReactNode; sub: React.ReactNode; meter?: { value: number; className: string }; tone?: string; onClick?: () => void;
}) {
  const Comp: any = onClick ? 'button' : 'div';
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`p-4 sm:p-5 text-left bg-transparent border-0 ${onClick ? 'cursor-pointer hover:bg-surface-2 transition-colors' : ''}`}
    >
      <span className="eyebrow block">{label}</span>
      <span className={`block num text-[24px] sm:text-[26px] leading-none font-medium tracking-[-0.03em] mt-4 ${tone}`}>{value}</span>
      {meter && (
        <span className="block h-1 rounded-full bg-surface-3 overflow-hidden mt-3">
          <span className={`block h-full rounded-full ${meter.className}`} style={{ width: `${Math.min(100, meter.value * 100)}%` }} />
        </span>
      )}
      <span className="block text-[11.5px] text-muted mt-2 truncate">{sub}</span>
    </Comp>
  );
}

export default function LicenseDetailPage() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const { data: licenses = [], isLoading, isError, refetch } = useLicenses();
  const { data: counts = {} } = useBackupCounts();
  const { data: overview } = useOverview();
  const { toggleEnabled } = useLicenseActions();

  const tabParam = params.get('tab') as TabKey | null;
  const tab: TabKey = tabParam && TABS.includes(tabParam) ? tabParam : 'terminals';
  const setTab = (t: TabKey) => setParams(t === 'terminals' ? {} : { tab: t }, { replace: true });

  const lic = licenses.find((l) => l.id === id);

  const shell = (children: React.ReactNode) => (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1320px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
        <Link to="/licenses" className="rise inline-flex items-center gap-2 text-[12.5px] text-muted hover:text-fg no-underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Licenses
        </Link>
        {children}
      </div>
    </div>
  );

  if (isLoading) {
    return shell(
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <span className="skeleton w-14 h-14 rounded-[14px]" />
          <div className="space-y-2.5"><span className="skeleton block w-56 h-6" /><span className="skeleton block w-40 h-4" /></div>
        </div>
        <span className="skeleton block h-28 rounded-[14px]" />
        <span className="skeleton block h-80 rounded-[14px]" />
      </div>,
    );
  }

  if (isError || !lic) {
    return shell(
      <div className="panel py-16 text-center">
        <AlertTriangle className="w-6 h-6 text-warn mx-auto mb-3" />
        <p className="text-[14px] text-fg m-0">{isError ? 'Couldn’t load this license' : 'License not found'}</p>
        <p className="text-[12.5px] text-muted mt-1 mb-5">
          {isError ? 'The provider API didn’t respond.' : 'It may have been removed, or the link is wrong.'}
        </p>
        {isError ? (
          <button type="button" className="btn" onClick={() => refetch()}>Try again</button>
        ) : (
          <Link to="/licenses" className="btn no-underline">Back to licenses</Link>
        )}
      </div>,
    );
  }

  const now = Date.now();
  const status = licenseStatus(lic, now);
  const exp = expiryInfo(lic.expiresAt, now);
  const used = lic.activeDevices?.length || 0;
  const modulesOn = MODULES.filter((m) => lic.modules?.[m.key]).length;
  const backups = counts[lic.id] || 0;
  const lastBackupAt = overview?.stores.find((s) => s.id === lic.id)?.lastBackupAt ?? null;
  const phoneDigits = (lic.whatsappNumber || '').replace(/[^\d]/g, '');
  const profiles = lic.businessProfiles || ['standard'];
  const full = used >= (lic.maxDevices || 1);

  return shell(
    <>
      {/* Header */}
      <header className="rise flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-4 min-w-0">
          <span className="w-14 h-14 rounded-[14px] bg-surface-3 border border-line flex items-center justify-center font-mono text-[15px] text-fg shrink-0">
            {lic.userName.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0 space-y-2.5">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-[26px] sm:text-[30px] leading-none font-medium tracking-[-0.035em] text-fg m-0 truncate">{lic.userName}</h1>
              <StatusChip status={status} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <CopyKey value={lic.key} />
              {profiles.map((p) => {
                const meta = PROFILE_BY_KEY.get(p);
                return (
                  <span key={p} className="chip normal-case tracking-normal font-sans text-[11.5px]">
                    <span className="dot" style={{ color: meta?.color || 'var(--faint)' }} />
                    {meta?.shortTag || p}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {phoneDigits && (
            <a href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noreferrer" className="btn no-underline">
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>
          )}
          <button
            type="button"
            onClick={() => toggleEnabled(lic).catch(() => {})}
            className={`btn ${lic.isEnabled ? 'btn-danger' : 'btn-primary'}`}
          >
            <Power className="w-3.5 h-3.5" />
            {lic.isEnabled ? 'Suspend' : 'Activate'}
          </button>
        </div>
      </header>

      {/* Stat strip */}
      <section
        className="panel rise grid grid-cols-2 lg:grid-cols-4 overflow-hidden [&>*]:border-line [&>*:nth-child(2n)]:border-l [&>*:nth-child(n+3)]:border-t lg:[&>*:nth-child(n+3)]:border-t-0 lg:[&>*:nth-child(3)]:border-l"
        style={{ animationDelay: '40ms' }}
      >
        <Stat label="Expires" value={exp.label} sub={`${PLAN_LABEL[lic.licenseType] || lic.licenseType} · ${exp.sub}`} tone={exp.tone} />
        <Stat
          label="Terminals"
          value={<>{used}<span className="text-faint text-[18px]">/{lic.maxDevices}</span></>}
          sub={full ? 'All seats in use' : `${lic.maxDevices - used} seat${lic.maxDevices - used === 1 ? '' : 's'} free`}
          meter={{ value: used / (lic.maxDevices || 1), className: full ? 'bg-warn' : 'bg-accent' }}
          onClick={() => setTab('terminals')}
        />
        <Stat
          label="Modules"
          value={<>{modulesOn}<span className="text-faint text-[18px]">/{MODULES.length}</span></>}
          sub={`${profiles.length} business profile${profiles.length === 1 ? '' : 's'}`}
          meter={{ value: modulesOn / MODULES.length, className: 'bg-fg/60' }}
          onClick={() => setTab('modules')}
        />
        <Stat
          label="Last backup"
          value={lastBackupAt ? timeAgo(lastBackupAt, now) : 'Never'}
          sub={`${backups} snapshot${backups === 1 ? '' : 's'} stored`}
          tone={!lastBackupAt && used > 0 ? 'text-bad' : 'text-fg'}
          onClick={() => setTab('backups')}
        />
      </section>

      {/* Body */}
      <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-4 items-start">
        <div className="panel rise overflow-hidden" style={{ animationDelay: '80ms' }}>
          <Tabs<TabKey>
            value={tab}
            onChange={setTab}
            tabs={[
              { key: 'terminals', label: 'Terminals', count: used },
              { key: 'modules', label: 'Modules & profiles', count: modulesOn },
              { key: 'backups', label: 'Backups', count: backups },
            ]}
          />
          {tab === 'terminals' && <TerminalsSection lic={lic} />}
          {tab === 'modules' && <ModulesSection lic={lic} />}
          {tab === 'backups' && <BackupsSection lic={lic} />}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6">
          <div className="panel ticks rise p-5" style={{ animationDelay: '120ms' }}>
            <h2 className="text-[13.5px] font-medium text-fg m-0 mb-2 tracking-tight">Details</h2>
            <dl className="m-0">
              <Field label="Plan">{PLAN_LABEL[lic.licenseType] || lic.licenseType}</Field>
              <Field label="Expires">
                <span className={exp.tone}>{exp.label}</span>
                <span className="block font-mono text-[11px] text-faint">{exp.sub}</span>
              </Field>
              <Field label="Contact">{lic.whatsappNumber || <span className="text-faint">No phone</span>}</Field>
              <Field label="Issued">{lic.createdAt ? formatDate(lic.createdAt) : '—'}</Field>
              <Field label="Seats">{lic.maxDevices}</Field>
              <Field label="ID"><span className="font-mono text-[11px] text-muted break-all">{lic.id}</span></Field>
            </dl>
          </div>

          <div className="panel rise p-5 space-y-2" style={{ animationDelay: '160ms' }}>
            <h2 className="text-[13.5px] font-medium text-fg m-0 tracking-tight">Access</h2>
            <p className="text-[12px] text-muted m-0 leading-relaxed">
              {status === 'expired'
                ? 'This license has expired. Terminals stay blocked until it is renewed.'
                : lic.isEnabled
                  ? 'Suspending blocks every terminal on this key at its next license check.'
                  : 'This license is suspended. Activating restores access on the next check.'}
            </p>
          </div>
        </aside>
      </section>
    </>,
  );
}
