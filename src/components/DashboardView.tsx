import React, { useMemo } from 'react';
import {
  Activity,
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Monitor,
  PlusCircle,
  School,
  Sparkles,
  TrendingUp,
  Tv,
  Users,
  XCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HARI_LIST, JAM_LIST, getHariNameFromDate } from '../data/initialData';
import { Jadwal } from '../types';

export const DashboardView: React.FC = () => {
  const {
    jadwalList,
    guruList,
    kelasList,
    ruanganList,
    setActiveView,
    setIsBookingModalOpen,
    setPrefilledBooking,
    setIsSheetsModalOpen,
    lastSheetsSyncTime,
    settings,
  } = useApp();

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const todayHariName = useMemo(() => getHariNameFromDate(todayIso), [todayIso]);

  // Lookup Maps
  const guruMap = useMemo(() => new Map(guruList.map((g) => [g.id, g])), [guruList]);
  const kelasMap = useMemo(() => new Map(kelasList.map((k) => [k.id, k])), [kelasList]);
  const ruanganMap = useMemo(() => new Map(ruanganList.map((r) => [r.id, r])), [ruanganList]);

  // Today's schedules
  const todayJadwals = useMemo(() => {
    return jadwalList
      .filter((j) => j.tanggal === todayIso && j.status !== 'Dibatalkan')
      .sort((a, b) => a.jam_ke - b.jam_ke);
  }, [jadwalList, todayIso]);

  // Total counts
  const totalHariIni = todayJadwals.length;
  const countPerpusToday = todayJadwals.filter((j) => j.ruangan_id === 'rng_perpus').length;
  const countLabkomToday = todayJadwals.filter((j) => j.ruangan_id === 'rng_labkom').length;

  const totalPerpusAll = jadwalList.filter((j) => j.ruangan_id === 'rng_perpus' && j.status !== 'Dibatalkan').length;
  const totalLabkomAll = jadwalList.filter((j) => j.ruangan_id === 'rng_labkom' && j.status !== 'Dibatalkan').length;

  // Simulate active period based on current time (WIB school hours approximation)
  // Or standard daytime indicator:
  const currentPeriod = useMemo<number>(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTotalMin = hours * 60 + minutes;

    // School periods approx:
    // Jam 1: 07:00 - 07:45 (420 - 465)
    // Jam 2: 07:45 - 08:30 (465 - 510)
    // Jam 3: 08:30 - 09:15 (510 - 555)
    // Jam 4: 09:30 - 10:15 (570 - 615)
    // Jam 5: 10:15 - 11:00 (615 - 660)
    // Jam 6: 11:00 - 11:45 (660 - 705)
    // Jam 7: 12:45 - 13:30 (765 - 810)
    // Jam 8: 13:30 - 14:15 (810 - 855)
    if (currentTotalMin < 465) return 1;
    if (currentTotalMin < 510) return 2;
    if (currentTotalMin < 570) return 3;
    if (currentTotalMin < 615) return 4;
    if (currentTotalMin < 660) return 5;
    if (currentTotalMin < 720) return 6;
    if (currentTotalMin < 810) return 7;
    if (currentTotalMin < 880) return 8;
    return 3; // Default to representative daytime period 3
  }, []);

  // Ongoing and Next schedule
  const ongoingSchedules = useMemo(() => {
    return todayJadwals.filter((j) => j.jam_ke === currentPeriod);
  }, [todayJadwals, currentPeriod]);

  const upcomingSchedules = useMemo(() => {
    return todayJadwals.filter((j) => j.jam_ke > currentPeriod);
  }, [todayJadwals, currentPeriod]);

  // Per-room real-time status
  const perpusOngoing = ongoingSchedules.find((j) => j.ruangan_id === 'rng_perpus');
  const labkomOngoing = ongoingSchedules.find((j) => j.ruangan_id === 'rng_labkom');

  const perpusNext = upcomingSchedules.find((j) => j.ruangan_id === 'rng_perpus');
  const labkomNext = upcomingSchedules.find((j) => j.ruangan_id === 'rng_labkom');

  // Usage by Day of Week for Bar chart
  const usageByDay = useMemo(() => {
    const days: Record<string, { perpus: number; labkom: number; total: number }> = {
      Senin: { perpus: 0, labkom: 0, total: 0 },
      Selasa: { perpus: 0, labkom: 0, total: 0 },
      Rabu: { perpus: 0, labkom: 0, total: 0 },
      Kamis: { perpus: 0, labkom: 0, total: 0 },
      Jumat: { perpus: 0, labkom: 0, total: 0 },
      Sabtu: { perpus: 0, labkom: 0, total: 0 },
    };

    jadwalList.forEach((j) => {
      if (j.status !== 'Dibatalkan' && days[j.hari]) {
        if (j.ruangan_id === 'rng_perpus') days[j.hari].perpus++;
        else days[j.hari].labkom++;
        days[j.hari].total++;
      }
    });

    return days;
  }, [jadwalList]);

  // Monthly stats calculated dynamically from real schedule records
  const monthlyStats = useMemo(() => {
    const months = [
      { key: '07', label: 'Jul' },
      { key: '08', label: 'Agu' },
      { key: '09', label: 'Sep' },
      { key: '10', label: 'Okt' },
      { key: '11', label: 'Nov' },
      { key: '12', label: 'Des' },
    ];
    return months.map((m) => {
      const perpus = jadwalList.filter(
        (j) => j.status !== 'Dibatalkan' && j.ruangan_id === 'rng_perpus' && j.tanggal.includes(`-${m.key}-`)
      ).length;
      const labkom = jadwalList.filter(
        (j) => j.status !== 'Dibatalkan' && j.ruangan_id === 'rng_labkom' && j.tanggal.includes(`-${m.key}-`)
      ).length;
      return { month: m.label, perpus, labkom };
    });
  }, [jadwalList]);


  const handleQuickBook = (ruanganId?: string) => {
    setPrefilledBooking({
      tanggal: todayIso,
      hari: todayHariName,
      ruangan_id: ruanganId || 'rng_labkom',
      jam_ke: (currentPeriod < 8 ? currentPeriod + 1 : 1) as any,
    });
    setIsBookingModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / School Profile */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <School className="w-80 h-80 text-white transform rotate-12" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sistem Manajemen Fasilitas Terpadu</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight font-display">
              {settings.namaAplikasi}
            </h1>
            <p className="text-sm text-slate-300 font-medium max-w-2xl">
              {settings.namaSekolah} • Pemantauan dan reservasi real-time Ruang Perpustakaan & Ruang Lab. Komputer dengan validasi anti-bentrok.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-dash-buat-jadwal"
              onClick={() => handleQuickBook()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>Buat Jadwal Baru</span>
            </button>
            <button
              id="btn-dash-kalender"
              onClick={() => setActiveView('jadwal-kalender')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs sm:text-sm font-semibold transition-colors"
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Lihat Kalender Mingguan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Spreadsheet Realtime Auto-Sync Status Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white border border-emerald-200 shadow-xs text-xs">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
          </span>
          <span className="font-bold text-slate-800">
            Sinkronisasi Database Spreadsheet:
          </span>
          <span className="text-emerald-700 font-semibold truncate">
            {settings.googleSheetId || settings.googleSheetsId
              ? 'Realtime Aktif (Data baru pada spreadsheet akan otomatis dimuat tanpa klik tombol)'
              : 'ID Spreadsheet belum diatur'}
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-[11px] text-slate-500 font-mono">
            {lastSheetsSyncTime ? `Sinkron ${lastSheetsSyncTime} WIB` : 'Sedang memuat...'}
          </span>
          <button
            onClick={() => setIsSheetsModalOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[11px] transition-colors flex items-center gap-1 shrink-0"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Detail Sheet</span>
          </button>
        </div>
      </div>

      {/* 6 Key Stat Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Stat 1: Jadwal Hari Ini */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
              Hari Ini
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-display">{totalHariIni}</p>
          <p className="text-[10px] text-slate-500 mt-1">Total sesi terjadwal</p>
        </div>

        {/* Stat 2: Perpustakaan Hari Ini */}
        <div className="p-4 rounded-2xl bg-white border border-emerald-200/60 shadow-xs hover:border-emerald-300 transition-all bg-gradient-to-b from-white to-emerald-50/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-emerald-700 tracking-wider">
              Perpustakaan
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-900 font-display">{countPerpusToday}</p>
          <p className="text-[10px] text-emerald-700/80 mt-1">Total: {totalPerpusAll} sesi aktif</p>
        </div>

        {/* Stat 3: Lab Komputer Hari Ini */}
        <div className="p-4 rounded-2xl bg-white border border-indigo-200/60 shadow-xs hover:border-indigo-300 transition-all bg-gradient-to-b from-white to-indigo-50/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-indigo-700 tracking-wider">
              Lab. Komputer
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Monitor className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-indigo-900 font-display">{countLabkomToday}</p>
          <p className="text-[10px] text-indigo-700/80 mt-1">Total: {totalLabkomAll} sesi aktif</p>
        </div>

        {/* Stat 4: Jam Pembelajaran Aktif */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
              Sesi Sekarang
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center animate-pulse">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-slate-900 font-display">Jam ke-{currentPeriod}</p>
          <p className="text-[10px] text-amber-700 font-medium mt-1">
            {ongoingSchedules.length > 0 ? `${ongoingSchedules.length} ruang terisi` : 'Ruangan kosong'}
          </p>
        </div>

        {/* Stat 5: Sesi Berikutnya */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
              Berikutnya
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-display">{upcomingSchedules.length}</p>
          <p className="text-[10px] text-slate-500 mt-1">Sesi menanti hari ini</p>
        </div>

        {/* Stat 6: Database Guru */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
              Total Guru
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-display">{guruList.length}</p>
          <p className="text-[10px] text-slate-500 mt-1">Pengajar terdaftar</p>
        </div>
      </div>

      {/* Live Room Status Indicator Cards (Perpustakaan & Lab Komputer) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Room 1: Ruang Perpustakaan */}
        <div className="p-5 rounded-2xl bg-white border-2 border-emerald-500/30 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 font-display">Ruang Perpustakaan</h2>
                <p className="text-xs text-slate-500">Smart TV 65" • Sound System • Digital Library</p>
              </div>
            </div>

            {perpusOngoing ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-600" />
                SEDANG DIGUNAKAN
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                TERSEDIA
              </span>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-600 font-medium">
              <span>Sesi Sekarang (Jam ke-{currentPeriod}):</span>
              {perpusOngoing ? (
                <span className="font-bold text-slate-900">
                  {guruMap.get(perpusOngoing.guru_id)?.nama_guru}
                </span>
              ) : (
                <span className="text-emerald-700 font-bold">Kosong / Tersedia</span>
              )}
            </div>

            {perpusOngoing && (
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">
                  Mata Pelajaran: <strong className="text-slate-800">{perpusOngoing.mata_pelajaran}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                  Kelas {kelasMap.get(perpusOngoing.kelas_id)?.nama_kelas}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-slate-500 text-[11px]">
              <span>Penggunaan Berikutnya:</span>
              <span className="font-medium text-slate-700">
                {perpusNext
                  ? `Jam ke-${perpusNext.jam_ke} • ${guruMap.get(perpusNext.guru_id)?.nama_guru?.split(' ')[1] || 'Guru'}`
                  : 'Tidak ada jadwal lanjutan hari ini'}
              </span>
            </div>
          </div>

          <button
            onClick={() => handleQuickBook('rng_perpus')}
            className="w-full py-2 rounded-xl border border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Pesan Ruang Perpustakaan</span>
          </button>
        </div>

        {/* Room 2: Ruang Lab. Komputer */}
        <div className="p-5 rounded-2xl bg-white border-2 border-indigo-500/30 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 font-display">Ruang Lab. Komputer</h2>
                <p className="text-xs text-slate-500">36 Unit PC Core i7 • Laser Projector • Gigabit LAN</p>
              </div>
            </div>

            {labkomOngoing ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-600" />
                SEDANG DIGUNAKAN
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                TERSEDIA
              </span>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-600 font-medium">
              <span>Sesi Sekarang (Jam ke-{currentPeriod}):</span>
              {labkomOngoing ? (
                <span className="font-bold text-slate-900">
                  {guruMap.get(labkomOngoing.guru_id)?.nama_guru}
                </span>
              ) : (
                <span className="text-emerald-700 font-bold">Kosong / Tersedia</span>
              )}
            </div>

            {labkomOngoing && (
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">
                  Mata Pelajaran: <strong className="text-slate-800">{labkomOngoing.mata_pelajaran}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
                  Kelas {kelasMap.get(labkomOngoing.kelas_id)?.nama_kelas}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-slate-500 text-[11px]">
              <span>Penggunaan Berikutnya:</span>
              <span className="font-medium text-slate-700">
                {labkomNext
                  ? `Jam ke-${labkomNext.jam_ke} • ${guruMap.get(labkomNext.guru_id)?.nama_guru?.split(' ')[1] || 'Guru'}`
                  : 'Tidak ada jadwal lanjutan hari ini'}
              </span>
            </div>
          </div>

          <button
            onClick={() => handleQuickBook('rng_labkom')}
            className="w-full py-2 rounded-xl border border-indigo-600 text-indigo-700 hover:bg-indigo-50 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Pesan Ruang Lab. Komputer</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Weekly Usage Chart & Today's Schedule Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Usage Chart by Day & Month */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart 1: Penggunaan per Hari */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  Statistik Penggunaan Ruangan Mingguan
                </h3>
                <p className="text-xs text-slate-500">
                  Perbandingan beban pemakaian Ruang Perpustakaan vs Lab. Komputer (Senin - Sabtu)
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                  <span className="text-slate-600 font-medium">Perpustakaan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-indigo-500" />
                  <span className="text-slate-600 font-medium">Lab Komputer</span>
                </div>
              </div>
            </div>

            {/* Bar Chart Visual */}
            <div className="pt-4 grid grid-cols-6 gap-2 sm:gap-4 items-end h-48 border-b border-slate-200">
              {HARI_LIST.map((h) => {
                const data = usageByDay[h] || { perpus: 0, labkom: 0, total: 0 };
                const maxVal = 6; // Scale reference
                const heightPerpus = Math.min((data.perpus / maxVal) * 100, 100);
                const heightLabkom = Math.min((data.labkom / maxVal) * 100, 100);

                return (
                  <div key={h} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div className="flex items-end gap-1 sm:gap-1.5 w-full max-w-[42px] justify-center h-36">
                      {/* Perpus Bar */}
                      <div
                        style={{ height: `${Math.max(heightPerpus, 8)}%` }}
                        className="w-1/2 bg-emerald-500 group-hover:bg-emerald-600 rounded-t transition-all relative flex items-center justify-center"
                        title={`Perpustakaan: ${data.perpus} sesi`}
                      >
                        {data.perpus > 0 && (
                          <span className="text-[10px] text-white font-bold">{data.perpus}</span>
                        )}
                      </div>
                      {/* Labkom Bar */}
                      <div
                        style={{ height: `${Math.max(heightLabkom, 8)}%` }}
                        className="w-1/2 bg-indigo-500 group-hover:bg-indigo-600 rounded-t transition-all relative flex items-center justify-center"
                        title={`Lab Komputer: ${data.labkom} sesi`}
                      >
                        {data.labkom > 0 && (
                          <span className="text-[10px] text-white font-bold">{data.labkom}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-700">{h.slice(0, 3)}</span>
                  </div>
                );
              })}
            </div>

            {/* Monthly Trend Mini Bar */}
            <div className="pt-2">
              <p className="text-xs font-bold text-slate-700 mb-2">Tren Bulanan (Tahun Ajaran {settings.tahunPelajaran}):</p>
              <div className="grid grid-cols-6 gap-2">
                {monthlyStats.map((m) => (
                  <div key={m.month} className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{m.month}</span>
                    <p className="text-xs font-extrabold text-slate-900 mt-0.5">{m.perpus + m.labkom} sesi</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Shortcuts & Integrations Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-100 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 justify-center sm:justify-start">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Terhubung dengan Google Spreadsheet</span>
              </h4>
              <p className="text-xs text-slate-600">
                Database tersinkronisasi dengan spreadsheet cloud Albashiroh Turen.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSheetsModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Buka Sync Spreadsheet</span>
              </button>
              <button
                onClick={() => setActiveView('smart-tv')}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Tv className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mode Smart TV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Ringkasan Jadwal Hari Ini Timeline */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Jadwal Hari Ini ({todayHariName})
              </h3>
              <p className="text-xs text-slate-500">{todayJadwals.length} sesi terdaftar</p>
            </div>
            <button
              onClick={() => setActiveView('jadwal-kalender')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>Matriks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[440px] space-y-2.5 pr-1">
            {todayJadwals.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p>Belum ada jadwal penggunaan ruangan untuk hari ini.</p>
                <button
                  onClick={() => handleQuickBook()}
                  className="mt-3 text-xs font-bold text-emerald-600 hover:underline"
                >
                  + Jadwalkan Sekarang
                </button>
              </div>
            ) : (
              todayJadwals.map((j) => {
                const guru = guruMap.get(j.guru_id);
                const kelas = kelasMap.get(j.kelas_id);
                const isPerpus = j.ruangan_id === 'rng_perpus';
                const isOngoing = j.jam_ke === currentPeriod;

                return (
                  <div
                    key={j.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isOngoing
                        ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/30'
                        : isPerpus
                        ? 'bg-emerald-50/40 border-emerald-200/80 hover:bg-emerald-50'
                        : 'bg-indigo-50/40 border-indigo-200/80 hover:bg-indigo-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isOngoing
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-900 text-white'
                          }`}
                        >
                          Jam ke-{j.jam_ke}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            isPerpus
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {isPerpus ? 'Perpustakaan' : 'Lab Komputer'}
                        </span>
                      </div>

                      <span className="text-[10px] font-bold text-slate-600">
                        Kelas {kelas?.nama_kelas}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-900 truncate">
                      {guru?.nama_guru || 'Guru'}
                    </p>
                    <p className="text-[11px] text-slate-600 truncate mt-0.5">
                      {j.mata_pelajaran}
                    </p>

                    {j.keperluan && (
                      <p className="text-[10px] text-slate-500 italic truncate mt-1">
                        "{j.keperluan}"
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-2 border-t border-slate-200">
            <button
              onClick={() => setActiveView('jadwal-list')}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors text-center"
            >
              Lihat Daftar Semua Jadwal Lengkap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
