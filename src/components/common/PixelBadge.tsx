import React from 'react';
import type { QuestType, QuestCategory } from '../../types/questlog';
import { Sun, Target, Folder } from 'lucide-react';

interface PixelBadgeProps {
  type: 'questType' | 'category' | 'status';
  value: QuestType | QuestCategory | string;
}

export const PixelBadge: React.FC<PixelBadgeProps> = ({ type, value }) => {
  if (type === 'questType') {
    const isDaily = value === 'DAILY';
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-gaming font-bold border ${isDaily ? 'bg-amber-950/80 border-amber-500/70 text-amber-300' : 'bg-purple-950/80 border-purple-500/70 text-purple-300'} tracking-wider shadow-[1.5px_1.5px_0px_#000] rounded-xs`}>
        {isDaily ? <Sun className="w-3 h-3 text-amber-400" /> : <Target className="w-3 h-3 text-purple-400" />}
        {isDaily ? 'QUEST HARIAN' : 'EVENT QUEST'}
      </span>
    );
  }

  if (type === 'category') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-gaming font-semibold border bg-slate-900/80 border-slate-700 text-slate-300 tracking-wider shadow-[1.5px_1.5px_0px_#000] rounded-xs">
        <Folder className="w-3 h-3 text-slate-400" /> {value}
      </span>
    );
  }

  return (
    <span className="inline-block px-2 py-0.5 text-[10px] font-gaming font-semibold border bg-zinc-800/80 border-zinc-600 text-zinc-300 shadow-[1.5px_1.5px_0px_#000] rounded-xs">
      {value}
    </span>
  );
};
