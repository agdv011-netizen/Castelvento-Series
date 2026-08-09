# Task 6.1: Map & Travel System — Detailed Implementation Specification

## 📋 Overview
**Task ID:** 6.1  
**Title:** Map & Travel System  
**Priority:** P1 (High)  
**Parent Feature:** World & Locations  

Создание интерактивной карты для путешествий между локациями Castelvento с механикой времени, стоимости и прогрессивной разблокировки областей.

---

## 🎯 Functional Requirements

### 1. Компонент карты (Map View Component)

#### 1.1 Визуальное представление
- **Базовый слой**: Hand-drawn иллюстрация всего Castelvento в стиле акварели 1940-х годов
- **Размерность**: SVG viewBox="0 0 1920 1080" с поддержкой масштабирования
- **Слои карты** (снизу вверх):
  1. Background layer — основной рисунок города
  2. Fog layer — полупрозрачная дымка для неоткрытых зон
  3. Location markers — иконки локаций с пульсирующей анимацией
  4. Player marker — текущее местоположение игрока (анимированный велосипед)
  5. Route line — линия маршрута при выборе目的地
  6. UI overlay — кнопки управления, информация о локации

#### 1.2 Интерактивные элементы
```typescript
interface LocationMarker {
  id: string;
  name: string;
  coordinates: { x: number; y: number };
  icon: 'house' | 'church' | 'market' | 'beach' | 'station' | 'cafe' | 'pier';
  status: 'current' | 'visited' | 'locked' | 'available';
  unlockCondition?: QuestRequirement;
  travelTime: number; // minutes
  travelCost: number; // lire
  transportType: 'walk' | 'bicycle' | 'train';
}
```

#### 1.3 Состояния маркеров
- **Current location**: Зеленая рамка, пульсирующее свечение, подпись "You are here"
- **Visited location**: Полная яркость, доступный клик, иконка в цвете
- **Available location**: Доступен для посещения, но еще не открыт (вопросительный знак)
- **Locked location**: Серая иконка, замок поверх, tooltip с условием разблокировки

### 2. Механика путешествий (Travel Mechanics)

#### 2.1 Функция travelTo
```typescript
// store/travelStore.ts
interface TravelState {
  currentLocation: string;
  isTraveling: boolean;
  travelProgress: number;
  destination: string | null;
}

interface TravelActions {
  canTravelTo: (locationId: string) => boolean;
  getTravelInfo: (locationId: string) => TravelInfo;
  startTravel: (locationId: string) => Promise<void>;
  cancelTravel: () => void;
  completeTravel: () => void;
}

interface TravelInfo {
  distance: number;
  estimatedTime: number; // in-game minutes
  cost: number; // lire
  transportMethod: 'walk' | 'bicycle' | 'train';
  available: boolean;
  lockReason?: string;
}
```

#### 2.2 Логика проверки доступности
```typescript
const canTravelTo = (locationId: string): boolean => {
  const location = LOCATIONS[locationId];
  const playerState = usePlayerStore.getState();
  const questState = useQuestStore.getState();
  
  // Проверка: уже посещено
  if (playerState.visitedLocations.includes(locationId)) {
    return true;
  }
  
  // Проверка: условия разблокировки через квесты
  if (location.unlockCondition) {
    const requirementMet = checkQuestRequirement(
      location.unlockCondition,
      questState
    );
    if (!requirementMet) return false;
  }
  
  // Проверка: время суток (некоторые локации закрыты ночью)
  if (location.timeRestrictions) {
    const currentHour = useTimeStore.getState().hour;
    if (!isTimeWithinRange(currentHour, location.timeRestrictions)) {
      return false;
    }
  }
  
  // Проверка: активный квест (опционально)
  if (questState.activeQuest?.preventTravel) {
    return false;
  }
  
  return true;
};
```

#### 2.3 Расчет стоимости и времени
```typescript
const calculateTravel = (from: string, to: string): TravelInfo => {
  const fromLoc = LOCATIONS[from];
  const toLoc = LOCATIONS[to];
  
  // Расчет расстояния по координатам
  const distance = Math.sqrt(
    Math.pow(toLoc.x - fromLoc.x, 2) + 
    Math.pow(toLoc.y - fromLoc.y, 2)
  );
  
  // Выбор транспорта
  let transportMethod: TransportType = 'bicycle';
  if (toLoc.transportType === 'train') {
    transportMethod = 'train';
  } else if (distance < 200) {
    transportMethod = 'walk';
  }
  
  // Расчет времени (минуты в игре)
  const speedMultiplier = {
    walk: 1.0,
    bicycle: 2.5,
    train: 5.0
  };
  const estimatedTime = Math.round(distance / (50 * speedMultiplier[transportMethod]));
  
  // Расчет стоимости
  const cost = transportMethod === 'train' ? 5 : 0;
  
  return {
    distance: Math.round(distance),
    estimatedTime,
    cost,
    transportMethod,
    available: canTravelTo(to)
  };
};
```

### 3. Визуальная обратная связь (Visual Feedback)

#### 3.1 Анимация маршрута
```typescript
// components/Map/RouteAnimation.tsx
const RouteAnimation: React.FC<{
  from: { x: number; y: number };
  to: { x: number; y: number };
  progress: number;
}> = ({ from, to, progress }) => {
  // Рисуем пунктирную линию маршрута
  const pathD = `M ${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${Math.min(from.y, to.y) - 50} ${to.x} ${to.y}`;
  
  return (
    <g className="route-animation">
      {/* Базовая линия */}
      <path
        d={pathD}
        stroke="#8B7355"
        strokeWidth="2"
        strokeDasharray="5,5"
        fill="none"
        opacity="0.6"
      />
      
      {/* Активная линия (рисуется по мере движения) */}
      <path
        d={pathD}
        stroke="#D4AF37"
        strokeWidth="3"
        fill="none"
        strokeDasharray="1000"
        strokeDashoffset={1000 * (1 - progress)}
        style={{ transition: 'stroke-dashoffset 0.1s linear' }}
      />
      
      {/* Движущаяся иконка велосипеда */}
      <g transform={`translate(${interpolateX(progress)}, ${interpolateY(progress)})`}>
        <BicycleIcon size={24} className="animated-bicycle" />
      </g>
    </g>
  );
};
```

#### 3.2 Экран загрузки во время путешествия
```typescript
// components/Travel/TravelLoadingScreen.tsx
const TravelLoadingScreen: React.FC<{
  from: string;
  to: string;
  progress: number;
  travelInfo: TravelInfo;
}> = ({ from, to, progress, travelInfo }) => {
  const locationFacts = LOCATION_FACTS[to];
  
  return (
    <div className="travel-loading-overlay">
      <div className="postcard-background">
        {/* Карта с движущимся велосипедом */}
        <MiniMap
          from={LOCATIONS[from].coordinates}
          to={LOCATIONS[to].coordinates}
          progress={progress}
        />
        
        {/* Информация о путешествии */}
        <div className="travel-info-panel">
          <p className="route-text">
            Traveling from <strong>{from}</strong> to <strong>{to}</strong>
          </p>
          
          <div className="travel-stats">
            <span>🚲 {travelInfo.transportMethod}</span>
            <span>⏱️ {travelInfo.estimatedTime} min</span>
            {travelInfo.cost > 0 && <span>₤{travelInfo.cost}</span>}
          </div>
          
          {/* Интересный факт о локации */}
          <div className="location-fact">
            <p>"{locationFacts.randomFact()}"</p>
            <p className="fact-author">— Local Guide, 1940s</p>
          </div>
        </div>
        
        {/* Индикатор прогресса */}
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
```

### 4. Управление состоянием (Zustand Store)

```typescript
// stores/mapStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LocationData {
  id: string;
  name: string;
  visited: boolean;
  unlocked: boolean;
  lastVisited?: Date;
  visitsCount: number;
}

interface MapState {
  locations: Record<string, LocationData>;
  currentLocation: string;
  isTraveling: boolean;
  travelProgress: number;
  travelDestination: string | null;
  
  // Actions
  initializeLocations: () => void;
  visitLocation: (locationId: string) => void;
  unlockLocation: (locationId: string) => void;
  startTravel: (destination: string) => void;
  updateTravelProgress: (progress: number) => void;
  completeTravel: () => void;
  cancelTravel: () => void;
  getCurrentLocation: () => LocationData | null;
  getAvailableDestinations: () => string[];
}

export const useMapStore = create<MapState>()(
  persist(
    (set, get) => ({
      locations: {},
      currentLocation: 'renzo_house',
      isTraveling: false,
      travelProgress: 0,
      travelDestination: null,
      
      initializeLocations: () => {
        const initialLocations: Record<string, LocationData> = {};
        Object.keys(LOCATIONS).forEach(id => {
          initialLocations[id] = {
            id,
            name: LOCATIONS[id].name,
            visited: id === 'renzo_house',
            unlocked: true,
            visitsCount: id === 'renzo_house' ? 1 : 0,
          };
        });
        set({ locations: initialLocations });
      },
      
      visitLocation: (locationId) => {
        set(state => ({
          locations: {
            ...state.locations,
            [locationId]: {
              ...state.locations[locationId],
              visited: true,
              lastVisited: new Date(),
              visitsCount: state.locations[locationId].visitsCount + 1,
            },
          },
        }));
      },
      
      unlockLocation: (locationId) => {
        set(state => ({
          locations: {
            ...state.locations,
            [locationId]: {
              ...state.locations[locationId],
              unlocked: true,
            },
          },
        }));
      },
      
      startTravel: (destination) => {
        const { currentLocation, locations } = get();
        if (!locations[destination]?.unlocked) {
          console.warn('Cannot travel to locked location');
          return;
        }
        
        set({
          isTraveling: true,
          travelProgress: 0,
          travelDestination: destination,
        });
        
        // Запускаем анимацию путешествия
        animateTravel(destination);
      },
      
      updateTravelProgress: (progress) => {
        set({ travelProgress: progress });
      },
      
      completeTravel: () => {
        const { travelDestination } = get();
        if (travelDestination) {
          get().visitLocation(travelDestination);
          set({
            currentLocation: travelDestination,
            isTraveling: false,
            travelProgress: 0,
            travelDestination: null,
          });
        }
      },
      
      cancelTravel: () => {
        set({
          isTraveling: false,
          travelProgress: 0,
          travelDestination: null,
        });
      },
      
      getCurrentLocation: () => {
        const { currentLocation, locations } = get();
        return locations[currentLocation] || null;
      },
      
      getAvailableDestinations: () => {
        const { locations } = get();
        return Object.values(locations)
          .filter(loc => loc.unlocked)
          .map(loc => loc.id);
      },
    }),
    {
      name: 'castelvento-map-storage',
      partialize: (state) => ({
        locations: state.locations,
        currentLocation: state.currentLocation,
      }),
    }
  )
);
```

### 5. Конфигурация локаций (JSON)

```json
// data/locations.json
{
  "renzo_house": {
    "id": "renzo_house",
    "name": "Renzo's House",
    "coordinates": { "x": 450, "y": 320 },
    "icon": "house",
    "travelTime": 0,
    "travelCost": 0,
    "transportType": "walk",
    "timeRestrictions": null,
    "unlockCondition": null,
    "description": "Your childhood home. Familiar creaks and smells.",
    "facts": [
      "The shutters have been painted blue since 1923.",
      "Nonna says the house was built by fishermen.",
      "Your room still has the posters from before the war."
    ]
  },
  
  "town_square": {
    "id": "town_square",
    "name": "Piazza Centrale",
    "coordinates": { "x": 720, "y": 480 },
    "icon": "church",
    "travelTime": 15,
    "travelCost": 0,
    "transportType": "bicycle",
    "timeRestrictions": { "open": 6, "close": 23 },
    "unlockCondition": null,
    "description": "Heart of Castelvento. Everyone gathers here.",
    "facts": [
      "The fountain dates back to Roman times.",
      "Every Sunday, the priest feeds the pigeons.",
      "Resistance meetings were held here during the occupation."
    ]
  },
  
  "train_station": {
    "id": "train_station",
    "name": "Castelvento Station",
    "coordinates": { "x": 1200, "y": 650 },
    "icon": "station",
    "travelTime": 30,
    "travelCost": 5,
    "transportType": "train",
    "timeRestrictions": { "open": 5, "close": 22 },
    "unlockCondition": {
      "type": "quest_progress",
      "questId": "chapter_1_complete",
      "requiredStep": 10
    },
    "description": "Gateway to the outside world. Trains to Rome twice daily.",
    "facts": [
      "The station master has worked here for 40 years.",
      "During the war, refugees arrived here daily.",
      "The clock tower was a gift from Mussolini's regime."
    ]
  }
}
```

### 6. UI Компоненты

#### 6.1 Main Map Component
```typescript
// components/Map/WorldMap.tsx
const WorldMap: React.FC = () => {
  const { 
    locations, 
    currentLocation, 
    isTraveling, 
    startTravel,
    getAvailableDestinations 
  } = useMapStore();
  
  const availableDestinations = getAvailableDestinations();
  
  return (
    <div className="world-map-container">
      <svg viewBox="0 0 1920 1080" className="world-map-svg">
        {/* Background Layer */}
        <image 
          href="/assets/maps/castelvento_full.png" 
          width="1920" 
          height="1080"
        />
        
        {/* Fog of War Layer */}
        <FogOverlay locations={locations} />
        
        {/* Location Markers */}
        {Object.values(locations).map(location => (
          <LocationMarker
            key={location.id}
            location={location}
            isCurrent={location.id === currentLocation}
            isAvailable={availableDestinations.includes(location.id)}
            onClick={() => startTravel(location.id)}
          />
        ))}
        
        {/* Travel Animation */}
        {isTraveling && <TravelRouteAnimation />}
      </svg>
      
      {/* UI Overlay */}
      <MapUIOverlay />
    </div>
  );
};
```

#### 6.2 Location Tooltip
```typescript
// components/Map/LocationTooltip.tsx
const LocationTooltip: React.FC<{
  location: LocationData;
  travelInfo: TravelInfo;
}> = ({ location, travelInfo }) => {
  return (
    <div className="location-tooltip vintage-paper">
      <h3 className="location-name">{location.name}</h3>
      
      {!location.unlocked ? (
        <div className="locked-indicator">
          <LockIcon size={16} />
          <p>Requires: {location.unlockCondition?.description}</p>
        </div>
      ) : (
        <>
          <div className="location-details">
            {location.visited && (
              <span className="visited-badge">✓ Visited</span>
            )}
            <p className="description">{location.description}</p>
          </div>
          
          <div className="travel-info">
            <div className="info-row">
              <ClockIcon size={14} />
              <span>{travelInfo.estimatedTime} minutes</span>
            </div>
            
            {travelInfo.cost > 0 && (
              <div className="info-row">
                <CoinIcon size={14} />
                <span>₤{travelInfo.cost}</span>
              </div>
            )}
            
            <div className="info-row">
              <TransportIcon type={travelInfo.transportMethod} />
              <span className="capitalize">{travelInfo.transportMethod}</span>
            </div>
          </div>
          
          <button 
            className="travel-button btn-vintage"
            disabled={!travelInfo.available}
          >
            Travel Here
          </button>
        </>
      )}
    </div>
  );
};
```

---

## 🔧 Technical Implementation Steps

### Шаг 1: Создание базовой структуры данных
1. Создать файл `data/locations.json` с конфигурацией всех локаций
2. Определить TypeScript интерфейсы для LocationData, TravelInfo
3. Настроить константы LOCATIONS_MAP для быстрого доступа

### Шаг 2: Реализация Zustand store
1. Создать `stores/mapStore.ts` с полным состоянием карты
2. Добавить middleware `persist` для сохранения прогресса
3. Реализовать все actions: initialize, visit, unlock, travel

### Шаг 3: Создание визуальных компонентов
1. Сверстать базовый SVG компонент карты
2. Добавить слои: фон, туман, маркеры, UI
3. Реализовать LocationMarker с разными состояниями
4. Создать tooltip для отображения информации

### Шаг 4: Логика путешествий
1. Реализовать функцию `canTravelTo` с проверками условий
2. Создать `calculateTravel` для расчета времени/стоимости
3. Добавить анимацию движения по маршруту
4. Реализовать экран загрузки с фактами о локациях

### Шаг 5: Интеграция с другими системами
1. Подключить проверку квестов из `questStore`
2. Добавить проверку времени из `timeStore`
3. Синхронизировать с `playerStore` для_visited locations
4. Настроить предзагрузку ассетов следующей локации

### Шаг 6: Оптимизация и мобильная адаптация
1. Добавить pinch-to-zoom для мобильных устройств
2. Реализовать lazy loading для тяжелых ассетов карты
3. Упростить эффекты для low-end устройств
4. Протестировать на разных разрешениях экрана

---

## ✅ Acceptance Criteria

### Функциональные требования
- [ ] Карта отображает все запланированные локации с правильными иконками
- [ ] Текущая локация игрока подсвечена и подписана "You are here"
- [ ] Посещенные локации отличаются визуально от непосещенных
- [ ] Заблокированные локации показывают замок и причину блокировки
- [ ] Клик на доступную локацию запускает путешествие
- [ ] Во время путешествия показывается анимация движения велосипеда
- [ ] Экран загрузки отображает время, стоимость и интересный факт
- [ ] После завершения путешествия игрок появляется в новой локации
- [ ] Время и деньги списываются корректно
- [ ] Прогресс посещений сохраняется между сессиями

### Технические требования
- [ ] Плавная анимация при 60 FPS
- [ ] Отсутствие утечек памяти при переключении локаций
- [ ] Корректная работа на мобильных устройствах (touch events)
- [ ] Предзагрузка ассетов следующей локации во время путешествия
- [ ] Обработка ошибок (прерывание соединения, отмена путешествия)
- [ ] Типизация всех компонентов на TypeScript
- [ ] Покрытие unit-тестами ключевых функций (canTravelTo, calculateTravel)

### Визуальные требования
- [ ] Стиль карты соответствует эстетике 1940-х годов
- [ ] Все иконки локаций читаемы в любом масштабе
- [ ] Анимации плавные и приятные (easing functions)
- [ ] Цветовая палитра согласована с общим дизайном игры
- [ ] Tooltip отображается корректно без перекрытия важных элементов

---

## 🎨 Assets Required

### Графические ресурсы
- [ ] `castelvento_full.png` — полная карта города (1920x1080, акварель)
- [ ] `location_icons.svg` — набор иконок для всех типов локаций
- [ ] `bicycle_sprite.png` — спрайт велосипеда для анимации движения
- [ ] `fog_overlay.png` — текстура тумана для неоткрытых зон
- [ ] `vintage_paper_texture.png` — фон для tooltip и UI панелей
- [ ] `lock_icon.svg` — иконка замка для заблокированных локаций

### Аудио ресурсы
- [ ] `travel_ambience.mp3` — фоновый звук путешествия (ветер, дорога)
- [ ] `bicycle_wheel.mp3` — звук крутящихся колес
- [ ] `train_whistle.mp3` — гудок поезда (для станции)
- [ ] `ui_click_vintage.wav` — винтажный звук клика по карте

---

## 📱 Mobile Considerations

### Адаптация для мобильных устройств
1. **Масштабирование**: Pinch-to-zoom жесты для навигации по карте
2. **Размер маркеров**: Увеличить hit area до 48x48px для touch
3. **Tooltip позиционирование**: Адаптивное размещение относительно края экрана
4. **Упрощенная графика**: Отключить некоторые слои параллакса на слабых устройствах
5. **Ориентация**: Поддержка portrait и landscape режимов

### Производительность
```typescript
// Detect mobile and reduce complexity
const isMobile = window.innerWidth < 768;
const reducedQuality = isMobile || deviceMemory < 4;

<MapCanvas 
  enableParallax={!reducedQuality}
  maxMarkers={isMobile ? 8 : undefined}
  simplifyPaths={reducedQuality}
/>
```

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] `canTravelTo()` возвращает false для заблокированных локаций
- [ ] `calculateTravel()` правильно считает время для разных транспортов
- [ ] `visitLocation()` увеличивает счетчик посещений
- [ ] `completeTravel()` обновляет currentLocation

### Integration Tests
- [ ] Путешествие уменьшает баланс игрока на правильную сумму
- [ ] Путешествие продвигает игровое время
- [ ] Разблокировка локации через квест работает корректно
- [ ] Сохранение/загрузка состояния карты работает

### E2E Tests
- [ ] Игрок может путешествовать между всеми открытыми локациями
- [ ] Анимация путешествия завершается успешно
- [ ] После перезагрузки страницы прогресс посещений сохраняется
- [ ] Мобильные жесты работают корректно

---

## 🔗 Related Tasks
- **Task 5.2**: Time & Energy System (влияет на время путешествия)
- **Task 5.3**: Money & Economy (влияет на стоимость проезда)
- **Task 5.5**: Quests & Reputation (условия разблокировки локаций)
- **Task 6.2**: Location Framework (фреймворк для самих локаций)

---

## 📝 Developer Notes

### Важные замечания
1. **Синхронизация времени**: Убедиться, что время путешествия корректно добавляется к общему игровому времени
2. **Edge cases**: Обработать случаи отмены путешествия, потери соединения, быстрых повторных кликов
3. **Доступность**: Добавить keyboard navigation для десктопной версии (Tab между маркерами)
4. **Локализация**: Все тексты должны поддерживаться системой i18n

### Потенциальные проблемы
- **Производительность**: Большая SVG карта может тормозить на слабых устройствах → использовать Canvas для рендеринга
- **Синхронизация**: Если путешествие прервано, состояние может рассинхронизироваться → добавить rollback механизм
- **UX**: Игрок может запутаться в условиях разблокировки → добавить четкие подсказки в tooltip

### Рекомендации
- Начать с реализации 3-5 тестовых локаций для отладки механики
- Использовать моковые данные для быстрого прототипирования
- Добавить debug mode для мгновенного перемещения между локациями во время разработки
