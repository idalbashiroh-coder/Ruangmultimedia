import React, { useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  Info,
  Layers,
  School,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HARI_LIST, JAM_LIST, getHariNameFromDate } from '../data/initialData';
import { HariType, JamPembelajaran, StatusJadwal } from '../types';

export const JadwalFormModal: React.FC = () => {
  const {
    isBookingModalOpen,
    setIsBookingModalOpen,
    editingJadwal,
    setEditingJadwal,
    prefilledBooking,
    guruList,
    kelasList,
    ruanganList,
    checkConflict,
    createJadwal,
    updateJadwal,
    currentUser,
  } = useApp();

  // Form State
  const [tanggal, setTanggal] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [hari, setHari] = useState<HariType>('Senin');
  const [ruanganId, setRuanganId] = useState<string>('');
  const [selectedJams, setSelectedJams] = useState<JamPembelajaran[]>([1]);
  const [guruId, setGuruId] = useState<string>('');
  const [mataPelajaran, setMataPelajaran] = useState<string>('');
  const [kelasId, setKelasId] = useState<string>('');
  const [keperluan, setKeperluan] = useState<string>('');
  const [status, setStatus] = useState<StatusJadwal>('Terjadwal');

  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Initialize form when opening modal
  useEffect(() => {
    if (!isBookingModalOpen) {
      setNotification(null);
      return;
    }

    if (editingJadwal) {
      setTanggal(editingJadwal.tanggal);
      setHari(editingJadwal.hari);
      setRuanganId(editingJadwal.ruangan_id);
      setSelectedJams([editingJadwal.jam_ke]);
      setGuruId(editingJadwal.guru_id);
      setMataPelajaran(editingJadwal.mata_pelajaran);
      setKelasId(editingJadwal.kelas_id);
      setKeperluan(editingJadwal.keperluan || '');
      setStatus(editingJadwal.status);
    } else {
      // Default to today or prefilled
      const defaultTanggal = prefilledBooking?.tanggal || new Date().toISOString().slice(0, 10);
      const calculatedHari = prefilledBooking?.hari || getHariNameFromDate(defaultTanggal);
      const defaultRuangan = prefilledBooking?.ruangan_id || ruanganList[0]?.id || '';
      const defaultJam = prefilledBooking?.jam_ke ? [prefilledBooking.jam_ke] : [1];

      setTanggal(defaultTanggal);
      setHari(calculatedHari as HariType);
      setRuanganId(defaultRuangan);
      setSelectedJams(defaultJam);

      // Auto select current user if teacher
      if (currentUser?.role === 'guru') {
        const matchingGuru = guruList.find(
          (g) => g.nama_guru.toLowerCase().includes(currentUser.nama.toLowerCase()) || g.id === currentUser.id
        );
        if (matchingGuru) {
          setGuruId(matchingGuru.id);
          setMataPelajaran(matchingGuru.mata_pelajaran);
        } else if (guruList.length > 0) {
          setGuruId(guruList[0].id);
          setMataPelajaran(guruList[0].mata_pelajaran);
        }
      } else if (guruList.length > 0) {
        setGuruId(guruList[0].id);
        setMataPelajaran(guruList[0].mata_pelajaran);
      }

      setKelasId(kelasList[0]?.id || '');
      setKeperluan('');
      setStatus('Terjadwal');
    }
  }, [isBookingModalOpen, editingJadwal, prefilledBooking, ruanganList, guruList, kelasList, currentUser]);

  // Sync Hari when Tanggal changes
  const handleTanggalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setTanggal(newDate);
    if (newDate) {
      const calculated = getHariNameFromDate(newDate);
      setHari(calculated as HariType);
    }
  };

  // Auto-fill Mata Pelajaran when Guru is selected
  const handleGuruChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setGuruId(selectedId);
    const guru = guruList.find((g) => g.id === selectedId);
    if (guru) {
      setMataPelajaran(guru.mata_pelajaran);
    }
  };

  // Toggle Jam Pembelajaran (Supports multi-period booking)
  const toggleJam = (jam: JamPembelajaran) => {
    if (editingJadwal) {
      // While editing single schedule, only single period is allowed
      setSelectedJams([jam]);
      return;
    }

    if (selectedJams.includes(jam)) {
      if (selectedJams.length > 1) {
        setSelectedJams(selectedJams.filter((j) => j !== jam));
      }
    } else {
      setSelectedJams([...selectedJams, jam].sort((a, b) => a - b));
    }
  };

  // Live Conflict Check
  const conflictResult = useMemo(() => {
    if (!ruanganId || !tanggal || selectedJams.length === 0) {
      return { hasConflict: false };
    }
    return checkConflict(ruanganId, tanggal, selectedJams, editingJadwal?.id);
  }, [ruanganId, tanggal, selectedJams, editingJadwal, checkConflict]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (!guruId) {
      setNotification({ type: 'error', message: 'Silakan pilih guru pengajar.' });
      return;
    }

    if (!kelasId) {
      setNotification({ type: 'error', message: 'Silakan pilih kelas.' });
      return;
    }

    if (!ruanganId) {
      setNotification({ type: 'error', message: 'Silakan pilih ruangan multimedia.' });
      return;
    }

    if (conflictResult.hasConflict) {
      setNotification({
        type: 'error',
        message: conflictResult.message || 'Jadwal tidak dapat disimpan karena terjadi bentrok penggunaan ruangan!',
      });
      return;
    }

    if (editingJadwal) {
      const res = updateJadwal(editingJadwal.id, {
        tanggal,
        hari,
        jam_ke: selectedJams[0],
        guru_id: guruId,
        mata_pelajaran: mataPelajaran,
        kelas_id: kelasId,
        ruangan_id: ruanganId,
        keperluan,
        status,
      });

      if (res.success) {
        setNotification({ type: 'success', message: res.message });
        setTimeout(() => {
          setIsBookingModalOpen(false);
          setEditingJadwal(null);
        }, 900);
      } else {
        setNotification({ type: 'error', message: res.message });
      }
    } else {
      const res = createJadwal({
        tanggal,
        hari,
        jam_ke: selectedJams[0],
        jam_ke_list: selectedJams,
        guru_id: guruId,
        mata_pelajaran: mataPelajaran,
        kelas_id: kelasId,
        ruangan_id: ruanganId,
        keperluan,
        status,
      });

      if (res.success) {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
        });
        setNotification({ type: 'success', message: res.message });
        setTimeout(() => {
          setIsBookingModalOpen(false);
        }, 1000);
      } else {
        setNotification({ type: 'error', message: res.message });
      }
    }
  };

  const selectedRuanganObj = ruanganList.find((r) => r.id === ruanganId);

  if (!isBookingModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white font-display">
                {editingJadwal ? 'Edit Jadwal Penggunaan Ruangan' : 'Buat Jadwal Baru Ruangan Multimedia'}
              </h2>
              <p className="text-xs text-slate-400">
                SMA - SMP IT ALBASHIROH TUREN | Sistem Pencegahan Bentrok Otomatis
              </p>
            </div>
          </div>
          <button
            id="btn-close-modal-jadwal"
            onClick={() => {
              setIsBookingModalOpen(false);
              setEditingJadwal(null);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Notification / Error Banner */}
          {notification && (
            <div
              className={`p-3.5 rounded-xl text-xs font-medium flex items-start gap-2.5 ${
                notification.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'bg-red-50 text-red-900 border border-red-200'
              }`}
            >
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">{notification.message}</div>
            </div>
          )}

          {/* CRITICAL: Conflict Warning Banner */}
          {conflictResult.hasConflict && (
            <div
              id="alert-bentrok-jadwal"
              className="p-4 rounded-xl bg-rose-50 border-2 border-rose-400 text-rose-950 flex items-start gap-3 shadow-xs animate-shake"
            >
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-rose-900 text-sm">
                  ⚠️ Peringatan Bentrok Jadwal Terdeteksi!
                </p>
                <p className="leading-relaxed font-medium text-rose-800">
                  {conflictResult.message}
                </p>
                <p className="text-[11px] text-rose-600">
                  Silakan ganti jam pembelajaran, pilih ruangan lain, atau jadwalkan pada hari berbeda.
                </p>
              </div>
            </div>
          )}

          {/* Section 1: Ruangan & Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pilih Ruangan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Pilih Ruangan <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ruanganList.map((r) => {
                  const isSelected = ruanganId === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      id={`btn-select-room-${r.id}`}
                      onClick={() => setRuanganId(r.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? r.id === 'rng_perpus'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20'
                            : 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-2 ring-indigo-500/20'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <School
                          className={`w-4 h-4 ${
                            r.id === 'rng_perpus' ? 'text-emerald-600' : 'text-indigo-600'
                          }`}
                        />
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        )}
                      </div>
                      <p className="text-xs font-bold truncate">{r.nama_ruangan}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Kapasitas: {r.kapasitas || 36} orang</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tanggal & Hari */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tanggal & Hari Penggunaan <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  id="input-jadwal-tanggal"
                  value={tanggal || ''}
                  onChange={handleTanggalChange}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-100 rounded-lg text-xs">
                  <span className="text-slate-500 font-medium">Hari:</span>
                  <span className="font-bold text-slate-900 px-2 py-0.5 bg-white rounded border border-slate-200">
                    {hari}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Pilih Jam Pembelajaran (1 - 8) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pilih Jam Pembelajaran <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-500">
                {editingJadwal
                  ? 'Pilih 1 jam'
                  : 'Bisa pilih lebih dari satu jam sekaligus (blok jam)'}
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {JAM_LIST.map((jam) => {
                const isSelected = selectedJams.includes(jam);
                return (
                  <button
                    key={jam}
                    type="button"
                    id={`btn-jam-${jam}`}
                    onClick={() => toggleJam(jam)}
                    className={`py-2 px-1 rounded-xl text-center border font-bold text-xs transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs scale-[1.02]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>Jam ke-{jam}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Guru, Mata Pelajaran, & Kelas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Nama Guru */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Guru <span className="text-red-500">*</span>
              </label>
              <select
                id="select-jadwal-guru"
                value={guruId}
                onChange={handleGuruChange}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                <option value="">-- Pilih Guru Pengajar --</option>
                {guruList.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nama_guru} ({g.jenjang})
                  </option>
                ))}
              </select>
            </div>

            {/* Mata Pelajaran */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mata Pelajaran <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="input-jadwal-mapel"
                value={mataPelajaran || ''}
                onChange={(e) => setMataPelajaran(e.target.value)}
                placeholder="Contoh: Informatika / Literasi"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            {/* Kelas */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kelas <span className="text-red-500">*</span>
              </label>
              <select
                id="select-jadwal-kelas"
                value={kelasId || ''}
                onChange={(e) => setKelasId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                <option value="">-- Pilih Kelas --</option>
                <optgroup label="SMP IT Albashiroh">
                  {kelasList
                    .filter((k) => k.jenjang === 'SMP')
                    .map((k) => (
                      <option key={k.id} value={k.id}>
                        Kelas {k.nama_kelas}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="SMA IT Albashiroh">
                  {kelasList
                    .filter((k) => k.jenjang === 'SMA')
                    .map((k) => (
                      <option key={k.id} value={k.id}>
                        Kelas {k.nama_kelas}
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Section 4: Keperluan / Keterangan & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Keterangan / Keperluan Penggunaan (Opsional)
              </label>
              <input
                type="text"
                id="input-jadwal-keperluan"
                value={keperluan || ''}
                onChange={(e) => setKeperluan(e.target.value)}
                placeholder="Contoh: Praktikum Pemrograman Python, Bedah Buku, dsb."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Status Penggunaan
              </label>
              <select
                id="select-jadwal-status"
                value={status || 'Terjadwal'}
                onChange={(e) => setStatus(e.target.value as StatusJadwal)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                <option value="Terjadwal">Terjadwal</option>
                <option value="Selesai">Selesai</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              id="btn-cancel-modal"
              onClick={() => {
                setIsBookingModalOpen(false);
                setEditingJadwal(null);
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors"
            >
              Batal
            </button>

            <button
              type="submit"
              id="btn-submit-jadwal"
              disabled={conflictResult.hasConflict}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-sm flex items-center gap-2 ${
                conflictResult.hasConflict
                  ? 'bg-slate-400 cursor-not-allowed opacity-70'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30 hover:scale-[1.02] active:scale-95'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {editingJadwal
                  ? 'Simpan Perubahan Jadwal'
                  : `Simpan Jadwal (${selectedJams.length} Jam)`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
