# Task 5.5: Quest & Reputation System — Детальная спецификация реализации

## 📋 Обзор задачи

**Приоритет:** P1 (High)  
**Контекст:** Система квестов и репутации для отслеживания прогресса игрока, отношений с фракциями и NPC, с интеграцией в диалоговую систему и экономику.

---

## 🎯 Функциональные требования

### 1. Структура данных квеста

```typescript
// shared/src/types/quest.ts

export type QuestStatus = 
  | 'available'   // Доступен для взятия
  | 'active'      // В процессе выполнения
  | 'completed'   // Завершен успешно
  | 'failed'      // Провален
  | 'expired';    // Истекло время

export type ObjectiveType = 
  | 'talk_to'     // Поговорить с NPC
  | 'collect'     // Собрать предметы
  | 'deliver'     // Доставить предмет
  | 'kill'        // Победить врага (если будет боевка)
  | 'explore'     // Посетить локацию
  | 'choice'      // Сделать выбор в диалоге
  | 'time_limit'  // Выполнить за время
  | 'reputation'  // Достичь уровня репутации
  | 'minigame';   // Выиграть мини-игру

export interface Objective {
  id: string;
  type: ObjectiveType;
  title: string;
  description: string;
  completed: boolean;
  
  // Данные в зависимости от типа
  targetId?: string;        // NPC ID, location ID, item ID
  targetType?: string;      // Тип цели для динамической проверки
  requiredCount?: number;   // Количество предметов/действий
  currentCount?: number;    // Текущий прогресс
  timeLimit?: number;       // Время в минутах (для time_limit)
  minigameId?: string;      // ID мини-игры
  
  // Условия завершения
  checkCondition: () => boolean; // Функция проверки (сериализуется как строка)
}

export interface QuestReward {
  money?: number;                    // Лир
  reputation?: Record<string, number>; // Репутация по фракциям
  items?: Array<{ itemId: string; quantity: number }>;
  experience?: number;               // Опыт (если будет RPG система)
  unlockDialogues?: string[];        // Разблокировать диалоги
  unlockLocations?: string[];        // Открыть локации
  storyProgress?: string;            // Прогресс сюжета
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  giver: string;           // NPC name или 'system'
  status: QuestStatus;
  
  objectives: Objective[];
  reward: QuestReward;
  
  // Метаданные
  chapter: string;         // Глава (например, 'chapter_1')
  prerequisiteQuests?: string[]; // Требует завершения других квестов
  minReputation?: Record<string, number>; // Минимальная репутация
  timeLimit?: number;      // Общее время на квест (в минутах)
  isMainStory: boolean;    // Сюжетный или побочный
  repeatable: boolean;     // Можно ли пройти повторно
  
  // Отслеживание
  startedAt?: number;      // Timestamp начала
  completedAt?: number;    // Timestamp завершения
  failedReason?: string;   // Причина провала
}
```

### 2. Система репутации

```typescript
// shared/src/types/reputation.ts

export type FactionId = 
  | 'families'      // Семьи Castelvento
  | 'shops'         // Торговцы
  | 'church'        // Церковь
  | 'fishermen'     // Рыбаки
  | 'farmers'       // Фермеры
  | 'artists'       // Художники, писатели
  | 'youth'         // Молодежь
  | 'elders';       // Старики

export interface Faction {
  id: FactionId;
  name: string;
  nameIT: string;      // Итальянское название
  description: string;
  icon: string;
  
  // Пороги репутации
  thresholds: {
    hated: -100;
    disliked: -50;
    neutral: 0;
    liked: 50;
    beloved: 100;
  };
  
  // Бонусы на разных уровнях
  bonuses: {
    hated: string[];     // Например: блокировка доступа
    disliked: string[];
    neutral: [];
    liked: string[];     // Например: скидки 10%
    beloved: string[];   // Например: уникальные квесты
  };
}

export interface ReputationState {
  factionId: FactionId;
  score: number;  // -100 до +100
  history: Array<{
    timestamp: number;
    delta: number;
    reason: string;
    questId?: string;
  }>;
}
```

### 3. Zustand Store для квестов и репутации

```typescript
// client/src/store/questStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Quest, Objective, QuestStatus, QuestReward } from '@castelvento/shared';
import { ReputationState, FactionId } from '@castelvento/shared';

interface QuestState {
  quests: Record<string, Quest>;  // Map questId -> Quest
  activeQuestId?: string;         // Текущий выбранный квест
  
  // Репутация
  reputation: Record<FactionId, ReputationState>;
  
  // Actions - Квесты
  addQuest: (quest: Quest) => void;
  removeQuest: (questId: string) => void;
  startQuest: (questId: string) => void;
  completeObjective: (questId: string, objectiveId: string) => void;
  failQuest: (questId: string, reason: string) => void;
  completeQuest: (questId: string) => void;
  setActiveQuest: (questId?: string) => void;
  getQuest: (questId: string) => Quest | undefined;
  getActiveQuests: () => Quest[];
  getAvailableQuests: () => Quest[];
  getCompletedQuests: () => Quest[];
  checkQuestCompletion: (questId: string) => boolean;
  
  // Actions - Репутация
  updateReputation: (factionId: FactionId, delta: number, reason: string, questId?: string) => void;
  getReputation: (factionId: FactionId) => number;
  getReputationLevel: (factionId: FactionId) => 'hated' | 'disliked' | 'neutral' | 'liked' | 'beloved';
  canAccessContent: (factionId: FactionId, requiredLevel: string) => boolean;
  
  // Утилиты
  checkPrerequisites: (quest: Quest) => boolean;
}

export const useQuestStore = create<QuestState>()(
  persist(
    (set, get) => ({
      quests: {},
      reputation: {
        'families': { factionId: 'families', score: 0, history: [] },
        'shops': { factionId: 'shops', score: 0, history: [] },
        'church': { factionId: 'church', score: 0, history: [] },
        'fishermen': { factionId: 'fishermen', score: 0, history: [] },
        'farmers': { factionId: 'farmers', score: 0, history: [] },
        'artists': { factionId: 'artists', score: 0, history: [] },
        'youth': { factionId: 'youth', score: 0, history: [] },
        'elders': { factionId: 'elders', score: 0, history: [] },
      },
      
      // === QUEST ACTIONS ===
      
      addQuest: (quest) => {
        set((state) => ({
          quests: { ...state.quests, [quest.id]: quest }
        }));
      },
      
      removeQuest: (questId) => {
        set((state) => {
          const newQuests = { ...state.quests };
          delete newQuests[questId];
          return { quests: newQuests };
        });
      },
      
      startQuest: (questId) => {
        set((state) => ({
          quests: {
            ...state.quests,
            [questId]: {
              ...state.quests[questId],
              status: 'active',
              startedAt: Date.now()
            }
          },
          activeQuestId: questId
        }));
      },
      
      completeObjective: (questId, objectiveId) => {
        set((state) => {
          const quest = state.quests[questId];
          if (!quest) return state;
          
          const updatedObjectives = quest.objectives.map(obj =>
            obj.id === objectiveId
              ? { ...obj, completed: true }
              : obj
          );
          
          const updatedQuest = { ...quest, objectives: updatedObjectives };
          
          // Проверить завершение квеста
          const allCompleted = updatedObjectives.every(obj => obj.completed);
          if (allCompleted) {
            updatedQuest.status = 'completed';
            updatedQuest.completedAt = Date.now();
            
            // Выдать награду
            get().distributeReward(quest.reward);
          }
          
          return {
            quests: { ...state.quests, [questId]: updatedQuest }
          };
        });
      },
      
      failQuest: (questId, reason) => {
        set((state) => ({
          quests: {
            ...state.quests,
            [questId]: {
              ...state.quests[questId],
              status: 'failed',
              failedReason: reason
            }
          }
        }));
        
        // Если это был активный квест, сбросить
        if (get().activeQuestId === questId) {
          set({ activeQuestId: undefined });
        }
      },
      
      completeQuest: (questId) => {
        const quest = get().quests[questId];
        if (!quest) return;
        
        set((state) => ({
          quests: {
            ...state.quests,
            [questId]: {
              ...quest,
              status: 'completed',
              completedAt: Date.now()
            }
          }
        }));
        
        // Выдать награду
        get().distributeReward(quest.reward);
        
        // Сбросить активный если это он
        if (get().activeQuestId === questId) {
          set({ activeQuestId: undefined });
        }
      },
      
      distributeReward: (reward: QuestReward) => {
        // Здесь должна быть интеграция с другими store
        // Для примера - заглушки
        
        if (reward.money) {
          console.log(`Получено ${reward.money} лир`);
          // usePlayerStore.getState().addMoney(reward.money);
        }
        
        if (reward.reputation) {
          Object.entries(reward.reputation).forEach(([faction, delta]) => {
            get().updateReputation(faction as FactionId, delta, 'Награда за квест');
          });
        }
        
        if (reward.items) {
          reward.items.forEach(({ itemId, quantity }) => {
            // useInventoryStore.getState().addItem(itemId, quantity);
          });
        }
      },
      
      setActiveQuest: (questId) => {
        set({ activeQuestId: questId });
      },
      
      getQuest: (questId) => {
        return get().quests[questId];
      },
      
      getActiveQuests: () => {
        return Object.values(get().quests).filter(q => q.status === 'active');
      },
      
      getAvailableQuests: () => {
        return Object.values(get().quests).filter(q => {
          const state = get();
          return q.status === 'available' && state.checkPrerequisites(q);
        });
      },
      
      getCompletedQuests: () => {
        return Object.values(get().quests).filter(q => q.status === 'completed');
      },
      
      checkQuestCompletion: (questId) => {
        const quest = get().quests[questId];
        if (!quest) return false;
        
        return quest.objectives.every(obj => obj.completed);
      },
      
      checkPrerequisites: (quest) => {
        const state = get();
        
        // Проверить завершенные квесты
        if (quest.prerequisiteQuests) {
          const completedIds = Object.values(state.quests)
            .filter(q => q.status === 'completed')
            .map(q => q.id);
          
          const hasAllPrereqs = quest.prerequisiteQuests.every(
            prereqId => completedIds.includes(prereqId)
          );
          
          if (!hasAllPrereqs) return false;
        }
        
        // Проверить репутацию
        if (quest.minReputation) {
          for (const [faction, minScore] of Object.entries(quest.minReputation)) {
            if (state.getReputation(faction as FactionId) < minScore) {
              return false;
            }
          }
        }
        
        return true;
      },
      
      // === REPUTATION ACTIONS ===
      
      updateReputation: (factionId, delta, reason, questId) => {
        set((state) => {
          const current = state.reputation[factionId];
          const newScore = Math.max(-100, Math.min(100, current.score + delta));
          
          return {
            reputation: {
              ...state.reputation,
              [factionId]: {
                ...current,
                score: newScore,
                history: [
                  ...current.history,
                  {
                    timestamp: Date.now(),
                    delta,
                    reason,
                    questId
                  }
                ]
              }
            }
          };
        });
      },
      
      getReputation: (factionId) => {
        return get().reputation[factionId]?.score || 0;
      },
      
      getReputationLevel: (factionId) => {
        const score = get().getReputation(factionId);
        
        if (score <= -50) return 'hated';
        if (score <= -1) return 'disliked';
        if (score <= 49) return 'neutral';
        if (score <= 89) return 'liked';
        return 'beloved';
      },
      
      canAccessContent: (factionId, requiredLevel) => {
        const levels = ['hated', 'disliked', 'neutral', 'liked', 'beloved'];
        const currentLevel = get().getReputationLevel(factionId);
        
        const currentIndex = levels.indexOf(currentLevel);
        const requiredIndex = levels.indexOf(requiredLevel);
        
        return currentIndex >= requiredIndex;
      },
    }),
    {
      name: 'castelvento-quest-storage',
      partialize: (state) => ({
        quests: state.quests,
        reputation: state.reputation,
      }),
    }
  )
);
```

---

## 🎨 UI Компоненты

### 1. Журнал квестов (QuestLog)

**Файл:** `client/src/components/ui/quests/QuestLog.tsx`

```tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuestStore } from '../../../store/questStore';
import QuestCard from './QuestCard';
import ReputationPanel from './ReputationPanel';

type Tab = 'active' | 'completed' | 'failed' | 'reputation';

const QuestLog: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('active');
  const { getActiveQuests, getCompletedQuests } = useQuestStore();
  
  const parchmentTexture = '/assets/ui/parchment_notebook.png';
  
  const activeQuests = getActiveQuests();
  const completedQuests = getCompletedQuests();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        className="relative w-[900px] h-[700px] max-w-[95vw] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Фон - старый блокнот */}
        <div
          className="absolute inset-0 rounded-lg shadow-2xl overflow-hidden"
          style={{
            backgroundImage: `url(${parchmentTexture})`,
            backgroundSize: 'cover',
          }}
        >
          {/* Заголовок */}
          <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-amber-900/80 to-transparent">
            <h2 className="text-3xl font-handwritten text-amber-100 text-center">
              Журнал Путешественника
            </h2>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-amber-200 hover:text-white transition-colors text-2xl"
            >
              ✕
            </button>
          </div>
          
          {/* Табы */}
          <div className="absolute top-20 left-0 right-0 flex justify-center gap-2 px-6">
            <TabButton
              label="Активные"
              isActive={activeTab === 'active'}
              onClick={() => setActiveTab('active')}
              count={activeQuests.length}
            />
            <TabButton
              label="Завершенные"
              isActive={activeTab === 'completed'}
              onClick={() => setActiveTab('completed')}
              count={completedQuests.length}
            />
            <TabButton
              label="Репутация"
              isActive={activeTab === 'reputation'}
              onClick={() => setActiveTab('reputation')}
            />
          </div>
          
          {/* Контент */}
          <div className="absolute top-32 left-4 right-4 bottom-4 overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'active' && (
                <motion.div
                  key="active"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  {activeQuests.length === 0 ? (
                    <EmptyState message="Нет активных квестов" />
                  ) : (
                    activeQuests.map(quest => (
                      <QuestCard key={quest.id} quest={quest} />
                    ))
                  )}
                </motion.div>
              )}
              
              {activeTab === 'completed' && (
                <motion.div
                  key="completed"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  {completedQuests.length === 0 ? (
                    <EmptyState message="Пока нет завершенных квестов" />
                  ) : (
                    completedQuests.map(quest => (
                      <QuestCard key={quest.id} quest={quest} completed />
                    ))
                  )}
                </motion.div>
              )}
              
              {activeTab === 'reputation' && (
                <motion.div
                  key="reputation"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <ReputationPanel />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Компонент кнопки таба
const TabButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  count?: number;
}> = ({ label, isActive, onClick, count }) => (
  <button
    onClick={onClick}
    className={`
      px-6 py-2 rounded-t-lg font-handwritten text-lg transition-all
      ${isActive 
        ? 'bg-amber-100 text-amber-900 shadow-lg' 
        : 'bg-amber-900/30 text-amber-200 hover:bg-amber-900/50'}
    `}
  >
    {label}
    {count !== undefined && count > 0 && (
      <span className="ml-2 px-2 py-0.5 bg-amber-700 text-white text-sm rounded-full">
        {count}
      </span>
    )}
  </button>
);

// Компонент пустого состояния
const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-48 text-amber-700">
    <span className="text-4xl mb-4">📜</span>
    <p className="text-xl font-handwritten">{message}</p>
  </div>
);

export default QuestLog;
```

### 2. Карточка квеста (QuestCard)

**Файл:** `client/src/components/ui/quests/QuestCard.tsx`

```tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Quest } from '@castelvento/shared';

interface Props {
  quest: Quest;
  completed?: boolean;
}

const QuestCard: React.FC<Props> = ({ quest, completed = false }) => {
  const [expanded, setExpanded] = useState(false);
  
  const totalObjectives = quest.objectives.length;
  const completedObjectives = quest.objectives.filter(o => o.completed).length;
  const progressPercent = (completedObjectives / totalObjectives) * 100;
  
  return (
    <motion.div
      layout
      className={`
        bg-amber-100/50 rounded-lg border-2 border-amber-800/30 
        ${completed ? 'opacity-75' : ''}
        overflow-hidden
      `}
    >
      {/* Заголовок квеста */}
      <div
        className="p-4 cursor-pointer hover:bg-amber-100/70 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-handwritten text-amber-900 mb-1">
              {quest.title}
            </h3>
            <p className="text-sm text-amber-700 italic">
              от {quest.giver}
            </p>
          </div>
          
          {/* Индикатор прогресса */}
          {!completed && (
            <div className="text-right">
              <span className="text-lg font-bold text-amber-800">
                {completedObjectives}/{totalObjectives}
              </span>
              <div className="w-24 h-2 bg-amber-300 rounded-full mt-1 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  className="h-full bg-green-600"
                />
              </div>
            </div>
          )}
          
          {completed && (
            <span className="text-2xl">✅</span>
          )}
        </div>
        
        {/* Краткое описание */}
        <p className="mt-2 text-amber-800 line-clamp-2">
          {quest.description}
        </p>
      </div>
      
      {/* Развернутая информация */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-4 pb-4 border-t border-amber-800/20"
        >
          {/* Полное описание */}
          <div className="mt-3">
            <h4 className="font-bold text-amber-900 mb-2">Описание:</h4>
            <p className="text-amber-800 leading-relaxed">
              {quest.description}
            </p>
          </div>
          
          {/* Цели */}
          <div className="mt-4">
            <h4 className="font-bold text-amber-900 mb-2">Цели:</h4>
            <ul className="space-y-2">
              {quest.objectives.map((objective, index) => (
                <li
                  key={objective.id}
                  className={`
                    flex items-start gap-2 text-sm
                    ${objective.completed ? 'text-green-700' : 'text-amber-800'}
                  `}
                >
                  <span className="mt-0.5">
                    {objective.completed ? '✓' : '○'}
                  </span>
                  <span>
                    <strong>{objective.title}:</strong> {objective.description}
                    {objective.requiredCount && (
                      <span className="ml-2 text-xs">
                        ({objective.currentCount || 0}/{objective.requiredCount})
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Награды */}
          <div className="mt-4 p-3 bg-amber-200/50 rounded">
            <h4 className="font-bold text-amber-900 mb-2">Награда:</h4>
            <div className="flex flex-wrap gap-3 text-sm">
              {quest.reward.money && (
                <span className="text-amber-800">💰 {quest.reward.money} ₤</span>
              )}
              {quest.reward.reputation && (
                <>
                  {Object.entries(quest.reward.reputation).map(([faction, delta]) => (
                    <span
                      key={faction}
                      className={delta > 0 ? 'text-green-700' : 'text-red-700'}
                    >
                      {delta > 0 ? '+' : ''}{delta} {faction}
                    </span>
                  ))}
                </>
              )}
              {quest.reward.items && (
                <span className="text-amber-800">
                  🎁 {quest.reward.items.length} предмет(ов)
                </span>
              )}
            </div>
          </div>
          
          {/* Таймер (если есть) */}
          {quest.timeLimit && quest.startedAt && (
            <div className="mt-3 text-sm text-red-600 font-bold">
              ⏱ Осталось времени: {calculateTimeLeft(quest.startedAt, quest.timeLimit)}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

// Утилита для расчета оставшегося времени
const calculateTimeLeft = (startedAt: number, timeLimitMinutes: number): string => {
  const elapsed = Date.now() - startedAt;
  const remaining = timeLimitMinutes * 60 * 1000 - elapsed;
  
  if (remaining <= 0) return 'ИСТЕКЛО';
  
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}ч ${minutes}мин`;
};

export default QuestCard;
```

### 3. Панель репутации (ReputationPanel)

**Файл:** `client/src/components/ui/quests/ReputationPanel.tsx`

```tsx
import React from 'react';
import { useQuestStore } from '../../../store/questStore';
import { FactionId } from '@castelvento/shared';

const factions: Array<{
  id: FactionId;
  name: string;
  icon: string;
  color: string;
}> = [
  { id: 'families', name: 'Семьи', icon: '🏛️', color: 'purple' },
  { id: 'shops', name: 'Торговцы', icon: '🏪', color: 'yellow' },
  { id: 'church', name: 'Церковь', icon: '⛪', color: 'blue' },
  { id: 'fishermen', name: 'Рыбаки', icon: '🎣', color: 'cyan' },
  { id: 'farmers', name: 'Фермеры', icon: '🌾', color: 'green' },
  { id: 'artists', name: 'Художники', icon: '🎨', color: 'pink' },
  { id: 'youth', name: 'Молодежь', icon: '🎸', color: 'orange' },
  { id: 'elders', name: 'Старики', icon: '📚', color: 'gray' },
];

const ReputationPanel: React.FC = () => {
  const { getReputation, getReputationLevel, reputation } = useQuestStore();
  
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'hated': return 'text-red-700 bg-red-100';
      case 'disliked': return 'text-orange-700 bg-orange-100';
      case 'neutral': return 'text-gray-700 bg-gray-100';
      case 'liked': return 'text-green-700 bg-green-100';
      case 'beloved': return 'text-purple-700 bg-purple-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };
  
  const getLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      hated: 'Ненавидим',
      disliked: 'Не любим',
      neutral: 'Нейтрально',
      liked: 'Любим',
      beloved: 'Обожаем',
    };
    return labels[level] || level;
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {factions.map((faction) => {
        const score = getReputation(faction.id);
        const level = getReputationLevel(faction.id);
        const percent = ((score + 100) / 200) * 100; // Преобразовать -100..100 в 0..100
        
        return (
          <div
            key={faction.id}
            className="bg-amber-100/50 rounded-lg p-4 border border-amber-800/20"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{faction.icon}</span>
              <div>
                <h4 className="font-bold text-amber-900">{faction.name}</h4>
                <span className={`text-xs px-2 py-0.5 rounded ${getLevelColor(level)}`}>
                  {getLevelLabel(level)}
                </span>
              </div>
            </div>
            
            {/* Шкала репутации */}
            <div className="relative h-4 bg-amber-300 rounded-full overflow-hidden">
              {/* Зоны */}
              <div className="absolute inset-0 flex">
                <div className="w-1/4 bg-red-400/50" title="Hated" />
                <div className="w-1/4 bg-orange-400/50" title="Disliked" />
                <div className="w-1/4 bg-gray-400/50" title="Neutral" />
                <div className="w-1/4 bg-green-400/50" title="Liked" />
              </div>
              
              {/* Маркер текущей позиции */}
              <div
                className="absolute top-0 w-1 h-full bg-amber-900 transition-all duration-500"
                style={{ left: `${percent}%` }}
              />
            </div>
            
            {/* Число */}
            <div className="flex justify-between mt-1 text-xs text-amber-700">
              <span>-100</span>
              <span className="font-bold">{score}</span>
              <span>+100</span>
            </div>
            
            {/* История изменений (последние 3) */}
            {reputation[faction.id]?.history.length > 0 && (
              <div className="mt-3 pt-3 border-t border-amber-800/20">
                <p className="text-xs text-amber-600 mb-1">Последние изменения:</p>
                <ul className="space-y-1">
                  {reputation[faction.id].history.slice(-3).reverse().map((entry, i) => (
                    <li key={i} className="text-xs text-amber-800">
                      {entry.delta > 0 ? '+' : ''}{entry.delta}: {entry.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ReputationPanel;
```

---

## 🔔 Уведомления о квестах

```tsx
// client/src/components/ui/quests/QuestNotification.tsx

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  type: 'received' | 'completed' | 'failed' | 'reputation';
  title: string;
  message?: string;
  delta?: number; // Для репутации
  onClose: () => void;
}

const QuestNotification: React.FC<Props> = ({
  type,
  title,
  message,
  delta,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);
  
  const getIcon = () => {
    switch (type) {
      case 'received': return '📜';
      case 'completed': return '✨';
      case 'failed': return '❌';
      case 'reputation': return delta! > 0 ? '💚' : '💔';
      default: return '📋';
    }
  };
  
  const getBorderColor = () => {
    switch (type) {
      case 'received': return 'border-blue-500';
      case 'completed': return 'border-green-500';
      case 'failed': return 'border-red-500';
      case 'reputation': return delta! > 0 ? 'border-green-500' : 'border-red-500';
      default: return 'border-gray-500';
    }
  };
  
  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className={`
        fixed top-20 right-4 z-[100]
        bg-[url('/assets/ui/parchment_small.png')] bg-cover
        rounded-lg p-4 shadow-2xl border-l-4 ${getBorderColor()}
        w-80 max-w-[90vw]
      `}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl">{getIcon()}</span>
        <div className="flex-1">
          <h4 className="font-bold text-amber-900">{title}</h4>
          {message && (
            <p className="text-sm text-amber-800 mt-1">{message}</p>
          )}
          {delta !== undefined && (
            <p className={`text-sm font-bold ${delta > 0 ? 'text-green-700' : 'text-red-700'}`}>
              {delta > 0 ? '+' : ''}{delta} репутации
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-amber-600 hover:text-amber-900"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
};

export default QuestNotification;
```

---

## ✅ Acceptance Criteria

### Функциональные критерии:
- [ ] Квесты отображаются в журнале с вкладками (Активные/Завершенные)
- [ ] Цели квеста отмечаются выполненными при выполнении условий
- [ ] Прогресс квеста визуально отображается (прогресс-бар)
- [ ] При завершении всех целей квест автоматически завершается
- [ ] Награда выдается автоматически при завершении
- [ ] Репутация обновляется при выполнении действий
- [ ] Панель репутации показывает все 8 фракций
- [ ] Уровни репутации (hated/disliked/neutral/liked/beloved) работают корректно
- [ ] Уведомления появляются при получении/завершении квеста
- [ ] Уведомления исчезают через 5 секунд
- [ ] История изменений репутации сохраняется и отображается

### Технические критерии:
- [ ] Данные квестов хранятся в JSON формате
- [ ] Состояние персистентно через localStorage (Zustand persist)
- [ ] TypeScript типизация для всех структур
- [ ] Анимации через Framer Motion (60 FPS)
- [ ] Интеграция с inventoryStore и playerStore

### Визуальные критерии:
- [ ] Журнал квестов стилизован под старый блокнот
- [ ] Карточки квестов имеют винтажный вид
- [ ] Шкалы репутации цветовые кодированы
- [ ] Иконки фракций отображаются корректно
- [ ] Уведомления появляются справа сверху

---

## 🧪 Примеры квестов (JSON)

```json
{
  "id": "quest_chapter1_001",
  "title": "Пробуждение в Castelvento",
  "description": "Вы проснулись в незнакомой комнате. Осмотритесь и узнайте, где вы находитесь.",
  "giver": "system",
  "chapter": "chapter_1",
  "isMainStory": true,
  "repeatable": false,
  "status": "available",
  "objectives": [
    {
      "id": "obj_001",
      "type": "explore",
      "title": "Осмотреть комнату",
      "description": "Кликните на интерактивные объекты в спальне",
      "completed": false,
      "targetId": "location_bedroom",
      "requiredCount": 3,
      "currentCount": 0
    },
    {
      "id": "obj_002",
      "type": "talk_to",
      "title": "Поговорить с бабушкой",
      "description": "Бабушка ждет вас на кухне",
      "completed": false,
      "targetId": "npc_grandma"
    },
    {
      "id": "obj_003",
      "type": "explore",
      "title": "Выйти на улицу",
      "description": "Исследуйте главную площадь Castelvento",
      "completed": false,
      "targetId": "location_town_square"
    }
  ],
  "reward": {
    "money": 50,
    "reputation": {
      "families": 10,
      "elders": 15
    },
    "unlockDialogues": ["dialogue_grandma_002"]
  }
}
```

---

## 🔗 Зависимости

### npm пакеты:
```json
{
  "zustand": "^4.4.0",
  "framer-motion": "^10.16.0"
}
```

### Ассеты:
- `/assets/ui/parchment_notebook.png` — фон журнала квестов
- `/assets/ui/parchment_small.png` — фон уведомлений
- `/assets/factions/*.png` — иконки фракций

---

## 📝 Чеклист разработчика

- [ ] Создать типы данных в `shared/src/types/quest.ts` и `reputation.ts`
- [ ] Реализовать Zustand store в `client/src/store/questStore.ts`
- [ ] Создать компонент `QuestLog.tsx` с табами
- [ ] Создать компонент `QuestCard.tsx` с раскрывающейся информацией
- [ ] Создать компонент `ReputationPanel.tsx` с 8 фракциями
- [ ] Создать компонент `QuestNotification.tsx` для всплывающих уведомлений
- [ ] Реализовать функцию `checkPrerequisites` для проверки доступности квестов
- [ ] Интегрировать с системой диалогов (триггеры квестов)
- [ ] Интегрировать с инвентарем (квестовые предметы)
- [ ] Добавить примеры квестов в JSON формате
- [ ] Протестировать все сценарии (получение, выполнение, завершение, провал)
- [ ] Оптимизировать производительность (memoization)

---

**Статус:** Готово к реализации  
**Сложность:** Средняя+  
**Время на реализацию:** 5-6 часов
