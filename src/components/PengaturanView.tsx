import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Database,
  Download,
  ExternalLink,
  FileSpreadsheet,
  HelpCircle,
  History,
  Info,
  Key,
  RefreshCw,
  Save,
  School,
  Send,
  Shield,
  Sparkles,
  Trash2,
  Upload,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppSettings, UserRole, User } from '../types';
import { JAM_PEMBELAJARAN_CONFIG } from '../data/initialData';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

const APPS_SCRIPT_CODE = `/**
 * GOOGLE APPS SCRIPT - SINKRONISASI JADWAL MULTIMEDIA
 * SMP ISLAM ALBASHIROH TUREN
 * 
 * Petunjuk:
 * 1. Di Spreadsheet Anda: Buka menu Ekstensi > Apps Script
 * 2. Hapus semua kode yang ada, tempelkan kode ini, lalu Simpan (Ctrl+S)
 * 3. Klik Terapkan (Deploy) > Penerapan baru (New deployment)
 * 4. Pilih jenis: "Aplikasi Web" (Web app)
 * 5. Jalankan sebagai: "Saya (email Anda)"
 * 6. Yang memiliki akses: "Siapa saja" (Anyone) -> (PENTING AGAR APLIKASI BISA MENGIRIM DATA)
 * 7. Klik Terapkan -> Berikan Izin Akses -> Salin URL Web App (akhiran /exec)
 * 8. Tempelkan URL tersebut ke kolom Webhook URL di aplikasi.
 */

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = "Jadwal_Multimedia";
    var sheet = ss.getSheetByName(sheetName);
    
    // Jika lembar belum ada, buat otomatis beserta header
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      var headers = [
        "Waktu Input", "ID Jadwal", "Tanggal", "Hari", "Jam Ke", 
        "Waktu Sesi", "Ruangan", "Guru Pengajar", "NIP Guru", 
        "Mata Pelajaran", "Kelas / Rombel", "Keperluan", "Status", "Dibuat Oleh"
      ];
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#059669");
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }
    
    var contents = e.postData.contents;
    var payload = JSON.parse(contents);
    var action = payload.action;
    
    if (action === "SYNC_ALL" && payload.data) {
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, 14).clearContent();
      }
      
      var rows = [];
      payload.data.forEach(function(item) {
        rows.push([
          new Date(),
          item.id || "",
          item.tanggal || "",
          item.hari || "",
          item.jam_ke || "",
          item.waktu || "",
          item.ruangan || "",
          item.guru || "",
          item.nip_guru || "",
          item.mata_pelajaran || "",
          item.kelas || "",
          item.keperluan || "",
          item.status || "",
          item.pembuat || ""
        ]);
      });
      
      if (rows.length > 0) {
        sheet.getRange(2, 1, rows.length, 14).setValues(rows);
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Semua data (" + rows.length + " entri) berhasil disinkronkan."
      })).setMimeType(ContentService.MimeType.JSON);
      
    } else if (action === "APPEND_JADWAL" && payload.data) {
      payload.data.forEach(function(item) {
        sheet.appendRow([
          new Date(),
          item.id || "",
          item.tanggal || "",
          item.hari || "",
          item.jam_ke || "",
          item.waktu || "",
          item.ruangan || "",
          item.guru || "",
          item.nip_guru || "",
          item.mata_pelajaran || "",
          item.kelas || "",
          item.keperluan || "",
          item.status || "",
          item.pembuat || ""
        ]);
      });
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Jadwal baru berhasil ditambahkan ke sheet."
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data diterima."
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Webhook Penjadwalan Multimedia Albashiroh Berjalan Normal.");
}`;

export const PengaturanView: React.FC = () => {
  const {
    settings,
    updateSettings,
    userList,
    createUser,
    deleteUser,
    auditLogs,
    clearAuditLogs,
    currentUser,
    syncWithSheets,
    isSyncingSheets,
    lastSyncTime,
    jadwalList,
    guruList,
    kelasList,
    ruanganList,
    clearAllJadwal,
    clearHistoricalJadwal,
    resetAllDataToDefault,
  } = useApp();

  const [formSettings, setFormSettings] = useState<AppSettings>(() => ({
    ...settings,
    namaAplikasi: settings.namaAplikasi || '',
    namaSekolah: settings.namaSekolah || '',
    alamatSekolah: settings.alamatSekolah || '',
    tahunPelajaran: settings.tahunPelajaran || '',
    semester: settings.semester || 'Genap',
    kepalaSekolah: settings.kepalaSekolah || '',
    nipKepalaSekolah: settings.nipKepalaSekolah || '',
    koordinatorLab: settings.koordinatorLab || '',
    nipKoordinatorLab: settings.nipKoordinatorLab || '',
    googleSheetsId: settings.googleSheetsId || settings.googleSheetId || '',
    googleSheetsWebhookUrl: settings.googleSheetsWebhookUrl || '',
    autoSyncSheets: settings.autoSyncSheets !== undefined ? Boolean(settings.autoSyncSheets) : true,
  }));

  React.useEffect(() => {
    if (settings) {
      setFormSettings({
        ...settings,
        namaAplikasi: settings.namaAplikasi || '',
        namaSekolah: settings.namaSekolah || '',
        alamatSekolah: settings.alamatSekolah || '',
        tahunPelajaran: settings.tahunPelajaran || '',
        semester: settings.semester || 'Genap',
        kepalaSekolah: settings.kepalaSekolah || '',
        nipKepalaSekolah: settings.nipKepalaSekolah || '',
        koordinatorLab: settings.koordinatorLab || '',
        nipKoordinatorLab: settings.nipKoordinatorLab || '',
        googleSheetsId: settings.googleSheetsId || settings.googleSheetId || '',
        googleSheetsWebhookUrl: settings.googleSheetsWebhookUrl || '',
        autoSyncSheets: settings.autoSyncSheets !== undefined ? Boolean(settings.autoSyncSheets) : true,
      });
    }
  }, [settings]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'umum' | 'sheets' | 'users' | 'audit' | 'backup'>('umum');
  const [copiedScript, setCopiedScript] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  // Deletion modals state
  const [isClearJadwalModalOpen, setIsClearJadwalModalOpen] = useState(false);
  const [isClearHistoryModalOpen, setIsClearHistoryModalOpen] = useState(false);
  const [isResetAllModalOpen, setIsResetAllModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isClearAuditModalOpen, setIsClearAuditModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleDownloadCSV = () => {
    const headers = [
      'ID Jadwal',
      'Tanggal',
      'Hari',
      'Jam Ke',
      'Waktu Pembelajaran',
      'Ruangan',
      'Nama Guru',
      'NIP Guru',
      'Mata Pelajaran',
      'Kelas',
      'Keperluan',
      'Status',
      'Dibuat Oleh',
    ];

    const rows = jadwalList.map((j) => {
      const guru = guruList.find((g) => g.id === j.guru_id);
      const kelas = kelasList.find((k) => k.id === j.kelas_id);
      const ruangan = ruanganList.find((r) => r.id === j.ruangan_id);
      const jamDef = JAM_PEMBELAJARAN_CONFIG.find((jp) => jp.jam_ke === j.jam_ke);

      return [
        `"${j.id}"`,
        `"${j.tanggal}"`,
        `"${j.hari}"`,
        `"${j.jam_ke}"`,
        `"${jamDef ? `${jamDef.mulai} - ${jamDef.selesai}` : `Jam ke-${j.jam_ke}`}"`,
        `"${(ruangan?.nama_ruangan || 'Ruangan').replace(/"/g, '""')}"`,
        `"${(guru?.nama_guru || 'Guru').replace(/"/g, '""')}"`,
        `"${(guru?.nip || '-').replace(/"/g, '""')}"`,
        `"${(j.mata_pelajaran || '').replace(/"/g, '""')}"`,
        `"${(kelas?.nama_kelas || 'Kelas').replace(/"/g, '""')}"`,
        `"${(j.keperluan || '-').replace(/"/g, '""')}"`,
        `"${j.status}"`,
        `"${(j.created_by_name || 'Admin').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Jadwal_Multimedia_Albashiroh_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleManualSync = async () => {
    setSyncFeedback(null);
    const res = await syncWithSheets();
    setSyncFeedback(res);
    setTimeout(() => setSyncFeedback(null), 6000);
  };

  // New user form state
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newNamaLengkap, setNewNamaLengkap] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('guru');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim() || !newNamaLengkap.trim()) return;

    createUser({
      username: newUsername.trim(),
      password: newPassword.trim(),
      nama_lengkap: newNamaLengkap.trim(),
      role: newRole,
    });

    setNewUsername('');
    setNewPassword('');
    setNewNamaLengkap('');
  };

  const handleExportBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings,
      jadwal: localStorage.getItem('albashiroh_multimedia_jadwal_v1'),
      guru: localStorage.getItem('albashiroh_multimedia_guru_v1'),
      kelas: localStorage.getItem('albashiroh_multimedia_kelas_v1'),
      ruangan: localStorage.getItem('albashiroh_multimedia_ruangan_v1'),
      users: localStorage.getItem('albashiroh_multimedia_users_v1'),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Backup_Multimedia_Albashiroh_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Berkas cadangan JSON berhasil diunduh.');
  };

  const handleConfirmClearJadwal = () => {
    const res = clearAllJadwal();
    showToast(res.message || 'Database jadwal peminjam berhasil dibersihkan.');
    setIsClearJadwalModalOpen(false);
  };

  const handleConfirmClearHistory = () => {
    const res = clearHistoricalJadwal();
    showToast(res.message || 'Riwayat jadwal lampau/selesai berhasil dibersihkan.');
    setIsClearHistoryModalOpen(false);
  };

  const handleConfirmResetAll = () => {
    const res = resetAllDataToDefault();
    showToast(res.message || 'Database berhasil direset ke pengaturan awal.');
    setIsResetAllModalOpen(false);
  };

  const handleConfirmDeleteUser = () => {
    if (!deletingUser) return;
    deleteUser(deletingUser.id);
    showToast(`Pengguna ${deletingUser.username} berhasil dihapus.`);
    setDeletingUser(null);
  };

  const handleConfirmClearAudit = () => {
    clearAuditLogs();
    showToast('Seluruh riwayat audit log berhasil dibersihkan.');
    setIsClearAuditModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-600 text-white flex items-center justify-between shadow-lg text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-white/20 rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-display">
            Pengaturan & Integrasi Sistem
          </h2>
          <p className="text-xs text-slate-500">
            Kelola profil sekolah, integrasi Google Sheets, manajemen hak akses, dan pemeliharaan database.
          </p>
        </div>

        {saveSuccess && (
          <div className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan Berhasil Disimpan!</span>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
        <button
          onClick={() => setActiveTab('umum')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'umum' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Profil Sekolah & Kop
        </button>
        <button
          onClick={() => setActiveTab('sheets')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'sheets' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Google Sheets Sync
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Manajemen User ({userList.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'audit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Audit Log ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'backup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Backup & Reset
        </button>
      </div>

      {/* TAB 1: PROFIL SEKOLAH & KOP SURAT */}
      {activeTab === 'umum' && (
        <form onSubmit={handleSaveSettings} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6 text-xs">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900 font-display">Identitas Sekolah & Aplikasi</h3>
            <p className="text-[11px] text-slate-500">Informasi ini akan muncul pada Kop Surat Cetak dan Ekspor PDF.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Nama Aplikasi</label>
              <input
                type="text"
                value={formSettings.namaAplikasi || ''}
                onChange={(e) => setFormSettings({ ...formSettings, namaAplikasi: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Nama Instansi / Sekolah</label>
              <input
                type="text"
                value={formSettings.namaSekolah || ''}
                onChange={(e) => setFormSettings({ ...formSettings, namaSekolah: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 uppercase mb-1">Alamat Lengkap Sekolah</label>
              <input
                type="text"
                value={formSettings.alamatSekolah || ''}
                onChange={(e) => setFormSettings({ ...formSettings, alamatSekolah: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Tahun Pelajaran</label>
              <input
                type="text"
                value={formSettings.tahunPelajaran || ''}
                onChange={(e) => setFormSettings({ ...formSettings, tahunPelajaran: e.target.value })}
                placeholder="2025/2026"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Semester</label>
              <select
                value={formSettings.semester || 'Genap'}
                onChange={(e) => setFormSettings({ ...formSettings, semester: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Ganjil">Semester Ganjil</option>
                <option value="Genap">Semester Genap</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Nama Kepala Sekolah</label>
              <input
                type="text"
                value={formSettings.kepalaSekolah || ''}
                onChange={(e) => setFormSettings({ ...formSettings, kepalaSekolah: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">NIP Kepala Sekolah</label>
              <input
                type="text"
                value={formSettings.nipKepalaSekolah || ''}
                onChange={(e) => setFormSettings({ ...formSettings, nipKepalaSekolah: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Koordinator Multimedia & Lab</label>
              <input
                type="text"
                value={formSettings.koordinatorLab || ''}
                onChange={(e) => setFormSettings({ ...formSettings, koordinatorLab: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">NIP Koordinator Lab</label>
              <input
                type="text"
                value={formSettings.nipKoordinatorLab || ''}
                onChange={(e) => setFormSettings({ ...formSettings, nipKoordinatorLab: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Profil Sekolah</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: GOOGLE SHEETS INTEGRATION */}
      {activeTab === 'sheets' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6 text-xs">
          {/* Header */}
          <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  Integrasi & Sinkronisasi Google Spreadsheet
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Kirim data jadwal otomatis ke dokumen Google Spreadsheet resmi sekolah.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadCSV}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1.5 transition-colors"
                title="Unduh seluruh data sebagai file CSV untuk diimpor ke Spreadsheet"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Unduh File CSV</span>
              </button>

              <a
                href={
                  formSettings.googleSheetsId
                    ? `https://docs.google.com/spreadsheets/d/${formSettings.googleSheetsId}/edit`
                    : 'https://docs.google.com/spreadsheets/u/0/'
                }
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>Buka Google Sheets</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Explanation Alert Box */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-900 text-xs">
                  Kenapa memasukkan link/ID Spreadsheet saja belum cukup?
                </h4>
                <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                  Google Spreadsheet memiliki keamanan privasi Google. Sebuah link hanya memberi tahu alamat dokumen,
                  tetapi <strong>Google memerlukan izin tulis (Web App / Webhook)</strong> agar data aplikasi dapat
                  ditulis langsung ke baris sel spreadsheet Anda secara otomatis tanpa login berulang.
                </p>
              </div>
            </div>
          </div>

          {/* Form Settings */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Google Sheets Spreadsheet ID
                </label>
                <input
                  type="text"
                  value={formSettings.googleSheetsId || ''}
                  onChange={(e) => setFormSettings({ ...formSettings, googleSheetsId: e.target.value })}
                  placeholder="Contoh: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                  className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  ID dokumen diambil dari link spreadsheet di antara <code className="text-emerald-700">/d/</code> dan{' '}
                  <code className="text-emerald-700">/edit</code>.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                  <span>Webhook / Apps Script URL (Wajib untuk Auto-Save)</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      formSettings.googleSheetsWebhookUrl?.startsWith('https://script.google.com')
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {formSettings.googleSheetsWebhookUrl?.startsWith('https://script.google.com')
                      ? 'Terhubung'
                      : 'Belum Diisi'}
                  </span>
                </label>
                <input
                  type="text"
                  value={formSettings.googleSheetsWebhookUrl || ''}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, googleSheetsWebhookUrl: e.target.value })
                  }
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  URL Web App yang didapat setelah Deploy Google Apps Script di bawah.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <input
                type="checkbox"
                id="autoSyncCheck"
                checked={Boolean(formSettings.autoSyncSheets)}
                onChange={(e) => setFormSettings({ ...formSettings, autoSyncSheets: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="autoSyncCheck" className="font-bold text-slate-800 cursor-pointer text-xs">
                Otomatis kirim jadwal baru / perubahan ke Google Spreadsheet secara realtime
              </label>
            </div>

            {/* Sync Feedback Alert */}
            {syncFeedback && (
              <div
                className={`p-3.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                  syncFeedback.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}
              >
                {syncFeedback.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span className="font-medium text-xs">{syncFeedback.message}</span>
              </div>
            )}

            {/* Manual Sync Bar */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <p className="font-bold text-emerald-950">Uji Koneksi & Sinkronisasi Massal</p>
                <p className="text-[11px] text-emerald-800">
                  Total data lokal:{' '}
                  <strong>{jadwalList.filter((j) => j.status !== 'Dibatalkan').length} jadwal aktif</strong> |
                  Terakhir sinkron: <strong>{lastSyncTime || 'Belum pernah'}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncingSheets}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-xs"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncingSheets ? 'animate-spin' : ''}`} />
                  <span>{isSyncingSheets ? 'Mengirim Data...' : 'Kirim / Sinkronkan Sekarang'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Tutorial Accordion & Code Block */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/70 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-600" />
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                  Panduan Pemasangan Google Apps Script (Hanya 2 Menit)
                </h4>
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 transition-all shadow-xs text-xs self-start sm:self-auto"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? 'Kode Tersalin!' : 'Salin Kode Skrip'}</span>
              </button>
            </div>

            {/* 4 Steps Guide */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-black text-center leading-6 mb-2">
                  1
                </div>
                <p className="font-bold text-slate-800">Buka Apps Script</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Buka Google Spreadsheet Anda, klik menu <strong>Ekstensi</strong> &gt; <strong>Apps Script</strong>.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-black text-center leading-6 mb-2">
                  2
                </div>
                <p className="font-bold text-slate-800">Tempel Kode</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Hapus semua kode lama, lalu <strong>Paste</strong> skrip yang disalin, dan tekan <strong>Ctrl+S</strong> (Simpan).
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-black text-center leading-6 mb-2">
                  3
                </div>
                <p className="font-bold text-slate-800">Terapkan / Deploy</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Klik <strong>Terapkan</strong> &gt; <strong>Penerapan baru</strong> &gt; Jenis <strong>Aplikasi Web</strong>. Akses: <strong>Siapa saja (Anyone)</strong>.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-black text-center leading-6 mb-2">
                  4
                </div>
                <p className="font-bold text-slate-800">Tempel Webhook</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Salin URL Aplikasi Web (akhiran <code className="text-emerald-700">/exec</code>) dan tempel ke kolom <strong>Webhook URL</strong> di atas.
                </p>
              </div>
            </div>

            {/* Code Box Display */}
            <div className="relative">
              <pre className="p-3.5 bg-slate-900 text-slate-100 font-mono text-[11px] rounded-xl overflow-x-auto max-h-56 leading-relaxed border border-slate-800">
                {APPS_SCRIPT_CODE}
              </pre>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Jangan lupa klik Simpan setelah mengisi Spreadsheet ID atau Webhook URL.
            </span>

            <button
              type="button"
              onClick={() => {
                updateSettings(formSettings);
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
              }}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Konfigurasi Sheets</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: MANAJEMEN USER */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Add User Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 font-display">Tambah Pengguna Baru</h3>
            <form onSubmit={handleAddUser} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Username</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Contoh: ustadz_ahmad"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={newNamaLengkap}
                  onChange={(e) => setNewNamaLengkap(e.target.value)}
                  placeholder="Nama & Gelar"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Role / Hak Akses</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="guru">Guru (Reservasi)</option>
                  <option value="operator">Operator (Kelola Jadwal)</option>
                  <option value="admin">Administrator (Akses Penuh)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1"
              >
                <UserPlus className="w-4 h-4" />
                <span>Tambah User</span>
              </button>
            </form>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto rounded-2xl bg-white border border-slate-200 shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider">
                  <th className="p-3.5">Nama Lengkap</th>
                  <th className="p-3.5">Username</th>
                  <th className="p-3.5 text-center">Role / Level</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(userList || []).map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-900">{u.nama_lengkap || u.nama}</td>
                    <td className="p-3.5 font-mono text-slate-600">{u.username}</td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'operator'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Aktif
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      {u.username !== 'admin' && (
                        <button
                          onClick={() => setDeletingUser(u)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOG VIEWER */}
      {activeTab === 'audit' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Riwayat Aktivitas & Audit Log</h3>
              <p className="text-[11px] text-slate-500">Mencatat seluruh aksi penambahan, perubahan, dan pembatalan jadwal.</p>
            </div>

            <button
              onClick={() => setIsClearAuditModalOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 font-bold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan Log</span>
            </button>
          </div>

          <div className="space-y-2 max-h-[420px] overflow-y-auto">
            {(auditLogs || []).length === 0 ? (
              <p className="py-8 text-center text-slate-400">Belum ada riwayat aktivitas yang tercatat.</p>
            ) : (
              (auditLogs || []).map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-slate-900">{log.user_name}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 uppercase">
                        {log.action}
                      </span>
                    </div>
                    <p className="text-slate-700">{log.details}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('id-ID')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: BACKUP & DATABASE MANAGEMENT */}
      {activeTab === 'backup' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6 text-xs">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900 font-display">Cadangan Data & Pemeliharaan Database</h3>
            <p className="text-[11px] text-slate-500">
              Kelola pencadangan, pembersihan database jadwal peminjaman ruangan, dan pengaturan pemulihan sistem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Hapus Database Jadwal Peminjam */}
            <div className="p-5 rounded-2xl border border-red-200 bg-red-50/50 space-y-3">
              <div className="flex items-start justify-between">
                <h4 className="font-bold text-red-900 text-sm flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4 text-red-600" />
                  <span>Hapus Database Jadwal Peminjam</span>
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-100 text-red-800">
                  {jadwalList.length} Jadwal
                </span>
              </div>
              <p className="text-red-700 text-[11px] leading-relaxed">
                Menghapus dan mengosongkan <strong>seluruh data jadwal reservasi peminjaman ruangan</strong> yang telah diinput.
                <br />
                <span className="text-slate-600">Catatan: Data master Guru, Rombel Kelas, dan Ruangan tetap aman dan tidak akan terhapus.</span>
              </p>
              <button
                id="btn-delete-all-jadwal-admin"
                onClick={() => setIsClearJadwalModalOpen(true)}
                disabled={jadwalList.length === 0}
                className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                  jadwalList.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Seluruh Jadwal ({jadwalList.length})</span>
              </button>
            </div>

            {/* Card 2: Bersihkan Jadwal Lampau / Selesai */}
            <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-3">
              <div className="flex items-start justify-between">
                <h4 className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                  <History className="w-4 h-4 text-amber-600" />
                  <span>Bersihkan Riwayat Jadwal Selesai</span>
                </h4>
              </div>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                Menghapus hanya jadwal peminjam yang sudah berstatus <strong>Selesai</strong> atau <strong>Dibatalkan</strong>, serta tanggal lampau. Jadwal mendatang yang masih aktif akan tetap dipertahankan.
              </p>
              <button
                onClick={() => setIsClearHistoryModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>Bersihkan Riwayat Lampau</span>
              </button>
            </div>

            {/* Card 3: Export Backup JSON */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Unduh Cadangan JSON (Full Backup)</h4>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Menyimpan seluruh jadwal, guru, rombel kelas, ruangan, dan riwayat aktivitas ke dalam satu berkas JSON terenkripsi lokal untuk keamanan.
              </p>
              <button
                onClick={handleExportBackup}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File Backup (.json)</span>
              </button>
            </div>

            {/* Card 4: Reset Seluruh Database ke Awal */}
            <div className="p-5 rounded-2xl border border-rose-200 bg-rose-50/40 space-y-3">
              <h4 className="font-bold text-rose-900 text-sm flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Reset Database Bawaan Sekolah</span>
              </h4>
              <p className="text-rose-700 text-[11px] leading-relaxed">
                Kembalikan seluruh master data guru, rombel kelas, ruangan, dan jadwal ke data bawaan awal SMP - SMA IT Albashiroh Turen.
              </p>
              <button
                onClick={() => setIsResetAllModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset ke Data Bawaan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Clear All Jadwal */}
      <ConfirmDeleteModal
        isOpen={isClearJadwalModalOpen}
        onClose={() => setIsClearJadwalModalOpen(false)}
        onConfirm={handleConfirmClearJadwal}
        title="Hapus Database Jadwal Peminjam"
        message={`Apakah Anda yakin ingin mengosongkan seluruh database jadwal peminjam (${jadwalList.length} entri)? Seluruh riwayat jadwal akan terhapus. Master data guru dan rombel kelas TIDAK akan terpengaruh.`}
        confirmButtonText="Hapus Seluruh Jadwal"
        isDangerous={true}
      />

      {/* Confirmation Modal: Clear History Jadwal */}
      <ConfirmDeleteModal
        isOpen={isClearHistoryModalOpen}
        onClose={() => setIsClearHistoryModalOpen(false)}
        onConfirm={handleConfirmClearHistory}
        title="Bersihkan Riwayat Jadwal Selesai"
        message="Apakah Anda yakin ingin menghapus jadwal yang telah selesai, dibatalkan, atau telah lewat? Jadwal mendatang yang berstatus aktif akan tetap disimpan."
        confirmButtonText="Bersihkan Riwayat"
        isDangerous={true}
      />

      {/* Confirmation Modal: Reset All Database */}
      <ConfirmDeleteModal
        isOpen={isResetAllModalOpen}
        onClose={() => setIsResetAllModalOpen(false)}
        onConfirm={handleConfirmResetAll}
        title="Reset Database ke Data Bawaan Sekolah"
        message="PERINGATAN KRUSIAL: Tindakan ini akan mengembalikan seluruh data guru, rombel kelas, ruangan, dan jadwal ke data preset default sekolah Albashiroh Turen. Semua data yang diinput manual akan hilang."
        confirmButtonText="Reset Seluruh Data"
        isDangerous={true}
      />

      {/* Confirmation Modal: Delete User */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingUser)}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleConfirmDeleteUser}
        title="Hapus Akun Pengguna"
        message="Apakah Anda yakin ingin menghapus akun pengguna ini dari sistem?"
        itemName={deletingUser ? `${deletingUser.nama_lengkap || deletingUser.nama} (${deletingUser.username})` : undefined}
        confirmButtonText="Hapus Pengguna"
        isDangerous={true}
      />

      {/* Confirmation Modal: Clear Audit Logs */}
      <ConfirmDeleteModal
        isOpen={isClearAuditModalOpen}
        onClose={() => setIsClearAuditModalOpen(false)}
        onConfirm={handleConfirmClearAudit}
        title="Bersihkan Riwayat Audit Log"
        message="Apakah Anda yakin ingin menghapus seluruh rekaman log aktivitas sistem?"
        confirmButtonText="Bersihkan Log"
        isDangerous={true}
      />
    </div>
  );
};
