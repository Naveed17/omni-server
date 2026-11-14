import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, KeyRound, Archive, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: LayoutGrid },
  { to: '/licenses', label: 'Licenses', icon: KeyRound },
  { to: '/backups', label: 'Backups', icon: Archive },
];

export function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <div
      className="rounded-[9px] bg-fg flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 20 20" style={{ width: size / 2, height: size / 2 }} aria-hidden>
        <circle cx="10" cy="10" r="6.25" fill="none" stroke="var(--bg)" strokeWidth="2" />
        <circle cx="10" cy="10" r="2.25" fill="var(--accent)" />
      </svg>
    </div>
  );
}

function RailTip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-[7px] bg-fg text-bg text-[11.5px] font-medium px-2 py-1 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 transition-all duration-150 z-50">
      {label}
    </span>
  );
}

/** Slim icon rail (md and up). */
export function Sidebar() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <aside className="hidden md:flex w-[64px] flex-col items-center h-screen shrink-0 relative z-30 border-r border-line bg-[color-mix(in_srgb,var(--surface)_70%,transparent)] backdrop-blur-xl">
      <div className="h-14 w-full flex items-center justify-center border-b border-line">
        <BrandMark />
      </div>

      <nav className="flex-1 flex flex-col items-center gap-1.5 py-4" aria-label="Main">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            aria-label={item.label}
            className={({ isActive }) =>
              `group relative w-10 h-10 rounded-[10px] flex items-center justify-center transition-colors ${
                isActive ? 'bg-surface-3 text-fg' : 'text-faint hover:text-fg hover:bg-surface-2'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`absolute -left-3 top-2.5 bottom-2.5 w-[2px] rounded-r-full ${isActive ? 'bg-accent' : 'bg-transparent'}`}
                />
                <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-accent-ink' : ''}`} />
                <RailTip label={item.label} />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="pb-4">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          className="group relative w-10 h-10 rounded-[10px] flex items-center justify-center text-faint hover:text-fg hover:bg-surface-2 border-0 bg-transparent cursor-pointer transition-colors"
        >
          {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          <RailTip label={isDark ? 'Light theme' : 'Dark theme'} />
        </button>
      </div>
    </aside>
  );
}

/** Bottom tab bar below md. */
export function MobileTabs() {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-30 h-14 border-t border-line bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] backdrop-blur-xl flex"
      aria-label="Main"
    >
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-1 text-[10.5px] no-underline ${
              isActive ? 'text-fg' : 'text-faint'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-accent-ink' : ''}`} />
              {item.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
