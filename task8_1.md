# Task 8.1: Top HUD ("The Notch") - Детальная спецификация реализации

## 📋 Обзор задачи

Создание винтажного верхнего HUD в форме "notch" (выреза), отображающего энергию, время и деньги игрока в стиле 1940-х годов.

---

## 🎨 Визуальный дизайн

### Форма и структура

**SVG "Notch" контейнер:**
```typescript
// components/ui/hud/NotchShape.tsx
import { FC } from 'react';

interface NotchShapeProps {
  width?: number;
  height?: number;
  className?: string;
}

export const NotchShape: FC<NotchShapeProps> = ({ 
  width = 400, 
  height = 80, 
  className 
}) => (
  <svg 
    viewBox="0 0 400 80" 
    className={className}
    preserveAspectRatio="xMidYMid meet"
  >
    {/* Основной фон с текстурой бумаги */}
    <defs>
      <pattern id="paperTexture" patternUnits="userSpaceOnUse" width="100" height="100">
        <image href="/textures/vintage-paper.png" x="0" y="0" width="100" height="100" />
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.1 0" />
        </filter>
        <rect width="100" height="100" filter="url(#noise)" opacity="0.3" />
      </pattern>
      
      <linearGradient id="notchGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#D4C5A3" />
        <stop offset="50%" stopColor="#C9B896" />
        <stop offset="100%" stopColor="#B8A98B" />
      </linearGradient>
      
      <filter id="pencilOutline">
        <feStroke stroke="#5C4E3D" stroke-width="2" stroke-linecap="round" />
        <feGaussianBlur stdDeviation="0.5" />
      </filter>
    </defs>
    
    {/* Форма notch с закругленными краями */}
    <path 
      d="M 20,5 
         L 380,5 
         Q 395,5 395,20 
         L 395,60 
         Q 395,75 380,75 
         L 20,75 
         Q 5,75 5,60 
         L 5,20 
         Q 5,5 20,5 
         Z"
      fill="url(#notchGradient)"
      stroke="#5C4E3D"
      strokeWidth="2"
      filter="url(#pencilOutline)"
    />
    
    {/* Декоративные элементы по краям (винтажные заклепки) */}
    <circle cx="25" cy="40" r="4" fill="#8B7355" opacity="0.6" />
    <circle cx="375" cy="40" r="4" fill="#8B7355" opacity="0.6" />
  </svg>
);
```

### Цветовая палитра

```typescript
// styles/hud/theme.ts
export const hudTheme = {
  // Основные цвета
  background: {
    primary: '#D4C5A3',      // Светлая сепия
    secondary: '#C9B896',    // Средняя сепия
    dark: '#B8A98B',         // Темная сепия
  },
  
  // Цвета контуров
  outline: {
    primary: '#5C4E3D',      // Темно-коричневый карандаш
    shadow: '#3E3228',       // Тень
  },
  
  // Индикатор энергии
  energy: {
    high: '#6B8E4E',         // Зеленый (70-100%)
    medium: '#D4AF37',       // Желтый (30-69%)
    low: '#C44536',          // Красный (0-29%)
  },
  
  // Время
  time: {
    day: '#F4A460',          // Солнце (оранжевый)
    night: '#708090',        // Луна (серо-синий)
    text: '#3E3228',
  },
  
  // Деньги
  money: {
    earned: '#4A7C3E',       // Зеленый при получении
    spent: '#A83F39',        // Красный при трате
    neutral: '#3E3228',
  },
};
```

---

## 🏗️ Архитектура компонентов

### Структура файлов

```
src/
├── components/
│   └── ui/
│       └── hud/
│           ├── TopHUD.tsx              # Главный компонент
│           ├── NotchShape.tsx          # SVG форма
│           ├── EnergyBar.tsx           # Индикатор энергии
│           ├── TimeIndicator.tsx       # Индикатор времени
│           ├── MoneyDisplay.tsx        # Отображение денег
│           └── index.ts                # Экспорты
├── stores/
│   └── hudStore.ts                     # Zustand store для HUD
├── hooks/
│   └── useGameTime.ts                  # Хук времени игры
└── styles/
    └── hud/
        ├── theme.ts                    # Цветовая тема
        └── animations.css              # CSS анимации
```

### Главный компонент TopHUD

```typescript
// components/ui/hud/TopHUD.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHUDStore } from '../../stores/hudStore';
import { useGameTime } from '../../hooks/useGameTime';
import { NotchShape } from './NotchShape';
import { EnergyBar } from './EnergyBar';
import { TimeIndicator } from './TimeIndicator';
import { MoneyDisplay } from './MoneyDisplay';
import './TopHUD.css';

interface TopHUDProps {
  isVisible?: boolean;
  hideDuringCinematics?: boolean;
  isCinematicActive?: boolean;
}

export const TopHUD: React.FC<TopHUDProps> = ({
  isVisible = true,
  hideDuringCinematics = true,
  isCinematicActive = false,
}) => {
  // Подписка на состояние store
  const { 
    energy, 
    maxEnergy, 
    money, 
    lastMoneyChange,
    isExpanded,
    toggleExpand,
    hasUnlocked 
  } = useHUDStore();
  
  const { currentTime, sunRotation } = useGameTime();
  const [isMounted, setIsMounted] = useState(false);

  // Анимация появления при разблокировке
  useEffect(() => {
    if (hasUnlocked) {
      setIsMounted(true);
    }
  }, [hasUnlocked]);

  // Скрытие во время кинематографов
  const shouldRender = isVisible && (!hideDuringCinematics || !isCinematicActive);

  if (!shouldRender || !hasUnlocked) {
    return null;
  }

  return (
    <AnimatePresence>
      {isMounted && (
        <motion.div
          className="top-hud-container"
          initial={{ y: -150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -150, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
            duration: 0.8
          }}
          role="region"
          aria-label="Game status HUD"
        >
          {/* Фоновая SVG форма */}
          <NotchShape 
            className="notch-shape"
            onClick={() => toggleExpand()}
            tabIndex={0}
            role="button"
            aria-expanded={isExpanded}
            aria-label="Click to expand stats"
          />
          
          {/* Контент внутри notch */}
          <div className="hud-content">
            {/* Левая секция: Энергия */}
            <div className="hud-section hud-section--left">
              <EnergyBar 
                current={energy} 
                max={maxEnergy} 
                onHover={(value) => console.log('Energy:', value)}
              />
            </div>
            
            {/* Центральная секция: Время */}
            <div className="hud-section hud-section--center">
              <TimeIndicator 
                time={currentTime} 
                sunRotation={sunRotation} 
              />
            </div>
            
            {/* Правая секция: Деньги */}
            <div className="hud-section hud-section--right">
              <MoneyDisplay 
                amount={money} 
                lastChange={lastMoneyChange} 
              />
            </div>
          </div>
          
          {/* Опционально: Расширенная статистика */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                className="hud-expanded-stats"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Детальная статистика здесь */}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
```

---

## 🔋 Компонент EnergyBar

```typescript
// components/ui/hud/EnergyBar.tsx
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { hudTheme } from '../../../styles/hud/theme';
import './EnergyBar.css';

interface EnergyBarProps {
  current: number;
  max: number;
  onHover?: (percentage: number) => void;
  showNumeric?: boolean;
}

export const EnergyBar: React.FC<EnergyBarProps> = memo(({
  current,
  max,
  onHover,
  showNumeric = false,
}) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  
  // Определение цвета на основе процента
  const getEnergyColor = (pct: number): string => {
    if (pct >= 70) return hudTheme.energy.high;
    if (pct >= 30) return hudTheme.energy.medium;
    return hudTheme.energy.low;
  };
  
  const barColor = getEnergyColor(percentage);

  return (
    <div 
      className="energy-bar-container"
      onMouseEnter={() => onHover?.(percentage)}
      role="progressbar"
      aria-valuenow={Math.round(percentage)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Energy: ${Math.round(percentage)}%`}
    >
      {/* Фон бара */}
      <div className="energy-bar-background">
        <svg viewBox="0 0 120 20" preserveAspectRatio="none">
          <rect 
            x="2" y="2" 
            width="116" height="16" 
            rx="8" 
            fill="rgba(62, 50, 40, 0.3)" 
            stroke={hudTheme.outline.primary}
            strokeWidth="1"
          />
        </svg>
      </div>
      
      {/* Заполнение бара */}
      <motion.div
        className="energy-bar-fill"
        initial={{ width: '100%' }}
        animate={{ width: `${percentage}%` }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 15,
          duration: 0.5
        }}
        style={{ backgroundColor: barColor }}
      >
        <svg viewBox="0 0 120 20" preserveAspectRatio="none">
          <defs>
            <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={barColor} stopOpacity="0.9" />
              <stop offset="100%" stopColor={barColor} stopOpacity="1" />
            </linearGradient>
          </defs>
          <rect 
            x="2" y="2" 
            width="116" height="16" 
            rx="8" 
            fill="url(#energyGradient)"
          />
        </svg>
        
        {/* Анимация пульсации при низком уровне */}
        {percentage < 30 && (
          <motion.div
            className="energy-bar-pulse"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.div>
      
      {/* Числовое значение (опционально) */}
      {showNumeric && (
        <span className="energy-bar-value">
          {Math.round(current)}/{max}
        </span>
      )}
      
      {/* Тултип при наведении */}
      <motion.div
        className="energy-bar-tooltip"
        initial={{ opacity: 0, y: 10 }}
        whileHover={{ opacity: 1, y: 0 }}
      >
        {Math.round(percentage)}% Energy
        {percentage < 30 && ' - Rest needed!'}
      </motion.div>
    </div>
  );
});

EnergyBar.displayName = 'EnergyBar';
```

---

## ☀️ Компонент TimeIndicator

```typescript
// components/ui/hud/TimeIndicator.tsx
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { hudTheme } from '../../../styles/hud/theme';
import './TimeIndicator.css';

interface TimeIndicatorProps {
  time: Date;
  sunRotation: number; // 0-360 градусов
}

export const TimeIndicator: React.FC<TimeIndicatorProps> = memo(({
  time,
  sunRotation,
}) => {
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const isDay = hours >= 6 && hours < 20;
  
  // Форматирование времени
  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div className="time-indicator-container">
      {/* Иконка солнца/луны */}
      <motion.div
        className="time-icon-wrapper"
        animate={{ rotate: sunRotation }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {isDay ? (
          // Солнце
          <svg 
            viewBox="0 0 40 40" 
            width="40" 
            height="40"
            aria-label="Day time"
          >
            <circle 
              cx="20" cy="20" r="10" 
              fill={hudTheme.time.day}
              stroke={hudTheme.outline.primary}
              strokeWidth="1.5"
            />
            {/* Лучи солнца */}
            {[...Array(8)].map((_, i) => (
              <motion.line
                key={i}
                x1="20" y1="20"
                x2="20" y2="5"
                stroke={hudTheme.time.day}
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ scale: 0.8, opacity: 0.7 }}
                animate={{ 
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  delay: i * 0.15
                }}
                transform={`rotate(${i * 45} 20 20)`}
              />
            ))}
          </svg>
        ) : (
          // Луна
          <svg 
            viewBox="0 0 40 40" 
            width="40" 
            height="40"
            aria-label="Night time"
          >
            <motion.path
              d="M 25,5 
                 A 15,15 0 1,1 15,35 
                 A 12,12 0 1,0 25,5 Z"
              fill={hudTheme.time.night}
              stroke={hudTheme.outline.primary}
              strokeWidth="1.5"
              initial={{ rotate: -10 }}
              animate={{ rotate: [0, 5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            {/* Звезды */}
            {[...Array(3)].map((_, i) => (
              <motion.circle
                key={i}
                cx={10 + i * 5}
                cy={10 + (i % 2) * 5}
                r="1.5"
                fill={hudTheme.time.night}
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  delay: i * 0.3
                }}
              />
            ))}
          </svg>
        )}
      </motion.div>
      
      {/* Цифровое время */}
      <motion.span
        className="time-digital"
        key={formattedTime}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 5 }}
        style={{ color: hudTheme.time.text }}
      >
        {formattedTime}
      </motion.span>
    </div>
  );
});

TimeIndicator.displayName = 'TimeIndicator';
```

---

## 💰 Компонент MoneyDisplay

```typescript
// components/ui/hud/MoneyDisplay.tsx
import React, { memo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hudTheme } from '../../../styles/hud/theme';
import './MoneyDisplay.css';

interface MoneyChange {
  amount: number;
  timestamp: number;
  type: 'earned' | 'spent';
}

interface MoneyDisplayProps {
  amount: number;
  lastChange?: MoneyChange | null;
}

export const MoneyDisplay: React.FC<MoneyDisplayProps> = memo(({
  amount,
  lastChange,
}) => {
  const [displayAmount, setDisplayAmount] = React.useState(amount);
  const [pulseColor, setPulseColor] = React.useState<string | null>(null);

  // Синхронизация отображаемого значения
  useEffect(() => {
    setDisplayAmount(amount);
  }, [amount]);

  // Обработка изменения денег
  useEffect(() => {
    if (lastChange) {
      // Установка цвета пульсации
      const color = lastChange.type === 'earned' 
        ? hudTheme.money.earned 
        : hudTheme.money.spent;
      setPulseColor(color);
      
      // Сброс цвета через 1 секунду
      const timer = setTimeout(() => {
        setPulseColor(null);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [lastChange]);

  return (
    <div className="money-display-container">
      {/* Иконка монеты */}
      <motion.svg
        viewBox="0 0 30 30"
        width="30"
        height="30"
        className="money-icon"
        animate={pulseColor ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <circle
          cx="15" cy="15" r="12"
          fill="#D4AF37"
          stroke={hudTheme.outline.primary}
          strokeWidth="1.5"
        />
        <text
          x="15" y="20"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill={hudTheme.outline.primary}
        >
          ₤
        </text>
      </motion.svg>
      
      {/* Сумма */}
      <motion.span
        className="money-amount"
        key={displayAmount}
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          color: pulseColor || hudTheme.money.neutral
        }}
        transition={{ duration: 0.2 }}
        style={{
          textShadow: pulseColor ? `0 0 8px ${pulseColor}80` : 'none',
        }}
      >
        {displayAmount}
      </motion.span>
      
      {/* Анимация изменения (всплывающее число) */}
      <AnimatePresence>
        {lastChange && (
          <motion.div
            className="money-change-indicator"
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8 }}
            style={{ color: lastChange.type === 'earned' ? hudTheme.money.earned : hudTheme.money.spent }}
          >
            {lastChange.type === 'earned' ? '+' : ''}{lastChange.amount}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

MoneyDisplay.displayName = 'MoneyDisplay';
```

---

## 🗄️ Zustand Store

```typescript
// stores/hudStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface MoneyChange {
  amount: number;
  timestamp: number;
  type: 'earned' | 'spent';
}

interface HUDState {
  // Состояние разблокировки
  hasUnlocked: boolean;
  
  // Энергия
  energy: number;
  maxEnergy: number;
  
  // Деньги
  money: number;
  lastMoneyChange: MoneyChange | null;
  
  // Время (синхронизируется с игровым временем)
  gameHours: number;
  gameMinutes: number;
  
  // UI состояние
  isExpanded: boolean;
  isVisible: boolean;
  
  // Actions
  unlockHUD: () => void;
  setEnergy: (energy: number) => void;
  changeEnergy: (delta: number) => void;
  setMaxEnergy: (max: number) => void;
  addMoney: (amount: number) => void;
  spendMoney: (amount: number) => boolean; // возвращает success
  setTime: (hours: number, minutes: number) => void;
  toggleExpand: () => void;
  setVisibility: (visible: boolean) => void;
  reset: () => void;
}

const INITIAL_STATE = {
  hasUnlocked: false,
  energy: 100,
  maxEnergy: 100,
  money: 0,
  lastMoneyChange: null,
  gameHours: 8,
  gameMinutes: 0,
  isExpanded: false,
  isVisible: true,
};

export const useHUDStore = create<HUDState>()(
  subscribeWithSelector((set, get) => ({
    ...INITIAL_STATE,
    
    unlockHUD: () => set({ hasUnlocked: true }),
    
    setEnergy: (energy: number) => {
      const clamped = Math.max(0, Math.min(energy, get().maxEnergy));
      set({ energy: clamped });
    },
    
    changeEnergy: (delta: number) => {
      const newEnergy = get().energy + delta;
      get().setEnergy(newEnergy);
    },
    
    setMaxEnergy: (max: number) => {
      set({ maxEnergy: Math.max(1, max) });
    },
    
    addMoney: (amount: number) => {
      if (amount <= 0) return;
      
      set({
        money: get().money + amount,
        lastMoneyChange: {
          amount,
          timestamp: Date.now(),
          type: 'earned',
        },
      });
    },
    
    spendMoney: (amount: number): boolean => {
      if (amount <= 0 || get().money < amount) {
        return false;
      }
      
      set({
        money: get().money - amount,
        lastMoneyChange: {
          amount: -amount,
          timestamp: Date.now(),
          type: 'spent',
        },
      });
      
      return true;
    },
    
    setTime: (hours: number, minutes: number) => {
      set({
        gameHours: hours % 24,
        gameMinutes: minutes % 60,
      });
    },
    
    toggleExpand: () => set((state) => ({ isExpanded: !state.isExpanded })),
    
    setVisibility: (visible: boolean) => set({ isVisible: visible }),
    
    reset: () => set(INITIAL_STATE),
  }))
);

// Селекторы для оптимизации ререндеров
export const selectEnergyPercentage = (state: HUDState) => 
  (state.energy / state.maxEnergy) * 100;

export const selectIsLowEnergy = (state: HUDState) => 
  (state.energy / state.maxEnergy) < 0.3;

export const selectCurrentTime = (state: HUDState) => {
  const date = new Date();
  date.setHours(state.gameHours, state.gameMinutes, 0, 0);
  return date;
};

export const selectSunRotation = (state: HUDState) => {
  // 0° в 6:00, 180° в 18:00, 360° в 6:00 следующего дня
  const totalMinutes = state.gameHours * 60 + state.gameMinutes;
  const dayStartMinutes = 6 * 60; // 6:00
  const dayEndMinutes = 30 * 60; // 30:00 (6:00 следующего дня)
  
  if (totalMinutes < dayStartMinutes || totalMinutes >= dayEndMinutes) {
    return 0;
  }
  
  const normalizedMinutes = totalMinutes - dayStartMinutes;
  const dayDuration = dayEndMinutes - dayStartMinutes;
  
  return (normalizedMinutes / dayDuration) * 360;
};
```

---

## 🎭 CSS стили и анимации

```css
/* styles/hud/TopHUD.css */

.top-hud-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  pointer-events: none;
}

.notch-shape {
  display: block;
  margin: 0 auto;
  cursor: pointer;
  pointer-events: auto;
  transition: filter 0.3s ease;
}

.notch-shape:hover {
  filter: drop-shadow(0 4px 8px rgba(62, 50, 40, 0.3));
}

.notch-shape:focus {
  outline: 2px solid #5C4E3D;
  outline-offset: 4px;
}

.hud-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  pointer-events: none;
}

.hud-section {
  display: flex;
  align-items: center;
  gap: 12px;
  pointer-events: auto;
}

.hud-section--left {
  justify-content: flex-start;
  flex: 1;
}

.hud-section--center {
  justify-content: center;
  flex: 0 0 auto;
}

.hud-section--right {
  justify-content: flex-end;
  flex: 1;
}

.hud-expanded-stats {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(212, 197, 163, 0.95);
  border: 2px solid #5C4E3D;
  border-radius: 0 0 12px 12px;
  padding: 16px;
  overflow: hidden;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .top-hud-container {
    top: 10px;
    width: 95vw;
  }
  
  .notch-shape {
    width: 100%;
    height: auto;
  }
  
  .hud-content {
    padding: 0 20px;
  }
  
  .hud-section {
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .hud-section--left,
  .hud-section--right {
    flex: 0 0 auto;
  }
  
  .energy-bar-container {
    width: 80px;
  }
}
```

```css
/* styles/hud/animations.css */

@keyframes energyPulse {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes sunRayPulse {
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

@keyframes moonRock {
  0%, 100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(5deg);
  }
}

@keyframes moneyPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

@keyframes floatUp {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-30px) scale(1);
  }
}

.energy-bar-pulse {
  animation: energyPulse 1.5s infinite;
}

.sun-ray {
  animation: sunRayPulse 2s infinite;
}

.moon-icon {
  animation: moonRock 3s infinite ease-in-out;
}

.money-change-indicator {
  animation: floatUp 0.8s ease-out forwards;
}

/* Prefers reduced motion */
@media (prefers-reduced-motion: reduce) {
  .energy-bar-pulse,
  .sun-ray,
  .moon-icon,
  .money-change-indicator {
    animation: none;
  }
}
```

---

## ✅ Acceptance Criteria

### Функциональные требования
- [ ] HUD появляется плавно (slide-down анимация) после разблокировки
- [ ] Все три индикатора (энергия, время, деньги) обновляются в реальном времени
- [ ] Энергетический бар меняет цвет в зависимости от уровня (зеленый → желтый → красный)
- [ ] При низком уровне энергии (<30%) бар пульсирует
- [ ] Иконка солнца/луны вращается в соответствии с игровым временем
- [ ] Цифровое время форматируется как ЧЧ:ММ (24-часовой формат)
- [ ] При изменении суммы денег отображается анимация пульсации соответствующего цвета
- [ ] Всплывающее число показывает изменение суммы (+X или -X)
- [ ] Клик по HUD расширяет детальную статистику (опционально)
- [ ] HUD скрывается во время кинематографов (если включена опция)

### Технические требования
- [ ] Используется SVG для формы notch с градиентами и текстурами
- [ ] Framer Motion для всех анимаций (появление, переходы, пульсация)
- [ ] Zustand store с селекторами для реактивных обновлений
- [ ] Мемоизация компонентов (React.memo) для предотвращения лишних ререндеров
- [ ] Tailwind CSS для позиционирования и адаптивности
- [ ] Поддержка keyboard navigation (tabindex, aria-attributes)
- [ ] ARIA labels для screen readers
- [ ] Обработка prefers-reduced-motion для доступности

### Визуальные требования
- [ ] Дизайн соответствует эстетике 1940-х годов (сепия, карандашные контуры)
- [ ] Текстура бумаги наложена на фон HUD
- [ ] Винтажные декоративные элементы (заклепки по краям)
- [ ] Читаемость на всех размерах экрана (десктоп, планшет, мобильный)
- [ ] HUD не перекрывает важные элементы геймплея
- [ ] Плавные переходы между состояниями (60 FPS)

### Адаптивность
- [ ] На мобильных устройствах HUD занимает 95vw
- [ ] Уменьшенные отступы и размеры элементов на маленьких экранах
- [ ] Touch targets минимум 48x48px для мобильных
- [ ] Корректное отображение в портретной и ландшафтной ориентации

---

## 🔧 Edge Cases и обработка ошибок

### Низкий уровень энергии
```typescript
// При энергии < 10% показать предупреждение
if (energy < maxEnergy * 0.1) {
  showNotification('Energy critically low! Find rest.', 'warning');
}
```

### Отрицательные значения
```typescript
// Всегда клamping значений
const clampedEnergy = Math.max(0, Math.min(energy, maxEnergy));
const clampedMoney = Math.max(0, money);
```

### Быстрые изменения денег
```typescript
// Debounce для частых изменений
const debouncedMoneyChange = debounce((change) => {
  setLastMoneyChange(change);
}, 100);
```

### Потеря фокуса окна
```typescript
// Пауза анимаций при потере фокуса
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Pause animations
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);
```

---

## 📱 Mobile Adaptation

### Touch оптимизация
```css
/* Увеличенные touch targets */
@media (pointer: coarse) {
  .hud-section {
    min-height: 48px;
  }
  
  .energy-bar-container,
  .time-indicator-container,
  .money-display-container {
    padding: 8px;
  }
}
```

### Long press для тултипов
```typescript
// Вместо hover на мобильных
const useLongPress = (callback: () => void, ms = 500) => {
  const [startLongPress, setStartLongPress] = useState(false);

  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (startLongPress) {
      timerId = setTimeout(callback, ms);
    } else {
      clearTimeout(timerId);
    }

    return () => clearTimeout(timerId);
  }, [startLongPress, callback, ms]);

  return {
    onMouseDown: () => setStartLongPress(true),
    onMouseUp: () => setStartLongPress(false),
    onMouseLeave: () => setStartLongPress(false),
    onTouchStart: () => setStartLongPress(true),
    onTouchEnd: () => setStartLongPress(false),
  };
};
```

---

## 🧪 Checklist для разработчика

### Подготовка
- [ ] Изучить дизайн-макеты в Figma
- [ ] Получить SVG ассеты для иконок (солнце, луна, монета, рюкзак)
- [ ] Получить текстуру vintage paper
- [ ] Настроить цветовую палитру в theme.ts

### Реализация
- [ ] Создать структуру папок (components/ui/hud)
- [ ] Реализовать NotchShape.tsx с SVG
- [ ] Реализовать EnergyBar.tsx с градиентами
- [ ] Реализовать TimeIndicator.tsx с анимацией вращения
- [ ] Реализовать MoneyDisplay.tsx с пульсацией
- [ ] Создать hudStore.ts с Zustand
- [ ] Создать хук useGameTime.ts
- [ ] Собрать TopHUD.tsx (главный компонент)
- [ ] Добавить CSS стили и анимации
- [ ] Реализовать адаптивность для мобильных

### Интеграция
- [ ] Подключить HUD к основному игровому циклу
- [ ] Настроить синхронизацию с системой времени
- [ ] Настроить реакцию на изменения энергии/денег
- [ ] Протестировать разблокировку HUD
- [ ] Протестировать скрытие во время кинематографов

### Тестирование
- [ ] Проверить анимацию появления (60 FPS)
- [ ] Проверить все состояния энергетического бара
- [ ] Проверить вращение солнца/луны в течение 24 часов
- [ ] Проверить анимацию изменения денег
- [ ] Протестировать на разных разрешениях экрана
- [ ] Протестировать keyboard navigation
- [ ] Протестировать с screen reader
- [ ] Протестировать prefers-reduced-motion
- [ ] Проверить производительность (no memory leaks)

### Документация
- [ ] Обновить README с примерами использования
- [ ] Добавить Storybook stories для каждого компонента
- [ ] Задокументировать props и события
- [ ] Добавить комментарии к сложной логике

---

## 📚 Примеры использования

### Базовое использование
```tsx
// App.tsx или главный игровой компонент
import { TopHUD } from './components/ui/hud';
import { useHUDStore } from './stores/hudStore';

function Game() {
  const { unlockHUD, addMoney, changeEnergy } = useHUDStore();
  
  useEffect(() => {
    // Разблокировать HUD после начальной сцены
    setTimeout(() => unlockHUD(), 3000);
  }, []);
  
  return (
    <div className="game-container">
      <TopHUD 
        isVisible={true}
        hideDuringCinematics={true}
        isCinematicActive={false}
      />
      {/* Остальной игровой контент */}
    </div>
  );
}
```

### Storybook story
```tsx
// components/ui/hud/TopHUD.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { TopHUD } from './TopHUD';
import { useHUDStore } from '../../stores/hudStore';

const meta: Meta<typeof TopHUD> = {
  title: 'UI/HUD/TopHUD',
  component: TopHUD,
  decorators: [
    (Story) => {
      // Setup store state for story
      useHUDStore.setState({
        hasUnlocked: true,
        energy: 75,
        maxEnergy: 100,
        money: 150,
        gameHours: 14,
        gameMinutes: 30,
      });
      return <Story />;
    },
  ],
};

export default meta;
type Story = StoryObj<typeof TopHUD>;

export const Default: Story = {
  args: {
    isVisible: true,
    hideDuringCinematics: false,
  },
};

export const LowEnergy: Story = {
  decorators: [
    (Story) => {
      useHUDStore.setState({ energy: 20, maxEnergy: 100 });
      return <Story />;
    },
  ],
  args: Default.args,
};

export const NightTime: Story = {
  decorators: [
    (Story) => {
      useHUDStore.setState({ gameHours: 22, gameMinutes: 15 });
      return <Story />;
    },
  ],
  args: Default.args,
};
```

---

## 🔗 Ссылки на документацию

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [SVG MDN Guide](https://developer.mozilla.org/en-US/docs/Web/SVG)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
