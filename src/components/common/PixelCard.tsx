import React from 'react';
import { useQuestStore } from '../../store/useQuestStore';
import type { AppTheme } from '../../types/questlog';

interface PixelCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gold' | 'danger' | 'dungeon' | 'castle';
  onClick?: () => void;
}

export const PixelCard: React.FC<PixelCardProps> = ({
  children,
  className = '',
  variant = 'default',
  onClick,
}) => {
  const theme = useQuestStore((state) => state.theme);

  const getCardStyle = (themeName: AppTheme, v: string) => {
    switch (themeName) {
      case 'SAKURA_PEARL':
        return v === 'gold'
          ? 'bg-[#fce7f3] border-2 sm:border-3 border-[#be185d] text-[#831843] shadow-[3px_3px_0px_#9d174d]'
          : v === 'danger'
          ? 'bg-[#ffe4e6] border-2 sm:border-3 border-red-600 text-red-950 shadow-[3px_3px_0px_#991b1b]'
          : 'bg-[#fcf0f7] border-2 sm:border-3 border-[#be185d] text-[#831843] shadow-[3px_3px_0px_#9d174d]';

      case 'GOLDEN_VANILLA':
        return v === 'gold'
          ? 'bg-[#fef3c7] border-2 sm:border-3 border-[#b45309] text-[#78350f] shadow-[3px_3px_0px_#78350f]'
          : v === 'danger'
          ? 'bg-[#fee2e2] border-2 sm:border-3 border-red-600 text-red-950 shadow-[3px_3px_0px_#991b1b]'
          : 'bg-[#fffbeb] border-2 sm:border-3 border-[#b45309] text-[#78350f] shadow-[3px_3px_0px_#92400e]';

      case 'OBSIDIAN_VIOLET':
        return v === 'gold'
          ? 'bg-[#2a1b40] border-2 sm:border-3 border-purple-500 text-purple-100 shadow-[3px_3px_0px_#581c87]'
          : v === 'danger'
          ? 'bg-[#2d1b1e] border-2 sm:border-3 border-red-600 text-red-100 shadow-[3px_3px_0px_#450a0a]'
          : 'bg-[#181226] border-2 sm:border-3 border-[#6d28d9] text-[#f3e8ff] shadow-[3px_3px_0px_#000]';

      case 'DARK_DUNGEON':
      default:
        return v === 'gold'
          ? 'bg-[#2a2215] border-2 sm:border-3 border-amber-500 text-amber-100 shadow-[3px_3px_0px_#78350f]'
          : v === 'danger'
          ? 'bg-[#2d1b1e] border-2 sm:border-3 border-red-600 text-red-100 shadow-[3px_3px_0px_#450a0a]'
          : 'bg-[#1d1010] border-2 sm:border-3 border-[#991b1b] text-[#fee2e2] shadow-[3px_3px_0px_#000]';
    }
  };

  const getCornerColor = (themeName: AppTheme) => {
    switch (themeName) {
      case 'SAKURA_PEARL': return 'bg-[#db2777]';
      case 'GOLDEN_VANILLA': return 'bg-[#d97706]';
      case 'OBSIDIAN_VIOLET': return 'bg-[#a855f7]';
      case 'DARK_DUNGEON': default: return 'bg-yellow-400';
    }
  };

  const currentStyles = getCardStyle(theme, variant);
  const cornerBg = getCornerColor(theme);

  return (
    <div
      onClick={onClick}
      className={`relative p-4 ${currentStyles} ${onClick ? 'cursor-pointer hover:scale-[1.01] transition-all' : ''} ${className}`}
    >
      {/* Retro Pixel Corner Accents */}
      <div className={`absolute top-0 left-0 w-2 h-2 ${cornerBg} border-r border-b border-black`} />
      <div className={`absolute top-0 right-0 w-2 h-2 ${cornerBg} border-l border-b border-black`} />
      <div className={`absolute bottom-0 left-0 w-2 h-2 ${cornerBg} border-r border-t border-black`} />
      <div className={`absolute bottom-0 right-0 w-2 h-2 ${cornerBg} border-l border-t border-black`} />

      {children}
    </div>
  );
};
