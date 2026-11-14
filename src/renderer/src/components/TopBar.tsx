import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { useHealth } from '../lib/api';
import { BrandMark } from './Sidebar';

function HealthPill() {
  const { data, isLoading } = useHealth();
  const online = data?.online ?? false;
  const tone = isLoading ? 'text-faint' : online ? 'text-ok' : 'text-bad';
  return (
    <span
      className="hidden sm:inline-flex items-center gap-2 h-8 px-2.5 rounded-[8px] border border-line bg-surface-2 font-mono text-[11px] text-muted"
      title={online ? 'Provider API reachable' : 'Provider API unreachable'}
    >
      <span className={`dot ${tone} ${online ? 'dot-live' : ''}`} />
      <span className="uppercase tracking-[0.1em]">API</span>
      <span className="text-fg num">
        {isLoading ? '…' : online && data?.latencyMs != null ? `${data.latencyMs}ms` : 'down'}
      </span>
    </span>
  );
}

export function TopBar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const navigate = useNavigate();
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <header className="h-14 shrink-0 border-b border-line bg-[color-mix(in_srgb,var(--bg)_70%,transparent)] backdrop-blur-xl relative z-20">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center gap-3">
        <div className="md:hidden">
          <BrandMark size={28} />
        </div>

        <button
          type="button"
          onClick={onOpenPalette}
          className="flex-1 max-w-md h-9 px-3 rounded-[9px] border border-line bg-surface-2 hover:border-line-strong text-faint flex items-center gap-2.5 cursor-pointer text-left transition-colors"
          aria-label="Search stores and commands"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1 text-[13px] truncate">Search stores, keys, commands…</span>
          <kbd className="hidden sm:inline font-mono text-[10.5px] px-1.5 h-5 leading-5 rounded-[5px] border border-line bg-surface text-muted">
            {isMac ? '⌘' : 'Ctrl'} K
          </kbd>
        </button>

        <div className="ml-auto flex items-center gap-2">
          <HealthPill />
          <button type="button" className="btn btn-primary" onClick={() => navigate('/licenses?new=1')}>
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span className="hidden sm:inline">New license</span>
          </button>
        </div>
      </div>
    </header>
  );
}
