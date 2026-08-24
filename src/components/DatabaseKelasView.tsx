import React, { useState } from 'react';
import { CheckCircle2, Edit2, GraduationCap, PlusCircle, Trash2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Kelas } from '../types';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

export const DatabaseKelasView: React.FC = () => {
  const { kelasList, createKelas, updateKelas, deleteKelas, currentUser } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKelas, setEditingKelas] = useState<Kelas | null>(null);
  const [deletingKelas, setDeletingKelas] = useState<Kelas | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const [namaKelas, setNamaKelas] = useState('');
  const [jenjang, setJenjang] = useState<'SMP' | 'SMA'>('SMP');
  const [status, setStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const smpKelas = kelasList.filter((k) => k.jenjang === 'SMP');
  const smaKelas = kelasList.filter((k) => k.jenjang === 'SMA');

  const handleOpenAdd = (defaultJenjang: 'SMP' | 'SMA' = 'SMP') => {
    setEditingKelas(null);
    setNamaKelas('');
    setJenjang(defaultJenjang);
    setStatus('Aktif');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (k: Kelas) => {
    setEditingKelas(k);
    setNamaKelas(k.nama_kelas);
    setJenjang(k.jenjang);
    setStatus(k.status);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKelas.trim()) return;

    if (editingKelas) {
      updateKelas(editingKelas.id, {
        nama_kelas: namaKelas.trim(),
        jenjang,
        status,
      });
      showToast(`Kelas "${namaKelas.trim()}" berhasil diperbarui.`);
    } else {
      createKelas({
        nama_kelas: namaKelas.trim(),
        jenjang,
        status,
      });
      showToast(`Kelas baru "${namaKelas.trim()}" (${jenjang}) berhasil ditambahkan.`);
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deletingKelas) return;
    const res = deleteKelas(deletingKelas.id);
    showToast(res.message || `Kelas "${deletingKelas.nama_kelas}" berhasil dihapus.`);
    setDeletingKelas(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Feedback Toast */}
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
            <h2 className="text-lg font-bold text-slate-900 font-display">Database Master Kelas</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {kelasList.length} Kelas Terdaftar
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Master rombongan belajar SMP & SMA IT Albashiroh Turen.
          </p>
        </div>

        <button
          onClick={() => handleOpenAdd('SMP')}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Tambah Kelas Baru</span>
        </button>
      </div>

      {/* 2 Column Cards: SMP & SMA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SMP Section */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display">Jenjang SMP IT</h3>
                <p className="text-[11px] text-slate-500">{smpKelas.length} Rombel Terdata</p>
              </div>
            </div>
            <button
              onClick={() => handleOpenAdd('SMP')}
              className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-colors"
            >
              + Kelas SMP
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {smpKelas.map((k) => (
              <div
                key={k.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900 font-display">
                    {k.nama_kelas}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                      k.status === 'Aktif'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {k.status}
                  </span>
                </div>
                <div className="pt-2 mt-2 border-t border-slate-200/60 flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100">
                  <button
                    onClick={() => handleOpenEdit(k)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 text-[11px] transition-colors"
                    title="Edit Kelas"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingKelas(k)}
                    className="p-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 text-[11px] transition-colors"
                    title="Hapus Kelas"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SMA Section */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display">Jenjang SMA IT</h3>
                <p className="text-[11px] text-slate-500">{smaKelas.length} Rombel Terdata</p>
              </div>
            </div>
            <button
              onClick={() => handleOpenAdd('SMA')}
              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold transition-colors"
            >
              + Kelas SMA
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {smaKelas.map((k) => (
              <div
                key={k.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900 font-display">
                    {k.nama_kelas}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                      k.status === 'Aktif'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {k.status}
                  </span>
                </div>
                <div className="pt-2 mt-2 border-t border-slate-200/60 flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100">
                  <button
                    onClick={() => handleOpenEdit(k)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 text-[11px] transition-colors"
                    title="Edit Kelas"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingKelas(k)}
                    className="p-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 text-[11px] transition-colors"
                    title="Hapus Kelas"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Add / Edit Kelas */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold font-display">
                {editingKelas ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}
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
                  Nama Kelas <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={namaKelas}
                  onChange={(e) => setNamaKelas(e.target.value)}
                  placeholder="Contoh: VII A, VIII B, X A, dsb."
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Jenjang</label>
                  <select
                    value={jenjang}
                    onChange={(e) => setJenjang(e.target.value as 'SMP' | 'SMA')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                  </select>
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
                  {editingKelas ? 'Simpan Perubahan' : 'Tambah Kelas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete Kelas */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingKelas)}
        onClose={() => setDeletingKelas(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Data Kelas"
        message="Apakah Anda yakin ingin menghapus kelas ini dari master data? Jadwal yang terkait dengan kelas ini akan tetap tersimpan dalam riwayat."
        itemName={deletingKelas ? `Kelas ${deletingKelas.nama_kelas} (${deletingKelas.jenjang})` : undefined}
        confirmButtonText="Hapus Kelas"
        isDangerous={true}
      />
    </div>
  );
};
