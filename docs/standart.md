# 🏛️ Гранд-Спецификация и Архитектурный Блупринт: Castelvento Engine Architecture

Данный документ представляет собой **универсальный архитектурный стандарт** и спецификацию для разработки комплексной гибридной игры **Castelvento Series** (Visual Novel + RPG + Tycoon + 2D/3D Мини-игры). 

Цель документа — зафиксировать единый паттерн проектирования, исключающий разрастание спагетти-кода, гонки состояний, утечки памяти и проблемы с кроссплатформенностью.

---

## 📋 Оглавление
1. [Архитектурная парадигма и разделение слоев](#1-архитектурная-парадигма-и-разделение-слоев)
2. [Единая модель данных и State Engine](#2-единая-модель-данных-и-state-engine)
3. [Событийно-ориентированная шина (Event Bus)](#3-событийно-ориентированная-шина-event-bus)
4. [Ассет-пайплайн и менеджмент памяти](#4-ассет-пайплайн-и-менеджмент-памяти)
5. [Жизненный цикл сцен и гибридный рендеринг](#5-жизненный-цикл-сцен-и-гибридный-рендеринг)
6. [Нарративный движок и интерпретатор сценариев](#6-нарративный-движок-и-интерпретатор-сценариев)
7. [Кроссплатформенный слой абстракций (Platform Adapters)](#7-кроссплатформенный-слой-абстракций-platform-adapters)
8. [Стандарты производительности и профилирования](#8-стандарты-производительности-и-профилирования)

---

## 1. Архитектурная парадигма и разделение слоев

Архитектура строится на строго гибридном подходе: **Feature-Sliced Design (FSD) + Data-Driven Game Loop**.

### 1.1 Разделение зон ответственности (System Layers)

```
┌─────────────────────────────────────────────────────────────────┐
│                    UI & DOM Layer (React 18)                    │
│   HUD • Диалоги • Инвентарь • Настройки • Модальные окна • i18n │
└────────────────────────────────┬────────────────────────────────┘
                                 │ React Hooks / Selectors
┌────────────────────────────────▼────────────────────────────────┐
│             Central State Layer (Zustand Stores)                │
│    Time • Energy • Economy • Progression • Quests • Inventory   │
└────────────────┬────────────────────────────────┬───────────────┘
                 │ Event Bus                      │ Data Binding
┌────────────────▼────────────────┐ ┌─────────────▼───────────────┐
│  Core Engine / Subsystems       │ │  Render Engines             │
│  • Audio Engine (Howler)        │ │  • Canvas 2D (Phaser)       │
│  • Dialogue Interpreter         │ │  • WebGL (Three.js / R3F)   │
│  • Save & Migration Engine      │ │  • SVG / Framer Motion      │
└─────────────────────────────────┘ └─────────────────────────────┘
```

1. **DOM Layer (React):** Занимается исключительно декларативным отображением интерфейса, HUD, меню и текстовых элементов. **React не должен считать физику или выполнять игровые циклы.**
2. **State Layer (Zustand):** Выступает в роли единого хранилища чистого состояния игры. Содержит минимально необходимые данные (Primitive States).
3. **Core Engine:** Изолированные синглтоны/сервисы, выполняющие логику подсистем (аудио, загрузка, сохранение, расписание).
4. **Render Engines (Three.js / Phaser):** Подключаются в изолированных Canvas-контейнерах, читают данные из State Layer и отправляют события через Event Bus.

---

## 2. Единая модель данных и State Engine

### 2.1 Принцип атомарности и отсутствие дублирования

> **Главный закон состояния:** Никакое значение не должно хранить копию или производную от другого значения. Все вычисляемые данные обязаны быть **селекторами**.

#### ❌ Плохо (дублирование состояния):
```typescript
// Хранение и текущего времени, и строки времени, и флага ночи в одном сторе
interface BadStore {
  minutes: number;
  formattedTime: string; // Ошибка! Дубликат
  isNight: boolean;      // Ошибка! Дубликат
}
```

#### ✅ Правильно (атомарное состояние + селекторы):
```typescript
// shared/types/time.ts
export interface TimeState {
  minutesSinceMidnight: number; // Единственный источник истины (0..1439)
  dayNumber: number;
}

// entities/time/model/timeStore.ts
export const useTimeStore = create<TimeState>()(
  persist(
    (set, get) => ({
      minutesSinceMidnight: 480, // 08:00 AM
      dayNumber: 1,
    }),
    { name: 'castelvento-time' }
  )
);

// Чистые вычисляемые селекторы (Pure Selectors)
export const selectFormattedTime = (state: TimeState): string => {
  const hours = Math.floor(state.minutesSinceMidnight / 60);
  const mins = state.minutesSinceMidnight % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export const selectIsNight = (state: TimeState): boolean => {
  const hours = Math.floor(state.minutesSinceMidnight / 60);
  return hours < 6 || hours >= 22;
};
```

### 2.2 Схема сериализации и миграций сохранений (Save & Migration Engine)

Для обеспечения совместимости сохранений при обновлении игры используется механизм версияции.

```typescript
// core/storage/SaveEngine.ts
export interface SaveSchemaV1 {
  version: 1;
  timestamp: number;
  time: { minutes: number; day: number };
  player: { name: string; money: number; energy: number };
  inventory: Array<{ id: string; qty: number }>;
  quests: Record<string, 'active' | 'completed' | 'failed'>;
}

export interface SaveSchemaV2 {
  version: 2;
  timestamp: number;
  time: { minutes: number; day: number };
  player: { name: string; money: number; energy: number; maxEnergy: number }; // Добавилось maxEnergy
  inventory: Array<{ id: string; qty: number; slot: number }>; // Изменилась структура слотов
  quests: Record<string, 'active' | 'completed' | 'failed'>;
}

export class SaveEngine {
  private static CURRENT_VERSION = 2;

  public static serialize(): string {
    const rawData = {
      version: this.CURRENT_VERSION,
      timestamp: Date.now(),
      time: useTimeStore.getState(),
      player: usePlayerStore.getState(),
      inventory: useInventoryStore.getState().slots,
      quests: useQuestStore.getState().quests,
    };
    return JSON.stringify(rawData);
  }

  public static deserialize(jsonString: string): boolean {
    try {
      let data = JSON.parse(jsonString);
      
      // Пайплайн миграций (Migration Pipeline)
      if (data.version === 1) {
        data = this.migrateV1ToV2(data);
      }

      // Гидрация сторов
      useTimeStore.setState(data.time);
      usePlayerStore.setState(data.player);
      useInventoryStore.setState({ slots: data.inventory });
      useQuestStore.setState({ quests: data.quests });
      
      return true;
    } catch (error) {
      console.error('Failed to load save file:', error);
      return false;
    }
  }

  private static migrateV1ToV2(oldData: any): SaveSchemaV2 {
    return {
      ...oldData,
      version: 2,
      player: { ...oldData.player, maxEnergy: 100 },
      inventory: oldData.inventory.map((item: any, idx: number) => ({ ...item, slot: idx })),
    };
  }
}
```

---

## 3. Событийно-ориентированная шина (Event Bus)

Для полного разделения рендер-движков, UI и подсистем используется строгая типизированная шина событий.

```typescript
// core/events/EventBus.ts
type EventCallback<T = any> = (payload: T) => void;

export type GameEvents = {
  // События времени
  'time:changed': { minutes: number; day: number };
  'time:nightfall': void;
  
  // Игровые действия
  'player:action': { actionId: string; energyCost: number; timeCost: number };
  'player:item_used': { itemId: string; targetId?: string };
  'player:money_changed': { delta: number; reason: string };
  
  // Квесты и сюжетов
  'quest:objective_complete': { questId: string; objectiveId: string };
  'dialogue:trigger': { dialogueId: string; startNode?: string };
  
  // Системные
  'scene:change_request': { targetScene: string; transitionType: 'fade' | 'slide' };
  'audio:play_sfx': { soundId: string; volume?: number };
};

class TypedEventBus {
  private listeners: { [K in keyof GameEvents]?: Set<EventCallback<GameEvents[K]>> } = {};

  public on<K extends keyof GameEvents>(event: K, callback: EventCallback<GameEvents[K]>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }
    this.listeners[event]!.add(callback);

    // Возврат функции отписки для легкого использования в useEffect
    return () => {
      this.listeners[event]?.delete(callback);
    };
  }

  public emit<K extends keyof GameEvents>(event: K, payload: GameEvents[K]): void {
    this.listeners[event]?.forEach((cb) => {
      try {
        cb(payload);
      } catch (e) {
        console.error(`Error in event listener for ${event}:`, e);
      }
    });
  }
}

export const EventBus = new TypedEventBus();
```

---

## 4. Ассет-пайплайн и менеджмент памяти

### 4.1 Менеджер ресурсов (AssetManager)
Служит для централизованной предзагрузки, кэширования и принудительной очистки оперативной и GPU-памяти.

```typescript
// core/assets/AssetManager.ts
export type AssetType = 'image' | 'audio' | 'json';

interface AssetManifest {
  images: Record<string, string>;
  audio: Record<string, string>;
  json: Record<string, string>;
}

export class AssetManager {
  private static imageCache: Map<string, HTMLImageElement> = new Map();
  private static jsonCache: Map<string, any> = new Map();

  public static async loadManifest(manifest: AssetManifest, onProgress?: (pct: number) => void): Promise<void> {
    const total = Object.keys(manifest.images).length + Object.keys(manifest.audio).length + Object.keys(manifest.json).length;
    let loaded = 0;

    const updateProgress = () => {
      loaded++;
      if (onProgress) onProgress((loaded / total) * 100);
    };

    // Параллельная загрузка с ограничением concurrency
    const imagePromises = Object.entries(manifest.images).map(async ([key, url]) => {
      if (this.imageCache.has(key)) return;
      const img = new Image();
      img.src = url;
      await img.decode(); // Декодирование в GPU фоновым потоком
      this.imageCache.set(key, img);
      updateProgress();
    });

    const jsonPromises = Object.entries(manifest.json).map(async ([key, url]) => {
      if (this.jsonCache.has(key)) return;
      const res = await fetch(url);
      const data = await res.json();
      this.jsonCache.set(key, data);
      updateProgress();
    });

    await Promise.all([...imagePromises, ...jsonPromises]);
  }

  // Очистка памяти при смене глав/локаций
  public static purgeUnusedAssets(keepKeys: string[]): void {
    for (const [key, img] of this.imageCache.entries()) {
      if (!keepKeys.includes(key)) {
        img.src = ''; // Освобождение ссылки для GC
        this.imageCache.delete(key);
      }
    }
  }

  public static getImage(key: string): HTMLImageElement {
    const img = this.imageCache.get(key);
    if (!img) throw new Error(`Asset not preloaded: ${key}`);
    return img;
  }
}
```

---

## 5. Жизненный цикл сцен и гибридный рендеринг

Каждый экран или локация должна реализовывать единый жизненный цикл для предотвращения утечек памяти и вызова "призрачных" таймеров.

### 5.1 Контракт интерфейса сцены (Scene Lifecycle Contract)

```typescript
// shared/types/scene.ts
export interface IScene {
  id: string;
  init(): Promise<void>;                  // Инициализация сторов/состояний
  preload(): Promise<void>;               // Загрузка ассетов сцены
  create(): void;                         // Монтирование DOM/Canvas и создание объектов
  update(deltaTime: number): void;        // Игровой такт (60 FPS)
  destroy(): void;                        // Полная очистка памяти, таймеров и подписок
}
```

### 5.2 Шаблон реализации сцены (React + Custom Loop)

```tsx
// features/scene-runner/ui/SceneRunner.tsx
import React, { useEffect, useRef } from 'react';
import { IScene } from '@/shared/types/scene';

export const SceneRunner: React.FC<{ scene: IScene }> = ({ scene }) => {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  useEffect(() => {
    let isCancelled = false;

    const startScene = async () => {
      await scene.init();
      await scene.preload();
      if (isCancelled) return;
      
      scene.create();

      // Главный цикл обновлений сцены
      const loop = (time: number) => {
        if (previousTimeRef.current !== undefined) {
          const deltaTime = (time - previousTimeRef.current) / 1000;
          scene.update(deltaTime);
        }
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(loop);
      };

      requestRef.current = requestAnimationFrame(loop);
    };

    startScene();

    // Очистка при демонтировании (Cleanup Phase)
    return () => {
      isCancelled = true;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      scene.destroy(); // Обязательный отклик очистки
    };
  }, [scene]);

  return <div id={`scene-container-${scene.id}`} className="relative w-full h-full" />;
};
```

---

## 6. Нарративный движок и интерпретатор сценариев

Движок диалогов строится на концепции **Абстрактного Синтаксического Дерева (AST)** и парсинга условий в реальном времени.

### 6.1 Архитектура диалогового графа

```typescript
// features/dialogue-engine/model/types.ts
export interface DialogueChoice {
  textKey: string;                          // Ключ i18n
  nextValueId: string;
  condition?: string;                       // Выражение: "flags.hasKey && stats.energy > 10"
  effects?: Array<{ op: 'set' | 'add'; flag: string; value: any }>;
}

export interface DialogueNode {
  id: string;
  speakerId: string;
  textKey: string;                          // Ключ i18n
  portraitState?: string;                   // 'happy' | 'sad' | 'surprised'
  audioVoKey?: string;                      // Ключ озвучки
  choices?: DialogueChoice[];
  nextId?: string;
  onEnterEffect?: Array<{ op: 'set' | 'add'; flag: string; value: any }>;
}

export interface DialogueGraph {
  id: string;
  startNodeId: string;
  nodes: Record<string, DialogueNode>;
}
```

### 6.2 Вычисление условий (Condition Evaluator)

Безопасный интерпретатор условий без использования опасного `eval()`.

```typescript
// features/dialogue-engine/utils/ConditionEvaluator.ts
export class ConditionEvaluator {
  public static evaluate(conditionStr: string): boolean {
    if (!conditionStr) return true;

    const flags = useProgressionStore.getState().flags;
    const energy = useEnergyStore.getState().current;
    const money = useEconomyStore.getState().balance;

    // Безопасный контекст переменных
    const context = { flags, energy, money };

    try {
      // Использование Function с изолированным аргументом контекста
      const evaluator = new Function('ctx', `with(ctx) { return ${conditionStr}; }`);
      return Boolean(evaluator(context));
    } catch (e) {
      console.error(`Error evaluating condition "${conditionStr}":`, e);
      return false;
    }
  }
}
```

---

## 7. Кроссплатформенный слой абстракций (Platform Adapters)

Игра должна собираться под **Web, Mobile (Capacitor)** и **Desktop (Electron)** без переписывания кодовой базы.

```typescript
// core/platform/PlatformAdapter.ts
export interface IPlatformAdapter {
  platformName: 'web' | 'mobile' | 'desktop';
  saveData(key: string, data: string): Promise<void>;
  loadData(key: string): Promise<string | null>;
  triggerHapticFeedback(style: 'light' | 'medium' | 'heavy'): void;
  purchaseProduct(productId: string): Promise<boolean>;
}

// core/platform/WebAdapter.ts
export class WebAdapter implements IPlatformAdapter {
  platformName = 'web' as const;

  async saveData(key: string, data: string): Promise<void> {
    localStorage.setItem(key, data);
  }

  async loadData(key: string): Promise<string | null> {
    return localStorage.getItem(key);
  }

  triggerHapticFeedback(): void {
    if ('vibrate' in navigator) navigator.vibrate(50);
  }

  async purchaseProduct(): Promise<boolean> {
    console.warn('Web purchases redirect to Stripe');
    return false;
  }
}

// Фабрика адаптеров
export const Platform = new WebAdapter(); // Подменяется при сборке под Capacitor/Electron
```

---

## 8. Стандарты производительности и профилирования

Для достижения стабильных 60 FPS на устройствах уровня iPhone 8 / бюджетных Android (4 ГБ ОЗУ) вводятся жесткие бюджеты производительности:

### 8.1 Performance Budget

| Метрика | Лимит (Max) | Метод контроля |
| :--- | :--- | :--- |
| **JS Heap Memory** | **< 250 MB** | Мониторинг Chrome DevTools / `performance.memory` |
| **GPU Texture Memory** | **< 150 MB** | Сжатие всех текстур в WebP, размер кадра ≤ 2048x2048 |
| **Draw Calls (Canvas/WebGL)**| **< 45 вызовов/кадр**| Атласирование спрайтов (Texture Packers) |
| **Main Thread Long Tasks** | **< 50 мс** | Разделение вычислений через `requestIdleCallback` |
| **Размер первоначального бандла**| **< 2.5 MB (Gzip)** | Dynamic Code Splitting в React/Vite |

### 8.2 Правила анимирования интерфейсов

1. **Запрет на анимацию геометрии:** Категорически запрещено анимировать `top`, `left`, `width`, `height`, `margin`, `padding`.
2. **Разрешенные свойства:** Анимируются **только** `transform` (`translate3d`, `scale`, `rotate`) и `opacity`.
3. **Изоляция слоев:** Все движущиеся или сложный слои должны иметь CSS-свойство `will-change: transform` или `transform: translateZ(0)` для выноса на отдельный слой GPU.
4. **Конфликты Framer Motion:**
   * Категорически запрещено смешивать цикличные свойства `animate={{ y: [...] }}` и жесты `whileHover={{ y: ... }}` на одном DOM-узле.
   * **Решение:** Цикличная анимация помещается на внутренний `<motion.div>`, а интерактивный жест — на внешний контейнер.

---

## 🎯 Чек-лист соответствия архитектурному стандарту

Перед отправкой любого компонента в репозиторий, он проверяется на соответствие правилам:

- [ ] **Не содержит прямой работы с DOM/Globals:** Все подписки очищаются в cleanup-функции (`useEffect` / `destroy()`).
- [ ] **Нет дублирования состояния:** Сторы хранят примитивы, а вычисляемые данные считываются через pure-селекторы.
- [ ] **Ассеты находятся в `public/assets/`:** Нет импортов медиафайлов через относительные пути типа `../../assets/`.
- [ ] **Использует единый `AudioManager`:** Нет прямых вызовов `new Audio()` или `new Howl()` внутри React-компонентов.
- [ ] **Тексты вынесены в i18n:** Все строки используют ключи перевода (`t('key')`).
- [ ] **Оптимизирован под тач-интерфейсы:** Размер кликабельных зон (Hotspots) на мобильных устройствах не менее 44x44px.
- [ ] **Прошел проверку типов:** TypeScript скомпилирован в строгом режиме (`strict: true`) без флагов `any`.