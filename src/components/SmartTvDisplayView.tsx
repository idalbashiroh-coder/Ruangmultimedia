import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Maximize2,
  Minimize2,
  Monitor,
  Radio,
  School,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  JAM_LIST,
  formatGuruDisplayName,
  getCurrentPeriodForHari,
  getFormattedJamRange,
  getHariNameFromDate,
} from '../data/initialData';
import { JamPembelajaran } from '../types';

export const SmartTvDisplayView: React.FC = () => {
  const { jadwalList, guruList, kelasList, ruanganList, setActiveView, settings } = useApp();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Live time ticker every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const todayIso = useMemo(() => currentTime.toISOString().slice(0, 10), [currentTime]);
  const todayHariName = useMemo(() => getHariNameFromDate(todayIso), [todayIso]);

  const guruMap = useMemo(() => new Map(guruList.map((g) => [g.id, g.nama_guru])), [guruList]);
  const kelasMap = useMemo(() => new Map(kelasList.map((k) => [k.id, k.nama_kelas])), [kelasList]);
  const ruanganMap = useMemo(() => new Map(ruanganList.map((r) => [r.id, r.nama_ruangan])), [ruanganList]);

  // Safe helper to resolve guru name
  const getGuruName = (guruId: string): string => {
    if (!guruId) return 'Guru Pengajar';
    if (guruMap.has(guruId)) return formatGuruDisplayName(guruMap.get(guruId)!);
    const found = guruList.find(
      (g) =>
        g.id.toLowerCase() === guruId.toLowerCase() ||
        g.nama_guru.toLowerCase() === guruId.toLowerCase() ||
        (g.nama_guru.length > 3 && guruId.toLowerCase().includes(g.nama_guru.toLowerCase()))
    );
    if (found) return formatGuruDisplayName(found.nama_guru);
    return formatGuruDisplayName(guruId);
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

  // Today's active schedules
  const todaySchedules = useMemo(() => {
    return jadwalList
      .filter((j) => j.tanggal === todayIso && j.status !== 'Dibatalkan')
      .sort((a, b) => a.jam_ke - b.jam_ke);
  }, [jadwalList, todayIso]);

  // Determine current active Jam Ke based on day-specific session schedule
  const currentApproxJam: JamPembelajaran | null = useMemo(() => {
    return getCurrentPeriodForHari(todayHariName as any, settings, currentTime);
  }, [todayHariName, settings, currentTime]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const perpusToday = todaySchedules.filter((j) => j.ruangan_id === 'rng_perpus');
  const labkomToday = todaySchedules.filter((j) => j.ruangan_id === 'rng_labkom');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 select-none overflow-hidden font-sans">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">
            <School className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
                <span>Live Digital Signage</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono text-[11px] font-bold flex items-center gap-1.5 border border-teal-500/30">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-400"></span>
                </span>
                <span>Auto-Sync Realtime</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-display">
              {settings.namaAplikasi}
            </h1>
            <p className="text-xs text-slate-400 font-medium">{settings.namaSekolah}</p>
          </div>
        </div>

        {/* Live Digital Clock */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-emerald-400">
              {currentTime.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </div>
            <div className="text-xs font-bold text-slate-400">
              {currentTime.toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setActiveView('dashboard')}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Dual-Screen Room Board (Split Screen for TV) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-auto py-4">
        {/* Panel 1: RUANG PERPUSTAKAAN */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-emerald-500/30 shadow-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/40">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white font-display">RUANG PERPUSTAKAAN</h2>
                <p className="text-xs text-slate-400">Pusat Literasi & Multimedia Terpadu</p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {perpusToday.length} Jadwal Hari Ini
            </span>
          </div>

          {/* Schedule timeline list for Perpus */}
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {perpusToday.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <p className="text-sm font-bold">Ruangan Kosong Hari Ini</p>
                <p className="text-xs text-slate-600 mt-1">Belum ada reservasi terjadwal.</p>
              </div>
            ) : (
              JAM_LIST.map((jam) => {
                const schedule = perpusToday.find((j) => j.jam_ke === jam);
                const isCurrent = currentApproxJam === jam;

                if (!schedule) {
                  return (
                    <div
                      key={jam}
                      className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/40 flex items-center justify-between text-xs text-slate-600"
                    >
                      <span className="font-mono font-bold">Jam ke-{jam}</span>
                      <span className="text-[11px] italic">Tersedia / Kosong</span>
                    </div>
                  );
                }

                return (
                  <div
                    key={jam}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-emerald-950/60 border-emerald-400 ring-2 ring-emerald-500/30'
                        : 'bg-slate-950 border-emerald-900/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black text-xs">
                          Jam ke-{schedule.jam_ke}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[10px] uppercase animate-pulse">
                            Sedang Berlangsung
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-xs px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                        Kelas {getKelasName(schedule.kelas_id)}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between mt-1">
                      <h3 className="text-sm font-bold text-white">
                        {getGuruName(schedule.guru_id)}
                      </h3>
                      <p className="text-xs font-semibold text-emerald-400">
                        {schedule.mata_pelajaran}
                      </p>
                    </div>

                    {schedule.keperluan && (
                      <p className="text-[11px] text-slate-400 mt-1 italic truncate">
                        "{schedule.keperluan}"
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Panel 2: RUANG LAB. KOMPUTER */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-indigo-500/30 shadow-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/40">
                <Monitor className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white font-display">RUANG LAB. KOMPUTER</h2>
                <p className="text-xs text-slate-400">Pusat Komputasi & Praktikum IT</p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {labkomToday.length} Jadwal Hari Ini
            </span>
          </div>

          {/* Schedule timeline list for Labkom */}
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {labkomToday.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <p className="text-sm font-bold">Ruangan Kosong Hari Ini</p>
                <p className="text-xs text-slate-600 mt-1">Belum ada reservasi terjadwal.</p>
              </div>
            ) : (
              JAM_LIST.map((jam) => {
                const schedule = labkomToday.find((j) => j.jam_ke === jam);
                const isCurrent = currentApproxJam === jam;

                if (!schedule) {
                  return (
                    <div
                      key={jam}
                      className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/40 flex items-center justify-between text-xs text-slate-600"
                    >
                      <span className="font-mono font-bold">Jam ke-{jam}</span>
                      <span className="text-[11px] italic">Tersedia / Kosong</span>
                    </div>
                  );
                }

                return (
                  <div
                    key={jam}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-indigo-950/60 border-indigo-400 ring-2 ring-indigo-500/30'
                        : 'bg-slate-950 border-indigo-900/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-indigo-500 text-slate-950 font-black text-xs">
                          Jam ke-{schedule.jam_ke}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[10px] uppercase animate-pulse">
                            Sedang Berlangsung
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-xs px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                        Kelas {getKelasName(schedule.kelas_id)}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between mt-1">
                      <h3 className="text-sm font-bold text-white">
                        {getGuruName(schedule.guru_id)}
                      </h3>
                      <p className="text-xs font-semibold text-indigo-400">
                        {schedule.mata_pelajaran}
                      </p>
                    </div>

                    {schedule.keperluan && (
                      <p className="text-[11px] text-slate-400 mt-1 italic truncate">
                        "{schedule.keperluan}"
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Running Text / Marquee Ticker */}
      <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 flex items-center gap-3 overflow-hidden">
        <div className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 shrink-0">
          <Volume2 className="w-3.5 h-3.5" />
          <span>Pengumuman</span>
        </div>

        <div className="overflow-hidden whitespace-nowrap w-full">
          <div className="inline-block animate-marquee text-xs font-semibold text-slate-300 space-x-12">
            <span>
              📢 Selamat Datang di Pusat Ruangan Multimedia SMA - SMP IT Albashiroh Turen.
            </span>
            <span>
              📌 Harap melakukan reservasi sebelum menggunakan Ruang Perpustakaan atau Ruang Lab. Komputer.
            </span>
            <span>
              ⚡ Dilarang membawa makanan & minuman manis ke dalam Lab Komputer.
            </span>
            <span>
              💡 Pastikan mematikan AC, proyektor, dan merapikan kembali perangkat setelah pembelajaran selesai.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
