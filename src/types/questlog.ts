export type QuestType = 'DAILY' | 'EVENT';
export type QuestCategory = 'FITNESS' | 'STUDY' | 'WORK' | 'HEALTH' | 'PERSONAL' | 'GENERAL';
export type QuestStatus = 'ACTIVE' | 'COMPLETED' | 'OVERDUE' | 'FAILED';

export type AppTheme = 'SAKURA_PEARL' | 'GOLDEN_VANILLA' | 'OBSIDIAN_VIOLET' | 'DARK_DUNGEON';

export interface Quest {
  id?: number;
  title: string;
  description?: string;
  type: QuestType; // 'DAILY' or 'EVENT'
  category: QuestCategory;
  expReward: number; // Standardized reward (e.g. 25 EXP)
  goldReward: number; // Standardized reward (e.g. 35 Gold)
  status: QuestStatus;
  dueDate?: string; // YYYY-MM-DD
  createdAt: string; // ISO
  completedAt?: string; // ISO
  streakCount?: number;
}

export interface HeroStats {
  id?: number;
  name: string;
  title: string;
  level: number;
  hp: number;
  maxHp: number;
  exp: number;
  gold: number;
  streakDays: number;
  lastCompletedDate: string | null;
  isStreakFrozen: boolean;
  activeExpMultiplier: number;
  expBuffExpiresAt: string | null;
  theme: AppTheme;
  badge: string;
  avatarUrl?: string | null; // Base64 data URL or emoji preset
}

export type ShopItemCategory = 'CONSUMABLE' | 'BUFF' | 'THEME' | 'TITLE' | 'SFX';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  category: ShopItemCategory;
  effectType?: 'HEAL_HP' | 'FREEZE_STREAK' | 'THEME_DARK' | 'EXP_BOOST' | 'TITLE_UNLOCK';
  effectValue?: number | string;
  purchased?: boolean;
}

export interface InventoryItem {
  id?: number;
  itemId: string;
  quantity: number;
  acquiredAt: string;
}

export interface QuestLogHistory {
  id?: number;
  questId?: number;
  title: string;
  type: 'COMPLETED' | 'FAILED' | 'ITEM_PURCHASED' | 'ITEM_USED' | 'LEVEL_UP' | 'HP_LOST';
  expChange: number;
  goldChange: number;
  hpChange: number;
  timestamp: string;
}
