import { supabase, isSupabaseConfigured } from '../supabaseClient';
import type { HeroStats, Quest, InventoryItem, QuestLogHistory, AppTheme } from '../types/questlog';

export interface CloudUserData {
  hero: HeroStats | null;
  quests: Quest[];
  inventory: InventoryItem[];
  history: QuestLogHistory[];
}

/**
 * Mengambil seluruh data Pahlawan, Quest, Ransel, dan Riwayat dari Supabase
 */
export const fetchCloudUserData = async (userId: string): Promise<CloudUserData | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    // 1. Fetch Profile / Hero Stats
    const { data: profileData, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileErr) {
      console.warn('Gagal memuat profile dari Supabase:', profileErr.message);
      return null;
    }

    let hero: HeroStats | null = null;
    if (profileData) {
      hero = {
        id: 1, // local id representation
        name: profileData.username || 'Pahlawan_QuestLog',
        title: profileData.title || 'Novice Adventurer',
        level: profileData.level ?? 1,
        hp: profileData.hp ?? 100,
        maxHp: profileData.max_hp ?? 100,
        exp: profileData.exp ?? 0,
        gold: profileData.gold ?? 100,
        streakDays: profileData.streak_days ?? 1,
        lastCompletedDate: profileData.last_completed_date || null,
        isStreakFrozen: Boolean(profileData.is_streak_frozen),
        activeExpMultiplier: Number(profileData.active_exp_multiplier) || 1.0,
        expBuffExpiresAt: null,
        theme: (profileData.theme as AppTheme) || 'DARK_DUNGEON',
        badge: profileData.badge || 'Novice Adventurer',
        avatarUrl: profileData.avatar_url || 'shield',
      };
    }

    // 2. Fetch Quests
    const { data: questsData, error: questsErr } = await supabase
      .from('quests')
      .select('*')
      .eq('user_id', userId)
      .order('id', { ascending: false });

    if (questsErr) {
      console.warn('Gagal memuat quests dari Supabase:', questsErr.message);
    }

    const quests: Quest[] = (questsData || []).map((q: any) => ({
      id: Number(q.id),
      title: q.title,
      description: q.description || '',
      type: q.type,
      category: q.category,
      expReward: q.exp_reward ?? 25,
      goldReward: q.gold_reward ?? 35,
      status: q.status,
      dueDate: q.due_date || undefined,
      createdAt: q.created_at,
      completedAt: q.completed_at || undefined,
      streakCount: q.streak_count ?? 0,
    }));

    // 3. Fetch Inventory
    const { data: invData, error: invErr } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', userId);

    if (invErr) {
      console.warn('Gagal memuat inventory dari Supabase:', invErr.message);
    }

    const inventory: InventoryItem[] = (invData || []).map((item: any) => ({
      id: Number(item.id),
      itemId: item.item_id,
      quantity: item.quantity,
      acquiredAt: item.acquired_at,
    }));

    // 4. Fetch History
    const { data: histData, error: histErr } = await supabase
      .from('quest_history')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(50);

    if (histErr) {
      console.warn('Gagal memuat riwayat dari Supabase:', histErr.message);
    }

    const history: QuestLogHistory[] = (histData || []).map((h: any) => ({
      id: Number(h.id),
      questId: h.quest_id ? Number(h.quest_id) : undefined,
      title: h.title,
      type: h.type,
      expChange: h.exp_change ?? 0,
      goldChange: h.gold_change ?? 0,
      hpChange: h.hp_change ?? 0,
      timestamp: h.timestamp,
    }));

    return { hero, quests, inventory, history };
  } catch (err) {
    console.error('Error saat fetchCloudUserData:', err);
    return null;
  }
};

/**
 * Menyimpan / memperbarui atribut Hero di Supabase (level, exp, hp, gold, streak, dll)
 */
export const syncHeroStatsToCloud = async (userId: string, hero: HeroStats): Promise<boolean> => {
  if (!isSupabaseConfigured() || !userId) return false;

  try {
    const payload = {
      id: userId,
      username: hero.name,
      title: hero.title,
      level: hero.level,
      hp: hero.hp,
      max_hp: hero.maxHp,
      exp: hero.exp,
      gold: hero.gold,
      streak_days: hero.streakDays,
      last_completed_date: hero.lastCompletedDate,
      is_streak_frozen: hero.isStreakFrozen,
      active_exp_multiplier: hero.activeExpMultiplier,
      theme: hero.theme,
      badge: hero.badge,
      avatar_url: hero.avatarUrl,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('Gagal sync hero stats ke Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error syncHeroStatsToCloud:', err);
    return false;
  }
};

/**
 * Menambahkan Quest baru ke Supabase
 */
export const syncAddQuestToCloud = async (
  userId: string,
  quest: Omit<Quest, 'id'>
): Promise<number | null> => {
  if (!isSupabaseConfigured() || !userId) return null;

  try {
    const payload = {
      user_id: userId,
      title: quest.title,
      description: quest.description || '',
      type: quest.type,
      category: quest.category,
      exp_reward: quest.expReward,
      gold_reward: quest.goldReward,
      status: quest.status,
      due_date: quest.dueDate || null,
      created_at: quest.createdAt || new Date().toISOString(),
      completed_at: quest.completedAt || null,
      streak_count: quest.streakCount || 0,
    };

    const { data, error } = await supabase
      .from('quests')
      .insert([payload])
      .select('id')
      .single();

    if (error) {
      console.warn('Gagal simpan quest ke Supabase:', error.message);
      return null;
    }

    return data?.id ? Number(data.id) : null;
  } catch (err) {
    console.error('Error syncAddQuestToCloud:', err);
    return null;
  }
};

/**
 * Memperbarui Quest di Supabase
 */
export const syncUpdateQuestToCloud = async (
  userId: string,
  questId: number,
  updates: Partial<Quest>
): Promise<boolean> => {
  if (!isSupabaseConfigured() || !userId) return false;

  try {
    const payload: any = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.type !== undefined) payload.type = updates.type;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.expReward !== undefined) payload.exp_reward = updates.expReward;
    if (updates.goldReward !== undefined) payload.gold_reward = updates.goldReward;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.dueDate !== undefined) payload.due_date = updates.dueDate || null;
    if (updates.completedAt !== undefined) payload.completed_at = updates.completedAt;
    if (updates.streakCount !== undefined) payload.streak_count = updates.streakCount;

    const { error } = await supabase
      .from('quests')
      .update(payload)
      .eq('id', questId)
      .eq('user_id', userId);

    if (error) {
      console.warn('Gagal update quest di Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error syncUpdateQuestToCloud:', err);
    return false;
  }
};

/**
 * Menghapus Quest dari Supabase
 */
export const syncDeleteQuestFromCloud = async (userId: string, questId: number): Promise<boolean> => {
  if (!isSupabaseConfigured() || !userId) return false;

  try {
    const { error } = await supabase
      .from('quests')
      .delete()
      .eq('id', questId)
      .eq('user_id', userId);

    if (error) {
      console.warn('Gagal hapus quest di Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error syncDeleteQuestFromCloud:', err);
    return false;
  }
};

/**
 * Sinkronisasi Item Ransel (Inventory) di Supabase
 */
export const syncInventoryItemToCloud = async (
  userId: string,
  itemId: string,
  quantity: number
): Promise<boolean> => {
  if (!isSupabaseConfigured() || !userId) return false;

  try {
    if (quantity <= 0) {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('user_id', userId)
        .eq('item_id', itemId);
      return !error;
    }

    const payload = {
      user_id: userId,
      item_id: itemId,
      quantity,
      acquired_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('inventory')
      .upsert(payload, { onConflict: 'user_id,item_id' });

    if (error) {
      console.warn('Gagal update inventory di Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error syncInventoryItemToCloud:', err);
    return false;
  }
};

/**
 * Mencatat riwayat (Quest History) ke Supabase
 */
export const syncAddHistoryToCloud = async (
  userId: string,
  entry: QuestLogHistory
): Promise<boolean> => {
  if (!isSupabaseConfigured() || !userId) return false;

  try {
    const payload = {
      user_id: userId,
      quest_id: entry.questId || null,
      title: entry.title,
      type: entry.type,
      exp_change: entry.expChange,
      gold_change: entry.goldChange,
      hp_change: entry.hpChange,
      timestamp: entry.timestamp || new Date().toISOString(),
    };

    const { error } = await supabase.from('quest_history').insert([payload]);
    if (error) {
      console.warn('Gagal catat riwayat di Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error syncAddHistoryToCloud:', err);
    return false;
  }
};

/**
 * Mereset data user di Supabase (misal saat reset total dipanggil)
 */
export const syncResetAllInCloud = async (
  userId: string,
  starterHero: HeroStats,
  starterQuests: Omit<Quest, 'id'>[]
): Promise<boolean> => {
  if (!isSupabaseConfigured() || !userId) return false;

  try {
    // 1. Hapus quest, inventory, history user lama di cloud
    await supabase.from('quests').delete().eq('user_id', userId);
    await supabase.from('inventory').delete().eq('user_id', userId);
    await supabase.from('quest_history').delete().eq('user_id', userId);

    // 2. Reset Profile Hero
    await syncHeroStatsToCloud(userId, starterHero);

    // 3. Tambahkan starter quests
    const payloads = starterQuests.map((q) => ({
      user_id: userId,
      title: q.title,
      description: q.description || '',
      type: q.type,
      category: q.category,
      exp_reward: q.expReward,
      gold_reward: q.goldReward,
      status: q.status,
      due_date: q.dueDate || null,
      created_at: q.createdAt || new Date().toISOString(),
    }));

    await supabase.from('quests').insert(payloads);
    return true;
  } catch (err) {
    console.error('Error syncResetAllInCloud:', err);
    return false;
  }
};

/**
 * Migrasi data dari local Dexie ke Supabase saat user pertama kali login dengan Google
 */
export const syncMigrateLocalToCloud = async (
  userId: string,
  hero: HeroStats,
  quests: Quest[],
  inventory: InventoryItem[],
  history: QuestLogHistory[]
): Promise<boolean> => {
  if (!isSupabaseConfigured() || !userId) return false;

  try {
    // 1. Simpan Hero
    await syncHeroStatsToCloud(userId, hero);

    // 2. Simpan Quests
    if (quests.length > 0) {
      const questsPayload = quests.map((q) => ({
        user_id: userId,
        title: q.title,
        description: q.description || '',
        type: q.type,
        category: q.category,
        exp_reward: q.expReward,
        gold_reward: q.goldReward,
        status: q.status,
        due_date: q.dueDate || null,
        created_at: q.createdAt || new Date().toISOString(),
        completed_at: q.completedAt || null,
        streak_count: q.streakCount || 0,
      }));
      await supabase.from('quests').insert(questsPayload);
    }

    // 3. Simpan Inventory
    if (inventory.length > 0) {
      for (const item of inventory) {
        await syncInventoryItemToCloud(userId, item.itemId, item.quantity);
      }
    }

    // 4. Simpan Riwayat
    if (history.length > 0) {
      const histPayload = history.map((h) => ({
        user_id: userId,
        quest_id: h.questId || null,
        title: h.title,
        type: h.type,
        exp_change: h.expChange,
        gold_change: h.goldChange,
        hp_change: h.hpChange,
        timestamp: h.timestamp || new Date().toISOString(),
      }));
      await supabase.from('quest_history').insert(histPayload);
    }

    return true;
  } catch (err) {
    console.error('Error syncMigrateLocalToCloud:', err);
    return false;
  }
};
