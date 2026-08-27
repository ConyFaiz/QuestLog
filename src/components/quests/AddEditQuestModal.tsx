import React, { useState, useEffect } from 'react';
import { useQuestStore } from '../../store/useQuestStore';
import { RetroModal } from '../common/RetroModal';
import { PixelButton } from '../common/PixelButton';
import type { QuestType, QuestCategory } from '../../types/questlog';
import { STANDARD_QUEST_EXP, STANDARD_QUEST_GOLD } from '../../utils/leveling';
import { getTodayString } from '../../utils/dateUtils';
import { Gift } from 'lucide-react';

export const AddEditQuestModal: React.FC = () => {
  const { isAddQuestOpen, editingQuest, setIsAddQuestOpen, addQuest, updateQuest } = useQuestStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<QuestType>('DAILY');
  const [category, setCategory] = useState<QuestCategory>('WORK');
  const [dueDate, setDueDate] = useState(getTodayString());

  useEffect(() => {
    if (editingQuest) {
      setTitle(editingQuest.title);
      setDescription(editingQuest.description || '');
      setType(editingQuest.type || 'DAILY');
      setCategory(editingQuest.category);
      setDueDate(editingQuest.dueDate || getTodayString());
    } else {
      setTitle('');
      setDescription('');
      setType('DAILY');
      setCategory('WORK');
      setDueDate(getTodayString());
    }
  }, [editingQuest, isAddQuestOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingQuest && editingQuest.id) {
      updateQuest(editingQuest.id, {
        title: title.trim(),
        description: description.trim(),
        type,
        category,
        dueDate,
        expReward: STANDARD_QUEST_EXP,
        goldReward: STANDARD_QUEST_GOLD,
      });
    } else {
      addQuest({
        title: title.trim(),
        description: description.trim(),
        type,
        category,
        dueDate,
        expReward: STANDARD_QUEST_EXP,
        goldReward: STANDARD_QUEST_GOLD,
      });
    }
  };

  return (
    <RetroModal
      isOpen={isAddQuestOpen}
      onClose={() => setIsAddQuestOpen(false)}
      title={editingQuest ? 'EDIT QUEST' : 'TAMBAH QUEST BARU'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-retro">
        {/* Title */}
        <div>
          <label className="block font-pixel text-xs text-yellow-300 mb-1">
            Judul Quest *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="contoh: Selesaikan laporan harian..."
            className="w-full bg-black border-2 border-slate-600 focus:border-yellow-400 p-2 text-sm text-gray-100 focus:outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-pixel text-xs text-yellow-300 mb-1">
            Deskripsi / Catatan (Opsional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tambahkan detail target atau langkah-langkah..."
            className="w-full bg-black border-2 border-slate-600 focus:border-yellow-400 p-2 text-sm text-gray-100 focus:outline-none"
          />
        </div>

        {/* Grid for Type & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Type */}
          <div>
            <label className="block font-pixel text-[10px] text-yellow-300 mb-1">
              Tipe Quest *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as QuestType)}
              className="w-full bg-black border-2 border-slate-600 focus:border-yellow-400 p-2 text-xs text-gray-100 focus:outline-none font-pixel"
            >
              <option value="DAILY">QUEST HARIAN (DAILY)</option>
              <option value="EVENT">EVENT QUEST (SPECIAL)</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block font-pixel text-[10px] text-yellow-300 mb-1">
              Kategori Guild *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as QuestCategory)}
              className="w-full bg-black border-2 border-slate-600 focus:border-yellow-400 p-2 text-xs text-gray-100 focus:outline-none font-retro"
            >
              <option value="WORK">WORK</option>
              <option value="STUDY">STUDY</option>
              <option value="FITNESS">FITNESS</option>
              <option value="HEALTH">HEALTH</option>
              <option value="PERSONAL">PERSONAL</option>
              <option value="GENERAL">GENERAL</option>
            </select>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="block font-pixel text-xs text-yellow-300 mb-1">
            Tenggat Waktu (Due Date)
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-black border-2 border-slate-600 focus:border-yellow-400 p-2 text-sm text-gray-100 focus:outline-none"
          />
        </div>

        {/* Standardized Reward Info */}
        <div className="bg-amber-950/40 border-2 border-amber-500/50 p-2.5 font-pixel text-xs text-amber-300 flex justify-between items-center shadow-[2px_2px_0px_#000]">
          <span className="inline-flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5 text-amber-400" /> Standardized Quest Reward:
          </span>
          <span className="font-bold text-amber-400">+{STANDARD_QUEST_EXP} EXP • +{STANDARD_QUEST_GOLD} GOLD</span>
        </div>

        {/* Submit */}
        <div className="pt-2 flex justify-end gap-2">
          <PixelButton type="button" variant="secondary" onClick={() => setIsAddQuestOpen(false)}>
            BATAL
          </PixelButton>
          <PixelButton type="submit" variant="gold">
            {editingQuest ? 'SIMPAN PERUBAHAN' : 'TERIMA QUEST!'}
          </PixelButton>
        </div>
      </form>
    </RetroModal>
  );
};
