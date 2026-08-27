import React, { useState } from 'react';
import { useQuestStore } from '../../store/useQuestStore';
import { PixelProgressBar } from '../common/PixelProgressBar';
import { PixelCard } from '../common/PixelCard';
import { PixelButton } from '../common/PixelButton';
import { AvatarSelectorModal } from './AvatarSelectorModal';
import { getExpForLevel } from '../../utils/leveling';
import { Flame, Shield, Coins, Edit2, Check, Camera } from 'lucide-react';

export const HeroStatusCard: React.FC = () => {
  const { hero, setHeroName, theme } = useQuestStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState(hero?.name || '');

  if (!hero) return null;

  const isLight = theme === 'SAKURA_PEARL' || theme === 'GOLDEN_VANILLA';
  const expNeeded = getExpForLevel(hero.level);
  const isComboActive = hero.streakDays >= 3;

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setHeroName(nameInput.trim());
      setIsEditingName(false);
    }
  };

  const isCustomImage = hero.avatarUrl && (hero.avatarUrl.startsWith('data:') || hero.avatarUrl.startsWith('http'));

  return (
    <PixelCard variant={isLight ? 'castle' : 'dungeon'} className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Avatar & Identity */}
        <div className="flex items-center gap-4">
          {/* Pixel Avatar Frame */}
          <div
            onClick={() => setIsAvatarModalOpen(true)}
            className="relative w-16 h-16 bg-slate-900 border-4 border-amber-400 flex items-center justify-center text-3xl shadow-[4px_4px_0px_#000] shrink-0 select-none animate-gold-glow cursor-pointer group overflow-hidden"
            title="Klik untuk ubah Foto Profil / Avatar"
          >
            {isCustomImage ? (
              <img
                src={hero.avatarUrl!}
                alt="Avatar Pahlawan"
                className="w-full h-full object-cover border border-black"
              />
            ) : (
              <Shield className="w-8 h-8 text-amber-400" />
            )}

            {/* Hover overlay camera icon */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-amber-300">
              <Camera className="w-5 h-5" />
            </div>

            {/* Level Badge Overlay */}
            <div className="absolute -bottom-2 -right-2 bg-yellow-400 border-2 border-black text-slate-950 font-gaming text-[11px] px-1.5 font-bold shadow-[2px_2px_0px_#000] z-10">
              Lv.{hero.level}
            </div>
          </div>

          <div className="space-y-1">
            {/* Editable Name */}
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="bg-black border-2 border-yellow-400 px-2 py-0.5 font-gaming text-sm text-yellow-300 focus:outline-none font-bold"
                  maxLength={20}
                  autoFocus
                />
                <PixelButton variant="gold" size="sm" onClick={handleSaveName}>
                  <Check className="w-3 h-3" />
                </PixelButton>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className={`font-gaming text-base sm:text-lg tracking-wide uppercase font-bold ${isLight ? 'text-blue-950 font-bold' : 'text-yellow-300'}`}>
                  {hero.name}
                </h1>
                <button
                  onClick={() => {
                    setNameInput(hero.name);
                    setIsEditingName(true);
                  }}
                  className="text-gray-400 hover:text-amber-500 transition-colors p-1"
                  title="Ubah Nama Pahlawan"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <p className={`font-gaming text-xs sm:text-sm ${isLight ? 'text-slate-700' : 'text-gray-300'} flex items-center gap-1 font-semibold`}>
              <span className="text-amber-500 font-bold uppercase">{hero.title}</span>
            </p>

            {/* Streak & Freeze Status */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className={`inline-flex items-center gap-1 font-gaming text-[11px] sm:text-xs px-2 py-0.5 border ${isComboActive ? 'bg-amber-950/80 border-amber-500 text-amber-300 animate-pulse' : isLight ? 'bg-slate-200 border-slate-400 text-slate-800' : 'bg-zinc-800 border-zinc-700 text-zinc-300'}`}>
                <Flame className={`w-3.5 h-3.5 ${isComboActive ? 'text-amber-400 fill-amber-400' : 'text-gray-400'}`} />
                {hero.streakDays} Hari Streak {isComboActive && '(Combo 1.5x Multiplier!)'}
              </span>

              {hero.isStreakFrozen && (
                <span className="inline-flex items-center gap-1 font-gaming text-[11px] sm:text-xs px-2 py-0.5 border bg-cyan-950/80 border-cyan-500 text-cyan-300">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" /> Tenda Kemah Aktif
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Status Bars & Currency */}
        <div className="flex-1 max-w-md space-y-2">
          <PixelProgressBar
            current={hero.hp}
            max={hero.maxHp}
            label="HP (HEALTH)"
            variant="hp"
          />

          <PixelProgressBar
            current={hero.exp}
            max={expNeeded}
            label="EXP (EXPERIENCE)"
            variant="exp"
          />

          {/* Gold Counter */}
          <div className={`flex justify-between items-center ${isLight ? 'bg-slate-950 text-amber-300 border-amber-600' : 'bg-black/60 text-amber-300 border-amber-600/60'} px-3 py-1.5 border-2 font-gaming text-xs sm:text-sm shadow-[2px_2px_0px_#000]`}>
            <span className="text-amber-400 flex items-center gap-1.5 font-bold">
              <Coins className="w-4 h-4 text-amber-400 fill-amber-400" /> Virtual Gold:
            </span>
            <span className="text-amber-300 text-sm font-bold tracking-wider">
              {hero.gold} GOLD
            </span>
          </div>
        </div>
      </div>

      <AvatarSelectorModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
      />
    </PixelCard>
  );
};
