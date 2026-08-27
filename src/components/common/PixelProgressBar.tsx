import React from 'react';

interface PixelProgressBarProps {
  current: number;
  max: number;
  label?: string;
  variant?: 'hp' | 'exp' | 'gold';
  showValues?: boolean;
}

export const PixelProgressBar: React.FC<PixelProgressBarProps> = ({
  current,
  max,
  label,
  variant = 'hp',
  showValues = true,
}) => {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));

  const barStyles = {
    hp: {
      fill: 'bg-red-600 border-r-2 border-red-800',
      bg: 'bg-red-950/70',
      text: 'text-red-400',
      border: 'border-red-800',
    },
    exp: {
      fill: 'bg-cyan-500 border-r-2 border-cyan-700',
      bg: 'bg-cyan-950/70',
      text: 'text-cyan-400',
      border: 'border-cyan-800',
    },
    gold: {
      fill: 'bg-amber-400 border-r-2 border-amber-600',
      bg: 'bg-amber-950/70',
      text: 'text-amber-400',
      border: 'border-amber-800',
    },
  };

  const style = barStyles[variant];

  return (
    <div className="w-full font-gaming text-xs">
      {(label || showValues) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className={`${style.text} tracking-wider font-bold text-[11px] sm:text-xs`}>{label}</span>}
          {showValues && (
            <span className="text-gray-300 font-sans text-xs font-semibold">
              {current} / {max} ({Math.round(percentage)}%)
            </span>
          )}
        </div>
      )}

      {/* Segmented Pixel Bar Outer Frame */}
      <div className={`w-full h-5 p-0.5 bg-black border-2 ${style.border} shadow-[2px_2px_0px_#000] relative overflow-hidden`}>
        {/* Fill Container */}
        <div
          className={`h-full ${style.fill} transition-all duration-300 relative`}
          style={{ width: `${percentage}%` }}
        >
          {/* Segment Lines Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_75%,rgba(0,0,0,0.4)_75%)] bg-[length:12px_100%]" />
        </div>
      </div>
    </div>
  );
};
