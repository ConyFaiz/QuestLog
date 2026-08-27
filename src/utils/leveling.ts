export const STANDARD_QUEST_EXP = 25;
export const STANDARD_QUEST_GOLD = 35;

/**
 * Calculates EXP required for leveling up.
 * Scales steeply to make higher levels challenging and rewarding.
 */
export const getExpForLevel = (level: number): number => {
  if (level <= 1) return 100;
  return Math.floor(100 * level + Math.pow(level - 1, 2.1) * 60);
};

export const calculateFinalRewards = (
  streakDays: number,
  activeExpBuffMultiplier: number = 1.0
): { exp: number; gold: number; isComboActive: boolean } => {
  const isComboActive = streakDays >= 3;
  const comboMultiplier = isComboActive ? 1.5 : 1.0;

  const finalExp = Math.floor(STANDARD_QUEST_EXP * comboMultiplier * activeExpBuffMultiplier);
  const finalGold = Math.floor(STANDARD_QUEST_GOLD * comboMultiplier);

  return { exp: finalExp, gold: finalGold, isComboActive };
};

export const checkOverdueHpPenalty = (dueDateStr?: string): boolean => {
  if (!dueDateStr) return false;
  const todayStr = new Date().toISOString().split('T')[0];
  return dueDateStr < todayStr;
};

export const getHeroTitle = (level: number): string => {
  if (level < 2) return 'Novice Adventurer';
  if (level < 4) return 'Apprentice Warrior';
  if (level < 7) return 'Dungeon Knight';
  if (level < 10) return 'Pixel Paladin';
  if (level < 15) return 'Shadow Blade Master';
  if (level < 20) return 'Grand Guildmaster';
  if (level < 30) return 'Mythic Dragon Slayer';
  return 'Legendary Immortal Hero';
};
