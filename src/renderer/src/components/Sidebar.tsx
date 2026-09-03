import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  KeyRound,
  RefreshCw,
  Store,
  Settings,
  Server,
  CloudCheck,
} from 'lucide-react';

export function Sidebar() {
  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/licenses', label: 'Store Licenses', icon: KeyRound },
    { to: '/sync-feed', label: 'Live Sync Stream', icon: RefreshCw },
    { to: '/stores', label: 'Registered Stores', icon: Store },
    { to: '/settings', label: 'Server Config', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#141a24] border-r border-white/10 flex flex-col h-screen shrink-0">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">
          OP
        </div>
        <div>
          <h1 className="font-bold text-base leading-tight text-white">Omnipos Cloud</h1>
          <p className="text-xs text-slate-400">Provider Control Center</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="p-4 flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Server status */}
      <div className="p-4 border-t border-white/10 m-4 rounded-xl bg-[#1b2331] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-400" />
          <div>
            <p className="text-xs font-semibold text-white">API Port: 4000</p>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
