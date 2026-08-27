import React from 'react';
import { useQuestStore } from '../../store/useQuestStore';
import { RetroModal } from '../common/RetroModal';
import { PixelButton } from '../common/PixelButton';
import type { AppTheme } from '../../types/questlog';
import { Palette, Check, Sparkles, Flower2, Zap, Flame } from 'lucide-react';

interface ThemeOption {
  id: AppTheme;
  name: string;
  category: 'LIGHT' | 'DARK';
  bgPreview: string;
  cardPreview: string;
  borderPreview: string;
  accentPreview: string;
  textColor: string;
  description: string;
  icon: React.ElementType;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'SAKURA_PEARL',
    name: 'Sakura Pearl (Light Pink)',
    category: 'LIGHT',
    bgPreview: 'bg-[#fdf2f8]',
    cardPreview: 'bg-[#fcf0f7]',
    borderPreview: 'border-[#be185d]',
    accentPreview: 'bg-[#db2777]',
    textColor: 'text-[#831843]',
    description: 'Warna putih lembut bernuansa pink sakura pastel & emas.',
    icon: Flower2,
  },
  {
    id: 'GOLDEN_VANILLA',
    name: 'Golden Vanilla (Light Warm)',
    category: 'LIGHT',
    bgPreview: 'bg-[#fffbeb]',
    cardPreview: 'bg-[#fef3c7]',
    borderPreview: 'border-[#b45309]',
    accentPreview: 'bg-[#d97706]',
    textColor: 'text-[#78350f]',
    description: 'Warna putih vanila hangat bertema istana emas & perunggu.',
    icon: Zap,
  },
  {
    id: 'OBSIDIAN_VIOLET',
    name: 'Obsidian Violet (Dark Mana)',
    category: 'DARK',
    bgPreview: 'bg-[#0f0b18]',
    cardPreview: 'bg-[#181226]',
    borderPreview: 'border-[#6d28d9]',
    accentPreview: 'bg-[#a855f7]',
    textColor: 'text-[#f3e8ff]',
    description: 'Warna gelap kosmik berbalut ungu mana & cyan glowing.',
    icon: Sparkles,
  },
  {
    id: 'DARK_DUNGEON',
    name: 'Dark Dungeon (Dark Blood)',
    category: 'DARK',
    bgPreview: 'bg-[#120a0a]',
    cardPreview: 'bg-[#1d1010]',
    borderPreview: 'border-[#991b1b]',
    accentPreview: 'bg-[#ef4444]',
    textColor: 'text-[#fee2e2]',
    description: 'Warna gelap obsidian bertema kastil kuno & merah darah.',
    icon: Flame,
  },
];

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useQuestStore();

  const handleSelectTheme = (selectedTheme: AppTheme) => {
    setTheme(selectedTheme);
  };

  return (
    <RetroModal isOpen={isOpen} onClose={onClose} title="PILIH TEMA WARNA QUESTLOG" maxWidth="max-w-xl">
      <div className="space-y-4 font-retro">
        <div className="flex items-center gap-2 font-pixel text-xs text-amber-300 bg-slate-900 border-2 border-slate-700 p-2.5">
          <Palette className="w-4 h-4 text-amber-400" />
          <span>Pilih Kombinasi Warna Kustom Sesuai Selera Pahlawan</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {THEME_OPTIONS.map((t) => {
            const isSelected = theme === t.id;
            const IconComp = t.icon;

            return (
              <div
                key={t.id}
                onClick={() => handleSelectTheme(t.id)}
                className={`p-3 border-4 ${t.borderPreview} ${t.cardPreview} cursor-pointer shadow-[4px_4px_0px_#000] relative space-y-2 transition-all hover:scale-[1.02] ${isSelected ? 'ring-4 ring-yellow-400' : ''}`}
              >
                <div className="flex justify-between items-center">
                  <span className={`font-pixel text-xs font-bold ${t.textColor} inline-flex items-center gap-1.5`}>
                    <IconComp className="w-3.5 h-3.5 inline" /> {t.name}
                  </span>
                  {isSelected && (
                    <span className="font-pixel text-[9px] px-2 py-0.5 border-2 bg-emerald-600 border-black text-white flex items-center gap-1">
                      <Check className="w-3 h-3" /> AKTIF
                    </span>
                  )}
                </div>

                <p className={`font-retro text-xs opacity-90 ${t.textColor}`}>
                  {t.description}
                </p>

                {/* Color Palette Swatches Preview */}
                <div className="flex items-center gap-2 pt-1">
                  <div className={`w-5 h-5 ${t.bgPreview} border-2 border-black`} title="Background" />
                  <div className={`w-5 h-5 ${t.cardPreview} border-2 border-black`} title="Card" />
                  <div className={`w-5 h-5 ${t.accentPreview} border-2 border-black`} title="Accent" />
                  <span className="font-pixel text-[9px] uppercase opacity-75">
                    [{t.category} TEMA]
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex justify-end">
          <PixelButton variant="gold" size="sm" onClick={onClose}>
            <Sparkles className="w-3.5 h-3.5 mr-1 inline" /> TERAPKAN TEMA
          </PixelButton>
        </div>
      </div>
    </RetroModal>
  );
};
