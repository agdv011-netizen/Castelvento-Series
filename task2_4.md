# Task 2.4: Settings Modal (Vintage Aesthetic) - Detailed Implementation Specification

## 📋 Overview
**Priority:** P1 (High)  
**Estimated Time:** 4-5 hours  
**Goal:** Create a settings screen that feels like opening an old diary, not a modern UI panel.

---

## 🎯 Core Requirements

### 2.4.1 Visual Design Concept

**Theme:** Old diary/ledger from the 1940s
- Background: Aged paper texture with visible fibers and slight discoloration
- Edges: Worn leather binding visible on left side
- Typography: Handwritten font for labels, typewriter font for values
- Colors: Sepia tones, ink blues, faded reds

**Color Palette:**
- Paper background: #F5E6D3 (cream), #E8D5B5 (aged beige)
- Leather binding: #5C4033 (dark brown), #8B7355 (medium brown)
- Ink text: #2C3E50 (dark blue-black), #34495E (slate)
- Accent highlights: #C9A961 (gold), #B87333 (copper)
- Shadows: rgba(44, 30, 20, 0.4)

### 2.4.2 Settings Controls

| Setting | Visual Metaphor | Interaction | Value Range |
|---------|-----------------|-------------|-------------|
| **Language** | Flag bookmarks on page edges | Click flag to select | EN, RU, IT (expandable) |
| **Music Volume** | Brass radio dial with needle | Rotate knob clockwise/counter-clockwise | 0-100% |
| **SFX Volume** | Gramophone horn crank | Turn crank up/down | 0-100% |
| **Brightness** | Oil lamp with adjustable wick | Slide wick control up/down | 50-150% |
| **Close** | Page turn animation | Click bottom-right corner or press ESC | N/A |

---

## 🏗️ File Structure

```
client/src/
├── components/
│   └── Settings/
│       ├── SettingsModal.tsx          # Main modal container
│       ├── SettingsPage.tsx           # Diary page component
│       ├── controls/
│       │   ├── LanguageSelector.tsx   # Flag bookmarks
│       │   ├── MusicVolumeDial.tsx    # Radio dial control
│       │   ├── SFXVolumeCrank.tsx     # Gramophone crank
│       │   ├── BrightnessLamp.tsx     # Oil lamp slider
│       │   └── CloseButton.tsx        # Page corner close
│       ├── styles/
│       │   ├── settingsModal.module.css
│       │   ├── controls.module.css
│       │   └── animations.module.css
│       └── index.ts
├── assets/
│   └── images/
│       ├── settings/
│       │   ├── diary-bg.png           # Main page texture
│       │   ├── leather-binding.png    # Left edge binding
│       │   └── page-corner.png        # Interactive close area
│       └── controls/
│           ├── radio-dial.svg
│           ├── gramophone-horn.svg
│           ├── oil-lamp.svg
│           └── flags/
│               ├── en.svg
│               ├── ru.svg
│               └── it.svg
├── store/
│   └── settingsStore.ts               # Zustand store for settings
└── hooks/
    └── useSettings.ts                 # Custom hook for settings logic
```

---

## 💻 Implementation Details

### Store: `settingsStore.ts`

```typescript
// client/src/store/settingsStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  // Values
  language: 'en' | 'ru' | 'it';
  musicVolume: number;      // 0-100
  sfxVolume: number;        // 0-100
  brightness: number;       // 50-150 (100 = normal)
  
  // UI State
  isSettingsOpen: boolean;
  activeTab: 'general' | 'audio' | 'video';
  
  // Actions
  setLanguage: (lang: 'en' | 'ru' | 'it') => void;
  setMusicVolume: (volume: number) => void;
  setSFXVolume: (volume: number) => void;
  setBrightness: (brightness: number) => void;
  openSettings: (tab?: 'general' | 'audio' | 'video') => void;
  closeSettings: () => void;
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS = {
  language: 'en' as const,
  musicVolume: 70,
  sfxVolume: 80,
  brightness: 100,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,
      isSettingsOpen: false,
      activeTab: 'general',

      setLanguage: (lang) => {
        set({ language: lang });
        document.documentElement.lang = lang;
      },

      setMusicVolume: (volume) => {
        const clamped = Math.max(0, Math.min(100, volume));
        set({ musicVolume: clamped });
        // Apply to audio system
        window.dispatchEvent(new CustomEvent('musicVolumeChange', { detail: clamped }));
      },

      setSFXVolume: (volume) => {
        const clamped = Math.max(0, Math.min(100, volume));
        set({ sfxVolume: clamped });
        // Apply to audio system
        window.dispatchEvent(new CustomEvent('sfxVolumeChange', { detail: clamped }));
      },

      setBrightness: (brightness) => {
        const clamped = Math.max(50, Math.min(150, brightness));
        set({ brightness: clamped });
        // Apply CSS filter to root
        document.documentElement.style.setProperty(
          '--brightness-filter', 
          `brightness(${clamped}%)`
        );
      },

      openSettings: (tab = 'general') => set({ 
        isSettingsOpen: true, 
        activeTab: tab 
      }),

      closeSettings: () => set({ isSettingsOpen: false }),

      resetToDefaults: () => set({ ...DEFAULT_SETTINGS }),
    }),
    {
      name: 'castelvento-settings',
      partialize: (state) => ({
        language: state.language,
        musicVolume: state.musicVolume,
        sfxVolume: state.sfxVolume,
        brightness: state.brightness,
      }),
    }
  )
);
```

### Main Modal Component: `SettingsModal.tsx`

```typescript
// client/src/components/Settings/SettingsModal.tsx

import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '../../store/settingsStore';
import { SettingsPage } from './SettingsPage';
import styles from './styles/settingsModal.module.css';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, closeSettings, activeTab } = useSettingsStore();

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSettingsOpen) {
        closeSettings();
      }
    };

    if (isSettingsOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isSettingsOpen, closeSettings]);

  // Close on click outside
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeSettings();
    }
  }, [closeSettings]);

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            className={styles.modalContainer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            initial={{ 
              opacity: 0, 
              scale: 0.8, 
              rotateY: -30,
              transformOrigin: 'left center'
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              rotateY: 0,
              transformOrigin: 'left center'
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.8, 
              rotateY: -30,
              transformOrigin: 'left center'
            }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
              duration: 0.5,
            }}
            onClick={handleBackdropClick}
          >
            <SettingsPage activeTab={activeTab} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
```

### Diary Page Component: `SettingsPage.tsx`

```typescript
// client/src/components/Settings/SettingsPage.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { LanguageSelector } from './controls/LanguageSelector';
import { MusicVolumeDial } from './controls/MusicVolumeDial';
import { SFXVolumeCrank } from './controls/SFXVolumeCrank';
import { BrightnessLamp } from './controls/BrightnessLamp';
import { CloseButton } from './controls/CloseButton';
import { useSettingsStore } from '../../store/settingsStore';
import diaryBackground from '../../assets/images/settings/diary-bg.png';
import leatherBinding from '../../assets/images/settings/leather-binding.png';
import styles from './styles/settingsModal.module.css';

interface SettingsPageProps {
  activeTab: 'general' | 'audio' | 'video';
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ activeTab }) => {
  const { closeSettings } = useSettingsStore();

  const pageVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 100,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    },
    exit: { 
      opacity: 0, 
      x: -100,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className={styles.diaryPage}>
      {/* Leather Binding (Left Edge) */}
      <div 
        className={styles.leatherBinding}
        style={{ backgroundImage: `url(${leatherBinding})` }}
        aria-hidden="true"
      />

      {/* Page Background */}
      <div 
        className={styles.pageBackground}
        style={{ backgroundImage: `url(${diaryBackground})` }}
      >
        {/* Header */}
        <motion.header className={styles.pageHeader}>
          <h1 id="settings-title" className={styles.pageTitle}>
            Settings Diary
          </h1>
          <div className={styles.decorationLine} aria-hidden="true" />
        </motion.header>

        {/* Content based on active tab */}
        <motion.main 
          className={styles.pageContent}
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Language Section (Always visible) */}
          <section className={styles.settingsSection}>
            <h2 className={styles.sectionTitle}>Language / Язык / Lingua</h2>
            <LanguageSelector />
          </section>

          {/* Audio Settings */}
          {(activeTab === 'general' || activeTab === 'audio') && (
            <>
              <section className={styles.settingsSection}>
                <h2 className={styles.sectionTitle}>Music Volume</h2>
                <MusicVolumeDial />
                <p className={styles.sectionDescription}>
                  Adjust the background music level
                </p>
              </section>

              <section className={styles.settingsSection}>
                <h2 className={styles.sectionTitle}>Sound Effects</h2>
                <SFXVolumeCrank />
                <p className={styles.sectionDescription}>
                  Control ambient sounds and effects
                </p>
              </section>
            </>
          )}

          {/* Video/Brightness Settings */}
          {(activeTab === 'general' || activeTab === 'video') && (
            <section className={styles.settingsSection}>
              <h2 className={styles.sectionTitle}>Screen Brightness</h2>
              <BrightnessLamp />
              <p className={styles.sectionDescription}>
                Adjust the lamp intensity for comfortable viewing
              </p>
            </section>
          )}
        </motion.main>

        {/* Close Button (Bottom Right Corner) */}
        <CloseButton onClose={closeSettings} />
      </div>
    </div>
  );
};
```

### Control: `MusicVolumeDial.tsx`

```typescript
// client/src/components/Settings/controls/MusicVolumeDial.tsx

import React, { useState, useCallback, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useSettingsStore } from '../../../store/settingsStore';
import radioDialSVG from '../../../assets/images/controls/radio-dial.svg';
import styles from './styles/controls.module.css';

export const MusicVolumeDial: React.FC = () => {
  const { musicVolume, setMusicVolume } = useSettingsStore();
  const [isDragging, setIsDragging] = useState(false);
  const dialRef = useRef<HTMLDivElement>(null);
  
  // Motion value for rotation (-135deg to 135deg = 270deg total range)
  const rotation = useMotionValue(((musicVolume / 100) * 270) - 135);
  
  // Transform rotation to volume percentage
  const volumeDisplay = useTransform(rotation, [-135, 135], [0, 100]);

  const handleDrag = useCallback((_: any, info: any) => {
    const newRotation = rotation.get() + info.delta.x * 0.5;
    const clampedRotation = Math.max(-135, Math.min(135, newRotation));
    rotation.set(clampedRotation);
    
    // Calculate volume from rotation
    const newVolume = ((clampedRotation + 135) / 270) * 100;
    setMusicVolume(Math.round(newVolume));
  }, [rotation, setMusicVolume]);

  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = () => setIsDragging(false);

  // Keyboard support
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentRotation = rotation.get();
    let newRotation = currentRotation;

    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      newRotation = Math.min(135, currentRotation + 10);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      newRotation = Math.max(-135, currentRotation - 10);
    } else {
      return;
    }

    e.preventDefault();
    rotation.set(newRotation);
    const newVolume = ((newRotation + 135) / 270) * 100;
    setMusicVolume(Math.round(newVolume));
  };

  return (
    <div className={styles.dialContainer}>
      {/* Dial Base */}
      <div className={styles.dialBase}>
        <img 
          src={radioDialSVG} 
          alt="Radio dial base" 
          className={styles.dialImage}
          aria-hidden="true"
        />
        
        {/* Volume markers */}
        <div className={styles.dialMarkers} aria-hidden="true">
          {[0, 25, 50, 75, 100].map((mark) => (
            <div 
              key={mark} 
              className={styles.dialMarker}
              style={{ 
                transform: `rotate(${-135 + (mark / 100) * 270}deg)` 
              }}
            >
              <span className={styles.markerLabel}>{mark}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rotating Knob */}
      <motion.div
        ref={dialRef}
        className={`${styles.dialKnob} ${isDragging ? styles.dragging : ''}`}
        style={{ rotate: rotation }}
        draggable
        onDrag={handleDrag}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="slider"
        aria-label="Music volume"
        aria-valuenow={musicVolume}
        aria-valuemin={0}
        aria-valuemax={100}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Needle/Indicator */}
        <div className={styles.dialNeedle} aria-hidden="true" />
      </motion.div>

      {/* Current Value Display */}
      <div className={styles.volumeDisplay}>
        <span className={styles.volumeValue}>{musicVolume}%</span>
      </div>
    </div>
  );
};
```

### Control: `LanguageSelector.tsx`

```typescript
// client/src/components/Settings/controls/LanguageSelector.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../../store/settingsStore';
import enFlag from '../../../assets/images/controls/flags/en.svg';
import ruFlag from '../../../assets/images/controls/flags/ru.svg';
import itFlag from '../../../assets/images/controls/flags/it.svg';
import styles from './styles/controls.module.css';

const languages = [
  { code: 'en' as const, label: 'English', flag: enFlag },
  { code: 'ru' as const, label: 'Русский', flag: ruFlag },
  { code: 'it' as const, label: 'Italiano', flag: itFlag },
];

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useSettingsStore();

  return (
    <div className={styles.languageSelector}>
      {languages.map((lang, index) => (
        <motion.button
          key={lang.code}
          className={`${styles.flagBookmark} ${language === lang.code ? styles.active : ''}`}
          onClick={() => setLanguage(lang.code)}
          initial={{ x: -20, opacity: 0 }}
          animate={{ 
            x: language === lang.code ? 10 : 0, 
            opacity: 1,
            zIndex: language === lang.code ? 2 : 1,
          }}
          transition={{ 
            delay: index * 0.1,
            type: 'spring',
            stiffness: 300,
            damping: 20,
          }}
          whileHover={{ 
            x: language === lang.code ? 10 : 15,
            scale: 1.05,
          }}
          whileTap={{ scale: 0.95 }}
          aria-label={`Select ${lang.label}`}
          aria-pressed={language === lang.code}
        >
          <img 
            src={lang.flag} 
            alt="" 
            className={styles.flagImage}
            aria-hidden="true"
          />
          <span className={styles.flagLabel}>{lang.label}</span>
          
          {/* Bookmark ribbon effect */}
          {language === lang.code && (
            <motion.div
              className={styles.bookmarkRibbon}
              initial={{ height: 0 }}
              animate={{ height: '100%' }}
              transition={{ duration: 0.3 }}
              aria-hidden="true"
            />
          )}
        </motion.button>
      ))}
    </div>
  );
};
```

### CSS Module: `settingsModal.module.css`

```css
/* client/src/components/Settings/styles/settingsModal.module.css */

.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(20, 15, 10, 0.7);
  backdrop-filter: blur(4px);
  z-index: 1000;
}

.modalContainer {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1001;
  perspective: 2000px;
}

.diaryPage {
  position: relative;
  width: 700px;
  height: 600px;
  display: flex;
  box-shadow: 
    0 30px 60px rgba(0, 0, 0, 0.5),
    0 10px 20px rgba(0, 0, 0, 0.3);
}

.leatherBinding {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 40px;
  background-size: cover;
  background-repeat: no-repeat;
  border-radius: 8px 0 0 8px;
  z-index: 2;
  box-shadow: inset -5px 0 10px rgba(0, 0, 0, 0.3);
}

.pageBackground {
  position: absolute;
  inset: 0;
  left: 30px; /* Offset for binding */
  background-size: cover;
  background-color: #F5E6D3;
  border-radius: 0 8px 8px 0;
  padding: 40px 50px;
  overflow: hidden;
}

/* Add paper texture overlay */
.pageBackground::before {
  content: '';
  position: absolute;
  inset: 0;
  background: 
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(180, 160, 140, 0.1) 2px,
      rgba(180, 160, 140, 0.1) 4px
    );
  pointer-events: none;
  z-index: 0;
}

.pageHeader {
  position: relative;
  z-index: 1;
  text-align: center;
  margin-bottom: 30px;
}

.pageTitle {
  font-family: 'Caveat', cursive;
  font-size: 42px;
  color: #2C3E50;
  margin: 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

.decorationLine {
  width: 200px;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    #C9A961,
    transparent
  );
  margin: 10px auto;
}

.pageContent {
  position: relative;
  z-index: 1;
  max-height: 420px;
  overflow-y: auto;
  padding-right: 10px;
}

/* Custom scrollbar for webkit */
.pageContent::-webkit-scrollbar {
  width: 8px;
}

.pageContent::-webkit-scrollbar-track {
  background: rgba(180, 160, 140, 0.2);
  border-radius: 4px;
}

.pageContent::-webkit-scrollbar-thumb {
  background: #C9A961;
  border-radius: 4px;
}

.settingsSection {
  margin-bottom: 35px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  border: 1px solid rgba(180, 160, 140, 0.3);
}

.sectionTitle {
  font-family: 'Caveat', cursive;
  font-size: 26px;
  color: #34495E;
  margin: 0 0 15px 0;
}

.sectionDescription {
  font-family: 'Courier Prime', monospace;
  font-size: 14px;
  color: #5C4033;
  margin: 10px 0 0 0;
  font-style: italic;
}

/* Responsive */
@media (max-width: 768px) {
  .diaryPage {
    width: 95vw;
    height: 80vh;
    max-width: 500px;
    max-height: 600px;
  }

  .pageTitle {
    font-size: 32px;
  }

  .pageBackground {
    padding: 30px 30px;
  }
}
```

---

## 📱 Responsive Behavior

### Desktop (>1024px)
- Full diary page displayed (700x600px)
- All controls visible and interactive
- Hover states active
- Keyboard navigation fully supported

### Tablet (768px - 1024px)
- Slightly reduced size (600x500px)
- Controls maintain usability
- Touch-friendly targets (min 44px)

### Mobile (<768px)
- Modal takes 95% viewport width, 80% height
- Vertical layout optimization
- Larger touch targets
- Simplified visual details for performance
- Swipe gestures for page navigation (if multiple pages)

---

## ♿ Accessibility Features

### Keyboard Navigation
- **Tab**: Move between controls
- **Enter/Space**: Activate selected control
- **Arrow Keys**: Adjust values (volume, brightness)
- **ESC**: Close modal

### Screen Reader Support
- All controls have `aria-label` descriptions
- Current values announced (e.g., "Music volume: 70%")
- Modal announced as dialog with title
- Focus trapped within modal when open

### Visual Accessibility
- High contrast ratio (WCAG AA compliant)
- Focus indicators visible (golden outline)
- Reduced motion support via `prefers-reduced-motion`
- Brightness control helps users with light sensitivity

---

## 🎨 Asset Requirements

### Background Textures
1. **diary-bg.png** (800x600px)
   - Aged paper texture with subtle fibers
   - Slight discoloration at edges
   - Optional: Faint horizontal lines like ledger paper

2. **leather-binding.png** (40x600px)
   - Dark brown leather texture
   - Visible stitching along edge
   - Worn appearance

### Control Graphics
1. **radio-dial.svg**
   - Circular brass dial face
   - Numbered markings 0-100
   - Vintage art deco style

2. **gramophone-horn.svg**
   - Side view of gramophone horn
   - Crank handle visible
   - Ornate decorative patterns

3. **oil-lamp.svg**
   - Classic oil lamp silhouette
   - Visible flame area
   - Wick adjustment mechanism

4. **flag bookmarks** (en.svg, ru.svg, it.svg)
   - Rectangular flag icons (48x32px)
   - Ribbon tail at bottom
   - Period-appropriate flag designs

---

## ✅ Acceptance Criteria

### Functional
- [ ] Modal opens/closes smoothly with page-turn animation
- [ ] All 4 settings adjustable and persist across sessions
- [ ] Changes apply immediately (no "Apply" button needed)
- [ ] ESC key closes modal
- [ ] Click outside modal closes it
- [ ] Settings persist after browser refresh

### Visual
- [ ] Diary aesthetic consistent throughout
- [ ] Animations smooth at 60 FPS
- [ ] Page turn effect feels realistic
- [ ] Controls look tactile and interactive
- [ ] Color palette matches 1940s theme

### Accessibility
- [ ] Full keyboard navigation works
- [ ] Screen readers announce all controls correctly
- [ ] Focus states clearly visible
- [ ] Reduced motion preference respected
- [ ] Touch targets minimum 44x44px on mobile

### Performance
- [ ] Modal renders in under 200ms
- [ ] No layout shift during animations
- [ ] Assets optimized (<50KB total)
- [ ] No jank during drag interactions

---

## 🔧 Integration Points

### With Main Menu (Task 2.3)
```typescript
// When Pocket Watch clicked in main menu
const { openSettings } = useSettingsStore();
openSettings('general'); // Opens settings to general tab
```

### With Audio System
```typescript
// Listen for volume changes in audio manager
window.addEventListener('musicVolumeChange', (e: CustomEvent) => {
  audioManager.setMusicVolume(e.detail);
});

window.addEventListener('sfxVolumeChange', (e: CustomEvent) => {
  audioManager.setSFXVolume(e.detail);
});
```

### With Global Brightness
```css
/* In global styles */
:root {
  --brightness-filter: brightness(100%);
}

#root {
  filter: var(--brightness-filter);
}
```

---

## 🚀 Post-Implementation Checklist

1. **Test Persistence:**
   - [ ] Change settings, refresh page, verify they persist
   - [ ] Test in incognito mode (should use defaults)

2. **Test Edge Cases:**
   - [ ] Rapid dragging on dial/crank
   - [ ] Keyboard spamming (arrow keys)
   - [ ] Opening modal while already open
   - [ ] Browser resize during open modal

3. **Performance Audit:**
   - [ ] Check FPS during animations
   - [ ] Verify no memory leaks on open/close cycles
   - [ ] Test on low-end devices

4. **Accessibility Audit:**
   - [ ] Test with NVDA/VoiceOver
   - [ ] Verify keyboard-only navigation
   - [ ] Check color contrast ratios

---

**End of Task 2.4 Specification**
