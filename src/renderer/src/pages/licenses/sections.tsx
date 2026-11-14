import React, { useState } from 'react';
import {
  Copy, Check, Laptop, Trash2, UploadCloud, FileArchive, Database, Download, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatBytes, timeAgo } from '../../lib/api';
import {
  BUSINESS_PROFILES, MODULES, useBackupActions, useLicenseActions, useLicenseBackups,
  type LicenseRecord,
} from '../../lib/licenses';

export function CopyKey({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(value);
        setDone(true);
        toast.success('Key copied');
        setTimeout(() => setDone(false), 1800);
      }}
      className="group inline-flex items-center gap-2 h-7 pl-2.5 pr-2 rounded-[7px] bg-surface-2 border border-line hover:border-line-strong cursor-pointer font-mono text-[12px] text-fg tracking-wider"
      title="Copy license key"
    >
      {value}
      {done ? <Check className="w-3.5 h-3.5 text-ok" /> : <Copy className="w-3.5 h-3.5 text-faint group-hover:text-fg" />}
    </button>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-3 flex items-start justify-between gap-6 border-b border-line last:border-b-0">
      <dt className="eyebrow text-faint pt-0.5 shrink-0">{label}</dt>
      <dd className="m-0 text-[13px] text-fg text-right min-w-0">{children}</dd>
    </div>
  );
}

/* ── Sections (used by the license detail page) ───────────────────────── */

export function TerminalsSection({ lic }: { lic: LicenseRecord }) {
  const { unlinkDevice } = useLicenseActions();
  const used = lic.activeDevices?.length || 0;
  return (
    <div className="px-5 sm:px-6 py-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] text-muted">
          <span className="num text-fg">{used}</span> of <span className="num text-fg">{lic.maxDevices}</span> seats in use
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: Math.min(lic.maxDevices || 1, 24) }).map((_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i < used ? (used >= lic.maxDevices ? 'bg-warn' : 'bg-accent') : 'bg-surface-3'}`} />
        ))}
      </div>

      {used === 0 ? (
        <div className="py-10 text-center rounded-[10px] border border-dashed border-line">
          <Laptop className="w-5 h-5 text-faint mx-auto mb-2" />
          <p className="text-[13px] text-fg m-0">No terminals linked</p>
          <p className="text-[12px] text-muted mt-1 mb-0">A POS activates itself the first time it starts with this key.</p>
        </div>
      ) : (
        <ul className="m-0 p-0 list-none rounded-[10px] border border-line divide-y divide-line overflow-hidden">
          {lic.activeDevices.map((d) => (
            <li key={d.hwid} className="group flex items-center gap-3 px-3.5 py-3">
              <span className="w-8 h-8 rounded-[8px] bg-surface-2 border border-line flex items-center justify-center shrink-0">
                <Laptop className="w-3.5 h-3.5 text-muted" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[13px] text-fg truncate">{d.deviceName || 'Cashier PC'}</span>
                <span className="block font-mono text-[10.5px] text-faint truncate" title={d.hwid}>
                  {d.hwid} · {timeAgo(d.activatedAt)}
                </span>
              </span>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Unlink "${d.deviceName || d.hwid}"? It will need to re-activate.`)) unlinkDevice(lic, d.hwid).catch(() => {});
                }}
                className="btn btn-sm btn-icon btn-ghost btn-danger w-8 h-8 opacity-60 group-hover:opacity-100"
                aria-label={`Unlink ${d.deviceName}`}
                title="Unlink terminal"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ModulesSection({ lic }: { lic: LicenseRecord }) {
  const { setModules, setProfiles } = useLicenseActions();
  const profiles = lic.businessProfiles || ['standard'];

  const toggleProfile = (key: string) => {
    const next = profiles.includes(key) ? profiles.filter((k) => k !== key) : [...profiles, key];
    if (next.length === 0) return toast.error('Keep at least one business profile');
    setProfiles(lic, next).catch(() => {});
  };

  const setAll = (on: boolean) =>
    setModules(lic, Object.fromEntries(MODULES.map((m) => [m.key, on])), `All modules ${on ? 'enabled' : 'disabled'}`).catch(() => {});

  return (
    <div className="px-5 sm:px-6 py-5 space-y-7">
      <section>
        <div className="flex items-baseline justify-between gap-3 mb-3">
          <h3 className="text-[13px] font-medium text-fg m-0">Business profiles</h3>
          <span className="text-[11.5px] text-faint">{profiles.length === 1 ? 'Single · locks categories' : 'Multiple · filters categories'}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {BUSINESS_PROFILES.map((bp) => {
            const on = profiles.includes(bp.key);
            return (
              <button
                key={bp.key}
                type="button"
                aria-pressed={on}
                onClick={() => toggleProfile(bp.key)}
                title={bp.label}
                className={`flex items-center gap-2 h-7 px-2.5 rounded-[7px] text-[12px] cursor-pointer transition-colors border ${
                  on ? 'bg-surface-3 border-line-strong text-fg' : 'bg-transparent border-line text-faint hover:text-muted hover:border-line-strong'
                }`}
              >
                <span className="dot" style={{ color: on ? bp.color : 'var(--faint)' }} />
                {bp.shortTag}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-[13px] font-medium text-fg m-0">Modules</h3>
          <div className="flex gap-1">
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setAll(true)}>Enable all</button>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setAll(false)}>Disable all</button>
          </div>
        </div>
        <ul className="m-0 p-0 list-none grid grid-cols-1 md:grid-cols-2 gap-2">
          {MODULES.map((m) => {
            const on = lic.modules?.[m.key] === true;
            return (
              <li key={m.key}>
                <button
                  type="button"
                  role="switch"
                  aria-checked={on}
                  onClick={() =>
                    setModules(lic, { ...lic.modules, [m.key]: !on }, `${m.label} ${on ? 'disabled' : 'enabled'}`).catch(() => {})
                  }
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-[10px] border cursor-pointer text-left transition-colors ${on ? 'bg-surface-2 border-line-strong' : 'bg-transparent border-line hover:border-line-strong'}`}
                >
                  <m.icon className={`w-4 h-4 shrink-0 ${on ? 'text-accent-ink' : 'text-faint'}`} />
                  <span className="flex-1 min-w-0">
                    <span className={`block text-[13px] ${on ? 'text-fg' : 'text-muted'}`}>{m.label}</span>
                    <span className="block text-[11.5px] text-faint truncate">{m.desc}</span>
                  </span>
                  <span className="switch" data-on={on} aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

export function BackupsSection({ lic }: { lic: LicenseRecord }) {
  const { data: backups = [], isLoading } = useLicenseBackups(lic.id);
  const { upload, remove, downloadUrl } = useBackupActions(lic.id);
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const total = backups.reduce((s, b) => s + (b.fileSize || 0), 0);

  return (
    <div className="px-5 sm:px-6 py-5 space-y-6">
      <form
        className="well p-3.5 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!file) return;
          upload.mutate({ file, notes }, { onSuccess: () => { setFile(null); setNotes(''); } });
        }}
      >
        <label className="flex items-center gap-3 h-10 px-3 rounded-[9px] border border-dashed border-line-strong bg-surface cursor-pointer hover:border-faint transition-colors min-w-0">
          <UploadCloud className="w-4 h-4 text-faint shrink-0" />
          <span className={`flex-1 text-[12.5px] truncate ${file ? 'text-fg' : 'text-faint'}`}>
            {file ? `${file.name} · ${formatBytes(file.size)}` : 'Choose a .zip or .db backup…'}
          </span>
          <input
            type="file"
            accept=".zip,.db,.sqlite,.dbbackup"
            className="sr-only"
            disabled={upload.isPending}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>
        {file && (
          <div className="flex gap-2">
            <input
              className="input bg-surface"
              placeholder="Note (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={upload.isPending}
            />
            <button type="submit" className="btn btn-primary" disabled={upload.isPending}>
              {upload.isPending ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        )}
      </form>

      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-[13px] font-medium text-fg m-0">Snapshots</h3>
          <span className="font-mono text-[11px] text-faint">{formatBytes(total)} · keeps latest 3</span>
        </div>
        {isLoading ? (
          <div className="py-10 text-center text-[12px] text-muted flex items-center justify-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Loading…
          </div>
        ) : backups.length === 0 ? (
          <div className="py-10 text-center rounded-[10px] border border-dashed border-line">
            <Database className="w-5 h-5 text-faint mx-auto mb-2" />
            <p className="text-[13px] text-fg m-0">No backups yet</p>
            <p className="text-[12px] text-muted mt-1 mb-0">Day-close backups from the POS land here automatically.</p>
          </div>
        ) : (
          <ul className="m-0 p-0 list-none rounded-[10px] border border-line divide-y divide-line overflow-hidden">
            {backups.map((b) => {
              const isZip = b.format === 'zip' || b.originalName.toLowerCase().endsWith('.zip');
              return (
                <li key={b.id} className="group flex items-center gap-3 px-3.5 py-3">
                  <span className="w-8 h-8 rounded-[8px] bg-surface-2 border border-line flex items-center justify-center shrink-0">
                    {isZip ? <FileArchive className="w-3.5 h-3.5 text-accent-ink" /> : <Database className="w-3.5 h-3.5 text-muted" />}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-mono text-[12px] text-fg truncate" title={b.originalName}>{b.originalName}</span>
                    <span className="block text-[11px] text-faint truncate">
                      <span className="num text-muted">{formatBytes(b.fileSize)}</span> · {timeAgo(b.createdAt)} · {b.deviceName || 'Terminal'}
                      {b.notes ? ` · “${b.notes}”` : ''}
                    </span>
                  </span>
                  <a href={downloadUrl(b.id)} download={b.originalName} className="btn btn-sm btn-icon btn-ghost w-8 h-8" aria-label="Download backup" title="Download">
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => { if (confirm(`Permanently delete "${b.originalName}"? This cannot be undone.`)) remove.mutate(b.id); }}
                    className="btn btn-sm btn-icon btn-ghost btn-danger w-8 h-8 opacity-60 group-hover:opacity-100"
                    aria-label="Delete backup"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
