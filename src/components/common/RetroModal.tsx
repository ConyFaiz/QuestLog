import React from 'react';
import { X, Shield } from 'lucide-react';
import { PixelButton } from './PixelButton';
import { useQuestStore } from '../../store/useQuestStore';

interface RetroModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const RetroModal: React.FC<RetroModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
}) => {
  const theme = useQuestStore((state) => state.theme);
  const isLight = theme === 'SAKURA_PEARL' || theme === 'GOLDEN_VANILLA';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div className={`w-full ${maxWidth} ${isLight ? 'bg-white text-slate-900 border-slate-900 shadow-[8px_8px_0px_#334155]' : 'bg-[#181926] text-gray-100 border-black shadow-[8px_8px_0px_#000]'} border-4 relative animate-in fade-in zoom-in-95 duration-100 overflow-hidden`}>
        {/* Header Bar */}
        <div className={`${isLight ? 'bg-slate-200 border-slate-900 text-slate-900' : 'bg-[#222336] border-black text-gray-100'} border-b-4 px-3 sm:px-4 py-2.5 sm:py-3 flex justify-between items-center`}>
          <h2 className={`font-gaming text-sm sm:text-base uppercase tracking-wider font-bold flex items-center gap-2 ${isLight ? 'text-amber-700 font-bold' : 'text-yellow-400'}`}>
            <Shield className="w-4 h-4 text-amber-400" /> {title}
          </h2>
          <PixelButton variant="danger" size="sm" onClick={onClose} aria-label="Close">
            <X className="w-4 h-4" />
          </PixelButton>
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-4 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
