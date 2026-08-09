# Task 7.1: NPC Schedule System (Basic) - Detailed Implementation Specification

## Overview
Реализация системы расписаний NPC, где каждый персонаж следует своему ежедневному графику, перемещаясь между локациями в зависимости от времени суток.

---

## 1. Architecture & Data Structures

### 1.1 Core Interfaces

**File:** `shared/types/npc.ts`

```typescript
// Время в минутах от начала суток (0-1439)
type MinutesFromMidnight = number;

export interface ScheduleActivity {
  startTime: MinutesFromMidnight;      // Начало активности (например, 300 = 5:00)
  endTime: MinutesFromMidnight;        // Конец активности (например, 840 = 14:00)
  locationId: string;                  // ID локации (например, "bakery", "market")
  position: {                          // Позиция внутри локации
    x: number;                         // Координата X (в пикселях или %)
    y: number;                         // Координата Y (в пикселях или %)
  };
  animation: string;                   // Название idle-анимации (например, "knead_dough")
  interactionEnabled?: boolean;        // Можно ли взаимодействовать (default: true)
  dialogueVariant?: string;            // Вариант диалога для этой активности
}

export interface NPCSchedule {
  npcId: string;                       // Уникальный ID персонажа
  name: string;                        // Отображаемое имя
  activities: ScheduleActivity[];      // Массив активностей на сутки
  defaultLocationId: string;           // Локация по умолчанию (если время вне расписания)
  sleepActivity?: ScheduleActivity;    // Специальная активность сна (опционально)
}

export interface NPCState {
  npcId: string;
  currentActivity: ScheduleActivity | null;
  currentLocationId: string;
  currentPosition: { x: number; y: number };
  currentAnimation: string;
  isMoving: boolean;
  nextActivityTime: MinutesFromMidnight | null;
  affinity: number;                    // Отношение к игроку (-100 до +100)
}
```

### 1.2 Example: Maria the Baker

**File:** `client/data/npcs/maria_schedule.ts`

```typescript
import { NPCSchedule } from '@/shared/types/npc';

export const mariaSchedule: NPCSchedule = {
  npcId: 'maria_baker',
  name: 'Maria',
  defaultLocationId: 'home_maria',
  activities: [
    {
      startTime: 300,   // 5:00
      endTime: 840,     // 14:00
      locationId: 'bakery',
      position: { x: 120, y: 85 },
      animation: 'knead_dough',
      interactionEnabled: true,
      dialogueVariant: 'working'
    },
    {
      startTime: 840,   // 14:00
      endTime: 900,     // 15:00
      locationId: 'market_square',
      position: { x: 200, y: 150 },
      animation: 'buying_supplies',
      interactionEnabled: true,
      dialogueVariant: 'shopping'
    },
    {
      startTime: 900,   // 15:00
      endTime: 1080,    // 18:00
      locationId: 'home_maria',
      position: { x: 50, y: 60 },
      animation: 'resting_chair',
      interactionEnabled: true,
      dialogueVariant: 'relaxed'
    },
    {
      startTime: 1080,  // 18:00
      endTime: 1200,    // 20:00
      locationId: 'church',
      position: { x: 180, y: 200 },
      animation: 'praying',
      interactionEnabled: false, // Не прерывать молитву
      dialogueVariant: 'prayer'
    },
    {
      startTime: 1200,  // 20:00
      endTime: 300,     // 5:00 (следующий день)
      locationId: 'home_maria',
      position: { x: 50, y: 60 },
      animation: 'sleeping_bed',
      interactionEnabled: false,
      dialogueVariant: 'sleeping'
    }
  ]
};
```

---

## 2. State Management (Zustand Store)

**File:** `client/store/npcScheduleStore.ts`

```typescript
import { create } from 'zustand';
import { NPCSchedule, NPCState } from '@/shared/types/npc';
import { schedules } from '@/client/data/npcs/schedules_index'; // Импорт всех расписаний

interface NPCScheduleStore {
  // State
  npcs: Map<string, NPCState>;
  currentTime: number; // Минуты от начала суток (0-1439)
  
  // Actions
  setCurrentTime: (minutes: number) => void;
  advanceTime: (minutes: number) => void;
  getNPCState: (npcId: string) => NPCState | undefined;
  getNPCsAtLocation: (locationId: string) => NPCState[];
  updateNPCLocation: (locationId: string) => void; // Вызывается при смене локации игроком
  resetSchedules: () => void;
}

export const useNPCScheduleStore = create<NPCScheduleStore>((set, get) => ({
  npcs: new Map(),
  currentTime: 480, // Start at 8:00 AM by default
  
  setCurrentTime: (minutes: number) => {
    set({ currentTime: minutes });
    get().updateAllNPCStates();
  },
  
  advanceTime: (minutes: number) => {
    const newTime = (get().currentTime + minutes) % 1440;
    set({ currentTime: newTime });
    get().updateAllNPCStates();
  },
  
  updateAllNPCStates: () => {
    const { currentTime, npcs } = get();
    const updatedNPCs = new Map(npcs);
    
    schedules.forEach((schedule: NPCSchedule) => {
      const currentState = npcs.get(schedule.npcId);
      const newActivity = findCurrentActivity(schedule, currentTime);
      
      if (newActivity && (!currentState || currentState.currentActivity !== newActivity)) {
        updatedNPCs.set(schedule.npcId, {
          npcId: schedule.npcId,
          currentActivity: newActivity,
          currentLocationId: newActivity.locationId,
          currentPosition: newActivity.position,
          currentAnimation: newActivity.animation,
          isMoving: false,
          nextActivityTime: getNextActivityTime(schedule, currentTime),
          affinity: currentState?.affinity ?? 0
        });
      }
    });
    
    set({ npcs: updatedNPCs });
  },
  
  getNPCState: (npcId: string) => {
    return get().npcs.get(npcId);
  },
  
  getNPCsAtLocation: (locationId: string) => {
    const { npcs } = get();
    return Array.from(npcs.values()).filter(npc => npc.currentLocationId === locationId);
  },
  
  updateNPCLocation: (locationId: string) => {
    // Фильтруем NPC, которые должны быть в этой локации
    const { npcs, currentTime } = get();
    const visibleNPCs = new Map(npcs);
    
    schedules.forEach((schedule: NPCSchedule) => {
      const activity = findCurrentActivity(schedule, currentTime);
      if (activity && activity.locationId !== locationId && activity.interactionEnabled === false) {
        // Скрываем NPC, если он не в текущей локации или недоступен
        // (логика рендеринга обрабатывается на уровне компонента)
      }
    });
  },
  
  resetSchedules: () => {
    set({ npcs: new Map(), currentTime: 480 });
  }
}));

// Helper Functions
function findCurrentActivity(
  schedule: NPCSchedule, 
  currentTime: number
): ScheduleActivity | null {
  for (const activity of schedule.activities) {
    if (activity.startTime <= activity.endTime) {
      // Нормальный диапазон (например, 5:00-14:00)
      if (currentTime >= activity.startTime && currentTime < activity.endTime) {
        return activity;
      }
    } else {
      // Диапазон через полночь (например, 20:00-5:00)
      if (currentTime >= activity.startTime || currentTime < activity.endTime) {
        return activity;
      }
    }
  }
  return null;
}

function getNextActivityTime(
  schedule: NPCSchedule, 
  currentTime: number
): number | null {
  const currentActivity = findCurrentActivity(schedule, currentTime);
  if (!currentActivity) return null;
  
  return currentActivity.endTime;
}
```

---

## 3. NPC Component Implementation

### 3.1 Base NPC Component

**File:** `client/components/game/NPCCharacter.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { useNPCScheduleStore } from '@/client/store/npcScheduleStore';
import { useGameStore } from '@/client/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './NPCCharacter.module.css';

interface NPCCharacterProps {
  npcId: string;
  locationId: string;
  onClick?: (npcId: string) => void;
}

export const NPCCharacter: React.FC<NPCCharacterProps> = ({ 
  npcId, 
  locationId, 
  onClick 
}) => {
  const npcState = useNPCScheduleStore(state => state.getNPCState(npcId));
  const currentLocationId = useGameStore(state => state.currentLocationId);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Check if NPC should be visible in current location
  useEffect(() => {
    if (!npcState) {
      setIsVisible(false);
      return;
    }

    const shouldBeVisible = 
      npcState.currentLocationId === locationId &&
      npcState.currentActivity?.interactionEnabled !== false;

    setIsVisible(shouldBeVisible);
  }, [npcState, locationId]);

  if (!isVisible || !npcState) return null;

  const handleInteraction = () => {
    if (onClick && npcState.currentActivity?.interactionEnabled) {
      onClick(npcId);
    }
  };

  return (
    <motion.div
      className={styles.npcContainer}
      style={{
        left: npcState.currentPosition.x,
        top: npcState.currentPosition.y,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: isVisible ? 1 : 0, 
        scale: isVisible ? 1 : 0.8,
        y: isHovered ? -5 : 0 // Idle float animation
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleInteraction}
      role="button"
      tabIndex={0}
      aria-label={`Interact with ${npcId}`}
    >
      {/* NPC Sprite/Avatar */}
      <div className={styles.npcSprite}>
        <img 
          src={`/assets/npcs/${npcId}/${npcState.currentAnimation}.png`}
          alt={npcId}
          className={styles.spriteImage}
        />
        
        {/* Interaction Indicator */}
        {npcState.currentActivity?.interactionEnabled && (
          <motion.div
            className={styles.interactionIndicator}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span>💬</span>
          </motion.div>
        )}
      </div>

      {/* Name Tag (visible on hover) */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className={styles.nameTag}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {npcId.replace('_', ' ').toUpperCase()}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
```

### 3.2 CSS Styles

**File:** `client/components/game/NPCCharacter.module.css`

```css
.npcContainer {
  position: absolute;
  cursor: pointer;
  z-index: 10;
  touch-action: manipulation;
}

.npcSprite {
  position: relative;
  width: 64px;
  height: 96px;
}

.spriteImage {
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated; /* Для пиксель-арта */
}

.interactionIndicator {
  position: absolute;
  top: -10px;
  right: -10px;
  font-size: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.nameTag {
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  white-space: nowrap;
  pointer-events: none;
}

/* Mobile Optimization */
@media (max-width: 768px) {
  .npcSprite {
    width: 48px;
    height: 72px;
  }
  
  .nameTag {
    font-size: 10px;
    padding: 2px 6px;
  }
}
```

---

## 4. Location Integration

**File:** `client/components/game/LocationScene.tsx`

```typescript
import React from 'react';
import { NPCCharacter } from './NPCCharacter';
import { useNPCScheduleStore } from '@/client/store/npcScheduleStore';
import { useGameStore } from '@/client/store/gameStore';

interface LocationSceneProps {
  locationId: string;
  children?: React.ReactNode;
}

export const LocationScene: React.FC<LocationSceneProps> = ({ 
  locationId, 
  children 
}) => {
  const npcsAtLocation = useNPCScheduleStore(state => 
    state.getNPCsAtLocation(locationId)
  );
  const currentLocationId = useGameStore(state => state.currentLocationId);

  // Only render NPCs if this is the active location
  if (locationId !== currentLocationId) return null;

  return (
    <div className="location-scene">
      {/* Background and environment */}
      {children}
      
      {/* Render all NPCs scheduled for this location */}
      {npcsAtLocation.map(npc => (
        <NPCCharacter
          key={npc.npcId}
          npcId={npc.npcId}
          locationId={locationId}
          onClick={(id) => console.log(`Interacting with ${id}`)}
        />
      ))}
    </div>
  );
};
```

---

## 5. Time Progression System

**File:** `client/hooks/useGameTime.ts`

```typescript
import { useEffect } from 'react';
import { useNPCScheduleStore } from '@/client/store/npcScheduleStore';
import { useGameStore } from '@/client/store/gameStore';

export const useGameTime = () => {
  const advanceTime = useNPCScheduleStore(state => state.advanceTime);
  const currentTime = useNPCScheduleStore(state => state.currentTime);
  const isTimePaused = useGameStore(state => state.isTimePaused);

  useEffect(() => {
    if (isTimePaused) return;

    // Game time: 1 real second = 1 game minute
    const interval = setInterval(() => {
      advanceTime(1);
    }, 1000);

    return () => clearInterval(interval);
  }, [advanceTime, isTimePaused]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  return {
    currentTime,
    formattedTime: formatTime(currentTime),
    isTimePaused
  };
};
```

---

## 6. Dialogue Integration

**File:** `client/components/dialogue/DialogueSystem.tsx` (snippet)

```typescript
import { useNPCScheduleStore } from '@/client/store/npcScheduleStore';
import { useAffinityStore } from '@/client/store/affinityStore';

interface DialogueContext {
  npcId: string;
  getTimeBasedVariant: () => string;
  getAffinityBasedVariant: () => string;
}

export const useDialogueContext = (npcId: string): DialogueContext => {
  const npcState = useNPCScheduleStore(state => state.getNPCState(npcId));
  const affinity = useAffinityStore(state => state.getAffinity(npcId));

  const getTimeBasedVariant = () => {
    if (!npcState?.currentActivity?.dialogueVariant) return 'default';
    return npcState.currentActivity.dialogueVariant;
  };

  const getAffinityBasedVariant = () => {
    if (affinity >= 50) return 'friendly';
    if (affinity >= 10) return 'warm';
    if (affinity >= -9) return 'neutral';
    if (affinity >= -49) return 'unfriendly';
    return 'hostile';
  };

  return {
    npcId,
    getTimeBasedVariant,
    getAffinityBasedVariant
  };
};
```

---

## 7. Edge Cases & Error Handling

### 7.1 Midnight Crossover
- **Проблема:** Активности, длящиеся через полночь (20:00-5:00).
- **Решение:** Функция `findCurrentActivity` проверяет два условия:
  ```typescript
  if (startTime <= endTime) {
    // Normal range
    return currentTime >= startTime && currentTime < endTime;
  } else {
    // Crosses midnight
    return currentTime >= startTime || currentTime < endTime;
  }
  ```

### 7.2 Missing Activities
- **Проблема:** В расписании есть пробелы.
- **Решение:** Использовать `defaultLocationId` и дефолтную анимацию "idle".

### 7.3 Performance Optimization
- **Проблема:** Много NPC в одной локации.
- **Решение:** 
  - Рендерить только видимых NPC
  - Использовать `React.memo` для компонентов NPC
  - Отключать обновления за пределами экрана

### 7.4 Save/Load Compatibility
- **Проблема:** Загрузка сохранения с другим временем.
- **Решение:** При загрузке вызывать `setCurrentTime(savedTime)` для мгновенного обновления всех NPC.

---

## 8. Testing Checklist

### Unit Tests
- [ ] `findCurrentActivity` returns correct activity for normal ranges
- [ ] `findCurrentActivity` handles midnight crossover correctly
- [ ] `advanceTime` wraps around at 1440 minutes
- [ ] `getNPCsAtLocation` filters correctly

### Integration Tests
- [ ] NPC appears in bakery at 5:00
- [ ] NPC moves to market at 14:00
- [ ] NPC is not interactable during sleep
- [ ] Time progression updates NPC states

### Visual Tests
- [ ] NPC sprite displays correct animation
- [ ] Interaction indicator pulses
- [ ] Name tag appears on hover
- [ ] Smooth transitions between positions

### Edge Case Tests
- [ ] Load save at 23:59, verify NPC positions
- [ ] Fast-forward time through multiple activities
- [ ] Empty schedule uses default location

---

## 9. Asset Requirements

### Sprites
```
/assets/npcs/maria_baker/
  ├── knead_dough.png
  ├── buying_supplies.png
  ├── resting_chair.png
  ├── praying.png
  └── sleeping_bed.png
```

### Audio (Optional)
```
/assets/audio/npc/
  ├── maria_greeting_working.mp3
  ├── maria_greeting_relaxed.mp3
  └── maria_greeting_prayer.mp3
```

---

## 10. Acceptance Criteria

### Functional
- ✅ NPCs appear in correct locations based on time
- ✅ NPCs transition between activities smoothly
- ✅ Interaction is disabled during non-interactable activities
- ✅ Time progression updates all NPC states
- ✅ NPCs are hidden when player is in different location

### Technical
- ✅ No memory leaks from interval timers
- ✅ Performance stable with 10+ NPCs
- ✅ State persists through save/load
- ✅ TypeScript types are strict and complete

### Visual
- ✅ Idle animation plays continuously
- ✅ Interaction indicator is visible and animated
- ✅ Name tag appears/disappears smoothly
- ✅ Position transitions are instant (no walking animation in v1)

---

## 11. Future Enhancements (Out of Scope for 7.1)
- Walking animations between locations
- Pathfinding for multi-point movements
- Dynamic schedule changes based on events
- Weather-based behavior modifications
- Group activities (multiple NPCs together)
