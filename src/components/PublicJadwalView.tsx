import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Filter,
  GraduationCap,
  Layers,
  Lock,
  Monitor,
  PlusCircle,
  School,
  ShieldCheck,
  Sparkles,
  Tv,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  HARI_LIST,
  JAM_LIST,
  formatGuruDisplayName,
  getDateOfCurrentWeek,
  getFormattedJamRange,
  getHariNameFromDate,
  getLocalDateString,
} from '../data/initialData';

export const PublicJadwalView: React.FC = () => {
  const {
    jadwalList,
    guruList,
    kelasList,
    ruanganList,
    setActiveView,
    setIsBookingModalOpen,
    setIsLoginModalOpen,
    currentUser,
    settings,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'today' | 'weekly'>('today');
  const [filterRuangan, setFilterRuangan] = useState<string>('ALL');

  // Real-time ticking date to ensure day & date always stay up to date
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const todayIso = useMemo(() => getLocalDateString(currentDate), [currentDate]);
  const todayHariName = useMemo(() => getHariNameFromDate(currentDate), [currentDate]);

  const guruMap = useMemo(() => new Map(guruList.map((g) => [g.id, g.nama_guru])), [guruList]);
  const kelasMap = useMemo(() => new Map(kelasList.map((k) => [k.id, k.nama_kelas])), [kelasList]);
  const ruanganMap = useMemo(() => new Map(ruanganList.map((r) => [r.id, r.nama_ruangan])), [ruanganList]);

  // Helper to safely get teacher full or short name
  const getGuruName = (guruId: string, short: boolean = false): string => {
    if (!guruId) return 'Guru Pengajar';
    if (guruMap.has(guruId)) {
      return formatGuruDisplayName(guruMap.get(guruId)!, short);
    }
    const found = guruList.find(
      (g) =>
        g.id.toLowerCase() === guruId.toLowerCase() ||
        g.nama_guru.toLowerCase() === guruId.toLowerCase() ||
        (g.nama_guru.length > 3 && guruId.toLowerCase().includes(g.nama_guru.toLowerCase()))
    );
    if (found) {
      return formatGuruDisplayName(found.nama_guru, short);
    }
    return formatGuruDisplayName(guruId, short);
  };

  const getKelasName = (kelasId: string): string => {
    if (!kelasId) return '-';
    if (kelasMap.has(kelasId)) return kelasMap.get(kelasId)!;
    const found = kelasList.find(
      (k) => k.id.toLowerCase() === kelasId.toLowerCase() || k.nama_kelas.toLowerCase() === kelasId.toLowerCase()
    );
    if (found) return found.nama_kelas;
    return kelasId;
  };

  const getRuanganName = (ruangId: string): string => {
    if (!ruangId) return 'Ruangan';
    if (ruanganMap.has(ruangId)) return ruanganMap.get(ruangId)!;
    const found = ruanganList.find(
      (r) => r.id.toLowerCase() === ruangId.toLowerCase() || r.nama_ruangan.toLowerCase() === ruangId.toLowerCase()
    );
    if (found) return found.nama_ruangan;
    return ruangId;
  };

  // Today's schedules
  const todaySchedules = useMemo(() => {
    const currentWeekTargetDate = getDateOfCurrentWeek(todayHariName as any, 0, currentDate);

    return jadwalList
      .filter((j) => {
        // Matches if:
        // 1. Direct date matches today (j.tanggal === todayIso)
        // 2. OR matching today's day name (j.hari === todayHariName) and either no date or matches this week's date for that day
        const isDateMatch = j.tanggal === todayIso;
        const isHariMatch = j.hari && j.hari.toLowerCase() === todayHariName.toLowerCase();
        
        if (!isDateMatch) {
          if (!isHariMatch) return false;
          // If schedule has a specific date and it's NOT today and not this week's date for this day
          if (j.tanggal && j.tanggal !== todayIso && j.tanggal !== currentWeekTargetDate) {
            return false;
          }
        }

        if (filterRuangan !== 'ALL' && j.ruangan_id !== filterRuangan) return false;
        return true;
      })
      .sort((a, b) => a.jam_ke - b.jam_ke);
  }, [jadwalList, todayIso, todayHariName, filterRuangan, currentDate]);

  // Current week schedules
  const mondayDate = useMemo(() => getDateOfCurrentWeek('Senin', 0, currentDate), [currentDate]);
  const saturdayDate = useMemo(() => getDateOfCurrentWeek('Sabtu', 0, currentDate), [currentDate]);

  const weeklySchedules = useMemo(() => {
    return jadwalList.filter((j) => {
      if (j.tanggal && (j.tanggal < mondayDate || j.tanggal > saturdayDate)) return false;
      if (filterRuangan !== 'ALL' && j.ruangan_id !== filterRuangan) return false;
      return true;
    });
  }, [jadwalList, mondayDate, saturdayDate, filterRuangan]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-16 space-y-6">
      {/* Public Header Banner */}
      <div className="bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <School className="w-8 h-8" />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-1">
                Akses Publik Guru & Siswa
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight font-display">
                {settings.namaAplikasi}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                {settings.namaSekolah} • Tahun Pelajaran {settings.tahunPelajaran}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
            {/* Booking Trigger */}
            <button
              id="btn-public-booking"
              onClick={() => setIsBookingModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Ajukan Peminjaman</span>
            </button>

            {/* Smart TV Display */}
            <button
              id="btn-public-smart-tv"
              onClick={() => setActiveView('smart-tv')}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
              title="Buka Tampilan Digital Signage Smart TV"
            >
              <Tv className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xs:inline">Mode Smart TV</span>
            </button>

            {/* Admin Dashboard / Login Trigger */}
            <button
              id="btn-public-admin-dashboard"
              onClick={() => {
                if (!currentUser) {
                  setIsLoginModalOpen(true);
                } else {
                  setActiveView('dashboard');
                }
              }}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-800 hover:from-teal-600 hover:to-emerald-700 text-white text-xs font-bold shadow-sm transition-all hover:scale-105 flex items-center gap-1.5"
              title="Masuk ke Dashboard Administrator & Manajemen Jadwal"
            >
              {currentUser ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Dashboard Admin ({currentUser.nama.split(' ')[0]})</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Admin Dashboard / Login</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Navigation Tabs & Room Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('today')}
              className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'today'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Jadwal Hari Ini ({todayHariName})
            </button>
            <button
              onClick={() => setActiveTab('weekly')}
              className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'weekly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Jadwal Mingguan (Senin - Sabtu)
            </button>
          </div>

          {/* Filter Ruangan */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-600">Filter:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setFilterRuangan('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  filterRuangan === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Semua Ruangan
              </button>
              <button
                onClick={() => setFilterRuangan('rng_perpus')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  filterRuangan === 'rng_perpus'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Perpustakaan
              </button>
              <button
                onClick={() => setFilterRuangan('rng_labkom')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  filterRuangan === 'rng_labkom'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
                }`}
              >
                Lab. Komputer
              </button>
            </div>
          </div>
        </div>

        {/* View 1: JADWAL HARI INI */}
        {activeTab === 'today' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold uppercase tracking-tight text-slate-900 font-display flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <span>JADWAL PENGGUNAAN RUANGAN HARI INI</span>
              </h2>
              <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>
                  {currentDate.toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </span>
            </div>

            {todaySchedules.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <Calendar className="w-12 h-12 mx-auto text-slate-300" />
                <p className="text-sm font-bold text-slate-700">
                  Tidak ada jadwal penggunaan ruangan hari ini.
                </p>
                <p className="text-xs text-slate-500">
                  Kedua ruangan (Perpustakaan & Lab. Komputer) saat ini dalam kondisi kosong / tersedia untuk digunakan.
                </p>
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="mt-2 inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Ajukan Pemakaian Sekarang</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {todaySchedules.map((j) => {
                  const isPerpus = j.ruangan_id === 'rng_perpus';

                  return (
                    <div
                      key={j.id}
                      className={`p-5 rounded-2xl bg-white border-2 shadow-xs transition-all space-y-3 ${
                        isPerpus
                          ? 'border-emerald-500/40 hover:border-emerald-500'
                          : 'border-indigo-500/40 hover:border-indigo-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-extrabold text-white flex items-center gap-1.5 ${
                            isPerpus ? 'bg-emerald-600' : 'bg-indigo-600'
                          }`}
                        >
                          <span>Jam ke-{j.jam_ke}</span>
                          <span className="opacity-80 text-[11px] font-normal">
                            ({getFormattedJamRange(j.hari, j.jam_ke, settings)})
                          </span>
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            j.status === 'Selesai'
                              ? 'bg-slate-200 text-slate-800'
                              : j.status === 'Dibatalkan'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {j.status}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                          {getRuanganName(j.ruangan_id)}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">
                          {getGuruName(j.guru_id)}
                        </h3>
                        <p className="text-xs font-medium text-emerald-800 mt-0.5">
                          {j.mata_pelajaran}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          Kelas {getKelasName(j.kelas_id)}
                        </span>
                        <span className="text-slate-500 text-[11px] truncate max-w-[140px]" title={j.keperluan}>
                          {j.keperluan || 'Kegiatan KBM'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* View 2: MATRIKS MINGGUAN PUBLIK */}
        {activeTab === 'weekly' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold uppercase tracking-tight text-slate-900 font-display flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <span>MATRIKS PENGGUNAAN RUANGAN PEKAN INI</span>
              </h2>
              <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                Senin - Sabtu (8 Jam Pelajaran)
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl bg-white border border-slate-200 shadow-xs">
              <table className="w-full min-w-[850px] border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold">
                    <th className="p-3 text-center w-24 border-r border-slate-800">Hari</th>
                    {JAM_LIST.map((jam) => (
                      <th key={jam} className="p-3 text-center border-r border-slate-800 last:border-r-0">
                        Jam ke-{jam}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {HARI_LIST.map((hari) => (
                    <tr key={hari} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900 bg-slate-50 border-r border-slate-200 text-center">
                        {hari}
                      </td>
                      {JAM_LIST.map((jam) => {
                        const cellSchedules = weeklySchedules.filter(
                          (j) => j.hari === hari && j.jam_ke === jam && j.status !== 'Dibatalkan'
                        );

                        return (
                          <td key={jam} className="p-1.5 border-r border-slate-200 last:border-r-0 align-top min-h-[70px]">
                            {cellSchedules.length === 0 ? (
                              <div className="text-center py-4 text-[10px] text-slate-300 font-medium">
                                -
                              </div>
                            ) : (
                              <div className="space-y-1">
                                {cellSchedules.map((s) => {
                                  const isPerpus = s.ruangan_id === 'rng_perpus';
                                  return (
                                    <div
                                      key={s.id}
                                      className={`p-1.5 rounded-lg text-[10px] border ${
                                        isPerpus
                                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                                          : 'bg-indigo-50 border-indigo-300 text-indigo-950'
                                      }`}
                                    >
                                      <div className="flex justify-between font-bold">
                                        <span>{isPerpus ? 'Perpus' : 'Labkom'}</span>
                                        <span>{getKelasName(s.kelas_id)}</span>
                                      </div>
                                      <p className="truncate font-semibold mt-0.5" title={getGuruName(s.guru_id)}>
                                        {getGuruName(s.guru_id, true)}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
