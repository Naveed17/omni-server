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
    <aside className="w-[220px] flex flex-col h-screen shrink-0 relative z-20 bg-white/85 dark:bg-[#0e0810]/75 backdrop-blur-2xl border-r border-slate-200/80 dark:border-white/10 shadow-sm dark:shadow-[inset_-1px_0_0_rgba(255,255,255,0.03)] transition-colors duration-200">
      {/* Brand Header */}
      <div className="p-5 pb-4 border-b border-slate-200/60 dark:border-white/5 flex items-center gap-3">
        <div className="relative">
          <div className="w-9.5 h-9.5 rounded-xl bg-gradient-to-br from-rose-600 to-rose-700 flex items-center justify-center font-black text-white text-xs tracking-tighter shadow-lg shadow-rose-600/40 border border-blue-500/30">
            OP
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-sky-400 border-2 border-white dark:border-[#0e0810] shadow-[0_0_6px_rgba(56,189,248,0.7)]" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">
              Omni<span className="text-rose-600">Pos</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 tracking-wider">
              CLOUD
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">
            Provider Control Center
          </p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="p-3 flex-1 flex flex-col gap-1">
        <div className="text-[9px] font-extrabold tracking-widest text-slate-400 dark:text-slate-500 px-2 pb-2 uppercase">
          Main Console
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold no-underline transition-all duration-150 ${
                  isActive
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/35 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 tracking-wide">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Theme Mode Toggle Button */}
      <div className="mx-2.5 mb-2.5">
        <button
          type="button"
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all duration-150 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-200/70 dark:hover:bg-white/10"
        >
          <div className="flex items-center gap-2 text-xs font-bold">
            {isDark ? (
              <Moon className="w-3.5 h-3.5 text-sky-400" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span>{isDark ? 'Dark Theme' : 'Light Theme'}</span>
          </div>
          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-sky-500/15 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 uppercase">
            {isDark ? 'DARK' : 'LIGHT'}
          </span>
        </button>
      </div>

      {/* Telemetry Footer */}
      <div className="mx-2.5 mb-3.5 p-3 rounded-xl bg-slate-100/90 dark:bg-[#0c0810]/70 border border-slate-200/80 dark:border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/15 text-sky-500 flex">
              <Server className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight m-0">Port: 4000</p>
              <p className="text-[9px] text-slate-500 m-0 mt-0.5">NestJS Core API</p>
            </div>
          </div>
          <span className="relative flex w-2 h-2">
            <span className="absolute inline-flex w-full h-full rounded-full bg-sky-400 opacity-75 animate-ping" />
            <span className="relative inline-flex w-2 h-2 rounded-full bg-sky-400" />
          </span>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between text-[10px] font-mono">
          <span className="text-slate-500">Neon Postgres</span>
          <span className="text-sky-600 dark:text-sky-400 font-semibold flex items-center gap-1">
            <Zap className="w-2.5 h-2.5" /> Online
          </span>
        </div>
      </div>
    </aside>
  );
}
