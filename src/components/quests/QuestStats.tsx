import React from 'react';
import { useQuestStore } from '../../store/useQuestStore';
import { RetroModal } from '../common/RetroModal';
import { Scroll } from 'lucide-react';

export const QuestStats: React.FC = () => {
  const { isHistoryOpen, setIsHistoryOpen, history } = useQuestStore();

  return (
    <RetroModal
      isOpen={isHistoryOpen}
      onClose={() => setIsHistoryOpen(false)}
      title="CATATAN PETUALANGAN (ADVENTURE LOG)"
      maxWidth="max-w-md"
    >
      <div className="space-y-3 font-retro text-xs">
        <div className="flex items-center gap-2 font-pixel text-[11px] text-yellow-300 bg-slate-900 border-2 border-slate-700 p-2">
          <Scroll className="w-4 h-4 text-amber-400" />
          <span>Riwayat Aktivitas & Pencapaian Quest</span>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-6 text-gray-400 font-pixel text-xs border-2 border-dashed border-slate-700 p-4">
            Belum ada catatan aktivitas petualangan. Selesaikan Quest pertamamu!
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {history.map((log) => {
              const isCompleted = log.type === 'COMPLETED';
              const isPurchased = log.type === 'ITEM_PURCHASED';
              const isFailed = log.type === 'FAILED';

              const logBorder = isCompleted
                ? 'border-emerald-600/70 bg-emerald-950/30 text-emerald-200'
                : isPurchased
                ? 'border-amber-600/70 bg-amber-950/30 text-amber-200'
                : isFailed
                ? 'border-red-600/70 bg-red-950/30 text-red-200'
                : 'border-slate-700 bg-slate-900 text-gray-300';

              return (
                <div key={log.id || log.timestamp} className={`p-2 border-2 ${logBorder} font-retro flex justify-between items-center text-xs`}>
                  <div className="space-y-0.5">
                    <p className="font-pixel text-[10px]">{log.title}</p>
                    <span className="text-[10px] text-gray-400 block font-mono">
                      {new Date(log.timestamp).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="font-pixel text-[10px] text-right shrink-0">
                    {log.expChange > 0 && <span className="text-cyan-400 block">+{log.expChange} EXP</span>}
                    {log.goldChange > 0 && <span className="text-amber-400 block">+{log.goldChange} G</span>}
                    {log.goldChange < 0 && <span className="text-amber-500 block">{log.goldChange} G</span>}
                    {log.hpChange < 0 && <span className="text-red-400 block">{log.hpChange} HP</span>}
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
