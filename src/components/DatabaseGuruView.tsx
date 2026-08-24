import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Download,
  Edit2,
  FileSpreadsheet,
  GraduationCap,
  PlusCircle,
  Search,
  Trash2,
  Upload,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useApp } from '../context/AppContext';
import { Guru, JenjangType } from '../types';
import { exportGuruToExcel } from '../utils/exportUtils';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

export const DatabaseGuruView: React.FC = () => {
  const { guruList, createGuru, updateGuru, deleteGuru, importGuruBatch, currentUser } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenjang, setFilterJenjang] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuru, setEditingGuru] = useState<Guru | null>(null);
  const [deletingGuru, setDeletingGuru] = useState<Guru | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Form State
  const [namaGuru, setNamaGuru] = useState('');
  const [nip, setNip] = useState('');
  const [mataPelajaran, setMataPelajaran] = useState('');
  const [jenjang, setJenjang] = useState<JenjangType>('SMP & SMA');
  const [nomorHp, setNomorHp] = useState('');
  const [status, setStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const filteredGurus = useMemo(() => {
    return guruList.filter((g) => {
      if (filterJenjang !== 'ALL' && g.jenjang !== filterJenjang) return false;
      if (filterStatus !== 'ALL' && g.status !== filterStatus) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          g.nama_guru.toLowerCase().includes(term) ||
          g.mata_pelajaran.toLowerCase().includes(term) ||
          (g.nip && g.nip.includes(term))
        );
      }
      return true;
    });
  }, [guruList, filterJenjang, filterStatus, searchTerm]);

  const handleOpenAdd = () => {
    setEditingGuru(null);
    setNamaGuru('');
    setNip('');
    setMataPelajaran('');
    setJenjang('SMP & SMA');
    setNomorHp('');
    setStatus('Aktif');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (guru: Guru) => {
    setEditingGuru(guru);
    setNamaGuru(guru.nama_guru);
    setNip(guru.nip || '');
    setMataPelajaran(guru.mata_pelajaran);
    setJenjang(guru.jenjang);
    setNomorHp(guru.nomor_hp || '');
    setStatus(guru.status);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaGuru.trim() || !mataPelajaran.trim()) return;

    if (editingGuru) {
      updateGuru(editingGuru.id, {
        nama_guru: namaGuru,
        nip,
        mata_pelajaran: mataPelajaran,
        jenjang,
        nomor_hp: nomorHp,
        status,
      });
      showToast(`Data guru "${namaGuru}" berhasil diperbarui.`);
    } else {
      createGuru({
        nama_guru: namaGuru,
        nip,
        mata_pelajaran: mataPelajaran,
        jenjang,
        nomor_hp: nomorHp,
        status,
      });
      showToast(`Guru baru "${namaGuru}" berhasil ditambahkan.`);
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deletingGuru) return;
    const res = deleteGuru(deletingGuru.id);
    showToast(res.message || `Data guru "${deletingGuru.nama_guru}" berhasil dihapus.`);
    setDeletingGuru(null);
  };

  // Handle Excel/CSV import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const rows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const parsedGurus: Omit<Guru, 'id'>[] = rows.map((r) => ({
          nama_guru: r['Nama Lengkap Guru'] || r['Nama Guru'] || r['nama_guru'] || 'Guru',
          nip: String(r['NIP / NUPTK'] || r['NIP'] || r['nip'] || ''),
          mata_pelajaran: r['Mata Pelajaran'] || r['mata_pelajaran'] || 'Umum',
          jenjang: (r['Jenjang'] || 'SMP & SMA') as JenjangType,
          nomor_hp: String(r['Nomor HP / WhatsApp'] || r['No HP'] || ''),
          status: (r['Status'] || 'Aktif') as any,
        }));

        if (parsedGurus.length > 0) {
          importGuruBatch(parsedGurus);
          alert(`Berhasil mengimpor ${parsedGurus.length} data guru!`);
        }
      } catch (err) {
        alert('Gagal membaca file Excel/CSV. Pastikan format kolom sesuai template.');
      }
    };
    reader.readAsBinaryString(file);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 font-display">Database Guru Pengajar</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {guruList.length} Guru
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Master data tenaga pendidik SMA & SMP IT Albashiroh Turen yang terintegrasi dengan form jadwal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Import Excel */}
          <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200">
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>Import Excel</span>
            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* Export Excel */}
          <button
            onClick={() => exportGuruToExcel(guruList)}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Excel</span>
          </button>

          {/* Add Guru Button */}
          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Tambah Guru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama guru, NIP, atau mata pelajaran..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={filterJenjang}
              onChange={(e) => setFilterJenjang(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Jenjang (SMP & SMA)</option>
              <option value="SMP">Hanya SMP</option>
              <option value="SMA">Hanya SMA</option>
              <option value="SMP & SMA">SMP & SMA</option>
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Guru Table */}
      <div className="overflow-x-auto rounded-2xl bg-white border border-slate-200 shadow-xs">
        <table className="w-full min-w-[760px] text-left text-xs">
          <thead>
            <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider">
              <th className="p-3.5 text-center w-12">No</th>
              <th className="p-3.5">Nama Lengkap & NIP</th>
              <th className="p-3.5">Mata Pelajaran</th>
              <th className="p-3.5 text-center">Jenjang</th>
              <th className="p-3.5">Nomor HP / WhatsApp</th>
              <th className="p-3.5 text-center">Status</th>
              <th className="p-3.5 text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredGurus.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                  Tidak ada guru yang sesuai dengan pencarian.
                </td>
              </tr>
            ) : (
              filteredGurus.map((g, idx) => (
                <tr key={g.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 text-center text-slate-400 font-mono">{idx + 1}</td>
                  <td className="p-3.5">
                    <p className="font-bold text-slate-900">{g.nama_guru}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {g.nip ? `NIP. ${g.nip}` : 'NIP: -'}
                    </p>
                  </td>
                  <td className="p-3.5 font-semibold text-emerald-800">{g.mata_pelajaran}</td>
                  <td className="p-3.5 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                      {g.jenjang}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-600">{g.nomor_hp || '-'}</td>
                  <td className="p-3.5 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        g.status === 'Aktif'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {g.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(g)}
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                        title="Edit Data Guru"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingGuru(g)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                        title="Hapus Guru"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Guru Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold font-display">
                {editingGuru ? 'Edit Data Guru' : 'Tambah Guru Pengajar Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Nama Lengkap Guru (dengan Gelar) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={namaGuru}
                  onChange={(e) => setNamaGuru(e.target.value)}
                  placeholder="Contoh: Ustadz Ahmad Fauzi, S.Kom."
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    NIP / NUPTK (Opsional)
                  </label>
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="19880412..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Jenjang</label>
                  <select
                    value={jenjang}
                    onChange={(e) => setJenjang(e.target.value as JenjangType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="SMP & SMA">SMP & SMA</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Mata Pelajaran Diampu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={mataPelajaran}
                  onChange={(e) => setMataPelajaran(e.target.value)}
                  placeholder="Contoh: Informatika & Robotika"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Nomor HP / WA</label>
                  <input
                    type="text"
                    value={nomorHp}
                    onChange={(e) => setNomorHp(e.target.value)}
                    placeholder="0812345678..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {editingGuru ? 'Simpan Perubahan' : 'Tambah Guru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete Guru */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingGuru)}
        onClose={() => setDeletingGuru(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Data Guru"
        message="Apakah Anda yakin ingin menghapus data guru berikut dari database sistem? Data yang sudah dihapus tidak dapat dipulihkan."
        itemName={deletingGuru ? `${deletingGuru.nama_guru} (${deletingGuru.mata_pelajaran})` : undefined}
        confirmButtonText="Hapus Guru"
        isDangerous={true}
      />
    </div>
  );
};
