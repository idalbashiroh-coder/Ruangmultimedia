import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  Database,
  FileSpreadsheet,
  FileText,
  Home,
  Layers,
  LayoutDashboard,
  Lock,
  LogOut,
  Monitor,
  PlusCircle,
  RefreshCw,
  School,
  Settings,
  Shield,
  Table,
  Tv,
  User,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC<{ onToggleSidebar: () => void; isSidebarOpen: boolean }> = ({
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const {
    currentUser,
    setCurrentUser,
    activeView,
    setActiveView,
    setIsBookingModalOpen,
    setIsLoginModalOpen,
    setIsSheetsModalOpen,
    setPrefilledBooking,
    settings,
  } = useApp();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateFormatted, setCurrentDateFormatted] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDateFormatted(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateNew = () => {
    setPrefilledBooking(null);
    setIsBookingModalOpen(true);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Mobile Menu Toggle & School Identity */}
          <div className="flex items-center gap-3">
            <button
              id="btn-toggle-sidebar"
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 lg:hidden"
              aria-label="Toggle Sidebar"
            >
              <Layers className="w-5 h-5" />
            </button>

            <div
              onClick={() => setActiveView('dashboard')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <School className="w-6 h-6" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-extrabold text-slate-900 leading-tight tracking-tight uppercase font-display">
                  {settings.namaAplikasi}
                </h1>
                <p className="text-xs font-semibold text-emerald-700">
                  {settings.namaSekolah} <span className="text-slate-400 font-normal">| TA {settings.tahunPelajaran}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Center: Live Clock & Date Badge */}
          <div className="hidden md:flex items-center gap-3 bg-slate-100/80 px-3.5 py-1.5 rounded-full border border-slate-200/60 text-xs font-medium text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>{currentDateFormatted}</span>
            <span className="w-1 h-1 rounded-full bg-slate-400" />
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-mono font-semibold text-slate-900">{currentTime} WIB</span>
          </div>

          {/* Right: Actions, Smart TV, Google Sheets, & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Action: Buat Jadwal */}
            <button
              id="btn-navbar-buat-jadwal"
              onClick={handleCreateNew}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden xs:inline">Buat Jadwal</span>
            </button>

            {/* Public View Button */}
            <button
              id="btn-navbar-public-view"
              onClick={() => setActiveView('public')}
              title="Kembali ke Tampilan Publik Guru & Siswa"
              className="p-2 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Monitor className="w-4 h-4 text-teal-600" />
              <span className="hidden sm:inline">Halaman Publik</span>
            </button>

            {/* Smart TV View Button */}
            <button
              id="btn-navbar-smart-tv"
              onClick={() => setActiveView('smart-tv')}
              title="Mode Tampilan Smart TV / Digital Signage"
              className={`p-2 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeView === 'smart-tv'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Tv className="w-4 h-4 text-emerald-500" />
              <span className="hidden xl:inline">Smart TV</span>
            </button>

            {/* Google Sheets Sync Trigger */}
            <button
              id="btn-navbar-sheets"
              onClick={() => setIsSheetsModalOpen(true)}
              title="Integrasi & Sinkronisasi Google Sheets Realtime"
              className="relative p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden lg:inline font-bold">Sheets Live</span>
            </button>

            {/* User Profile / Role Switcher & Logout */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <button
                  id="btn-user-profile"
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-left"
                  title="Lihat status akun / Ganti Akun"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold ring-2 ring-emerald-500/30">
                    {currentUser.nama.charAt(0)}
                  </div>
                  <div className="hidden xl:block">
                    <p className="text-xs font-bold text-slate-800 leading-tight max-w-[130px] truncate">
                      {currentUser.nama}
                    </p>
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        currentUser.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : currentUser.role === 'operator'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {currentUser.role}
                    </span>
                  </div>
                </button>

                <button
                  id="btn-navbar-logout"
                  onClick={() => {
                    setCurrentUser(null);
                    try {
                      localStorage.removeItem('albashiroh_multimedia_current_user_v2');
                    } catch {
                      // ignore
                    }
                    setActiveView('public');
                  }}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Keluar / Logout dari Administrator"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="btn-login-trigger"
                onClick={() => setIsLoginModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Login Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
