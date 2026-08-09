/**
 * Settings Store - Centralized settings management
 * 
 * According to AUDIT.md Section 1.2:
 * - Language (ru/en/it)
 * - Volume channels (master, music, sfx, ambience)
 * - Brightness
 * - Settings modal state
 * 
 * NO duplication with menuStore or other stores
 */

import { create } from 'zustand';
import type { SettingsStore, Language, VolumeSettings } from '@shared/types';
import { AudioManager } from '@/core/audio/AudioManager';

const DEFAULT_VOLUMES: VolumeSettings = {
  master: 0.8,
  music: 0.7,
  sfx: 0.8,
  ambience: 0.5,
};

const STORAGE_KEY = 'castelvento_settings';

interface SettingsState extends SettingsStore {
  // Internal state
  _isInitialized: boolean;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  // Initial state
  language: 'ru',
  volume: { ...DEFAULT_VOLUMES },
  brightness: 100,
  isSettingsOpen: false,
  _isInitialized: false,

  /**
   * Initialize settings from localStorage
   * Should be called once at app startup
   */
  initialize: () => {
    if (get()._isInitialized) return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        set({
          language: parsed.language ?? 'ru',
          volume: parsed.volume ?? DEFAULT_VOLUMES,
          brightness: parsed.brightness ?? 100,
          _isInitialized: true,
        });

        // Apply audio settings
        Object.entries(parsed.volume ?? DEFAULT_VOLUMES).forEach(([channel, value]) => {
          AudioManager.setVolume(channel as keyof VolumeSettings, value);
        });

        // Apply brightness
        document.documentElement.style.setProperty(
          '--brightness-filter',
          `brightness(${parsed.brightness ?? 100}%)`
        );

        console.log('[SettingsStore] Loaded from localStorage');
        return;
      }
    } catch (error) {
      console.error('[SettingsStore] Failed to load settings:', error);
    }

    set({ _isInitialized: true });
    console.log('[SettingsStore] Initialized with defaults');
  },

  /**
   * Save settings to localStorage
   */
  save: () => {
    const state = get();
    const data = {
      language: state.language,
      volume: state.volume,
      brightness: state.brightness,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  /**
   * Change language
   */
  setLanguage: (lang: Language) => {
    set({ language: lang });
    get().save();
    
    // Update i18n if configured
    // i18n.changeLanguage(lang);
    console.log(`[SettingsStore] Language changed to ${lang}`);
  },

  /**
   * Set volume for a specific channel
   * Automatically syncs with AudioManager
   */
  setVolume: (channel: keyof VolumeSettings, value: number) => {
    const clampedValue = Math.max(0, Math.min(1, value));
    
    set((state) => ({
      volume: {
        ...state.volume,
        [channel]: clampedValue,
      },
    }));

    // Sync with AudioManager
    AudioManager.setVolume(channel, clampedValue);
    
    get().save();
  },

  /**
   * Set brightness (0-100%)
   * Applies CSS filter to AppShell container
   */
  setBrightness: (value: number) => {
    const clampedValue = Math.max(0, Math.min(100, value));
    set({ brightness: clampedValue });
    
    // Apply CSS filter
    document.documentElement.style.setProperty(
      '--brightness-filter',
      `brightness(${clampedValue}%)`
    );
    
    get().save();
  },

  /**
   * Toggle settings modal open/closed
   */
  toggleSettings: () => {
    set((state) => ({ isSettingsOpen: !state.isSettingsOpen }));
  },

  /**
   * Open settings modal
   */
  openSettings: () => {
    set({ isSettingsOpen: true });
  },

  /**
   * Close settings modal
   */
  closeSettings: () => {
    set({ isSettingsOpen: false });
  },
}));

// Helper selectors for components
export const selectLanguage = (state: SettingsState) => state.language;
export const selectVolume = (state: SettingsState) => state.volume;
export const selectMasterVolume = (state: SettingsState) => state.volume.master;
export const selectMusicVolume = (state: SettingsState) => state.volume.music;
export const selectSFXVolume = (state: SettingsState) => state.volume.sfx;
export const selectAmbienceVolume = (state: SettingsState) => state.volume.ambience;
export const selectBrightness = (state: SettingsState) => state.brightness;
export const selectIsSettingsOpen = (state: SettingsState) => state.isSettingsOpen;
