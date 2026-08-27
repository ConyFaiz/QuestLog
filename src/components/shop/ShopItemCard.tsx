import React from 'react';
import type { ShopItem } from '../../types/questlog';
import { useQuestStore } from '../../store/useQuestStore';
import { PixelButton } from '../common/PixelButton';
import { Coins, Check, FlaskConical, Tent, Shield, Sparkles } from 'lucide-react';

interface ShopItemCardProps {
  item: ShopItem;
  onBuy: (item: ShopItem) => void;
}

export const renderItemIcon = (itemId: string) => {
  switch (itemId) {
    case 'potion_red':
      return <FlaskConical className="w-6 h-6 text-red-400" />;
    case 'tent_freeze':
      return <Tent className="w-6 h-6 text-cyan-400" />;
    case 'theme_dark_dungeon':
      return <Shield className="w-6 h-6 text-purple-400" />;
    case 'elixir_wisdom':
    default:
      return <Sparkles className="w-6 h-6 text-amber-400" />;
  }
};

export const ShopItemCard: React.FC<ShopItemCardProps> = ({ item, onBuy }) => {
  const hero = useQuestStore((state) => state.hero);
  const isAffordable = (hero?.gold || 0) >= item.price;
  const isThemeActive = item.effectType === 'THEME_DARK' && hero?.theme === 'DARK_DUNGEON';

  return (
    <div className="bg-[#1e1e2d] border-4 border-black p-4 shadow-[4px_4px_0px_#000] flex flex-col justify-between space-y-3 relative hover:border-amber-400/80 transition-colors">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-black border-2 border-slate-700 shadow-[2px_2px_0px_#000] select-none">
            {renderItemIcon(item.id)}
          </div>

          <span className="font-pixel text-[9px] px-2 py-0.5 border-2 bg-slate-900 border-slate-700 text-slate-300">
            {item.category}
          </span>
        </div>

        <div>
          <h4 className="font-pixel text-xs text-yellow-300 tracking-wider">
            {item.name}
          </h4>
          <p className="font-retro text-xs text-gray-300 mt-1">
            {item.description}
          </p>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 font-pixel text-xs text-amber-400">
          <Coins className="w-3.5 h-3.5 fill-amber-400" />
          <span>{item.price} G</span>
        </div>

        {isThemeActive ? (
          <span className="font-pixel text-[10px] text-emerald-400 border-2 border-emerald-600 px-2 py-1 bg-emerald-950 flex items-center gap-1">
            <Check className="w-3 h-3" /> SUDAH AKTIF
          </span>
        ) : (
          <PixelButton
            variant="gold"
            size="sm"
            disabled={!isAffordable}
            onClick={() => onBuy(item)}
          >
            BELI
          </PixelButton>
        )}
      </div>
    </div>
  );
};
