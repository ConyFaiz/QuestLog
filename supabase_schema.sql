-- ========================================================
-- QUESTLOG SUPABASE DATABASE SCHEMA
-- Skema Database PostgreSQL untuk QuestLog RPG Tracker
-- ========================================================

-- 1. TABEL PROFILES (Status & Atribut Hero)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL DEFAULT 'Pahlawan_Google',
  email TEXT,
  avatar_url TEXT,
  title TEXT NOT NULL DEFAULT 'Novice Adventurer',
  level INTEGER NOT NULL DEFAULT 1,
  hp INTEGER NOT NULL DEFAULT 100,
  max_hp INTEGER NOT NULL DEFAULT 100,
  exp INTEGER NOT NULL DEFAULT 0,
  gold INTEGER NOT NULL DEFAULT 100,
  streak_days INTEGER NOT NULL DEFAULT 1,
  last_completed_date TEXT,
  is_streak_frozen BOOLEAN NOT NULL DEFAULT FALSE,
  active_exp_multiplier NUMERIC NOT NULL DEFAULT 1.0,
  theme TEXT NOT NULL DEFAULT 'DARK_DUNGEON',
  badge TEXT NOT NULL DEFAULT 'Novice Adventurer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TABEL QUESTS (Daftar Misi Harian & Event)
CREATE TABLE IF NOT EXISTS public.quests (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'DAILY', -- 'DAILY' | 'EVENT'
  category TEXT NOT NULL DEFAULT 'GENERAL', -- 'FITNESS' | 'STUDY' | 'WORK' | 'HEALTH' | 'PERSONAL' | 'GENERAL'
  exp_reward INTEGER NOT NULL DEFAULT 25,
  gold_reward INTEGER NOT NULL DEFAULT 35,
  status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE' | 'COMPLETED' | 'OVERDUE' | 'FAILED'
  due_date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  streak_count INTEGER NOT NULL DEFAULT 0
);

-- 3. TABEL INVENTORY (Ransel & Item Hero)
CREATE TABLE IF NOT EXISTS public.inventory (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_item UNIQUE(user_id, item_id)
);

-- 4. TABEL QUEST_HISTORY (Riwayat Aktivitas & Log EXP/Gold)
CREATE TABLE IF NOT EXISTS public.quest_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id BIGINT,
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- 'COMPLETED' | 'FAILED' | 'ITEM_PURCHASED' | 'ITEM_USED' | 'LEVEL_UP' | 'HP_LOST'
  exp_change INTEGER NOT NULL DEFAULT 0,
  gold_change INTEGER NOT NULL DEFAULT 0,
  hp_change INTEGER NOT NULL DEFAULT 0,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================
-- INDEXES UNTUK PERFORMA QUERY
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_quests_user_status ON public.quests(user_id, status);
CREATE INDEX IF NOT EXISTS idx_quests_user_type ON public.quests(user_id, type);
CREATE INDEX IF NOT EXISTS idx_inventory_user ON public.inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_history_user_time ON public.quest_history(user_id, timestamp DESC);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) - KEAMANAN DATA PENGGUNA
-- Setiap user hanya dapat mengakses datanya sendiri
-- ========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_history ENABLE ROW LEVEL SECURITY;

-- Drop policies if already exist to allow clean rerun
DO $$
BEGIN
  -- Profiles
  DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

  -- Quests
  DROP POLICY IF EXISTS "Users can view own quests" ON public.quests;
  DROP POLICY IF EXISTS "Users can insert own quests" ON public.quests;
  DROP POLICY IF EXISTS "Users can update own quests" ON public.quests;
  DROP POLICY IF EXISTS "Users can delete own quests" ON public.quests;

  -- Inventory
  DROP POLICY IF EXISTS "Users can view own inventory" ON public.inventory;
  DROP POLICY IF EXISTS "Users can insert own inventory" ON public.inventory;
  DROP POLICY IF EXISTS "Users can update own inventory" ON public.inventory;
  DROP POLICY IF EXISTS "Users can delete own inventory" ON public.inventory;

  -- Quest History
  DROP POLICY IF EXISTS "Users can view own history" ON public.quest_history;
  DROP POLICY IF EXISTS "Users can insert own history" ON public.quest_history;
  DROP POLICY IF EXISTS "Users can delete own history" ON public.quest_history;
END $$;

-- Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policies for quests
CREATE POLICY "Users can view own quests" ON public.quests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quests" ON public.quests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quests" ON public.quests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quests" ON public.quests
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for inventory
CREATE POLICY "Users can view own inventory" ON public.inventory
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory" ON public.inventory
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory" ON public.inventory
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventory" ON public.inventory
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for quest_history
CREATE POLICY "Users can view own history" ON public.quest_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history" ON public.quest_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own history" ON public.quest_history
  FOR DELETE USING (auth.uid() = user_id);

-- ========================================================
-- OTOMATISASI: AUTO-CREATE PROFILE SAAT LOGIN DENGAN GOOGLE
-- ========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  hero_name TEXT;
  avatar TEXT;
  today_str TEXT;
BEGIN
  hero_name := COALESCE(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1),
    'Pahlawan_Google'
  );
  avatar := COALESCE(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'picture',
    'shield'
  );
  today_str := TO_CHAR(NOW(), 'YYYY-MM-DD');

  -- Buat Profile Hero Baru
  INSERT INTO public.profiles (
    id,
    username,
    email,
    avatar_url,
    title,
    level,
    hp,
    max_hp,
    exp,
    gold,
    streak_days,
    last_completed_date,
    is_streak_frozen,
    theme,
    badge
  )
  VALUES (
    new.id,
    hero_name,
    new.email,
    avatar,
    'Novice Adventurer',
    1,
    100,
    100,
    0,
    100,
    1,
    today_str,
    FALSE,
    'DARK_DUNGEON',
    'Novice Adventurer'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Buat Misi Starter Awal Otomatis
  INSERT INTO public.quests (user_id, title, description, type, category, exp_reward, gold_reward, status, due_date)
  VALUES
    (new.id, 'Selesaikan 1 Tugas Utama Hari Ini', 'Pilih satu tugas nyata terpentingmu hari ini dan selesaikan seperti seorang Pahlawan!', 'DAILY', 'WORK', 25, 35, 'ACTIVE', today_str),
    (new.id, 'Olahraga & Latihan Fisik 20 Menit', 'Jaga stamina dan HP fisikmu dengan push-up, stretching, atau jogging pagi.', 'DAILY', 'FITNESS', 25, 35, 'ACTIVE', today_str),
    (new.id, 'Minum 2 Liter Air Putih & Hidrasi Tubuh', 'Pulihkan Mana & HP alami tubuhmu dengan hidrasi optimal sepanjang hari.', 'DAILY', 'HEALTH', 25, 35, 'ACTIVE', today_str),
    (new.id, 'Membaca Buku / Belajar Skill Baru 15 Menit', 'Tambah poin Intellect (EXP) dengan membaca dokumentasi, artikel bermanfaat, atau buku.', 'DAILY', 'STUDY', 25, 35, 'ACTIVE', today_str),
    (new.id, 'Kuasai Sistem QuestLog & Item Shop', 'Eksplor Toko In-Game, kumpulkan Gold, dan beli Potion Merah pertama Anda di Toko Item.', 'EVENT', 'PERSONAL', 25, 35, 'ACTIVE', NULL)
  ON CONFLICT DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger yang memicu fungsi di atas setiap kali akun baru terdaftar
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
