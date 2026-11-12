import React, { useState, useEffect } from 'react';
import { useQuestStore } from '../../store/useQuestStore';
import { PixelButton } from '../common/PixelButton';
import { Shield, Sword, Sparkles, AlertCircle, Play, CheckCircle2, Mail, Lock, User, LogIn, UserPlus } from 'lucide-react';
import {
  loginWithGoogle,
  loginWithEmail,
  signUpWithEmail,
  getCurrentUser,
  ensureGoogleUserProfile,
} from '../../services/authService';
import { isSupabaseConfigured } from '../../supabaseClient';

type AuthTab = 'LOGIN' | 'REGISTER';

export const LicenseGate: React.FC = () => {
  const { setGoogleUser, setDemoMode } = useQuestStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [activeTab, setActiveTab] = useState<AuthTab>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [heroName, setHeroName] = useState('');

  const hasConfig = isSupabaseConfigured();

  useEffect(() => {
    const checkCurrentSession = async () => {
      if (!hasConfig) return;
      try {
        setIsLoading(true);
        const user = await getCurrentUser();
        if (user) {
          const profile = await ensureGoogleUserProfile(user);
          setGoogleUser(user, profile);
        }
      } catch (err: any) {
        console.error('Session error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkCurrentSession();
  }, [hasConfig, setGoogleUser]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Mohon isi Email dan Kata Sandi!');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Kata Sandi minimal 6 karakter!');
      return;
    }

    if (!hasConfig) {
      setErrorMsg(
        'Kredensial Supabase di file .env belum lengkap. Silakan isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.'
      );
      return;
    }

    setIsLoading(true);

    try {
      if (activeTab === 'REGISTER') {
        const nameToUse = heroName.trim() || email.split('@')[0] || 'Pahlawan_Baru';
        const data = await signUpWithEmail(email.trim(), password, nameToUse);
        if (data?.user) {
          const profile = await ensureGoogleUserProfile(data.user);
          await setGoogleUser(data.user, profile);
        } else {
          setSuccessMsg('Akun berhasil dibuat! Silakan coba login.');
          setActiveTab('LOGIN');
        }
      } else {
        const data = await loginWithEmail(email.trim(), password);
        if (data?.user) {
          const profile = await ensureGoogleUserProfile(data.user);
          await setGoogleUser(data.user, profile);
        }
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('fetch') || msg.includes('ENOTFOUND') || msg.includes('Failed to fetch')) {
        setErrorMsg('Gagal terhubung ke database Supabase. Periksa koneksi internet atau URL Supabase Anda.');
      } else if (msg.includes('Invalid login credentials')) {
        setErrorMsg('Email atau Kata Sandi salah!');
      } else if (msg.includes('User already registered')) {
        setErrorMsg('Email ini sudah terdaftar! Silakan pilih tab Masuk (Login).');
      } else {
        setErrorMsg(msg || 'Terjadi kesalahan saat autentikasi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setIsLoading(true);

    if (!hasConfig) {
      setErrorMsg(
        'Kredensial Supabase di file .env belum lengkap. Silakan atur VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.'
      );
      setIsLoading(false);
      return;
    }

    try {
      await loginWithGoogle();
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('fetch') || msg.includes('ENOTFOUND') || msg.includes('Failed to fetch')) {
        setErrorMsg(
          'Tidak dapat terhubung ke URL Supabase. Pastikan VITE_SUPABASE_URL di file .env menggunakan URL proyek yang aktif.'
        );
      } else {
        setErrorMsg(
          err.message ||
            'Gagal melakukan Login Google. Pastikan Provider Google sudah diaktifkan di Supabase Dashboard.'
        );
      }
      setIsLoading(false);
    }
  };

  const handleGuestDemo = () => {
    setDemoMode(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0a0a10]/95 backdrop-blur-md crt-scanlines overflow-y-auto">
      <div className="w-full max-w-md bg-[#1a1a26] border-4 border-yellow-500 shadow-[10px_10px_0px_#000] p-4 sm:p-6 text-gray-100 relative space-y-4 my-auto">
        
        {/* Header Title */}
        <div className="text-center space-y-1.5 border-b-4 border-black pb-3">
          <div className="flex justify-center items-center gap-3 mb-1">
            <Sword className="w-5 h-5 text-yellow-400 animate-bounce" />
            <div className="inline-flex p-2.5 bg-black border-4 border-yellow-400 text-yellow-400 shadow-[3px_3px_0px_#000] select-none">
              <Shield className="w-7 h-7 fill-yellow-400 text-black" />
            </div>
            <Sword className="w-5 h-5 text-yellow-400 animate-bounce scale-x-[-1]" />
          </div>
          <h1 className="font-pixel text-base sm:text-lg text-yellow-400 tracking-wider">
            QUESTLOG RPG REALM
          </h1>
          <p className="font-retro text-xs text-gray-300">
            Gerbang Masuk Pahlawan • 100% Gratis Tanpa Kartu Kredit
          </p>
        </div>

        {/* Free Banner Alert */}
        <div className="flex items-center gap-2 p-2 bg-emerald-950/80 border-2 border-emerald-600 font-pixel text-[10px] text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Tersedia Mode Offline Tamu & Akun Cloud Gratis</span>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-2.5 bg-red-950 border-2 border-red-600 text-red-300 font-pixel text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-red-400 block mb-0.5">[ PERHATIAN ]</span>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-2.5 bg-emerald-950 border-2 border-emerald-600 text-emerald-300 font-pixel text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Mode Tabs (Masuk vs Daftar) */}
        <div className="grid grid-cols-2 gap-2 font-pixel text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab('LOGIN');
              setErrorMsg(null);
            }}
            className={`py-2 px-3 border-2 border-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'LOGIN'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-[2px_2px_0px_#000]'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" /> MASUK
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('REGISTER');
              setErrorMsg(null);
            }}
            className={`py-2 px-3 border-2 border-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'REGISTER'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-[2px_2px_0px_#000]'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> DAFTAR BARU
          </button>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3 font-retro text-xs bg-black/60 border-2 border-slate-700 p-3.5">
          {activeTab === 'REGISTER' && (
            <div className="space-y-1">
              <label className="font-pixel text-[10px] text-gray-300 flex items-center gap-1">
                <User className="w-3 h-3 text-amber-400" /> NAMA PAHLAWAN
              </label>
              <input
                type="text"
                placeholder="cth: Satria Pixel"
                value={heroName}
                onChange={(e) => setHeroName(e.target.value)}
                className="w-full bg-[#12121c] border-2 border-slate-600 px-2.5 py-1.5 text-yellow-300 font-bold focus:border-amber-400 focus:outline-none"
                maxLength={20}
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="font-pixel text-[10px] text-gray-300 flex items-center gap-1">
              <Mail className="w-3 h-3 text-amber-400" /> EMAIL
            </label>
            <input
              type="email"
              placeholder="cth: pahlawan@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#12121c] border-2 border-slate-600 px-2.5 py-1.5 text-yellow-300 font-bold focus:border-amber-400 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-pixel text-[10px] text-gray-300 flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-400" /> KATA SANDI (MIN. 6 KARAKTER)
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#12121c] border-2 border-slate-600 px-2.5 py-1.5 text-yellow-300 font-bold focus:border-amber-400 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs py-2.5 px-3 border-2 border-black shadow-[3px_3px_0px_#000] cursor-pointer font-bold active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center justify-center gap-2"
          >
            {isLoading
              ? 'MEMPROSES...'
              : activeTab === 'LOGIN'
              ? 'MASUK SEKARANG'
              : 'BUAT AKUN PAHLAWAN'}
          </button>
        </form>

        {/* Guest Demo Box (Pilihan Paling Santai / 100% Offline) */}
        <div className="bg-black/80 border-2 border-amber-600/70 p-3 space-y-2">
          <div className="flex items-center gap-1.5 font-pixel text-[11px] text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Malas bikin akun? Langsung Main Offline!</span>
          </div>
          <p className="font-retro text-[11px] text-gray-300 leading-relaxed">
            Klik tombol di bawah untuk langsung mencoba seluruh fitur QuestLog. Progres quest & levelmu **tetap tersimpan di browser ini** (IndexedDB).
          </p>
          <PixelButton
            variant="secondary"
            size="sm"
            className="w-full mt-1 bg-cyan-900 border-cyan-500 text-cyan-200 hover:bg-cyan-800"
            onClick={handleGuestDemo}
          >
            <Play className="w-3.5 h-3.5 mr-1 inline text-cyan-400" />
            MASUK SEBAGAI TAMU (MODE OFFLINE)
          </PixelButton>
        </div>

        {/* Google OAuth (Optional Shortcut) */}
        <div className="text-center font-retro text-[11px] text-gray-400 border-t border-slate-800 pt-2.5 space-y-1.5">
          <p className="text-[10px]">Atau jika Supabase Google Provider Anda sudah aktif:</p>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-[#121824] border-2 border-slate-700 hover:border-blue-500 text-gray-300 py-1.5 px-3 font-pixel text-[10px] flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.4 0 15.3s.7 5.6 1.9 8l3.7-2.9z"/>
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"/>
            </svg>
            <span>MASUK DENGAN GOOGLE OAUTH</span>
          </button>
        </div>

      </div>
    </div>
  );
};
