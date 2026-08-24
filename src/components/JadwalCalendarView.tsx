import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Filter,
  Info,
  Maximize2,
  PlusCircle,
  Printer,
  RefreshCw,
  School,
  Sparkles,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HARI_LIST, JAM_LIST, getDateOfCurrentWeek, getHariNameFromDate } from '../data/initialData';
import { HariType, Jadwal, JamPembelajaran } from '../types';
import { exportJadwalToExcel, exportJadwalToPDF } from '../utils/exportUtils';

export const JadwalCalendarView: React.FC = () => {
  const {
    jadwalList,
    guruList,
    kelasList,
    ruanganList,
    selectedWeekOffset,
    setSelectedWeekOffset,
    setIsBookingModalOpen,
    setPrefilledBooking,
    setEditingJadwal,
    deleteJadwal,
    cancelJadwal,
    completeJadwal,
    currentUser,
    settings,
  } = useApp();

  // Filters State
  const [filterRuangan, setFilterRuangan] = useState<string>('ALL');
  const [filterGuru, setFilterGuru] = useState<string>('ALL');
  const [filterMapel, setFilterMapel] = useState<string>('ALL');
  const [filterKelas, setFilterKelas] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Selected schedule detail popup
  const [selectedJadwalDetail, setSelectedJadwalDetail] = useState<Jadwal | null>(null);

  // Lookup maps
  const guruMap = useMemo(() => new Map(guruList.map((g) => [g.id, g])), [guruList]);
  const kelasMap = useMemo(() => new Map(kelasList.map((k) => [k.id, k])), [kelasList]);
  const ruanganMap = useMemo(() => new Map(ruanganList.map((r) => [r.id, r])), [ruanganList]);

  // Unique list of mapel for filter
  const mapelOptions = useMemo(() => {
    const set = new Set<string>();
    guruList.forEach((g) => set.add(g.mata_pelajaran));
    return Array.from(set).sort();
  }, [guruList]);

  // Calculate start & end date for the selected week
  const mondayDate = useMemo(
    () => getDateOfCurrentWeek('Senin', selectedWeekOffset),
    [selectedWeekOffset]
  );
  const saturdayDate = useMemo(
    () => getDateOfCurrentWeek('Sabtu', selectedWeekOffset),
    [selectedWeekOffset]
  );

  const formattedWeekRange = useMemo(() => {
    const d1 = new Date(mondayDate + 'T00:00:00');
    const d2 = new Date(saturdayDate + 'T00:00:00');
    return `${d1.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${d2.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }, [mondayDate, saturdayDate]);

  // Filtered schedules for this week
  const weekJadwals = useMemo(() => {
    return jadwalList.filter((j) => {
      // Date within week range
      if (j.tanggal < mondayDate || j.tanggal > saturdayDate) return false;

      // Filter by room
      if (filterRuangan !== 'ALL' && j.ruangan_id !== filterRuangan) return false;

      // Filter by guru
      if (filterGuru !== 'ALL' && j.guru_id !== filterGuru) return false;

      // Filter by mapel
      if (filterMapel !== 'ALL' && j.mata_pelajaran !== filterMapel) return false;

      // Filter by kelas
      if (filterKelas !== 'ALL' && j.kelas_id !== filterKelas) return false;

      // Filter by status
      if (filterStatus !== 'ALL' && j.status !== filterStatus) return false;

      return true;
    });
  }, [
    jadwalList,
    mondayDate,
    saturdayDate,
    filterRuangan,
    filterGuru,
    filterMapel,
    filterKelas,
    filterStatus,
  ]);

  // Helper to find schedule at [Hari, Jam, Optional Ruangan]
  const getSchedulesAtCell = (hari: HariType, jam: JamPembelajaran, ruanganId?: string) => {
    return weekJadwals.filter((j) => {
      if (j.hari !== hari || j.jam_ke !== jam) return false;
      if (ruanganId && j.ruangan_id !== ruanganId) return false;
      return true;
    });
  };

  const handleCellClickEmpty = (hari: HariType, jam: JamPembelajaran, ruanganId: string) => {
    const targetDate = getDateOfCurrentWeek(hari, selectedWeekOffset);
    setPrefilledBooking({
      tanggal: targetDate,
      hari,
      jam_ke: jam,
      ruangan_id: ruanganId,
    });
    setIsBookingModalOpen(true);
  };

  const handleExportPDF = () => {
    exportJadwalToPDF(
      weekJadwals,
      guruList,
      kelasList,
      ruanganList,
      settings,
      `Pekan ${formattedWeekRange}`
    );
  };

  const handleExportExcel = () => {
    exportJadwalToExcel(
      weekJadwals,
      guruList,
      kelasList,
      ruanganList,
      `Jadwal_Mingguan_${mondayDate}`
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 font-display">
              Kalender & Matriks Mingguan Ruangan Multimedia
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              8 Jam Pelajaran
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Navigasi per-pekan untuk melihat jadwal lampau, pekan berjalan, dan pekan mendatang.
          </p>
        </div>

        {/* Week Navigator Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button
              id="btn-prev-week"
              onClick={() => setSelectedWeekOffset((prev) => prev - 1)}
              className="p-1.5 rounded-lg hover:bg-white text-slate-700 hover:text-slate-900 transition-colors"
              title="Pekan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              id="btn-current-week"
              onClick={() => setSelectedWeekOffset(0)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                selectedWeekOffset === 0
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-white'
              }`}
            >
              {selectedWeekOffset === 0
                ? 'Pekan Ini'
                : selectedWeekOffset > 0
                ? `+${selectedWeekOffset} Pekan`
                : `${selectedWeekOffset} Pekan`}
            </button>

            <button
              id="btn-next-week"
              onClick={() => setSelectedWeekOffset((prev) => prev + 1)}
              className="p-1.5 rounded-lg hover:bg-white text-slate-700 hover:text-slate-900 transition-colors"
              title="Pekan Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="text-xs font-bold text-slate-700 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
            📅 {formattedWeekRange}
          </span>

          {/* Export buttons */}
          <div className="flex items-center gap-1.5">
            <button
              id="btn-export-pdf-matrix"
              onClick={handleExportPDF}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1"
              title="Export Laporan PDF Pekan Ini"
            >
              <Download className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">PDF</span>
            </button>
            <button
              id="btn-export-excel-matrix"
              onClick={handleExportExcel}
              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors flex items-center gap-1 border border-emerald-200"
              title="Export Excel Pekan Ini"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-emerald-600" />
          <span>Filter Tampilan Jadwal</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Ruangan Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Ruangan</label>
            <select
              value={filterRuangan}
              onChange={(e) => setFilterRuangan(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Ruangan (Split)</option>
              {ruanganList.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama_ruangan}
                </option>
              ))}
            </select>
          </div>

          {/* Guru Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Guru Pengajar</label>
            <select
              value={filterGuru}
              onChange={(e) => setFilterGuru(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Guru</option>
              {guruList.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nama_guru}
                </option>
              ))}
            </select>
          </div>

          {/* Mata Pelajaran Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Mata Pelajaran</label>
            <select
              value={filterMapel}
              onChange={(e) => setFilterMapel(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Mata Pelajaran</option>
              {mapelOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Kelas Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Kelas</label>
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Kelas</option>
              {kelasList.map((k) => (
                <option key={k.id} value={k.id}>
                  Kelas {k.nama_kelas} ({k.jenjang})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="Terjadwal">Terjadwal</option>
              <option value="Selesai">Selesai</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Color Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-bold text-slate-700">Keterangan Warna:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500" />
            <span className="text-slate-600 font-medium">Ruang Perpustakaan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-indigo-500" />
            <span className="text-slate-600 font-medium">Ruang Lab. Komputer</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-slate-400" />
            <span className="text-slate-600 font-medium">Selesai</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-red-400" />
            <span className="text-slate-600 font-medium">Dibatalkan</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-medium italic">
          💡 Klik pada slot kosong untuk langsung membuat jadwal pada jam tersebut.
        </div>
      </div>

      {/* Master Matrix Timetable (Hari x Jam 1-8) */}
      <div className="overflow-x-auto rounded-2xl bg-white border border-slate-200 shadow-xs">
        <table className="w-full min-w-[960px] border-collapse text-left text-xs">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="p-3.5 font-bold uppercase tracking-wider text-center border-r border-slate-800 w-28">
                Hari / Tanggal
              </th>
              {JAM_LIST.map((jam) => (
                <th
                  key={jam}
                  className="p-3 font-bold uppercase tracking-wider text-center border-r border-slate-800 last:border-r-0 min-w-[110px]"
                >
                  Jam ke-{jam}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {HARI_LIST.map((hari) => {
              const dayDate = getDateOfCurrentWeek(hari, selectedWeekOffset);
              const isToday = dayDate === new Date().toISOString().slice(0, 10);

              return (
                <tr
                  key={hari}
                  className={`transition-colors ${isToday ? 'bg-amber-50/30' : 'hover:bg-slate-50/50'}`}
                >
                  {/* Hari Column */}
                  <td className="p-3.5 border-r border-slate-200 align-top bg-slate-50/70">
                    <div className="sticky left-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-slate-900">{hari}</span>
                        {isToday && (
                          <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[9px] font-extrabold uppercase">
                            Hari Ini
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                        {new Date(dayDate + 'T00:00:00').toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                    </div>
                  </td>

                  {/* 8 Period Columns */}
                  {JAM_LIST.map((jam) => {
                    const cellSchedules = getSchedulesAtCell(hari, jam);
                    const perpusSchedule = cellSchedules.find((s) => s.ruangan_id === 'rng_perpus');
                    const labkomSchedule = cellSchedules.find((s) => s.ruangan_id === 'rng_labkom');

                    return (
                      <td
                        key={jam}
                        className="p-2 border-r border-slate-200 last:border-r-0 align-top min-h-[90px] h-full"
                      >
                        <div className="space-y-1.5 min-h-[80px] flex flex-col justify-start">
                          {/* Ruang Perpustakaan Slot */}
                          {(filterRuangan === 'ALL' || filterRuangan === 'rng_perpus') && (
                            <div>
                              {perpusSchedule ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedJadwalDetail(perpusSchedule)}
                                  className={`w-full text-left p-2 rounded-xl border text-[11px] transition-all hover:scale-[1.02] shadow-2xs ${
                                    perpusSchedule.status === 'Selesai'
                                      ? 'bg-slate-100 border-slate-300 text-slate-600'
                                      : perpusSchedule.status === 'Dibatalkan'
                                      ? 'bg-red-50 border-red-200 text-red-700 line-through opacity-70'
                                      : 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-1 ring-emerald-400/30'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-0.5">
                                    <span className="font-extrabold text-[10px] text-emerald-800 uppercase truncate">
                                      Perpus
                                    </span>
                                    <span className="font-bold text-[10px] px-1 rounded bg-emerald-200/80 text-emerald-900">
                                      {kelasMap.get(perpusSchedule.kelas_id)?.nama_kelas}
                                    </span>
                                  </div>
                                  <p className="font-bold truncate leading-tight">
                                    {guruMap.get(perpusSchedule.guru_id)?.nama_guru?.split(' ')[1] ||
                                      guruMap.get(perpusSchedule.guru_id)?.nama_guru ||
                                      'Guru'}
                                  </p>
                                  <p className="text-[10px] text-slate-600 truncate mt-0.5">
                                    {perpusSchedule.mata_pelajaran}
                                  </p>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleCellClickEmpty(hari, jam, 'rng_perpus')}
                                  className="w-full py-1.5 px-1 rounded-lg border border-dashed border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-[10px] text-emerald-700/60 font-medium transition-colors flex items-center justify-center gap-1 group"
                                  title={`Pesan Ruang Perpustakaan ${hari} Jam ke-${jam}`}
                                >
                                  <PlusCircle className="w-3 h-3 group-hover:scale-110 transition-transform" />
                                  <span>+ Perpus</span>
                                </button>
                              )}
                            </div>
                          )}

                          {/* Ruang Lab. Komputer Slot */}
                          {(filterRuangan === 'ALL' || filterRuangan === 'rng_labkom') && (
                            <div>
                              {labkomSchedule ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedJadwalDetail(labkomSchedule)}
                                  className={`w-full text-left p-2 rounded-xl border text-[11px] transition-all hover:scale-[1.02] shadow-2xs ${
                                    labkomSchedule.status === 'Selesai'
                                      ? 'bg-slate-100 border-slate-300 text-slate-600'
                                      : labkomSchedule.status === 'Dibatalkan'
                                      ? 'bg-red-50 border-red-200 text-red-700 line-through opacity-70'
                                      : 'bg-indigo-50 border-indigo-400 text-indigo-950 ring-1 ring-indigo-400/30'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-0.5">
                                    <span className="font-extrabold text-[10px] text-indigo-800 uppercase truncate">
                                      Labkom
                                    </span>
                                    <span className="font-bold text-[10px] px-1 rounded bg-indigo-200/80 text-indigo-900">
                                      {kelasMap.get(labkomSchedule.kelas_id)?.nama_kelas}
                                    </span>
                                  </div>
                                  <p className="font-bold truncate leading-tight">
                                    {guruMap.get(labkomSchedule.guru_id)?.nama_guru?.split(' ')[1] ||
                                      guruMap.get(labkomSchedule.guru_id)?.nama_guru ||
                                      'Guru'}
                                  </p>
                                  <p className="text-[10px] text-slate-600 truncate mt-0.5">
                                    {labkomSchedule.mata_pelajaran}
                                  </p>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleCellClickEmpty(hari, jam, 'rng_labkom')}
                                  className="w-full py-1.5 px-1 rounded-lg border border-dashed border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-[10px] text-indigo-700/60 font-medium transition-colors flex items-center justify-center gap-1 group"
                                  title={`Pesan Ruang Lab Komputer ${hari} Jam ke-${jam}`}
                                >
                                  <PlusCircle className="w-3 h-3 group-hover:scale-110 transition-transform" />
                                  <span>+ Labkom</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Selected Schedule Detail Card Popup Modal */}
      {selectedJadwalDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                    selectedJadwalDetail.ruangan_id === 'rng_perpus'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}
                >
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-display">
                    {ruanganMap.get(selectedJadwalDetail.ruangan_id)?.nama_ruangan}
                  </h3>
                  <span
                    className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      selectedJadwalDetail.status === 'Selesai'
                        ? 'bg-slate-200 text-slate-800'
                        : selectedJadwalDetail.status === 'Dibatalkan'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    Status: {selectedJadwalDetail.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedJadwalDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Hari & Tanggal:</span>
                  <span className="font-bold text-slate-800">
                    {selectedJadwalDetail.hari},{' '}
                    {new Date(selectedJadwalDetail.tanggal + 'T00:00:00').toLocaleDateString(
                      'id-ID',
                      { day: 'numeric', month: 'long', year: 'numeric' }
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Jam Pembelajaran:</span>
                  <span className="font-extrabold text-slate-900 px-2 py-0.5 rounded bg-slate-200">
                    Jam ke-{selectedJadwalDetail.jam_ke}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Guru Pengajar:</span>
                  <span className="font-bold text-slate-900">
                    {guruMap.get(selectedJadwalDetail.guru_id)?.nama_guru}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mata Pelajaran:</span>
                  <span className="font-medium text-slate-800">
                    {selectedJadwalDetail.mata_pelajaran}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kelas:</span>
                  <span className="font-bold text-emerald-800">
                    Kelas {kelasMap.get(selectedJadwalDetail.kelas_id)?.nama_kelas}
                  </span>
                </div>
              </div>

              {selectedJadwalDetail.keperluan && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block mb-0.5">Keperluan:</span>
                  <p className="font-medium text-slate-800 italic">
                    "{selectedJadwalDetail.keperluan}"
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {selectedJadwalDetail.status === 'Terjadwal' && (
                  <>
                    <button
                      onClick={() => {
                        completeJadwal(selectedJadwalDetail.id);
                        setSelectedJadwalDetail(null);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Selesai</span>
                    </button>
                    <button
                      onClick={() => {
                        cancelJadwal(selectedJadwalDetail.id);
                        setSelectedJadwalDetail(null);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Batal</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => {
                    setEditingJadwal(selectedJadwalDetail);
                    setIsBookingModalOpen(true);
                    setSelectedJadwalDetail(null);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
                >
                  Edit
                </button>
              </div>

              {/* Admin delete rule */}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => {
                    if (confirm('Apakah Anda yakin ingin menghapus jadwal ini secara permanen?')) {
                      deleteJadwal(selectedJadwalDetail.id);
                      setSelectedJadwalDetail(null);
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
