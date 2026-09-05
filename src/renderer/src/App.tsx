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
    <div className="flex w-full h-screen overflow-hidden shell-gradient-bg cyber-grid relative transition-colors duration-300">
      {/* Ambient Cyber Lighting */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Electric Cyan Beacon */}
        <div className="absolute -top-[20%] right-[10%] w-[600px] h-[600px] rounded-full bg-cyan-500/8 dark:bg-cyan-500/12 blur-[140px]" />
        {/* Deep Indigo Tech Mesh */}
        <div className="absolute top-[30%] -left-[10%] w-[700px] h-[700px] rounded-full bg-indigo-500/6 dark:bg-indigo-600/12 blur-[160px]" />
        {/* Subtle Violet Accent */}
        <div className="absolute -bottom-[20%] right-[25%] w-[600px] h-[600px] rounded-full bg-blue-500/6 dark:bg-violet-600/10 blur-[150px]" />
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
            className: '!bg-slate-950/95 dark:!bg-[#0B0F19]/95 !text-slate-100 !border !border-cyan-500/30 !rounded-xl !backdrop-blur-xl !shadow-[0_10px_30px_rgba(0,0,0,0.6)] !text-xs !font-semibold',
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
