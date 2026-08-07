# Task 2.6: Dynamic Menu Evolution - Detailed Implementation Specification

## 📋 Overview
**Priority:** P2 (Medium)  
**Estimated Time:** 4-5 hours  
**Goal:** The main menu evolves as the player progresses through chapters, adding new visual elements that reflect story progression.

---

## 🎯 Core Requirements

### 2.6.1 Evolution Concept

The main menu is not static—it grows and changes as the player experiences the story, creating a sense of continuity and accomplishment.

**Philosophy:**
- First launch: Menu feels incomplete, sketchy, like a story yet to be told
- After each chapter: New elements appear, making the world feel more alive
- Changes persist across sessions, rewarding continued play
- Visual progression mirrors narrative progression

### 2.6.2 Evolution Stages

| Stage | Trigger | Visual Changes | Atmosphere |
|-------|---------|----------------|------------|
| **Initial** | First launch | Faded/penciled appearance, minimal animation | Incomplete, mysterious |
| **After Ch. 1** | Chapter 1 complete | Birds flying, flowers bloom, bicycle appears | More lively, hopeful |
| **After Ch. 2** | Chapter 2 complete | Evening lamps on, new NPC in background, car drives by | Warmer, bustling |
| **After Ch. 3** | Chapter 3 complete | Boat on horizon, suitcase near door, vibrant colors | Complete, vibrant |

### 2.6.3 Specific Elements by Stage

#### Initial State (First Launch)
- **Background:** Slightly desaturated, pencil-sketch overlay
- **Characters:** Renzo & Elena present but muted
- **Animation:** Minimal (only essential loops)
- **Colors:** Muted palette, ~70% saturation
- **Feeling:** A story waiting to begin

#### After Chapter 1: "Awakening"
**New Elements:**
1. **Birds Flying**
   - 3-5 birds crossing the sky in V-formation
   - Looping animation from left to right
   - Subtle chirping audio (optional, respects mute)

2. **Flowers Bloom**
   - Foreground flowers gradually open petals
   - Color shifts from buds to full bloom
   - Positioned along bottom edge of panorama

3. **Bicycle Appears**
   - Renzo's bicycle materializes next to him
   - Leaning against invisible support
   - Same art style as other elements

**Atmosphere Change:**
- Saturation increases to 85%
- Birds add life to the sky
- Flowers bring color to foreground

#### After Chapter 2: "Evening Warmth"
**New Elements:**
1. **Evening Lighting**
   - Street lamps turn on (warm yellow glow)
   - Window lights appear in distant buildings
   - Sky shifts to warmer golden hour tones

2. **New NPC in Background**
   - Distant figure walking in town square
   - Simple looped walk cycle
   - Small but noticeable addition

3. **Car Drives By**
   - Vintage 1940s car crosses background road
   - Takes ~8 seconds to cross screen
   - Occurs every 30-45 seconds
   - Subtle engine sound (optional)

**Atmosphere Change:**
- Warm lighting creates cozy feeling
- Town feels more populated
- Time of day shifts to evening

#### After Chapter 3: "Full Life"
**New Elements:**
1. **Boat on Horizon**
   - Small fishing boat visible on sea
   - Gentle bobbing motion
   - Leaves subtle wake

2. **Suitcase Near Door**
   - Leather suitcase appears by Renzo's house door
   - Suggests upcoming travel/journey
   - Story foreshadowing element

3. **Vibrant Colors**
   - Full saturation (100%)
   - Richer shadows and highlights
   - World feels complete and alive

**Atmosphere Change:**
- Maximum visual richness
- Sense of anticipation for future chapters
- Menu feels like a complete living scene

---

## 🏗️ File Structure

```
client/src/
├── components/
│   └── MainMenu/
│       ├── CinemagraphBackground.tsx  # Base panorama with layers
│       ├── EvolutionLayers/
│       │   ├── index.ts               # Export all evolution components
│       │   ├── Chapter1Evolution.tsx  # Birds, flowers, bicycle
│       │   ├── Chapter2Evolution.tsx  # Lamps, NPC, car
│       │   ├── Chapter3Evolution.tsx  # Boat, suitcase, vibrance
│       │   └── styles/
│       │       └── evolution.module.css
│       └── MenuStateIndicator.tsx     # Shows current evolution stage
├── assets/
│   └── images/
│       └── menu-evolution/
│           ├── birds-sprite.png
│           ├── flower-bloom-sprite.png
│           ├── bicycle.svg
│           ├── lamp-glow.png
│           ├── npc-walk-sprite.png
│           ├── car-drive-sprite.png
│           ├── boat.svg
│           └── suitcase.svg
├── store/
│   └── progressionStore.ts            # Track chapter completion
└── hooks/
    └── useMenuEvolution.ts            # Custom hook for evolution logic
```

---

## 💻 Implementation Details

### Store: `progressionStore.ts`

```typescript
// client/src/store/progressionStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ChapterId = 1 | 2 | 3 | 4 | 5;

interface ProgressionState {
  // Chapter completion status
  completedChapters: ChapterId[];
  highestChapterReached: number;
  
  // Menu evolution state
  menuEvolutionStage: 0 | 1 | 2 | 3; // 0 = initial, 3 = complete
  
  // Actions
  completeChapter: (chapterId: ChapterId) => void;
  hasCompletedChapter: (chapterId: ChapterId) => boolean;
  hasCompletedAnyChapter: () => boolean;
  getMenuEvolutionStage: () => 0 | 1 | 2 | 3;
  resetProgression: () => void;
}

export const useProgressionStore = create<ProgressionState>()(
  persist(
    (set, get) => ({
      completedChapters: [],
      highestChapterReached: 0,
      menuEvolutionStage: 0,

      completeChapter: (chapterId) => set((state) => {
        const alreadyCompleted = state.completedChapters.includes(chapterId);
        
        if (alreadyCompleted) {
          return state;
        }

        const newCompletedChapters = [...state.completedChapters, chapterId].sort();
        const newHighest = Math.max(state.highestChapterReached, chapterId);
        
        // Calculate new evolution stage
        let newStage: 0 | 1 | 2 | 3 = 0;
        if (newCompletedChapters.includes(1)) newStage = 1;
        if (newCompletedChapters.includes(2)) newStage = 2;
        if (newCompletedChapters.includes(3)) newStage = 3;

        return {
          completedChapters: newCompletedChapters,
          highestChapterReached: newHighest,
          menuEvolutionStage: newStage,
        };
      }),

      hasCompletedChapter: (chapterId) => {
        return get().completedChapters.includes(chapterId);
      },

      hasCompletedAnyChapter: () => {
        return get().completedChapters.length > 0;
      },

      getMenuEvolutionStage: () => {
        return get().menuEvolutionStage;
      },

      resetProgression: () => set({
        completedChapters: [],
        highestChapterReached: 0,
        menuEvolutionStage: 0,
      }),
    }),
    {
      name: 'castelvento-progression',
      partialize: (state) => ({
        completedChapters: state.completedChapters,
        highestChapterReached: state.highestChapterReached,
        menuEvolutionStage: state.menuEvolutionStage,
      }),
    }
  )
);
```

### Hook: `useMenuEvolution.ts`

```typescript
// client/src/hooks/useMenuEvolution.ts

import { useMemo } from 'react';
import { useProgressionStore } from '../store/progressionStore';

interface EvolutionConfig {
  showBirds: boolean;
  showFlowers: boolean;
  showBicycle: boolean;
  showLamps: boolean;
  showNPC: boolean;
  showCar: boolean;
  showBoat: boolean;
  showSuitcase: boolean;
  saturationLevel: number; // 0.7 to 1.0
  hasSketchOverlay: boolean;
}

export const useMenuEvolution = (): EvolutionConfig => {
  const stage = useProgressionStore((state) => state.menuEvolutionStage);
  const hasAnyProgress = useProgressionStore((state) => state.hasCompletedAnyChapter());

  return useMemo(() => {
    // Initial state (first launch, no progress)
    if (!hasAnyProgress) {
      return {
        showBirds: false,
        showFlowers: false,
        showBicycle: false,
        showLamps: false,
        showNPC: false,
        showCar: false,
        showBoat: false,
        showSuitcase: false,
        saturationLevel: 0.7,
        hasSketchOverlay: true,
      };
    }

    // Stage 1: After Chapter 1
    if (stage === 1) {
      return {
        showBirds: true,
        showFlowers: true,
        showBicycle: true,
        showLamps: false,
        showNPC: false,
        showCar: false,
        showBoat: false,
        showSuitcase: false,
        saturationLevel: 0.85,
        hasSketchOverlay: false,
      };
    }

    // Stage 2: After Chapter 2
    if (stage === 2) {
      return {
        showBirds: true,
        showFlowers: true,
        showBicycle: true,
        showLamps: true,
        showNPC: true,
        showCar: true,
        showBoat: false,
        showSuitcase: false,
        saturationLevel: 0.95,
        hasSketchOverlay: false,
      };
    }

    // Stage 3: After Chapter 3 (Complete)
    return {
      showBirds: true,
      showFlowers: true,
      showBicycle: true,
      showLamps: true,
      showNPC: true,
      showCar: true,
      showBoat: true,
      showSuitcase: true,
      saturationLevel: 1.0,
      hasSketchOverlay: false,
    };
  }, [stage, hasAnyProgress]);
};
```

### Component: `Chapter1Evolution.tsx`

```typescript
// client/src/components/MainMenu/EvolutionLayers/Chapter1Evolution.tsx

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import birdsSprite from '../../../assets/images/menu-evolution/birds-sprite.png';
import flowerSprites from '../../../assets/images/menu-evolution/flower-bloom-sprite.png';
import bicycleSVG from '../../../assets/images/menu-evolution/bicycle.svg';
import styles from './styles/evolution.module.css';

interface Chapter1EvolutionProps {
  isVisible: boolean;
}

export const Chapter1Evolution: React.FC<Chapter1EvolutionProps> = memo(({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className={styles.evolutionLayer} aria-hidden="true">
      {/* Birds Flying */}
      <motion.div
        className={styles.birdsFlock}
        initial={{ x: -200, opacity: 0 }}
        animate={{ 
          x: ['100vw'],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatDelay: 10,
          ease: 'linear',
        }}
      >
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className={styles.bird}
            style={{
              backgroundImage: `url(${birdsSprite})`,
              backgroundSize: 'contain',
              width: `${20 + i * 5}px`,
              height: `${20 + i * 5}px`,
              marginLeft: `${30 + i * 10}px`,
              marginTop: `${i * 10 - 20}px`,
            }}
            animate={{
              y: [0, -10, 0, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>

      {/* Blooming Flowers */}
      <div className={styles.flowersContainer}>
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className={styles.flower}
            initial={{ scale: 0.3, rotate: -10 }}
            animate={{ 
              scale: 1, 
              rotate: 0,
              filter: 'hue-rotate(0deg)',
            }}
            transition={{
              duration: 3,
              delay: i * 0.3,
              ease: 'easeOut',
            }}
            style={{
              left: `${10 + i * 12}%`,
              backgroundImage: `url(${flowerSprites})`,
              backgroundPosition: `${i * 50}px 0`,
            }}
          />
        ))}
      </div>

      {/* Bicycle Next to Renzo */}
      <motion.img
        src={bicycleSVG}
        alt=""
        className={styles.bicycle}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 2,
          delay: 0.5,
          ease: 'easeOut',
        }}
      />
    </div>
  );
});

Chapter1Evolution.displayName = 'Chapter1Evolution';
```

### Component: `Chapter2Evolution.tsx`

```typescript
// client/src/components/MainMenu/EvolutionLayers/Chapter2Evolution.tsx

import React, { memo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import lampGlowPNG from '../../../assets/images/menu-evolution/lamp-glow.png';
import npcSprite from '../../../assets/images/menu-evolution/npc-walk-sprite.png';
import carSprite from '../../../assets/images/menu-evolution/car-drive-sprite.png';
import styles from './styles/evolution.module.css';

interface Chapter2EvolutionProps {
  isVisible: boolean;
}

export const Chapter2Evolution: React.FC<Chapter2EvolutionProps> = memo(({ isVisible }) => {
  const [showCar, setShowCar] = useState(false);

  // Car appears periodically
  useEffect(() => {
    if (!isVisible) return;

    const carInterval = setInterval(() => {
      setShowCar(true);
      setTimeout(() => setShowCar(false), 8000); // Car takes 8s to cross
    }, 45000); // Every 45 seconds

    return () => clearInterval(carInterval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className={styles.evolutionLayer} aria-hidden="true">
      {/* Street Lamps Turning On */}
      <div className={styles.lampsContainer}>
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className={styles.lamp}
            initial={{ opacity: 0.3 }}
            animate={{ 
              opacity: 1,
              filter: 'brightness(1.2)',
            }}
            transition={{
              duration: 2,
              delay: i * 0.3,
              ease: 'easeOut',
            }}
            style={{
              left: `${15 + i * 15}%`,
              top: `${40 + (i % 2) * 10}%`,
            }}
          >
            <div 
              className={styles.lampGlow}
              style={{ 
                backgroundImage: `url(${lampGlowPNG})`,
                backgroundSize: 'contain',
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Window Lights */}
      <div className={styles.windowLights}>
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className={styles.windowLight}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{
              duration: 1.5,
              delay: i * 0.2,
            }}
            style={{
              left: `${20 + (i % 4) * 15}%`,
              top: `${30 + Math.floor(i / 4) * 20}%`,
            }}
          />
        ))}
      </div>

      {/* Distant NPC Walking */}
      <motion.div
        className={styles.npcWalker}
        initial={{ x: '100%', opacity: 0 }}
        animate={{ 
          x: ['-100%'],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          repeatDelay: 15,
          ease: 'linear',
        }}
        style={{
          backgroundImage: `url(${npcSprite})`,
          backgroundSize: 'contain',
          bottom: '25%',
        }}
      />

      {/* Car Driving By */}
      {showCar && (
        <motion.div
          className={styles.carDriver}
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            duration: 8,
            ease: 'linear',
          }}
          style={{
            backgroundImage: `url(${carSprite})`,
            backgroundSize: 'contain',
            bottom: '22%',
          }}
        />
      )}
    </div>
  );
});

Chapter2Evolution.displayName = 'Chapter2Evolution';
```

### Component: `Chapter3Evolution.tsx`

```typescript
// client/src/components/MainMenu/EvolutionLayers/Chapter3Evolution.tsx

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import boatSVG from '../../../assets/images/menu-evolution/boat.svg';
import suitcaseSVG from '../../../assets/images/menu-evolution/suitcase.svg';
import styles from './styles/evolution.module.css';

interface Chapter3EvolutionProps {
  isVisible: boolean;
}

export const Chapter3Evolution: React.FC<Chapter3EvolutionProps> = memo(({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className={styles.evolutionLayer} aria-hidden="true">
      {/* Boat on Horizon */}
      <motion.div
        className={styles.boat}
        initial={{ x: '100%', opacity: 0 }}
        animate={{ 
          x: ['-20%'],
          opacity: [0, 1],
          y: [0, -5, 0, 5, 0], // Bobbing motion
        }}
        transition={{
          x: {
            duration: 60,
            repeat: Infinity,
            ease: 'linear',
          },
          y: {
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        style={{
          bottom: '35%',
          right: '10%',
        }}
      >
        <img 
          src={boatSVG} 
          alt="" 
          className={styles.boatImage}
        />
        
        {/* Wake effect */}
        <div className={styles.boatWake} />
      </motion.div>

      {/* Suitcase Near Door */}
      <motion.div
        className={styles.suitcase}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 2,
          delay: 1,
          ease: 'easeOut',
        }}
        style={{
          // Position near Renzo's house door
          bottom: '18%',
          left: '65%',
        }}
      >
        <img 
          src={suitcaseSVG} 
          alt="" 
          className={styles.suitcaseImage}
        />
      </motion.div>

      {/* Global Vibrance Boost */}
      <div className={styles.vibranceOverlay} />
    </div>
  );
});

Chapter3Evolution.displayName = 'Chapter3Evolution';
```

### CSS Module: `evolution.module.css`

```css
/* client/src/components/MainMenu/EvolutionLayers/styles/evolution.module.css */

.evolutionLayer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
  overflow: hidden;
}

/* Birds */
.birdsFlock {
  position: absolute;
  top: 15%;
  display: flex;
  align-items: center;
}

.bird {
  background-repeat: no-repeat;
}

/* Flowers */
.flowersContainer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
}

.flower {
  position: absolute;
  bottom: 0;
  width: 50px;
  height: 50px;
  background-size: contain;
  background-repeat: no-repeat;
  transform-origin: bottom center;
}

/* Bicycle */
.bicycle {
  position: absolute;
  bottom: 15%;
  left: 48%;
  width: 120px;
  height: 80px;
}

/* Lamps */
.lampsContainer {
  position: absolute;
  inset: 0;
}

.lamp {
  position: absolute;
  width: 60px;
  height: 80px;
}

.lampGlow {
  width: 100%;
  height: 100%;
  animation: flicker 3s infinite;
}

@keyframes flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.95; }
  75% { opacity: 0.98; }
}

/* Window Lights */
.windowLights {
  position: absolute;
  inset: 0;
}

.windowLight {
  position: absolute;
  width: 8px;
  height: 12px;
  background: rgba(255, 220, 150, 0.8);
  border-radius: 2px;
  box-shadow: 0 0 10px rgba(255, 220, 150, 0.6);
}

/* NPC Walker */
.npcWalker {
  position: absolute;
  width: 40px;
  height: 60px;
  opacity: 0.7;
}

/* Car Driver */
.carDriver {
  position: absolute;
  width: 120px;
  height: 50px;
  opacity: 0.8;
}

/* Boat */
.boat {
  position: absolute;
  width: 80px;
  height: 40px;
}

.boatImage {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.boatWake {
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 10px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: wakePulse 2s infinite;
}

@keyframes wakePulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

/* Suitcase */
.suitcase {
  position: absolute;
  width: 40px;
  height: 50px;
}

.suitcaseImage {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Vibrance Overlay */
.vibranceOverlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 200, 150, 0.1),
    transparent 50%,
    rgba(150, 200, 255, 0.05)
  );
  mix-blend-mode: overlay;
  pointer-events: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .bird {
    transform: scale(0.7);
  }

  .flower {
    width: 35px;
    height: 35px;
  }

  .bicycle {
    width: 80px;
    height: 55px;
  }

  .boat {
    width: 50px;
    height: 25px;
  }

  .suitcase {
    width: 25px;
    height: 30px;
  }
}
```

### Main Menu Integration

```typescript
// client/src/components/MainMenu/CinemagraphBackground.tsx

import React, { memo } from 'react';
import { useMenuEvolution } from '../../hooks/useMenuEvolution';
import { Chapter1Evolution } from './EvolutionLayers/Chapter1Evolution';
import { Chapter2Evolution } from './EvolutionLayers/Chapter2Evolution';
import { Chapter3Evolution } from './EvolutionLayers/Chapter3Evolution';
import basePanorama from '../../assets/images/menu/panorama-base.png';
import styles from './styles/cinemagraphBackground.module.css';

export const CinemagraphBackground: React.FC = memo(() => {
  const evolution = useMenuEvolution();

  return (
    <div 
      className={styles.backgroundContainer}
      style={{
        filter: `saturate(${evolution.saturationLevel * 100}%)`,
      }}
    >
      {/* Base Panorama Layer */}
      <div 
        className={styles.basePanorama}
        style={{ backgroundImage: `url(${basePanorama})` }}
      />

      {/* Sketch Overlay (only on first launch) */}
      {evolution.hasSketchOverlay && (
        <div className={styles.sketchOverlay} />
      )}

      {/* Evolution Layers */}
      <Chapter1Evolution isVisible={evolution.showBirds || evolution.showFlowers || evolution.showBicycle} />
      <Chapter2Evolution isVisible={evolution.showLamps || evolution.showNPC || evolution.showCar} />
      <Chapter3Evolution isVisible={evolution.showBoat || evolution.showSuitcase} />

      {/* Animated Base Elements (always present) */}
      {/* Sea waves, flags, smoke, etc. from Task 2.1 */}
    </div>
  );
});
```

---

## ♿ Accessibility Considerations

### Reduced Motion
```typescript
// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// In components:
transition={{
  duration: prefersReducedMotion ? 0 : 2,
  repeat: prefersReducedMotion ? 0 : Infinity,
}}
```

### Screen Reader Announcements
```typescript
// Announce menu evolution changes
useEffect(() => {
  if (stage > 0) {
    const announcement = `Castelvento has grown. New details have appeared in the town.`;
    const liveRegion = document.getElementById('aria-live-region');
    if (liveRegion) {
      liveRegion.textContent = announcement;
    }
  }
}, [stage]);
```

---

## ✅ Acceptance Criteria

### Functional
- [ ] Menu starts in "sketchy" initial state on first launch
- [ ] Completing Chapter 1 adds birds, flowers, and bicycle
- [ ] Completing Chapter 2 adds lamps, NPC, and car
- [ ] Completing Chapter 3 adds boat, suitcase, and full vibrance
- [ ] Changes persist after browser refresh
- [ ] Progression saves correctly to localStorage

### Visual
- [ ] Initial state has noticeable sketch/pencil overlay
- [ ] Each evolution stage is visibly distinct
- [ ] Animations are smooth at 60 FPS
- [ ] Saturation changes are gradual and noticeable
- [ ] New elements blend seamlessly with base art

### Performance
- [ ] No performance degradation with all elements active
- [ ] Sprites optimized for web (<100KB total)
- [ ] Animations don't cause layout shifts
- [ ] Memory usage stable over time

### Edge Cases
- [ ] Works if player skips chapters (out of order completion)
- [ ] Handles save data import/export correctly
- [ ] Gracefully degrades on low-end devices
- [ ] Respects reduced motion preferences

---

## 🔧 Integration Points

### With Save System
```typescript
// When chapter completes
const completeChapter = (chapterId: ChapterId) => {
  saveGame.progression.completedChapters.push(chapterId);
  useProgressionStore.getState().completeChapter(chapterId);
};
```

### With Audio System
```typescript
// Optional: Add ambient sounds based on evolution stage
useEffect(() => {
  if (evolution.showBirds) {
    audioManager.addAmbientLayer('birds-chirping', { volume: 0.3 });
  }
  if (evolution.showCar) {
    audioManager.addAmbientLayer('distant-car', { volume: 0.2, intermittent: true });
  }
}, [evolution]);
```

---

## 🚀 Post-Implementation Checklist

1. **Testing Progression:**
   - [ ] Start new game, verify initial state
   - [ ] Complete Chapter 1, check evolution
   - [ ] Complete Chapter 2, verify additions
   - [ ] Complete Chapter 3, confirm full state
   - [ ] Refresh browser, ensure persistence

2. **Performance Testing:**
   - [ ] Run with all evolution layers active
   - [ ] Check FPS on mid-range devices
   - [ ] Monitor memory usage over 10+ minutes
   - [ ] Test on mobile devices

3. **Accessibility Testing:**
   - [ ] Enable reduced motion, verify behavior
   - [ ] Test with screen reader
   - [ ] Verify color contrast at all stages

---

**End of Task 2.6 Specification**
