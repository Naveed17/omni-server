import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import LicensesPage from './pages/LicensesPage';
import LiveSyncPage from './pages/LiveSyncPage';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function ShellLayout({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();

  return (
    <div
      className="flex w-full h-screen overflow-hidden"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #18060f 0%, #200a16 25%, #0f132e 65%, #080d22 100%)'
          : 'linear-gradient(135deg, #fff1f2 0%, #fdf2f8 25%, #f0f9ff 65%, #f8fafc 100%)',
        position: 'relative',
        transition: 'background 0.3s ease',
      }}
    >
      {/* Ambient Glow Mesh */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {/* Primary Red Glow */}
        <div style={{
          position: 'absolute', top: '-15%', right: '-5%',
          width: 750, height: 750,
          background: isDark
            ? 'radial-gradient(circle, rgba(225, 29, 72, 0.35) 0%, rgba(190, 18, 60, 0.18) 45%, transparent 70%)'
            : 'radial-gradient(circle, rgba(225, 29, 72, 0.12) 0%, rgba(254, 205, 211, 0.15) 45%, transparent 70%)',
          filter: 'blur(95px)',
        }} />

        <div style={{
          position: 'absolute', top: '-10%', left: '-5%',
          width: 650, height: 650,
          background: isDark
            ? 'radial-gradient(circle, rgba(225, 29, 72, 0.25) 0%, transparent 65%)'
            : 'radial-gradient(circle, rgba(225, 29, 72, 0.08) 0%, transparent 65%)',
          filter: 'blur(90px)',
        }} />

        {/* Secondary Blue Depth Glow */}
        <div style={{
          position: 'absolute', bottom: '-15%', left: '20%',
          width: 800, height: 800,
          background: isDark
            ? 'radial-gradient(circle, rgba(37, 99, 235, 0.35) 0%, rgba(30, 58, 138, 0.18) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, rgba(186, 230, 253, 0.15) 50%, transparent 70%)',
          filter: 'blur(100px)',
        }} />
      </div>

      <Sidebar />
      <main style={{ flex: 1, minWidth: 0, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(25, 10, 20, 0.90)',
              backdropFilter: 'blur(20px)',
              color: '#f8fafc',
              border: '1px solid rgba(225, 29, 72, 0.25)',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: '600',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
            },
          }}
        />
        <ShellLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/licenses" element={<LicensesPage />} />
            <Route path="/sync-feed" element={<LiveSyncPage />} />
            <Route path="/stores" element={<LicensesPage />} />
            <Route path="/settings" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ShellLayout>
      </BrowserRouter>
    </ThemeProvider>
  );
}
