import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, KeyRound, RefreshCw,
  Store, Settings, Server, Zap,
} from 'lucide-react';

export function Sidebar() {
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
      background: 'rgba(14, 8, 16, 0.75)',
      backdropFilter: 'blur(28px)',
      WebkitBackdropFilter: 'blur(28px)',
      borderRight: '1px solid rgba(255, 255, 255, 0.07)',
      boxShadow: 'inset -1px 0 0 rgba(255, 255, 255, 0.03)',
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '20px 18px 16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
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
            background: '#38bdf8', border: '2px solid rgba(14,8,16,0.9)',
            boxShadow: '0 0 6px rgba(56,189,248,0.7)',
          }} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 800, fontSize: 13, color: '#f8fafc', letterSpacing: '-0.3px' }}>
              Omni<span style={{ color: '#fb7185' }}>Pos</span>
            </span>
            <span style={{
              padding: '1px 5px', borderRadius: 4, fontSize: 9, fontWeight: 800,
              background: 'rgba(225, 29, 72, 0.18)', color: '#fda4af',
              border: '1px solid rgba(225, 29, 72, 0.35)', letterSpacing: 0.8,
            }}>CLOUD</span>
          </div>
          <p style={{ fontSize: 10, color: '#64748b', fontWeight: 500, marginTop: 1 }}>
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
                  color: '#fecdd3',
                  border: '1px solid rgba(225, 29, 72, 0.35)',
                  boxShadow: '0 2px 10px rgba(225, 29, 72, 0.15)',
                } : {
                  background: 'transparent',
                  color: '#94a3b8',
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
                  background: 'rgba(37, 99, 235, 0.25)', color: '#93c5fd',
                  border: '1px solid rgba(59, 130, 246, 0.4)', letterSpacing: 0.5,
                }}>{item.badge}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Telemetry Footer */}
      <div style={{
        margin: '0 10px 14px', padding: '12px',
        borderRadius: 12,
        background: 'rgba(12, 8, 16, 0.65)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ padding: 5, borderRadius: 6, background: 'rgba(37, 99, 235, 0.15)', color: '#38bdf8', display: 'flex' }}>
              <Server style={{ width: 13, height: 13 }} />
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#f8fafc', lineHeight: 1.2, margin: 0 }}>Port: 4000</p>
              <p style={{ fontSize: 9, color: '#64748b', margin: 0, marginTop: 1 }}>NestJS Core API</p>
            </div>
          </div>
          <span style={{ position: 'relative', display: 'flex', width: 7, height: 7 }}>
            <span style={{ position: 'absolute', display: 'inline-flex', width: '100%', height: '100%', borderRadius: '50%', background: '#38bdf8', opacity: 0.75, animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }} />
            <span style={{ position: 'relative', display: 'inline-flex', width: 7, height: 7, borderRadius: '50%', background: '#38bdf8' }} />
          </span>
        </div>
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10, fontFamily: 'monospace' }}>
          <span style={{ color: '#64748b' }}>Neon Postgres</span>
          <span style={{ color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Zap style={{ width: 9, height: 9 }} /> Online
          </span>
        </div>
      </div>
    </aside>
  );
}
