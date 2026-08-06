# Task 2.2: Main Menu Characters (Renzo & Elena) — Detailed Implementation Specification

## 🎯 Goal
Create interactive character portraits of Renzo and Elena for the main menu. Both characters stand back-to-back in the center of the screen with subtle idle animations, hover effects, and click interactions. Renzo starts a new game when clicked; Elena is locked for future chapters.

---

## 📁 File Structure

```
client/src/features/main-menu/
├── components/
│   ├── CharacterContainer.tsx          # Parent wrapper for both characters
│   ├── RenzoCharacter.tsx              # Renzo character component
│   ├── ElenaCharacter.tsx              # Elena character component
│   ├── CharacterIdleAnimation.tsx      # Reusable idle animation wrapper
│   ├── HoverEffect.tsx                 # Hover state visual effects
│   └── InteractionNote.tsx             # Handwritten note popup component
├── assets/
│   ├── characters/
│   │   ├── renzo/
│   │   │   ├── renzo-idle-base.png
│   │   │   ├── renzo-idle-shift-weight.png
│   │   │   ├── renzo-idle-adjust-cap.png
│   │   │   ├── renzo-idle-blink.png
│   │   │   ├── renzo-idle-look-sea.png
│   │   │   ├── renzo-hover.png
│   │   │   ├── renzo-click-turn-head.png
│   │   │   ├── renzo-click-smile.png
│   │   │   └── renzo-click-tip-cap.png
│   │   └── elena/
│   │       ├── elena-idle-base.png
│   │       ├── elena-idle-wind-hair.png
│   │       ├── elena-idle-tuck-hair.png
│   │       ├── elena-idle-close-eyes.png
│   │       ├── elena-idle-dress-move.png
│   │       ├── elena-hover.png
│   │       ├── elena-click-neutral.png
│   │       └── elena-note-bg.png
│   └── effects/
│       ├── watercolor-saturate-overlay.png
│       └── brightness-glow.png
├── hooks/
│   ├── useCharacterInteraction.ts      # Handle click/hover logic
│   ├── useIdleAnimation.ts             # Manage idle animation states
│   └── useBreathingEffect.ts           # Subtle breathing animation
├── store/
│   ├── menuStore.ts                    # Zustand store for menu state (shared)
│   └── characterStore.ts               # Character-specific state
├── constants/
│   ├── characterAnimations.ts          # Animation timing configurations
│   └── characterTexts.ts               # Dialogue/note text content
└── styles/
    └── characters.module.css           # Component-specific styles
```

---

## 🏗️ Component Architecture

### 1. CharacterContainer.tsx (Parent Wrapper)

**Purpose:** Position both characters back-to-back, manage shared state, and handle responsive layout.

**Implementation Details:**

```typescript
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { RenzoCharacter } from './RenzoCharacter';
import { ElenaCharacter } from './ElenaCharacter';
import styles from '../styles/characters.module.css';

interface CharacterContainerProps {
  isMobile?: boolean;
  onNewGameStart?: () => void;
}

export const CharacterContainer: React.FC<CharacterContainerProps> = ({
  isMobile = false,
  onNewGameStart,
}) => {
  // Calculate positions based on screen size
  const positions = useMemo(() => {
    if (isMobile) {
      return {
        renzo: { x: '-50%', y: 0 },
        elena: { x: '50%', y: 0 },
        containerGap: '20px',
      };
    }
    
    return {
      renzo: { x: '-120px', y: 0 },
      elena: { x: '120px', y: 0 },
      containerGap: '0',
    };
  }, [isMobile]);

  return (
    <motion.div
      className={styles.characterContainer}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
      style={{ gap: positions.containerGap }}
    >
      {/* Renzo - Left Side */}
      <div
        className={styles.characterWrapper}
        style={{ transform: `translateX(${positions.renzo.x}) translateY(${positions.renzo.y})` }}
      >
        <RenzoCharacter
          isMobile={isMobile}
          onNewGameStart={onNewGameStart}
        />
      </div>

      {/* Back-to-back divider (optional visual element) */}
      <div className={styles.backToBackDivider}>
        {/* Could be a subtle gradient or shadow between characters */}
      </div>

      {/* Elena - Right Side */}
      <div
        className={styles.characterWrapper}
        style={{ transform: `translateX(${positions.elena.x}) translateY(${positions.elena.y})` }}
      >
        <ElenaCharacter isMobile={isMobile} />
      </div>
    </motion.div>
  );
};
```

---

### 2. RenzoCharacter.tsx

**Purpose:** Render Renzo with all idle animations, hover effects, and click interactions.

**Implementation:**

```typescript
import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIdleAnimation } from '../hooks/useIdleAnimation';
import { useBreathingEffect } from '../hooks/useBreathingEffect';
import { HoverEffect } from './HoverEffect';
import styles from '../styles/characters.module.css';
import { RENZO_ANIMATIONS } from '../constants/characterAnimations';

interface RenzoCharacterProps {
  isMobile?: boolean;
  onNewGameStart?: () => void;
}

type RenzoState = 'idle' | 'hover' | 'click';

export const RenzoCharacter: React.FC<RenzoCharacterProps> = ({
  isMobile = false,
  onNewGameStart,
}) => {
  const [state, setState] = useState<RenzoState>('idle');
  const [isLocked, setIsLocked] = useState(false);

  // Get current idle animation frame
  const { currentFrame, animationKey } = useIdleAnimation({
    animations: RENZO_ANIMATIONS.idle,
    baseDuration: RENZO_ANIMATIONS.idleDuration,
    isMobile,
  });

  // Breathing effect (always active)
  const breathingScale = useBreathingEffect({
    duration: RENZO_ANIMATIONS.breathingDuration,
    intensity: isMobile ? 0.02 : 0.03,
  });

  // Handle hover enter
  const handleMouseEnter = useCallback(() => {
    if (!isLocked) {
      setState('hover');
    }
  }, [isLocked]);

  // Handle hover leave
  const handleMouseLeave = useCallback(() => {
    setState('idle');
  }, []);

  // Handle click
  const handleClick = useCallback(async () => {
    if (isLocked) return;

    setState('click');

    // Play click animation sequence
    await new Promise(resolve => setTimeout(resolve, RENZO_ANIMATIONS.clickDuration));

    // Trigger new game start
    if (onNewGameStart) {
      onNewGameStart();
    }

    // Reset to idle after animation
    setState('idle');
  }, [isLocked, onNewGameStart]);

  // Touch handlers for mobile
  const handleTouchStart = useCallback(() => {
    if (!isLocked) {
      setState('hover');
    }
  }, [isLocked]);

  const handleTouchEnd = useCallback(() => {
    setState('idle');
    handleClick();
  }, [handleClick]);

  // Memoize image paths for current state
  const currentImage = useMemo(() => {
    if (state === 'click') {
      return RENZO_ANIMATIONS.clickSequence[currentFrame];
    }
    if (state === 'hover') {
      return RENZO_ANIMATIONS.hoverImage;
    }
    return RENZO_ANIMATIONS.idle[currentFrame];
  }, [state, currentFrame]);

  return (
    <motion.div
      className={styles.renzoCharacter}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{
        scale: 1 * breathingScale,
        opacity: 1,
      }}
      transition={{ duration: 0.3 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        cursor: isLocked ? 'not-allowed' : 'pointer',
        position: 'relative',
        willChange: 'transform, filter',
      }}
      whileHover={!isLocked ? {
        scale: 1.05,
        filter: 'brightness(1.1) saturate(1.2)',
      } : {}}
      whileTap={!isLocked ? {
        scale: 0.98,
      } : {}}
    >
      {/* Base Character Image */}
      <motion.img
        key={`${state}-${currentFrame}`}
        src={currentImage}
        alt="Renzo"
        className={styles.characterImage}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        draggable={false}
      />

      {/* Hover Effect Overlay */}
      <AnimatePresence>
        {state === 'hover' && !isLocked && (
          <HoverEffect
            type="watercolorSaturate"
            intensity={isMobile ? 0.7 : 1}
          />
        )}
      </AnimatePresence>

      {/* Bicycle Prop (if visible) */}
      <motion.img
        src="/assets/characters/renzo/renzo-bicycle.png"
        alt="Bicycle"
        className={styles.bicycleProp}
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      />

      {/* Accessibility */}
      <span className="sr-only">
        Renzo: Lean on bicycle, click to start new game
      </span>
    </motion.div>
  );
};
```

---

### 3. ElenaCharacter.tsx

**Purpose:** Render Elena with idle animations, hover effects, and locked click interaction.

**Implementation:**

```typescript
import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIdleAnimation } from '../hooks/useIdleAnimation';
import { useBreathingEffect } from '../hooks/useBreathingEffect';
import { HoverEffect } from './HoverEffect';
import { InteractionNote } from './InteractionNote';
import styles from '../styles/characters.module.css';
import { ELENA_ANIMATIONS, ELENA_TEXTS } from '../constants/characterAnimations';

interface ElenaCharacterProps {
  isMobile?: boolean;
}

type ElenaState = 'idle' | 'hover' | 'click';

export const ElenaCharacter: React.FC<ElenaCharacterProps> = ({
  isMobile = false,
}) => {
  const [state, setState] = useState<ElenaState>('idle');
  const [showNote, setShowNote] = useState(false);

  // Get current idle animation frame
  const { currentFrame, animationKey } = useIdleAnimation({
    animations: ELENA_ANIMATIONS.idle,
    baseDuration: ELENA_ANIMATIONS.idleDuration,
    isMobile,
  });

  // Breathing effect (always active)
  const breathingScale = useBreathingEffect({
    duration: ELENA_ANIMATIONS.breathingDuration,
    intensity: isMobile ? 0.02 : 0.03,
  });

  // Handle hover enter
  const handleMouseEnter = useCallback(() => {
    setState('hover');
  }, []);

  // Handle hover leave
  const handleMouseLeave = useCallback(() => {
    setState('idle');
  }, []);

  // Handle click - shows locked message
  const handleClick = useCallback(() => {
    setState('click');
    setShowNote(true);

    // Auto-hide note after duration
    setTimeout(() => {
      setShowNote(false);
      setState('idle');
    }, ELENA_ANIMATIONS.noteDisplayDuration);
  }, []);

  // Touch handlers for mobile
  const handleTouchStart = useCallback(() => {
    setState('hover');
  }, []);

  const handleTouchEnd = useCallback(() => {
    setState('idle');
    handleClick();
  }, [handleClick]);

  // Memoize image paths for current state
  const currentImage = useMemo(() => {
    if (state === 'click') {
      return ELENA_ANIMATIONS.clickImage;
    }
    if (state === 'hover') {
      return ELENA_ANIMATIONS.hoverImage;
    }
    return ELENA_ANIMATIONS.idle[currentFrame];
  }, [state, currentFrame]);

  return (
    <motion.div
      className={styles.elenaCharacter}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{
        scale: 1 * breathingScale,
        opacity: 1,
      }}
      transition={{ duration: 0.3 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        cursor: 'pointer',
        position: 'relative',
        willChange: 'transform, filter',
      }}
      whileHover={{
        scale: 1.03,
        filter: 'brightness(1.05) saturate(1.1)',
      }}
      whileTap={{
        scale: 0.98,
      }}
    >
      {/* Base Character Image */}
      <motion.img
        key={`${state}-${currentFrame}`}
        src={currentImage}
        alt="Elena"
        className={styles.characterImage}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        draggable={false}
      />

      {/* Hover Effect Overlay */}
      <AnimatePresence>
        {state === 'hover' && (
          <HoverEffect
            type="softGlow"
            intensity={isMobile ? 0.5 : 0.7}
          />
        )}
      </AnimatePresence>

      {/* Locked Note Popup */}
      <AnimatePresence>
        {showNote && (
          <InteractionNote
            text={ELENA_TEXTS.lockedMessage}
            position={{ x: 0, y: -150 }}
            onAnimationComplete={() => setShowNote(false)}
          />
        )}
      </AnimatePresence>

      {/* Dress/Hair Wind Effect (subtle overlay) */}
      <motion.div
        className={styles.windEffect}
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Accessibility */}
      <span className="sr-only">
        Elena: Her story is still being written. Click to learn more.
      </span>
    </motion.div>
  );
};
```

---

### 4. useIdleAnimation.ts Hook

**Purpose:** Manage idle animation state machine with random selection and timing.

**Implementation:**

```typescript
import { useState, useEffect, useCallback, useMemo } from 'react';

interface IdleAnimationConfig {
  name: string;
  frames: string[];
  duration: number;
  weight?: number; // For random selection (higher = more likely)
}

interface UseIdleAnimationProps {
  animations: IdleAnimationConfig[];
  baseDuration: number;
  isMobile?: boolean;
}

interface UseIdleAnimationReturn {
  currentFrame: number;
  animationKey: string;
  currentAnimation: IdleAnimationConfig;
}

export const useIdleAnimation = ({
  animations,
  baseDuration,
  isMobile = false,
}: UseIdleAnimationProps): UseIdleAnimationReturn => {
  const [currentAnimationIndex, setCurrentAnimationIndex] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);

  // Mobile reduces animation complexity
  const durationMultiplier = isMobile ? 1.3 : 1;

  // Weighted random selection
  const selectNextAnimation = useCallback(() => {
    const totalWeight = animations.reduce((sum, anim) => sum + (anim.weight ?? 1), 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < animations.length; i++) {
      random -= animations[i].weight ?? 1;
      if (random <= 0) {
        return i;
      }
    }
    
    return animations.length - 1;
  }, [animations]);

  useEffect(() => {
    const currentAnim = animations[currentAnimationIndex];
    const frameDuration = (currentAnim.duration / currentAnim.frames.length) * durationMultiplier;

    const frameInterval = setInterval(() => {
      setCurrentFrame(prev => {
        const nextFrame = prev + 1;
        
        // Check if animation sequence is complete
        if (nextFrame >= currentAnim.frames.length) {
          // Select next animation
          setCurrentAnimationIndex(selectNextAnimation());
          return 0;
        }
        
        return nextFrame;
      });
    }, frameDuration * 1000);

    return () => clearInterval(frameInterval);
  }, [currentAnimationIndex, animations, durationMultiplier, selectNextAnimation]);

  const currentAnimation = useMemo(
    () => animations[currentAnimationIndex],
    [animations, currentAnimationIndex]
  );

  return {
    currentFrame,
    animationKey: `${currentAnimation.name}-${currentFrame}`,
    currentAnimation,
  };
};
```

---

### 5. useBreathingEffect.ts Hook

**Purpose:** Create subtle breathing animation (scale pulsing) for living character feel.

**Implementation:**

```typescript
import { useMemo } from 'react';
import { useMotionValue, useSpring, useTransform, motion } from 'framer-motion';

interface UseBreathingEffectProps {
  duration: number;
  intensity: number;
}

export const useBreathingEffect = ({
  duration,
  intensity,
}: UseBreathingEffectProps): number => {
  // Use motion value for smooth breathing animation
  const time = useMotionValue(0);

  // Sine wave for natural breathing rhythm
  const breathing = useTransform(time, [0, Math.PI * 2], [1, 1 + intensity, 1]);

  // Spring physics for smooth transitions
  const springBreathing = useSpring(breathing, {
    stiffness: 100,
    damping: 20,
    mass: 1,
  });

  // Update time continuously
  useMemo(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = (elapsed % duration) / duration;
      time.set(progress * Math.PI * 2);
    }, 16); // ~60 FPS

    return () => clearInterval(interval);
  }, [duration, time]);

  // Return current scale value (for use in component)
  // Note: In practice, you'd return the motion value itself
  // This is simplified for the example
  return 1;
};

// Alternative simpler implementation using CSS animation
export const useSimpleBreathingEffect = (
  duration: number,
  intensity: number
): { scale: number[]; transition: object } => {
  return {
    scale: [1, 1 + intensity, 1],
    transition: {
      duration,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  };
};
```

---

### 6. HoverEffect.tsx Component

**Purpose:** Apply visual hover effects (watercolor saturation, glow, etc.).

**Implementation:**

```typescript
import React from 'react';
import { motion } from 'framer-motion';
import styles from '../styles/characters.module.css';

interface HoverEffectProps {
  type: 'watercolorSaturate' | 'softGlow' | 'brightnessBoost';
  intensity?: number;
}

export const HoverEffect: React.FC<HoverEffectProps> = ({
  type,
  intensity = 1,
}) => {
  const variants = {
    watercolorSaturate: {
      initial: { opacity: 0 },
      animate: {
        opacity: intensity,
        backgroundImage: 'radial-gradient(circle, rgba(255,200,150,0.3) 0%, transparent 70%)',
      },
      exit: { opacity: 0 },
    },
    softGlow: {
      initial: { opacity: 0, scale: 0.9 },
      animate: {
        opacity: intensity * 0.5,
        scale: 1.1,
        boxShadow: '0 0 30px rgba(255, 220, 180, 0.4)',
      },
      exit: { opacity: 0, scale: 0.9 },
    },
    brightnessBoost: {
      initial: { filter: 'brightness(1)' },
      animate: { filter: `brightness(${1 + intensity * 0.2})` },
      exit: { filter: 'brightness(1)' },
    },
  };

  return (
    <motion.div
      className={styles.hoverEffect}
      initial={variants[type].initial}
      animate={variants[type].animate}
      exit={variants[type].exit}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        borderRadius: 'inherit',
        mixBlendMode: type === 'watercolorSaturate' ? 'multiply' : 'normal',
      }}
    />
  );
};
```

---

### 7. InteractionNote.tsx Component

**Purpose:** Display handwritten note popup when Elena is clicked.

**Implementation:**

```typescript
import React from 'react';
import { motion } from 'framer-motion';
import styles from '../styles/characters.module.css';

interface InteractionNoteProps {
  text: string;
  position: { x: number; y: number };
  onAnimationComplete?: () => void;
}

export const InteractionNote: React.FC<InteractionNoteProps> = ({
  text,
  position,
  onAnimationComplete,
}) => {
  return (
    <motion.div
      className={styles.interactionNote}
      initial={{ opacity: 0, y: position.y + 20, scale: 0.8 }}
      animate={{ opacity: 1, y: position.y, scale: 1 }}
      exit={{ opacity: 0, y: position.y - 20, scale: 0.8 }}
      transition={{
        duration: 0.4,
        ease: 'backOut',
      }}
      onAnimationComplete={onAnimationComplete}
      style={{
        position: 'absolute',
        left: '50%',
        top: 0,
        transform: 'translateX(-50%)',
        padding: '20px 30px',
        backgroundImage: "url('/assets/characters/elena/elena-note-bg.png')",
        backgroundSize: 'cover',
        fontFamily: "'Caveat', cursive", // Handwritten font
        fontSize: '18px',
        color: '#4a3728',
        textAlign: 'center',
        maxWidth: '300px',
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      <p>{text}</p>
      
      {/* Decorative elements */}
      <div className={styles.noteCornerDecor} />
    </motion.div>
  );
};
```

---

### 8. Constants Configuration

**File:** `constants/characterAnimations.ts`

```typescript
// Renzo Animation Config
export const RENZO_ANIMATIONS = {
  idle: [
    {
      name: 'shiftWeight',
      frames: [
        '/assets/characters/renzo/renzo-idle-base.png',
        '/assets/characters/renzo/renzo-idle-shift-weight.png',
        '/assets/characters/renzo/renzo-idle-base.png',
      ],
      duration: 3,
      weight: 3,
    },
    {
      name: 'adjustCap',
      frames: [
        '/assets/characters/renzo/renzo-idle-base.png',
        '/assets/characters/renzo/renzo-idle-adjust-cap.png',
        '/assets/characters/renzo/renzo-idle-base.png',
      ],
      duration: 2.5,
      weight: 2,
    },
    {
      name: 'blink',
      frames: [
        '/assets/characters/renzo/renzo-idle-base.png',
        '/assets/characters/renzo/renzo-idle-blink.png',
        '/assets/characters/renzo/renzo-idle-base.png',
      ],
      duration: 1,
      weight: 5,
    },
    {
      name: 'lookSea',
      frames: [
        '/assets/characters/renzo/renzo-idle-base.png',
        '/assets/characters/renzo/renzo-idle-look-sea.png',
        '/assets/characters/renzo/renzo-idle-base.png',
      ],
      duration: 4,
      weight: 2,
    },
  ],
  idleDuration: 3,
  breathingDuration: 4,
  hoverImage: '/assets/characters/renzo/renzo-hover.png',
  clickSequence: [
    '/assets/characters/renzo/renzo-click-turn-head.png',
    '/assets/characters/renzo/renzo-click-smile.png',
    '/assets/characters/renzo/renzo-click-tip-cap.png',
    '/assets/characters/renzo/renzo-idle-base.png',
  ],
  clickDuration: 1.5,
};

// Elena Animation Config
export const ELENA_ANIMATIONS = {
  idle: [
    {
      name: 'windHair',
      frames: [
        '/assets/characters/elena/elena-idle-base.png',
        '/assets/characters/elena/elena-idle-wind-hair.png',
        '/assets/characters/elena/elena-idle-base.png',
      ],
      duration: 3.5,
      weight: 3,
    },
    {
      name: 'tuckHair',
      frames: [
        '/assets/characters/elena/elena-idle-base.png',
        '/assets/characters/elena/elena-idle-tuck-hair.png',
        '/assets/characters/elena/elena-idle-base.png',
      ],
      duration: 3,
      weight: 2,
    },
    {
      name: 'closeEyes',
      frames: [
        '/assets/characters/elena/elena-idle-base.png',
        '/assets/characters/elena/elena-idle-close-eyes.png',
        '/assets/characters/elena/elena-idle-base.png',
      ],
      duration: 2,
      weight: 2,
    },
    {
      name: 'dressMove',
      frames: [
        '/assets/characters/elena/elena-idle-base.png',
        '/assets/characters/elena/elena-idle-dress-move.png',
        '/assets/characters/elena/elena-idle-base.png',
      ],
      duration: 4,
      weight: 3,
    },
  ],
  idleDuration: 3.5,
  breathingDuration: 4.5,
  hoverImage: '/assets/characters/elena/elena-hover.png',
  clickImage: '/assets/characters/elena/elena-click-neutral.png',
  noteDisplayDuration: 3000,
};

// Elena Text Content
export const ELENA_TEXTS = {
  lockedMessage: "Her story is still being written...",
  alternateMessages: [
    "Elena's chapter will come soon.",
    "Some stories take time to unfold.",
    "Patience, traveler. Her tale awaits.",
  ],
};
```

---

## 🎨 Asset Requirements

### Renzo Character Sprites
- **Base Idle:** Standing, leaning on bicycle, neutral expression
- **Shift Weight:** Subtle body shift, foot repositioning (3 frames)
- **Adjust Cap:** Hand reaches up to adjust cap (3 frames)
- **Blink:** Eye closure (2 frames)
- **Look at Sea:** Head turns slightly toward horizon (3 frames)
- **Hover State:** Brighter colors, more saturated watercolor
- **Click Sequence:**
  1. Turns head toward viewer
  2. Smiles warmly
  3. Tips cap with hand
- **Bicycle Prop:** Vintage 1940s bicycle, separate layer

### Elena Character Sprites
- **Base Idle:** Standing calmly, hands clasped or at sides
- **Wind Hair:** Hair strands moving in breeze (3 frames)
- **Tuck Hair:** Hand tucks hair behind ear (3 frames)
- **Close Eyes:** Brief eye closure with serene expression (2 frames)
- **Dress Move:** Fabric rustling in wind (3 frames)
- **Hover State:** Soft glow, slight saturation increase
- **Click State:** Neutral, gentle expression
- **Note Background:** Torn paper texture, aged appearance

### Visual Style Guidelines
- **Art Style:** Hand-drawn watercolor with pencil outlines
- **Color Palette:** Warm 1940s tones (sepia, muted blues, soft oranges)
- **Resolution:** Minimum 1024x1024px per character (scalable)
- **Format:** PNG with transparency
- **Frame Rate:** Animations at 12-24 FPS for hand-drawn feel

---

## ⚙️ Technical Implementation Steps

### Step 1: Set Up Project Structure
1. Create directory structure under `client/src/features/main-menu/`
2. Verify Framer Motion installation
3. Create placeholder asset files

### Step 2: Implement Core Hooks
1. Create `useIdleAnimation.ts` with state machine logic
2. Create `useBreathingEffect.ts` for subtle life-like movement
3. Create `useCharacterInteraction.ts` for unified interaction handling

### Step 3: Build Character Components
1. Implement `RenzoCharacter.tsx` with all states
2. Implement `ElenaCharacter.tsx` with locked interaction
3. Implement `CharacterContainer.tsx` for positioning

### Step 4: Create Supporting Components
1. Implement `HoverEffect.tsx` with multiple effect types
2. Implement `InteractionNote.tsx` for Elena's message
3. Implement `CharacterIdleAnimation.tsx` wrapper

### Step 5: Configure Animation Constants
1. Define all animation sequences in `characterAnimations.ts`
2. Set timing values (durations, weights, delays)
3. Configure text content for Elena's notes

### Step 6: Add Styling
1. Create `characters.module.css` with responsive styles
2. Add media queries for mobile layouts
3. Implement accessibility styles (`.sr-only`)

### Step 7: Mobile Optimization
1. Reduce animation frame count on mobile
2. Adjust character positions for vertical layouts
3. Optimize touch interaction timing
4. Test on various screen sizes

### Step 8: Integration Testing
1. Connect Renzo's click to game state management
2. Verify Elena's locked state persists correctly
3. Test hover states on touch devices
4. Ensure smooth transitions between states

---

## 🎯 Acceptance Criteria

### Functional Requirements
- [ ] Renzo stands on left side, Elena on right (back-to-back)
- [ ] Both characters have continuous idle animations
- [ ] Random idle animation selection feels natural (no obvious loops)
- [ ] Subtle breathing animation always active on both
- [ ] Renzo hover: brightness + saturation increase
- [ ] Renzo click: plays turn-head → smile → tip-cap sequence → starts new game
- [ ] Elena hover: slight saturation + soft glow
- [ ] Elena click: displays handwritten note "Her story is still being written..."
- [ ] Note auto-dismisses after 3 seconds
- [ ] All animations work on mobile touch devices
- [ ] Characters fade in smoothly on menu load

### Visual Requirements
- [ ] Art style matches 1940s hand-drawn watercolor aesthetic
- [ ] Character proportions accurate and consistent
- [ ] Animations are smooth (no stuttering or frame drops)
- [ ] Hover effects provide clear visual feedback
- [ ] Note appears as handwritten text on aged paper
- [ ] No visible seams between animation frames
- [ ] Breathing animation is subtle (not distracting)

### Technical Requirements
- [ ] Component is fully responsive (desktop to mobile)
- [ ] Performance maintains 60 FPS during all animations
- [ ] Memory usage optimized (unload unused sprite frames)
- [ ] TypeScript strict mode compliance
- [ ] All functions have proper error boundaries
- [ ] Works in all major browsers (Chrome, Firefox, Safari, Edge)
- [ ] Respects `prefers-reduced-motion` setting

### Accessibility Requirements
- [ ] ARIA labels describe characters and actions
- [ ] Keyboard navigation supported (Tab to focus, Enter to activate)
- [ ] Screen readers announce character names and states
- [ ] Reduced motion mode simplifies or disables animations
- [ ] Color contrast meets WCAG AA standards

---

## 🔧 Edge Cases & Error Handling

### 1. Missing Sprite Assets
**Problem:** Animation frame images fail to load.

**Solution:**
```typescript
const [hasError, setHasError] = useState(false);

const handleError = useCallback(() => {
  setHasError(true);
  // Fallback to static image
}, []);

<img
  src={currentImage}
  onError={handleError}
  alt="Character"
/>

{hasError && (
  <img src="/assets/characters/fallback-static.png" alt="Character" />
)}
```

### 2. Rapid Clicking
**Problem:** User clicks Renzo multiple times rapidly during animation.

**Solution:**
```typescript
const [isAnimating, setIsAnimating] = useState(false);

const handleClick = useCallback(async () => {
  if (isAnimating || isLocked) return;
  
  setIsAnimating(true);
  
  try {
    // ... animation sequence
    await new Promise(resolve => setTimeout(resolve, clickDuration));
    onNewGameStart?.();
  } finally {
    setIsAnimating(false);
  }
}, [isAnimating, isLocked, onNewGameStart]);
```

### 3. Mobile Touch Delay
**Problem:** 300ms delay on mobile tap events.

**Solution:** Use `onTouchEnd` instead of `onClick` and prevent default:
```typescript
const handleTouchEnd = useCallback((e: React.TouchEvent) => {
  e.preventDefault(); // Prevent mouse emulation
  setState('idle');
  handleClick();
}, [handleClick]);
```

### 4. Long Session Memory Leak
**Problem:** Animation intervals continue running after component unmount.

**Solution:** Proper cleanup in `useEffect`:
```typescript
useEffect(() => {
  const interval = setInterval(() => { /* ... */ }, duration);
  
  return () => {
    clearInterval(interval);
  };
}, [duration]);
```

### 5. Reduced Motion Preference
**Problem:** User has system preference for reduced motion.

**Solution:**
```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const animationDuration = prefersReducedMotion ? 0 : baseDuration;
const animationIntensity = prefersReducedMotion ? 0 : baseIntensity;
```

---

## ✅ Developer Checklist

### Pre-Implementation
- [ ] Review `tasks.md` Task 2.2 requirements
- [ ] Confirm character art availability with artist
- [ ] Verify sprite sheet formats and naming conventions
- [ ] Set up file structure

### Implementation
- [ ] Create `useIdleAnimation` hook
- [ ] Create `useBreathingEffect` hook
- [ ] Implement `RenzoCharacter` component
- [ ] Implement `ElenaCharacter` component
- [ ] Implement `CharacterContainer` component
- [ ] Implement `HoverEffect` component
- [ ] Implement `InteractionNote` component
- [ ] Configure animation constants
- [ ] Add all sprite assets

### Styling & Layout
- [ ] Create responsive CSS module
- [ ] Position characters back-to-back
- [ ] Add mobile-specific layout adjustments
- [ ] Implement hover/touch states

### Testing
- [ ] Test all idle animations play correctly
- [ ] Verify random animation selection feels natural
- [ ] Test Renzo click → new game flow
- [ ] Test Elena click → note display → auto-dismiss
- [ ] Test on desktop (mouse hover)
- [ ] Test on mobile (touch interactions)
- [ ] Test keyboard navigation
- [ ] Test with `prefers-reduced-motion`
- [ ] Profile FPS during animations
- [ ] Test memory usage over extended session

### Final Steps
- [ ] Code review with team
- [ ] Update documentation
- [ ] Commit with descriptive message
- [ ] Push to repository

---

## 📚 Reference Implementation Example

### Minimal Working Example (Single Character)

```typescript
import { motion } from 'framer-motion';

export const SimpleRenzo = () => (
  <motion.div
    whileHover={{ scale: 1.05, filter: 'brightness(1.1)' }}
    whileTap={{ scale: 0.98 }}
    animate={{
      y: [0, -5, 0], // Simple idle bob
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
    onClick={() => console.log('New Game!')}
    style={{ cursor: 'pointer' }}
  >
    <img src="/assets/renzo-base.png" alt="Renzo" />
  </motion.div>
);
```

---

## 🎭 Creative Notes

- **Character Chemistry:** Though back-to-back, their poses should suggest a connection—perhaps Renzo glances occasionally toward Elena, or their shadows overlap subtly.
- **Personality Through Animation:**
  - Renzo: Energetic, fidgety (more frequent idle animations), confident posture
  - Elena: Calm, graceful movements, serene expression
- **1940s Authenticity:** Research period-appropriate clothing, hairstyles, and bicycle designs for accuracy.
- **Emotional Arc:** The main menu is the player's first impression. Characters should feel inviting and intriguing, encouraging players to start their journey.

---

## 🔗 Related Documentation

- [Framer Motion Gestures](https://www.framer.com/motion/gestures/)
- [Framer Motion Animations](https://www.framer.com/motion/animations/)
- [CSS Custom Properties for Theming](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Touch Events Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events/Supporting_both_TouchEvent_and_MouseEvent)
- [WCAG Motion Accessibility](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)

---

## 📝 Notes for Future Iteration

- Consider adding seasonal outfit variations (summer/winter)
- Potential for relationship progression visual changes (later chapters)
- Could add voice lines on hover/click (with mute option)
- Explore 3D parallax effect using device gyroscope on mobile
- Multiple language support for Elena's note text
