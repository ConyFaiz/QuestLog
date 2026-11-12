import React, { useState } from 'react';
import { useQuestStore } from '../../store/useQuestStore';
import { SHOP_ITEMS } from './ItemShop';
import { renderItemIcon } from './ShopItemCard';
import { RetroModal } from '../common/RetroModal';
import { PixelButton } from '../common/PixelButton';
import { Backpack, PackageCheck } from 'lucide-react';

export const InventoryModal: React.FC = () => {
  const { isInventoryOpen, setIsInventoryOpen, inventory, useInventoryItem: consumeItem } = useQuestStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleUseItem = async (itemId: string) => {
    const res = await consumeItem(itemId);
    setToastMessage(res.message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <RetroModal
      isOpen={isInventoryOpen}
      onClose={() => setIsInventoryOpen(false)}
      title="RANSEL PAHLAWAN (INVENTORY)"
      maxWidth="max-w-xl"
    >
      <div className="space-y-4 font-retro">
        <div className="flex items-center gap-2 font-pixel text-xs text-amber-300 bg-slate-900 border-2 border-slate-700 p-2.5">
          <Backpack className="w-4 h-4 text-amber-400" />
          <span>Barang & Potion yang Kamu Beli dari Toko Tersimpan di Sini</span>
        </div>

        {toastMessage && (
          <div className="bg-emerald-950 border-2 border-emerald-500 text-emerald-300 font-pixel text-xs p-2.5 text-center shadow-[2px_2px_0px_#000]">
            {toastMessage}
          </div>
        )}

        {inventory.length === 0 ? (
          <div className="bg-[#1e1e2d] border-4 border-black p-8 text-center space-y-3 shadow-[4px_4px_0px_#000]">
            <div className="flex justify-center text-gray-500">
              <Backpack className="w-12 h-12" />
            </div>
            <h4 className="font-pixel text-xs text-yellow-400">RANSEL MASIH KOSONG</h4>
            <p className="font-retro text-xs text-gray-400">
              Kunjungi Toko Item untuk membeli Potion Merah & Tenda Kemah.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {inventory.map((inv) => {
              const shopItem = SHOP_ITEMS.find((s) => s.id === inv.itemId);
              if (!shopItem) return null;

              return (
                <div
                  key={inv.id}
                  className="bg-[#1e1e2d] border-4 border-black p-3 shadow-[4px_4px_0px_#000] flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-black border-2 border-slate-700 shadow-[2px_2px_0px_#000] shrink-0">
                      {renderItemIcon(shopItem.id)}
                    </div>
                    <div>
                      <h4 className="font-pixel text-xs text-yellow-300">
                        {shopItem.name}
                      </h4>
                      <p className="font-retro text-[11px] text-gray-300 mt-0.5">
                        {shopItem.description}
                      </p>
                      <span className="font-pixel text-[10px] text-emerald-400 block mt-1">
                        Jumlah: x{inv.quantity}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-end">
                    <PixelButton
                      variant="gold"
                      size="sm"
                      onClick={() => handleUseItem(shopItem.id)}
                    >
                      <PackageCheck className="w-3.5 h-3.5 mr-1 inline" /> PAKAI ITEM
                    </PixelButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </RetroModal>
  );
};
