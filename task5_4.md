# Task 5.4: Inventory System (Drag & Drop) — Детальная спецификация реализации

## 📋 Обзор задачи

**Приоритет:** P1 (High)  
**Контекст:** Система инвентаря в стиле старого кожаного рюкзака/портфеля с механикой drag-and-drop для взаимодействия предметов с окружением и NPC.

---

## 🎯 Функциональные требования

### 1. Структура данных предмета

```typescript
// shared/src/types/inventory.ts

export type ItemType = 
  | 'consumable'    // Еда, лекарства
  | 'quest'         // Квестовые предметы (письма, ключи)
  | 'tool'          // Инструменты (фонарик, удочка)
  | 'gift'          // Подарки (цветы, украшения)
  | 'collectible';  // Коллекционные предметы (марки, открытки)

export interface Item {
  id: string;           // Уникальный ID (например, 'letter_001')
  name: string;         // Отображаемое имя
  description: string;  // Подробное описание
  type: ItemType;       // Тип предмета
  icon: string;         // Путь к SVG/PNG иконке
  stackable: boolean;   // Можно ли складывать в стак
  maxStack?: number;    // Максимум в стаке (default: 99)
  value: number;        // Стоимость в лирах
  weight: number;       // Вес (для ограничения инвентаря, опционально)
  
  // Метаданные для использования
  consumable?: {
    effect: 'heal' | 'buff' | 'story';
    value: number;
    duration?: number; // Для баффов в минутах
  };
  
  questData?: {
    questId: string;
    stage: string;
    autoConsume: boolean;
  };
  
  giftData?: {
    recipientIds: string[]; // Кому можно подарить
    relationshipBoost: number;
  };
}

export interface InventorySlot {
  item: Item;
  quantity: number;
  slotIndex: number;
}
```

### 2. Состояние инвентаря (Zustand Store)

```typescript
// client/src/store/inventoryStore.ts

import { create } from 'zustand';
import { Item, InventorySlot } from '@castelvento/shared';

interface InventoryState {
  slots: (InventorySlot | null)[];  // 16 слотов (4x4)
  totalSlots: number;
  
  // Actions
  addItem: (item: Item, quantity?: number) => boolean;
  removeItem: (slotIndex: number, quantity?: number) => void;
  moveItem: (fromSlot: number, toSlot: number) => void;
  useItem: (slotIndex: number, target?: any) => boolean;
  getItemAt: (slotIndex: number) => InventorySlot | null;
  hasItem: (itemId: string) => boolean;
  getItemCount: (itemId: string) => number;
  clearSlot: (slotIndex: number) => void;
  sortInventory: (sortBy: 'type' | 'name' | 'value') => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  slots: Array(16).fill(null),
  totalSlots: 16,
  
  addItem: (item, quantity = 1) => {
    const state = get();
    
    // Если стакается, ищем существующий стак
    if (item.stackable) {
      for (let i = 0; i < state.slots.length; i++) {
        const slot = state.slots[i];
        if (slot && slot.item.id === item.id && slot.quantity < (item.maxStack || 99)) {
          const canAdd = Math.min(
            quantity,
            (item.maxStack || 99) - slot.quantity
          );
          
          const newSlots = [...state.slots];
          newSlots[i] = { ...slot, quantity: slot.quantity + canAdd };
          set({ slots: newSlots });
          
          const remaining = quantity - canAdd;
          if (remaining > 0) {
            return get().addItem(item, remaining); // Рекурсия для остатка
          }
          return true;
        }
      }
    }
    
    // Ищем пустой слот
    const emptySlotIndex = state.slots.findIndex(slot => slot === null);
    if (emptySlotIndex === -1) {
      return false; // Инвентарь полон
    }
    
    const newSlots = [...state.slots];
    newSlots[emptySlotIndex] = {
      item,
      quantity: Math.min(quantity, item.maxStack || 99),
      slotIndex: emptySlotIndex
    };
    
    set({ slots: newSlots });
    return true;
  },
  
  removeItem: (slotIndex, quantity = 1) => {
    const state = get();
    const slot = state.slots[slotIndex];
    
    if (!slot) return;
    
    const newSlots = [...state.slots];
    
    if (quantity >= slot.quantity) {
      newSlots[slotIndex] = null;
    } else {
      newSlots[slotIndex] = { ...slot, quantity: slot.quantity - quantity };
    }
    
    set({ slots: newSlots });
  },
  
  moveItem: (fromSlot, toSlot) => {
    const state = get();
    const from = state.slots[fromSlot];
    const to = state.slots[toSlot];
    
    if (!from) return;
    
    const newSlots = [...state.slots];
    
    // Если целевой слот пуст
    if (!to) {
      newSlots[toSlot] = { ...from, slotIndex: toSlot };
      newSlots[fromSlot] = null;
    }
    // Если тот же предмет (стакинг)
    else if (from.item.id === to.item.id && from.item.stackable) {
      const total = from.quantity + to.quantity;
      const maxStack = from.item.maxStack || 99;
      
      if (total <= maxStack) {
        newSlots[toSlot] = { ...to, quantity: total };
        newSlots[fromSlot] = null;
      } else {
        newSlots[toSlot] = { ...to, quantity: maxStack };
        newSlots[fromSlot] = { ...from, quantity: total - maxStack };
      }
    }
    // Обмен предметами
    else {
      newSlots[toSlot] = { ...from, slotIndex: toSlot };
      newSlots[fromSlot] = { ...to, slotIndex: fromSlot };
    }
    
    set({ slots: newSlots });
  },
  
  useItem: (slotIndex, target) => {
    const state = get();
    const slot = state.slots[slotIndex];
    
    if (!slot) return false;
    
    const { item } = slot;
    
    // Логика использования в зависимости от типа
    switch (item.type) {
      case 'consumable':
        // Применить эффект
        if (item.consumable?.effect === 'heal') {
          // Вызвать store здоровья
          console.log(`Healing for ${item.consumable.value}`);
        }
        // Удалить или уменьшить количество
        get().removeItem(slotIndex, 1);
        return true;
        
      case 'quest':
        // Проверить контекст квеста
        if (target && item.questData?.autoConsume) {
          get().removeItem(slotIndex, 1);
          // Триггер обновления квеста
          return true;
        }
        return false;
        
      case 'gift':
        // Подарить NPC
        if (target && item.giftData?.recipientIds.includes(target.id)) {
          get().removeItem(slotIndex, 1);
          // Обновить репутацию
          console.log(`Gifting to ${target.name}`);
          return true;
        }
        return false;
        
      default:
        return false;
    }
  },
  
  getItemAt: (slotIndex) => get().slots[slotIndex],
  
  hasItem: (itemId) => {
    return get().slots.some(slot => slot?.item.id === itemId);
  },
  
  getItemCount: (itemId) => {
    return get().slots.reduce((total, slot) => {
      if (slot?.item.id === itemId) {
        return total + slot.quantity;
      }
      return total;
    }, 0);
  },
  
  clearSlot: (slotIndex) => {
    const newSlots = [...get().slots];
    newSlots[slotIndex] = null;
    set({ slots: newSlots });
  },
  
  sortInventory: (sortBy) => {
    const state = get();
    const nonEmptySlots = state.slots.filter((slot): slot is InventorySlot => slot !== null);
    
    nonEmptySlots.sort((a, b) => {
      switch (sortBy) {
        case 'type':
          return a.item.type.localeCompare(b.item.type);
        case 'name':
          return a.item.name.localeCompare(b.item.name);
        case 'value':
          return b.item.value - a.item.value;
        default:
          return 0;
      }
    });
    
    const newSlots = Array(16).fill(null);
    nonEmptySlots.forEach((slot, index) => {
      if (index < 16) {
        newSlots[index] = { ...slot, slotIndex: index };
      }
    });
    
    set({ slots: newSlots });
  }
}));
```

---

## 🎨 UI Компоненты

### 1. Контейнер инвентаря (BackpackUI)

**Файл:** `client/src/components/ui/inventory/BackpackUI.tsx`

```tsx
import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { useInventoryStore } from '../../../store/inventoryStore';
import InventorySlot from './InventorySlot';
import ItemDetailModal from './ItemDetailModal';
import { Item } from '@castelvento/shared';

const BackpackUI: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { slots, moveItem, useItem } = useInventoryStore();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  
  // Текстура старого кожаного рюкзака
  const backpackTexture = '/assets/ui/backpack_leather.png';
  
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setDraggedItem(Number(active.id));
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedItem(null);
    
    if (!over) return;
    
    const fromSlot = Number(active.id);
    const toSlot = Number(over.id);
    
    if (fromSlot !== toSlot) {
      moveItem(fromSlot, toSlot);
    }
  };
  
  const handleSlotClick = (slotIndex: number) => {
    const slot = slots[slotIndex];
    if (slot) {
      setSelectedItem(slot.item);
    }
  };
  
  const handleUseItem = (target?: any) => {
    if (selectedItem) {
      const slotIndex = slots.findIndex(s => s?.item.id === selectedItem.id);
      if (slotIndex !== -1) {
        const success = useItem(slotIndex, target);
        if (success) {
          setSelectedItem(null);
        }
      }
    }
  };
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        onClick={onClose}
      >
        {/* Контейнер рюкзака */}
        <div
          className="relative w-[600px] h-[700px] rounded-lg shadow-2xl overflow-hidden"
          style={{
            backgroundImage: `url(${backpackTexture})`,
            backgroundSize: 'cover',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Заголовок */}
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
            <h2 className="text-2xl font-handwritten text-amber-100 text-center">
              Рюкзак Путешественника
            </h2>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-amber-200 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Сетка инвентаря 4x4 */}
          <DndContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="absolute inset-0 pt-20 px-8 pb-8">
              <div className="grid grid-cols-4 gap-3 h-full">
                {slots.map((slot, index) => (
                  <InventorySlot
                    key={index}
                    id={String(index)}
                    slot={slot}
                    index={index}
                    isDragging={draggedItem === index}
                    onClick={() => handleSlotClick(index)}
                  />
                ))}
              </div>
            </div>
          </DndContext>
          
          {/* Декоративные элементы */}
          <div className="absolute bottom-4 left-4 text-amber-200/60 text-sm font-handwritten">
            Предметов: {slots.filter(s => s !== null).length} / 16
          </div>
          
          {/* Кнопки сортировки */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={() => useInventoryStore.getState().sortInventory('type')}
              className="px-3 py-1 bg-amber-900/50 text-amber-100 rounded text-xs hover:bg-amber-800/70 transition-colors"
            >
              По типу
            </button>
            <button
              onClick={() => useInventoryStore.getState().sortInventory('value')}
              className="px-3 py-1 bg-amber-900/50 text-amber-100 rounded text-xs hover:bg-amber-800/70 transition-colors"
            >
              По цене
            </button>
          </div>
        </div>
      </motion.div>
      
      {/* Модальное окно деталей предмета */}
      <AnimatePresence>
        {selectedItem && (
          <ItemDetailModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onUse={handleUseItem}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default BackpackUI;
```

### 2. Слот инвентаря (InventorySlot)

**Файл:** `client/src/components/ui/inventory/InventorySlot.tsx`

```tsx
import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { InventorySlot as SlotType } from '@castelvento/shared';

interface Props {
  id: string;
  slot: SlotType | null;
  index: number;
  isDragging: boolean;
  onClick: () => void;
}

const InventorySlot: React.FC<Props> = ({ id, slot, index, isDragging, onClick }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    disabled: !slot,
  });
  
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id,
  });
  
  const style = {
    transform: CSS.Translate(transform),
    opacity: isDragging ? 0.5 : 1,
  };
  
  return (
    <motion.div
      ref={(node) => {
        setNodeRef(node);
        setDropRef(node);
      }}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`
        relative w-full aspect-square rounded-lg border-2 
        ${isOver ? 'border-amber-400 bg-amber-400/20' : 'border-amber-900/50 bg-black/30'}
        ${!slot ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}
        transition-all duration-200
        flex items-center justify-center
      `}
      style={style}
      whileHover={slot ? { scale: 1.05, brightness: 1.1 } : {}}
      whileTap={slot ? { scale: 0.95 } : {}}
    >
      {slot && (
        <>
          {/* Иконка предмета */}
          <img
            src={slot.item.icon}
            alt={slot.item.name}
            className="w-3/4 h-3/4 object-contain drop-shadow-lg"
            draggable={false}
          />
          
          {/* Количество (для стакаемых) */}
          {slot.item.stackable && slot.quantity > 1 && (
            <span className="absolute bottom-1 right-1 text-white text-xs font-bold drop-shadow-md">
              {slot.quantity}
            </span>
          )}
          
          {/* Тип предмета (цветная рамка) */}
          <div
            className={`
              absolute inset-0 rounded-lg border-2 pointer-events-none
              ${slot.item.type === 'consumable' ? 'border-green-500/30' : ''}
              ${slot.item.type === 'quest' ? 'border-purple-500/30' : ''}
              ${slot.item.type === 'tool' ? 'border-blue-500/30' : ''}
              ${slot.item.type === 'gift' ? 'border-pink-500/30' : ''}
              ${slot.item.type === 'collectible' ? 'border-yellow-500/30' : ''}
            `}
          />
        </>
      )}
      
      {/* Номер слота (едва заметный) */}
      {!slot && (
        <span className="text-amber-900/30 text-xs">{index + 1}</span>
      )}
    </motion.div>
  );
};

export default InventorySlot;
```

### 3. Модальное окно деталей предмета (ItemDetailModal)

**Файл:** `client/src/components/ui/inventory/ItemDetailModal.tsx`

```tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Item } from '@castelvento/shared';

interface Props {
  item: Item;
  onClose: () => void;
  onUse: (target?: any) => void;
}

const ItemDetailModal: React.FC<Props> = ({ item, onClose, onUse }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="bg-[url('/assets/ui/parchment.png')] bg-cover rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок с иконкой */}
        <div className="flex items-start gap-4 mb-4">
          <img
            src={item.icon}
            alt={item.name}
            className="w-16 h-16 object-contain drop-shadow-lg"
          />
          <div>
            <h3 className="text-xl font-handwritten text-amber-900">
              {item.name}
            </h3>
            <p className="text-sm text-amber-700 italic">
              {item.type === 'consumable' && 'Расходуемый предмет'}
              {item.type === 'quest' && 'Квестовый предмет'}
              {item.type === 'tool' && 'Инструмент'}
              {item.type === 'gift' && 'Подарок'}
              {item.type === 'collectible' && 'Коллекционный предмет'}
            </p>
          </div>
        </div>
        
        {/* Описание */}
        <div className="mb-4">
          <p className="text-amber-800 leading-relaxed font-serif">
            {item.description}
          </p>
        </div>
        
        {/* Дополнительная информация */}
        <div className="space-y-2 mb-6">
          {item.value > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-amber-700">Стоимость:</span>
              <span className="font-bold text-amber-900">₤{item.value}</span>
            </div>
          )}
          
          {item.weight && (
            <div className="flex justify-between text-sm">
              <span className="text-amber-700">Вес:</span>
              <span className="font-bold text-amber-900">{item.weight} кг</span>
            </div>
          )}
          
          {item.consumable && (
            <div className="p-3 bg-green-100/50 rounded text-sm text-green-800">
              Эффект: {item.consumable.effect === 'heal' ? `Восстанавливает ${item.consumable.value} HP` : 'Дает временный бафф'}
            </div>
          )}
          
          {item.questData && (
            <div className="p-3 bg-purple-100/50 rounded text-sm text-purple-800">
              Относится к квесту: {item.questData.questId}
            </div>
          )}
          
          {item.giftData && (
            <div className="p-3 bg-pink-100/50 rounded text-sm text-pink-800">
              Можно подарить: {item.giftData.recipientIds.length} персонажам
            </div>
          )}
        </div>
        
        {/* Кнопки действий */}
        <div className="flex gap-3">
          {item.type === 'consumable' && (
            <button
              onClick={() => onUse()}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-handwritten"
            >
              Использовать
            </button>
          )}
          
          {item.type === 'gift' && (
            <button
              onClick={() => {/* Открыть выбор NPC */}}
              className="flex-1 px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition-colors font-handwritten"
            >
              Подарить
            </button>
          )}
          
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-800 transition-colors font-handwritten"
          >
            Закрыть
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ItemDetailModal;
```

---

## 🖱️ Drag & Drop Механика

### 1. Использование с окружением (Hotspot System)

```typescript
// client/src/hooks/useInventoryInteraction.ts

import { useCallback } from 'react';
import { useInventoryStore } from '../store/inventoryStore';

interface Hotspot {
  id: string;
  acceptedItemTypes: string[];
  acceptedItemIds?: string[];
  onUse: (item: Item) => void;
}

export const useInventoryInteraction = () => {
  const { slots, useItem } = useInventoryStore();
  
  const handleDropOnHotspot = useCallback((
    itemId: string,
    hotspot: Hotspot
  ) => {
    const slotIndex = slots.findIndex(s => s?.item.id === itemId);
    if (slotIndex === -1) return false;
    
    const slot = slots[slotIndex];
    if (!slot) return false;
    
    // Проверка типа предмета
    if (!hotspot.acceptedItemTypes.includes(slot.item.type)) {
      return false;
    }
    
    // Проверка конкретного ID (опционально)
    if (hotspot.acceptedItemIds && !hotspot.acceptedItemIds.includes(slot.item.id)) {
      return false;
    }
    
    // Использование предмета
    const success = useItem(slotIndex, { type: 'hotspot', id: hotspot.id });
    
    if (success) {
      hotspot.onUse(slot.item);
    }
    
    return success;
  }, [slots, useItem]);
  
  return { handleDropOnHotspot };
};
```

### 2. Визуальная подсветка валидных целей

```tsx
// client/src/components/world/Hotspot.tsx

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';

interface Props {
  id: string;
  acceptedTypes: string[];
  children: React.ReactNode;
}

const Hotspot: React.FC<Props> = ({ id, acceptedTypes, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { acceptedTypes },
  });
  
  return (
    <motion.div
      ref={setNodeRef}
      className="relative"
      animate={{
        scale: isOver ? 1.1 : 1,
        filter: isOver ? 'brightness(1.3) drop-shadow(0 0 10px gold)' : 'none',
      }}
      transition={{ duration: 0.2 }}
    >
      {children}
      
      {isOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -inset-4 border-2 border-dashed border-amber-400 rounded-lg"
        />
      )}
    </motion.div>
  );
};

export default Hotspot;
```

---

## 📱 Мобильная адаптация

### Long-press для начала перетаскивания

```tsx
// client/src/components/ui/inventory/InventorySlot.mobile.tsx

import React, { useState, useEffect } from 'react';

const LONG_PRESS_DURATION = 500; // ms

const InventorySlotMobile: React.FC<Props> = (props) => {
  const [longPressActive, setLongPressActive] = useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  
  const handleTouchStart = () => {
    timerRef.current = setTimeout(() => {
      setLongPressActive(true);
      // Начать drag
    }, LONG_PRESS_DURATION);
  };
  
  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setLongPressActive(false);
  };
  
  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={() => {
        if (timerRef.current) clearTimeout(timerRef.current);
      }}
    >
      {/* Основной компонент слота */}
      <InventorySlot {...props} />
      
      {longPressActive && (
        <div className="absolute inset-0 bg-amber-400/20 rounded-lg animate-pulse" />
      )}
    </div>
  );
};
```

---

## ✅ Acceptance Criteria

### Функциональные критерии:
- [ ] Инвентарь отображает сетку 4x4 слота
- [ ] Предметы можно перетаскивать между слотами
- [ ] Стакаемые предметы объединяются (до 99)
- [ ] При полном инвентаре новые предметы не добавляются
- [ ] Клик на предмет открывает модальное окно с деталями
- [ ] Кнопка "Использовать" работает для consumables
- [ ] Drag & Drop работает на desktop (мышь)
- [ ] Long-press + drag работает на mobile (тач)
- [ ] Валидные цели для использования подсвечиваются при перетаскивании
- [ ] Невалидные цели не принимают предмет (возврат в слот)

### Технические критерии:
- [ ] Используется `@dnd-kit/core` для drag-and-drop
- [ ] Состояние хранится в Zustand store
- [ ] Анимации через Framer Motion (60 FPS)
- [ ] Типизация TypeScript для всех компонентов
- [ ] Оптимизировано для мобильных устройств

### Визуальные критерии:
- [ ] Фон инвентаря — текстура старой кожи/ткани
- [ ] Иконки предметов четкие и читаемые
- [ ] Цветовая кодировка типов предметов (рамки)
- [ ] Анимация перетаскивания плавная
- [ ] Модальное окно стилизовано под старый пергамент

---

## 🧪 Тестовые сценарии

### Сценарий 1: Добавление предмета
```typescript
// Добавить расходуемый предмет
inventoryStore.addItem({
  id: 'potion_health_001',
  name: 'Зелье Здоровья',
  type: 'consumable',
  stackable: true,
  value: 25,
  icon: '/assets/items/potion.png',
  consumable: { effect: 'heal', value: 50 }
}, 1);

// Ожидаемый результат: предмет появляется в первом пустом слоте
```

### Сценарий 2: Стакинг
```typescript
// Добавить еще одно такое же зелье
inventoryStore.addItem(potion, 1);

// Ожидаемый результат: количество в слоте увеличивается до 2
```

### Сценарий 3: Переполнение стака
```typescript
// Добавить 98 таких же зелий
inventoryStore.addItem(potion, 98);

// Ожидаемый результат: первый слот заполнен до 99, второй содержит 1
```

### Сценарий 4: Использование предмета
```typescript
// Использовать зелье
const success = inventoryStore.useItem(0, null);

// Ожидаемый результат: количество уменьшено на 1, применен эффект лечения
```

### Сценарий 5: Drag & Drop
```typescript
// Перетащить предмет из слота 0 в слот 5
inventoryStore.moveItem(0, 5);

// Ожидаемый результат: предмет перемещен, слот 0 пуст
```

---

## 🔗 Зависимости

### npm пакеты:
```json
{
  "@dnd-kit/core": "^6.1.0",
  "@dnd-kit/sortable": "^7.0.2",
  "@dnd-kit/utilities": "^3.2.2",
  "framer-motion": "^10.16.0",
  "zustand": "^4.4.0"
}
```

### Ассеты:
- `/assets/ui/backpack_leather.png` — текстура рюкзака
- `/assets/ui/parchment.png` — текстура пергамента
- `/assets/items/*.png` — иконки предметов

---

## 📝 Чеклист разработчика

- [ ] Создать типы данных в `shared/src/types/inventory.ts`
- [ ] Реализовать Zustand store в `client/src/store/inventoryStore.ts`
- [ ] Создать компонент `BackpackUI.tsx`
- [ ] Создать компонент `InventorySlot.tsx` с drag-and-drop
- [ ] Создать компонент `ItemDetailModal.tsx`
- [ ] Реализовать хук `useInventoryInteraction.ts`
- [ ] Создать компонент `Hotspot.tsx` для интерактивных точек
- [ ] Добавить мобильную адаптацию (long-press)
- [ ] Протестировать все сценарии использования
- [ ] Оптимизировать производительность (memo, useCallback)
- [ ] Добавить обработку ошибок (полный инвентарь, неверный тип)

---

## 🎯 Пример использования в игре

```tsx
// client/src/scenes/bedroom/BedroomScene.tsx

import React, { useState } from 'react';
import BackpackUI from '../../components/ui/inventory/BackpackUI';
import Hotspot from '../../components/world/Hotspot';
import { useInventoryStore } from '../../store/inventoryStore';

const BedroomScene: React.FC = () => {
  const [showInventory, setShowInventory] = useState(false);
  const { hasItem } = useInventoryStore();
  
  const handleDoorUnlock = (item: Item) => {
    console.log('Дверь открыта ключом!');
    // Переход к следующей сцене
  };
  
  return (
    <div className="scene-bedroom">
      {/* Сцена спальни */}
      
      {/* Интерактивная дверь */}
      <Hotspot
        id="door_lock"
        acceptedItemTypes={['tool', 'quest']}
        acceptedItemIds={['key_bedroom_001']}
        onUse={handleDoorUnlock}
      >
        <img src="/assets/locations/bedroom/door.png" alt="Door" />
      </Hotspot>
      
      {/* Кнопка открытия инвентаря */}
      <button
        onClick={() => setShowInventory(true)}
        className="fixed bottom-4 right-4 p-3 bg-amber-800 rounded-full"
      >
        🎒
      </button>
      
      {/* Инвентарь */}
      {showInventory && (
        <BackpackUI onClose={() => setShowInventory(false)} />
      )}
    </div>
  );
};
```

---

**Статус:** Готово к реализации  
**Сложность:** Средняя  
**Время на реализацию:** 6-7 часов
