import React, { useState, useEffect } from 'react';
import { useQuestStore } from '../../store/useQuestStore';
import { PixelButton } from '../common/PixelButton';
import { Shield, Sword, Sparkles, AlertCircle, Play, CheckCircle2 } from 'lucide-react';
import { loginWithGoogle, getCurrentUser, ensureGoogleUserProfile } from '../../services/authService';
import { isSupabaseConfigured } from '../../supabaseClient';

export const LicenseGate: React.FC = () => {
  const { setGoogleUser, setDemoMode } = useQuestStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const hasConfig = isSupabaseConfigured();

  useEffect(() => {
    checkCurrentSession();
  }, []);

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
      // Browser will redirect to Google OAuth page
    } catch (err: any) {
      setErrorMsg(
        err.message ||
          'Gagal melakukan Login Google. Pastikan Provider Google sudah diaktifkan di Supabase Dashboard.'
      );
      setIsLoading(false);
    }
  };

  const handleGuestDemo = () => {
    setDemoMode(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a10]/95 backdrop-blur-md crt-scanlines">
      <div className="w-full max-w-lg bg-[#1a1a26] border-4 border-yellow-500 shadow-[10px_10px_0px_#000] p-6 text-gray-100 relative space-y-6">
        
        {/* Header Title */}
        <div className="text-center space-y-2 border-b-4 border-black pb-4">
          <div className="flex justify-center items-center gap-3 mb-2">
            <Sword className="w-6 h-6 text-yellow-400 animate-bounce" />
            <div className="inline-flex p-3 bg-black border-4 border-yellow-400 text-yellow-400 shadow-[4px_4px_0px_#000] select-none">
              <Shield className="w-8 h-8 fill-yellow-400 text-black" />
            </div>
            <Sword className="w-6 h-6 text-yellow-400 animate-bounce scale-x-[-1]" />
          </div>
          <h1 className="font-pixel text-lg sm:text-xl text-yellow-400 tracking-wider">
            QUESTLOG GAMIFIED TRACKER
          </h1>
          <p className="font-retro text-xs text-gray-300">
            Gerbang Autentikasi Pahlawan • Supabase Realm & Google OAuth
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-red-950 border-2 border-red-600 text-red-300 font-pixel text-xs flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-red-400 block mb-0.5">[ ERROR AUTENTIKASI ]</span>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Google OAuth Login Section */}
        <div className="space-y-4 font-retro">
          <div className="bg-black/80 border-2 border-slate-700 p-4 text-center space-y-3">
            <p className="text-xs text-yellow-200 leading-relaxed">
              Masuk menggunakan **Akun Google** milikmu untuk menyimpan seluruh statistik Pahlawan, Level, Gold, Ransel, dan Quest ke dalam Database Supabase!
            </p>

            <div className="flex justify-center items-center gap-3 font-pixel text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-700/60 py-1.5 px-3">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>SUPABASE REALM CLOUD DATA ENABLED</span>
            </div>

            {/* Big Google Login RPG Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full mt-2 bg-[#121824] border-4 border-blue-500 hover:bg-blue-950 text-white py-3.5 px-4 font-pixel text-xs flex items-center justify-center gap-3 shadow-[4px_4px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.4 0 15.3s.7 5.6 1.9 8l3.7-2.9z"/>
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"/>
              </svg>
              <span className="text-blue-300 tracking-wider">
                {isLoading ? 'MEMUAT OAUTH GOOGLE...' : 'MASUK DENGAN GOOGLE'}
              </span>
            </button>
          </div>
        </div>

        {/* Demo Mode / Offline Shortcut Box */}
        <div className="bg-black/60 border-2 border-slate-700 p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 font-pixel text-[11px] text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ingin mencoba tanpa Login Google?</span>
          </div>
          <p className="font-retro text-xs text-gray-400">
            Kamu dapat menguji seluruh fitur QuestLog dalam mode Demo Offline:
          </p>
          <PixelButton
            variant="secondary"
            size="sm"
            className="w-full mt-1"
            onClick={handleGuestDemo}
          >
            <Play className="w-3.5 h-3.5 mr-1 inline text-cyan-400" />
            MASUK SEBAGAI TAMU (DEMO MODE)
          </PixelButton>
        </div>

        {/* Security Footer */}
        <div className="text-center font-retro text-[11px] text-gray-500 border-t border-slate-800 pt-3">
          100% Supabase OAuth Security • Local-First Storage Option
        </div>
      </div>
    </div>
  );
};
