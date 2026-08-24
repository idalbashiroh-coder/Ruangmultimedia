import React, { useState } from 'react';
import { DashboardView } from './components/DashboardView';
import { DatabaseGuruView } from './components/DatabaseGuruView';
import { DatabaseKelasView } from './components/DatabaseKelasView';
import { DatabaseRuanganView } from './components/DatabaseRuanganView';
import { JadwalCalendarView } from './components/JadwalCalendarView';
import { JadwalFormModal } from './components/JadwalFormModal';
import { JadwalListView } from './components/JadwalListView';
import { LaporanView } from './components/LaporanView';
import { LoginModal } from './components/LoginModal';
import { Navbar } from './components/Navbar';
import { PengaturanView } from './components/PengaturanView';
import { PublicJadwalView } from './components/PublicJadwalView';
import { Sidebar } from './components/Sidebar';
import { SmartTvDisplayView } from './components/SmartTvDisplayView';
import { AppProvider, useApp } from './context/AppContext';

const AppContent: React.FC = () => {
  const { activeView } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Smart TV Full-Screen Signage View
  if (['smart_tv', 'smart-tv'].includes(activeView)) {
    return (
      <>
        <SmartTvDisplayView />
        <JadwalFormModal />
        <LoginModal />
      </>
    );
  }

  // Public Teacher & Student View
  if (['public', 'publik'].includes(activeView)) {
    return (
      <>
        <PublicJadwalView />
        <JadwalFormModal />
        <LoginModal />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans antialiased">
      {/* Top Navigation Bar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main Container with Sidebar + Dynamic View Content */}
      <div className="flex-1 flex w-full max-w-[1600px] mx-auto px-3 sm:px-6 py-4 sm:py-6 gap-6">
        {/* Responsive, Collapsible User-Friendly Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />

        {/* Dynamic Main Workspace View */}
        <main className="flex-1 min-w-0">
          {activeView === 'dashboard' && <DashboardView />}
          {['kalender', 'jadwal-kalender', 'jadwal_kalender'].includes(activeView) && (
            <JadwalCalendarView />
          )}
          {['jadwal_list', 'jadwal-list', 'daftar_jadwal'].includes(activeView) && (
            <JadwalListView />
          )}
          {['guru', 'database-guru', 'database_guru'].includes(activeView) && (
            <DatabaseGuruView />
          )}
          {['kelas', 'database-kelas', 'database_kelas'].includes(activeView) && (
            <DatabaseKelasView />
          )}
          {['ruangan', 'data-ruangan', 'data_ruangan'].includes(activeView) && (
            <DatabaseRuanganView />
          )}
          {['laporan', 'rekap'].includes(activeView) && <LaporanView />}
          {['pengaturan', 'settings', 'audit-log', 'audit'].includes(activeView) && (
            <PengaturanView />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <JadwalFormModal />
      <LoginModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
