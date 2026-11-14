import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutGrid, KeyRound, Plus, SunMoon, CornerDownLeft, Store } from 'lucide-react';
import { useOverview } from '../lib/api';
import { useTheme } from '../context/ThemeContext';

interface PaletteItem {
  id: string;
  group: 'Stores' | 'Commands';
  label: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  run: () => void;
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const { data } = useOverview();
  const [q, setQ] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQ('');
      setCursor(0);
    }
  }, [open]);

  const items = useMemo<PaletteItem[]>(() => {
    const go = (path: string) => () => { navigate(path); onClose(); };
    const commands: PaletteItem[] = [
      { id: 'c-new', group: 'Commands', label: 'Issue new license', icon: Plus, run: go('/licenses?new=1') },
      { id: 'c-ov', group: 'Commands', label: 'Go to Overview', icon: LayoutGrid, run: go('/') },
      { id: 'c-li', group: 'Commands', label: 'Go to Licenses', icon: KeyRound, run: go('/licenses') },
      { id: 'c-th', group: 'Commands', label: 'Toggle theme', icon: SunMoon, run: () => { toggleTheme(); onClose(); } },
    ];
    const stores: PaletteItem[] = (data?.stores || []).map((s) => ({
      id: `s-${s.id}`,
      group: 'Stores',
      label: s.name,
      hint: s.key,
      icon: Store,
      run: go(`/licenses?q=${encodeURIComponent(s.key)}`),
    }));
    const needle = q.trim().toLowerCase();
    const all = [...stores, ...commands];
    if (!needle) return [...stores.slice(0, 6), ...commands];
    return all.filter((i) => i.label.toLowerCase().includes(needle) || i.hint?.toLowerCase().includes(needle));
  }, [data, q, navigate, onClose, toggleTheme]);

  useEffect(() => { setCursor(0); }, [q]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${cursor}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  if (!open) return null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, items.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); items[cursor]?.run(); }
    else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
  };

  let lastGroup = '';
  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-start justify-center px-4 pt-[12vh]"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="panel rise w-full max-w-lg overflow-hidden" role="dialog" aria-modal="true" aria-label="Command palette" onKeyDown={onKeyDown}>
        <div className="flex items-center gap-3 px-4 h-12 border-b border-line">
          <Search className="w-4 h-4 text-faint shrink-0" />
          <input
            ref={inputRef}
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search stores, keys, commands…"
            className="flex-1 bg-transparent border-0 outline-none text-[14px] text-fg placeholder:text-faint"
            aria-label="Search"
          />
          <kbd className="font-mono text-[10.5px] px-1.5 h-5 leading-5 rounded-[5px] border border-line text-faint">esc</kbd>
        </div>

        <div ref={listRef} className="max-h-[50vh] overflow-y-auto p-1.5">
          {items.length === 0 && <div className="px-3 py-8 text-center text-[12.5px] text-muted">No results for “{q}”</div>}
          {items.map((item, idx) => {
            const header = item.group !== lastGroup ? item.group : null;
            lastGroup = item.group;
            const active = idx === cursor;
            return (
              <React.Fragment key={item.id}>
                {header && <div className="eyebrow text-faint px-2.5 pt-2.5 pb-1.5">{header}</div>}
                <button
                  type="button"
                  data-idx={idx}
                  onMouseMove={() => setCursor(idx)}
                  onClick={item.run}
                  className={`w-full flex items-center gap-3 h-10 px-2.5 rounded-[8px] text-left cursor-pointer border-0 transition-colors ${
                    active ? 'bg-surface-3 text-fg' : 'bg-transparent text-muted'
                  }`}
                >
                  <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-accent-ink' : 'text-faint'}`} />
                  <span className="flex-1 text-[13px] truncate">{item.label}</span>
                  {item.hint && <span className="font-mono text-[11px] text-faint">{item.hint}</span>}
                  {active && <CornerDownLeft className="w-3.5 h-3.5 text-faint" />}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
