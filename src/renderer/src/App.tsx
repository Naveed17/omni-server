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
      className={`flex w-full h-screen overflow-hidden min-h-screen relative transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-br from-[#111328] via-[#181a3a] to-[#0d0e1f] text-slate-100'
          : 'bg-gradient-to-br from-[#F5F6FF] via-[#ECEEFA] to-[#DFE3F7] text-slate-800'
      }`}
    >
      {/* Ambient Soft Glowing Light Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {isDark ? (
          <>
            <div className="absolute -top-[10%] -right-[5%] w-[550px] h-[550px] rounded-full bg-fuchsia-500/15 blur-[130px]" />
            <div className="absolute -top-[15%] left-[20%] w-[650px] h-[650px] rounded-full bg-indigo-500/20 blur-[150px]" />
            <div className="absolute -bottom-[15%] -left-[10%] w-[600px] h-[600px] rounded-full bg-blue-600/15 blur-[160px]" />
          </>
        ) : (
          <>
            <div className="absolute -top-[10%] -right-[5%] w-[550px] h-[550px] rounded-full bg-purple-300/35 blur-[130px]" />
            <div className="absolute -top-[15%] left-[20%] w-[650px] h-[650px] rounded-full bg-indigo-300/40 blur-[150px]" />
            <div className="absolute -bottom-[15%] -left-[10%] w-[600px] h-[600px] rounded-full bg-blue-300/30 blur-[160px]" />
          </>
        )}
      </div>

      <Sidebar />
      <main className="flex-1 min-w-0 h-full overflow-hidden flex flex-col relative z-10">
        {children}
      </main>
    </div>
  );
}

function AppWithTheme() {
  const { isDark } = useTheme();

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          className: isDark
            ? '!bg-[#15133B]/95 !text-white !border !border-white/15 !rounded-2xl !backdrop-blur-xl !shadow-2xl !text-xs !font-medium'
            : '!bg-white/95 !text-slate-900 !border !border-indigo-100 !rounded-2xl !backdrop-blur-xl !shadow-2xl !text-xs !font-medium',
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
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppWithTheme />
    </ThemeProvider>
  );
}
