# Task 8.2: Floating Action Buttons (Notebook & Backpack) — Detailed Implementation Specification

## 📋 Overview

**Task ID:** 8.2  
**Title:** Floating Action Buttons (Notebook & Backpack)  
**Priority:** P0 (Critical Path)  
**Parent Feature:** UI/HUD System  
**Dependencies:** Task 8.1 (Top HUD), Task 5.4 (Inventory System), Task 5.5 (Quest System)  

---

## 🎯 Objective

Создать динамические плавающие кнопки быстрого доступа к инвентарю (Backpack) и журналу заданий (Notebook) с визуальной обратной связью, анимациями состояний и интеграцией с системами игры.

---

## 🏗️ Architecture

### Component Hierarchy

```
src/
├── client/
│   ├── components/
│   │   └── ui/
│   │       ├── FloatingActionButton/
│   │       │   ├── FloatingActionButton.tsx
│   │       │   ├── FloatingActionButton.styles.ts
│   │       │   └── index.ts
│   │       ├── BackpackButton/
│   │       │   ├── BackpackButton.tsx
│   │       │   ├── BackpackButton.animations.ts
│   │       │   └── index.ts
│   │       ├── NotebookButton/
│   │       │   ├── NotebookButton.tsx
│   │       │   ├── NotebookButton.animations.ts
│   │       │   └── index.ts
│   │       └── HUD/
│   │           └── FloatingButtonsContainer.tsx
│   └── stores/
│       ├── uiStore.ts (состояние кнопок)
│       ├── inventoryStore.ts (для бейджей инвентаря)
│       └── questStore.ts (для бейджей квестов)
```

---

## 📦 Data Structures

### 1. Button State Interface

```typescript
// src/client/components/ui/FloatingActionButton/FloatingActionButton.types.ts

export type ButtonState = 'normal' | 'active' | 'notification' | 'disabled';

export interface FloatingActionButtonProps {
  /** Уникальный идентификатор кнопки */
  id: 'backpack' | 'notebook';
  
  /** Текущее состояние */
  state: ButtonState;
  
  /** Текст бейджа (например, "7/16" или "3!") */
  badgeText?: string;
  
  /** Тип бейджа: count (количество) или notification (восклицание) */
  badgeType?: 'count' | 'notification' | 'none';
  
  /** Tooltip текст при наведении */
  tooltip?: string;
  
  /** Callback при клике */
  onClick: () => void;
  
  /** Callback при долгом нажатии (mobile) */
  onLongPress?: () => void;
  
  /** Показывать ли кнопку */
  isVisible: boolean;
  
  /** Z-index для позиционирования */
  zIndex?: number;
}

export interface ButtonAnimationConfig {
  /** Длительность анимации появления (ms) */
  enterDuration: number;
  
  /** Длительность анимации исчезновения (ms) */
  exitDuration: number;
  
  /** Длительность анимации уведомления (ms) */
  notificationDuration: number;
  
  /** Амплитуда idle-анимации (px) */
  idleAmplitude: number;
  
  /** Частота idle-анимации (Hz) */
  idleFrequency: number;
}
```

### 2. UI Store State

```typescript
// src/client/stores/uiStore.ts

import { create } from 'zustand';

interface FloatingButtonState {
  // Backpack button
  isBackpackVisible: boolean;
  backpackItemCount: number;
  backpackMaxCapacity: number;
  hasNewBackpackItem: boolean;
  
  // Notebook button
  isNotebookVisible: boolean;
  unreadQuestCount: number;
  hasNewQuest: boolean;
  allQuestsComplete: boolean;
  
  // Actions
  showBackpack: () => void;
  hideBackpack: () => void;
  updateBackpackCount: (count: number, max: number) => void;
  triggerBackpackNotification: () => void;
  clearBackpackNotification: () => void;
  
  showNotebook: () => void;
  hideNotebook: () => void;
  updateQuestCount: (unread: number, allComplete: boolean) => void;
  triggerQuestNotification: () => void;
  clearQuestNotification: () => void;
  
  // Modals
  isInventoryModalOpen: boolean;
  isQuestLogModalOpen: boolean;
  openInventoryModal: () => void;
  closeInventoryModal: () => void;
  openQuestLogModal: () => void;
  closeQuestLogModal: () => void;
}

export const useUIStore = create<FloatingButtonState>((set, get) => ({
  // Initial state
  isBackpackVisible: false,
  backpackItemCount: 0,
  backpackMaxCapacity: 16,
  hasNewBackpackItem: false,
  
  isNotebookVisible: false,
  unreadQuestCount: 0,
  hasNewQuest: false,
  allQuestsComplete: false,
  
  isInventoryModalOpen: false,
  isQuestLogModalOpen: false,
  
  // Backpack actions
  showBackpack: () => set({ isBackpackVisible: true }),
  hideBackpack: () => set({ isBackpackVisible: false }),
  
  updateBackpackCount: (count, max) => set({ 
    backpackItemCount: count, 
    backpackMaxCapacity: max 
  }),
  
  triggerBackpackNotification: () => set({ hasNewBackpackItem: true }),
  clearBackpackNotification: () => set({ hasNewBackpackItem: false }),
  
  // Notebook actions
  showNotebook: () => set({ isNotebookVisible: true }),
  hideNotebook: () => set({ isNotebookVisible: false }),
  
  updateQuestCount: (unread, allComplete) => set({ 
    unreadQuestCount: unread,
    allQuestsComplete: allComplete 
  }),
  
  triggerQuestNotification: () => set({ hasNewQuest: true }),
  clearQuestNotification: () => set({ hasNewQuest: false }),
  
  // Modal actions
  openInventoryModal: () => set({ isInventoryModalOpen: true }),
  closeInventoryModal: () => set({ isInventoryModalOpen: false }),
  openQuestLogModal: () => set({ isQuestLogModalOpen: true }),
  closeQuestLogModal: () => set({ isQuestLogModalOpen: false }),
}));
```

---

## 🎨 Visual Design Specifications

### 1. Backpack Button

**Размеры:**
- Desktop: 64x64px (основной круг), 24x16px (бейдж)
- Mobile: 80x80px (основной круг), 28x20px (бейдж)
- Минимальная тач-зона: 48x48px (требование accessibility)

**Позиционирование:**
- Desktop: bottom: 32px, right: 32px
- Mobile: bottom: 24px, right: 24px
- Fixed positioning относительно viewport

**Цветовая палитра:**
```typescript
const backpackColors = {
  base: '#8B7355',        // Leather brown
  highlight: '#D2B48C',   // Tan highlight
  shadow: '#5C4033',      // Dark brown shadow
  badge: '#E63946',       // Notification red
  badgeText: '#FFFFFF',   // White text
  disabled: '#A0A0A0',    // Gray when disabled
};
```

**Состояния (States):**

| Состояние | Визуальное описание | Анимация |
|-----------|---------------------|----------|
| **Normal** | Закрытый рюкзак, нейтральный цвет | Idle float (2px up/down, 3s цикл) |
| **New Item** | Рюкзак с восклицательным знаком, красный бейдж | Wiggle (3 rapid shakes), pulse glow |
| **Active/Pressed** | Рюкзак слегка открывается | Scale down to 0.95, shadow reduces |
| **Empty** | Рюкзак полупрозрачный (opacity: 0.7) | Нет idle анимации |
| **Disabled** | Серый, non-interactive | Нет анимаций |

**Icon Asset Requirements:**
- Формат: SVG для основной иконки, PNG для текстур кожи
- Слои: Base layer, Highlight layer, Badge layer, Exclamation mark layer
- Разрешение: 2x для Retina дисплеев (128x128px minimum)

### 2. Notebook Button

**Размеры:**
- Desktop: 64x64px (основной круг), 24x16px (бейдж)
- Mobile: 80x80px (основной круг), 28x20px (бейдж)

**Позиционирование:**
- Desktop: bottom: 32px, left: 32px
- Mobile: bottom: 24px, left: 24px

**Цветовая палитра:**
```typescript
const notebookColors = {
  base: '#6F4E37',        // Leather brown (darker)
  pages: '#F5F5DC',       // Beige pages
  quill: '#FFD700',       // Gold quill
  ribbon: '#C41E3A',      // Cardinal red ribbon
  badge: '#457B9D',       // Quest blue
  badgeText: '#FFFFFF',
};
```

**Состояния (States):**

| Состояние | Визуальное описание | Анимация |
|-----------|---------------------|----------|
| **Normal** | Плоский блокнот | Idle float (2px up/down, 3s цикл) |
| **New Quest** | Блокнот с пером, синий бейдж с "!" | Bounce (vertical jump), quill appears |
| **All Complete** | Видна красная лента-закладка | Ribbon wave animation |
| **Active/Pressed** | Блокнот слегка открывается | Scale down to 0.95, pages flip slightly |

---

## ⚙️ Implementation Details

### 1. Base FloatingActionButton Component

```typescript
// src/client/components/ui/FloatingActionButton/FloatingActionButton.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useTooltip } from '../Tooltip/TooltipContext';
import { FloatingActionButtonProps, ButtonState } from './FloatingActionButton.types';
import { 
  enterAnimation, 
  exitAnimation, 
  idleAnimation, 
  notificationAnimation,
  clickAnimation 
} from './FloatingActionButton.animations';
import * as S from './FloatingActionButton.styles';

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  id,
  state,
  badgeText,
  badgeType = 'none',
  tooltip,
  onClick,
  onLongPress,
  isVisible,
  zIndex = 1000,
  children, // Icon component
}) => {
  const isMobile = useIsMobile();
  const { showTooltip, hideTooltip } = useTooltip();
  const [isPressed, setIsPressed] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  // Handle press start (for long press detection)
  const handlePressStart = useCallback(() => {
    setIsPressed(true);
    
    if (isMobile && onLongPress) {
      const timer = setTimeout(() => {
        onLongPress();
        setIsPressed(false);
      }, 500); // 500ms for long press
      
      setLongPressTimer(timer);
    }
  }, [isMobile, onLongPress]);

  // Handle press end/release
  const handlePressEnd = useCallback(() => {
    setIsPressed(false);
    
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  // Handle click
  const handleClick = useCallback(() => {
    if (!longPressTimer) {
      onClick();
    }
  }, [longPressTimer, onClick]);

  // Determine animation state
  const getAnimationVariant = (): string => {
    if (!isVisible) return 'exit';
    if (state === 'notification') return 'notification';
    if (isPressed) return 'pressed';
    return 'idle';
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <S.ButtonContainer
          initial="exit"
          animate={getAnimationVariant()}
          exit="exit"
          variants={{
            enter: enterAnimation,
            exit: exitAnimation,
            idle: idleAnimation,
            notification: notificationAnimation,
            pressed: clickAnimation,
          }}
          style={{ zIndex }}
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          onClick={handleClick}
          onMouseEnter={() => !isMobile && tooltip && showTooltip(tooltip)}
          onMouseLeave={() => !isMobile && hideTooltip()}
          role="button"
          aria-label={id === 'backpack' ? 'Open inventory' : 'Open quest log'}
          aria-haspopup="dialog"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleClick();
            }
          }}
        >
          {/* Main Icon */}
          <S.IconWrapper>{children}</S.IconWrapper>
          
          {/* Badge */}
          {badgeType !== 'none' && badgeText && (
            <S.Badge 
              badgeType={badgeType}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              {badgeText}
            </S.Badge>
          )}
          
          {/* Notification Glow Effect */}
          {state === 'notification' && (
            <S.NotificationGlow
              animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </S.ButtonContainer>
      )}
    </AnimatePresence>
  );
};
```

### 2. Animation Configurations

```typescript
// src/client/components/ui/FloatingActionButton/FloatingActionButton.animations.ts

import { Variants } from 'framer-motion';

export const enterAnimation: Variants = {
  enter: {
    scale: 0,
    opacity: 0,
    rotate: -180,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
      delay: 0.1,
    },
  },
};

export const exitAnimation: Variants = {
  exit: {
    scale: 0,
    opacity: 0,
    rotate: 180,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

export const idleAnimation: Variants = {
  idle: {
    y: [-2, 2, -2],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const notificationAnimation: Variants = {
  notification: {
    scale: [1, 1.1, 1],
    rotate: [-5, 5, -5, 5, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatDelay: 2,
    },
  },
};

export const clickAnimation: Variants = {
  pressed: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
};

// Notification pulse for glow effect
export const notificationPulse = {
  opacity: [0.5, 1, 0.5],
  scale: [1, 1.2, 1],
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};
```

### 3. Styled Components

```typescript
// src/client/components/ui/FloatingActionButton/FloatingActionButton.styles.ts

import styled from 'styled-components';
import { motion } from 'framer-motion';

export const ButtonContainer = styled(motion.button)`
  position: fixed;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(145deg, #8B7355, #6F4E37);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.2);
  cursor: pointer;
  outline: none;
  overflow: visible;
  touch-action: manipulation;
  
  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
  }
  
  &:focus-visible {
    box-shadow: 
      0 0 0 3px #FFD700,
      0 4px 8px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    box-shadow: 
      0 2px 4px rgba(0, 0, 0, 0.3),
      inset 0 2px 4px rgba(255, 255, 255, 0.2);
  }
`;

export const IconWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
`;

export const Badge = styled(motion.div)<{ badgeType: 'count' | 'notification' }>`
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 24px;
  height: 16px;
  padding: 2px 6px;
  border-radius: 12px;
  background: ${({ badgeType }) => badgeType === 'notification' ? '#E63946' : '#457B9D'};
  color: #FFFFFF;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
  line-height: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  z-index: 3;
  
  @media (max-width: 768px) {
    min-width: 28px;
    height: 20px;
    font-size: 13px;
    line-height: 20px;
    top: -6px;
    right: -6px;
  }
`;

export const NotificationGlow = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.6) 0%, transparent 70%);
  z-index: 1;
  pointer-events: none;
  
  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
  }
`;
```

### 4. BackpackButton Component

```typescript
// src/client/components/ui/BackpackButton/BackpackButton.tsx

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBackpack } from '@fortawesome/pro-solid-svg-icons';
import { FloatingActionButton } from '../FloatingActionButton/FloatingActionButton';
import { useUIStore } from '../../stores/uiStore';
import { useInventoryStore } from '../../stores/inventoryStore';
import * as A from './BackpackButton.animations';

export const BackpackButton: React.FC = () => {
  const {
    isBackpackVisible,
    backpackItemCount,
    backpackMaxCapacity,
    hasNewBackpackItem,
    openInventoryModal,
    clearBackpackNotification,
  } = useUIStore();
  
  const items = useInventoryStore((state) => state.items);

  // Determine button state
  const getState = (): 'normal' | 'notification' | 'disabled' => {
    if (!isBackpackVisible) return 'disabled';
    if (hasNewBackpackItem) return 'notification';
    return 'normal';
  };

  // Determine badge
  const getBadge = () => {
    if (hasNewBackpackItem) return { text: '!', type: 'notification' as const };
    if (backpackItemCount > 0) return { text: `${backpackItemCount}/${backpackMaxCapacity}`, type: 'count' as const };
    return { text: undefined, type: 'none' as const };
  };

  const handleClick = () => {
    clearBackpackNotification();
    openInventoryModal();
  };

  const badge = getBadge();

  return (
    <FloatingActionButton
      id="backpack"
      state={getState()}
      badgeText={badge.text}
      badgeType={badge.type}
      tooltip="Inventory"
      onClick={handleClick}
      isVisible={isBackpackVisible}
    >
      <A.BackpackIcon $hasNotification={hasNewBackpackItem} />
    </FloatingActionButton>
  );
};

// Animated Backpack Icon
export const BackpackIcon = styled(FontAwesomeIcon)<{ $hasNotification: boolean }>`
  font-size: 32px;
  color: #D2B48C;
  
  ${props => props.$hasNotification && `
    filter: drop-shadow(0 0 8px #FFD700);
  `}
  
  @media (max-width: 768px) {
    font-size: 40px;
  }
`;
```

### 5. NotebookButton Component

```typescript
// src/client/components/ui/NotebookButton/NotebookButton.tsx

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen } from '@fortawesome/pro-solid-svg-icons';
import { motion } from 'framer-motion';
import { FloatingActionButton } from '../FloatingActionButton/FloatingActionButton';
import { useUIStore } from '../../stores/uiStore';
import { useQuestStore } from '../../stores/questStore';
import * as A from './NotebookButton.animations';

export const NotebookButton: React.FC = () => {
  const {
    isNotebookVisible,
    unreadQuestCount,
    hasNewQuest,
    allQuestsComplete,
    openQuestLogModal,
    clearQuestNotification,
  } = useUIStore();
  
  const quests = useQuestStore((state) => state.quests);

  // Determine button state
  const getState = (): 'normal' | 'notification' | 'complete' | 'disabled' => {
    if (!isNotebookVisible) return 'disabled';
    if (allQuestsComplete) return 'complete';
    if (hasNewQuest) return 'notification';
    return 'normal';
  };

  // Determine badge
  const getBadge = () => {
    if (hasNewQuest) return { text: '!', type: 'notification' as const };
    if (unreadQuestCount > 0) return { text: `${unreadQuestCount}`, type: 'count' as const };
    return { text: undefined, type: 'none' as const };
  };

  const handleClick = () => {
    clearQuestNotification();
    openQuestLogModal();
  };

  const badge = getBadge();

  return (
    <FloatingActionButton
      id="notebook"
      state={getState()}
      badgeText={badge.text}
      badgeType={badge.type}
      tooltip="Quest Log"
      onClick={handleClick}
      isVisible={isNotebookVisible}
    >
      <A.NotebookIcon $state={getState()} />
    </FloatingActionButton>
  );
};

// Animated Notebook Icon with Quill and Ribbon
const NotebookIcon = styled(FontAwesomeIcon)<{ $state: string }>`
  font-size: 32px;
  color: #F5F5DC;
  position: relative;
  
  ${({ $state }) => $state === 'complete' && `
    &::after {
      content: '';
      position: absolute;
      top: -8px;
      right: -8px;
      width: 16px;
      height: 24px;
      background: #C41E3A;
      border-radius: 0 0 8px 8px;
      animation: ribbonWave 2s ease-in-out infinite;
    }
  `}
  
  @media (max-width: 768px) {
    font-size: 40px;
  }
  
  @keyframes ribbonWave {
    0%, 100% { transform: rotate(-10deg); }
    50% { transform: rotate(10deg); }
  }
`;
```

---

## 🔗 Integration with Other Systems

### 1. Inventory System Integration

```typescript
// src/client/stores/inventoryStore.ts (excerpt)

import { create } from 'zustand';
import { useUIStore } from './uiStore';

interface InventoryState {
  items: Item[];
  addItem: (item: Item) => void;
  removeItem: (itemId: string) => void;
  // ... other methods
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  
  addItem: (item) => {
    set((state) => ({ items: [...state.items, item] }));
    
    // Trigger backpack notification
    useUIStore.getState().triggerBackpackNotification();
    
    // Update badge count
    const newCount = get().items.length;
    useUIStore.getState().updateBackpackCount(newCount, 16);
  },
  
  removeItem: (itemId) => {
    set((state) => ({
      items: state.items.filter((i) => i.id !== itemId),
    }));
    
    // Update badge count
    const newCount = get().items.length;
    useUIStore.getState().updateBackpackCount(newCount, 16);
  },
}));
```

### 2. Quest System Integration

```typescript
// src/client/stores/questStore.ts (excerpt)

import { create } from 'zustand';
import { useUIStore } from './uiStore';

interface QuestState {
  quests: Quest[];
  addQuest: (quest: Quest) => void;
  completeQuest: (questId: string) => void;
  // ... other methods
}

export const useQuestStore = create<QuestState>((set, get) => ({
  quests: [],
  
  addQuest: (quest) => {
    set((state) => ({ quests: [...state.quests, quest] }));
    
    // Trigger quest notification
    useUIStore.getState().triggerQuestNotification();
    
    // Update unread count
    const unreadCount = get().quests.filter((q) => !q.isRead).length;
    const allComplete = get().quests.every((q) => q.status === 'completed');
    useUIStore.getState().updateQuestCount(unreadCount, allComplete);
  },
  
  completeQuest: (questId) => {
    set((state) => ({
      quests: state.quests.map((q) =>
        q.id === questId ? { ...q, status: 'completed' } : q
      ),
    }));
    
    // Check if all quests complete
    const allComplete = get().quests.every((q) => q.status === 'completed');
    const unreadCount = get().quests.filter((q) => !q.isRead).length;
    useUIStore.getState().updateQuestCount(unreadCount, allComplete);
  },
}));
```

### 3. FloatingButtonsContainer

```typescript
// src/client/components/ui/HUD/FloatingButtonsContainer.tsx

import React from 'react';
import { BackpackButton } from '../BackpackButton/BackpackButton';
import { NotebookButton } from '../NotebookButton/NotebookButton';
import { useUIStore } from '../../stores/uiStore';

export const FloatingButtonsContainer: React.FC = () => {
  const { isBackpackVisible, isNotebookVisible } = useUIStore();

  // Don't render if both are hidden
  if (!isBackpackVisible && !isNotebookVisible) {
    return null;
  }

  return (
    <>
      <BackpackButton />
      <NotebookButton />
    </>
  );
};
```

---

## 📱 Mobile Adaptation

### Touch Target Requirements

```typescript
// Minimum touch target sizes per platform guidelines
const TOUCH_TARGET = {
  iOS: 44,  // Apple HIG minimum
  Android: 48,  // Material Design minimum
  Recommended: 56,  // Comfortable size
};

// In styled components:
export const ButtonContainer = styled(motion.button)`
  /* Base size */
  width: 64px;
  height: 64px;
  
  /* Mobile size */
  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
  }
  
  /* Ensure minimum touch area */
  &::after {
    content: '';
    position: absolute;
    top: -8px;
    left: -8px;
    right: -8px;
    bottom: -8px;
  }
`;
```

### Long Press Tooltip Implementation

```typescript
// For mobile devices, show tooltip on long press instead of hover
const handleLongPress = useCallback(() => {
  if (tooltip) {
    showTooltip(tooltip);
    // Auto-hide after 2 seconds
    setTimeout(() => hideTooltip(), 2000);
  }
}, [tooltip, showTooltip, hideTooltip]);
```

### Safe Area Insets (iOS Notch/Home Indicator)

```css
/* Add safe area insets for modern iOS devices */
.FloatingButtonContainer {
  padding-bottom: env(safe-area-inset-bottom, 24px);
  padding-left: env(safe-area-inset-left, 24px);
  padding-right: env(safe-area-inset-right, 24px);
}
```

---

## ✅ Acceptance Criteria

### Functional Requirements

- [ ] Кнопка Backpack появляется после первого получения предмета в инвентарь
- [ ] Кнопка Notebook появляется после получения первого квеста
- [ ] Бейджи обновляются в реальном времени при изменении количества предметов/квестов
- [ ] Уведомление (wiggle/bounce) проигрывается при получении нового предмета/квеста
- [ ] Клик по кнопке открывает соответствующее модальное окно (Inventory/Quest Log)
- [ ] Долгое нажатие на мобильном устройстве показывает tooltip
- [ ] Hover на десктопе показывает tooltip
- [ ] Кнопки корректно скрываются/появляются с анимацией

### Visual Requirements

- [ ] Idle анимация (float 2px up/down) работает плавно при 60 FPS
- [ ] Notification анимация (wiggle для backpack, bounce для notebook) привлекает внимание
- [ ] Состояние "All Quests Complete" показывает красную ленту
- [ ] Состояние "Empty Backpack" имеет пониженную прозрачность (0.7)
- [ ] Press анимация (scale 0.95) реагирует мгновенно на клик
- [ ] Градиенты и тени соответствуют vintage aesthetic

### Technical Requirements

- [ ] Компоненты рендерятся только когда `isVisible === true` (оптимизация)
- [ ] Анимации используют `will-change` для GPU acceleration
- [ ] Accessibility: кнопки имеют `aria-label`, `role="button"`, фокус через клавиатуру
- [ ] Touch targets минимум 48x48px на мобильных устройствах
- [ ] Интеграция с Zustand store реактивная (без лишних ре-рендеров)
- [ ] Код покрыт unit-тестами (Jest + React Testing Library)

### Performance Requirements

- [ ] Время первой отрисовки кнопок < 100ms
- [ ] Анимации работают при 60 FPS без просадок
- [ ] Отсутствие memory leaks при монтировании/размонтировании
- [ ] Bundle size contribution < 15KB (gzipped)

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// src/client/components/ui/BackpackButton/BackpackButton.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { BackpackButton } from './BackpackButton';
import { useUIStore } from '../../stores/uiStore';
import { useInventoryStore } from '../../stores/inventoryStore';

describe('BackpackButton', () => {
  beforeEach(() => {
    // Reset stores
    useUIStore.setState({
      isBackpackVisible: true,
      backpackItemCount: 0,
      hasNewBackpackItem: false,
    });
    useInventoryStore.setState({ items: [] });
  });

  it('renders when visible', () => {
    render(<BackpackButton />);
    expect(screen.getByRole('button', { name: /inventory/i })).toBeInTheDocument();
  });

  it('does not render when hidden', () => {
    useUIStore.setState({ isBackpackVisible: false });
    render(<BackpackButton />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows notification badge when new item acquired', () => {
    useUIStore.setState({ hasNewBackpackItem: true });
    render(<BackpackButton />);
    expect(screen.getByText('!')).toBeInTheDocument();
  });

  it('shows count badge when items exist', () => {
    useUIStore.setState({ backpackItemCount: 5, backpackMaxCapacity: 16 });
    render(<BackpackButton />);
    expect(screen.getByText('5/16')).toBeInTheDocument();
  });

  it('opens inventory modal on click', () => {
    const openInventoryModal = jest.fn();
    useUIStore.setState({ openInventoryModal });
    
    render(<BackpackButton />);
    fireEvent.click(screen.getByRole('button'));
    
    expect(openInventoryModal).toHaveBeenCalledTimes(1);
  });

  it('clears notification on click', () => {
    const clearBackpackNotification = jest.fn();
    useUIStore.setState({ 
      hasNewBackpackItem: true, 
      clearBackpackNotification 
    });
    
    render(<BackpackButton />);
    fireEvent.click(screen.getByRole('button'));
    
    expect(clearBackpackNotification).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Tests

```typescript
// Test integration with inventory system

it('updates badge count when item is added', async () => {
  render(<BackpackButton />);
  
  // Initially no badge
  expect(screen.queryByText(/\/16/)).not.toBeInTheDocument();
  
  // Add item via inventory store
  const { addItem } = useInventoryStore.getState();
  addItem({ id: '1', name: 'Old Key', type: 'quest' });
  
  // Wait for re-render
  await waitFor(() => {
    expect(screen.getByText('1/16')).toBeInTheDocument();
  });
  
  // Verify notification appeared
  expect(screen.getByText('!')).toBeInTheDocument();
});
```

### Visual Regression Tests

```typescript
// Using Percy or Chromatic for visual testing

it('matches snapshot in normal state', () => {
  const { container } = render(<BackpackButton />);
  expect(container.firstChild).toMatchInlineSnapshot(`
    <button
      aria-label="Open inventory"
      class="sc-backpack-button"
      role="button"
      tabindex="0"
    >
      <!-- Icon and structure -->
    </button>
  `);
});
```

---

## 🔧 Edge Cases & Error Handling

### 1. Store Initialization Race Condition

**Problem:** Кнопка может попытаться отрендериться до инициализации store.

**Solution:**
```typescript
// Use selector with default values
const backpackItemCount = useUIStore(
  (state) => state?.backpackItemCount ?? 0,
  (prev, next) => prev === next
);
```

### 2. Rapid Click Prevention

**Problem:** Пользователь может быстро кликнуть несколько раз, вызывая множественные открытия модалки.

**Solution:**
```typescript
const handleClick = useCallback(() => {
  if (isModalOpenRef.current) return; // Prevent double-click
  
  clearBackpackNotification();
  openInventoryModal();
  
  // Set flag
  isModalOpenRef.current = true;
}, [clearBackpackNotification, openInventoryModal]);
```

### 3. Tooltip Overflow on Small Screens

**Problem:** Tooltip может выйти за пределы экрана на маленьких устройствах.

**Solution:**
```typescript
// Calculate position dynamically
const getTooltipPosition = () => {
  const buttonRect = buttonRef.current?.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  
  if (buttonRect && buttonRect.right + 150 > viewportWidth) {
    return 'left'; // Show tooltip to the left
  }
  return 'top'; // Default
};
```

### 4. Audio Autoplay Policy (if adding sound effects later)

**Problem:** Браузеры блокируют автовоспроизведение звука без взаимодействия пользователя.

**Solution:**
```typescript
// Defer audio initialization until first user interaction
useEffect(() => {
  const handleFirstInteraction = () => {
    initializeAudioContext();
    document.removeEventListener('click', handleFirstInteraction);
  };
  
  document.addEventListener('click', handleFirstInteraction);
  return () => document.removeEventListener('click', handleFirstInteraction);
}, []);
```

---

## 📝 Developer Checklist

### Pre-Implementation

- [ ] Изучить `tasks.md` раздел 8.2
- [ ] Ознакомиться с `docs/ARCHITECTURE.md` для понимания общей структуры UI
- [ ] Проверить наличие всех зависимостей (framer-motion, styled-components, zustand, @fortawesome)
- [ ] Подготовить SVG/PNG ассеты для иконок Backpack и Notebook

### Implementation

- [ ] Создать базовый компонент `FloatingActionButton`
- [ ] Реализовать анимации (enter, exit, idle, notification, press)
- [ ] Создать специфичные компоненты `BackpackButton` и `NotebookButton`
- [ ] Настроить Zustand store для состояния кнопок и бейджей
- [ ] Интегрировать с `inventoryStore` и `questStore`
- [ ] Реализовать tooltip систему
- [ ] Добавить поддержку long press для мобильных
- [ ] Настроить safe area insets для iOS

### Post-Implementation

- [ ] Написать unit-тесты (покрытие > 80%)
- [ ] Провести visual regression тестирование
- [ ] Проверить accessibility (axe-core, keyboard navigation)
- [ ] Протестировать на реальных мобильных устройствах (iOS + Android)
- [ ] Оптимизировать производительность (React DevTools Profiler)
- [ ] Обновить документацию компонента

---

## 🎨 Asset Requirements

### Icons

| Asset | Format | Size | Notes |
|-------|--------|------|-------|
| Backpack (closed) | SVG + PNG texture | 128x128px | Multiple layers for animation |
| Backpack (open) | SVG + PNG texture | 128x128px | For active state |
| Exclamation mark | SVG | 32x32px | Gold color (#FFD700) |
| Notebook (closed) | SVG + PNG texture | 128x128px | Multiple layers |
| Notebook (open) | SVG + PNG texture | 128x128px | Pages visible |
| Quill | SVG | 24x24px | Gold, appears on notification |
| Ribbon bookmark | SVG | 16x24px | Red (#C41E3A), for "all complete" |

### Audio (Optional Future Enhancement)

| Sound | Format | Duration | Trigger |
|-------|--------|----------|---------|
| Backpack wiggle | MP3/OGG | 0.3s | New item acquired |
| Notebook bounce | MP3/OGG | 0.4s | New quest received |
| Button click | MP3/OGG | 0.1s | On press |
| Modal open | MP3/OGG | 0.5s | When opening inventory/quest log |

---

## 🔗 Related Documentation

- [Task 8.1: Top HUD Specification](./task8_1.md)
- [Task 5.4: Inventory System Specification](./task5_4.md)
- [Task 5.5: Quest & Reputation System Specification](./task5_5.md)
- [docs/ARCHITECTURE.md - UI Component Structure](./docs/ARCHITECTURE.md)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 📌 Notes

- **Performance Priority:** Кнопки должны быть максимально легкими, так как они рендерятся поверх всех экранов игры
- **Consistency:** Стиль кнопок должен соответствовать vintage aesthetic всего проекта (hand-drawn, watercolor textures)
- **Scalability:** Архитектура должна позволять легко добавлять новые floating buttons в будущем (например, кнопка карты, настроек)
- **Internationalization:** Tooltip тексты должны быть готовы к локализации (использовать i18n keys вместо хардкода)

---

**Status:** Ready for Implementation  
**Last Updated:** 2024  
**Author:** AI Development Assistant
