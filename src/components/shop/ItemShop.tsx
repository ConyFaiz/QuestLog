import React, { useState } from 'react';
import { useQuestStore } from '../../store/useQuestStore';
import { ShopItemCard } from './ShopItemCard';
import { RetroModal } from '../common/RetroModal';
import { PixelButton } from '../common/PixelButton';
import type { ShopItem } from '../../types/questlog';
import { ShoppingBag, Coins, Backpack } from 'lucide-react';

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'potion_red',
    name: 'Potion Merah',
    description: 'Mengisi ulang 20 HP yang hilang akibat lupa task.',
    price: 50,
    icon: 'potion',
    category: 'CONSUMABLE',
    effectType: 'HEAL_HP',
    effectValue: 20,
  },
  {
    id: 'tent_freeze',
    name: 'Tenda Kemah (Freeze)',
    description: 'Streak tidak akan putus meskipun besok tidak ada task yang dikerjakan (Cocok untuk libur weekend).',
    price: 200,
    icon: 'tent',
    category: 'BUFF',
    effectType: 'FREEZE_STREAK',
  },
  {
    id: 'theme_dark_dungeon',
    name: 'Tema: Dark Dungeon',
    description: 'Mengubah warna UI/Tailwind dari tema terang ke mode gelap 8-bit.',
    price: 1000,
    icon: 'shield',
    category: 'THEME',
    effectType: 'THEME_DARK',
  },
  {
    id: 'elixir_wisdom',
    name: 'Elixir of Wisdom',
    description: 'Memberikan ramuan pengetahuan instan +50 EXP.',
    price: 150,
    icon: 'sparkles',
    category: 'CONSUMABLE',
    effectType: 'HEAL_HP',
    effectValue: 50,
  },
];

export const ItemShop: React.FC = () => {
  const { isShopOpen, setIsShopOpen, hero, buyShopItem, setIsInventoryOpen } = useQuestStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleBuy = async (item: ShopItem) => {
    const result = await buyShopItem(item);
    setToastMessage(result.message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <RetroModal
      isOpen={isShopOpen}
      onClose={() => setIsShopOpen(false)}
      title="TOKO ITEM ADVANTURER (SHOP)"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4 font-retro">
        {/* Balance & Info Bar */}
        <div className="bg-black border-4 border-amber-500 p-3 flex flex-wrap justify-between items-center gap-3 shadow-[4px_4px_0px_#000]">
          <div className="flex items-center gap-2 font-pixel text-xs text-amber-300">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <span>Gunakan Gold Virtual untuk Membeli Potion HP & Item Spesial</span>
          </div>

          <div className="flex items-center gap-3 font-pixel text-xs">
            <span className="text-amber-400 flex items-center gap-1.5 bg-amber-950 px-3 py-1 border-2 border-amber-600">
              <Coins className="w-4 h-4 fill-amber-400" /> {hero?.gold || 0} GOLD
            </span>

            <PixelButton
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsShopOpen(false);
                setIsInventoryOpen(true);
              }}
            >
              <Backpack className="w-3.5 h-3.5 mr-1 inline" /> BUKA RANSEL
            </PixelButton>
          </div>
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="bg-emerald-950 border-2 border-emerald-500 text-emerald-300 font-pixel text-xs p-2.5 text-center shadow-[2px_2px_0px_#000] animate-pulse">
            {toastMessage}
          </div>
        )}

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SHOP_ITEMS.map((item) => (
            <ShopItemCard key={item.id} item={item} onBuy={handleBuy} />
          ))}
        </div>
      </div>
    </RetroModal>
  );
};
