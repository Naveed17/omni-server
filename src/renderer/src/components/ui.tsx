import React from 'react';

/* Shared primitives for the Obsidian design system. */

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 overflow-y-auto h-full">
      <div className="max-w-[1320px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
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
