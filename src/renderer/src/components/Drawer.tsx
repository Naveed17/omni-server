import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/** Right-hand slide-over panel. Closes on Esc and backdrop click. */
export function Drawer({
  open,
  onClose,
  label,
  header,
  footer,
  children,
  width = 560,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  header: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  width?: number;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] drawer-fade" onMouseDown={onClose} />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="drawer-slide relative h-full w-full flex flex-col bg-surface border-l border-line-strong shadow-2xl outline-none"
        style={{ maxWidth: width }}
      >
        <div className="shrink-0 border-b border-line">
          <div className="flex items-start gap-3 px-5 sm:px-6 pt-5 pb-4">
            <div className="flex-1 min-w-0">{header}</div>
            <button type="button" onClick={onClose} className="btn btn-icon btn-ghost -mr-2" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="shrink-0 border-t border-line px-5 sm:px-6 py-3.5">{footer}</div>}
      </div>
    </div>
  );
}

/** Underline tab strip used inside drawers. */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { key: T; label: string; count?: number }[];
  value: T;
  onChange: (k: T) => void;
}) {
  return (
    <div className="flex gap-5 px-5 sm:px-6 border-b border-line overflow-x-auto overflow-y-hidden" role="tablist">
      {tabs.map((t) => {
        const on = t.key === value;
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(t.key)}
            className={`relative h-11 flex items-center gap-1.5 text-[12.5px] font-medium whitespace-nowrap bg-transparent border-0 cursor-pointer transition-colors ${
              on ? 'text-fg' : 'text-faint hover:text-muted'
            }`}
          >
            {t.label}
            {t.count !== undefined && <span className="num text-[11px] text-faint">{t.count}</span>}
            <span className={`absolute left-0 right-0 -bottom-px h-[2px] rounded-full ${on ? 'bg-accent' : 'bg-transparent'}`} />
          </button>
        );
      })}
    </div>
  );
}
