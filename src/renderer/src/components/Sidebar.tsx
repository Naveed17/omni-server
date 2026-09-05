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
    <aside className="w-[240px] flex flex-col h-screen shrink-0 relative z-20 bg-white/[0.03] dark:bg-black/25 backdrop-blur-xl border-r border-white/10 shadow-2xl transition-colors duration-200">
      {/* Brand Header */}
      <div className="p-5 pb-5 border-b border-white/10 flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center font-bold text-white text-sm tracking-tight shadow-lg shadow-indigo-500/25 border border-white/20">
            OP
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#121132] shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm text-white tracking-tight">
              Omni<span className="text-indigo-400">Pos</span>
            </span>
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 tracking-wider uppercase">
              Cloud
            </span>
          </div>
          <p className="text-[11px] text-indigo-200/60 font-medium mt-0.5 tracking-wide">
            Provider Control Center
          </p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="p-3.5 flex-1 flex flex-col gap-2">
        <div className="text-[10px] font-semibold tracking-wider text-indigo-200/40 px-3 pt-1 pb-1 uppercase flex items-center justify-between">
          <span>Console Menu</span>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-xs transition-all duration-200 no-underline ${
                  isActive
                    ? 'bg-indigo-600/30 text-white font-medium shadow-lg shadow-indigo-500/20 border border-indigo-500/30'
                    : 'text-indigo-200/60 hover:text-white hover:bg-white/5 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'text-indigo-300' : 'text-indigo-200/50'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 tracking-wide flex items-center gap-1">
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
      <div className="mx-3.5 mb-2.5">
        <button
          type="button"
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all duration-150 bg-white/5 border border-white/10 text-indigo-200/80 hover:bg-white/10 hover:text-white"
        >
          <div className="flex items-center gap-2.5 text-xs font-medium">
            {isDark ? (
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{isDark ? 'Deep Indigo' : 'Soft Light'}</span>
          </div>
          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
            {isDark ? 'DARK' : 'LIGHT'}
          </span>
        </button>
      </div>

      {/* Futuristic Glassmorphic Telemetry Footer */}
      <div className="mx-3.5 mb-4 p-3.5 rounded-xl bg-black/25 backdrop-blur-md border border-white/5 shadow-inner">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 flex">
              <Server className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white leading-tight m-0">Port: 4000</p>
              <p className="text-[10px] text-indigo-200/60 m-0 mt-0.5">NestJS Core API</p>
            </div>
          </div>
          <span className="relative flex w-2 h-2">
            <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          </span>
        </div>
        <div className="mt-2.5 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px]">
          <span className="text-indigo-200/50 font-mono">Neon Postgres</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <Zap className="w-2.5 h-2.5" /> Connected
          </span>
        </div>
      </div>
    </aside>
  );
}
