import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Download,
  Edit2,
  Filter,
  PlusCircle,
  Printer,
  Search,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Jadwal } from '../types';
import { exportJadwalToExcel, exportJadwalToPDF } from '../utils/exportUtils';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

export const JadwalListView: React.FC = () => {
  const {
    jadwalList,
    guruList,
    kelasList,
    ruanganList,
    setIsBookingModalOpen,
    setEditingJadwal,
    setPrefilledBooking,
    deleteJadwal,
    clearAllJadwal,
    cancelJadwal,
    completeJadwal,
    currentUser,
    settings,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRuangan, setFilterRuangan] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterHari, setFilterHari] = useState('ALL');
  const [filterMonth, setFilterMonth] = useState('ALL');

  // Deletion modals
  const [deletingJadwal, setDeletingJadwal] = useState<Jadwal | null>(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const guruMap = useMemo(() => new Map(guruList.map((g) => [g.id, g.nama_guru])), [guruList]);
  const kelasMap = useMemo(() => new Map(kelasList.map((k) => [k.id, k.nama_kelas])), [kelasList]);
  const ruanganMap = useMemo(() => new Map(ruanganList.map((r) => [r.id, r.nama_ruangan])), [ruanganList]);

  // Filtered schedules
  const filteredJadwal = useMemo(() => {
    return jadwalList
      .filter((j) => {
        if (filterRuangan !== 'ALL' && j.ruangan_id !== filterRuangan) return false;
        if (filterStatus !== 'ALL' && j.status !== filterStatus) return false;
        if (filterHari !== 'ALL' && j.hari !== filterHari) return false;
        if (filterMonth !== 'ALL' && !j.tanggal.startsWith(filterMonth)) return false;

        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const guruName = (guruMap.get(j.guru_id) || '').toLowerCase();
          const kelasName = (kelasMap.get(j.kelas_id) || '').toLowerCase();
          const mapel = j.mata_pelajaran.toLowerCase();
          const keperluan = (j.keperluan || '').toLowerCase();
          if (
            !guruName.includes(term) &&
            !kelasName.includes(term) &&
            !mapel.includes(term) &&
            !keperluan.includes(term) &&
            !j.tanggal.includes(term)
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal) || a.jam_ke - b.jam_ke);
  }, [jadwalList, filterRuangan, filterStatus, filterHari, filterMonth, searchTerm, guruMap, kelasMap]);

  const handleExportPDF = () => {
    exportJadwalToPDF(
      filteredJadwal,
      guruList,
      kelasList,
      ruanganList,
      settings,
      'Daftar Jadwal Lengkap'
    );
  };

  const handleExportExcel = () => {
    exportJadwalToExcel(filteredJadwal, guruList, kelasList, ruanganList, 'Daftar_Jadwal_Multimedia');
  };

  const handleConfirmSingleDelete = () => {
    if (!deletingJadwal) return;
    const res = deleteJadwal(deletingJadwal.id);
    showToast(res.message || 'Jadwal berhasil dihapus dari sistem.');
    setDeletingJadwal(null);
  };

  const handleConfirmClearAll = () => {
    const res = clearAllJadwal();
    showToast(res.message || 'Seluruh database jadwal peminjam berhasil dibersihkan.');
    setIsClearAllModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="p-3.5 rounded-xl bg-emerald-600 text-white flex items-center justify-between shadow-lg text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{feedbackToast}</span>
          </div>
          <button onClick={() => setFeedbackToast(null)} className="p-1 hover:bg-white/20 rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-display">
            Daftar Seluruh Jadwal Penggunaan Ruangan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {filteredJadwal.length} dari {jadwalList.length} riwayat jadwal peminjam tercatat.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentUser?.role === 'admin' && jadwalList.length > 0 && (
            <button
              id="btn-clear-jadwal-database"
              onClick={() => setIsClearAllModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-all flex items-center gap-1.5"
              title="Hapus seluruh database jadwal peminjaman ruangan"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span>Hapus Database Jadwal</span>
            </button>
          )}

          <button
            id="btn-export-excel-list"
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Excel</span>
          </button>
          <button
            id="btn-export-pdf-list"
            onClick={handleExportPDF}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-rose-400" />
            <span>Export PDF</span>
          </button>
          <button
            id="btn-add-jadwal-list"
            onClick={() => {
              setPrefilledBooking(null);
              setIsBookingModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Jadwal Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari guru, mapel, kelas, atau keperluan..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Ruangan Filter */}
          <div>
            <select
              value={filterRuangan}
              onChange={(e) => setFilterRuangan(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Ruangan</option>
              {ruanganList.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama_ruangan}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="Terjadwal">Terjadwal</option>
              <option value="Selesai">Selesai</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
          </div>

          {/* Hari Filter */}
          <div>
            <select
              value={filterHari}
              onChange={(e) => setFilterHari(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Hari</option>
              <option value="Senin">Senin</option>
              <option value="Selasa">Selasa</option>
              <option value="Rabu">Rabu</option>
              <option value="Kamis">Kamis</option>
              <option value="Jumat">Jumat</option>
              <option value="Sabtu">Sabtu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="overflow-x-auto rounded-2xl bg-white border border-slate-200 shadow-xs">
        <table className="w-full min-w-[850px] text-left text-xs">
          <thead>
            <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider">
              <th className="p-3.5 text-center w-12">No</th>
              <th className="p-3.5">Tanggal / Hari</th>
              <th className="p-3.5 text-center">Jam</th>
              <th className="p-3.5">Ruangan</th>
              <th className="p-3.5">Guru Pengajar</th>
              <th className="p-3.5">Mata Pelajaran & Kelas</th>
              <th className="p-3.5">Keperluan</th>
              <th className="p-3.5 text-center">Status</th>
              <th className="p-3.5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredJadwal.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-400 text-xs">
                  Tidak ada jadwal yang sesuai dengan filter pencarian.
                </td>
              </tr>
            ) : (
              filteredJadwal.map((j, idx) => {
                const isPerpus = j.ruangan_id === 'rng_perpus';

                return (
                  <tr key={j.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">{j.hari}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{j.tanggal}</p>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-1 rounded bg-slate-100 font-extrabold text-slate-900">
                        Jam {j.jam_ke}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          isPerpus
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {ruanganMap.get(j.ruangan_id) || j.ruangan_id}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">
                      {guruMap.get(j.guru_id) || j.guru_id}
                    </td>
                    <td className="p-3.5">
                      <p className="font-semibold text-slate-800">{j.mata_pelajaran}</p>
                      <span className="inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-800">
                        Kelas {kelasMap.get(j.kelas_id) || j.kelas_id}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 max-w-[200px] truncate" title={j.keperluan}>
                      {j.keperluan || '-'}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          j.status === 'Selesai'
                            ? 'bg-slate-100 text-slate-700'
                            : j.status === 'Dibatalkan'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {j.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {j.status === 'Terjadwal' && (
                          <>
                            <button
                              onClick={() => completeJadwal(j.id)}
                              title="Tandai Selesai"
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => cancelJadwal(j.id)}
                              title="Batalkan Jadwal"
                              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setEditingJadwal(j);
                            setIsBookingModalOpen(true);
                          }}
                          title="Edit Jadwal"
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingJadwal(j)}
                          title="Hapus Jadwal (Permanen)"
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Single Schedule Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingJadwal)}
        onClose={() => setDeletingJadwal(null)}
        onConfirm={handleConfirmSingleDelete}
        title="Hapus Jadwal Peminjaman"
        message="Apakah Anda yakin ingin menghapus jadwal peminjaman ruangan ini? Data jadwal akan dihapus permanen dari sistem."
        itemName={
          deletingJadwal
            ? `${guruMap.get(deletingJadwal.guru_id) || 'Guru'} - ${deletingJadwal.mata_pelajaran} (${deletingJadwal.tanggal}, Jam ${deletingJadwal.jam_ke})`
            : undefined
        }
        confirmButtonText="Hapus Jadwal"
        isDangerous={true}
      />

      {/* Clear All Schedules Database Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isClearAllModalOpen}
        onClose={() => setIsClearAllModalOpen(false)}
        onConfirm={handleConfirmClearAll}
        title="Hapus Seluruh Database Jadwal Peminjam"
        message={`Apakah Anda yakin ingin mengosongkan seluruh ${jadwalList.length} data jadwal peminjaman ruangan? Seluruh riwayat jadwal akan terhapus bersih. Master data guru, kelas, dan ruangan akan tetap aman tersimpan.`}
        confirmButtonText="Kosongkan Semua Jadwal"
        isDangerous={true}
      />
    </div>
  );
};
