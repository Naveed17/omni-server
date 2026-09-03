import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import LicensesPage from './pages/LicensesPage';
import LiveSyncPage from './pages/LiveSyncPage';

function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full h-screen overflow-hidden bg-[#0b0f17]">
      <Sidebar />
      <main className="flex-1 min-w-0 h-full overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
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
