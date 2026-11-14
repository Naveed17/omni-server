import React from 'react';

/* Shared primitives for the Obsidian design system. */

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 overflow-y-auto h-full">
      <div className="max-w-[1320px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-6 lg:py-10 space-y-8">
        {children}
      </div>
    </div>
  );
}

export function PageHeader({
  index,
  section,
  title,
  subtitle,
  status,
  actions,
}: {
  index: string;
  section: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  status?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="rise flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between border-b border-line pb-7">
      <div className="min-w-0">
        <div className="flex items-center gap-3 mb-3">
          <span className="eyebrow">
            <span className="text-accent-ink">{index}</span>
            <span className="mx-2 text-faint">/</span>
            {section}
          </span>
          {status}
        </div>
        <h1 className="text-[28px] sm:text-[34px] leading-[1.05] font-medium tracking-[-0.035em] text-fg m-0">
          {title}
        </h1>
        {subtitle && <p className="text-[13.5px] text-muted mt-2.5 m-0 max-w-2xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap shrink-0">{actions}</div>}
    </header>
  );
}

export function LiveChip({ label, tone = 'ok' }: { label: string; tone?: 'ok' | 'accent' | 'bad' }) {
  const toneClass = tone === 'ok' ? 'chip-ok' : tone === 'bad' ? 'chip-bad' : 'chip-accent';
  return (
    <span className={`chip ${toneClass}`}>
      <span className={`dot ${tone !== 'bad' ? 'dot-live' : ''}`} />
      {label}
    </span>
  );
}

export function StatTile({
  label,
  value,
  meta,
  icon: Icon,
  loading,
  delay = 0,
}: {
  label: string;
  value: React.ReactNode;
  meta?: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  delay?: number;
}) {
  return (
    <div className="panel ticks rise p-5 flex flex-col gap-6 group" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between">
        <span className="eyebrow">{label}</span>
        <Icon className="w-4 h-4 text-faint group-hover:text-accent-ink transition-colors" />
      </div>
      <div>
        <div className="text-[30px] leading-none font-medium tracking-[-0.04em] text-fg num">
          {loading ? <span className="skeleton inline-block w-16 h-7 align-middle" /> : value}
        </div>
        {meta && <div className="text-[12px] text-muted mt-2.5 truncate">{meta}</div>}
      </div>
    </div>
  );
}

export function SectionTitle({
  icon: Icon,
  title,
  hint,
  right,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  hint?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-3.5 h-3.5 text-accent-ink" />}
          <h2 className="text-[13.5px] font-medium text-fg m-0 tracking-tight">{title}</h2>
        </div>
        {hint && <p className="text-[12px] text-muted mt-1 m-0">{hint}</p>}
      </div>
      {right}
    </div>
  );
}
