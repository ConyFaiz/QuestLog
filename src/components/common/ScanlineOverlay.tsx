import React from 'react';
import { useQuestStore } from '../../store/useQuestStore';

export const ScanlineOverlay: React.FC = () => {
  const crtOverlay = useQuestStore((state) => state.crtOverlay);

  if (!crtOverlay) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 scanlines opacity-60" />
  );
};
