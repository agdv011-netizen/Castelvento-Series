# Task 2.1: Main Menu Background (Cinemagraph) — Detailed Implementation Specification

## 🎯 Goal
Create a living, breathing panoramic cinemagraph of Castelvento that serves as the main menu background. The scene must dynamically change based on real-world time (Morning/Afternoon/Evening/Night) with subtle looping animations that create an immersive 1940s Italian coastal town atmosphere.

---

## 📁 File Structure

```
client/src/features/main-menu/
├── components/
│   ├── CinemagraphBackground.tsx       # Main container component
│   ├── TimeVariantLayer.tsx            # Wrapper for time-based variants
│   ├── AnimatedElement.tsx             # Reusable animated element wrapper
│   └── ParallaxLayer.tsx               # Parallax scrolling layer component
├── assets/
│   ├── backgrounds/
│   │   ├── castelvento-panorama-morning.png
│   │   ├── castelvento-panorama-afternoon.png
│   │   ├── castelvento-panorama-evening.png
│   │   └── castelvento-panorama-night.png
│   ├── layers/
│   │   ├── sky-morning.png
│   │   ├── sky-afternoon.png
│   │   ├── sky-evening.png
│   │   ├── sky-night.png
│   │   ├── buildings.png
│   │   ├── foreground.png
│   │   ├── sea.png
│   │   ├── waves.png
│   │   ├── flags.png
│   │   ├── birds.png
│   │   ├── smoke.png
│   │   ├── window-lights.png
│   │   ├── train.png
│   │   ├── lighthouse-beam.png
│   │   └── leaves.png
│   └── sprites/
│       ├── bird-sprite.png
│       ├── train-sprite.png
│       └── lighthouse-sprite.png
├── hooks/
│   ├── useTimeOfDay.ts                 # Hook to determine current time variant
│   ├── useParallaxScroll.ts           # Hook for mouse-based parallax effect
│   └── useAnimationLoop.ts            # Hook for managing animation loops
├── store/
│   └── menuStore.ts                    # Zustand store for menu state
├── constants/
│   └── timeVariants.ts                 # Time variant configurations
└── styles/
    └── cinemagraph.module.css          # Component-specific styles
```

---

## 🏗️ Component Architecture

### 1. CinemagraphBackground.tsx (Main Container)

**Purpose:** Root component that orchestrates all layers and manages time-based transitions.

**Implementation Details:**

```typescript
import React, { useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimeOfDay } from '../hooks/useTimeOfDay';
import { ParallaxLayer } from './ParallaxLayer';
import { AnimatedElement } from './AnimatedElement';
import { TIME_VARIANTS, TimeVariant } from '../constants/timeVariants';
import styles from '../styles/cinemagraph.module.css';

interface CinemagraphBackgroundProps {
  isMobile?: boolean;
  simplifiedMode?: boolean;
}

export const CinemagraphBackground: React.FC<CinemagraphBackgroundProps> = ({
  isMobile = false,
  simplifiedMode = false,
}) => {
  const timeVariant = useTimeOfDay(); // Returns 'morning' | 'afternoon' | 'evening' | 'night'
  
  // Memoize variant config to prevent unnecessary re-renders
  const variantConfig = useMemo(() => TIME_VARIANTS[timeVariant], [timeVariant]);

  // Handle smooth transition between time variants
  const handleTimeChange = useCallback((newTime: TimeVariant) => {
    // Trigger gradual fade transition (not instant cut)
    // Use CSS opacity transition over 2-3 seconds
  }, []);

  return (
    <div className={styles.cinemagraphContainer}>
      {/* Base Panorama Layer */}
      <ParallaxLayer
        depth={0}
        image={variantConfig.panoramaImage}
        alt="Castelvento Panorama"
        className={styles.baseLayer}
      />

      {/* Sky Layer with Gradient Overlay */}
      <ParallaxLayer
        depth={0.1}
        image={variantConfig.skyImage}
        alt="Sky"
        className={styles.skyLayer}
        transitionDuration={variantConfig.transitionDuration}
      />

      {/* Sea/Waves Layer */}
      <AnimatedElement
        animationType="wave"
        duration={variantConfig.waveSpeed}
        easing="easeInOut"
        isMobile={isMobile}
        simplified={simplifiedMode}
      >
        <ParallaxLayer
          depth={0.3}
          image={variantConfig.seaImage}
          alt="Sea"
          className={styles.seaLayer}
        />
      </AnimatedElement>

      {/* Buildings Layer */}
      <ParallaxLayer
        depth={0.5}
        image={variantConfig.buildingsImage}
        alt="Buildings"
        className={styles.buildingsLayer}
      />

      {/* Animated Elements Group */}
      <AnimatePresence>
        {/* Flags */}
        {!simplifiedMode && (
          <AnimatedElement
            animationType="sway"
            duration={3 + Math.random() * 2} // Randomize slightly for natural feel
            position={{ x: 120, y: 80 }}
          >
            <img src="/assets/layers/flags.png" alt="Flags" className={styles.flag} />
          </AnimatedElement>
        )}

        {/* Birds */}
        {!simplifiedMode && (
          <AnimatedElement
            animationType="fly"
            duration={15 + Math.random() * 10}
            position={{ x: -100, y: 50 }}
            loopDelay={Math.random() * 5}
          >
            <img src="/assets/sprites/bird-sprite.png" alt="Birds" className={styles.birds} />
          </AnimatedElement>
        )}

        {/* Smoke from Chimneys */}
        {!simplifiedMode && (
          <>
            <AnimatedElement
              animationType="rise"
              duration={4}
              position={{ x: 300, y: 150 }}
            >
              <img src="/assets/layers/smoke.png" alt="Smoke" className={styles.smoke} />
            </AnimatedElement>
            <AnimatedElement
              animationType="rise"
              duration={5}
              position={{ x: 450, y: 180 }}
            >
              <img src="/assets/layers/smoke.png" alt="Smoke" className={styles.smoke} />
            </AnimatedElement>
          </>
        )}

        {/* Window Lights (Night Only) */}
        {timeVariant === 'night' && (
          <AnimatedElement
            animationType="flicker"
            duration={0.5 + Math.random() * 0.5}
            intensity={0.3}
          >
            <ParallaxLayer
              depth={0.6}
              image={variantConfig.windowLightsImage}
              alt="Window Lights"
              className={styles.windowLights}
              blendMode="screen"
            />
          </AnimatedElement>
        )}

        {/* Distant Train (Afternoon/Evening) */}
        {(timeVariant === 'afternoon' || timeVariant === 'evening') && !simplifiedMode && (
          <AnimatedElement
            animationType="moveHorizontal"
            duration={20}
            startPosition={{ x: -200, y: 250 }}
            endPosition={{ x: 1200, y: 250 }}
            loopDelay={30} // Long delay between trains
          >
            <img src="/assets/sprites/train-sprite.png" alt="Train" className={styles.train} />
          </AnimatedElement>
        )}

        {/* Lighthouse Beam (Night Only) */}
        {timeVariant === 'night' && (
          <AnimatedElement
            animationType="rotate"
            duration={4}
            position={{ x: 800, y: 100 }}
            origin="center"
          >
            <img src="/assets/layers/lighthouse-beam.png" alt="Lighthouse Beam" className={styles.lighthouseBeam} />
          </AnimatedElement>
        )}

        {/* Leaves Rustling */}
        {!simplifiedMode && (
          <AnimatedElement
            animationType="rustle"
            duration={2 + Math.random()}
            position={{ x: 50, y: 300 }}
          >
            <img src="/assets/layers/leaves.png" alt="Leaves" className={styles.leaves} />
          </AnimatedElement>
        )}
      </AnimatePresence>

      {/* Foreground Layer (Depth) */}
      <ParallaxLayer
        depth={0.9}
        image={variantConfig.foregroundImage}
        alt="Foreground"
        className={styles.foregroundLayer}
      />

      {/* Slow Camera Pan Overlay */}
      <motion.div
        className={styles.cameraPanOverlay}
        animate={{
          x: [0, 20, 0],
          y: [0, 10, 0],
        }}
        transition={{
          duration: 60, // Extremely slow pan
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
};
```

---

### 2. useTimeOfDay.ts Hook

**Purpose:** Determine current time variant based on system clock and manage smooth transitions.

**Implementation:**

```typescript
import { useState, useEffect, useCallback } from 'react';
import type { TimeVariant } from '../constants/timeVariants';

export const useTimeOfDay = (): TimeVariant => {
  const [timeVariant, setTimeVariant] = useState<TimeVariant>(() => getCurrentTimeVariant());

  const getCurrentTimeVariant = (): TimeVariant => {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  };

  useEffect(() => {
    // Check every minute for time changes
    const interval = setInterval(() => {
      const newVariant = getCurrentTimeVariant();
      setTimeVariant(prev => {
        if (prev !== newVariant) {
          // Dispatch event for smooth transition handling
          window.dispatchEvent(new CustomEvent('timeVariantChange', { detail: newVariant }));
        }
        return newVariant;
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return timeVariant;
};
```

---

### 3. ParallaxLayer.tsx Component

**Purpose:** Create parallax scrolling effect based on mouse/touch position.

**Implementation:**

```typescript
import React, { useRef, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface ParallaxLayerProps {
  depth: number; // 0 = no parallax, 1 = maximum parallax
  image: string;
  alt: string;
  className?: string;
  blendMode?: React.CSSProperties['mixBlendMode'];
  transitionDuration?: number;
}

export const ParallaxLayer: React.FC<ParallaxLayerProps> = ({
  depth,
  image,
  alt,
  className,
  blendMode = 'normal',
  transitionDuration = 0.3,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Mouse/touch position motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics for natural movement
  const springX = useSpring(mouseX, { stiffness: 100, damping: 30, mass: 1 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30, mass: 1 });

  // Transform based on depth
  const x = useTransform(springX, [-1, 1], [-depth * 50, depth * 50]);
  const y = useTransform(springY, [-1, 1], [-depth * 30, depth * 30]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1; // Normalize to -1 to 1
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    
    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!containerRef.current || e.touches.length === 0) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((touch.clientY - rect.top) / rect.height) * 2 - 1;
    
    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      ref={containerRef}
      className={className}
      style={{
        backgroundImage: `url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        mixBlendMode: blendMode,
        x,
        y,
        willChange: 'transform', // Optimize for animation
      }}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      aria-label={alt}
    />
  );
};
```

---

### 4. AnimatedElement.tsx Component

**Purpose:** Reusable wrapper for various animation types (wave, sway, fly, rise, flicker, rotate, rustle).

**Implementation:**

```typescript
import React from 'react';
import { motion, Variants } from 'framer-motion';

type AnimationType = 'wave' | 'sway' | 'fly' | 'rise' | 'flicker' | 'rotate' | 'rustle' | 'moveHorizontal';

interface AnimatedElementProps {
  animationType: AnimationType;
  duration: number;
  children: React.ReactNode;
  position?: { x: number; y: number };
  startPosition?: { x: number; y: number };
  endPosition?: { x: number; y: number };
  easing?: string;
  loopDelay?: number;
  intensity?: number;
  isMobile?: boolean;
  simplified?: boolean;
  origin?: string;
}

export const AnimatedElement: React.FC<AnimatedElementProps> = ({
  animationType,
  duration,
  children,
  position,
  startPosition,
  endPosition,
  easing = 'easeInOut',
  loopDelay = 0,
  intensity = 1,
  isMobile = false,
  simplified = false,
  origin = 'bottom',
}) => {
  // Reduce complexity on mobile or simplified mode
  if (simplified) {
    duration *= 1.5; // Slower animations
    intensity *= 0.7; // Reduced intensity
  }

  const variants: Record<AnimationType, Variants> = {
    wave: {
      animate: {
        rotate: [0, 5 * intensity, 0, -5 * intensity, 0],
        y: [0, 3 * intensity, 0],
      },
    },
    sway: {
      animate: {
        rotate: [0, 10 * intensity, 0, -10 * intensity, 0],
        origin: origin,
      },
    },
    fly: {
      animate: {
        x: [-100, window.innerWidth + 100],
        y: [0, -20 * intensity, 0, 20 * intensity, 0],
      },
    },
    rise: {
      animate: {
        y: [0, -100 * intensity],
        opacity: [1, 0.8, 0.6, 0.4, 0],
        scale: [1, 1.2, 1.4],
      },
    },
    flicker: {
      animate: {
        opacity: [1, 0.7, 1, 0.8, 1, 0.9, 1],
      },
    },
    rotate: {
      animate: {
        rotate: [0, 360],
        origin: origin,
      },
    },
    rustle: {
      animate: {
        rotate: [0, 3 * intensity, 0, -3 * intensity, 0],
        scale: [1, 1.02, 1, 0.98, 1],
      },
    },
    moveHorizontal: {
      animate: {
        x: [startPosition?.x ?? 0, endPosition?.x ?? 100],
        y: [startPosition?.y ?? 0, endPosition?.y ?? 0],
      },
    },
  };

  return (
    <motion.div
      initial={position ? { x: position.x, y: position.y } : {}}
      animate={variants[animationType].animate}
      transition={{
        duration,
        repeat: Infinity,
        ease: easing,
        delay: loopDelay,
      }}
      style={{
        position: 'absolute',
        ...(position && !['fly', 'moveHorizontal'].includes(animationType) && {
          left: position.x,
          top: position.y,
        }),
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </motion.div>
  );
};
```

---

### 5. useTimeOfDay.ts Constants Configuration

**File:** `constants/timeVariants.ts`

```typescript
export type TimeVariant = 'morning' | 'afternoon' | 'evening' | 'night';

export interface TimeVariantConfig {
  panoramaImage: string;
  skyImage: string;
  seaImage: string;
  buildingsImage: string;
  foregroundImage: string;
  windowLightsImage?: string;
  ambientSound: string;
  transitionDuration: number; // seconds
  waveSpeed: number; // seconds per cycle
  particleCount: number;
}

export const TIME_VARIANTS: Record<TimeVariant, TimeVariantConfig> = {
  morning: {
    panoramaImage: '/assets/backgrounds/castelvento-panorama-morning.png',
    skyImage: '/assets/layers/sky-morning.png',
    seaImage: '/assets/layers/sea-morning.png',
    buildingsImage: '/assets/layers/buildings-morning.png',
    foregroundImage: '/assets/layers/foreground-morning.png',
    ambientSound: '/audio/ambience/morning-birds.mp3',
    transitionDuration: 3,
    waveSpeed: 4,
    particleCount: 100,
  },
  afternoon: {
    panoramaImage: '/assets/backgrounds/castelvento-panorama-afternoon.png',
    skyImage: '/assets/layers/sky-afternoon.png',
    seaImage: '/assets/layers/sea-afternoon.png',
    buildingsImage: '/assets/layers/buildings-afternoon.png',
    foregroundImage: '/assets/layers/foreground-afternoon.png',
    ambientSound: '/audio/ambience/afternoon-market.mp3',
    transitionDuration: 3,
    waveSpeed: 3.5,
    particleCount: 120,
  },
  evening: {
    panoramaImage: '/assets/backgrounds/castelvento-panorama-evening.png',
    skyImage: '/assets/layers/sky-evening.png',
    seaImage: '/assets/layers/sea-evening.png',
    buildingsImage: '/assets/layers/buildings-evening.png',
    foregroundImage: '/assets/layers/foreground-evening.png',
    ambientSound: '/audio/ambience/evening-cafe.mp3',
    transitionDuration: 3,
    waveSpeed: 4.5,
    particleCount: 80,
  },
  night: {
    panoramaImage: '/assets/backgrounds/castelvento-panorama-night.png',
    skyImage: '/assets/layers/sky-night.png',
    seaImage: '/assets/layers/sea-night.png',
    buildingsImage: '/assets/layers/buildings-night.png',
    foregroundImage: '/assets/layers/foreground-night.png',
    windowLightsImage: '/assets/layers/window-lights.png',
    ambientSound: '/audio/ambience/night-crickets.mp3',
    transitionDuration: 4,
    waveSpeed: 5,
    particleCount: 50,
  },
};
```

---

## 🎨 Asset Requirements

### Background Panoramas (4 Variants)
- **Resolution:** 3840x1080px (ultrawide for desktop), 1920x1080px (mobile crop)
- **Format:** PNG with transparency support
- **Style:** Hand-painted watercolor aesthetic, 1940s Italian coastal town
- **Layers Needed:**
  - Sky gradient
  - Distant mountains/hills
  - Town buildings (multiple depths)
  - Sea/ocean
  - Foreground elements (plants, rocks, etc.)

### Animated Element Sprites
1. **Birds:** Sprite sheet with 4-6 frames of flapping motion
2. **Train:** Side-view sprite with wheel rotation (8 frames)
3. **Flags:** 3-4 frames of wind movement
4. **Smoke:** Rising particle sequence (6 frames)
5. **Lighthouse Beam:** Rotating light cone (12 frames for smooth rotation)
6. **Leaves:** Rustling animation (4 frames)

### Audio Assets
- Morning: Birds chirping, gentle waves, distant church bell
- Afternoon: Market chatter, seagulls, bicycle bells, waves
- Evening: Café music (accordion), laughter, clinking glasses, waves
- Night: Crickets, owls, distant waves, occasional train whistle

---

## ⚙️ Technical Implementation Steps

### Step 1: Set Up Project Structure
1. Create directory structure under `client/src/features/main-menu/`
2. Install required dependencies (if not already present):
   - `framer-motion` (already in project)
   - `howler` (for audio, if not present)
3. Create placeholder asset files

### Step 2: Implement Core Hooks
1. Create `useTimeOfDay.ts` hook with time detection logic
2. Create `useParallaxScroll.ts` hook for mouse tracking
3. Create `useAnimationLoop.ts` hook for performance optimization

### Step 3: Build Base Components
1. Implement `ParallaxLayer.tsx` with Framer Motion transforms
2. Implement `AnimatedElement.tsx` with all animation types
3. Implement `TimeVariantLayer.tsx` for smooth transitions

### Step 4: Assemble CinemagraphBackground
1. Import all layers and components
2. Configure layer depths for proper parallax
3. Add time-based conditional rendering
4. Implement smooth crossfade transitions (CSS opacity over 2-4 seconds)

### Step 5: Mobile Optimization
1. Detect mobile via user agent or screen width
2. Reduce particle count by 50%
3. Simplify animations (fewer simultaneous elements)
4. Use smaller resolution assets
5. Disable parallax on low-end devices (optional)

### Step 6: Performance Optimization
1. Use `will-change` CSS property on animated elements
2. Implement `requestAnimationFrame` for custom animations
3. Lazy load off-screen elements
4. Use `React.memo()` on static layers
5. Implement visibility detection (pause animations when tab inactive)

### Step 7: Audio Integration
1. Preload ambient sounds for current time variant
2. Crossfade audio when time changes
3. Respect user's volume settings from Zustand store
4. Handle mobile autoplay policies (require user interaction first)

### Step 8: Testing & Polish
1. Test all four time variants manually (mock system time)
2. Verify smooth transitions (no hard cuts)
3. Profile FPS on desktop and mobile devices
4. Test with reduced motion preferences (`prefers-reduced-motion`)
5. Ensure accessibility (ARIA labels, keyboard navigation)

---

## 🎯 Acceptance Criteria

### Functional Requirements
- [ ] Background displays full panoramic view of Castelvento
- [ ] All 8 animated elements implemented and looping smoothly
- [ ] Time-of-day detection works automatically based on system clock
- [ ] Transitions between time variants are gradual (2-4 second crossfade)
- [ ] Parallax effect responds to mouse/touch movement
- [ ] Camera pan is extremely slow and barely noticeable
- [ ] Mobile version shows simplified animation set
- [ ] Performance maintains 60 FPS on modern devices
- [ ] Performance degrades gracefully on older devices

### Visual Requirements
- [ ] Art style matches 1940s hand-painted watercolor aesthetic
- [ ] All animations loop seamlessly (no visible jumps)
- [ ] Colors and lighting match time of day accurately
- [ ] Layered parallax creates convincing depth
- [ ] No UI elements visible (pure cinemagraph)

### Technical Requirements
- [ ] Component is fully responsive (1920x1080 to 320x568)
- [ ] Assets lazy load to prevent initial lag
- [ ] Memory usage stays under 200MB
- [ ] No memory leaks detected after 10+ minutes
- [ ] Works in all major browsers (Chrome, Firefox, Safari, Edge)
- [ ] Respects `prefers-reduced-motion` accessibility setting
- [ ] TypeScript strict mode compliance (no `any` types)
- [ ] All functions have proper error boundaries

### Accessibility Requirements
- [ ] ARIA labels on all interactive elements
- [ ] Keyboard navigation support (tab through focusable areas)
- [ ] Screen reader announces time-of-day change (optional)
- [ ] Reduced motion mode available

---

## 🔧 Edge Cases & Error Handling

### 1. Autoplay Policy Violation (Mobile)
**Problem:** Audio cannot autoplay on mobile without user interaction.

**Solution:**
```typescript
const [audioEnabled, setAudioEnabled] = useState(false);

// On first user interaction anywhere in app
useEffect(() => {
  const enableAudio = () => {
    setAudioEnabled(true);
    document.removeEventListener('click', enableAudio);
    document.removeEventListener('touchstart', enableAudio);
  };
  
  document.addEventListener('click', enableAudio);
  document.addEventListener('touchstart', enableAudio);
  
  return () => {
    document.removeEventListener('click', enableAudio);
    document.removeEventListener('touchstart', enableAudio);
  };
}, []);
```

### 2. Rapid Time Zone Changes
**Problem:** User travels or manually changes system clock during session.

**Solution:** Hook checks time every minute and dispatches custom event for smooth transition.

### 3. Low Memory Devices
**Problem:** Device runs out of memory with all layers loaded.

**Solution:** Implement progressive layer loading:
```typescript
// Load base layer first, then add animated layers progressively
const [loadedLayers, setLoadedLayers] = useState(['base']);

useEffect(() => {
  const timer1 = setTimeout(() => setLoadedLayers(prev => [...prev, 'sky']), 500);
  const timer2 = setTimeout(() => setLoadedLayers(prev => [...prev, 'sea']), 1000);
  const timer3 = setTimeout(() => setLoadedLayers(prev => [...prev, 'buildings']), 1500);
  
  return () => {
    clearTimeout(timer1);
    clearTimeout(timer2);
    clearTimeout(timer3);
  };
}, []);
```

### 4. Tab Invisibility
**Problem:** Animations continue running when tab is hidden, wasting CPU.

**Solution:** Use Page Visibility API:
```typescript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Pause animations
      setIsPaused(true);
    } else {
      // Resume animations
      setIsPaused(false);
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);
```

---

## ✅ Developer Checklist

### Pre-Implementation
- [ ] Review `tasks.md` Task 2.1 requirements
- [ ] Confirm asset availability with art team
- [ ] Set up file structure
- [ ] Verify Framer Motion version supports all needed features

### Implementation
- [ ] Create all component files
- [ ] Implement `useTimeOfDay` hook
- [ ] Implement `ParallaxLayer` component
- [ ] Implement `AnimatedElement` component
- [ ] Assemble `CinemagraphBackground` component
- [ ] Add all 8 animated elements
- [ ] Configure 4 time variants
- [ ] Implement smooth transitions
- [ ] Add mobile detection and simplification
- [ ] Integrate audio with Howler.js
- [ ] Add error boundaries

### Optimization
- [ ] Profile FPS on desktop (target: 60+)
- [ ] Profile FPS on mobile (target: 30-60)
- [ ] Reduce asset sizes if needed
- [ ] Implement lazy loading
- [ ] Add `will-change` optimizations
- [ ] Test with `prefers-reduced-motion`

### Testing
- [ ] Test all 4 time variants (mock system time)
- [ ] Test transitions between variants
- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Test on iOS and Android devices
- [ ] Test with slow network connection
- [ ] Test with tab switching
- [ ] Test memory usage over 10 minutes
- [ ] Test accessibility features

### Final Steps
- [ ] Code review with team
- [ ] Update documentation
- [ ] Commit with descriptive message
- [ ] Push to repository

---

## 📚 Reference Implementation Example

### Minimal Working Example (Single Animation)

```typescript
// Simple wave animation for testing
import { motion } from 'framer-motion';

export const WaveTest = () => (
  <motion.img
    src="/assets/layers/waves.png"
    animate={{
      y: [0, 10, 0],
      rotate: [0, 2, 0, -2, 0],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '200px',
      objectFit: 'cover',
    }}
  />
);
```

---

## 🎭 Creative Notes

- **Atmosphere:** The cinemagraph should feel alive but not distracting. Animations must be subtle enough that players don't consciously notice them, but their absence would feel wrong.
- **Pacing:** Slower is better. A 60-second loop is preferable to a 10-second loop. Players will stare at this screen for extended periods.
- **Authenticity:** Research 1940s Italian coastal towns (Portofino, Cinque Terre) for architectural and atmospheric accuracy.
- **Emotional Tone:** Each time variant should evoke a different emotion:
  - Morning: Hope, new beginnings, freshness
  - Afternoon: Warmth, community, liveliness
  - Evening: Nostalgia, romance, reflection
  - Night: Mystery, intimacy, quiet contemplation

---

## 🔗 Related Documentation

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Howler.js Audio Documentation](https://github.com/goldfire/howler.js)
- [Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)
- [CSS mix-blend-mode](https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode)
- [Prefers-Reduced-Motion Media Query](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)

---

## 📝 Notes for Future Iteration

- Consider adding weather variants (sunny, cloudy, rainy) in future updates
- Potential for seasonal variations (summer vs winter)
- Could integrate with real-world weather API for dynamic weather matching
- Explore WebGL for more complex particle effects if performance allows
