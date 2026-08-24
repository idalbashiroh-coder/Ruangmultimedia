import React, { useMemo, useState } from 'react';
import {
  Activity,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Database,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  HelpCircle,
  Home,
  Info,
  Layers,
  LayoutDashboard,
  Lock,
  LogOut,
  Monitor,
  PlusCircle,
  Radio,
  RefreshCw,
  School,
  Search,
  Settings,
  Shield,
  Sparkles,
  Table,
  Tv,
  User,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const {
    activeView,
    setActiveView,
    currentUser,
    setIsLoginModalOpen,
    setIsBookingModalOpen,
    setIsSheetsModalOpen,
    setPrefilledBooking,
    settings,
    jadwalList,
    guruList,
    kelasList,
    ruanganList,
    lastSheetsSyncTime,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  // Calculate current date & time
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Calculate active period (Jam ke-1 s.d 8) based on typical time
  const currentPeriod = useMemo<number>(() => {
    const now = new Date();
    const currentTotalMin = now.getHours() * 60 + now.getMinutes();
    if (currentTotalMin < 465) return 1; // 07:00 - 07:45
    if (currentTotalMin < 510) return 2; // 07:45 - 08:30
    if (currentTotalMin < 570) return 3; // 08:30 - 09:15
    if (currentTotalMin < 615) return 4; // 09:30 - 10:15
    if (currentTotalMin < 660) return 5; // 10:15 - 11:00
    if (currentTotalMin < 720) return 6; // 11:00 - 11:45
    if (currentTotalMin < 810) return 7; // 12:45 - 13:30
    if (currentTotalMin < 880) return 8; // 13:30 - 14:15
    return 3;
  }, []);

  // Today's active schedules
  const todayJadwals = useMemo(() => {
    return jadwalList.filter((j) => j.tanggal === todayIso && j.status !== 'Dibatalkan');
  }, [jadwalList, todayIso]);

  // Real-time Room Status for live widget
  const perpusActive = useMemo(() => {
    return todayJadwals.find(
      (j) => j.ruangan_id === 'rng_perpus' && j.jam_ke === currentPeriod
    );
  }, [todayJadwals, currentPeriod]);

  const labkomActive = useMemo(() => {
    return todayJadwals.find(
      (j) => j.ruangan_id === 'rng_labkom' && j.jam_ke === currentPeriod
    );
  }, [todayJadwals, currentPeriod]);

  const handleNavClick = (viewName: string) => {
    setActiveView(viewName);
    onClose();
  };

  const handleBuatJadwal = () => {
    setPrefilledBooking(null);
    setIsBookingModalOpen(true);
    onClose();
  };

  // Menu structure with comprehensive items, icons, badges, descriptions
  const menuSections = useMemo(
    () => [
      {
        id: 'sec-utama',
        title: 'Menu Utama',
        items: [
          {
            id: 'menu-dashboard',
            name: 'Dashboard',
            description: 'Ringkasan & Statistik',
            view: 'dashboard',
            aliases: ['dashboard'],
            icon: LayoutDashboard,
            badge: `${todayJadwals.length} Hari Ini`,
            badgeColor: 'emerald',
          },
          {
            id: 'menu-kalender-jadwal',
            name: 'Kalender Mingguan',
            description: 'Matriks Jam ke-1 s.d. 8',
            view: 'kalender',
            aliases: ['kalender', 'jadwal-kalender', 'jadwal_kalender'],
            icon: Calendar,
            badge: 'Matriks',
            badgeColor: 'indigo',
          },
          {
            id: 'menu-daftar-jadwal',
            name: 'Daftar Semua Jadwal',
            description: 'Tabel Peminjaman Lengkap',
            view: 'jadwal_list',
            aliases: ['jadwal_list', 'jadwal-list', 'daftar_jadwal'],
            icon: Table,
            badge: String(jadwalList.filter((j) => j.status !== 'Dibatalkan').length),
            badgeColor: 'slate',
          },
        ],
      },
      {
        id: 'sec-master',
        title: 'Database Master',
        items: [
          {
            id: 'menu-database-guru',
            name: 'Database Guru',
            description: 'Daftar Tenaga Pendidik',
            view: 'guru',
            aliases: ['guru', 'database-guru', 'database_guru'],
            icon: Users,
            badge: `${guruList.length} Guru`,
            badgeColor: 'slate',
          },
          {
            id: 'menu-database-kelas',
            name: 'Database Rombel Kelas',
            description: 'Jenjang SMP & SMA IT',
            view: 'kelas',
            aliases: ['kelas', 'database-kelas', 'database_kelas'],
            icon: GraduationCap,
            badge: `${kelasList.length} Kelas`,
            badgeColor: 'slate',
          },
          {
            id: 'menu-data-ruangan',
            name: 'Fasilitas Ruangan',
            description: 'Perpustakaan & Lab Komputer',
            view: 'ruangan',
            aliases: ['ruangan', 'data-ruangan', 'data_ruangan'],
            icon: School,
            badge: '2 Ruangan',
            badgeColor: 'emerald',
          },
        ],
      },
      {
        id: 'sec-display',
        title: 'Laporan & Tampilan',
        items: [
          {
            id: 'menu-laporan',
            name: 'Laporan & Rekapitulasi',
            description: 'Cetak PDF & Ekspor Excel',
            view: 'laporan',
            aliases: ['laporan', 'rekap'],
            icon: FileText,
            badge: 'PDF / XLS',
            badgeColor: 'amber',
          },
          {
            id: 'menu-smart-tv',
            name: 'Mode Smart TV',
            description: 'Display Digital Signage',
            view: 'smart_tv',
            aliases: ['smart_tv', 'smart-tv'],
            icon: Tv,
            badge: 'Live Display',
            badgeColor: 'rose',
          },
          {
            id: 'menu-jadwal-publik',
            name: 'Halaman Publik',
            description: 'Akses Guru & Siswa',
            view: 'public',
            aliases: ['public', 'publik'],
            icon: Monitor,
            badge: 'Umum',
            badgeColor: 'teal',
          },
        ],
      },
      {
        id: 'sec-sistem',
        title: 'Sistem & Pengaturan',
        items: [
          {
            id: 'menu-google-sheets',
            name: 'Google Spreadsheet',
            description: 'Sinkronisasi Realtime',
            view: 'pengaturan',
            aliases: ['pengaturan', 'sheets'],
            icon: FileSpreadsheet,
            badge: 'Cloud Sync',
            badgeColor: 'emerald',
            action: () => {
              setActiveView('pengaturan');
              setIsSheetsModalOpen(true);
              onClose();
            },
          },
          {
            id: 'menu-pengaturan',
            name: 'Pengaturan & Audit',
            description: 'Hak Akses, Riwayat & Backup',
            view: 'pengaturan',
            aliases: ['pengaturan', 'settings', 'audit-log'],
            icon: Settings,
            badge: currentUser?.role === 'admin' ? 'Admin' : 'Sistem',
            badgeColor: currentUser?.role === 'admin' ? 'purple' : 'slate',
          },
        ],
      },
    ],
    [
      todayJadwals.length,
      jadwalList,
      guruList.length,
      kelasList.length,
      currentUser?.role,
      setActiveView,
      setIsSheetsModalOpen,
      onClose,
    ]
  );

  // Filter items based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return menuSections;
    const q = searchQuery.toLowerCase();
    return menuSections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            (item.badge && item.badge.toLowerCase().includes(q))
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [menuSections, searchQuery]);

  const isViewActive = (itemAliases: string[]) => {
    return itemAliases.includes(activeView);
  };

  const renderBadge = (badgeText: string, color = 'slate') => {
    const colorStyles: Record<string, string> = {
      emerald: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      indigo: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
      amber: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      rose: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
      purple: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
      teal: 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
      slate: 'bg-slate-800 text-slate-400 border border-slate-700/60',
    };

    return (
      <span
        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap leading-none ${
          colorStyles[color] || colorStyles.slate
        }`}
      >
        {badgeText}
      </span>
    );
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div
          id="sidebar-backdrop"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-main-sidebar"
        className={`
          fixed lg:sticky top-0 bottom-0 left-0 z-40
          h-screen lg:h-[calc(100vh-5rem)]
          bg-slate-900 border-r border-slate-800/80
          flex flex-col text-slate-300 select-none
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-72 sm:w-80'}
          ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
          lg:rounded-2xl lg:shadow-md lg:border lg:border-slate-800/80
        `}
      >
        {/* Header Branding Section */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between gap-2 bg-slate-950/40 lg:rounded-t-2xl">
          <div
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 cursor-pointer group min-w-0"
            title="Ke Dashboard Utama"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 shrink-0 group-hover:scale-105 transition-transform">
              <School className="w-5 h-5" />
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white tracking-wider uppercase truncate font-display">
                    ALBASHIROH TUREN
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                </div>
                <p className="text-[11px] text-emerald-400 font-medium truncate">
                  Multimedia Scheduling System
                </p>
              </div>
            )}
          </div>

          {/* Controls: Close for mobile / Collapse for desktop */}
          <div className="flex items-center gap-1">
            {/* Desktop Collapse Toggle */}
            {onToggleCollapse && (
              <button
                id="btn-sidebar-collapse"
                onClick={onToggleCollapse}
                title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
                className="hidden lg:flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Toggle Collapse"
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Mobile Close Button */}
            <button
              id="btn-sidebar-close-mobile"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition-colors"
              aria-label="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Button: Buat Jadwal Baru */}
        <div className="p-3 pb-2">
          <button
            id="btn-sidebar-buat-jadwal"
            onClick={handleBuatJadwal}
            title="Tambah Jadwal Peminjaman Baru"
            className={`
              w-full flex items-center justify-center gap-2.5 rounded-xl font-bold text-slate-950
              bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300
              shadow-md shadow-emerald-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-98
              ${isCollapsed ? 'p-3' : 'px-4 py-2.5 text-xs sm:text-sm'}
            `}
          >
            <PlusCircle className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Buat Jadwal Baru</span>}
          </button>
        </div>

        {/* Live Facility Quick Status Widget (Visible when expanded) */}
        {!isCollapsed && (
          <div className="px-3 py-1">
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Status Live (Jam ke-{currentPeriod})</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Real-time</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Perpustakaan Pill */}
                <button
                  id="widget-status-perpus"
                  onClick={() => handleNavClick('kalender')}
                  className={`p-2 rounded-lg border text-left transition-colors flex flex-col justify-between ${
                    perpusActive
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 hover:bg-emerald-900/40'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                  title="Klik untuk melihat jadwal di kalender"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Perpustakaan
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        perpusActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                      }`}
                    />
                  </div>
                  <p className="text-[11px] font-semibold truncate">
                    {perpusActive ? perpusActive.mata_pelajaran : 'Tersedia'}
                  </p>
                </button>

                {/* Lab Komputer Pill */}
                <button
                  id="widget-status-labkom"
                  onClick={() => handleNavClick('kalender')}
                  className={`p-2 rounded-lg border text-left transition-colors flex flex-col justify-between ${
                    labkomActive
                      ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-200 hover:bg-indigo-900/40'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                  title="Klik untuk melihat jadwal di kalender"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Lab. Komputer
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        labkomActive ? 'bg-indigo-400 animate-pulse' : 'bg-slate-500'
                      }`}
                    />
                  </div>
                  <p className="text-[11px] font-semibold truncate">
                    {labkomActive ? labkomActive.mata_pelajaran : 'Tersedia'}
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Menu Filter Search (Visible when expanded) */}
        {!isCollapsed && (
          <div className="px-3 pt-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              <input
                id="input-sidebar-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari menu & fitur..."
                className="w-full bg-slate-950/50 border border-slate-800 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Navigation Menu List */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {filteredSections.map((section) => (
            <div key={section.id} className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                  {section.title}
                </p>
              )}

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isViewActive(item.aliases);

                  return (
                    <button
                      key={item.id}
                      id={item.id}
                      onClick={() =>
                        item.action ? item.action() : handleNavClick(item.view)
                      }
                      title={isCollapsed ? `${item.name} - ${item.description}` : undefined}
                      className={`
                        w-full flex items-center rounded-xl text-xs font-medium transition-all group relative
                        ${
                          isCollapsed
                            ? 'justify-center p-3'
                            : 'justify-between px-3 py-2.5'
                        }
                        ${
                          active
                            ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-300 font-semibold border-l-3 border-emerald-400 shadow-xs'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                            active
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-slate-800/50 text-slate-400 group-hover:bg-slate-700/60 group-hover:text-white'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>

                        {!isCollapsed && (
                          <div className="text-left min-w-0">
                            <p className="truncate text-xs leading-tight">{item.name}</p>
                            <p className="text-[10px] text-slate-500 truncate group-hover:text-slate-400 transition-colors">
                              {item.description}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Badge if not collapsed */}
                      {!isCollapsed && item.badge && (
                        <div className="shrink-0 ml-2">
                          {renderBadge(item.badge, item.badgeColor)}
                        </div>
                      )}

                      {/* Collapsed active indicator dot */}
                      {isCollapsed && active && (
                        <span className="absolute right-1.5 top-1.5 w-2 h-2 rounded-full bg-emerald-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredSections.length === 0 && (
            <div className="p-4 text-center text-slate-500 text-xs">
              <p>Menu tidak ditemukan</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-emerald-400 hover:underline text-[11px]"
              >
                Reset pencarian
              </button>
            </div>
          )}
        </nav>

        {/* User Card & Authentication Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/50 lg:rounded-b-2xl">
          {currentUser ? (
            <div className="flex items-center justify-between gap-2">
              <div
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-2.5 min-w-0 cursor-pointer group flex-1 p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
                title="Klik untuk ganti akun atau profil"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                  {currentUser.nama ? currentUser.nama.charAt(0) : 'U'}
                </div>

                {!isCollapsed && (
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-xs font-semibold text-white truncate leading-tight group-hover:text-emerald-300 transition-colors">
                      {currentUser.nama}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded font-mono ${
                          currentUser.role === 'admin'
                            ? 'bg-purple-500/20 text-purple-300'
                            : currentUser.role === 'operator'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {currentUser.role}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {!isCollapsed && (
                <button
                  id="btn-sidebar-auth-modal"
                  onClick={() => setIsLoginModalOpen(true)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                  title="Ganti Akun / Logout"
                  aria-label="Ganti Akun"
                >
                  <LogOut className="w-4 h-4 text-slate-400 hover:text-rose-400" />
                </button>
              )}
            </div>
          ) : (
            <button
              id="btn-sidebar-login"
              onClick={() => setIsLoginModalOpen(true)}
              className={`w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-white transition-colors ${
                isCollapsed ? 'p-2.5' : 'px-3 py-2'
              }`}
              title="Login Administrator"
            >
              <Lock className="w-4 h-4 text-emerald-400" />
              {!isCollapsed && <span>Login Admin</span>}
            </button>
          )}

          {/* Quick System Info in Footer */}
          {!isCollapsed && (
            <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span>v2.5 Pro</span>
              </span>
              <span>TA {settings.tahunPelajaran}</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
