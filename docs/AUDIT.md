Проведен полный системный аудит архитектуры, бизнес-логики, стейт-менеджмента и компонентов из предоставленных спецификаций (**Tasks 1.1 — 8.1**). 

В текущем виде спецификации содержат **серьезные системные конфликты**, фатальные ошибки исполнения в React/Framer Motion, дублирование состояния в Zustand и фатальные расхождения в файловой структуре.

Ниже представлен **Гранд-план синхронизации и модернизации проекта**, преобразующий все задачи в единый, стабильный, масштабируемый механизм.

---

# 🛠️ Единый План Синхронизации и Модернизации Архитектуры

---

## 1. Главные архитектурные решения и стандарты

### 1.1 Единая файловая структура (Feature-Sliced Design)
Отменяются все противоречивые пути (`/src/screens/`, `/src/features/`, `/src/components/MainMenu/`). Проект приводится к строгому стандарту FSD:

```
client/src/
├── app/                        # Инициализация приложения, провайдеры, глобальные стили
│   ├── App.tsx
│   ├── main.tsx
│   └── routes.tsx
├── core/                       # Системные ядра (не зависят от игровой логики)
│   ├── audio/                  # Единый аудио-движок (Howler Manager)
│   ├── i18n/                   # Конфигурация react-i18next (RU, EN, IT)
│   └── storage/                # Обертка над localStorage / IndexedDB
├── shared/                     # Переиспользуемые утилиты, типы, UI-кит
│   ├── types/                  # Единые доменные типы (Item, Quest, NPC, Time)
│   ├── ui/                     # Базовые атомы UI (Modal, Button, Slider)
│   └── utils/                  # Математика, форматирование, векторный расчет
├── entities/                   # Игровые сущности (Model + UI)
│   ├── player/
│   ├── npc/
│   ├── item/
│   └── location/
├── features/                   # Бизнес-сценарии и взаимодействия
│   ├── main-menu/              # Фоновые слои, персонажи, объекты навигации
│   ├── dialogue-engine/        # Движок диалогов и выбора
│   ├── inventory-dnd/          # Drag-and-drop инвентарь
│   ├── quest-journal/          # Журнал квестов и репутация
│   ├── travel-map/             # Интерактивная карта и передвижение
│   └── mini-games/             # Велосипед, hidden objects
└── screens/                    # Экраны и кат-сцены (Страницы)
    ├── SplashScreen.tsx
    ├── LoadingScreen.tsx
    ├── MainMenuScreen.tsx
    ├── OpeningCinematicScreen.tsx
    └── GameplayScreen.tsx
```

### 1.2 Пути к ассетам (Static Asset Pipeline)
Все статические ассеты хранятся в `client/public/assets/`. Использование путей `/src/assets/` в коде **запрещено**, так как это ломает сборку Vite в production.
*   **Изображения:** `/assets/images/...` (PNG/WebP/SVG)
*   **Аудио:** `/assets/audio/...` (MP3/OGG)
*   **Конфиги/Локации:** `/assets/data/...` (JSON)

---

## 2. Единая топология State-Management (Zustand Stores)

Устраняется главное противоречие: **дублирование состояния и источника истины**.

```
                         ┌───────────────────┐
                         │   settingsStore   │ (Язык, Громкость, Яркость)
                         └─────────┬─────────┘
                                   │
┌──────────────────┐               │               ┌───────────────────┐
│   progression    │───────────────┼──────────────>│    audioCore      │ (Howler Singleton)
│     Store        │               │               └───────────────────┘
└────────┬─────────┘               │
         │                         ▼
         │               ┌───────────────────┐
         ├──────────────>│     appStore      │ (Boot State: Splash/Loading/Menu/Game)
         │               └───────────────────┘
         │                         │
         ▼                         ▼
┌──────────────────┐     ┌───────────────────┐
│  locationStore   │     │     timeStore     │ (Минуты от 00:00, День)
└──────────────────┘     └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │   energyStore     │ (0-100, Зависит от timeStore)
                         └───────────────────┘
```

### Сводная таблица распределения ответственности Stores:

| Имя Store | Единственные зоны ответственности | Убранные дубли |
| :--- | :--- | :--- |
| **`appStore`** | Фазы загрузки приложения (`bootState`), состояние текущих модалок (Credits, Support, SaveManager). | Флаги `isSettingsOpen` (ушли в `settingsStore`). |
| **`settingsStore`** | Язык (`en`/`ru`/`it`), громкость каналов (Master, Music, SFX, Ambience), яркость, открытость модалки настроек. | Дублирование языка в `menuStore`. |
| **`progressionStore`** | Флаги прохождения глав (`completedChapters: Set<number>`), открытые секреты, глобальные события. | Убрана жесткая цепочка `menuEvolutionStage: 0..3`. Теперь рассчитывается динамически. |
| **`timeStore`** | Единый источник времени: `minutesSinceMidnight` (0..1439), `dayNumber`. | Убран счетчик `gameHours`/`gameMinutes` из `hudStore`. |
| **`energyStore`** | Текущая и максимальная энергия (0..100), состояние истощения. | Убрана энергия из `hudStore`. |
| **`economyStore`** | Баланс лир, история транзакций. | Убрана валюта из `hudStore`. |
| **`hudStore`** | **Только UI-состояние HUD**: развернут ли Notch, видимость HUD при кат-сценах. | **Все поля `energy`, `money`, `time` удалены**. HUD читает их через селекторы из соответствующих сторов. |
| **`inventoryStore`**| 16 слотов инвентаря, логика DnD (`@dnd-kit`), сочетаемость предметов. | Объединен с типом `Item` из Task 5.4. |
| **`questStore`** | Активные/завершенные квесты, прогресс целей, репутация фракций. | — |
| **`affinityStore`** | Отношения с NPC (-100..+100), тиры отношений, влияние на цены/диалоги. | — |

---

## 3. Единый Аудио-Движок (`src/core/audio/AudioManager.ts`)

Вместо разрозненных вызовов `new Howl()` и `new Audio()` создается единый синглтон, управляемый `settingsStore`.

```typescript
// src/core/audio/AudioManager.ts
import { Howl, Howler } from 'howler';
import { useSettingsStore } from '@/features/settings/model/settingsStore';

class AudioManagerImpl {
  private bgm: Howl | null = null;
  private ambience: Howl | null = null;
  private sfxPool: Map<string, Howl> = new Map();
  private isUnlocked: boolean = false;

  constructor() {
    // Подписка на изменение настроек громкости
    useSettingsStore.subscribe((state) => {
      Howler.volume(state.volume.master);
      if (this.bgm) this.bgm.volume(state.volume.music);
      if (this.ambience) this.ambience.volume(state.volume.ambience);
    });
  }

  public unlock(): void {
    if (this.isUnlocked) return;
    Howler.unlock();
    this.isUnlocked = true;
  }

  public playBGM(src: string, fadeDuration = 1000): void {
    const musicVol = useSettingsStore.getState().volume.music;
    if (this.bgm) {
      const oldBgm = this.bgm;
      oldBgm.fade(oldBgm.volume(), 0, fadeDuration);
      setTimeout(() => oldBgm.stop(), fadeDuration);
    }
    this.bgm = new Howl({ src: [src], loop: true, volume: 0 });
    this.bgm.play();
    this.bgm.fade(0, musicVol, fadeDuration);
  }

  public playSFX(src: string, volumeScale = 1.0): void {
    const sfxVol = useSettingsStore.getState().volume.sfx * volumeScale;
    let sound = this.sfxPool.get(src);
    if (!sound) {
      sound = new Howl({ src: [src] });
      this.sfxPool.set(src, sound);
    }
    sound.volume(sfxVol);
    sound.play();
  }
}

export const AudioManager = new AudioManagerImpl();
```

---

## 4. Реестр Исправлений и Критических Багов по Задачам

### Task 1.1 & 1.2: Splash & Loading Screen
1.  **Исправление гонки фаз в Splash Screen:**
    *   *Ошибка:* Два `setTimeout` на 2.0s конфликтуют (звук звонка и начало рисования логотипа).
    *   *Решение:* Использовать единый объект `Timeline` или сиквенсор на базе `requestAnimationFrame` / `Framer Motion animate()`.
2.  **Сглаживание загрузки велосипеда (Task 1.2):**
    *   *Ошибка:* При быстром завершении предзагрузки ассетов прогресс скачет с 10% до 100%, и велосипед телепортируется.
    *   *Решение:* Внедрить `VisualProgress` с интерполяцией (lerp) со скоростью не более 30% в секунду + гарантированное минимальное время показа экранов (3 секунды).
3.  **Единый Autoplay Policy Handler:**
    *   `Howler.unlock()` вызывается один раз на уровне `AppShell` при первом любом клике/таче пользователя, убирая кастомные обработчики из компонентов.

### Task 2.1: Main Menu Background (Cinemagraph)
1.  **Исправление TDZ в `useTimeOfDay`:**
    *   *Ошибка:* `getCurrentTimeVariant` вызывалась до ее объявления при инициализации `useState`.
    *   *Решение:* Вынести чистую функцию `getCurrentTimeVariant` за пределы хука на уровень модуля.
2.  **Устранение анимируемого свойства `origin`:**
    *   *Ошибка:* Framer Motion не может анимировать `origin: "bottom"`.
    *   *Решение:* Перенести в `style={{ transformOrigin: origin }}`.
3.  **Оптимизация Page Visibility:**
    *   При `document.hidden === true` анимированные слои ставятся на паузу через централизованный флаг `isTabActive`, экономя ресурсы GPU/CPU.

### Task 2.2: Main Menu Characters (Renzo & Elena)
1.  **Критический баг `useBreathingEffect`:**
    *   *Ошибка:* `useMemo` содержал `setInterval`, который никогда не очищался и возвращал статическую константу `1`.
    *   *Решение:* Удалить хук. Реализовать дыхание через декларативный Framer Motion:
        ```tsx
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        ```
2.  **Предотвращение спам-кликов по Renzo:**
    *   Блокировка повторных кликов через флаг `isTransitioningToGame` до завершения анимации снятия фуражки.

### Task 2.3: Main Menu Navigation (Object-Based)
1.  **Конфликт трансформаций Framer Motion (Jitter Bug):**
    *   *Ошибка:* Задание `animate={{ y: [0, -3, 0] }}` перебивает `whileHover={{ y: -8 }}` на одном DOM-узле.
    *   *Решение:* Разделение ответственности контейнеров:
        *   Внешний `motion.div`: отвечает за позиционирование, `whileHover` и `whileTap`.
        *   Внутренний `motion.div`: отвечает за бесконечную цикличную левитацию `y: [0, -3, 0]`.

### Task 2.4: Settings Modal (Vintage Aesthetic)
1.  **Баг Framer Motion + HTML5 Drag в `MusicVolumeDial`:**
    *   *Ошибка:* Использование `draggable` атрибута HTML5 вместе с Framer Motion drag ломает жесты.
    *   *Решение:* Использовать чистый Framer Motion Drag:
        ```tsx
        <motion.div
          drag="x"
          dragConstraints={{ left: -100, right: 100 }}
          dragElastic={0}
          dragMomentum={false}
          onDrag={(_, info) => handleDialRotate(info.delta.x)}
        />
        ```
2.  **Исправление применения яркости (Portal Bug):**
    *   *Ошибка:* Фильтр яркости применялся к `#root`, а модальные окна рендерились через Portal в `body`, избегая фильтра.
    *   *Решение:* Фильтр яркости `--brightness-filter` применяется к главному контейнеру `<AppShell>`, который оборачивает как игровой мир, так и контейнер модальных окон Portal.

### Task 2.6: Dynamic Menu Evolution
1.  **Поддержка нелинейного прохождения:**
    *   *Ошибка:* Завязано на строгие стадии `0, 1, 2, 3`.
    *   *Решение:* Переход на декларативные условия на основе `completedChapters: Set<number>`:
        ```typescript
        const showBirds = completedChapters.has(1);
        const showLamps = completedChapters.has(2);
        const showBoat = completedChapters.has(3);
        const saturation = Math.min(1.0, 0.7 + completedChapters.size * 0.1);
        ```

### Task 3.1 — 3.5: Opening Cinematic & Narrative
1.  **Управление таймлайном кат-сцен:**
    *   Все задержки и последовательности переведены с цепочек `setTimeout` на контроллер на базе `async/await` с возможностью мгновенного пропуска (Skip) и очисткой ресурсов.
2.  **Синхронизация Match Cut (Scene 9):**
    *   Переход из экстерьера дома Ренцо в интерьер спальни стандартизован через единый скейлинг с `transformOrigin: "45% 40%"`.

### Task 4.1 — 4.5: Core Systems
1.  **Единый формат типов предметов (Inventory & Economy):**
    *   Объединены типы `InventoryItem` и `Item`. Единый контракт помещен в `@castelvento/shared`.
2.  **Система drag-and-drop инвентаря:**
    *   Выделение слотов через `@dnd-kit/core` изолировано от логики взаимодействия с 3D-сценой через Raycaster. Для 3D-мира используется клик-активация предмета («Взять в руки»).

### Task 5.2 — 5.3: Economy, Time & Energy
1.  **Изоляция ресурса времени:**
    *   Каждое действие высчитывает разницу: `spendTime(minutes)`. При пересечении границы 1320 минут (22:00) автоматически генерируется событие `EVENT_NIGHT_FALL`.
2.  **Целостность транзакций денег:**
    *   Запрещены дробные значения лир. Все операции атомарны и возвращают `boolean` результат.

### Task 8.1: Top HUD ("The Notch")
1.  **Полная очистка от дублированного состояния:**
    *   Компонент `TopHUD` больше не хранит свои копии `energy` и `money`. Он напрямую подписан на `energyStore`, `economyStore` и `timeStore`.

---

## 5. Пошаговая Дорожная Карта Реализации (Implementation Order)

Во избежание падения сборки, разработка должна идти строго в следующем порядке:

```
[Фаза 1: Core & Shared]
  ├── 1.1 Сборка FSD структуры и настройка TypeScript/Vite
  ├── 1.2 Создание типов в @castelvento/shared (Item, Quest, Time, NPC)
  ├── 1.3 Реализация AudioManager (Howler Wrapper)
  └── 1.4 Настройка i18next (RU, EN, IT)

[Фаза 2: Глобальные Сторы (State Engine)]
  ├── 2.1 settingsStore + appStore
  ├── 2.2 timeStore + energyStore + economyStore
  ├── 2.3 inventoryStore (@dnd-kit integration)
  ├── 2.4 questStore + affinityStore
  └── 2.5 progressionStore

[Фаза 3: Входные Экраны и Загрузка]
  ├── 3.1 Task 1.1: Splash Screen (Исправленный сиквенсор)
  └── 3.2 Task 1.2: Loading Screen (Сглаженный прогресс велосипеда)

[Фаза 4: Главное Меню]
  ├── 4.1 Task 2.1: Cinemagraph Background (Исправленный useTimeOfDay)
  ├── 4.2 Task 2.2: Characters (Framer Motion без багованного useMemo)
  ├── 4.3 Task 2.3: Navigation Objects (Разделенные слои трансформаций)
  ├── 4.4 Task 2.4: Settings Modal (Framer Motion Drag + Portal AppShell)
  ├── 4.5 Task 2.5: Credits Photo Album
  └── 4.6 Task 2.6: Dynamic Menu Evolution (Декларативные флаги)

[Фаза 5: HUD & Игровой Интерфейс]
  ├── 5.1 Task 8.1: Top HUD Notch (Селекторы без дублирования состояния)
  ├── 5.2 Task 5.4: Backpack UI (Drag and Drop)
  └── 5.3 Task 5.5: Quest Journal & Reputation Panel

[Фаза 6: Кат-сцены и Мир]
  ├── 6.1 Task 3.1–3.5: Opening Cinematic Sequence
  ├── 6.2 Task 6.1–6.2: Map System & First 5 Locations
  └── 6.3 Task 7.1–7.2: NPC Schedules & Affinity Integration
```

---

## 6. Пример полностью исправленного эталонного компонента (Notch HUD)

Демонстрация работы принципа **Single Source of Truth** без дублирования данных:

```tsx
// client/src/features/hud/ui/TopHUD.tsx
import React, { memo } from 'react';
import { useEnergyStore } from '@/entities/energy/model/energyStore';
import { useEconomyStore } from '@/entities/economy/model/economyStore';
import { useTimeStore } from '@/entities/time/model/timeStore';
import { useSettingsStore } from '@/features/settings/model/settingsStore';
import { NotchShape } from './NotchShape';
import styles from './TopHUD.module.css';

export const TopHUD: React.FC = memo(() => {
  // Чтение напрямую из атомарных сторов без дублирования в hudStore
  const energy = useEnergyStore((s) => s.current);
  const maxEnergy = useEnergyStore((s) => s.max);
  const balance = useEconomyStore((s) => s.balance);
  const formattedTime = useTimeStore((s) => s.getFormattedTime());
  const isNight = useTimeStore((s) => s.isNight());
  
  const brightness = useSettingsStore((s) => s.brightness);

  return (
    <header className={styles.hudContainer} style={{ filter: `brightness(${brightness}%)` }}>
      <NotchShape className={styles.notchBg} />
      
      <div className={styles.content}>
        {/* Энергия */}
        <div className={styles.section}>
          <span className={styles.icon}>⚡</span>
          <div className={styles.barTrack}>
            <div 
              className={styles.barFill} 
              style={{ width: `${(energy / maxEnergy) * 100}%` }} 
            />
          </div>
        </div>

        {/* Время */}
        <div className={styles.sectionCenter}>
          <span>{isNight ? '🌙' : '☀️'}</span>
          <span className={styles.timeText}>{formattedTime}</span>
        </div>

        {/* Баланс Лир */}
        <div className={styles.section}>
          <span className={styles.icon}>₤</span>
          <span className={styles.balanceText}>{balance.toLocaleString()}</span>
        </div>
      </div>
    </header>
  );
});

TopHUD.displayName = 'TopHUD';
```

---

### Вывод
С данным скорректированным планом архитектура проекта становится **абсолютно монолитной и непротиворечивой**. Устранены все потенциальные утечки памяти, гонки состояний и конфликты библиотек анимации. Код готов к чистой и беспрепятственной реализации.