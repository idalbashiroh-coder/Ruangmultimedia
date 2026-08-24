import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Edit2,
  Monitor,
  PlusCircle,
  School,
  Sparkles,
  Trash2,
  Tv,
  Wrench,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Ruangan } from '../types';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

export const DatabaseRuanganView: React.FC = () => {
  const { ruanganList, createRuangan, updateRuangan, deleteRuangan, currentUser } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRuangan, setEditingRuangan] = useState<Ruangan | null>(null);
  const [deletingRuangan, setDeletingRuangan] = useState<Ruangan | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Form State
  const [namaRuangan, setNamaRuangan] = useState('');
  const [status, setStatus] = useState<Ruangan['status']>('Tersedia');
  const [keterangan, setKeterangan] = useState('');
  const [kapasitas, setKapasitas] = useState(36);
  const [fasilitasInput, setFasilitasInput] = useState('');

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingRuangan(null);
    setNamaRuangan('');
    setStatus('Tersedia');
    setKeterangan('');
    setKapasitas(36);
    setFasilitasInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (r: Ruangan) => {
    setEditingRuangan(r);
    setNamaRuangan(r.nama_ruangan);
    setStatus(r.status);
    setKeterangan(r.keterangan || '');
    setKapasitas(r.kapasitas || 36);
    setFasilitasInput((r.fasilitas || []).join(', '));
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaRuangan.trim()) return;

    const parsedFasilitas = fasilitasInput
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    if (editingRuangan) {
      updateRuangan(editingRuangan.id, {
        nama_ruangan: namaRuangan.trim(),
        status,
        keterangan,
        kapasitas: Number(kapasitas) || 36,
        fasilitas: parsedFasilitas,
      });
      showToast(`Ruangan "${namaRuangan.trim()}" berhasil diperbarui.`);
    } else {
      createRuangan({
        nama_ruangan: namaRuangan.trim(),
        status,
        keterangan,
        kapasitas: Number(kapasitas) || 36,
        fasilitas: parsedFasilitas,
        warna: '#059669',
      });
      showToast(`Ruangan baru "${namaRuangan.trim()}" berhasil ditambahkan.`);
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deletingRuangan) return;
    const res = deleteRuangan(deletingRuangan.id);
    showToast(res.message || `Ruangan "${deletingRuangan.nama_ruangan}" berhasil dihapus.`);
    setDeletingRuangan(null);
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
            <h2 className="text-lg font-bold text-slate-900 font-display">
              Data Master Ruangan Multimedia
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {ruanganList.length} Ruangan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar ruangan multimedia & sarana digital yang dapat direservasi guru dan staf.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Tambah Ruangan Baru</span>
        </button>
      </div>

      {/* Room Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ruanganList.map((r) => {
          const isPerpus = r.id === 'rng_perpus';
          const isLabkom = r.id === 'rng_labkom';

          return (
            <div
              key={r.id}
              className={`p-6 rounded-2xl bg-white border-2 shadow-xs space-y-4 transition-all hover:shadow-md ${
                isPerpus
                  ? 'border-emerald-500/40'
                  : isLabkom
                  ? 'border-indigo-500/40'
                  : 'border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${
                      isPerpus
                        ? 'bg-emerald-600'
                        : isLabkom
                        ? 'bg-indigo-600'
                        : 'bg-slate-800'
                    }`}
                  >
                    {isPerpus ? (
                      <BookOpen className="w-6 h-6" />
                    ) : isLabkom ? (
                      <Monitor className="w-6 h-6" />
                    ) : (
                      <School className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-display">
                      {r.nama_ruangan}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Kapasitas: <strong className="text-slate-800">{r.kapasitas || 36}</strong> Siswa
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    r.status === 'Tersedia'
                      ? 'bg-emerald-100 text-emerald-800'
                      : r.status === 'Sedang Digunakan'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {r.status}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {r.keterangan || 'Tidak ada deskripsi tambahan.'}
              </p>

              {/* Facilities Tags */}
              <div>
                <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Fasilitas & Sarana:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {r.fasilitas && r.fasilitas.length > 0 ? (
                    r.fasilitas.map((f, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{f}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">Belum ada rincian fasilitas.</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(r)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Ruangan</span>
                </button>
                {!isPerpus && !isLabkom && (
                  <button
                    onClick={() => setDeletingRuangan(r)}
                    className="px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 text-xs font-bold transition-colors flex items-center gap-1"
                    title="Hapus Ruangan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Ruangan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold font-display">
                {editingRuangan ? 'Edit Data Ruangan' : 'Tambah Ruangan Multimedia Baru'}
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
                  Nama Ruangan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={namaRuangan}
                  onChange={(e) => setNamaRuangan(e.target.value)}
                  placeholder="Contoh: Ruang Audio Visual / Podcast"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Kapasitas (Orang)</label>
                  <input
                    type="number"
                    value={kapasitas}
                    onChange={(e) => setKapasitas(Number(e.target.value))}
                    min={1}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Status Awal</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Tersedia">Tersedia</option>
                    <option value="Sedang Digunakan">Sedang Digunakan</option>
                    <option value="Pemeliharaan">Pemeliharaan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Keterangan / Fasilitas Deskripsi
                </label>
                <textarea
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  rows={2}
                  placeholder="Deskripsi perangkat yang tersedia di ruangan..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Daftar Fasilitas (Pisahkan dengan Koma)
                </label>
                <input
                  type="text"
                  value={fasilitasInput}
                  onChange={(e) => setFasilitasInput(e.target.value)}
                  placeholder="Contoh: Smart TV 65 Inch, AC 2 PK, Sound System Wireless"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                />
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
                  {editingRuangan ? 'Simpan Perubahan' : 'Tambah Ruangan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete Ruangan */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingRuangan)}
        onClose={() => setDeletingRuangan(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Data Ruangan"
        message="Apakah Anda yakin ingin menghapus ruangan ini dari database? Ruangan default perpustakaan dan labkom utama dilindungi dari penghapusan."
        itemName={deletingRuangan ? deletingRuangan.nama_ruangan : undefined}
        confirmButtonText="Hapus Ruangan"
        isDangerous={true}
      />
    </div>
  );
};
