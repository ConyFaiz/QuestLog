import React, { useState } from 'react';
import { useQuestStore } from '../../store/useQuestStore';
import { RetroModal } from '../common/RetroModal';
import { PixelButton } from '../common/PixelButton';
import { REAL_LICENSE_KEYS } from '../../config/licenses';

export const UpgradeLicenseModal: React.FC = () => {
  const { isUpgradeModalOpen, setIsUpgradeModalOpen, upgradeLicense } = useQuestStore();
  const [inputKey, setInputKey] = useState('');
  const [msg, setMsg] = useState<{ text: string; success: boolean } | null>(null);

  const handleUpgrade = async () => {
    if (!inputKey.trim()) return;
    const res = await upgradeLicense(inputKey);
    setMsg({ text: res.message, success: res.success });
  };

  return (
    <RetroModal
      isOpen={isUpgradeModalOpen}
      onClose={() => setIsUpgradeModalOpen(false)}
      title="UPGRADE KE LISENSI PENUH"
      maxWidth="max-w-md"
    >
      <div className="space-y-4 font-retro">
        <p className="text-xs text-gray-300">
          Anda saat ini menggunakan <span className="text-amber-400 font-pixel text-[10px]">VERSI DEMO</span>. Masukkan Serial Key resmi untuk membuka versi Penuh & Permanen!
        </p>

        <div>
          <label className="block font-pixel text-xs text-yellow-300 mb-1">
            KUNCI LISENSI RESMI
          </label>
          <input
            type="text"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder="QLG-9X82-M4P7-Q1L9"
            className="w-full bg-black border-2 border-slate-600 focus:border-yellow-400 p-2 font-pixel text-xs text-yellow-300 uppercase tracking-widest focus:outline-none"
          />
        </div>

        {msg && (
          <div className={`p-2 border-2 font-pixel text-xs text-center ${msg.success ? 'bg-emerald-950 border-emerald-500 text-emerald-300' : 'bg-red-950 border-red-500 text-red-300'}`}>
            {msg.text}
          </div>
        )}

        {/* Demo list helper */}
        <div className="bg-black/60 border border-slate-700 p-2 text-[11px] space-y-1">
          <p className="text-cyan-300 font-pixel text-[9px]">Kunci Resmi Sampel untuk Pengujian:</p>
          <code className="block bg-slate-900 p-1 text-yellow-300 text-[10px] select-all font-mono">
            {REAL_LICENSE_KEYS[0]}
          </code>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <PixelButton variant="secondary" onClick={() => setIsUpgradeModalOpen(false)}>
            TUTUP
          </PixelButton>
          <PixelButton variant="gold" onClick={handleUpgrade}>
            AKTIFKAN LISENSI
          </PixelButton>
        </div>
      </div>
    </RetroModal>
  );
};
