import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  Clock,
  Copy,
  Download,
  ExternalLink,
  FileSpreadsheet,
  Radio,
  RefreshCw,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Wifi,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const GoogleSheetsModal: React.FC = () => {
  const {
    isSheetsModalOpen,
    setIsSheetsModalOpen,
    settings,
    updateSettings,
    lastSheetsSyncTime,
    isSyncingSheets,
    isRealtimeConnected,
    fetchFromGoogleSheets,
    syncWithSheets,
    jadwalList,
    setActiveView,
  } = useApp();

  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [customInput, setCustomInput] = useState<string>(
    settings.googleSheetUrl || settings.googleSheetId || settings.googleSheetsId || ''
  );
  const [isEditingLink, setIsEditingLink] = useState(false);

  if (!isSheetsModalOpen) return null;

  const handleManualFetch = async () => {
    setFeedback(null);
    if (customInput.trim() !== (settings.googleSheetId || settings.googleSheetUrl || '')) {
      updateSettings({
        googleSheetUrl: customInput.trim(),
        googleSheetId: customInput.trim(),
        googleSheetsId: customInput.trim(),
      });
    }
    const res = await fetchFromGoogleSheets(false, customInput.trim());
    setFeedback(res);
    setTimeout(() => setFeedback(null), 7000);
  };

  const handleManualSync = async () => {
    setFeedback(null);
    const res = await syncWithSheets();
    setFeedback(res);
    setTimeout(() => setFeedback(null), 7000);
  };

  const sheetId = settings.googleSheetId || settings.googleSheetsId || '';
  const sheetUrl =
    settings.googleSheetUrl ||
    (sheetId ? `https://docs.google.com/spreadsheets/d/${sheetId}/edit` : '');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-xs border border-white/20">
              <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-display">Status Sinkronisasi Spreadsheet</h3>
              <p className="text-xs text-emerald-100/90 flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>Realtime Database Auto-Sync Aktif</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSheetsModalOpen(false)}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Live Status Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-emerald-950 text-sm">Pembaruan Otomatis Berjalan</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                  Realtime Active
                </span>
              </div>
              <p className="text-emerald-800 mt-1 text-[11px] leading-relaxed">
                Aplikasi membaca data Google Spreadsheet secara berkala di latar belakang. Setiap ada baris jadwal baru atau perubahan yang dimasukkan ke dokumen Spreadsheet, aplikasi akan langsung menampilkannya secara otomatis tanpa perlu menekan tombol apa pun.
              </p>
            </div>
          </div>

          {/* Stats & Last Check Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Terakhir Diperbarui
              </span>
              <p className="font-mono font-bold text-slate-900 text-sm">
                {lastSheetsSyncTime ? `${lastSheetsSyncTime} WIB` : 'Sedang memuat...'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                Total Jadwal Terhubung
              </span>
              <p className="font-mono font-bold text-slate-900 text-sm">
                {jadwalList.length} Entri ({jadwalList.filter((j) => j.status !== 'Dibatalkan').length} Aktif)
              </p>
            </div>
          </div>

          {/* Spreadsheet ID & Link */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                ID / URL Dokumen Google Spreadsheet
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingLink(!isEditingLink)}
                  className="text-emerald-700 hover:text-emerald-800 font-bold text-[11px]"
                >
                  {isEditingLink ? 'Simpan' : 'Ubah URL / ID'}
                </button>
                {sheetUrl && (
                  <a
                    href={sheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 hover:text-emerald-800 font-bold inline-flex items-center gap-1 text-[11px]"
                  >
                    <span>Buka Sheet</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
            {isEditingLink ? (
              <div className="space-y-1">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Tempel link spreadsheet atau ID (Contoh: https://docs.google.com/spreadsheets/d/...)"
                  className="w-full font-mono text-slate-800 bg-white p-2 rounded-lg border border-emerald-400 focus:ring-2 focus:ring-emerald-500 text-[11px]"
                />
                <p className="text-[10px] text-slate-500">
                  Anda dapat menempel link spreadsheet lengkap atau ID saja. Klik Tarik Ulang untuk memuat data.
                </p>
              </div>
            ) : (
              <p className="font-mono text-slate-800 bg-white p-2 rounded-lg border border-slate-200 break-all text-[11px] select-all">
                {customInput || sheetId || 'Belum diatur (Klik Ubah URL / ID)'}
              </p>
            )}
          </div>

          {/* Feedback Message */}
          {feedback && (
            <div
              className={`p-3 rounded-xl flex items-center gap-2 text-xs font-semibold ${
                feedback.success
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-rose-100 text-rose-900 border border-rose-300'
              }`}
            >
              {feedback.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={handleManualFetch}
              disabled={isSyncingSheets}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${isSyncingSheets ? 'animate-bounce' : ''}`} />
              <span>Tarik Ulang Sekarang</span>
            </button>

            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncingSheets}
              className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 transition-colors shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingSheets ? 'animate-spin' : ''}`} />
              <span>Kirim Data ke Sheet</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => {
              setIsSheetsModalOpen(false);
              setActiveView('pengaturan');
            }}
            className="text-slate-600 hover:text-emerald-700 font-bold flex items-center gap-1.5 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Pengaturan Webhook & Spreadsheet</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSheetsModalOpen(false)}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
