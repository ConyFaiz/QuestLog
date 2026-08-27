import React from 'react';
import { playSound } from '../../utils/audio';
import { useQuestStore } from '../../store/useQuestStore';

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'gold' | 'danger' | 'success' | 'secondary' | 'dark' | 'sakura';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const PixelButton: React.FC<PixelButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  onClick,
  disabled,
  ...props
}) => {
  const { soundEnabled, theme } = useQuestStore();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      playSound('click', soundEnabled);
      if (onClick) onClick(e);
    }
  };

  const baseStyles = "font-gaming inline-flex items-center justify-center tracking-wider font-bold transition-all duration-100 border-2 border-black text-center active:scale-[0.97] active:translate-y-[1px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-sm";

  const isLightSakura = theme === 'SAKURA_PEARL';
  const isLightVanilla = theme === 'GOLDEN_VANILLA';

  const variants = {
    primary: isLightSakura
      ? "bg-pink-600 hover:bg-pink-500 text-white shadow-[2.5px_2.5px_0px_#831843] border-black"
      : isLightVanilla
      ? "bg-amber-600 hover:bg-amber-500 text-white shadow-[2.5px_2.5px_0px_#78350f] border-black"
      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[2.5px_2.5px_0px_#000] border-black",

    gold: isLightSakura
      ? "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-[2.5px_2.5px_0px_#831843] border-black font-bold"
      : isLightVanilla
      ? "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-[2.5px_2.5px_0px_#78350f] border-black font-bold"
      : "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-[2.5px_2.5px_0px_#000] border-black font-bold",

    sakura: "bg-pink-500 hover:bg-pink-400 text-white shadow-[2.5px_2.5px_0px_#831843] border-black font-bold",

    danger: "bg-red-600 hover:bg-red-500 text-white shadow-[2.5px_2.5px_0px_#450a0a] border-black",
    success: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[2.5px_2.5px_0px_#064e3b] border-black",
    
    secondary: isLightSakura
      ? "bg-pink-200 hover:bg-pink-100 text-pink-950 shadow-[2.5px_2.5px_0px_#831843] border-black font-bold"
      : isLightVanilla
      ? "bg-amber-200 hover:bg-amber-100 text-amber-950 shadow-[2.5px_2.5px_0px_#78350f] border-black font-bold"
      : "bg-slate-800 hover:bg-slate-700 text-slate-100 shadow-[2.5px_2.5px_0px_#000] border-black",

    dark: "bg-zinc-900 hover:bg-zinc-800 text-yellow-400 shadow-[2.5px_2.5px_0px_#000] border-yellow-500",
  };

  const sizes = {
    sm: "px-2.5 py-1 text-[11px] sm:text-xs min-h-[30px] shadow-[2px_2px_0px_#000]",
    md: "px-3.5 py-1.5 text-xs sm:text-sm min-h-[36px]",
    lg: "px-5 py-2.5 text-sm sm:text-base font-bold min-h-[42px]",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
