import { useEffect, useState } from 'react';
import { useQuestStore } from './store/useQuestStore';
import { ScanlineOverlay } from './components/common/ScanlineOverlay';
import { ThemeParticlesOverlay } from './components/common/ThemeParticlesOverlay';
import { LicenseGate } from './components/license/LicenseGate';
import { HeroStatusCard } from './components/hero/HeroStatusCard';
import { QuestList } from './components/quests/QuestList';
import { AddEditQuestModal } from './components/quests/AddEditQuestModal';
import { ItemShop } from './components/shop/ItemShop';
import { InventoryModal } from './components/shop/InventoryModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { UpgradeLicenseModal } from './components/license/UpgradeLicenseModal';
import { QuestStats } from './components/quests/QuestStats';
import { LevelUpModal } from './components/hero/LevelUpModal';
import { ThemeSelectorModal } from './components/theme/ThemeSelectorModal';
import { PixelButton } from './components/common/PixelButton';
import { ShoppingBag, Backpack, Scroll, Settings, KeyRound, Palette, Volume2, VolumeX, Shield, Sword } from 'lucide-react';
import type { AppTheme } from './types/questlog';

export function App() {
  const {
    isUnlocked,
    isDemoMode,
    initializeStore,
    isLoading,
    setIsShopOpen,
    setIsInventoryOpen,
    setIsSettingsOpen,
    setIsHistoryOpen,
    setIsUpgradeModalOpen,
    inventory,
    theme,
    soundEnabled,
    toggleSound,
  } = useQuestStore();

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  useEffect(() => {
    initializeStore();

    import('./services/authService').then(({ onAuthStateChange, ensureGoogleUserProfile }) => {
      const { data: authListener } = onAuthStateChange(async (user) => {
        if (user) {
          const profile = await ensureGoogleUserProfile(user);
          useQuestStore.getState().setGoogleUser(user, profile);
        }
      });
      return () => {
        authListener?.subscription?.unsubscribe();
      };
    });
  }, [initializeStore]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0b18] flex flex-col items-center justify-center font-pixel text-yellow-400 p-4 space-y-4">
        <div className="animate-bounce">
          <Shield className="w-12 h-12 text-amber-400" />
        </div>
        <p className="text-sm tracking-widest animate-pulse">MEMUAT QUESTLOG DB...</p>
        <p className="font-retro text-xs text-gray-400">Menyiapkan Senjata & Stat Pahlawan...</p>
      </div>
    );
  }

  const getThemeContainerClass = (t: AppTheme) => {
    switch (t) {
      case 'SAKURA_PEARL':
        return 'theme-sakura-pearl bg-[#fdf2f8] text-[#831843]';
      case 'GOLDEN_VANILLA':
        return 'theme-golden-vanilla bg-[#fffbeb] text-[#78350f]';
      case 'OBSIDIAN_VIOLET':
        return 'theme-obsidian-violet bg-[#0f0b18] text-[#f3e8ff]';
      case 'DARK_DUNGEON':
      default:
        return 'theme-dark-dungeon bg-[#120a0a] text-[#fee2e2]';
    }
  };

  const getThemeHeaderClass = (t: AppTheme) => {
    switch (t) {
      case 'SAKURA_PEARL':
        return 'bg-[#fcf0f7] text-[#831843] border-[#be185d] shadow-[3px_3px_0px_#9d174d]';
      case 'GOLDEN_VANILLA':
        return 'bg-[#fef3c7] text-[#78350f] border-[#b45309] shadow-[3px_3px_0px_#78350f]';
      case 'OBSIDIAN_VIOLET':
        return 'bg-[#181226] text-[#f3e8ff] border-[#6d28d9] shadow-[3px_3px_0px_#000]';
      case 'DARK_DUNGEON':
      default:
        return 'bg-[#1d1010] text-[#fee2e2] border-[#991b1b] shadow-[3px_3px_0px_#000]';
    }
  };

  return (
    <div className={`min-h-screen ${getThemeContainerClass(theme)} selection:bg-pink-400 selection:text-black pb-24 md:pb-12 transition-colors duration-200 relative overflow-x-hidden`}>
      {/* Ambient Theme Falling/Floating Particles Overlay */}
      <ThemeParticlesOverlay />
      
      {/* CRT Scanline Overlay */}
      <ScanlineOverlay />

      {/* License Gate System (FinTrack pattern) */}
      {!isUnlocked && <LicenseGate />}

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6 space-y-4 sm:space-y-6 relative z-10">
        {/* Navigation Header */}
        <header className={`border-2 sm:border-3 p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 transition-colors rounded-xs ${getThemeHeaderClass(theme)}`}>
          {/* Logo & Identity */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-400 border-2 border-black flex items-center justify-center text-slate-950 shadow-[2px_2px_0px_#000] shrink-0 select-none rounded-xs">
                <Shield className="w-6 h-6 fill-slate-950 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="font-gaming text-lg sm:text-xl tracking-wider font-extrabold text-amber-400 drop-shadow-sm">
                    QUESTLOG
                  </h1>
                  <span className="font-gaming text-[10px] px-1.5 py-0.5 border bg-emerald-950 border-emerald-600 text-emerald-300 font-bold rounded-xs">
                    LOCAL-FIRST
                  </span>
                  {isDemoMode ? (
                    <button
                      onClick={() => setIsUpgradeModalOpen(true)}
                      className="font-gaming text-[10px] px-1.5 py-0.5 border bg-amber-950 border-amber-500 text-amber-300 hover:bg-amber-900 transition-colors flex items-center gap-1 cursor-pointer font-bold rounded-xs"
                    >
                      <KeyRound className="w-2.5 h-2.5" /> DEMO MODE
                    </button>
                  ) : (
                    <span className="font-gaming text-[10px] px-1.5 py-0.5 border bg-indigo-950 border-indigo-500 text-indigo-300 font-bold rounded-xs">
                      FULL VERSION
                    </span>
                  )}
                </div>
                <p className="font-sans text-xs opacity-85 mt-0.5 hidden sm:block font-medium">
                  Ubahlah tugas dunia nyatamu menjadi Quest RPG 8-Bit
                </p>
              </div>
            </div>

            {/* Quick Sound & Theme Toggle on Mobile Header */}
            <div className="flex items-center gap-1 md:hidden">
              <button
                onClick={() => setIsThemeModalOpen(true)}
                className="p-1.5 border-2 border-black bg-pink-500 text-white shadow-[2px_2px_0px_#000] rounded-xs"
                title="Pilih Tema Warna (Sakura / Vanilla / Violet / Dungeon)"
              >
                <Palette className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Nav Controls (Desktop) */}
          <div className="hidden md:flex flex-wrap items-center gap-2">
            <PixelButton
              variant="sakura"
              size="sm"
              onClick={() => setIsThemeModalOpen(true)}
              title="Pilih Tema Warna (Sakura / Vanilla / Violet / Dungeon)"
            >
              <Palette className="w-3.5 h-3.5 mr-1 inline" /> PILIH TEMA
            </PixelButton>

            <PixelButton
              variant="secondary"
              size="sm"
              onClick={toggleSound}
              title="Aktif/Matikan Efek Suara 8-Bit"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-red-400" />}
            </PixelButton>

            <PixelButton variant="gold" size="sm" onClick={() => setIsShopOpen(true)}>
              <ShoppingBag className="w-3.5 h-3.5 mr-1 inline" /> TOKO ITEM
            </PixelButton>

            <PixelButton variant="secondary" size="sm" onClick={() => setIsInventoryOpen(true)}>
              <Backpack className="w-3.5 h-3.5 mr-1 inline" /> RANSEL ({inventory.length})
            </PixelButton>

            <PixelButton variant="secondary" size="sm" onClick={() => setIsHistoryOpen(true)}>
              <Scroll className="w-3.5 h-3.5 mr-1 inline" /> LOG
            </PixelButton>

            <PixelButton variant="secondary" size="sm" onClick={() => setIsSettingsOpen(true)}>
              <Settings className="w-3.5 h-3.5" />
            </PixelButton>
          </div>
        </header>

        {/* Hero Character Card */}
        <HeroStatusCard />

        {/* Main Quest List & Filter Area */}
        <QuestList />
      </div>

      {/* Mobile Sticky Bottom Dock Bar */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t-2 border-black p-2 flex justify-around items-center shadow-[0_-2px_0px_#000] font-gaming text-[11px] ${getThemeHeaderClass(theme)}`}>
        <button
          onClick={() => {
            window.scrollTo({ top: 300, behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-1 font-bold p-1 text-amber-500"
        >
          <Sword className="w-4 h-4 text-amber-500" />
          <span>MISI</span>
        </button>

        <button
          onClick={() => setIsShopOpen(true)}
          className="flex flex-col items-center gap-1 text-amber-500 p-1 font-bold"
        >
          <ShoppingBag className="w-4 h-4 text-amber-500" />
          <span>TOKO</span>
        </button>

        <button
          onClick={() => setIsInventoryOpen(true)}
          className="flex flex-col items-center gap-1 text-pink-500 p-1 font-bold"
        >
          <Backpack className="w-4 h-4 text-pink-500" />
          <span>RANSEL ({inventory.length})</span>
        </button>

        <button
          onClick={() => setIsThemeModalOpen(true)}
          className="flex flex-col items-center gap-1 text-purple-500 p-1 font-bold"
        >
          <Palette className="w-4 h-4 text-purple-500" />
          <span>TEMA</span>
        </button>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex flex-col items-center gap-1 opacity-80 p-1 font-bold"
        >
          <Settings className="w-4 h-4" />
          <span>SETTING</span>
        </button>
      </nav>

      {/* Modals & Dialogs */}
      <AddEditQuestModal />
      <ItemShop />
      <InventoryModal />
      <SettingsModal />
      <UpgradeLicenseModal />
      <QuestStats />
      <LevelUpModal />
      <ThemeSelectorModal isOpen={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} />
    </div>
  );
}

export default App;
