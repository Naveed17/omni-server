import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, KeyRound, RefreshCw,
  Store, Settings, Server, Zap, Sun, Moon,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function Sidebar() {
  const { theme, toggleTheme, isDark } = useTheme();

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/licenses', label: 'Store Licenses', icon: KeyRound, badge: 'Live' },
    { to: '/sync-feed', label: 'Live Sync Stream', icon: RefreshCw },
    { to: '/stores', label: 'Registered Stores', icon: Store },
    { to: '/settings', label: 'Server Config', icon: Settings },
  ];

  return (
    <aside style={{
      width: 220,
      display: 'flex', flexDirection: 'column',
      height: '100vh', flexShrink: 0,
      position: 'relative', zIndex: 20,
      background: isDark ? 'rgba(14, 8, 16, 0.75)' : 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(28px)',
      WebkitBackdropFilter: 'blur(28px)',
      borderRight: isDark ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid rgba(0, 0, 0, 0.08)',
      boxShadow: isDark ? 'inset -1px 0 0 rgba(255, 255, 255, 0.03)' : '0 4px 20px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.2s ease',
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '20px 18px 16px',
        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
        display: 'flex', alignItems: 'center', gap: 11,
      }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'linear-gradient(135deg, #e11d48, #be123c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, color: '#fff', fontSize: 13, letterSpacing: '-0.5px',
            boxShadow: '0 4px 18px rgba(225, 29, 72, 0.45)',
            border: '1px solid rgba(59, 130, 246, 0.35)',
          }}>OP</div>
          <span style={{
            position: 'absolute', bottom: -1, right: -1,
            width: 9, height: 9, borderRadius: '50%',
            background: '#38bdf8', border: isDark ? '2px solid rgba(14,8,16,0.9)' : '2px solid #ffffff',
            boxShadow: '0 0 6px rgba(56,189,248,0.7)',
          }} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 800, fontSize: 13, color: isDark ? '#f8fafc' : '#0f172a', letterSpacing: '-0.3px' }}>
              Omni<span style={{ color: '#e11d48' }}>Pos</span>
            </span>
            <span style={{
              padding: '1px 5px', borderRadius: 4, fontSize: 9, fontWeight: 800,
              background: 'rgba(225, 29, 72, 0.18)', color: '#e11d48',
              border: '1px solid rgba(225, 29, 72, 0.35)', letterSpacing: 0.8,
            }}>CLOUD</span>
          </div>
          <p style={{ fontSize: 10, color: isDark ? '#64748b' : '#64748b', fontWeight: 500, marginTop: 1 }}>
            Provider Control Center
          </p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav style={{ padding: '14px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, color: '#475569', padding: '0 8px 8px', textTransform: 'uppercase' }}>
          Main Console
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 12px', borderRadius: 10,
                fontSize: 12, fontWeight: 600, textDecoration: 'none',
                transition: 'all 0.15s ease',
                ...(isActive ? {
                  background: 'rgba(225, 29, 72, 0.16)',
                  color: isDark ? '#fecdd3' : '#e11d48',
                  border: '1px solid rgba(225, 29, 72, 0.35)',
                  boxShadow: '0 2px 10px rgba(225, 29, 72, 0.15)',
                } : {
                  background: 'transparent',
                  color: isDark ? '#94a3b8' : '#64748b',
                  border: '1px solid transparent',
                }),
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon style={{ width: 15, height: 15 }} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span style={{
                  padding: '2px 5px', borderRadius: 4, fontSize: 9, fontWeight: 800,
                  background: 'rgba(37, 99, 235, 0.25)', color: isDark ? '#93c5fd' : '#2563eb',
                  border: '1px solid rgba(59, 130, 246, 0.4)', letterSpacing: 0.5,
                }}>{item.badge}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Theme Mode Toggle Button */}
      <div style={{ margin: '0 10px 10px' }}>
        <button
          type="button"
          onClick={toggleTheme}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            borderRadius: 10,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
            color: isDark ? '#f8fafc' : '#0f172a',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700 }}>
            {isDark ? (
              <Moon style={{ width: 14, height: 14, color: '#38bdf8' }} />
            ) : (
              <Sun style={{ width: 14, height: 14, color: '#f59e0b' }} />
            )}
            <span>{isDark ? 'Dark Theme' : 'Light Theme'}</span>
          </div>
          <span style={{
            fontSize: 9,
            fontWeight: 800,
            padding: '2px 6px',
            borderRadius: 6,
            background: isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            color: isDark ? '#38bdf8' : '#b45309',
            textTransform: 'uppercase',
          }}>
            {isDark ? 'DARK' : 'LIGHT'}
          </span>
        </button>
      </div>

      {/* Telemetry Footer */}
      <div style={{
        margin: '0 10px 14px', padding: '12px',
        borderRadius: 12,
        background: isDark ? 'rgba(12, 8, 16, 0.65)' : 'rgba(241, 245, 249, 0.85)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ padding: 5, borderRadius: 6, background: 'rgba(37, 99, 235, 0.15)', color: '#38bdf8', display: 'flex' }}>
              <Server style={{ width: 13, height: 13 }} />
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a', lineHeight: 1.2, margin: 0 }}>Port: 4000</p>
              <p style={{ fontSize: 9, color: '#64748b', margin: 0, marginTop: 1 }}>NestJS Core API</p>
            </div>
          </div>
          <span style={{ position: 'relative', display: 'flex', width: 7, height: 7 }}>
            <span style={{ position: 'absolute', display: 'inline-flex', width: '100%', height: '100%', borderRadius: '50%', background: '#38bdf8', opacity: 0.75, animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }} />
            <span style={{ position: 'relative', display: 'inline-flex', width: 7, height: 7, borderRadius: '50%', background: '#38bdf8' }} />
          </span>
        </div>
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10, fontFamily: 'monospace' }}>
          <span style={{ color: '#64748b' }}>Neon Postgres</span>
          <span style={{ color: isDark ? '#38bdf8' : '#0284c7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Zap style={{ width: 9, height: 9 }} /> Online
          </span>
        </div>
      </div>
    </aside>
  );
}
