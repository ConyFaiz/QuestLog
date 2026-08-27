import React, { useMemo } from 'react';
import { useQuestStore } from '../../store/useQuestStore';
import type { AppTheme } from '../../types/questlog';

interface Particle {
  id: number;
  left: number; // percentage 0 - 100
  size: number; // px
  duration: number; // seconds
  delay: number; // seconds
  opacity: number;
  rotation: number;
}

export const ThemeParticlesOverlay: React.FC = () => {
  const theme = useQuestStore((state) => state.theme);

  // Generate deterministic randomized particle properties
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: Math.floor((i * 100) / 18 + (i % 3) * 2),
      size: Math.floor(8 + (i % 5) * 3),
      duration: Math.floor(6 + (i % 6) * 2),
      delay: Math.floor((i % 5) * 1.5),
      opacity: 0.35 + (i % 4) * 0.1,
      rotation: Math.floor((i % 8) * 45),
    }));
  }, []);

  const renderParticleElement = (t: AppTheme, size: number) => {
    switch (t) {
      case 'SAKURA_PEARL':
        // Soft pink petal SVG shape
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="#f472b6" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C12 2 16 7 16 12C16 17 12 22 12 22C12 22 8 17 8 12C8 7 12 2 12 2Z" fill="#f472b6" fillOpacity="0.85" />
          </svg>
        );
      case 'GOLDEN_VANILLA':
        // Gold diamond spark SVG shape
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="#fbbf24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0L15 9L24 12L15 15L12 24L9 15L0 12L9 9L12 0Z" fill="#fbbf24" fillOpacity="0.9" />
          </svg>
        );
      case 'OBSIDIAN_VIOLET':
        // Mana orb SVG shape
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="#c084fc" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" fill="#c084fc" fillOpacity="0.75" />
            <circle cx="12" cy="12" r="4" fill="#e9d5ff" fillOpacity="0.9" />
          </svg>
        );
      case 'DARK_DUNGEON':
      default:
        // Crimson ember spark SVG shape
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="#ef4444" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#ef4444" fillOpacity="0.85" />
          </svg>
        );
    }
  };

  const getAnimationClass = (t: AppTheme) => {
    switch (t) {
      case 'SAKURA_PEARL':
        return 'animate-fall-sakura';
      case 'GOLDEN_VANILLA':
        return 'animate-fall-gold';
      case 'OBSIDIAN_VIOLET':
        return 'animate-float-violet';
      case 'DARK_DUNGEON':
      default:
        return 'animate-fall-ember';
    }
  };

  const animationClass = getAnimationClass(theme);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute ${animationClass} transition-opacity duration-500`}
          style={{
            left: `${p.left}%`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        >
          {renderParticleElement(theme, p.size)}
        </div>
      ))}
    </div>
  );
};
