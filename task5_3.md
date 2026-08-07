# Task 5.3: Money & Economy System — Detailed Implementation Specification

## 📋 Overview
This document provides a comprehensive technical specification for implementing the **Money & Economy System** in Castelvento 1940s. This is a **P1 High Priority** feature that drives player progression and engagement through earning, spending, and financial decision-making.

---

## 🎯 Core Objectives

Implement a currency-based economy where:
1. Players earn Italian Lira (₤) through various activities
2. Money is spent on goods, services, and relationship building
3. Economic balance creates meaningful choices without excessive grinding
4. Financial status affects gameplay options and NPC interactions

---

## 🏗️ Architecture

### File Structure
```
src/
├── stores/
│   ├── moneyStore.ts         # Currency state and transactions
│   └── economyStore.ts       # Prices, multipliers, economic state
├── utils/
│   ├── economyConfig.ts      # Base prices, rewards, balance tuning
│   ├── transactionLogger.ts  # Debug logging for transactions
│   └── currencyFormatter.ts  # Display formatting utilities
├── components/
│   ├── hud/
│   │   └── MoneyDisplay.tsx  # Currency widget
│   ├── shop/
│   │   ├── ShopModal.tsx     # Shop interface
│   │   ├── ShopItem.tsx      # Individual item card
│   │   └── PurchaseConfirm.tsx
│   └── modals/
│       └── InsufficientFunds.tsx
├── types/
│   └── economy.ts            # TypeScript interfaces
└── data/
    └── items.json            # Item database (price, description, type)
```

---

## 💰 Currency System

### Data Model

```typescript
// src/types/economy.ts
export type CurrencyType = 'lira';

export interface MoneyState {
  current: number;          // Current balance (integer only)
  lifetimeEarned: number;   // Total earned over game (for achievements)
  lifetimeSpent: number;    // Total spent over game
  lastTransaction: Transaction | null;
}

export interface Transaction {
  id: string;               // Unique transaction ID
  timestamp: number;        // Unix timestamp
  type: 'earn' | 'spend' | 'find' | 'lose';
  amount: number;
  source: string;           // e.g., 'WORK_MARKET', 'SHOP_GROCERY'
  description: string;
  balanceAfter: number;
}

export interface MoneyActions {
  earn: (amount: number, source: string, description?: string) => void;
  spend: (amount: number, source: string, description?: string) => boolean;
  find: (amount: number, location?: string) => void;
  lose: (amount: number, reason?: string) => void;
  getFormattedBalance: () => string;
  canAfford: (amount: number) => boolean;
  reset: () => void;
  getTransactionHistory: () => Transaction[];
}
```

### Store Implementation

```typescript
// src/stores/moneyStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MoneyState, MoneyActions, Transaction } from '../types/economy';
import { formatCurrency } from '../utils/currencyFormatter';
import { logTransaction } from '../utils/transactionLogger';

type MoneyStore = MoneyState & MoneyActions;

const DEFAULT_STATE: MoneyState = {
  current: 50,              // Starting amount
  lifetimeEarned: 0,
  lifetimeSpent: 0,
  lastTransaction: null,
};

const MAX_TRANSACTION_HISTORY = 50;

export const useMoneyStore = create<MoneyStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      earn: (amount: number, source: string, description?: string) => {
        if (amount <= 0) return;
        
        const { current, lifetimeEarned } = get();
        const newBalance = current + amount;
        
        const transaction: Transaction = {
          id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          type: 'earn',
          amount,
          source,
          description: description || `Earned ₤${amount}`,
          balanceAfter: newBalance,
        };
        
        set({
          current: newBalance,
          lifetimeEarned: lifetimeEarned + amount,
          lastTransaction: transaction,
        });
        
        logTransaction(transaction);
        
        // Play coin sound effect
        playSoundEffect('coin_earn');
      },

      spend: (amount: number, source: string, description?: string): boolean => {
        if (amount <= 0) return false;
        
        const { current, lifetimeSpent } = get();
        
        // Prevent negative balance
        if (current < amount) {
          // Trigger insufficient funds modal
          return false;
        }
        
        const newBalance = current - amount;
        
        const transaction: Transaction = {
          id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          type: 'spend',
          amount,
          source,
          description: description || `Spent ₤${amount}`,
          balanceAfter: newBalance,
        };
        
        set({
          current: newBalance,
          lifetimeSpent: lifetimeSpent + amount,
          lastTransaction: transaction,
        });
        
        logTransaction(transaction);
        
        // Play coin sound effect
        playSoundEffect('coin_spend');
        
        return true;
      },

      find: (amount: number, location?: string) => {
        const description = location 
          ? `Found ₤${amount} in ${location}` 
          : `Found ₤${amount} on the ground`;
        
        get().earn(amount, 'FOUND', description);
        
        // Show floating text animation
        showFloatingText(`+₤${amount}`, 'success');
      },

      lose: (amount: number, reason?: string) => {
        if (amount <= 0) return;
        
        const { current } = get();
        const actualLoss = Math.min(current, amount); // Can't lose more than you have
        
        const description = reason || `Lost ₤${actualLoss}`;
        
        const transaction: Transaction = {
          id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          type: 'lose',
          amount: actualLoss,
          source: 'MISCELLANEOUS',
          description,
          balanceAfter: current - actualLoss,
        };
        
        set({
          current: current - actualLoss,
          lastTransaction: transaction,
        });
        
        logTransaction(transaction);
        
        // Show floating text animation
        showFloatingText(`-₤${actualLoss}`, 'error');
      },

      getFormattedBalance: (): string => {
        return formatCurrency(get().current);
      },

      canAfford: (amount: number): boolean => {
        return get().current >= amount;
      },

      reset: () => set(DEFAULT_STATE),

      getTransactionHistory: (): Transaction[] => {
        // In a real implementation, you'd store history in state
        // For now, this is a placeholder
        return [];
      },
    }),
    {
      name: 'castelvento-money',
      partialize: (state) => ({
        current: state.current,
        lifetimeEarned: state.lifetimeEarned,
        lifetimeSpent: state.lifetimeSpent,
      }),
    }
  )
);
```

---

## 💼 Earning Methods

### Configuration

```typescript
// src/utils/economyConfig.ts
export interface EarningSource {
  id: string;
  baseReward: number;
  variableRange?: [number, number]; // [min, max] bonus
  repeatable: boolean;
  cooldownMinutes?: number; // In-game minutes
  requirements?: {
    minReputation?: Record<string, number>;
    hasItem?: string;
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  };
}

export const EARNING_SOURCES: Record<string, EarningSource> = {
  // Jobs (Repeatable, fixed pay)
  'WORK_MARKET': {
    id: 'WORK_MARKET',
    baseReward: 20,
    repeatable: true,
    cooldownMinutes: 60,
    requirements: {
      timeOfDay: 'morning',
    },
  },
  'WORK_DELIVERY': {
    id: 'WORK_DELIVERY',
    baseReward: 15,
    repeatable: true,
    cooldownMinutes: 45,
  },
  'WORK_FISHING': {
    id: 'WORK_FISHING',
    baseReward: 25,
    repeatable: true,
    cooldownMinutes: 90,
    requirements: {
      hasItem: 'FISHING_ROD',
    },
  },
  'WORK_NEWSPAPER': {
    id: 'WORK_NEWSPAPER',
    baseReward: 12,
    repeatable: true,
    cooldownMinutes: 30,
    requirements: {
      timeOfDay: 'morning',
    },
  },
  
  // Quests (One-time or limited, variable rewards)
  'QUEST_DELIVER_LETTER': {
    id: 'QUEST_DELIVER_LETTER',
    baseReward: 30,
    variableRange: [5, 15], // Bonus based on performance
    repeatable: false,
  },
  'QUEST_FIND_ITEM': {
    id: 'QUEST_FIND_ITEM',
    baseReward: 50,
    variableRange: [10, 30],
    repeatable: false,
  },
  'QUEST_ESCORT_NPC': {
    id: 'QUEST_ESCORT_NPC',
    baseReward: 75,
    variableRange: [15, 50],
    repeatable: false,
  },
  
  // Selling Items
  'SELL_ITEM': {
    id: 'SELL_ITEM',
    baseReward: 0, // Calculated from item value
    repeatable: true,
  },
  
  // Finding Money (Rare spawns)
  'FOUND_ON_GROUND': {
    id: 'FOUND_ON_GROUND',
    baseReward: 5,
    variableRange: [1, 20],
    repeatable: true,
    cooldownMinutes: 120, // Rare spawn
  },
  'FOUND_IN_POCKET': {
    id: 'FOUND_IN_POCKET',
    baseReward: 3,
    repeatable: false, // One-time discovery
  },
};
```

### Job System Implementation

```typescript
// src/systems/jobSystem.ts
import { useMoneyStore } from '../stores/moneyStore';
import { useTimeStore } from '../stores/timeStore';
import { EARNING_SOURCES } from '../utils/economyConfig';

interface JobResult {
  success: boolean;
  earned: number;
  message: string;
}

export function performJob(jobId: string): JobResult {
  const job = EARNING_SOURCES[jobId];
  
  if (!job) {
    return { success: false, earned: 0, message: 'Unknown job' };
  }
  
  const { spendTime } = useTimeStore.getState();
  const { earn } = useMoneyStore.getState();
  
  // Check requirements
  if (job.requirements) {
    const { timeOfDay, hasItem, minReputation } = job.requirements;
    
    if (timeOfDay) {
      const currentTimeOfDay = useTimeStore.getState().getTimeOfDay();
      if (currentTimeOfDay !== timeOfDay) {
        return { 
          success: false, 
          earned: 0, 
          message: `This job is only available in the ${timeOfDay}.` 
        };
      }
    }
    
    if (hasItem) {
      const hasRequiredItem = checkPlayerHasItem(hasItem);
      if (!hasRequiredItem) {
        return { 
          success: false, 
          earned: 0, 
          message: `You need a ${formatItemName(hasItem)} to do this job.` 
        };
      }
    }
    
    if (minReputation) {
      const meetsReputation = checkReputationRequirements(minReputation);
      if (!meetsReputation) {
        return { 
          success: false, 
          earned: 0, 
          message: 'Your reputation is too low for this job.' 
        };
      }
    }
  }
  
  // Calculate earnings
  let totalEarned = job.baseReward;
  
  if (job.variableRange) {
    const [minBonus, maxBonus] = job.variableRange;
    const bonus = Math.floor(Math.random() * (maxBonus - minBonus + 1)) + minBonus;
    totalEarned += bonus;
  }
  
  // Apply time cost (from action costs config)
  const timeCost = ACTION_COSTS[jobId]?.timeMinutes || 60;
  spendTime(timeCost);
  
  // Award money
  earn(totalEarned, jobId, `Completed ${formatJobName(jobId)}`);
  
  return {
    success: true,
    earned: totalEarned,
    message: `You earned ₤${totalEarned}!`,
  };
}
```

---

## 🛒 Spending Methods

### Shop System

```typescript
// src/types/shop.ts
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'food' | 'tool' | 'gift' | 'collectible' | 'quest';
  stackable: boolean;
  maxStack?: number;
  effects?: {
    energyRestore?: number;
    timeSave?: number;
    reputationGain?: Record<string, number>;
  };
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'unique';
}

export interface Shop {
  id: string;
  name: string;
  owner: string;
  location: string;
  inventory: ShopItem[];
  reputationDiscount?: {
    faction: string;
    threshold: number;
    discountPercent: number;
  };
  openingHours: {
    open: number;   // Minutes since midnight
    close: number;  // Minutes since midnight
  };
}
```

### Example Shop Data

```typescript
// src/data/shops.ts
export const SHOPS: Shop[] = [
  {
    id: 'SHOP_GROCERY',
    name: 'Marco\'s Grocery',
    owner: 'Marco Rossi',
    location: 'Town Square',
    inventory: [
      {
        id: 'ITEM_BREAD',
        name: 'Fresh Bread',
        description: 'Warm, crusty bread baked this morning.',
        price: 5,
        category: 'food',
        stackable: true,
        maxStack: 10,
        effects: {
          energyRestore: 15,
        },
        icon: '🍞',
        rarity: 'common',
      },
      {
        id: 'ITEM_CHEESE',
        name: 'Local Cheese',
        description: 'Aged pecorino from the countryside.',
        price: 12,
        category: 'food',
        stackable: true,
        maxStack: 5,
        effects: {
          energyRestore: 25,
        },
        icon: '🧀',
        rarity: 'common',
      },
      {
        id: 'ITEM_FRUIT',
        name: 'Seasonal Fruit',
        description: 'Fresh figs or oranges, depending on season.',
        price: 8,
        category: 'food',
        stackable: true,
        maxStack: 10,
        effects: {
          energyRestore: 10,
        },
        icon: '🍊',
        rarity: 'common',
      },
    ],
    reputationDiscount: {
      faction: 'SHOPS',
      threshold: 50,
      discountPercent: 10,
    },
    openingHours: {
      open: 7 * 60,    // 7:00 AM
      close: 19 * 60,  // 7:00 PM
    },
  },
  {
    id: 'SHOP_GIFT',
    name: 'Elena\'s Curiosities',
    owner: 'Elena Bianchi',
    location: 'Near Church',
    inventory: [
      {
        id: 'ITEM_FLOWERS',
        name: 'Wildflower Bouquet',
        description: 'Hand-picked flowers from the hills.',
        price: 15,
        category: 'gift',
        stackable: false,
        effects: {
          reputationGain: { 'ROMANCE': 10 },
        },
        icon: '💐',
        rarity: 'uncommon',
      },
      {
        id: 'ITEM_JEWELRY',
        name: 'Silver Locket',
        description: 'Delicate locket with intricate engraving.',
        price: 150,
        category: 'gift',
        stackable: false,
        effects: {
          reputationGain: { 'ROMANCE': 50 },
        },
        icon: '📿',
        rarity: 'rare',
      },
      {
        id: 'ITEM_BOOK',
        name: 'Old Poetry Book',
        description: 'Worn collection of Italian poems.',
        price: 40,
        category: 'gift',
        stackable: false,
        effects: {
          reputationGain: { 'INTELLECTUAL': 20 },
        },
        icon: '📖',
        rarity: 'uncommon',
      },
    ],
    openingHours: {
      open: 10 * 60,   // 10:00 AM
      close: 18 * 60,  // 6:00 PM
    },
  },
];
```

### Purchase Logic

```typescript
// src/systems/shopSystem.ts
import { useMoneyStore } from '../stores/moneyStore';
import { useInventoryStore } from '../stores/inventoryStore';
import { Shop, ShopItem } from '../types/shop';

interface PurchaseResult {
  success: boolean;
  message: string;
  item?: ShopItem;
}

export function purchaseItem(
  shop: Shop, 
  itemId: string, 
  quantity: number = 1
): PurchaseResult {
  const { spend, canAfford, current } = useMoneyStore.getState();
  const { addItem } = useInventoryStore.getState();
  
  // Find item in shop inventory
  const item = shop.inventory.find(i => i.id === itemId);
  
  if (!item) {
    return { success: false, message: 'Item not found in shop.' };
  }
  
  // Check shop hours
  const { minutesSinceMidnight } = useTimeStore.getState();
  const { open, close } = shop.openingHours;
  
  if (minutesSinceMidnight < open || minutesSinceMidnight >= close) {
    return { success: false, message: 'Shop is closed.' };
  }
  
  // Calculate total price with potential discount
  let totalPrice = item.price * quantity;
  
  if (shop.reputationDiscount) {
    const rep = getReputation(shop.reputationDiscount.faction);
    if (rep >= shop.reputationDiscount.threshold) {
      const discount = Math.floor(totalPrice * (shop.reputationDiscount.discountPercent / 100));
      totalPrice -= discount;
    }
  }
  
  // Check if player can afford
  if (!canAfford(totalPrice)) {
    return { 
      success: false, 
      message: `Not enough money. You have ₤${current}, need ₤${totalPrice}.` 
    };
  }
  
  // Check inventory space
  if (!item.stackable) {
    for (let i = 0; i < quantity; i++) {
      if (!hasInventorySpace()) {
        return { success: false, message: 'Not enough inventory space.' };
      }
    }
  } else {
    const existingStack = getInventoryStack(itemId);
    const maxStack = item.maxStack || 99;
    
    if (existingStack && existingStack.quantity + quantity > maxStack) {
      return { 
        success: false, 
        message: `Cannot carry more than ${maxStack} of this item.` 
      };
    }
    
    if (!hasInventorySpace()) {
      return { success: false, message: 'Not enough inventory space.' };
    }
  }
  
  // Process transaction
  const success = spend(totalPrice, shop.id, `Bought ${quantity}x ${item.name}`);
  
  if (!success) {
    return { success: false, message: 'Transaction failed.' };
  }
  
  // Add to inventory
  for (let i = 0; i < quantity; i++) {
    addItem({ ...item, quantity: 1 });
  }
  
  return {
    success: true,
    message: `Purchased ${quantity}x ${item.name} for ₤${totalPrice}.`,
    item,
  };
}
```

---

## 🎨 UI Components

### Money Display Widget

```tsx
// src/components/hud/MoneyDisplay.tsx
import React from 'react';
import { useMoneyStore } from '../../stores/moneyStore';
import { motion } from 'framer-motion';
import './MoneyDisplay.css';

export const MoneyDisplay: React.FC = () => {
  const { current, lastTransaction } = useMoneyStore();
  
  // Animation for recent transactions
  const [animKey, setAnimKey] = React.useState(0);
  
  React.useEffect(() => {
    if (lastTransaction) {
      setAnimKey(prev => prev + 1);
    }
  }, [lastTransaction]);

  return (
    <motion.div 
      className="money-display"
      key={animKey}
      initial={{ scale: 1 }}
      animate={{ 
        scale: lastTransaction ? [1, 1.1, 1] : 1 
      }}
      transition={{ duration: 0.3 }}
    >
      <div className="money-icon">₤</div>
      <div className="money-amount">{current.toLocaleString()}</div>
      
      {/* Recent transaction indicator */}
      {lastTransaction && (
        <motion.div
          className="transaction-indicator"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          {lastTransaction.type === 'earn' && (
            <span className="gain">+₤{lastTransaction.amount}</span>
          )}
          {lastTransaction.type === 'spend' && (
            <span className="loss">-₤{lastTransaction.amount}</span>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};
```

```css
/* src/components/hud/MoneyDisplay.css */
.money-display {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.9), rgba(218, 165, 32, 0.9));
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: visible;
}

.money-icon {
  font-size: 24px;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.money-amount {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  font-family: 'Courier Prime', monospace;
  letter-spacing: 1px;
}

.transaction-indicator {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
}

.transaction-indicator .gain {
  color: #4ade80;
}

.transaction-indicator .loss {
  color: #f87171;
}
```

### Shop Modal Interface

```tsx
// src/components/shop/ShopModal.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMoneyStore } from '../../stores/moneyStore';
import { Shop, ShopItem } from '../../types/shop';
import { purchaseItem } from '../../systems/shopSystem';
import { ShopItem as ShopItemComponent } from './ShopItem';
import { PurchaseConfirm } from './PurchaseConfirm';
import './ShopModal.css';

interface Props {
  shop: Shop;
  isOpen: boolean;
  onClose: () => void;
}

export const ShopModal: React.FC<Props> = ({ shop, isOpen, onClose }) => {
  const { canAfford } = useMoneyStore();
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);

  const handleItemClick = (item: ShopItem) => {
    setSelectedItem(item);
  };

  const handlePurchase = () => {
    if (!selectedItem) return;
    
    const result = purchaseItem(shop, selectedItem.id);
    setPurchaseMessage(result.message);
    
    if (result.success) {
      setShowConfirm(false);
      setSelectedItem(null);
    }
  };

  const isClosed = () => {
    const { minutesSinceMidnight } = useMoneyStore.getState();
    const { open, close } = shop.openingHours;
    return minutesSinceMidnight < open || minutesSinceMidnight >= close;
  };

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
            className="shop-modal"
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
          >
            <div className="shop-header">
              <h2>{shop.name}</h2>
              <p className="shop-owner">Proprietor: {shop.owner}</p>
              {isClosed() && (
                <div className="closed-sign">CLOSED</div>
              )}
            </div>
            
            <div className="shop-grid">
              {shop.inventory.map(item => (
                <ShopItemComponent
                  key={item.id}
                  item={item}
                  canAfford={canAfford(item.price)}
                  onClick={() => handleItemClick(item)}
                  onBuy={() => {
                    setSelectedItem(item);
                    setShowConfirm(true);
                  }}
                />
              ))}
            </div>
            
            <div className="shop-footer">
              <button className="btn-secondary" onClick={onClose}>
                Leave Shop
              </button>
            </div>
            
            {/* Purchase Confirmation Modal */}
            {showConfirm && selectedItem && (
              <PurchaseConfirm
                item={selectedItem}
                onConfirm={handlePurchase}
                onCancel={() => setShowConfirm(false)}
              />
            )}
            
            {/* Toast Message */}
            {purchaseMessage && (
              <div className="purchase-toast">
                {purchaseMessage}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
```

---

## 🧪 Testing Scenarios

### Unit Tests

```typescript
// src/stores/__tests__/moneyStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useMoneyStore } from '../moneyStore';

describe('MoneyStore', () => {
  beforeEach(() => {
    useMoneyStore.setState({
      current: 50,
      lifetimeEarned: 0,
      lifetimeSpent: 0,
      lastTransaction: null,
    });
  });

  it('starts with 50 Liras', () => {
    expect(useMoneyStore.getState().current).toBe(50);
  });

  it('earns money correctly', () => {
    useMoneyStore.getState().earn(20, 'WORK_MARKET');
    expect(useMoneyStore.getState().current).toBe(70);
    expect(useMoneyStore.getState().lifetimeEarned).toBe(20);
  });

  it('spends money successfully', () => {
    const result = useMoneyStore.getState().spend(30, 'SHOP_GROCERY');
    expect(result).toBe(true);
    expect(useMoneyStore.getState().current).toBe(20);
    expect(useMoneyStore.getState().lifetimeSpent).toBe(30);
  });

  it('blocks spending when insufficient funds', () => {
    const result = useMoneyStore.getState().spend(100, 'SHOP_GIFT');
    expect(result).toBe(false);
    expect(useMoneyStore.getState().current).toBe(50); // Unchanged
  });

  it('prevents negative balance', () => {
    useMoneyStore.getState().spend(50, 'SHOP');
    const result = useMoneyStore.getState().spend(10, 'SHOP');
    expect(result).toBe(false);
    expect(useMoneyStore.getState().current).toBe(0);
  });

  it('finds money correctly', () => {
    useMoneyStore.getState().find(15, 'STREET');
    expect(useMoneyStore.getState().current).toBe(65);
  });

  it('formats currency correctly', () => {
    useMoneyStore.setState({ current: 1250 });
    expect(useMoneyStore.getState().getFormattedBalance()).toBe('₤1,250');
  });

  it('checks affordability correctly', () => {
    expect(useMoneyStore.getState().canAfford(40)).toBe(true);
    expect(useMoneyStore.getState().canAfford(60)).toBe(false);
  });
});
```

### Edge Cases to Handle

1. **Rapid Clicking**: Prevent double-spending with transaction debounce
2. **Decimal Values**: Ensure all money values are integers
3. **Overflow Protection**: Cap maximum money at safe integer limit
4. **Shop Closed**: Block purchases outside opening hours
5. **Inventory Full**: Prevent purchase if no space
6. **Concurrent Transactions**: Queue or block simultaneous operations
7. **Save Corruption**: Validate persisted money state on load
8. **Negative Prices**: Block items with invalid pricing

---

## 🎯 Acceptance Criteria Checklist

### Functional Requirements
- [ ] Player starts with 50 Liras
- [ ] Earning methods work correctly (jobs, quests, selling, finding)
- [ ] Spending methods work correctly (shops, transportation, gifts)
- [ ] Cannot spend more than available balance
- [ ] Balance never goes negative
- [ ] Transaction history tracked (at least last 50)
- [ ] Lifetime earned/spent statistics accurate
- [ ] Reputation discounts apply correctly
- [ ] Shop hours enforced

### UI/UX Requirements
- [ ] Money display shows current balance clearly
- [ ] Currency formatted with comma separators (₤1,250)
- [ ] Visual feedback on earn/spend (animations, colors)
- [ ] Insufficient funds modal is clear and helpful
- [ ] Shop interface shows prices and descriptions
- [ ] Purchase confirmation prevents accidental spending
- [ ] Floating text shows gains/losses
- [ ] Responsive design on mobile

### Technical Requirements
- [ ] All values are integers (no decimals)
- [ ] State persisted across reloads
- [ ] No race conditions in transactions
- [ ] Sound effects play on transactions
- [ ] TypeScript types fully defined
- [ ] Unit tests pass (>90% coverage)
- [ ] Works offline
- [ ] Compatible with save/load system

### Economy Balance
- [ ] Early game (₤50-200): Feels achievable within 1-2 days
- [ ] Mid game (₤200-500): Requires strategic choices
- [ ] Late game (₤500+): Rewards consistent play
- [ ] No infinite money exploits
- [ ] Grinding not required for progression
- [ ] Multiple viable earning strategies

---

## 🔧 Configuration Options

### Economy Balance Tuning

```typescript
// src/config/economyBalance.ts
export const ECONOMY_BALANCE = {
  startingMoney: 50,
  maxMoney: 999999, // Prevent overflow
  
  jobMultipliers: {
    lowReputation: 0.8,   // Penalty for low rep
    highReputation: 1.2,  // Bonus for high rep
  },
  
  shopDiscounts: {
    friendlyThreshold: 50,
    friendlyDiscount: 0.1, // 10% off
    belovedThreshold: 80,
    belovedDiscount: 0.2,  // 20% off
  },
  
  findMoneyChance: 0.05, // 5% chance to find money on exploration
  findMoneyMin: 1,
  findMoneyMax: 20,
  
  penalties: {
    theftFine: 100,      // Caught stealing
    damageFee: 50,       // Breaking something
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

Optional for enhanced UX:
- `react-confetti` - Celebration effect on large earnings

---

## 🚀 Implementation Order

1. **Phase 1**: Create TypeScript types and interfaces
2. **Phase 2**: Implement `moneyStore.ts` with basic actions
3. **Phase 3**: Create economy configuration (prices, rewards)
4. **Phase 4**: Build MoneyDisplay UI component
5. **Phase 5**: Implement shop system and data
6. **Phase 6**: Create ShopModal and ShopItem components
7. **Phase 7**: Add transaction logging and debugging tools
8. **Phase 8**: Implement InsufficientFunds modal
9. **Phase 9**: Write unit tests
10. **Phase 10**: Balance tuning and polish

---

## 💡 Developer Notes

- **Integer Only**: Never use floats for money to avoid precision issues
- **Transaction IDs**: Use unique IDs for debugging and rollback capability
- **Audit Trail**: Log all transactions for cheat detection
- **Server Authority**: In multiplayer, validate transactions server-side
- **Localization**: Format currency per region (₤, EUR, etc.)

Example selector optimization:
```tsx
const balance = useMoneyStore(state => state.current);
const canAffordItem = useMoneyStore(state => state.canAfford(price));
```

---

## 🎬 Example User Flow

```
Player starts day (₤50)
  ↓
Works at market (-60 min, -20 Energy)
  ↓
Earns ₤20 → Balance: ₤70
  ↓
Explores town, finds ₤5 on street
  ↓
Balance: ₤75
  ↓
Visits grocery shop
  ↓
Buys Bread (₤5) and Cheese (₤12)
  ↓
Balance: ₤58
  ↓
Completes quest for NPC
  ↓
Earns ₤45 → Balance: ₤103
  ↓
Buys gift (Flowers ₤15) for romance NPC
  ↓
Balance: ₤88
  ↓
End of day savings: ₤38 profit
```

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
- [ ] Economy feels balanced (not too easy/hard)
- [ ] Shop interfaces intuitive
- [ ] No console warnings or errors
- [ ] Performance profile shows no issues
- [ ] Integrated with inventory and reputation systems
- [ ] Save/load tested with money state
- [ ] Documentation updated

---

**Status**: Ready for Implementation  
**Priority**: P1 (High)  
**Estimated Complexity**: Medium  
**Dependencies**: Inventory System (optional for full functionality)
