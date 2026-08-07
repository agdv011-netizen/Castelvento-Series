# Task 5.2: Time & Energy System — Detailed Implementation Specification

## 📋 Overview
This document provides a comprehensive technical specification for implementing the **Time & Energy System** in Castelvento 1940s. This is a **P0 Critical Path** feature that forms the core resource management layer of the game.

---

## 🎯 Core Objectives

Implement a dual-resource system where:
1. **Time** flows continuously and limits daily activities
2. **Energy** depletes with actions and forces rest when exhausted
3. Both resources interlock to create meaningful player choices

---

## 🏗️ Architecture

### File Structure
```
src/
├── stores/
│   ├── timeStore.ts          # Zeitgeist store for time management
│   ├── energyStore.ts        # Energy state and actions
│   └── combinedGameStore.ts  # Optional: unified store if preferred
├── utils/
│   ├── timeFormatter.ts      # Time display utilities
│   └── actionCosts.ts        # Configuration for action costs
├── components/
│   ├── hud/
│   │   ├── TimeDisplay.tsx   # Clock widget
│   │   └── EnergyBar.tsx     # Energy visualization
│   └── modals/
│       └── LowEnergyWarning.tsx
└── types/
    └── time.ts               # TypeScript interfaces
```

---

## ⏰ Time System

### Data Model

```typescript
// src/types/time.ts
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface TimeState {
  minutesSinceMidnight: number; // 0-1439 (24*60-1)
  dayNumber: number;            // Day 1, 2, 3...
  isSleeping: boolean;          // Prevents actions during sleep
}

export interface TimeActions {
  spendTime: (minutes: number) => void;
  setToMorning: () => void;
  forceSleep: () => void;
  getTimeOfDay: () => TimeOfDay;
  getFormattedTime: () => string;
  reset: () => void;
}
```

### Store Implementation

```typescript
// src/stores/timeStore.ts
import { create } from 'zustand';
import { TimeState, TimeActions, TimeOfDay } from '../types/time';

type TimeStore = TimeState & TimeActions;

const DEFAULT_STATE: TimeState = {
  minutesSinceMidnight: 8 * 60, // Start at 8:00 AM
  dayNumber: 1,
  isSleeping: false,
};

export const useTimeStore = create<TimeStore>((set, get) => ({
  ...DEFAULT_STATE,

  spendTime: (minutes: number) => {
    const { minutesSinceMidnight, dayNumber, isSleeping } = get();
    
    if (isSleeping) return; // Block time passage during sleep
    
    let newMinutes = minutesSinceMidnight + minutes;
    let newDay = dayNumber;
    
    // Handle day rollover
    if (newMinutes >= 1440) { // 24 hours in minutes
      newMinutes = newMinutes % 1440;
      newDay += 1;
    }
    
    // Auto-sleep at 10 PM (22:00 = 1320 minutes)
    if (newMinutes >= 1320 && !get().isSleeping) {
      set({ isSleeping: true });
      // Trigger sleep modal via event or callback
      setTimeout(() => {
        get().forceSleep();
      }, 2000);
    }
    
    set({ 
      minutesSinceMidnight: newMinutes, 
      dayNumber: newDay 
    });
  },

  setToMorning: () => {
    set({ 
      minutesSinceMidnight: 8 * 60, // 8:00 AM
      isSleeping: false 
    });
  },

  forceSleep: () => {
    set({ isSleeping: true });
    // Simulate sleep duration (8 hours = 480 minutes)
    setTimeout(() => {
      set({
        minutesSinceMidnight: 8 * 60,
        dayNumber: get().dayNumber + 1,
        isSleeping: false,
      });
      // Reset energy store here via callback
    }, 1500); // 1.5s animation
  },

  getTimeOfDay: (): TimeOfDay => {
    const { minutesSinceMidnight } = get();
    
    if (minutesSinceMidnight < 12 * 60) return 'morning';      // Before noon
    if (minutesSinceMidnight < 18 * 60) return 'afternoon';    // Before 6 PM
    if (minutesSinceMidnight < 22 * 60) return 'evening';      // Before 10 PM
    return 'night';
  },

  getFormattedTime: (): string => {
    const { minutesSinceMidnight } = get();
    const hours = Math.floor(minutesSinceMidnight / 60);
    const mins = minutesSinceMidnight % 60;
    
    // 24-hour format: "14:30"
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  },

  reset: () => set(DEFAULT_STATE),
}));
```

### Time Formatter Utility

```typescript
// src/utils/timeFormatter.ts
export function formatTime12Hour(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12; // Convert 0 to 12
  
  return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
}

export function formatTime24Hour(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function getTimeLabel(minutes: number): string {
  if (minutes < 12 * 60) return 'Morning';
  if (minutes < 18 * 60) return 'Afternoon';
  if (minutes < 22 * 60) return 'Evening';
  return 'Night';
}
```

### Action Costs Configuration

```typescript
// src/utils/actionCosts.ts
export interface ActionCost {
  timeMinutes: number;
  energyDrain: number;
}

export const ACTION_COSTS: Record<string, ActionCost> = {
  // Work Actions
  'WORK_MARKET': { timeMinutes: 60, energyDrain: 20 },
  'WORK_DELIVERY': { timeMinutes: 45, energyDrain: 15 },
  'WORK_FISHING': { timeMinutes: 90, energyDrain: 25 },
  
  // Exploration
  'EXPLORE_STREET': { timeMinutes: 15, energyDrain: 5 },
  'EXPLORE_BEACH': { timeMinutes: 20, energyDrain: 5 },
  'EXPLORE_CHURCH': { timeMinutes: 10, energyDrain: 3 },
  
  // Social
  'TALK_FRIEND': { timeMinutes: 10, energyDrain: 2 },
  'TALK_NPC': { timeMinutes: 5, energyDrain: 2 },
  'GIVE_GIFT': { timeMinutes: 5, energyDrain: 3 },
  
  // Rest & Recovery
  'REST_BED': { timeMinutes: 60, energyDrain: -50 }, // Negative = restore
  'REST_CAFE': { timeMinutes: 30, energyDrain: -20 },
  'REST_PARK': { timeMinutes: 20, energyDrain: -10 },
  
  // Travel
  'WALK_SHORT': { timeMinutes: 5, energyDrain: 2 },
  'WALK_LONG': { timeMinutes: 15, energyDrain: 5 },
  'BIKE_RIDE': { timeMinutes: 10, energyDrain: 3 },
  
  // Special
  'MINI_GAME': { timeMinutes: 30, energyDrain: 10 },
  'CUTSCENE': { timeMinutes: 5, energyDrain: 0 },
};
```

---

## ⚡ Energy System

### Data Model

```typescript
// src/types/energy.ts
export interface EnergyState {
  current: number;        // 0-100
  max: number;            // Usually 100
  warningShown: boolean;  // Track if low energy warning displayed
}

export interface EnergyActions {
  addEnergy: (amount: number) => void;
  drainEnergy: (amount: number) => void;
  setEnergy: (value: number) => void;
  reset: () => void;
  getEnergyPercent: () => number;
  getEnergyColor: () => string;
}
```

### Store Implementation

```typescript
// src/stores/energyStore.ts
import { create } from 'zustand';
import { EnergyState, EnergyActions } from '../types/energy';

type EnergyStore = EnergyState & EnergyActions;

const DEFAULT_STATE: EnergyState = {
  current: 100,
  max: 100,
  warningShown: false,
};

export const useEnergyStore = create<EnergyStore>((set, get) => ({
  ...DEFAULT_STATE,

  addEnergy: (amount: number) => {
    const { current, max } = get();
    const newValue = Math.min(max, current + amount);
    set({ current: newValue, warningShown: false });
  },

  drainEnergy: (amount: number) => {
    const { current, warningShown } = get();
    const newValue = Math.max(0, current - amount);
    
    set({ current: newValue });
    
    // Trigger warning if below threshold
    if (newValue < 10 && !warningShown) {
      set({ warningShown: true });
      // Show low energy modal via callback or event
    }
    
    // Force sleep if reaches 0
    if (newValue === 0) {
      setTimeout(() => {
        // Import time store dynamically to avoid circular dependency
        import('../stores/timeStore').then(({ useTimeStore }) => {
          useTimeStore.getState().forceSleep();
        });
      }, 1000);
    }
  },

  setEnergy: (value: number) => {
    set({ current: Math.max(0, Math.min(100, value)) });
  },

  reset: () => set(DEFAULT_STATE),

  getEnergyPercent: (): number => {
    const { current, max } = get();
    return (current / max) * 100;
  },

  getEnergyColor: (): string => {
    const percent = get().getEnergyPercent();
    
    if (percent > 60) return '#4ade80'; // Green
    if (percent > 30) return '#facc15'; // Yellow
    return '#f87171';                   // Red
  },
}));
```

---

## 🎨 UI Components

### Time Display Widget

```tsx
// src/components/hud/TimeDisplay.tsx
import React from 'react';
import { useTimeStore } from '../../stores/timeStore';
import { formatTime12Hour, getTimeLabel } from '../../utils/timeFormatter';
import './TimeDisplay.css';

export const TimeDisplay: React.FC = () => {
  const { minutesSinceMidnight, dayNumber, getTimeOfDay } = useTimeStore();
  const timeOfDay = getTimeOfDay();
  
  // Dynamic background based on time
  const getBackgroundClass = () => {
    switch (timeOfDay) {
      case 'morning': return 'time-bg-morning';
      case 'afternoon': return 'time-bg-afternoon';
      case 'evening': return 'time-bg-evening';
      case 'night': return 'time-bg-night';
      default: return 'time-bg-morning';
    }
  };

  return (
    <div className={`time-display ${getBackgroundClass()}`}>
      <div className="time-icon">
        {timeOfDay === 'night' ? '🌙' : '☀️'}
      </div>
      <div className="time-content">
        <span className="time-value">
          {formatTime12Hour(minutesSinceMidnight)}
        </span>
        <span className="time-label">
          Day {dayNumber} • {getTimeLabel(minutesSinceMidnight)}
        </span>
      </div>
    </div>
  );
};
```

```css
/* src/components/hud/TimeDisplay.css */
.time-display {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: background-color 0.5s ease;
}

.time-bg-morning {
  background: linear-gradient(135deg, rgba(255, 200, 150, 0.9), rgba(255, 180, 120, 0.9));
  color: #5d4e37;
}

.time-bg-afternoon {
  background: linear-gradient(135deg, rgba(255, 220, 150, 0.9), rgba(255, 200, 100, 0.9));
  color: #5d4e37;
}

.time-bg-evening {
  background: linear-gradient(135deg, rgba(255, 150, 100, 0.9), rgba(200, 100, 150, 0.9));
  color: #fff;
}

.time-bg-night {
  background: linear-gradient(135deg, rgba(50, 50, 100, 0.9), rgba(30, 30, 60, 0.9));
  color: #e0e0ff;
}

.time-icon {
  font-size: 28px;
  animation: pulse 2s infinite;
}

.time-content {
  display: flex;
  flex-direction: column;
}

.time-value {
  font-size: 20px;
  font-weight: 700;
  font-family: 'Courier Prime', monospace;
  letter-spacing: 1px;
}

.time-label {
  font-size: 12px;
  opacity: 0.85;
  font-style: italic;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

### Energy Bar Component

```tsx
// src/components/hud/EnergyBar.tsx
import React from 'react';
import { useEnergyStore } from '../../stores/energyStore';
import { motion } from 'framer-motion';
import './EnergyBar.css';

export const EnergyBar: React.FC = () => {
  const { current, max, getEnergyPercent, getEnergyColor } = useEnergyStore();
  const percent = getEnergyPercent();
  const color = getEnergyColor();

  return (
    <div className="energy-container">
      <div className="energy-header">
        <span className="energy-icon">⚡</span>
        <span className="energy-label">Energy</span>
        <span className="energy-value">{current}/{max}</span>
      </div>
      
      <div className="energy-bar-track">
        <motion.div
          className="energy-bar-fill"
          initial={{ width: '100%' }}
          animate={{ width: `${percent}%` }}
          transition={{ 
            type: 'spring',
            stiffness: 300,
            damping: 30,
            duration: 0.5
          }}
          style={{ backgroundColor: color }}
        />
      </div>
      
      {/* Decorative particles when energy is low */}
      {percent < 20 && (
        <div className="energy-particles">
          {[...Array(5)].map((_, i) => (
            <motion.span
              key={i}
              className="particle"
              initial={{ y: 0, opacity: 1 }}
              animate={{ y: -20, opacity: 0 }}
              transition={{ 
                duration: 1, 
                delay: i * 0.2, 
                repeat: Infinity 
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
```

```css
/* src/components/hud/EnergyBar.css */
.energy-container {
  width: 200px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.energy-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #5d4e37;
}

.energy-icon {
  font-size: 18px;
}

.energy-bar-track {
  width: 100%;
  height: 16px;
  background: #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #d4c4a8;
}

.energy-bar-fill {
  height: 100%;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.energy-particles {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #f87171;
  border-radius: 50%;
  left: calc(20% + (var(--i) * 15%));
}
```

### Low Energy Warning Modal

```tsx
// src/components/modals/LowEnergyWarning.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEnergyStore } from '../../stores/energyStore';
import './LowEnergyWarning.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRest: () => void;
}

export const LowEnergyWarning: React.FC<Props> = ({ isOpen, onClose, onRest }) => {
  const { current } = useEnergyStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className="warning-modal"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <div className="warning-icon">😴</div>
            
            <h2>You're Exhausted!</h2>
            
            <p className="warning-text">
              Your energy is critically low ({current}/100). 
              Continuing without rest may cause you to pass out.
            </p>
            
            <div className="warning-options">
              <button className="btn-secondary" onClick={onClose}>
                Keep Going (Risky)
              </button>
              <button className="btn-primary" onClick={onRest}>
                Go to Bed
              </button>
            </div>
            
            <div className="warning-tips">
              <p><strong>Tips:</strong></p>
              <ul>
                <li>Visit the café for a quick boost (+20)</li>
                <li>Rest in bed for full recovery (+50)</li>
                <li>Avoid strenuous activities until recovered</li>
              </ul>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
```

---

## 🔄 Integration Points

### Combining Time and Energy in Actions

```typescript
// src/hooks/useAction.ts
import { useCallback } from 'react';
import { useTimeStore } from '../stores/timeStore';
import { useEnergyStore } from '../stores/energyStore';
import { ACTION_COSTS, ActionCost } from '../utils/actionCosts';

export function useAction() {
  const spendTime = useTimeStore(state => state.spendTime);
  const drainEnergy = useEnergyStore(state => state.drainEnergy);
  const addEnergy = useEnergyStore(state => state.addEnergy);

  const performAction = useCallback((actionKey: string): boolean => {
    const cost: ActionCost | undefined = ACTION_COSTS[actionKey];
    
    if (!cost) {
      console.warn(`Unknown action: ${actionKey}`);
      return false;
    }

    const { current: energy } = useEnergyStore.getState();
    
    // Check if player has enough energy (unless it's a resting action)
    if (cost.energyDrain > 0 && energy < cost.energyDrain) {
      // Show insufficient energy modal
      return false;
    }

    // Apply costs
    spendTime(cost.timeMinutes);
    
    if (cost.energyDrain > 0) {
      drainEnergy(cost.energyDrain);
    } else if (cost.energyDrain < 0) {
      addEnergy(Math.abs(cost.energyDrain));
    }

    return true;
  }, [spendTime, drainEnergy, addEnergy]);

  return { performAction };
}
```

### Example Usage in Game Scene

```tsx
// src/scenes/market/MarketScene.tsx
import React from 'react';
import { useAction } from '../../hooks/useAction';

export const MarketScene: React.FC = () => {
  const { performAction } = useAction();

  const handleWorkAtMarket = () => {
    const success = performAction('WORK_MARKET');
    
    if (success) {
      // Add money reward
      // Show completion message
      console.log('Worked at market for 1 hour, earned ₤20');
    } else {
      // Show error: not enough energy
      console.log('Too tired to work!');
    }
  };

  return (
    <div className="market-scene">
      <button onClick={handleWorkAtMarket}>
        Help at Market (-20 Energy, -60 min)
      </button>
    </div>
  );
};
```

---

## 🧪 Testing Scenarios

### Unit Tests

```typescript
// src/stores/__tests__/timeStore.test.ts
import { describe, it, expect } from 'vitest';
import { useTimeStore } from '../timeStore';

describe('TimeStore', () => {
  beforeEach(() => {
    useTimeStore.setState({
      minutesSinceMidnight: 8 * 60,
      dayNumber: 1,
      isSleeping: false,
    });
  });

  it('starts at 8:00 AM', () => {
    const state = useTimeStore.getState();
    expect(state.getFormattedTime()).toBe('08:00');
  });

  it('advances time correctly', () => {
    useTimeStore.getState().spendTime(60);
    expect(useTimeStore.getState().getFormattedTime()).toBe('09:00');
  });

  it('handles day rollover', () => {
    useTimeStore.setState({ minutesSinceMidnight: 23 * 60 + 30 });
    useTimeStore.getState().spendTime(60);
    
    const state = useTimeStore.getState();
    expect(state.dayNumber).toBe(2);
    expect(state.getFormattedTime()).toBe('00:30');
  });

  it('triggers auto-sleep at 10 PM', () => {
    useTimeStore.setState({ minutesSinceMidnight: 21 * 60 + 55 });
    useTimeStore.getState().spendTime(10);
    
    expect(useTimeStore.getState().isSleeping).toBe(true);
  });

  it('returns correct time of day', () => {
    useTimeStore.setState({ minutesSinceMidnight: 10 * 60 });
    expect(useTimeStore.getState().getTimeOfDay()).toBe('morning');

    useTimeStore.setState({ minutesSinceMidnight: 15 * 60 });
    expect(useTimeStore.getState().getTimeOfDay()).toBe('afternoon');

    useTimeStore.setState({ minutesSinceMidnight: 20 * 60 });
    expect(useTimeStore.getState().getTimeOfDay()).toBe('evening');

    useTimeStore.setState({ minutesSinceMidnight: 23 * 60 });
    expect(useTimeStore.getState().getTimeOfDay()).toBe('night');
  });
});
```

### Edge Cases to Handle

1. **Midnight Crossover**: Ensure day increments correctly
2. **Negative Time**: Block or clamp negative time values
3. **Energy Overflow**: Cap energy at maximum (100)
4. **Energy Underflow**: Floor energy at minimum (0)
5. **Simultaneous Actions**: Queue or block concurrent action execution
6. **Save/Load Persistence**: Serialize time and energy state correctly
7. **Modal Blocking**: Prevent actions while modals are open
8. **Fast Clicking**: Debounce rapid action triggers

---

## 🎯 Acceptance Criteria Checklist

### Functional Requirements
- [ ] Time starts at 8:00 AM on Day 1
- [ ] Time advances correctly based on action costs
- [ ] Day increments after midnight (automatic or via sleep)
- [ ] Auto-sleep triggers at 10:00 PM
- [ ] Forced sleep occurs at 0 energy
- [ ] Energy drains with actions per configuration
- [ ] Energy restores with rest actions
- [ ] Low energy warning appears below 10 energy
- [ ] Cannot perform actions with insufficient energy
- [ ] Time of day affects available activities (shops, NPCs)

### UI/UX Requirements
- [ ] Time display shows formatted time (12 or 24 hour)
- [ ] Day counter visible
- [ ] Time-of-day label (Morning/Afternoon/Evening/Night)
- [ ] Sun/Moon icon changes based on time
- [ ] Energy bar shows current/max values
- [ ] Energy bar color changes (green → yellow → red)
- [ ] Smooth animations on energy changes
- [ ] Particle effects when energy critical
- [ ] Warning modal is non-intrusive but clear
- [ ] All UI elements responsive on mobile

### Technical Requirements
- [ ] State persisted across page reloads (localStorage)
- [ ] No memory leaks in timers or intervals
- [ ] 60 FPS performance maintained
- [ ] No circular dependencies between stores
- [ ] TypeScript types fully defined
- [ ] Unit tests pass (>90% coverage)
- [ ] Works offline (no network calls)
- [ ] Compatible with save/load system

### Accessibility
- [ ] Color-blind friendly energy bar (add patterns/icons)
- [ ] Screen reader announces time and energy changes
- [ ] Keyboard navigation for modals
- [ ] Sufficient contrast ratios on all text

---

## 🔧 Configuration Options

### Game Balance Tuning

```typescript
// src/config/gameBalance.ts
export const GAME_BALANCE = {
  time: {
    START_HOUR: 8,
    END_HOUR: 22,
    MINUTES_PER_DAY: 1440,
    AUTO_SLEEP_WARNING_MINUTES: 60, // Warn 1 hour before auto-sleep
  },
  energy: {
    MAX: 100,
    START: 100,
    WARNING_THRESHOLD: 10,
    CRITICAL_THRESHOLD: 5,
    REST_BED_RECOVERY: 50,
    REST_CAFE_RECOVERY: 20,
  },
  penalties: {
    PASS_OUT_TIME_LOSS: 120, // Lose 2 hours if pass out
    PASS_OUT_MONEY_LOSS: 10, // Drop some money
  },
};
```

---

## 📦 Dependencies

No additional npm packages required beyond existing setup:
- ✅ Zustand (already installed)
- ✅ Framer Motion (already installed)
- ✅ React (already installed)
- ✅ TypeScript (already installed)

---

## 🚀 Implementation Order

1. **Phase 1**: Create TypeScript types and interfaces
2. **Phase 2**: Implement `timeStore.ts` with basic actions
3. **Phase 3**: Implement `energyStore.ts` with basic actions
4. **Phase 4**: Create utility functions (formatters, action costs)
5. **Phase 5**: Build UI components (TimeDisplay, EnergyBar)
6. **Phase 6**: Create `useAction` hook for integration
7. **Phase 7**: Implement LowEnergyWarning modal
8. **Phase 8**: Write unit tests
9. **Phase 9**: Test edge cases and scenarios
10. **Phase 10**: Polish animations and visual feedback

---

## 💡 Developer Notes

- **Avoid Circular Dependencies**: Import stores dynamically if needed
- **Use Selectors**: Optimize re-renders with Zustand selectors
- **Batch Updates**: Group state changes when possible
- **Debug Tools**: Add logging in development mode
- **Performance**: Use `shallow` equality check for complex objects

Example optimized selector:
```tsx
const currentTime = useTimeStore(state => state.getFormattedTime());
const currentEnergy = useEnergyStore(state => state.current);
```

---

## 🎬 Example User Flow

```
Player wakes up (Day 1, 8:00 AM, 100 Energy)
  ↓
Chooses to work at market (ACTION: WORK_MARKET)
  ↓
System checks: Energy 100 >= 20? ✅
  ↓
Applies costs: -60 minutes, -20 energy
  ↓
Updates state: 9:00 AM, 80 Energy
  ↓
Adds reward: +₤20
  ↓
Player explores town (ACTION: EXPLORE_STREET × 3)
  ↓
Updates state: 9:45 AM, 65 Energy
  ↓
Player visits café (ACTION: REST_CAFE)
  ↓
Applies costs: -30 minutes, +20 energy
  ↓
Updates state: 10:15 AM, 85 Energy
  ↓
Continues day...
  ↓
10:00 PM reached → Auto-sleep triggered
  ↓
Fade to black → Next day: 8:00 AM, 100 Energy, Day 2
```

---

## 🐛 Known Issues & Solutions

| Issue | Solution |
|-------|----------|
| Rapid clicking bypasses energy check | Add debounce (300ms) to action trigger |
| Time displays incorrectly on load | Ensure persistence middleware runs before render |
| Energy bar jitters on small screens | Use CSS `transform: scaleX()` instead of `width` |
| Modal doesn't close on escape | Add keyboard event listener with cleanup |
| Save file grows too large | Only persist essential fields, not computed values |

---

## ✅ Final Checklist for Developer

Before marking this task complete, verify:

- [ ] All files created in correct directory structure
- [ ] TypeScript compiles without errors
- [ ] All unit tests pass
- [ ] Manual testing completed for all scenarios
- [ ] Edge cases handled gracefully
- [ ] UI matches design mockups
- [ ] Animations smooth at 60 FPS
- [ ] Mobile touch interactions work
- [ ] Accessibility features implemented
- [ ] Code commented where non-obvious
- [ ] No console warnings or errors
- [ ] Performance profile shows no issues
- [ ] Integrated with main menu and HUD
- [ ] Save/load tested with time and energy state
- [ ] Documentation updated

---

**Status**: Ready for Implementation  
**Priority**: P0 (Critical Path)  
**Estimated Complexity**: Medium-High  
**Dependencies**: None (core system)
