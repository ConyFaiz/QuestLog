import Dexie, { type Table } from 'dexie';
import type { Quest, HeroStats, InventoryItem, QuestLogHistory } from '../types/questlog';

export interface AppSetting {
  key: string;
  value: unknown;
}

export class QuestLogDatabase extends Dexie {
  quests!: Table<Quest, number>;
  heroStats!: Table<HeroStats, number>;
  inventory!: Table<InventoryItem, number>;
  history!: Table<QuestLogHistory, number>;
  settings!: Table<AppSetting, string>;

  constructor() {
    super('QuestLogDB');
    this.version(1).stores({
      quests: '++id, status, type, category, dueDate, createdAt',
      heroStats: '++id',
      inventory: '++id, itemId',
      history: '++id, type, timestamp',
      settings: 'key',
    });
  }
}

export const db = new QuestLogDatabase();

export const getDemoQuests = (today: string): Omit<Quest, 'id'>[] => [
  {
    title: 'Selesaikan 1 Tugas Utama Hari Ini',
    description: 'Pilih satu tugas nyata terpentingmu hari ini dan selesaikan seperti seorang Pahlawan!',
    type: 'DAILY',
    category: 'WORK',
    expReward: 25,
    goldReward: 35,
    status: 'ACTIVE',
    dueDate: today,
    createdAt: new Date().toISOString(),
  },
  {
    title: 'Olahraga & Latihan Fisik 20 Menit',
    description: 'Jaga stamina dan HP fisikmu dengan push-up, stretching, atau jogging pagi.',
    type: 'DAILY',
    category: 'FITNESS',
    expReward: 25,
    goldReward: 35,
    status: 'ACTIVE',
    dueDate: today,
    createdAt: new Date().toISOString(),
  },
  {
    title: 'Minum 2 Liter Air Putih & Hidrasi Tubuh',
    description: 'Pulihkan Mana & HP alami tubuhmu dengan hidrasi optimal sepanjang hari.',
    type: 'DAILY',
    category: 'HEALTH',
    expReward: 25,
    goldReward: 35,
    status: 'ACTIVE',
    dueDate: today,
    createdAt: new Date().toISOString(),
  },
  {
    title: 'Membaca Buku / Belajar Skill Baru 15 Menit',
    description: 'Tambah poin Intellect (EXP) dengan membaca dokumentasi, artikel bermanfaat, atau buku.',
    type: 'DAILY',
    category: 'STUDY',
    expReward: 25,
    goldReward: 35,
    status: 'ACTIVE',
    dueDate: today,
    createdAt: new Date().toISOString(),
  },
  {
    title: 'Refleksi Diri & Jurnal Harian 5 Menit',
    description: 'Tuliskan 3 hal yang disyukuri hari ini untuk menjaga kesehatan mental pahlawan.',
    type: 'DAILY',
    category: 'PERSONAL',
    expReward: 25,
    goldReward: 35,
    status: 'ACTIVE',
    dueDate: today,
    createdAt: new Date().toISOString(),
  },
  {
    title: 'Kuasai Sistem QuestLog & Item Shop',
    description: 'Eksplor Toko In-Game, kumpulkan Gold, dan beli Potion Merah pertama Anda di Toko Item.',
    type: 'EVENT',
    category: 'PERSONAL',
    expReward: 25,
    goldReward: 35,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
  {
    title: 'Merapikan Meja Kerja & Ruang Kerja Digital',
    description: 'Bersihkan berkas yang menumpuk di meja kerja serta rapikan folder desktop komputermu.',
    type: 'EVENT',
    category: 'WORK',
    expReward: 25,
    goldReward: 35,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
  {
    title: 'Selesaikan 1 Sesi Tutorial / Materi Modul',
    description: 'Tingkatkan level keahlian teknis dengan menuntaskan 1 sesi materi belajar hari ini.',
    type: 'EVENT',
    category: 'STUDY',
    expReward: 25,
    goldReward: 35,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
  {
    title: 'Rencanakan Jadwal & Target Mingguan',
    description: 'Tuliskan daftar prioritas mingguan agar petualanganmu tetap terarah dan produktif.',
    type: 'EVENT',
    category: 'GENERAL',
    expReward: 25,
    goldReward: 35,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
];

export const getDefaultHeroStats = (today: string): Omit<HeroStats, 'id'> => ({
  name: 'Pahlawan Pixel',
  title: 'Novice Adventurer',
  level: 1,
  hp: 100,
  maxHp: 100,
  exp: 0,
  gold: 100,
  streakDays: 1,
  lastCompletedDate: today,
  isStreakFrozen: false,
  activeExpMultiplier: 1.0,
  expBuffExpiresAt: null,
  theme: 'DARK_DUNGEON',
  badge: 'Novice Adventurer',
  avatarUrl: 'shield',
});

export const seedInitialData = async () => {
  const today = new Date().toISOString().split('T')[0];
  const heroCount = await db.heroStats.count();
  if (heroCount === 0) {
    await db.heroStats.add(getDefaultHeroStats(today) as HeroStats);
  }

  const questCount = await db.quests.count();
  if (questCount === 0) {
    await db.quests.bulkAdd(getDemoQuests(today) as Quest[]);
  }
};

export const resetFullDatabase = async () => {
  const today = new Date().toISOString().split('T')[0];
  await db.quests.clear();
  await db.heroStats.clear();
  await db.inventory.clear();
  await db.history.clear();

  const heroData = getDefaultHeroStats(today);
  const heroId = await db.heroStats.add(heroData as HeroStats);
  const hero = { ...heroData, id: heroId } as HeroStats;

  const demoQuestsData = getDemoQuests(today);
  await db.quests.bulkAdd(demoQuestsData as Quest[]);
  const quests = await db.quests.toArray();

  return { hero, quests };
};
