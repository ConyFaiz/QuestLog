import React, { useState } from 'react';
import { useQuestStore } from '../../store/useQuestStore';
import { QuestCard } from './QuestCard';
import { QuestHistoryArchive } from './QuestHistoryArchive';
import { PixelButton } from '../common/PixelButton';
import { Plus, Search, Filter, Scroll, Sun, History, ScrollText } from 'lucide-react';
import type { QuestCategory } from '../../types/questlog';
import { getTodayString } from '../../utils/dateUtils';

type TabView = 'TODAY' | 'ALL' | 'HISTORY';

export const QuestList: React.FC = () => {
  const { quests, setIsAddQuestOpen, resetDemoQuests } = useQuestStore();

  const [activeTab, setActiveTab] = useState<TabView>('TODAY');
  const [selectedCategory, setSelectedCategory] = useState<QuestCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const todayStr = getTodayString();

  // Quests for TODAY: All DAILY quests + EVENT quests active today
  const todayQuests = quests.filter((q) => {
    if (q.type === 'DAILY') {
      return true; // Always remains displayed for daily routines
    }
    return q.status === 'ACTIVE' && (!q.dueDate || q.dueDate === todayStr);
  });

  // ALL active quests: All DAILY quests + Active EVENT quests
  const allActiveQuests = quests.filter((q) => {
    if (q.type === 'DAILY') return true;
    return q.status === 'ACTIVE';
  });

  const filteredQuests = quests.filter((q) => {
    // Tab View Logic
    if (activeTab === 'TODAY') {
      if (q.type === 'DAILY') {
        // Daily quest remains displayed
      } else {
        if (q.status !== 'ACTIVE') return false;
        if (q.dueDate && q.dueDate !== todayStr) return false;
      }
    } else if (activeTab === 'ALL') {
      if (q.type === 'DAILY') {
        // Daily quest remains displayed in active list
      } else {
        if (q.status !== 'ACTIVE') return false;
      }
    }

    // Category Filter
    if (selectedCategory !== 'ALL' && q.category !== selectedCategory) return false;

    // Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTitle = q.title.toLowerCase().includes(query);
      const matchDesc = q.description?.toLowerCase().includes(query);
      return matchTitle || matchDesc;
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Navigation Tabs Bar */}
      <div className="flex flex-wrap gap-2 font-gaming text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab('TODAY')}
          className={`px-3.5 py-2 border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-2 transition-all cursor-pointer rounded-xs ${activeTab === 'TODAY' ? 'bg-amber-400 text-slate-950 font-extrabold' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'}`}
        >
          <Sun className="w-4 h-4 text-amber-500 fill-amber-500" /> MISI HARI INI ({todayQuests.length})
        </button>

        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3.5 py-2 border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-2 transition-all cursor-pointer rounded-xs ${activeTab === 'ALL' ? 'bg-indigo-600 text-white font-extrabold' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'}`}
        >
          <Scroll className="w-4 h-4 text-indigo-300" /> SEMUA MISI AKTIF ({allActiveQuests.length})
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`px-3.5 py-2 border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-2 transition-all cursor-pointer rounded-xs ${activeTab === 'HISTORY' ? 'bg-emerald-500 text-slate-950 font-extrabold' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'}`}
        >
          <History className="w-4 h-4 text-emerald-950" /> RIWAYAT MISI
        </button>
      </div>

      {/* View Switcher Content */}
      {activeTab === 'HISTORY' ? (
        <QuestHistoryArchive />
      ) : (
        <div className="space-y-4">
          {/* Action Header & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#1a1a26] p-3 border-2 border-black shadow-[2.5px_2.5px_0px_#000] rounded-xs">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Quest..."
                className="w-full bg-black border-2 border-slate-700 pl-9 pr-3 py-1.5 font-sans text-xs sm:text-sm text-gray-100 focus:border-yellow-400 focus:outline-none rounded-xs"
              />
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-amber-400 hidden sm:block" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as QuestCategory | 'ALL')}
                className="bg-black border-2 border-slate-700 px-2 py-1.5 font-sans text-xs sm:text-sm text-gray-200 focus:border-yellow-400 focus:outline-none rounded-xs"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="WORK">Work</option>
                <option value="STUDY">Study</option>
                <option value="FITNESS">Fitness</option>
                <option value="HEALTH">Health</option>
                <option value="PERSONAL">Personal</option>
                <option value="GENERAL">General</option>
              </select>

              <PixelButton variant="gold" size="sm" onClick={() => setIsAddQuestOpen(true)}>
                <Plus className="w-4 h-4 mr-1 inline" /> QUEST BARU
              </PixelButton>
            </div>
          </div>

          {/* Quest Cards List */}
          <div className="space-y-3">
            {filteredQuests.length === 0 ? (
              <div className="bg-[#1a1a26] border-2 border-black p-8 text-center space-y-3 shadow-[2.5px_2.5px_0px_#000] rounded-xs">
                <div className="flex justify-center text-amber-400">
                  <ScrollText className="w-12 h-12" />
                </div>
                <h4 className="font-gaming text-sm text-yellow-400 font-bold">
                  {activeTab === 'TODAY'
                    ? 'TIDAK ADA MISI AKTIF HARI INI'
                    : 'TIDAK ADA QUEST DITEMUKAN'}
                </h4>
                <p className="font-sans text-xs sm:text-sm text-gray-300 max-w-sm mx-auto">
                  Semua quest telah selesai atau belum ditambahkan! Klik + QUEST BARU untuk membuat quest baru atau muat ulang daftar task demo.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <PixelButton variant="gold" size="sm" onClick={() => setIsAddQuestOpen(true)}>
                    + TAMBAH QUEST BARU
                  </PixelButton>
                  <PixelButton variant="secondary" size="sm" onClick={() => resetDemoQuests()}>
                    + ISI ULANG TASK DEMO (9 TASK)
                  </PixelButton>
                </div>
              </div>
            ) : (
              filteredQuests.map((quest) => (
                <QuestCard key={quest.id} quest={quest} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
