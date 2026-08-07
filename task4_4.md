# Task 4.4: Система достижений и статистики (Achievements & Statistics)

## Цель
Реализовать систему отслеживания игровых достижений ("Трофеи") и подробной статистики игрока, интегрированную с общим прогрессом и влияющую на разблокировку дополнительного контента (артбуки, саундтреки).

## 1. Архитектура данных

### 1.1. Структура Achievement (Достижение)
Файл: `shared/types/achievement.ts`

```typescript
export interface Achievement {
  id: string;              // Уникальный ID (напр. "first_kiss", "collector_100")
  title: string;           // Заголовок (напр. "Первый поцелуй")
  description: string;     // Описание условия
  category: 'story' | 'exploration' | 'collection' | 'mini_game';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  iconPath: string;        // Путь к спрайту иконки (SVG/PNG)
  condition: Condition;    // Логическое условие выполнения
  reward?: {
    type: 'art' | 'music' | 'scene';
    id: string;
  };
  isSecret: boolean;       // Скрывать описание до получения
  unlockedAt?: number;     // Timestamp разблокировки
}

export interface Condition {
  type: 'flag' | 'counter' | 'item' | 'scene_complete';
  target: string;          // ID флага, предмета или сцены
  operator: '>' | '>=' | '==' | '<' | '<=';
  value: number;
  // Для сложных условий можно использовать массив под-условий с логикой AND/OR
}
```

### 1.2. Структура PlayerStatistics (Статистика)
Файл: `shared/types/statistics.ts`

```typescript
export interface PlayerStatistics {
  // Время
  totalPlaytime: number;       // Общее время в секундах
  chapterPlaytime: Record<string, number>; // Время по главам

  // Исследование
  locationsVisited: string[];  // Список ID посещенных локаций
  objectsInteracted: number;   // Всего взаимодействий
  distanceCycled: number;      // Пройденное расстояние на велосипеде (метры)

  // Коллекционирование
  itemsFound: Record<string, number>; // Количество найденных предметов по ID
  totalItemsCollected: number;

  // Диалоги и сюжет
  dialoguesRead: number;       // Всего прочитанных реплик
  choicesMade: number;         // Всего сделанных выборов
  romancesStarted: number;     // Количество начатых романтических линий

  // Мини-игры
  miniGamesPlayed: number;
  miniGamesWon: number;
  bestScoreSearch: number;     // Лучший счет в поиске предметов
  fastestRideTime: number;     // Лучшее время заезда

  // Специфичные счетчики для достижений
  flags: Record<string, boolean>; // Булевы флаги событий
  counters: Record<string, number>; // Числовые счетчики
}
```

## 2. Реализация менеджера достижений

### 2.1. AchievementManager Service
Файл: `client/services/AchievementManager.ts`

**Ответственность:**
- Инициализация списка всех доступных достижений из JSON-конфига.
- Подписка на события игры (Event Bus).
- Проверка условий выполнения достижений в реальном времени.
- Сохранение состояния разблокировок в `localStorage` / `SaveData`.
- Отправка уведомлений UI при получении достижения.

**Логика работы:**
1.  При старте игры загружает `PlayerStatistics` и список разблокированных `Achievement IDs`.
2.  Регистрирует слушатели событий:
    - `EVENT_SCENE_COMPLETE`
    - `EVENT_ITEM_COLLECTED`
    - `EVENT_DIALOG_CHOICE`
    - `EVENT_MINIGAME_WIN`
    - `EVENT_DISTANCE_TRAVELED`
3.  При срабатывании события обновляет соответствующие счетчики в `PlayerStatistics`.
4.  Запускает проверку `checkAchievements()` для всех еще не полученных достижений.
5.  Если условие выполнено:
    - Добавляет ID в список разблокированных.
    - Записывает `unlockedAt`.
    - Триггерит событие `ACHIEVEMENT_UNLOCKED` для показа всплывающего уведомления.
    - Проигрывает специальный звуковой эффект (фанфары).
    - Сохраняет прогресс.

### 2.2. Конфигурация достижений (JSON)
Файл: `client/data/achievements.json`

Пример структуры:
```json
[
  {
    "id": "welcome_to_castelvento",
    "title": "Добро пожаловать в Кастельвенто",
    "description": "Прибыть в город впервые",
    "category": "story",
    "rarity": "common",
    "iconPath": "/assets/achievements/welcome.svg",
    "condition": {
      "type": "flag",
      "target": "chapter1_started",
      "operator": "==",
      "value": 1
    },
    "isSecret": false
  },
  {
    "id": "speed_demon",
    "title": "Демон скорости",
    "description": "Проехать 5 км суммарно на велосипеде",
    "category": "exploration",
    "rarity": "rare",
    "iconPath": "/assets/achievements/speed.svg",
    "condition": {
      "type": "counter",
      "target": "distance_cycled",
      "operator": ">=",
      "value": 5000
    },
    "isSecret": false,
    "reward": { "type": "art", "id": "concept_bike" }
  }
]
```

## 3. UI Компоненты

### 3.1. Экран достижений (AchievementsScreen)
- **Сетка карточек:** Отображение иконок достижений.
- **Фильтрация:** По категориям (Сюжет, Исследование, Коллекция) и статусу (Получено/Закрыто).
- **Карточка достижения:**
  - Если получено: Полная иконка, название, описание, дата получения, кнопка "Посмотреть награду".
  - Если не получено и не секрет: Серая иконка, название, описание условия.
  - Если секрет: Силуэт вопросительного знака, надпись "???", описание скрыто.
- **Прогресс бар:** Общий процент завершения (напр. "12/50 достижений").

### 3.2. Уведомление (AchievementToast)
- Всплывающее окно в верхнем правом углу (или внизу на мобильных).
- Анимация появления (slide-in).
- Содержимое: Иконка, Название, Краткое описание.
- Автоматическое исчезновение через 5 секунд.
- Звуковое сопровождение.

### 3.3. Экран статистики (StatisticsScreen)
- Разделы вкладок: "Общее", "Исследование", "Коллекция", "Мини-игры".
- Визуализация данных:
  - Текстовые значения (часы, минуты).
  - Графики (прогресс сбора предметов по главам).
  - Списки (посещенные локации с мини-картами).
- Кнопка "Сбросить статистику" (только в режиме отладки или с подтверждением).

## 4. Интеграция с системой сохранений

- Данные `PlayerStatistics` и `unlockedAchievements` должны быть частью глобального объекта сохранения (`SaveGame`).
- При загрузке сохранения менеджер достижений должен перепроверить условия для всех достижений (на случай багов или изменений в логике), чтобы выдать пропущенные награды.
- Синхронизация: При изменении статистики данные не пишутся на диск мгновенно (debounce 1-2 сек), чтобы не перегружать I/O, но в памяти обновляются сразу.

## 5. Технические требования

- **Производительность:** Проверка условий не должна вызывать лагов. Использовать мемоизацию для сложных вычислений.
- **Масштабируемость:** Возможность добавлять новые достижения простым редактированием JSON без изменения кода движка.
- **Локализация:** Все текстовые поля (`title`, `description`) должны поддерживать i18n ключи.
- **Отладка:** Команда в консоли разработчика `debug.unlockAllAchievements()` для тестирования UI.

## 6. Checklist реализации

- [ ] Создать типы TypeScript для Achievement и Statistics.
- [ ] Написать парсер JSON конфигурации достижений.
- [ ] Реализовать `AchievementManager` с системой событий.
- [ ] Интегрировать трекинг событий в существующие системы (диалоги, инвентарь, велосипед).
- [ ] Сверстать компонент `AchievementsScreen` (сетка, фильтры, модальное окно деталей).
- [ ] Сверстать компонент `AchievementToast` (анимация, авто-скрытие).
- [ ] Сверстать экран статистики с группировкой данных.
- [ ] Добавить звуки для разблокировки.
- [ ] Протестировать сценарии: получение в процессе игры, получение при загрузке сейва, секретные достижения.
- [ ] Добавить награды (разблокировка записей в галерее).

## 7. Пример кода проверки условия

```typescript
function checkCondition(condition: Condition, stats: PlayerStatistics): boolean {
  const { type, target, operator, value } = condition;

  let currentValue: number | boolean;

  if (type === 'flag') {
    currentValue = stats.flags[target] || false;
    if (operator === '==') return currentValue === (value === 1);
    return false; // Флаги обычно проверяются на истинность
  } 
  
  if (type === 'counter') {
    currentValue = stats.counters[target] || 0;
  } else if (type === 'item') {
    currentValue = stats.itemsFound[target] || 0;
  } else {
    return false;
  }

  switch (operator) {
    case '>': return currentValue > value;
    case '>=': return currentValue >= value;
    case '==': return currentValue === value;
    case '<': return currentValue < value;
    case '<=': return currentValue <= value;
    default: return false;
  }
}
```
