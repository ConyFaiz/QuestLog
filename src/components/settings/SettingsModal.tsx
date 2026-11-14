import React, { useState } from 'react';
import { useQuestStore } from '../../store/useQuestStore';
import { RetroModal } from '../common/RetroModal';
import { PixelButton } from '../common/PixelButton';
import type { AppTheme } from '../../types/questlog';
import {
  Volume2,
  VolumeX,
  Tv,
  Download,
  Upload,
  RotateCcw,
  Shield,
  Lock,
  Palette,
  Flower2,
  Zap,
  Sparkles,
  Flame,
  AlertTriangle,
  HardDrive,
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    soundEnabled,
    toggleSound,
    crtOverlay,
    toggleCRT,
    exportDataJSON,
    importDataJSON,
    resetAllData,
    resetDemoQuests,
    isDemoMode,
    theme,
    setTheme,
  } = useQuestStore();

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [confirmStep, setConfirmStep] = useState<'NONE' | 'RESET_DEMO' | 'RESET_TOTAL'>('NONE');

  const handleSelectTheme = (selectedTheme: AppTheme) => {
    setTheme(selectedTheme);
  };

  const handleExport = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `questlog_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const success = await importDataJSON(content);
        if (success) {
          setImportStatus('Data QuestLog berhasil dipulihkan!');
        } else {
          setImportStatus('Format file backup tidak valid!');
        }
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  const executeResetDemoQuests = async () => {
    await resetDemoQuests();
    setConfirmStep('NONE');
    setIsSettingsOpen(false);
  };

  const executeResetTotal = async () => {
    await resetAllData();
    setConfirmStep('NONE');
    setIsSettingsOpen(false);
  };

  return (
    <RetroModal
      isOpen={isSettingsOpen}
      onClose={() => setIsSettingsOpen(false)}
      title="PENGATURAN & SISTEM QUESTLOG"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5 font-retro text-xs">
        {/* Theme Quick Selector */}
        <div className="border-4 border-black bg-[#161622] p-3 space-y-2 shadow-[4px_4px_0px_#000]">
          <h4 className="font-pixel text-[11px] text-yellow-300 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-amber-400" /> TEMA WARNA APLIKASI
          </h4>
          <div className="grid grid-cols-2 gap-2 font-pixel text-[10px]">
            <button
              onClick={() => handleSelectTheme('SAKURA_PEARL')}
              className={`p-2 border-2 border-black flex items-center gap-1 text-pink-900 bg-[#fcf0f7] ${theme === 'SAKURA_PEARL' ? 'ring-2 ring-yellow-400 font-bold' : ''}`}
            >
              <Flower2 className="w-3 h-3 text-pink-600" /> Sakura Pearl
            </button>

            <button
              onClick={() => handleSelectTheme('GOLDEN_VANILLA')}
              className={`p-2 border-2 border-black flex items-center gap-1 text-amber-900 bg-[#fef3c7] ${theme === 'GOLDEN_VANILLA' ? 'ring-2 ring-yellow-400 font-bold' : ''}`}
            >
              <Zap className="w-3 h-3 text-amber-600" /> Golden Vanilla
            </button>

            <button
              onClick={() => handleSelectTheme('OBSIDIAN_VIOLET')}
              className={`p-2 border-2 border-black flex items-center gap-1 text-purple-200 bg-[#181226] ${theme === 'OBSIDIAN_VIOLET' ? 'ring-2 ring-yellow-400 font-bold' : ''}`}
            >
              <Sparkles className="w-3 h-3 text-purple-400" /> Obsidian Violet
            </button>

            <button
              onClick={() => handleSelectTheme('DARK_DUNGEON')}
              className={`p-2 border-2 border-black flex items-center gap-1 text-red-200 bg-[#1d1010] ${theme === 'DARK_DUNGEON' ? 'ring-2 ring-yellow-400 font-bold' : ''}`}
            >
              <Flame className="w-3 h-3 text-red-500" /> Dark Dungeon
            </button>
          </div>
        </div>

        {/* Audio & Visual Options */}
        <div className="border-4 border-black bg-[#161622] p-3 space-y-3 shadow-[4px_4px_0px_#000]">
          <h4 className="font-pixel text-[11px] text-yellow-300 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-amber-400" /> SUARA & VISUAL RETRO
          </h4>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-pixel text-xs text-gray-200">Efek Suara 8-Bit</p>
              <p className="text-[10px] text-gray-400">Audio coin, level up, dan koin virtual</p>
            </div>
            <PixelButton
              variant={soundEnabled ? 'gold' : 'secondary'}
              size="sm"
              onClick={toggleSound}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 inline mr-1" /> : <VolumeX className="w-3.5 h-3.5 inline mr-1" />}
              {soundEnabled ? 'AKTIF' : 'MATI'}
            </PixelButton>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800 pt-2">
            <div>
              <p className="font-pixel text-xs text-gray-200">CRT Scanline Overlay</p>
              <p className="text-[10px] text-gray-400">Efek garis monitor tabung retro arcade</p>
            </div>
            <PixelButton
              variant={crtOverlay ? 'gold' : 'secondary'}
              size="sm"
              onClick={toggleCRT}
            >
              <Tv className="w-3.5 h-3.5 inline mr-1" />
              {crtOverlay ? 'AKTIF' : 'MATI'}
            </PixelButton>
          </div>
        </div>

        {/* Supabase Auth Status */}
        <div className="border-4 border-black bg-[#161622] p-3 space-y-2 shadow-[4px_4px_0px_#000]">
          <h4 className="font-pixel text-[11px] text-yellow-300 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-amber-400" /> STATUS AKUN QUESTLOG
          </h4>
          <div className="flex items-center justify-between font-mono text-[11px] text-gray-300">
            <span>
              Metode:{' '}
              {useQuestStore.getState().googleUser
                ? `Username (${useQuestStore.getState().googleUser?.user_metadata?.username || useQuestStore.getState().hero?.name || 'Pahlawan'})`
                : isDemoMode
                ? 'Demo Guest Mode'
                : 'Akun Cloud'}
            </span>
            <span className={`font-pixel text-[9px] px-2 py-0.5 border-2 ${isDemoMode ? 'bg-amber-950 border-amber-500 text-amber-300' : 'bg-emerald-950 border-emerald-500 text-emerald-300'}`}>
              {isDemoMode ? 'MODE OFFLINE' : 'CLOUD TERHUBUNG'}
            </span>
          </div>

          <div className="flex gap-2 pt-1">
            <PixelButton variant="danger" size="sm" onClick={() => {
              useQuestStore.getState().logoutGoogle();
              setIsSettingsOpen(false);
            }}>
              <Lock className="w-3.5 h-3.5 mr-1 inline" /> KELUAR AKUN / KUNCI
            </PixelButton>
          </div>
        </div>

        {/* Data Backup & Restore */}
        <div className="border-4 border-black bg-[#161622] p-3 space-y-3 shadow-[4px_4px_0px_#000]">
          <h4 className="font-pixel text-[11px] text-yellow-300 flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-amber-400" /> CADANGAN DATA (LOCAL-FIRST)
          </h4>
          <p className="text-gray-400 text-xs">
            Seluruh data tersimpan 100% lokal di browser Anda (IndexedDB). Anda dapat mengekspornya ke JSON.
          </p>

          {importStatus && (
            <div className="bg-amber-950 border-2 border-amber-500 text-amber-300 p-2 font-pixel text-[10px]">
              {importStatus}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <PixelButton variant="gold" size="sm" onClick={handleExport}>
              <Download className="w-3.5 h-3.5 mr-1 inline" /> EKSPOR BACKUP JSON
            </PixelButton>

            <label className="inline-block">
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
              <span className="font-pixel inline-flex items-center border-4 border-black bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 text-xs uppercase cursor-pointer shadow-[2px_2px_0px_#000]">
                <Upload className="w-3.5 h-3.5 mr-1 inline" /> IMPOR DATA JSON
              </span>
            </label>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="border-4 border-red-900 bg-red-950/20 p-3 space-y-3 shadow-[4px_4px_0px_#000]">
          <h4 className="font-pixel text-[11px] text-red-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> ZONA RESET & MANAJEMEN DATA
          </h4>
          <p className="text-gray-400 text-xs">
            Muat ulang 9 Task Demo RPG bawaan atau reset seluruh riwayat Quest dan Pahlawan ke Level 1.
          </p>

          {confirmStep === 'RESET_DEMO' && (
            <div className="bg-amber-950/90 border-2 border-amber-500 p-3 space-y-2 text-amber-200 font-sans text-xs rounded-xs">
              <p className="font-bold text-yellow-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Konfirmasi Reset Task & Experience:
              </p>
              <p>Experience (Level 1, 0 EXP, 100 Gold) akan direset dan 9 Task Demo RPG akan diisi ulang!</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <PixelButton variant="gold" size="sm" onClick={executeResetDemoQuests}>
                  YA, RESET TASK & EXP SEKARANG
                </PixelButton>
                <PixelButton variant="secondary" size="sm" onClick={() => setConfirmStep('NONE')}>
                  BATAL
                </PixelButton>
              </div>
            </div>
          )}

          {confirmStep === 'RESET_TOTAL' && (
            <div className="bg-red-950/90 border-2 border-red-500 p-3 space-y-2 text-red-200 font-sans text-xs rounded-xs">
              <p className="font-bold text-red-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Konfirmasi Reset Total QuestLog:
              </p>
              <p>Seluruh riwayat quest, Pahlawan (Level 1, 0 EXP, 100 Gold), dan ransel akan direset total!</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <PixelButton variant="danger" size="sm" onClick={executeResetTotal}>
                  YA, RESET TOTAL SEKARANG
                </PixelButton>
                <PixelButton variant="secondary" size="sm" onClick={() => setConfirmStep('NONE')}>
                  BATAL
                </PixelButton>
              </div>
            </div>
          )}

          {confirmStep === 'NONE' && (
            <div className="flex flex-wrap gap-2 pt-1">
              <PixelButton variant="gold" size="sm" onClick={() => setConfirmStep('RESET_DEMO')}>
                <RotateCcw className="w-3.5 h-3.5 mr-1 inline" /> RESET & ISI ULANG TASK DEMO
              </PixelButton>

              <PixelButton variant="danger" size="sm" onClick={() => setConfirmStep('RESET_TOTAL')}>
                <RotateCcw className="w-3.5 h-3.5 mr-1 inline" /> RESET TOTAL QUESTLOG
              </PixelButton>
            </div>
          )}
        </div>
      </div>
    </RetroModal>
  );
};
