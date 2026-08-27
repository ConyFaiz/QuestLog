import React from 'react';
import { useQuestStore } from '../../store/useQuestStore';
import { RetroModal } from '../common/RetroModal';
import { PixelButton } from '../common/PixelButton';
import { Camera, Upload, Check, User, Shield, Wand2, UserCheck, Target, Flame, Crown, Bot, Sparkles } from 'lucide-react';

interface AvatarSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  { id: 'shield', icon: Shield, label: 'Knight Paladin' },
  { id: 'wand', icon: Wand2, label: 'Archmage Wizard' },
  { id: 'ninja', icon: UserCheck, label: 'Shadow Ninja' },
  { id: 'ranger', icon: Target, label: 'Elven Ranger' },
  { id: 'dragon', icon: Flame, label: 'Dragon Slayer' },
  { id: 'crown', icon: Crown, label: 'Royal Guildmaster' },
  { id: 'bot', icon: Bot, label: 'Cyber Mech' },
  { id: 'sparkles', icon: Sparkles, label: 'Mythic Beast' },
];

export const AvatarSelectorModal: React.FC<AvatarSelectorModalProps> = ({ isOpen, onClose }) => {
  const { hero, setHeroAvatar } = useQuestStore();

  const handleSelectPreset = (avatarId: string) => {
    setHeroAvatar(avatarId);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran foto terlalu besar! Maksimal 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const base64Data = evt.target?.result as string;
      if (base64Data) {
        await setHeroAvatar(base64Data);
        onClose();
      }
    };
    reader.readAsDataURL(file);
  };

  const isCustomImage = (url?: string | null) => url && (url.startsWith('data:') || url.startsWith('http'));

  return (
    <RetroModal isOpen={isOpen} onClose={onClose} title="UBAH FOTO PROFIL / AVATAR PAHLAWAN" maxWidth="max-w-md">
      <div className="space-y-4 font-retro text-xs">
        {/* Upload Custom Image Option */}
        <div className="border-4 border-amber-600 bg-amber-950/30 p-4 space-y-3 shadow-[4px_4px_0px_#000]">
          <div className="flex items-center gap-2 font-pixel text-xs text-amber-300">
            <Camera className="w-4 h-4 text-amber-400" />
            <span>UNGGAH FOTO DARI PERANGKAT</span>
          </div>
          <p className="text-gray-300 text-xs">
            Unggah foto kamu sendiri atau gambar kustom (PNG, JPG, WebP) yang akan tersimpan secara otomatis 100% offline.
          </p>

          <label className="block w-full">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <span className="font-pixel inline-flex items-center justify-center border-4 border-black bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 text-xs uppercase w-full cursor-pointer shadow-[2px_2px_0px_#000] font-bold">
              <Upload className="w-4 h-4 mr-2 inline" /> PILIH FOTO DARI GALERI
            </span>
          </label>
        </div>

        {/* Preset RPG Avatars Catalog */}
        <div className="space-y-2">
          <label className="block font-pixel text-xs text-yellow-300 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-yellow-400" /> ATAU PILIH PRESET AVATAR ICON
          </label>

          <div className="grid grid-cols-4 gap-2">
            {PRESET_AVATARS.map((avatar) => {
              const IconComp = avatar.icon;
              const isCurrent = !isCustomImage(hero?.avatarUrl) && hero?.avatarUrl === avatar.id;

              return (
                <button
                  key={avatar.id}
                  onClick={() => handleSelectPreset(avatar.id)}
                  className={`p-2.5 border-2 ${isCurrent ? 'border-amber-400 bg-amber-950 text-yellow-300 shadow-[2px_2px_0px_#000]' : 'border-slate-700 bg-slate-900 text-gray-300 hover:border-slate-500'} flex flex-col items-center gap-1 cursor-pointer transition-all hover:scale-105`}
                >
                  <IconComp className="w-6 h-6 text-amber-400" />
                  <span className="font-pixel text-[8px] truncate max-w-full">{avatar.label}</span>
                  {isCurrent && <Check className="w-3 h-3 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <PixelButton variant="secondary" size="sm" onClick={onClose}>
            TUTUP
          </PixelButton>
        </div>
      </div>
    </RetroModal>
  );
};
