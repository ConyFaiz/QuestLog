import React, { useState } from 'react';
import { useQuestStore } from '../../store/useQuestStore';
import { PixelBadge } from '../common/PixelBadge';
import { PixelCard } from '../common/PixelCard';
import { formatDateDisplay } from '../../utils/dateUtils';
import { Search, Trophy, Coins, Zap, CheckCircle2, History, ScrollText, Gift } from 'lucide-react';

export const QuestHistoryArchive: React.FC = () => {
  const { quests, history } = useQuestStore();
  const [search, setSearch] = useState('');

  const completedQuests = quests.filter((q) => q.status === 'COMPLETED');

  const filteredHistory = completedQuests.filter((q) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return q.title.toLowerCase().includes(query) || q.description?.toLowerCase().includes(query);
  });

  const totalExpEarned = history
    .filter((h) => h.type === 'COMPLETED')
    .reduce((sum, h) => sum + h.expChange, 0);

  const totalGoldEarned = history
    .filter((h) => h.type === 'COMPLETED')
    .reduce((sum, h) => sum + h.goldChange, 0);

  return (
    <div className="space-y-4">
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <PixelCard variant="gold" className="p-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400 fill-amber-400" />
            <div>
              <p className="font-pixel text-[10px] text-amber-300">TOTAL TERSELESAIKAN</p>
              <p className="font-pixel text-base text-yellow-300 font-bold">{completedQuests.length} Quest</p>
            </div>
          </div>
        </PixelCard>

        <PixelCard variant="dungeon" className="p-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <div>
              <p className="font-pixel text-[10px] text-cyan-300">TOTAL EXP DIKUMPULKAN</p>
              <p className="font-pixel text-base text-cyan-200 font-bold">+{totalExpEarned} EXP</p>
            </div>
          </div>
        </PixelCard>

        <PixelCard variant="default" className="p-3">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400 fill-amber-400" />
            <div>
              <p className="font-pixel text-[10px] text-amber-300">TOTAL GOLD DIPEROLEH</p>
              <p className="font-pixel text-base text-amber-300 font-bold">+{totalGoldEarned} G</p>
            </div>
          </div>
        </PixelCard>
      </div>

      {/* Search Header */}
      <div className="bg-[#1a1a26] border-4 border-black p-3 shadow-[4px_4px_0px_#000] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-pixel text-xs text-yellow-400">
          <History className="w-4 h-4 text-amber-400" /> ARSIP RIWAYAT QUEST SELESAI
        </div>

        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari di riwayat..."
            className="w-full bg-black border-2 border-slate-700 pl-8 pr-2 py-1 font-retro text-xs text-gray-100 focus:border-yellow-400 focus:outline-none"
          />
        </div>
      </div>

      {/* History Items List */}
      <div className="space-y-3">
        {filteredHistory.length === 0 ? (
          <div className="bg-[#1a1a26] border-4 border-black p-8 text-center space-y-2 shadow-[4px_4px_0px_#000]">
            <div className="flex justify-center text-amber-400">
              <ScrollText className="w-12 h-12" />
            </div>
            <h4 className="font-pixel text-xs text-yellow-400">BELUM ADA RIWAYAT QUEST</h4>
            <p className="font-retro text-xs text-gray-400">
              Selesaikan quest hari ini untuk mengisi catatan petualanganmu!
            </p>
          </div>
        ) : (
          filteredHistory.map((quest) => (
            <div
              key={quest.id}
              className="bg-[#1a2e22] border-4 border-emerald-600/70 p-3 shadow-[4px_4px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <PixelBadge type="questType" value={quest.type} />
                  <PixelBadge type="category" value={quest.category} />
                  <span className="font-pixel text-[9px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> SELESAI
                  </span>
                </div>
                <h4 className="font-pixel text-xs text-yellow-300 line-through">
                  {quest.title}
                </h4>
                {quest.completedAt && (
                  <span className="font-mono text-[10px] text-emerald-300/80 block">
                    Diselesaikan pada: {formatDateDisplay(quest.completedAt.split('T')[0])} ({new Date(quest.completedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})
                  </span>
                )}
              </div>

              <div className="font-pixel text-xs text-amber-300 bg-black/60 px-3 py-1.5 border-2 border-emerald-700/60 shrink-0 inline-flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-amber-400" /> +{quest.expReward} EXP • +{quest.goldReward} GOLD
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
