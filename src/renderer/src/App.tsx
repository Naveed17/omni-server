import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Sidebar, MobileTabs } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { CommandPalette } from './components/CommandPalette';
import Dashboard from './pages/Dashboard';
import LicensesPage from './pages/licenses/LicensesPage';
import BackupsPage from './pages/BackupsPage';
import { ThemeProvider } from './context/ThemeContext';

function ShellLayout({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="app-backdrop flex w-full h-screen overflow-hidden text-fg">
      <Sidebar />
      <main className="flex-1 min-w-0 h-full overflow-hidden flex flex-col relative z-10 pb-14 md:pb-0">
        <TopBar onOpenPalette={() => setPaletteOpen(true)} />
        {children}
      </main>
      <MobileTabs />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
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
            <Route path="/licenses/:id" element={<LicensesPage />} />
            <Route path="/backups" element={<BackupsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ShellLayout>
      </BrowserRouter>
    </ThemeProvider>
  );
}
