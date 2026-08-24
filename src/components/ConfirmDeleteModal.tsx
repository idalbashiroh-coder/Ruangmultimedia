import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  confirmButtonText?: string;
  isDangerous?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  confirmButtonText = 'Ya, Hapus Data',
  isDangerous = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className={`px-5 py-4 flex items-center justify-between text-white ${isDangerous ? 'bg-red-600' : 'bg-amber-600'}`}>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-white/20">
              <Trash2 className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-bold font-display">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl shrink-0 ${isDangerous ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <p className="text-slate-700 leading-relaxed font-medium">
                {message}
              </p>
              {itemName && (
                <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-200 font-bold text-slate-900 font-mono text-[11px] break-all">
                  {itemName}
                </div>
              )}
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            Tindakan ini tidak dapat dibatalkan setelah dikonfirmasi.
          </p>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 rounded-xl text-white font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                isDangerous
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{confirmButtonText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
