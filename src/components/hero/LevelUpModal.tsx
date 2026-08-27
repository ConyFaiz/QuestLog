import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useQuestStore } from '../../store/useQuestStore';
import { PixelButton } from '../common/PixelButton';
import { RetroModal } from '../common/RetroModal';
import { Trophy, Sparkles } from 'lucide-react';
import { getHeroTitle } from '../../utils/leveling';

export const LevelUpModal: React.FC = () => {
  const { lastLevelUpInfo, clearLastLevelUpInfo, hero } = useQuestStore();

  useEffect(() => {
    if (lastLevelUpInfo) {
      // Launch 8-bit retro colored confetti burst!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#06b6d4', '#8b5cf6', '#ef4444', '#10b981'],
      });
    }
  }, [lastLevelUpInfo]);

  if (!lastLevelUpInfo || !hero) return null;

  const newTitle = getHeroTitle(lastLevelUpInfo.newLevel);

  return (
    <RetroModal
      isOpen={!!lastLevelUpInfo}
      onClose={clearLastLevelUpInfo}
      title="VICTORY! LEVEL UP!"
      maxWidth="max-w-md"
    >
      <div className="text-center py-4 space-y-4">
        {/* Animated Trophy Icon */}
        <div className="relative inline-block">
          <div className="w-20 h-20 bg-amber-500/20 border-4 border-amber-400 mx-auto flex items-center justify-center text-amber-400 shadow-[4px_4px_0px_#000] animate-bounce-slow">
            <Trophy className="w-10 h-10 fill-amber-400" />
          </div>
          <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-2 -right-2 animate-spin" />
        </div>

        <div className="space-y-1">
          <h3 className="font-pixel text-lg text-yellow-300 tracking-widest">
            NAIK KE LEVEL {lastLevelUpInfo.newLevel}!
          </h3>
          <p className="font-retro text-sm text-gray-300">
            Selamat <span className="text-amber-400 font-bold">{hero.name}</span>! Kerja kerasmu terbayar.
          </p>
        </div>

        <div className="bg-black/60 border-2 border-amber-500/60 p-3 text-left space-y-2 font-pixel text-xs">
          <div className="flex justify-between items-center text-gray-300">
            <span>Level Sebelumnya:</span>
            <span className="text-red-400">Lv. {lastLevelUpInfo.oldLevel}</span>
          </div>
          <div className="flex justify-between items-center text-yellow-400 font-bold">
            <span>Level Baru:</span>
            <span className="text-emerald-400 text-sm">Lv. {lastLevelUpInfo.newLevel}</span>
          </div>
          <div className="flex justify-between items-center text-cyan-300">
            <span>Gelar Baru:</span>
            <span className="text-cyan-200">{newTitle}</span>
          </div>
        </div>

        <PixelButton variant="gold" size="lg" className="w-full" onClick={clearLastLevelUpInfo}>
          <Sparkles className="w-4 h-4 mr-1 inline" /> LANJUTKAN PETUALANGAN!
        </PixelButton>
      </div>
    </RetroModal>
  );
};
