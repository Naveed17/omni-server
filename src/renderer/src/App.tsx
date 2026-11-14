import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Sidebar, MobileNav } from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import LicensesPage from './pages/LicensesPage';
import SettingsPage from './pages/SettingsPage';
import { ThemeProvider } from './context/ThemeContext';

function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-backdrop flex w-full h-screen overflow-hidden text-fg">
      <Sidebar />
      <main className="flex-1 min-w-0 h-full overflow-hidden flex flex-col relative z-10">
        <MobileNav />
        {children}
      </main>
    </div>
  );
}

function AppWithTheme() {
  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--surface-2)',
            color: 'var(--fg)',
            border: '1px solid var(--line-strong)',
            borderRadius: '10px',
            fontSize: '12.5px',
            fontWeight: 500,
            boxShadow: 'var(--shadow)',
          },
          success: { iconTheme: { primary: 'var(--accent)', secondary: 'var(--accent-fg)' } },
          error: { iconTheme: { primary: 'var(--bad)', secondary: 'var(--surface)' } },
        }}
      />
      <ShellLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/licenses" element={<LicensesPage />} />
          <Route path="/sync-feed" element={<Navigate to="/licenses" replace />} />
          <Route path="/stores" element={<Navigate to="/licenses" replace />} />
          <Route path="/settings" element={<SettingsPage />} />
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
