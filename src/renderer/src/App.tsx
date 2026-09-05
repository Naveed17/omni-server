import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import LicensesPage from './pages/LicensesPage';
import LiveSyncPage from './pages/LiveSyncPage';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full h-screen overflow-hidden bg-gradient-to-br from-[#111328] via-[#181a3a] to-[#0d0e1f] text-slate-100 min-h-screen relative transition-colors duration-300">
      {/* Ambient Soft Glowing Light Effects (Image 2 ShikshaQ Style) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Top-Right Fuchsia/Violet Ambient Glow */}
        <div className="absolute -top-[10%] -right-[5%] w-[550px] h-[550px] rounded-full bg-fuchsia-500/15 dark:bg-purple-600/20 blur-[130px]" />
        {/* Center-Top Indigo Core Glow */}
        <div className="absolute -top-[15%] left-[20%] w-[650px] h-[650px] rounded-full bg-indigo-500/20 dark:bg-indigo-600/25 blur-[150px]" />
        {/* Bottom-Left Electric Blue Depth */}
        <div className="absolute -bottom-[15%] -left-[10%] w-[600px] h-[600px] rounded-full bg-blue-600/15 dark:bg-blue-600/20 blur-[160px]" />
      </div>

      <Sidebar />
      <main className="flex-1 min-w-0 h-full overflow-hidden flex flex-col relative z-10">
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
            className: '!bg-[#15133B]/95 !text-white !border !border-white/15 !rounded-2xl !backdrop-blur-xl !shadow-2xl !text-xs !font-medium',
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
