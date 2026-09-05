import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, KeyRound, RefreshCw,
  Store, Settings, Server, Zap, Sun, Moon,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function Sidebar() {
  const { toggleTheme, isDark } = useTheme();

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/licenses', label: 'Store Licenses', icon: KeyRound, badge: 'Live' },
    { to: '/sync-feed', label: 'Live Sync Stream', icon: RefreshCw },
    { to: '/stores', label: 'Registered Stores', icon: Store },
    { to: '/settings', label: 'Server Config', icon: Settings },
  ];

  return (
    <aside className="w-[230px] flex flex-col h-screen shrink-0 relative z-20 bg-white/70 dark:bg-[#0A0E1A]/80 backdrop-blur-2xl border-r border-slate-200/80 dark:border-white/10 shadow-sm dark:shadow-[inset_-1px_0_0_rgba(255,255,255,0.04)] transition-colors duration-200">
      {/* Brand Header */}
      <div className="p-4 pb-4 border-b border-slate-200/60 dark:border-white/5 flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-xs tracking-tighter shadow-lg shadow-cyan-500/20 border border-white/20">
            OP
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-[#0A0E1A] shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">
              Omni<span className="text-cyan-600 dark:text-cyan-400">Pos</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/25 tracking-widest uppercase">
              Cloud
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5 tracking-wide">
            Provider Control Center
          </p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="p-3 flex-1 flex flex-col gap-1.5">
        <div className="text-[9px] font-black tracking-widest text-slate-400 dark:text-slate-500 px-2.5 pt-1 pb-1.5 uppercase flex items-center justify-between">
          <span>Main Console</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold no-underline transition-all duration-150 ${
                  isActive
                    ? 'bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)] font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/5 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-2.5">
                    {/* Active Pip Indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                    )}
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-cyan-500 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 tracking-wide flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Theme Mode Toggle Button */}
      <div className="mx-3 mb-2.5">
        <button
          type="button"
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all duration-150 bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-white/10"
        >
          <div className="flex items-center gap-2 text-xs font-bold">
            {isDark ? (
              <Moon className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span>{isDark ? 'Cyber Dark' : 'Arctic Light'}</span>
          </div>
          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
            {isDark ? 'DARK' : 'LIGHT'}
          </span>
        </button>
      </div>

      {/* Futuristic Telemetry Footer */}
      <div className="mx-3 mb-3.5 p-3 rounded-xl bg-slate-100/70 dark:bg-[#0B101E]/90 border border-slate-200/80 dark:border-white/10 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500 flex">
              <Server className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight m-0">Port: 4000</p>
              <p className="text-[9px] text-slate-500 m-0 mt-0.5">NestJS Core API</p>
            </div>
          </div>
          <span className="relative flex w-2 h-2">
            <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          </span>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between text-[10px] font-mono">
          <span className="text-slate-500">Neon Postgres</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <Zap className="w-2.5 h-2.5" /> Synced
          </span>
        </div>
      </div>
    </aside>
  );
}
