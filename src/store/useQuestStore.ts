import { create } from 'zustand';
import { db, seedInitialData, resetFullDatabase, getDefaultHeroStats, getDemoQuests } from '../db/database';
import type { Quest, HeroStats, InventoryItem, QuestLogHistory, ShopItem, AppTheme } from '../types/questlog';
import { validateLicenseKey, isDemoLicenseKey } from '../config/licenses';
import { calculateFinalRewards, getExpForLevel, getHeroTitle } from '../utils/leveling';
import { getTodayString, daysBetween } from '../utils/dateUtils';
import { playSound } from '../utils/audio';
import {
  fetchCloudUserData,
  syncHeroStatsToCloud,
  syncAddQuestToCloud,
  syncUpdateQuestToCloud,
  syncDeleteQuestFromCloud,
  syncInventoryItemToCloud,
  syncAddHistoryToCloud,
  syncResetAllInCloud,
  syncMigrateLocalToCloud,
} from '../services/syncService';

interface QuestStore {
  hero: HeroStats | null;
  quests: Quest[];
  inventory: InventoryItem[];
  history: QuestLogHistory[];
  
  // License & System state
  isUnlocked: boolean;
  isDemoMode: boolean;
  licenseKey: string | null;
  googleUser: any | null;
  soundEnabled: boolean;
  crtOverlay: boolean;
  theme: AppTheme;
  isLoading: boolean;
  isSyncing: boolean;
  lastLevelUpInfo: { oldLevel: number; newLevel: number } | null;

  // Modals state
  isAddQuestOpen: boolean;
  isShopOpen: boolean;
  isInventoryOpen: boolean;
  isSettingsOpen: boolean;
  isUpgradeModalOpen: boolean;
  isHistoryOpen: boolean;
  editingQuest: Quest | null;

  // Actions
  initializeStore: () => Promise<void>;
  setGoogleUser: (user: any, profile?: any) => Promise<void>;
  setDemoMode: (isDemo: boolean) => void;
  logoutGoogle: () => Promise<void>;
  unlockApp: (key: string) => Promise<{ success: boolean; message: string }>;
  upgradeLicense: (key: string) => Promise<{ success: boolean; message: string }>;
  lockApp: () => Promise<void>;
  
  // Quest Actions
  addQuest: (quest: Omit<Quest, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateQuest: (id: number, updates: Partial<Quest>) => Promise<void>;
  deleteQuest: (id: number) => Promise<void>;
  completeQuest: (id: number) => Promise<void>;
  failQuest: (id: number) => Promise<void>;

  // Shop & Inventory Actions
  buyShopItem: (item: ShopItem) => Promise<{ success: boolean; message: string }>;
  useInventoryItem: (itemId: string) => Promise<{ success: boolean; message: string }>;

  // Settings & Controls
  toggleTheme: () => Promise<void>;
  setTheme: (newTheme: AppTheme) => Promise<void>;
  toggleSound: () => void;
  toggleCRT: () => void;
  setHeroName: (name: string) => Promise<void>;
  setHeroAvatar: (avatarUrl: string) => Promise<void>;
  clearLastLevelUpInfo: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonString: string) => Promise<boolean>;
  resetAllData: () => Promise<void>;
  resetDemoQuests: () => Promise<void>;

  // Modal setters
  setIsAddQuestOpen: (open: boolean, quest?: Quest | null) => void;
  setIsShopOpen: (open: boolean) => void;
  setIsInventoryOpen: (open: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setIsUpgradeModalOpen: (open: boolean) => void;
  setIsHistoryOpen: (open: boolean) => void;
}

const LICENSE_STORAGE_KEY = 'questlog_license_key';
const SOUND_STORAGE_KEY = 'questlog_sound_enabled';
const CRT_STORAGE_KEY = 'questlog_crt_overlay';

export const useQuestStore = create<QuestStore>((set, get) => ({
  hero: null,
  quests: [],
  inventory: [],
  history: [],
  
  isUnlocked: false,
  isDemoMode: false,
  licenseKey: null,
  googleUser: null,
  soundEnabled: localStorage.getItem(SOUND_STORAGE_KEY) !== 'false',
  crtOverlay: localStorage.getItem(CRT_STORAGE_KEY) === 'true',
  theme: 'DARK_DUNGEON',
  isLoading: true,
  isSyncing: false,
  lastLevelUpInfo: null,

  isAddQuestOpen: false,
  isShopOpen: false,
  isInventoryOpen: false,
  isSettingsOpen: false,
  isUpgradeModalOpen: false,
  isHistoryOpen: false,
  editingQuest: null,

  initializeStore: async () => {
    set({ isLoading: true });
    try {
      await seedInitialData();

      // Check Saved License or Auth
      const savedKey = localStorage.getItem(LICENSE_STORAGE_KEY);
      if (savedKey && validateLicenseKey(savedKey)) {
        set({
          isUnlocked: true,
          isDemoMode: isDemoLicenseKey(savedKey),
          licenseKey: savedKey,
        });
      }

      // Fetch Hero Stats
      const heroes = await db.heroStats.toArray();
      let hero = heroes[0] || null;

      // Fetch Quests
      const rawQuests = await db.quests.toArray();
      const inventory = await db.inventory.toArray();
      const history = await db.history.orderBy('timestamp').reverse().limit(50).toArray();

      const today = getTodayString();

      // Reset DAILY quests completed on previous days back to ACTIVE for today
      const quests = [...rawQuests];
      for (let i = 0; i < quests.length; i++) {
        const q = quests[i];
        if (q.type === 'DAILY' && q.status === 'COMPLETED' && q.completedAt) {
          const completedDateStr = q.completedAt.split('T')[0];
          if (completedDateStr < today) {
            q.status = 'ACTIVE';
            if (q.id) {
              await db.quests.update(q.id, { status: 'ACTIVE' });
            }
          }
        }
      }

      if (hero) {
        // Auto-check streak break / freeze status upon new day login
        if (hero.lastCompletedDate) {
          const diffDays = daysBetween(hero.lastCompletedDate, today);
          if (diffDays > 1) {
            if (hero.isStreakFrozen) {
              hero.isStreakFrozen = false;
              hero.lastCompletedDate = today;
              await db.heroStats.update(hero.id!, {
                isStreakFrozen: false,
                lastCompletedDate: today,
              });
              await db.history.add({
                title: 'Tenda Kemah Digunakan',
                type: 'ITEM_USED',
                expChange: 0,
                goldChange: 0,
                hpChange: 0,
                timestamp: new Date().toISOString(),
              });
            } else {
              hero.streakDays = 1;
              await db.heroStats.update(hero.id!, { streakDays: 1 });
            }
          }
        }

        // Auto-check overdue daily quests and apply HP penalty
        let hpLossTotal = 0;

        for (let i = 0; i < quests.length; i++) {
          const q = quests[i];
          if (q.status === 'ACTIVE' && q.type === 'DAILY' && q.dueDate && q.dueDate < today) {
            q.status = 'OVERDUE';
            hpLossTotal += 10;
            if (q.id) {
              await db.quests.update(q.id, { status: 'OVERDUE' });
            }
          }
        }

        if (hpLossTotal > 0) {
          let newHp = Math.max(0, hero.hp - hpLossTotal);
          let newLevel = hero.level;
          if (newHp === 0 && hero.level > 1) {
            newLevel = Math.max(1, hero.level - 1);
            newHp = 100;
            await db.history.add({
              title: `Level Turun ke Level ${newLevel} akibat HP Habis!`,
              type: 'HP_LOST',
              expChange: 0,
              goldChange: 0,
              hpChange: -hpLossTotal,
              timestamp: new Date().toISOString(),
            });
          }

          hero.hp = newHp;
          hero.level = newLevel;
          hero.title = getHeroTitle(newLevel);
          await db.heroStats.update(hero.id!, {
            hp: newHp,
            level: newLevel,
            title: hero.title,
          });
        }
      }

      set({
        hero,
        quests,
        inventory,
        history,
        theme: hero?.theme || 'DARK_DUNGEON',
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to initialize QuestStore:', error);
      set({ isLoading: false });
    }
  },

  setGoogleUser: async (user: any, profile?: any) => {
    if (!user) return;
    set({ isLoading: true });
    try {
      const today = getTodayString();
      const heroName =
        profile?.username ||
        user.user_metadata?.username ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'Pahlawan_QuestLog';
      const avatarUrl =
        profile?.avatar_url ||
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        'shield';

      // 1. Ambil data yang tersimpan di Supabase Cloud untuk user ini
      const cloudData = await fetchCloudUserData(user.id);

      if (cloudData && cloudData.hero && cloudData.quests.length > 0) {
        // User telah memiliki progres di Cloud: Sinkronkan ke local cache Dexie
        await db.quests.clear();
        await db.heroStats.clear();
        await db.inventory.clear();
        await db.history.clear();

        const heroWithAuthName: HeroStats = {
          ...cloudData.hero,
          name: cloudData.hero.name || heroName,
          avatarUrl: cloudData.hero.avatarUrl || avatarUrl,
        };

        const heroId = await db.heroStats.add(heroWithAuthName);
        heroWithAuthName.id = heroId;

        if (cloudData.quests.length > 0) await db.quests.bulkAdd(cloudData.quests);
        if (cloudData.inventory.length > 0) await db.inventory.bulkAdd(cloudData.inventory);
        if (cloudData.history.length > 0) await db.history.bulkAdd(cloudData.history);

        set({
          isUnlocked: true,
          isDemoMode: false,
          googleUser: user,
          hero: heroWithAuthName,
          quests: cloudData.quests,
          inventory: cloudData.inventory,
          history: cloudData.history,
          theme: heroWithAuthName.theme || 'DARK_DUNGEON',
          isLoading: false,
        });
      } else {
        // User baru di Cloud: Ambil progres lokal saat ini dan migrasikan ke akun Supabase Google
        const currentHero = (await db.heroStats.toArray())[0];
        const currentQuests = await db.quests.toArray();
        const currentInv = await db.inventory.toArray();
        const currentHist = await db.history.toArray();

        const starterHero: HeroStats = currentHero
          ? {
              ...currentHero,
              name: heroName,
              avatarUrl: avatarUrl || currentHero.avatarUrl,
            }
          : {
              ...(getDefaultHeroStats(today) as HeroStats),
              name: heroName,
              avatarUrl: avatarUrl,
            };

        const starterQuests = currentQuests.length > 0 ? currentQuests : (getDemoQuests(today) as Quest[]);

        if (currentHero?.id) {
          await db.heroStats.update(currentHero.id, starterHero);
        } else {
          const heroId = await db.heroStats.add(starterHero);
          starterHero.id = heroId;
        }

        // Upload ke Supabase Cloud
        await syncMigrateLocalToCloud(user.id, starterHero, starterQuests, currentInv, currentHist);

        set({
          isUnlocked: true,
          isDemoMode: false,
          googleUser: user,
          hero: starterHero,
          quests: starterQuests,
          inventory: currentInv,
          history: currentHist,
          theme: starterHero.theme || 'DARK_DUNGEON',
          isLoading: false,
        });
      }
    } catch (err) {
      console.error('Error in setGoogleUser sync:', err);
      set({ isLoading: false });
    }
  },

  setDemoMode: (isDemo: boolean) => {
    set({
      isUnlocked: true,
      isDemoMode: isDemo,
    });
  },

  logoutGoogle: async () => {
    const { logoutUser } = await import('../services/authService');
    await logoutUser();
    localStorage.removeItem(LICENSE_STORAGE_KEY);
    const { hero, quests } = await resetFullDatabase();
    set({
      isUnlocked: false,
      isDemoMode: false,
      googleUser: null,
      licenseKey: null,
      hero,
      quests,
      inventory: [],
      history: [],
      theme: 'DARK_DUNGEON',
    });
  },

  unlockApp: async (key: string) => {
    if (validateLicenseKey(key)) {
      const cleanKey = key.trim().toUpperCase();
      const isDemo = isDemoLicenseKey(cleanKey);
      localStorage.setItem(LICENSE_STORAGE_KEY, cleanKey);
      set({
        isUnlocked: true,
        isDemoMode: isDemo,
        licenseKey: cleanKey,
      });
      return { success: true, message: isDemo ? 'Lisensi Demo Aktif!' : 'Kunci Lisensi Penuh Berhasil Diaktifkan!' };
    }
    return { success: false, message: 'Kunci Lisensi Tidak Valid! Gunakan kunci demo QLG-DEMO-TEST-2026' };
  },

  upgradeLicense: async (key: string) => {
    if (validateLicenseKey(key) && !isDemoLicenseKey(key)) {
      const cleanKey = key.trim().toUpperCase();
      localStorage.setItem(LICENSE_STORAGE_KEY, cleanKey);
      set({
        isDemoMode: false,
        licenseKey: cleanKey,
        isUpgradeModalOpen: false,
      });
      return { success: true, message: 'Selamat! Akun QuestLog Anda kini Penuh & Permanen!' };
    }
    return { success: false, message: 'Kunci Lisensi Resmi Tidak Valid!' };
  },

  lockApp: async () => {
    localStorage.removeItem(LICENSE_STORAGE_KEY);
    set({
      isUnlocked: false,
      isDemoMode: false,
      googleUser: null,
      licenseKey: null,
    });
  },

  addQuest: async (questData) => {
    const { googleUser, soundEnabled } = get();
    const today = getTodayString();
    const newQuest: Omit<Quest, 'id'> = {
      ...questData,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      dueDate: questData.dueDate || (questData.type === 'DAILY' ? today : undefined),
    };

    const id = await db.quests.add(newQuest as Quest);
    const addedQuest = { ...newQuest, id } as Quest;

    set((state) => ({
      quests: [addedQuest, ...state.quests],
      isAddQuestOpen: false,
      editingQuest: null,
    }));
    playSound('click', soundEnabled);

    // Sync to Cloud jika user login dengan Google
    if (googleUser?.id) {
      syncAddQuestToCloud(googleUser.id, newQuest).catch(console.error);
    }
  },

  updateQuest: async (id, updates) => {
    const { googleUser, soundEnabled } = get();
    await db.quests.update(id, updates);
    set((state) => ({
      quests: state.quests.map((q) => (q.id === id ? { ...q, ...updates } : q)),
      isAddQuestOpen: false,
      editingQuest: null,
    }));
    playSound('click', soundEnabled);

    // Sync to Cloud jika user login dengan Google
    if (googleUser?.id) {
      syncUpdateQuestToCloud(googleUser.id, id, updates).catch(console.error);
    }
  },

  deleteQuest: async (id) => {
    const { googleUser, soundEnabled } = get();
    await db.quests.delete(id);
    set((state) => ({
      quests: state.quests.filter((q) => q.id !== id),
    }));
    playSound('click', soundEnabled);

    // Sync to Cloud jika user login dengan Google
    if (googleUser?.id) {
      syncDeleteQuestFromCloud(googleUser.id, id).catch(console.error);
    }
  },

  completeQuest: async (id) => {
    const { hero, quests, soundEnabled, googleUser } = get();
    if (!hero) return;

    const quest = quests.find((q) => q.id === id);
    if (!quest) return;

    const today = getTodayString();

    // Prevent double completing DAILY quests completed today
    if (quest.type === 'DAILY' && quest.status === 'COMPLETED' && quest.completedAt?.startsWith(today)) {
      return;
    }
    if (quest.type === 'EVENT' && quest.status === 'COMPLETED') return;

    // Calculate EXP & Gold Rewards
    const rewards = calculateFinalRewards(hero.streakDays, hero.activeExpMultiplier);
    
    let newExp = hero.exp + rewards.exp;
    let newGold = hero.gold + rewards.gold;
    let newLevel = hero.level;
    let expNeeded = getExpForLevel(newLevel);
    let didLevelUp = false;

    // Check Level Up
    while (newExp >= expNeeded) {
      newExp -= expNeeded;
      newLevel += 1;
      expNeeded = getExpForLevel(newLevel);
      didLevelUp = true;
    }

    // Streak update
    let newStreak = hero.streakDays;
    if (hero.lastCompletedDate) {
      const diffDays = daysBetween(hero.lastCompletedDate, today);
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1 && !hero.isStreakFrozen) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    const updatedHeroTitle = getHeroTitle(newLevel);

    const updatedHero: HeroStats = {
      ...hero,
      exp: newExp,
      gold: newGold,
      level: newLevel,
      title: updatedHeroTitle,
      streakDays: newStreak,
      lastCompletedDate: today,
    };

    const completedAtISO = new Date().toISOString();

    await db.heroStats.update(hero.id!, updatedHero);
    await db.quests.update(id, {
      status: 'COMPLETED',
      completedAt: completedAtISO,
    });

    const historyEntry: QuestLogHistory = {
      questId: id,
      title: `Quest Selesai: ${quest.title}`,
      type: 'COMPLETED',
      expChange: rewards.exp,
      goldChange: rewards.gold,
      hpChange: 0,
      timestamp: completedAtISO,
    };
    await db.history.add(historyEntry);

    // Audio Feedback
    if (didLevelUp) {
      playSound('levelup', soundEnabled);
      set({ lastLevelUpInfo: { oldLevel: hero.level, newLevel } });
    } else {
      playSound('complete', soundEnabled);
      playSound('coin', soundEnabled);
    }

    set((state) => ({
      hero: updatedHero,
      quests: state.quests.map((q) => (q.id === id ? { ...q, status: 'COMPLETED', completedAt: completedAtISO } : q)),
      history: [historyEntry, ...state.history],
    }));

    // Sync to Cloud jika user login dengan Google
    if (googleUser?.id) {
      syncHeroStatsToCloud(googleUser.id, updatedHero).catch(console.error);
      syncUpdateQuestToCloud(googleUser.id, id, {
        status: 'COMPLETED',
        completedAt: completedAtISO,
      }).catch(console.error);
      syncAddHistoryToCloud(googleUser.id, historyEntry).catch(console.error);
    }
  },

  failQuest: async (id) => {
    const { hero, quests, soundEnabled, googleUser } = get();
    if (!hero) return;

    const quest = quests.find((q) => q.id === id);
    if (!quest) return;

    const hpLoss = 10;
    let newHp = Math.max(0, hero.hp - hpLoss);
    let newLevel = hero.level;

    if (newHp === 0 && hero.level > 1) {
      newLevel = Math.max(1, hero.level - 1);
      newHp = 100;
    }

    const updatedHero: HeroStats = {
      ...hero,
      hp: newHp,
      level: newLevel,
      title: getHeroTitle(newLevel),
    };

    await db.heroStats.update(hero.id!, updatedHero);
    await db.quests.update(id, { status: 'FAILED' });

    const historyEntry: QuestLogHistory = {
      questId: id,
      title: `Quest Gagal: ${quest.title}`,
      type: 'FAILED',
      expChange: 0,
      goldChange: 0,
      hpChange: -hpLoss,
      timestamp: new Date().toISOString(),
    };
    await db.history.add(historyEntry);

    playSound('damage', soundEnabled);

    set((state) => ({
      hero: updatedHero,
      quests: state.quests.map((q) => (q.id === id ? { ...q, status: 'FAILED' } : q)),
      history: [historyEntry, ...state.history],
    }));

    // Sync to Cloud jika user login dengan Google
    if (googleUser?.id) {
      syncHeroStatsToCloud(googleUser.id, updatedHero).catch(console.error);
      syncUpdateQuestToCloud(googleUser.id, id, { status: 'FAILED' }).catch(console.error);
      syncAddHistoryToCloud(googleUser.id, historyEntry).catch(console.error);
    }
  },

  buyShopItem: async (item: ShopItem) => {
    const { hero, soundEnabled, googleUser } = get();
    if (!hero) return { success: false, message: 'Hero belum dimuat!' };

    if (hero.gold < item.price) {
      return { success: false, message: `Gold kamu tidak cukup! Butuh ${item.price} Gold.` };
    }

    const newGold = hero.gold - item.price;
    let updatedHero = { ...hero, gold: newGold };
    let message = `Berhasil membeli ${item.name}!`;

    if (item.effectType === 'HEAL_HP') {
      const healAmount = Number(item.effectValue) || 20;
      updatedHero.hp = Math.min(updatedHero.maxHp, updatedHero.hp + healAmount);
      message = `Berhasil memakai ${item.name}! HP bertambah +${healAmount}.`;
      playSound('heal', soundEnabled);
    } else if (item.effectType === 'FREEZE_STREAK') {
      updatedHero.isStreakFrozen = true;
      message = `${item.name} Aktif! Streak kamu terlindungi untuk 1 hari libur.`;
      playSound('buy', soundEnabled);
    } else if (item.effectType === 'THEME_DARK') {
      updatedHero.theme = 'DARK_DUNGEON';
      message = 'Tema Dark Dungeon Berhasil Diaktifkan!';
      playSound('buy', soundEnabled);
    } else {
      const existingInv = await db.inventory.where('itemId').equals(item.id).first();
      if (existingInv) {
        await db.inventory.update(existingInv.id!, { quantity: existingInv.quantity + 1 });
      } else {
        await db.inventory.add({
          itemId: item.id,
          quantity: 1,
          acquiredAt: new Date().toISOString(),
        });
      }
      playSound('buy', soundEnabled);
    }

    await db.heroStats.update(hero.id!, updatedHero);

    const historyEntry: QuestLogHistory = {
      title: `Membeli ${item.name}`,
      type: 'ITEM_PURCHASED',
      expChange: 0,
      goldChange: -item.price,
      hpChange: item.effectType === 'HEAL_HP' ? 20 : 0,
      timestamp: new Date().toISOString(),
    };
    await db.history.add(historyEntry);

    const newInventory = await db.inventory.toArray();

    set((state) => ({
      hero: updatedHero,
      inventory: newInventory,
      history: [historyEntry, ...state.history],
      theme: updatedHero.theme,
    }));

    // Sync to Cloud jika user login dengan Google
    if (googleUser?.id) {
      syncHeroStatsToCloud(googleUser.id, updatedHero).catch(console.error);
      syncAddHistoryToCloud(googleUser.id, historyEntry).catch(console.error);
      const currentItemQty = newInventory.find((i) => i.itemId === item.id)?.quantity || 1;
      syncInventoryItemToCloud(googleUser.id, item.id, currentItemQty).catch(console.error);
    }

    return { success: true, message };
  },

  useInventoryItem: async (itemId: string) => {
    const { hero, soundEnabled, googleUser } = get();
    if (!hero) return { success: false, message: 'Hero not found' };

    const invItem = await db.inventory.where('itemId').equals(itemId).first();
    if (!invItem || invItem.quantity <= 0) {
      return { success: false, message: 'Item tidak tersedia di ransel.' };
    }

    let updatedHero = { ...hero };
    let message = 'Item digunakan!';

    if (itemId === 'potion_red') {
      updatedHero.hp = Math.min(updatedHero.maxHp, updatedHero.hp + 20);
      message = 'Potion Merah diminum! HP +20.';
      playSound('heal', soundEnabled);
    } else if (itemId === 'tent_freeze') {
      updatedHero.isStreakFrozen = true;
      message = 'Tenda Kemah dipasang! Streak aman besok.';
      playSound('buy', soundEnabled);
    }

    let remainingQuantity = invItem.quantity - 1;
    if (invItem.quantity > 1) {
      await db.inventory.update(invItem.id!, { quantity: remainingQuantity });
    } else {
      await db.inventory.delete(invItem.id!);
      remainingQuantity = 0;
    }

    await db.heroStats.update(hero.id!, updatedHero);
    const newInventory = await db.inventory.toArray();

    set({ hero: updatedHero, inventory: newInventory });

    // Sync to Cloud jika user login dengan Google
    if (googleUser?.id) {
      syncHeroStatsToCloud(googleUser.id, updatedHero).catch(console.error);
      syncInventoryItemToCloud(googleUser.id, itemId, remainingQuantity).catch(console.error);
    }

    return { success: true, message };
  },

  toggleTheme: async () => {
    const { hero, googleUser } = get();
    if (!hero) return;
    const themeCycle: AppTheme[] = ['SAKURA_PEARL', 'GOLDEN_VANILLA', 'OBSIDIAN_VIOLET', 'DARK_DUNGEON'];
    const currentIndex = themeCycle.indexOf(hero.theme);
    const nextTheme = themeCycle[(currentIndex + 1) % themeCycle.length];
    const updatedHero = { ...hero, theme: nextTheme };
    await db.heroStats.update(hero.id!, { theme: nextTheme });
    set((state) => ({
      hero: state.hero ? updatedHero : null,
      theme: nextTheme,
    }));
    if (googleUser?.id) {
      syncHeroStatsToCloud(googleUser.id, updatedHero).catch(console.error);
    }
  },

  setTheme: async (newTheme: AppTheme) => {
    const { hero, googleUser } = get();
    if (!hero) return;
    const updatedHero = { ...hero, theme: newTheme };
    await db.heroStats.update(hero.id!, { theme: newTheme });
    set((state) => ({
      hero: state.hero ? updatedHero : null,
      theme: newTheme,
    }));
    if (googleUser?.id) {
      syncHeroStatsToCloud(googleUser.id, updatedHero).catch(console.error);
    }
  },

  toggleSound: () => {
    const newVal = !get().soundEnabled;
    localStorage.setItem(SOUND_STORAGE_KEY, String(newVal));
    set({ soundEnabled: newVal });
  },

  toggleCRT: () => {
    const newVal = !get().crtOverlay;
    localStorage.setItem(CRT_STORAGE_KEY, String(newVal));
    set({ crtOverlay: newVal });
  },

  setHeroName: async (name: string) => {
    const { hero, googleUser } = get();
    if (!hero) return;
    const updatedHero = { ...hero, name };
    await db.heroStats.update(hero.id!, { name });
    set({ hero: updatedHero });
    if (googleUser?.id) {
      syncHeroStatsToCloud(googleUser.id, updatedHero).catch(console.error);
    }
  },

  setHeroAvatar: async (avatarUrl: string) => {
    const { hero, googleUser } = get();
    if (!hero) return;
    const updatedHero = { ...hero, avatarUrl };
    await db.heroStats.update(hero.id!, { avatarUrl });
    set({ hero: updatedHero });
    if (googleUser?.id) {
      syncHeroStatsToCloud(googleUser.id, updatedHero).catch(console.error);
    }
  },

  clearLastLevelUpInfo: () => set({ lastLevelUpInfo: null }),

  exportDataJSON: () => {
    const { hero, quests, inventory, history } = get();
    return JSON.stringify({ hero, quests, inventory, history, exportDate: new Date().toISOString() }, null, 2);
  },

  importDataJSON: async (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.hero && Array.isArray(parsed.quests)) {
        await db.quests.clear();
        await db.heroStats.clear();
        await db.inventory.clear();
        await db.history.clear();

        await db.heroStats.add(parsed.hero);
        if (parsed.quests.length > 0) await db.quests.bulkAdd(parsed.quests);
        if (parsed.inventory?.length > 0) await db.inventory.bulkAdd(parsed.inventory);
        if (parsed.history?.length > 0) await db.history.bulkAdd(parsed.history);

        await get().initializeStore();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to import JSON data:', e);
      return false;
    }
  },

  resetAllData: async () => {
    const { googleUser, soundEnabled } = get();
    set({ isLoading: true });
    try {
      const today = getTodayString();
      const { hero, quests } = await resetFullDatabase();

      if (googleUser?.id) {
        await syncResetAllInCloud(googleUser.id, hero, getDemoQuests(today));
      }

      set({
        hero,
        quests,
        inventory: [],
        history: [],
        lastLevelUpInfo: null,
        theme: hero.theme || 'DARK_DUNGEON',
        isLoading: false,
      });
      playSound('levelup', soundEnabled);
    } catch (err) {
      console.error('Failed to reset all data:', err);
      set({ isLoading: false });
    }
  },

  resetDemoQuests: async () => {
    const { googleUser, soundEnabled } = get();
    set({ isLoading: true });
    try {
      const today = getTodayString();
      const { hero, quests } = await resetFullDatabase();

      if (googleUser?.id) {
        await syncResetAllInCloud(googleUser.id, hero, getDemoQuests(today));
      }

      set({
        hero,
        quests,
        inventory: [],
        history: [],
        lastLevelUpInfo: null,
        theme: hero.theme || 'DARK_DUNGEON',
        isLoading: false,
      });
      playSound('levelup', soundEnabled);
    } catch (err) {
      console.error('Failed to reset demo quests:', err);
      set({ isLoading: false });
    }
  },

  setIsAddQuestOpen: (open, quest = null) => set({ isAddQuestOpen: open, editingQuest: quest }),
  setIsShopOpen: (open) => set({ isShopOpen: open }),
  setIsInventoryOpen: (open) => set({ isInventoryOpen: open }),
  setIsSettingsOpen: (open) => set({ isSettingsOpen: open }),
  setIsUpgradeModalOpen: (open) => set({ isUpgradeModalOpen: open }),
  setIsHistoryOpen: (open) => set({ isHistoryOpen: open }),
}));
