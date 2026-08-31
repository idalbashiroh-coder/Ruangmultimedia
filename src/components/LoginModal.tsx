import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, KeyRound, Lock, LogOut, ShieldCheck, User, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, currentUser, login, logout, setActiveView } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);

  useEffect(() => {
    if (isLoginModalOpen) {
      setErrorMsg('');
      setUsername('');
      setPassword('');
      setShowPassword(false);
      setIsSwitchingAccount(false);
    }
  }, [isLoginModalOpen]);

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      setErrorMsg('Harap isi Username dan Password Anda.');
      return;
    }

    const success = login(trimmedUser, trimmedPass);
    if (success) {
      setIsLoginModalOpen(false);
      setActiveView('dashboard');
    } else {
      setErrorMsg('Username atau password tidak cocok. Silakan coba kembali.');
    }
  };

  const handleGoToDashboard = () => {
    setIsLoginModalOpen(false);
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    logout();
    setIsLoginModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display">
                {currentUser && !isSwitchingAccount ? 'Status Akun Administrator' : 'Login Dashboard Administrator'}
              </h3>
              <p className="text-xs text-slate-400">Sistem Multimedia Albashiroh Turen</p>
            </div>
          </div>
          <button
            onClick={() => setIsLoginModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Active User state */}
        {currentUser && !isSwitchingAccount ? (
          <div className="p-6 space-y-5 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-sm">
                {currentUser.nama ? currentUser.nama.charAt(0) : 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900">
                    {currentUser.role}
                  </span>
                  <span className="text-emerald-700 text-[11px] font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Terverifikasi
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 truncate mt-1">
                  {currentUser.nama || currentUser.nama_lengkap}
                </h4>
                <p className="text-[11px] text-slate-600">Username: @{currentUser.username}</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleGoToDashboard}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Buka Dashboard Administrator</span>
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsSwitchingAccount(true)}
                  className="py-2 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Ganti Akun</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="py-2 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>Keluar / Logout</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Form Login */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
              Silakan masukkan <strong>Username</strong> dan <strong>Password</strong> akun Anda untuk membuka akses Administrator & Manajemen Jadwal.
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Username / NIP</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Masukkan username..."
                  autoFocus
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Masukkan password..."
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-2">
              {isSwitchingAccount ? (
                <button
                  type="button"
                  onClick={() => setIsSwitchingAccount(false)}
                  className="text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Batal
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  Tutup
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm transition-all flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Masuk Sekarang</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

