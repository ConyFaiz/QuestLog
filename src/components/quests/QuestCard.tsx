import React from 'react';
import type { Quest } from '../../types/questlog';
import { useQuestStore } from '../../store/useQuestStore';
import { PixelBadge } from '../common/PixelBadge';
import { PixelButton } from '../common/PixelButton';
import { formatDateDisplay, getTodayString } from '../../utils/dateUtils';
import { CheckCircle2, Clock, Trash2, Edit, AlertTriangle, Check, Gift, X } from 'lucide-react';

interface QuestCardProps {
  quest: Quest;
}

export const QuestCard: React.FC<QuestCardProps> = ({ quest }) => {
  const { completeQuest, deleteQuest, setIsAddQuestOpen, hero, theme } = useQuestStore();

  const todayStr = getTodayString();
  const isLight = theme === 'SAKURA_PEARL' || theme === 'GOLDEN_VANILLA';

  const isDaily = quest.type === 'DAILY';
  const isCompletedToday = isDaily && quest.status === 'COMPLETED' && quest.completedAt?.startsWith(todayStr);
  const isCompletedEvent = !isDaily && quest.status === 'COMPLETED';

  const isFailed = quest.status === 'FAILED';
  const isOverdue = quest.status === 'OVERDUE';
  const isComboActive = (hero?.streakDays || 0) >= 3;

  // Desaturated / Grayed-out style for completed DAILY quests today
  const cardBorder = isCompletedToday
    ? 'border-slate-700 bg-slate-900/90 text-gray-400 filter grayscale opacity-75 shadow-[2.5px_2.5px_0px_#000]'
    : isCompletedEvent
    ? isLight
      ? 'border-emerald-600 bg-emerald-50 text-slate-900 shadow-[2.5px_2.5px_0px_#047857]'
      : 'border-emerald-600/70 bg-emerald-950/20 text-gray-100 shadow-[2.5px_2.5px_0px_#000]'
    : isFailed || isOverdue
    ? isLight
      ? 'border-red-600 bg-red-50 text-slate-900 shadow-[2.5px_2.5px_0px_#b91c1c]'
      : 'border-red-600/70 bg-red-950/20 text-gray-100 shadow-[2.5px_2.5px_0px_#000]'
    : isLight
    ? 'border-slate-800 bg-white text-slate-900 shadow-[2.5px_2.5px_0px_#334155] hover:border-amber-500'
    : 'border-[#3b3b54] bg-[#181926] text-gray-100 shadow-[2.5px_2.5px_0px_#000] hover:border-amber-400/80';

  const titleColor = isCompletedToday
    ? 'line-through text-gray-500 font-normal'
    : isCompletedEvent
    ? 'line-through text-gray-500'
    : isLight
    ? 'text-slate-950 font-bold'
    : 'text-yellow-300';

  return (
    <div className={`border-2 sm:border-3 p-3.5 sm:p-4 relative transition-all duration-150 rounded-xs ${cardBorder}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Main Info */}
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <PixelBadge type="questType" value={quest.type} />
            <PixelBadge type="category" value={quest.category} />

            {isCompletedToday && (
              <span className="text-[10px] font-gaming font-semibold px-2 py-0.5 border bg-slate-800 border-slate-600 text-gray-300 flex items-center gap-1 rounded-xs">
                <Check className="w-3 h-3 text-emerald-400" /> SUDAH DIKERJAKAN HARI INI
              </span>
            )}

            {isOverdue && !isCompletedToday && (
              <span className="text-[10px] font-gaming font-bold px-2 py-0.5 border bg-red-900 border-red-500 text-red-200 animate-pulse flex items-center gap-1 rounded-xs">
                <AlertTriangle className="w-3 h-3 text-red-400" /> TERLEWAT (-10 HP)
              </span>
            )}
          </div>

          <h3 className={`font-heading text-base sm:text-lg tracking-wide font-bold leading-snug ${titleColor}`}>
            {quest.title}
          </h3>

          {quest.description && (
            <p className={`font-sans text-xs sm:text-sm ${isCompletedToday ? 'text-gray-500' : isLight ? 'text-slate-600' : 'text-gray-300'} line-clamp-2`}>
              {quest.description}
            </p>
          )}

          <div className={`flex flex-wrap items-center gap-3 text-xs font-sans ${isCompletedToday ? 'text-gray-500' : isLight ? 'text-slate-600' : 'text-gray-400'}`}>
            <span className="flex items-center gap-1 font-gaming text-xs font-semibold">
              <Clock className="w-3.5 h-3.5 text-cyan-500" /> {formatDateDisplay(quest.dueDate)}
            </span>

            <span className={`font-gaming text-xs inline-flex items-center gap-1 font-semibold ${isCompletedToday ? 'text-gray-500' : isLight ? 'text-amber-700 font-bold' : 'text-amber-300'}`}>
              <Gift className="w-3.5 h-3.5 text-amber-400" /> +{quest.expReward} EXP • +{quest.goldReward} GOLD {isComboActive && '(1.5x Combo!)'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 border-t sm:border-t-0 sm:border-l border-slate-700/50 pt-2 sm:pt-0 sm:pl-3">
          {!isCompletedToday && !isCompletedEvent && !isFailed && (
            <PixelButton
              variant="gold"
              size="sm"
              onClick={() => quest.id && completeQuest(quest.id)}
              className="flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> SELESAI
            </PixelButton>
          )}

          {isCompletedToday && (
            <span className="font-gaming text-xs text-gray-400 border border-slate-600 px-2 py-1 bg-slate-800 flex items-center gap-1 rounded-xs font-semibold">
              <Check className="w-3.5 h-3.5 text-emerald-400" /> HARI INI SELESAI
            </span>
          )}

          {isCompletedEvent && (
            <span className="font-gaming text-xs text-emerald-400 border border-emerald-600 px-2 py-1 bg-emerald-950/40 flex items-center gap-1 rounded-xs font-semibold">
              <Check className="w-3.5 h-3.5 text-emerald-400" /> TERSELESAIKAN
            </span>
          )}

          {isFailed && (
            <span className="font-gaming text-xs text-red-400 border border-red-600 px-2 py-1 bg-red-950/40 flex items-center gap-1 rounded-xs font-semibold">
              <X className="w-3.5 h-3.5 text-red-400" /> GAGAL (-10 HP)
            </span>
          )}

          <div className="flex items-center gap-1">
            {!isCompletedToday && !isCompletedEvent && (
              <button
                onClick={() => setIsAddQuestOpen(true, quest)}
                className={`p-2 ${isLight ? 'text-slate-600 hover:text-blue-600 hover:bg-slate-200' : 'text-gray-400 hover:text-cyan-300 hover:bg-slate-800'} border-2 border-transparent transition-colors`}
                title="Edit Quest"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => quest.id && deleteQuest(quest.id)}
              className={`p-2 ${isLight ? 'text-slate-600 hover:text-red-600 hover:bg-slate-200' : 'text-gray-400 hover:text-red-400 hover:bg-slate-800'} border-2 border-transparent transition-colors`}
              title="Hapus Quest"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
