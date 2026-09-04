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
    <div className="flex w-full h-screen overflow-hidden shell-gradient-bg relative transition-colors duration-300">
      {/* Ambient Glow Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Primary Red Glow */}
        <div className="absolute -top-[15%] -right-[5%] w-[750px] h-[750px] rounded-full bg-rose-500/15 dark:bg-rose-500/25 blur-3xl" />
        <div className="absolute -top-[10%] -left-[5%] w-[650px] h-[650px] rounded-full bg-rose-500/10 dark:bg-rose-500/20 blur-3xl" />
        {/* Secondary Blue Depth Glow */}
        <div className="absolute -bottom-[15%] left-[20%] w-[800px] h-[800px] rounded-full bg-sky-500/15 dark:bg-blue-600/25 blur-3xl" />
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
            className: '!bg-slate-900/95 dark:!bg-slate-900/95 !text-white !border !border-rose-500/30 !rounded-xl !backdrop-blur-xl !shadow-2xl',
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
