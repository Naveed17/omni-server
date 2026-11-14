import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, KeyRound, SlidersHorizontal, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutGrid, code: '01' },
  { to: '/licenses', label: 'Licenses', icon: KeyRound, code: '02', live: true },
  { to: '/settings', label: 'Server', icon: SlidersHorizontal, code: '03' },
];

function BrandMark() {
  return (
    <div className="relative w-8 h-8 rounded-[9px] bg-fg flex items-center justify-center shrink-0">
      <svg viewBox="0 0 20 20" className="w-4 h-4" aria-hidden>
        <circle cx="10" cy="10" r="6.25" fill="none" stroke="var(--bg)" strokeWidth="2" />
        <circle cx="10" cy="10" r="2.25" fill="var(--accent)" />
      </svg>
    </div>
  );
}

function ThemeSwitch() {
  const { isDark, setTheme } = useTheme();
  const opt = (on: boolean) =>
    `flex-1 h-7 rounded-[7px] flex items-center justify-center gap-1.5 text-[11px] cursor-pointer transition-colors border-0 ${
      on ? 'bg-surface-3 text-fg shadow-[0_0_0_1px_var(--line-strong)]' : 'bg-transparent text-faint hover:text-muted'
    }`;
  return (
    <div className="flex p-[3px] rounded-[10px] bg-surface-2 border border-line" role="group" aria-label="Theme">
      <button type="button" className={opt(isDark)} onClick={() => setTheme('dark')} aria-pressed={isDark}>
        <Moon className="w-3 h-3" /> Dark
      </button>
      <button type="button" className={opt(!isDark)} onClick={() => setTheme('light')} aria-pressed={!isDark}>
        <Sun className="w-3 h-3" /> Light
      </button>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-[236px] flex-col h-screen shrink-0 relative z-20 border-r border-line bg-[color-mix(in_srgb,var(--surface)_70%,transparent)] backdrop-blur-xl">
      {/* Brand */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-line">
        <BrandMark />
        <div className="leading-none">
          <div className="text-[14px] font-semibold tracking-[-0.02em] text-fg">OmniPos</div>
          <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-faint mt-1">Cloud · Control</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 flex flex-col gap-0.5">
        <div className="eyebrow px-2.5 pb-3 text-faint">Navigate</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 h-9 px-2.5 rounded-[9px] text-[13px] no-underline transition-colors ${
                  isActive ? 'bg-surface-2 text-fg' : 'text-muted hover:text-fg hover:bg-surface-2/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`absolute -left-3 top-2 bottom-2 w-[2px] rounded-full transition-colors ${
                      isActive ? 'bg-accent' : 'bg-transparent'
                    }`}
                  />
                  <Icon className={`w-4 h-4 ${isActive ? 'text-accent-ink' : 'text-faint group-hover:text-muted'}`} />
                  <span className="flex-1 font-medium tracking-tight">{item.label}</span>
                  {item.live ? (
                    <span className="text-ok flex items-center">
                      <span className="dot dot-live" />
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] text-faint">{item.code}</span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* System status */}
      <div className="px-3 pb-4 space-y-3">
        <div className="well p-3 font-mono text-[10.5px] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-faint uppercase tracking-[0.12em]">System</span>
            <span className="flex items-center gap-1.5 text-ok">
              <span className="dot dot-live" /> nominal
            </span>
          </div>
          <div className="h-px bg-line" />
          <div className="flex justify-between"><span className="text-faint">api</span><span className="text-muted">nest · :4000</span></div>
          <div className="flex justify-between"><span className="text-faint">db</span><span className="text-muted">neon · pg</span></div>
        </div>
        <ThemeSwitch />
      </div>
    </aside>
  );
}

/* Compact top bar shown below the md breakpoint */
export function MobileNav() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <div className="md:hidden sticky top-0 z-30 border-b border-line bg-[color-mix(in_srgb,var(--surface)_85%,transparent)] backdrop-blur-xl">
      <div className="h-14 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <BrandMark />
          <span className="text-[14px] font-semibold tracking-[-0.02em]">OmniPos</span>
        </div>
        <button type="button" onClick={toggleTheme} className="btn btn-icon btn-ghost" aria-label="Toggle theme">
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
      <nav className="px-3 pb-2 flex gap-1 overflow-x-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `h-8 px-3 rounded-[8px] flex items-center gap-2 text-[12.5px] no-underline whitespace-nowrap ${
                isActive ? 'bg-surface-2 text-fg border border-line' : 'text-muted border border-transparent'
              }`
            }
          >
            <item.icon className="w-3.5 h-3.5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
