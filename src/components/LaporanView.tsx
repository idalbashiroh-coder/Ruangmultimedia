import React, { useMemo, useState } from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Download,
  Filter,
  GraduationCap,
  Monitor,
  Percent,
  Printer,
  School,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportJadwalToExcel, exportJadwalToPDF } from '../utils/exportUtils';

export const LaporanView: React.FC = () => {
  const { jadwalList, guruList, kelasList, ruanganList, settings } = useApp();

  const currentYear = new Date().getFullYear().toString();
  const currentMonthNum = (new Date().getMonth() + 1).toString().padStart(2, '0');

  const [selectedBulan, setSelectedBulan] = useState<string>(currentMonthNum);
  const [selectedTahun, setSelectedTahun] = useState<string>(currentYear);
  const [selectedRuangan, setSelectedRuangan] = useState<string>('ALL');
  const [selectedGuru, setSelectedGuru] = useState<string>('ALL');
  const [selectedMapel, setSelectedMapel] = useState<string>('ALL');
  const [selectedKelas, setSelectedKelas] = useState<string>('ALL');

  const guruMap = useMemo(() => new Map(guruList.map((g) => [g.id, g.nama_guru])), [guruList]);
  const kelasMap = useMemo(() => new Map(kelasList.map((k) => [k.id, k.nama_kelas])), [kelasList]);
  const ruanganMap = useMemo(() => new Map(ruanganList.map((r) => [r.id, r.nama_ruangan])), [ruanganList]);

  // Unique list of mapel
  const mapelOptions = useMemo(() => {
    const set = new Set<string>();
    guruList.forEach((g) => set.add(g.mata_pelajaran));
    return Array.from(set).sort();
  }, [guruList]);

  const monthNames: Record<string, string> = {
    '01': 'Januari',
    '02': 'Februari',
    '03': 'Maret',
    '04': 'April',
    '05': 'Mei',
    '06': 'Juni',
    '07': 'Juli',
    '08': 'Agustus',
    '09': 'September',
    '10': 'Oktober',
    '11': 'November',
    '12': 'Desember',
  };

  // Filtered schedules for report
  const filteredJadwal = useMemo(() => {
    const yearMonthPrefix = selectedBulan !== 'ALL' ? `${selectedTahun}-${selectedBulan}` : selectedTahun;

    return jadwalList.filter((j) => {
      if (selectedTahun !== 'ALL' && !j.tanggal.startsWith(yearMonthPrefix)) return false;
      if (selectedRuangan !== 'ALL' && j.ruangan_id !== selectedRuangan) return false;
      if (selectedGuru !== 'ALL' && j.guru_id !== selectedGuru) return false;
      if (selectedMapel !== 'ALL' && j.mata_pelajaran !== selectedMapel) return false;
      if (selectedKelas !== 'ALL' && j.kelas_id !== selectedKelas) return false;
      return true;
    });
  }, [
    jadwalList,
    selectedBulan,
    selectedTahun,
    selectedRuangan,
    selectedGuru,
    selectedMapel,
    selectedKelas,
  ]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = filteredJadwal.length;
    const perpusCount = filteredJadwal.filter((j) => j.ruangan_id === 'rng_perpus').length;
    const labkomCount = filteredJadwal.filter((j) => j.ruangan_id === 'rng_labkom').length;

    const perpusPercent = total > 0 ? Math.round((perpusCount / total) * 100) : 0;
    const labkomPercent = total > 0 ? Math.round((labkomCount / total) * 100) : 0;

    // Top Guru
    const guruCounts: Record<string, number> = {};
    filteredJadwal.forEach((j) => {
      guruCounts[j.guru_id] = (guruCounts[j.guru_id] || 0) + 1;
    });
    let topGuruId = '';
    let topGuruMax = 0;
    Object.entries(guruCounts).forEach(([gid, count]) => {
      if (count > topGuruMax) {
        topGuruMax = count;
        topGuruId = gid;
      }
    });

    // Top Mapel
    const mapelCounts: Record<string, number> = {};
    filteredJadwal.forEach((j) => {
      mapelCounts[j.mata_pelajaran] = (mapelCounts[j.mata_pelajaran] || 0) + 1;
    });
    let topMapel = '-';
    let topMapelMax = 0;
    Object.entries(mapelCounts).forEach(([mapel, count]) => {
      if (count > topMapelMax) {
        topMapelMax = count;
        topMapel = mapel;
      }
    });

    // Top Kelas
    const kelasCounts: Record<string, number> = {};
    filteredJadwal.forEach((j) => {
      kelasCounts[j.kelas_id] = (kelasCounts[j.kelas_id] || 0) + 1;
    });
    let topKelasId = '';
    let topKelasMax = 0;
    Object.entries(kelasCounts).forEach(([kid, count]) => {
      if (count > topKelasMax) {
        topKelasMax = count;
        topKelasId = kid;
      }
    });

    return {
      total,
      perpusCount,
      labkomCount,
      perpusPercent,
      labkomPercent,
      topGuru: guruMap.get(topGuruId) || '-',
      topGuruCount: topGuruMax,
      topMapel,
      topMapelCount: topMapelMax,
      topKelas: kelasMap.get(topKelasId) ? `Kelas ${kelasMap.get(topKelasId)}` : '-',
      topKelasCount: topKelasMax,
    };
  }, [filteredJadwal, guruMap, kelasMap]);

  const periodLabel = `${selectedBulan !== 'ALL' ? monthNames[selectedBulan] : 'Semua Bulan'} ${selectedTahun}`;

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    exportJadwalToPDF(
      filteredJadwal,
      guruList,
      kelasList,
      ruanganList,
      settings,
      `Periode: ${periodLabel}`
    );
  };

  const handleExportExcel = () => {
    exportJadwalToExcel(
      filteredJadwal,
      guruList,
      kelasList,
      ruanganList,
      `Laporan_Penggunaan_Ruangan_${selectedTahun}_${selectedBulan}`
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Action Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 font-display">
              Laporan Penggunaan Ruangan Multimedia
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {stats.total} Sesi
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Rekapitulasi dan analisis statistik peminjaman Ruang Perpustakaan & Lab. Komputer.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-print-laporan"
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Cetak Laporan</span>
          </button>
          <button
            id="btn-pdf-laporan"
            onClick={handleExportPDF}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-rose-400" />
            <span>Export PDF</span>
          </button>
          <button
            id="btn-excel-laporan"
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar (No print) */}
      <div className="no-print p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-emerald-600" />
          <span>Filter Periode & Parameter Laporan</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Bulan */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Bulan</label>
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Bulan</option>
              {Object.entries(monthNames).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Tahun */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Tahun</label>
            <select
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>

          {/* Ruangan */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Ruangan</label>
            <select
              value={selectedRuangan}
              onChange={(e) => setSelectedRuangan(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Ruangan</option>
              {ruanganList.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama_ruangan}
                </option>
              ))}
            </select>
          </div>

          {/* Guru */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Guru</label>
            <select
              value={selectedGuru}
              onChange={(e) => setSelectedGuru(e.target.value)}
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

          {/* Mapel */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Mata Pelajaran</label>
            <select
              value={selectedMapel}
              onChange={(e) => setSelectedMapel(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Mapel</option>
              {mapelOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Kelas */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Kelas</label>
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Kelas</option>
              {kelasList.map((k) => (
                <option key={k.id} value={k.id}>
                  Kelas {k.nama_kelas}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Ringkasan Statistik Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Penggunaan Perpus */}
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-emerald-700 block mb-1">
            Ruang Perpustakaan
          </span>
          <p className="text-xl font-extrabold text-emerald-950 font-display">
            {stats.perpusCount} <span className="text-xs font-normal text-emerald-700">sesi</span>
          </p>
          <div className="w-full bg-emerald-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full"
              style={{ width: `${stats.perpusPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">{stats.perpusPercent}% dari total</span>
        </div>

        {/* Total Penggunaan Labkom */}
        <div className="p-4 rounded-2xl bg-white border border-indigo-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-indigo-700 block mb-1">
            Ruang Lab. Komputer
          </span>
          <p className="text-xl font-extrabold text-indigo-950 font-display">
            {stats.labkomCount} <span className="text-xs font-normal text-indigo-700">sesi</span>
          </p>
          <div className="w-full bg-indigo-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full"
              style={{ width: `${stats.labkomPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">{stats.labkomPercent}% dari total</span>
        </div>

        {/* Guru Paling Sering */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
            Guru Tersering
          </span>
          <p className="text-xs font-bold text-slate-900 truncate" title={stats.topGuru}>
            {stats.topGuru}
          </p>
          <span className="text-[10px] text-emerald-700 font-bold mt-1 block">
            {stats.topGuruCount} sesi penggunaan
          </span>
        </div>

        {/* Mata Pelajaran Tersering */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
            Mapel Teraktif
          </span>
          <p className="text-xs font-bold text-slate-900 truncate" title={stats.topMapel}>
            {stats.topMapel}
          </p>
          <span className="text-[10px] text-indigo-700 font-bold mt-1 block">
            {stats.topMapelCount} sesi praktikum
          </span>
        </div>

        {/* Kelas Tersering */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
            Kelas Teraktif
          </span>
          <p className="text-sm font-extrabold text-slate-900 font-display">
            {stats.topKelas}
          </p>
          <span className="text-[10px] text-slate-600 mt-1 block">
            {stats.topKelasCount} sesi pembelajaran
          </span>
        </div>

        {/* Total Beban Penggunaan */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-xs">
          <span className="text-[10px] font-bold uppercase text-emerald-400 block mb-1">
            Total Sesi Terlaksana
          </span>
          <p className="text-2xl font-extrabold text-white font-display">
            {stats.total}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Periode {periodLabel}</span>
        </div>
      </div>

      {/* Official Printable Report Section with Kop Surat */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
        {/* Kop Surat Header (Visible on print & report preview) */}
        <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
          <h3 className="text-base sm:text-lg font-extrabold uppercase text-slate-900 tracking-wide font-display">
            {settings.namaSekolah}
          </h3>
          <h4 className="text-sm sm:text-base font-bold text-slate-800 uppercase tracking-tight">
            {settings.namaAplikasi}
          </h4>
          <p className="text-xs text-slate-600">
            {settings.alamatSekolah} | Tahun Pelajaran {settings.tahunPelajaran} ({settings.semester})
          </p>
          <div className="pt-2 text-xs font-bold text-slate-900 uppercase underline">
            LAPORAN REKAPITULASI PENGGUNAAN RUANGAN MULTIMEDIA (PERIODE: {periodLabel.toUpperCase()})
          </div>
        </div>

        {/* Report Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                <th className="p-2.5 text-center border-r border-slate-300 w-10">No</th>
                <th className="p-2.5 border-r border-slate-300">Tanggal & Hari</th>
                <th className="p-2.5 text-center border-r border-slate-300">Jam</th>
                <th className="p-2.5 border-r border-slate-300">Ruangan</th>
                <th className="p-2.5 border-r border-slate-300">Nama Guru</th>
                <th className="p-2.5 border-r border-slate-300">Mata Pelajaran</th>
                <th className="p-2.5 text-center border-r border-slate-300">Kelas</th>
                <th className="p-2.5 border-r border-slate-300">Keperluan Penggunaan</th>
                <th className="p-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredJadwal.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-slate-400 text-xs">
                    Tidak ada jadwal penggunaan ruangan tercatat pada periode ini.
                  </td>
                </tr>
              ) : (
                filteredJadwal.map((j, idx) => (
                  <tr key={j.id} className="hover:bg-slate-50">
                    <td className="p-2.5 text-center border-r border-slate-200 text-slate-500 font-mono">
                      {idx + 1}
                    </td>
                    <td className="p-2.5 border-r border-slate-200">
                      <span className="font-semibold">{j.hari}</span>,{' '}
                      <span className="font-mono text-[11px] text-slate-600">{j.tanggal}</span>
                    </td>
                    <td className="p-2.5 text-center border-r border-slate-200 font-bold">
                      Jam ke-{j.jam_ke}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 font-medium">
                      {ruanganMap.get(j.ruangan_id) || j.ruangan_id}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 font-bold text-slate-900">
                      {guruMap.get(j.guru_id) || j.guru_id}
                    </td>
                    <td className="p-2.5 border-r border-slate-200">{j.mata_pelajaran}</td>
                    <td className="p-2.5 text-center border-r border-slate-200 font-bold">
                      {kelasMap.get(j.kelas_id) || j.kelas_id}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 text-slate-700">
                      {j.keperluan || '-'}
                    </td>
                    <td className="p-2.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          j.status === 'Selesai'
                            ? 'bg-slate-100 text-slate-800'
                            : j.status === 'Dibatalkan'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {j.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Official Signatures for School Archive */}
        <div className="pt-8 flex justify-between text-xs text-slate-800">
          <div className="text-center space-y-16">
            <div>
              <p>Mengetahui,</p>
              <p className="font-bold">Kepala Sekolah</p>
            </div>
            <div>
              <p className="font-bold underline">{settings.kepalaSekolah}</p>
              <p className="font-mono text-[11px]">NIP. {settings.nipKepalaSekolah}</p>
            </div>
          </div>

          <div className="text-center space-y-16">
            <div>
              <p>Turen, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-bold">Koordinator Multimedia & Lab</p>
            </div>
            <div>
              <p className="font-bold underline">{settings.koordinatorLab}</p>
              <p className="font-mono text-[11px]">NIP. {settings.nipKoordinatorLab}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
