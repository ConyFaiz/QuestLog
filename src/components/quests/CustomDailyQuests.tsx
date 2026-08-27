import React, { useState } from 'react';
import { useQuestStore } from '../../store/useQuestStore';
import { PixelButton } from '../common/PixelButton';
import { PixelCard } from '../common/PixelCard';
import { PixelBadge } from '../common/PixelBadge';
import type { QuestCategory } from '../../types/questlog';
import { getTodayString } from '../../utils/dateUtils';
import { STANDARD_QUEST_EXP, STANDARD_QUEST_GOLD } from '../../utils/leveling';
import { Plus, Repeat, Sparkles, Check } from 'lucide-react';

interface PresetDaily {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
}

const PRESET_DAILY_QUESTS: PresetDaily[] = [
  {
    id: 'p1',
    title: 'Minum Air Putih 2 Liter',
    description: 'Jaga hidrasi tubuh sepanjang hari untuk konsentrasi optimal.',
    category: 'HEALTH',
  },
  {
    id: 'p2',
    title: 'Membaca Buku / Artikel 15 Menit',
    description: 'Tambah wawasan dan skill baru setiap hari.',
    category: 'STUDY',
  },
  {
    id: 'p3',
    title: 'Belajar Coding & Praktik 1 Jam',
    description: 'Asah logika pemrograman dan selesaikan tantangan koding.',
    category: 'STUDY',
  },
  {
    id: 'p4',
    title: 'Jalan Kaki / Jogging 5.000 Langkah',
    description: 'Jaga kesehatan fisik dan bakar kalori.',
    category: 'FITNESS',
  },
  {
    id: 'p5',
    title: 'Meditasi & Rest Sejenak 10 Menit',
    description: 'Kendalikan kestresan dan pulihkan HP mental.',
    category: 'PERSONAL',
  },
  {
    id: 'p6',
    title: 'Merapikan Meja Kerja & Kamar',
    description: 'Lingkungan rapi membuat pikiran lebih jernih saat berpetualang.',
    category: 'WORK',
  },
];

export const CustomDailyQuests: React.FC = () => {
  const { addQuest, quests } = useQuestStore();

  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [category, setCategory] = useState<QuestCategory>('WORK');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const today = getTodayString();

  const handleAddPreset = (preset: PresetDaily) => {
    addQuest({
      title: preset.title,
      description: preset.description,
      type: 'DAILY',
      category: preset.category,
      dueDate: today,
      expReward: STANDARD_QUEST_EXP,
      goldReward: STANDARD_QUEST_GOLD,
    });

    setAddedIds((prev) => ({ ...prev, [preset.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [preset.id]: false }));
    }, 2000);
  };

  const handleCreateCustomDaily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    addQuest({
      title: customTitle.trim(),
      description: customDesc.trim(),
      type: 'DAILY',
      category,
      dueDate: today,
      expReward: STANDARD_QUEST_EXP,
      goldReward: STANDARD_QUEST_GOLD,
    });

    setCustomTitle('');
    setCustomDesc('');
  };

  const todayQuestTitles = new Set(
    quests.filter((q) => q.dueDate === today || q.type === 'DAILY').map((q) => q.title)
  );

  return (
    <div className="space-y-6">
      {/* Custom Daily Creator Box */}
      <PixelCard variant="gold" className="p-5">
        <div className="flex items-center gap-2 font-pixel text-xs text-amber-300 mb-3">
          <Repeat className="w-4 h-4 text-amber-400" />
          <span>BUAT MISI HARIAN CUSTOM BARU</span>
        </div>

        <form onSubmit={handleCreateCustomDaily} className="space-y-3 font-retro">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-pixel text-[10px] text-yellow-300 mb-1">
                Nama Misi Harian *
              </label>
              <input
                type="text"
                required
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="contoh: Review Pull Request & Commit Code..."
                className="w-full bg-black border-2 border-amber-600 p-2 text-xs text-gray-100 focus:border-yellow-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-pixel text-[10px] text-yellow-300 mb-1">
                Catatan / Target
              </label>
              <input
                type="text"
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                placeholder="contoh: Minimal 1 PR diselesaikan"
                className="w-full bg-black border-2 border-amber-600 p-2 text-xs text-gray-100 focus:border-yellow-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-pixel text-[10px] text-yellow-300 mb-1">
                Kategori Guild
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as QuestCategory)}
                className="w-full bg-black border-2 border-amber-600 p-2 text-xs text-gray-100 focus:outline-none"
              >
                <option value="WORK">WORK</option>
                <option value="STUDY">STUDY</option>
                <option value="FITNESS">FITNESS</option>
                <option value="HEALTH">HEALTH</option>
                <option value="PERSONAL">PERSONAL</option>
                <option value="GENERAL">GENERAL</option>
              </select>
            </div>

            <div className="flex items-end">
              <PixelButton type="submit" variant="gold" size="md" className="w-full">
                <Plus className="w-4 h-4 mr-1 inline" /> TAMBAH MISI HARIAN
              </PixelButton>
            </div>
          </div>
        </form>
      </PixelCard>

      {/* Preset Daily Quest Catalog */}
      <div className="space-y-3">
        <div className="flex items-center justify-between font-pixel text-xs text-yellow-300">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-yellow-400" /> REKOMENDASI TEMPLATE MISI HARIAN (1-CLICK ADD)
          </span>
          <span className="text-[10px] text-gray-400 font-retro">Klik tombol untuk memasukkan ke Misi Hari Ini</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESET_DAILY_QUESTS.map((preset) => {
            const isAlreadyAdded = todayQuestTitles.has(preset.title);
            const isJustAdded = addedIds[preset.id];

            return (
              <div
                key={preset.id}
                className="bg-[#1e1e2d] border-4 border-black p-3 shadow-[4px_4px_0px_#000] flex flex-col justify-between space-y-2 hover:border-amber-400 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <PixelBadge type="category" value={preset.category} />
                    <span className="text-[9px] font-pixel px-2 py-0.5 border-2 bg-amber-950 border-amber-600 text-amber-300">
                      DAILY
                    </span>
                  </div>
                  <h4 className="font-pixel text-xs text-yellow-300">
                    {preset.title}
                  </h4>
                  <p className="font-retro text-xs text-gray-400">
                    {preset.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-end">
                  {isJustAdded ? (
                    <span className="font-pixel text-[10px] text-emerald-400 border-2 border-emerald-600 px-2 py-1 bg-emerald-950 flex items-center gap-1">
                      <Check className="w-3 h-3" /> DITAMBAHKAN!
                    </span>
                  ) : isAlreadyAdded ? (
                    <span className="font-pixel text-[10px] text-gray-400 border-2 border-slate-700 px-2 py-1 bg-slate-900">
                      SUDAH ADA HARI INI
                    </span>
                  ) : (
                    <PixelButton
                      variant="gold"
                      size="sm"
                      onClick={() => handleAddPreset(preset)}
                    >
                      + AKTIFKAN HARIAN
                    </PixelButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
