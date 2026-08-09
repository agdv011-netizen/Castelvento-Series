/**
 * AudioManager - Unified Audio Engine Singleton
 * 
 * According to AUDIT.md Section 3
 * Replaces scattered Howl() and new Audio() calls with a single managed instance
 * Controlled by settingsStore for volume management
 */

import { Howl, Howler } from 'howler';
import type { AudioManagerInterface, AudioChannel } from '@shared/types';

// Volume defaults (0.0 - 1.0)
const DEFAULT_VOLUMES = {
  master: 1.0,
  music: 0.7,
  sfx: 0.8,
  ambience: 0.5,
  voice: 1.0,
};

class AudioManagerImpl implements AudioManagerInterface {
  private bgm: Howl | null = null;
  private ambience: Howl | null = null;
  private sfxPool: Map<string, Howl> = new Map();
  private voicePool: Howl | null = null;
  private isUnlocked: boolean = false;
  
  // Current volume settings (will be synced with settingsStore)
  private volumes = { ...DEFAULT_VOLUMES };

  constructor() {
    // Initial Howler setup
    Howler.volume(DEFAULT_VOLUMES.master);
    Howler.autoUnlock = false; // We manually unlock on user interaction
  }

  /**
   * Unlock audio context - must be called on first user interaction
   * Per AUDIT.md: Single Howler.unlock() call at AppShell level
   */
  public unlock(): void {
    if (this.isUnlocked) return;
    Howler.unlock();
    this.isUnlocked = true;
    console.log('[AudioManager] Audio context unlocked');
  }

  /**
   * Update volume settings (called by settingsStore subscription)
   */
  public setVolume(channel: AudioChannel, value: number): void {
    const clampedValue = Math.max(0, Math.min(1, value));
    this.volumes[channel] = clampedValue;

    switch (channel) {
      case 'master':
        Howler.volume(clampedValue);
        // Re-apply channel volumes after master change
        if (this.bgm) this.bgm.volume(this.volumes.music);
        if (this.ambience) this.ambience.volume(this.volumes.ambience);
        break;
      
      case 'music':
        if (this.bgm) this.bgm.volume(clampedValue);
        break;
      
      case 'ambience':
        if (this.ambience) this.ambience.volume(clampedValue);
        break;
      
      case 'sfx':
        // SFX volume is applied per-play, no need to update pooled sounds
        break;
      
      case 'voice':
        if (this.voicePool) this.voicePool.volume(clampedValue);
        break;
    }
  }

  /**
   * Play background music with crossfade
   * @param src - Path to audio file (e.g., '/assets/audio/music/theme.mp3')
   * @param fadeDuration - Fade transition duration in ms (default: 1000)
   */
  public playBGM(src: string, fadeDuration = 1000): void {
    const musicVol = this.volumes.music;
    
    // Fade out current BGM if playing
    if (this.bgm) {
      const oldBgm = this.bgm;
      const currentVol = oldBgm.volume();
      
      // Smooth fade out
      oldBgm.fade(currentVol, 0, fadeDuration);
      
      setTimeout(() => {
        oldBgm.stop();
        oldBgm.unload();
      }, fadeDuration);
    }

    // Create and fade in new BGM
    this.bgm = new Howl({
      src: [src],
      loop: true,
      volume: 0,
      preload: true,
      html5: true, // Use HTML5 Audio for better mobile support
    });

    this.bgm.play();
    this.bgm.fade(0, musicVol, fadeDuration);
  }

  /**
   * Stop background music with fade out
   * @param fadeDuration - Fade out duration in ms (default: 1000)
   */
  public stopBGM(fadeDuration = 1000): void {
    if (!this.bgm) return;

    const currentVol = this.bgm.volume();
    this.bgm.fade(currentVol, 0, fadeDuration);

    setTimeout(() => {
      this.bgm?.stop();
      this.bgm?.unload();
      this.bgm = null;
    }, fadeDuration);
  }

  /**
   * Play ambient sound with crossfade
   * @param src - Path to audio file (e.g., '/assets/audio/ambience/waves.ogg')
   * @param fadeDuration - Fade transition duration in ms (default: 1000)
   */
  public playAmbience(src: string, fadeDuration = 1000): void {
    const ambienceVol = this.volumes.ambience;

    // Fade out current ambience if playing
    if (this.ambience) {
      const oldAmb = this.ambience;
      const currentVol = oldAmb.volume();
      
      oldAmb.fade(currentVol, 0, fadeDuration);
      
      setTimeout(() => {
        oldAmb.stop();
        oldAmb.unload();
      }, fadeDuration);
    }

    // Create and fade in new ambience
    this.ambience = new Howl({
      src: [src],
      loop: true,
      volume: 0,
      preload: true,
      html5: true,
    });

    this.ambience.play();
    this.ambience.fade(0, ambienceVol, fadeDuration);
  }

  /**
   * Stop ambient sound with fade out
   * @param fadeDuration - Fade out duration in ms (default: 1000)
   */
  public stopAmbience(fadeDuration = 1000): void {
    if (!this.ambience) return;

    const currentVol = this.ambience.volume();
    this.ambience.fade(currentVol, 0, fadeDuration);

    setTimeout(() => {
      this.ambience?.stop();
      this.ambience?.unload();
      this.ambience = null;
    }, fadeDuration);
  }

  /**
   * Play sound effect (pooled for performance)
   * @param src - Path to audio file (e.g., '/assets/audio/sfx/click.wav')
   * @param volumeScale - Additional volume multiplier (default: 1.0)
   */
  public playSFX(src: string, volumeScale = 1.0): void {
    const sfxVol = this.volumes.sfx * volumeScale;
    
    let sound = this.sfxPool.get(src);
    
    if (!sound) {
      // Create new pooled sound
      sound = new Howl({
        src: [src],
        volume: sfxVol,
        preload: true,
        onloaderror: () => {
          console.warn(`[AudioManager] Failed to load SFX: ${src}`);
        },
      });
      this.sfxPool.set(src, sound);
    } else {
      // Update volume and replay
      sound.volume(sfxVol);
      // Stop if already playing to allow rapid re-triggering
      if (sound.playing()) {
        sound.stop();
      }
    }

    sound.play();
  }

  /**
   * Play voice/dialogue line
   * @param src - Path to voice file
   * @param volumeScale - Additional volume multiplier
   */
  public playVoice(src: string, volumeScale = 1.0): void {
    const voiceVol = this.volumes.voice * volumeScale;

    // Stop any currently playing voice
    if (this.voicePool) {
      this.voicePool.stop();
    }

    this.voicePool = new Howl({
      src: [src],
      volume: voiceVol,
      preload: true,
      html5: true,
      onend: () => {
        // Clean up after playback
        this.voicePool?.unload();
        this.voicePool = null;
      },
    });

    this.voicePool.play();
  }

  /**
   * Pause all audio (for tab visibility change, etc.)
   */
  public pauseAll(): void {
    Howler.mute(true);
  }

  /**
   * Resume all audio
   */
  public resumeAll(): void {
    Howler.mute(false);
  }

  /**
   * Stop all audio and clean up resources
   */
  public stopAll(): void {
    this.stopBGM(500);
    this.stopAmbience(500);
    
    this.sfxPool.forEach((sound) => {
      sound.stop();
      sound.unload();
    });
    this.sfxPool.clear();

    if (this.voicePool) {
      this.voicePool.stop();
      this.voicePool.unload();
      this.voicePool = null;
    }
  }

  /**
   * Get current BGM state
   */
  public isBGMPlaying(): boolean {
    return this.bgm?.playing() ?? false;
  }

  /**
   * Get current ambience state
   */
  public isAmbiencePlaying(): boolean {
    return this.ambience?.playing() ?? false;
  }
}

// Export singleton instance
export const AudioManager = new AudioManagerImpl();

// Optional: Helper to subscribe settingsStore to AudioManager
// This would be called in your settingsStore implementation
export function syncAudioWithSettings(
  getVolumeSettings: () => typeof DEFAULT_VOLUMES
): () => void {
  const volumes = getVolumeSettings();
  
  // Set initial volumes
  Object.entries(volumes).forEach(([channel, value]) => {
    AudioManager.setVolume(channel as AudioChannel, value);
  });

  // Return unsubscribe function (placeholder - implement based on your store)
  return () => {
    // Cleanup if needed
  };
}
