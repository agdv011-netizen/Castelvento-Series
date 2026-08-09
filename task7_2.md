# Task 7.2: Relationship System (Affinity Tracking) - Detailed Implementation Specification

## Overview
Реализация системы отношений с NPC, где действия игрока влияют на уровень привязанности (affinity), что в свою очередь влияет на диалоги, цены в магазинах и доступность квестов.

---

## 1. Architecture & Data Structures

### 1.1 Core Interfaces

**File:** `shared/types/affinity.ts`

```typescript
// Affinity ranges
export enum AffinityTier {
  HOSTILE = 'hostile',      // -100 to -50
  UNFRIENDLY = 'unfriendly', // -49 to -10
  NEUTRAL = 'neutral',       // -9 to +9
  FRIENDLY = 'friendly',     // +10 to +49
  CLOSE = 'close'            // +50 to +100
}

export interface AffinityData {
  npcId: string;
  value: number;             // -100 to +100
  tier: AffinityTier;        // Вычисляется автоматически
  lastInteraction?: number;  // Timestamp последней взаимодействия
  history: AffinityChange[]; // История изменений (для отладки/квестов)
}

export interface AffinityChange {
  timestamp: number;         // Дата изменения
  amount: number;            // Изменение (+/-)
  reason: AffinityReason;    // Причина изменения
  questId?: string;          // Связанный квест (если есть)
}

export type AffinityReason =
  | 'help_task'              // Помощь с заданием (+5)
  | 'give_gift'              // Подарок (+10)
  | 'agree_dialogue'         // Согласие в диалоге (+2)
  | 'disagree_dialogue'      // Несогласие в диалоге (-2)
  | 'steal_item'             // Кража предмета (-20)
  | 'insult'                 // Оскорбление (-10)
  | 'refuse_help'            // Отказ в помощи (-5)
  | 'complete_quest'         // Завершение квеста (+15)
  | 'daily_decay'            // Ежедневное затухание (-1, опционально)
  | 'special_event';         // Специальное событие
```

### 1.2 Affinity Tier Configuration

**File:** `client/config/affinityConfig.ts`

```typescript
import { AffinityTier } from '@/shared/types/affinity';

export const AFFINITY_TIERS = {
  [AffinityTier.HOSTILE]: {
    min: -100,
    max: -50,
    color: '#DC143C',        // Crimson red
    icon: '💔',
    dialogueModifier: 'hostile',
    priceMultiplier: 1.20,   // +20% цены
    questAvailability: false
  },
  [AffinityTier.UNFRIENDLY]: {
    min: -49,
    max: -10,
    color: '#8B0000',        // Dark red
    icon: '😠',
    dialogueModifier: 'unfriendly',
    priceMultiplier: 1.10,   // +10% цены
    questAvailability: false
  },
  [AffinityTier.NEUTRAL]: {
    min: -9,
    max: 9,
    color: '#808080',        // Gray
    icon: '😐',
    dialogueModifier: 'neutral',
    priceMultiplier: 1.00,   // Базовые цены
    questAvailability: true
  },
  [AffinityTier.FRIENDLY]: {
    min: 10,
    max: 49,
    color: '#228B22',        // Forest green
    icon: '😊',
    dialogueModifier: 'warm',
    priceMultiplier: 0.90,   // -10% скидка
    questAvailability: true
  },
  [AffinityTier.CLOSE]: {
    min: 50,
    max: 100,
    color: '#FFD700',        // Gold
    icon: '💛',
    dialogueModifier: 'friendly',
    priceMultiplier: 0.85,   // -15% скидка
    questAvailability: true,
    unlocksRomance: true     // Разблокирует романтические опции
  }
};

export const AFFINITY_CHANGES = {
  help_task: 5,
  give_gift: 10,
  agree_dialogue: 2,
  disagree_dialogue: -2,
  steal_item: -20,
  insult: -10,
  refuse_help: -5,
  complete_quest: 15,
  daily_decay: -1
};
```

---

## 2. State Management (Zustand Store)

**File:** `client/store/affinityStore.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  AffinityData, 
  AffinityTier, 
  AffinityChange, 
  AffinityReason 
} from '@/shared/types/affinity';
import { AFFINITY_TIERS, AFFINITY_CHANGES } from '@/client/config/affinityConfig';

interface AffinityStore {
  // State
  affinities: Map<string, AffinityData>; // npcId -> AffinityData
  
  // Actions
  getAffinity: (npcId: string) => number;
  getAffinityTier: (npcId: string) => AffinityTier;
  getAffinityData: (npcId: string) => AffinityData | undefined;
  changeAffinity: (
    npcId: string, 
    amount: number, 
    reason: AffinityReason,
    questId?: string
  ) => void;
  getAllAffinities: () => Map<string, AffinityData>;
  resetAffinity: (npcId: string) => void;
  applyDailyDecay: () => void; // Для ежедневного затухания
  
  // Selectors
  canUnlockRomance: (npcId: string) => boolean;
  getPriceMultiplier: (npcId: string) => number;
  canAccessQuests: (npcId: string) => boolean;
}

const calculateTier = (value: number): AffinityTier => {
  if (value <= -50) return AffinityTier.HOSTILE;
  if (value <= -10) return AffinityTier.UNFRIENDLY;
  if (value <= 9) return AffinityTier.NEUTRAL;
  if (value <= 49) return AffinityTier.FRIENDLY;
  return AffinityTier.CLOSE;
};

export const useAffinityStore = create<AffinityStore>()(
  persist(
    (set, get) => ({
      affinities: new Map(),
      
      getAffinity: (npcId: string) => {
        const data = get().affinities.get(npcId);
        return data?.value ?? 0; // Default to neutral (0)
      },
      
      getAffinityTier: (npcId: string) => {
        const value = get().getAffinity(npcId);
        return calculateTier(value);
      },
      
      getAffinityData: (npcId: string) => {
        return get().affinities.get(npcId);
      },
      
      changeAffinity: (
        npcId: string,
        amount: number,
        reason: AffinityReason,
        questId?: string
      ) => {
        const { affinities } = get();
        const existing = affinities.get(npcId) || {
          npcId,
          value: 0,
          tier: AffinityTier.NEUTRAL,
          history: []
        };
        
        // Clamp value between -100 and +100
        const newValue = Math.max(-100, Math.min(100, existing.value + amount));
        const newTier = calculateTier(newValue);
        
        const changeRecord: AffinityChange = {
          timestamp: Date.now(),
          amount,
          reason,
          questId
        };
        
        const updatedData: AffinityData = {
          ...existing,
          value: newValue,
          tier: newTier,
          lastInteraction: Date.now(),
          history: [...existing.history, changeRecord]
        };
        
        affinities.set(npcId, updatedData);
        set({ affinities: new Map(affinities) });
        
        // Trigger visual notification (optional)
        if (amount !== 0) {
          console.log(`Affinity changed for ${npcId}: ${amount > 0 ? '+' : ''}${amount} (${reason})`);
        }
      },
      
      getAllAffinities: () => {
        return new Map(get().affinities);
      },
      
      resetAffinity: (npcId: string) => {
        const { affinities } = get();
        affinities.delete(npcId);
        set({ affinities: new Map(affinities) });
      },
      
      applyDailyDecay: () => {
        const { affinities, changeAffinity } = get();
        
        affinities.forEach((data, npcId) => {
          if (data.value > 0 && data.value < 100) {
            // Only decay positive relationships, not maxed out
            changeAffinity(npcId, AFFINITY_CHANGES.daily_decay, 'daily_decay');
          }
        });
      },
      
      canUnlockRomance: (npcId: string) => {
        const tier = get().getAffinityTier(npcId);
        return tier === AffinityTier.CLOSE;
      },
      
      getPriceMultiplier: (npcId: string) => {
        const tier = get().getAffinityTier(npcId);
        return AFFINITY_TIERS[tier].priceMultiplier;
      },
      
      canAccessQuests: (npcId: string) => {
        const tier = get().getAffinityTier(npcId);
        return AFFINITY_TIERS[tier].questAvailability;
      }
    }),
    {
      name: 'castelvento-affinity-storage',
      partialize: (state) => ({
        affinities: Object.fromEntries(state.affinities)
      }),
      merge: (persistedState, currentState) => {
        // Convert back from object to Map
        const persisted = persistedState as Partial<AffinityStore>;
        const affinitiesMap = new Map(
          Object.entries(persisted.affinities || {})
        );
        return {
          ...currentState,
          affinities: affinitiesMap
        };
      }
    }
  )
);
```

---

## 3. Visual Indicators

### 3.1 Affinity Badge Component

**File:** `client/components/ui/AffinityBadge.tsx`

```typescript
import React from 'react';
import { useAffinityStore } from '@/client/store/affinityStore';
import { AffinityTier } from '@/shared/types/affinity';
import { AFFINITY_TIERS } from '@/client/config/affinityConfig';
import styles from './AffinityBadge.module.css';

interface AffinityBadgeProps {
  npcId: string;
  showTooltip?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const AffinityBadge: React.FC<AffinityBadgeProps> = ({
  npcId,
  showTooltip = true,
  size = 'medium'
}) => {
  const affinity = useAffinityStore(state => state.getAffinity(npcId));
  const tier = useAffinityStore(state => state.getAffinityTier(npcId));
  const config = AFFINITY_TIERS[tier];

  const sizeClass = styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`];

  return (
    <div
      className={`${styles.badge} ${sizeClass}`}
      style={{ backgroundColor: config.color }}
      role="img"
      aria-label={`Affinity: ${affinity} (${tier})`}
    >
      <span className={styles.icon}>{config.icon}</span>
      
      {/* Numeric value (always visible) */}
      <span className={styles.value}>{Math.abs(affinity)}</span>
      
      {/* Tooltip on hover */}
      {showTooltip && (
        <div className={styles.tooltip}>
          <div className={styles.tooltipTitle}>
            {config.icon} {tier.toUpperCase()}
          </div>
          <div className={styles.tooltipValue}>
            Affinity: {affinity > 0 ? '+' : ''}{affinity}
          </div>
          <div className={styles.tooltipRange}>
            Range: {config.min} to {config.max}
          </div>
          
          {/* Effects preview */}
          <div className={styles.effects}>
            {config.priceMultiplier !== 1.0 && (
              <div>
                Prices: {config.priceMultiplier < 1 ? '-' : '+'}
                {Math.abs((1 - config.priceMultiplier) * 100).toFixed(0)}%
              </div>
            )}
            {!config.questAvailability && (
              <div>⚠️ Quests unavailable</div>
            )}
            {config.unlocksRomance && (
              <div>💕 Romance available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
```

### 3.2 CSS Styles

**File:** `client/components/ui/AffinityBadge.module.css`

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  color: white;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  position: relative;
  cursor: help;
  transition: transform 0.2s ease;
}

.badge:hover {
  transform: scale(1.05);
}

.icon {
  font-size: 1.2em;
}

.value {
  font-size: 0.9em;
}

/* Tooltip */
.tooltip {
  visibility: hidden;
  opacity: 0;
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  background: rgba(0, 0, 0, 0.95);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  border: 2px solid currentColor;
  min-width: 200px;
  z-index: 1000;
  transition: all 0.2s ease;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.badge:hover .tooltip {
  visibility: visible;
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.tooltipTitle {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
  text-align: center;
}

.tooltipValue {
  font-size: 12px;
  margin-bottom: 4px;
  text-align: center;
}

.tooltipRange {
  font-size: 10px;
  color: #aaa;
  margin-bottom: 8px;
  text-align: center;
}

.effects {
  font-size: 11px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 8px;
}

.effects div {
  margin: 4px 0;
}

/* Size variants */
.sizeSmall {
  padding: 4px 8px;
  font-size: 12px;
}

.sizeMedium {
  padding: 6px 12px;
  font-size: 14px;
}

.sizeLarge {
  padding: 8px 16px;
  font-size: 16px;
}

/* Mobile adaptation */
@media (max-width: 768px) {
  .tooltip {
    position: fixed;
    bottom: auto;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    max-width: 300px;
  }
  
  .badge:hover .tooltip {
    transform: translate(-50%, -50%) scale(1);
  }
}
```

---

## 4. Dialogue Integration

### 4.1 Affinity-Based Dialogue Branching

**File:** `client/components/dialogue/DialogueManager.tsx` (snippet)

```typescript
import { useAffinityStore } from '@/client/store/affinityStore';
import { AffinityTier } from '@/shared/types/affinity';

interface DialogueNode {
  id: string;
  text: string;
  speaker: string;
  next?: string | string[];
  choices?: DialogueChoice[];
  conditions?: {
    minAffinity?: number;
    maxAffinity?: number;
    requiredTier?: AffinityTier;
    hasItem?: string;
    questCompleted?: string;
  };
}

interface DialogueChoice {
  text: string;
  next: string;
  affinityChange?: {
    amount: number;
    reason: 'agree_dialogue' | 'disagree_dialogue';
  };
}

export const useDialogueManager = (npcId: string) => {
  const getAffinity = useAffinityStore(state => state.getAffinity);
  const getAffinityTier = useAffinityStore(state => state.getAffinityTier);
  const changeAffinity = useAffinityStore(state => state.changeAffinity);
  
  const affinity = getAffinity(npcId);
  const tier = getAffinityTier(npcId);

  const checkConditions = (node: DialogueNode): boolean => {
    if (!node.conditions) return true;
    
    const { minAffinity, maxAffinity, requiredTier } = node.conditions;
    
    if (minAffinity !== undefined && affinity < minAffinity) return false;
    if (maxAffinity !== undefined && affinity > maxAffinity) return false;
    if (requiredTier !== undefined && tier !== requiredTier) return false;
    
    return true;
  };

  const handleChoice = (choice: DialogueChoice) => {
    if (choice.affinityChange) {
      changeAffinity(
        npcId,
        choice.affinityChange.amount,
        choice.affinityChange.reason
      );
    }
    return choice.next;
  };

  return {
    affinity,
    tier,
    checkConditions,
    handleChoice
  };
};
```

### 4.2 Example Dialogue Tree

**File:** `client/data/dialogues/maria_dialogue.json`

```json
{
  "nodes": {
    "greeting_hostile": {
      "id": "greeting_hostile",
      "text": "What do YOU want? Get away from my bakery!",
      "speaker": "maria_baker",
      "conditions": {
        "maxAffinity": -50
      },
      "choices": [
        {
          "text": "Leave quietly",
          "next": "end_cold",
          "affinityChange": {
            "amount": -2,
            "reason": "disagree_dialogue"
          }
        },
        {
          "text": "I'm sorry for bothering you",
          "next": "end_neutral",
          "affinityChange": {
            "amount": 3,
            "reason": "agree_dialogue"
          }
        }
      ]
    },
    "greeting_neutral": {
      "id": "greeting_neutral",
      "text": "Hello there. Looking for fresh bread?",
      "speaker": "maria_baker",
      "conditions": {
        "minAffinity": -9,
        "maxAffinity": 9
      },
      "choices": [
        {
          "text": "Yes, please!",
          "next": "shop_open",
          "affinityChange": {
            "amount": 2,
            "reason": "agree_dialogue"
          }
        },
        {
          "text": "Just passing by",
          "next": "end_friendly",
          "affinityChange": {
            "amount": 1,
            "reason": "agree_dialogue"
          }
        }
      ]
    },
    "greeting_friendly": {
      "id": "greeting_friendly",
      "text": "Oh, it's you! I saved some special pastries for you!",
      "speaker": "maria_baker",
      "conditions": {
        "minAffinity": 10
      },
      "choices": [
        {
          "text": "You're so kind!",
          "next": "gift_scene",
          "affinityChange": {
            "amount": 3,
            "reason": "agree_dialogue"
          }
        },
        {
          "text": "How are you doing?",
          "next": "chat_casual",
          "affinityChange": {
            "amount": 2,
            "reason": "agree_dialogue"
          }
        }
      ]
    },
    "romance_unlock": {
      "id": "romance_unlock",
      "text": "I... I've been hoping you'd come today. There's something I wanted to tell you...",
      "speaker": "maria_baker",
      "conditions": {
        "minAffinity": 50
      },
      "choices": [
        {
          "text": "I'm listening...",
          "next": "romance_confession",
          "affinityChange": {
            "amount": 5,
            "reason": "agree_dialogue"
          }
        }
      ]
    }
  }
}
```

---

## 5. Shop Price Integration

**File:** `client/components/shop/ShopSystem.tsx` (snippet)

```typescript
import { useAffinityStore } from '@/client/store/affinityStore';

interface ShopItem {
  id: string;
  name: string;
  basePrice: number;
  icon: string;
}

interface ShopProps {
  npcId: string;
  items: ShopItem[];
}

export const ShopSystem: React.FC<ShopProps> = ({ npcId, items }) => {
  const getPriceMultiplier = useAffinityStore(state => state.getPriceMultiplier(npcId));
  const tier = useAffinityStore(state => state.getAffinityTier(npcId));

  const calculateFinalPrice = (basePrice: number) => {
    return Math.round(basePrice * getPriceMultiplier);
  };

  return (
    <div className="shop-container">
      <div className="shop-header">
        <h3>{npcId}'s Shop</h3>
        <AffinityBadge npcId={npcId} size="small" />
        <span className="price-modifier">
          {getPriceMultiplier < 1 
            ? `-${Math.abs((1 - getPriceMultiplier) * 100).toFixed(0)}% discount`
            : `+${Math.abs((getPriceMultiplier - 1) * 100).toFixed(0)}% surcharge`
          }
        </span>
      </div>
      
      <div className="shop-items">
        {items.map(item => (
          <div key={item.id} className="shop-item">
            <img src={item.icon} alt={item.name} />
            <span>{item.name}</span>
            <span className="price">
              <span className="original-price">
                {item.basePrice} gold
              </span>
              <span className="final-price">
                {calculateFinalPrice(item.basePrice)} gold
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 6. Quest Availability Check

**File:** `client/hooks/useQuestAvailability.ts`

```typescript
import { useAffinityStore } from '@/client/store/affinityStore';

interface QuestRequirement {
  npcId: string;
  minAffinity?: number;
  requiredTier?: 'hostile' | 'unfriendly' | 'neutral' | 'friendly' | 'close';
}

export const useQuestAvailability = (questId: string, requirements: QuestRequirement[]) => {
  const canAccessQuests = useAffinityStore(state => 
    requirements.every(req => state.canAccessQuests(req.npcId))
  );
  
  const meetsAffinityRequirements = requirements.every(req => {
    const affinity = useAffinityStore.getState().getAffinity(req.npcId);
    const tier = useAffinityStore.getState().getAffinityTier(req.npcId);
    
    if (req.minAffinity !== undefined && affinity < req.minAffinity) {
      return false;
    }
    
    if (req.requiredTier !== undefined && tier !== req.requiredTier) {
      return false;
    }
    
    return true;
  });

  return {
    isAvailable: canAccessQuests && meetsAffinityRequirements,
    blockedReason: !canAccessQuests 
      ? 'Relationship too hostile' 
      : !meetsAffinityRequirements 
        ? 'Affinity requirements not met' 
        : null
  };
};
```

---

## 7. Edge Cases & Error Handling

### 7.1 Value Clamping
- **Проблема:** Значение выходит за пределы -100/+100.
- **Решение:** Функция `changeAffinity` использует `Math.max(-100, Math.min(100, newValue))`.

### 7.2 Missing NPC Data
- **Проблема:** Запрос affinity для несуществующего NPC.
- **Решение:** Возвращать дефолтное значение 0 (NEUTRAL).

### 7.3 Save/Load Corruption
- **Проблема:** Поврежденные данные в localStorage.
- **Решение:** Валидация при загрузке, сброс некорректных значений.

### 7.4 Race Conditions
- **Проблема:** Быстрые последовательные изменения affinity.
- **Решение:** Zustand обрабатывает обновления атомарно.

---

## 8. Testing Checklist

### Unit Tests
- [ ] `changeAffinity` clamps values correctly
- [ ] `calculateTier` returns correct tier for boundary values
- [ ] `getPriceMultiplier` returns correct multiplier
- [ ] `canAccessQuests` works for all tiers

### Integration Tests
- [ ] Dialogue branches change based on affinity
- [ ] Shop prices update when affinity changes
- [ ] Quest becomes available after reaching friendly tier
- [ ] Romance option unlocks at +50 affinity

### Visual Tests
- [ ] Badge color changes with tier
- [ ] Tooltip displays correct information
- [ ] Animations play on affinity change

### Edge Case Tests
- [ ] Set affinity to -100, verify hostile behavior
- [ ] Set affinity to +100, verify close behavior
- [ ] Load save with corrupted affinity data
- [ ] Rapid clicks don't cause race conditions

---

## 9. Asset Requirements

### Icons
```
/assets/ui/affinity/
  ├── heart_broken.svg    (hostile)
  ├── angry_face.svg      (unfriendly)
  ├── neutral_face.svg    (neutral)
  ├── happy_face.svg      (friendly)
  └── gold_heart.svg      (close)
```

### Audio (Optional)
```
/assets/audio/ui/
  ├── affinity_increase.mp3
  └── affinity_decrease.mp3
```

---

## 10. Acceptance Criteria

### Functional
- ✅ Affinity updates correctly after interactions
- ✅ Tier changes trigger appropriate dialogue branches
- ✅ Shop prices reflect affinity level
- ✅ Quests become unavailable below certain tiers
- ✅ Romance options unlock at +50 affinity

### Technical
- ✅ Values clamped between -100 and +100
- ✅ State persists through save/load
- ✅ No memory leaks from subscriptions
- ✅ TypeScript types are strict

### Visual
- ✅ Badge color matches tier configuration
- ✅ Tooltip shows accurate information
- ✅ Smooth transitions on tier change
- ✅ Mobile-friendly tooltip positioning

---

## 11. Future Enhancements (Out of Scope for 7.2)
- Daily decay system (optional feature)
- Group affinity (factions instead of individuals)
- Affinity-based world events
- Hidden affinity thresholds for secret content
- Relationship web (NPC-to-NPC relationships)
