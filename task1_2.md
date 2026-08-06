# Task 1.2: Loading Screen with Traveling Bicycle - Детальная спецификация реализации

## Цель задачи
Реализовать интерактивный загрузочный экран, где велосипед путешествует по карте Castelvento, следуя заданному маршруту через ключевые локации (улица → пляж → церковь → дом). Экран отображается после splash screen и скрывается после полной загрузки всех ресурсов игры.

---

## 1. Структура файлов и компонентов

### 1.1 Создание файловой структуры
```
client/
├── src/
│   ├── components/
│   │   └── loading/
│   │       ├── LoadingScreen.tsx          # Главный компонент экрана загрузки
│   │       ├── TravelingBicycle.tsx       # Компонент велосипеда с анимацией
│   │       ├── MapBackground.tsx          # Компонент фона (карта + открытка)
│   │       ├── DynamicPhrases.tsx         # Компонент динамических фраз
│   │       ├── LocationMarker.tsx         # Маркер текущей локации
│   │       └── index.ts                   # Экспорт компонентов
│   ├── hooks/
│   │   ├── useBicycleAnimation.ts         # Логика движения велосипеда
│   │   ├── useLoadingProgress.ts          # Отслеживание прогресса загрузки
│   │   └── useParallaxScroll.ts           # Параллакс-эффект для камеры
│   ├── stores/
│   │   └── loadingStore.ts                # Zustand store для состояния загрузки
│   ├── assets/
│   │   ├── images/
│   │   │   ├── loading/
│   │   │   │   ├── postcard-bg.png        # Фон старой открытки
│   │   │   │   ├── wooden-table.png       # Текстура деревянного стола
│   │   │   │   ├── map-castelvento.png    # Карта маршрута
│   │   │   │   ├── bicycle-sprite.png     # Спрайт велосипедиста (8 кадров)
│   │   │   │   ├── location-icons/
│   │   │   │   │   ├── street-icon.svg    # Иконка улицы
│   │   │   │   │   ├── beach-icon.svg     # Иконка пляжа
│   │   │   │   │   ├── church-icon.svg    # Иконка церкви
│   │   │   │   │   └── house-icon.svg     # Иконка дома
│   │   │   │   └── route-path.svg         # SVG путь маршрута
│   │   └── audio/
│   │       └── loading/
│   │           ├── bicycle-wheel.mp3      # Звук крутящихся колёс
│   │           ├── bicycle-bell.mp3       # Звук звонка (при прохождении точек)
│   │           └── ambient-wind.mp3       # Фоновый звук ветра
│   ├── styles/
│   │   └── loading.module.css             # Стили для компонентов загрузки
│   └── utils/
│       ├── routeCalculator.ts             # Утилиты для расчёта пути
│       └── progressMapper.ts              # Маппинг прогресса загрузки на позицию
```

---

## 2. Детальная реализация компонентов

### 2.1 LoadingScreen.tsx - Главный контейнер
**Файл:** `client/src/components/loading/LoadingScreen.tsx`

```typescript
import React, { useEffect, useCallback } from 'react';
import { useLoadingStore } from '../../stores/loadingStore';
import { useBicycleAnimation } from '../../hooks/useBicycleAnimation';
import { useLoadingProgress } from '../../hooks/useLoadingProgress';
import MapBackground from './MapBackground';
import TravelingBicycle from './TravelingBicycle';
import DynamicPhrases from './DynamicPhrases';
import LocationMarker from './LocationMarker';
import styles from '../../styles/loading.module.css';

interface LoadingScreenProps {
  onComplete: () => void;
  assetsToLoad: string[];
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete, assetsToLoad }) => {
  const { progress, isComplete, setCurrentPhase, setTotalAssets } = useLoadingStore();
  const { position, currentLocation, rotation } = useBicycleAnimation(progress);
  const { loadedCount, total } = useLoadingProgress(assetsToLoad);
  
  // Инициализация прогресса
  useEffect(() => {
    setTotalAssets(assetsToLoad.length);
  }, [assetsToLoad.length, setTotalAssets]);

  // Обработка завершения загрузки
  useEffect(() => {
    if (isComplete && progress === 100) {
      // Плавное затухание перед переходом
      setTimeout(() => {
        onComplete();
      }, 500); // 500ms на завершение анимации велосипеда
    }
  }, [isComplete, progress, onComplete]);

  // Обновление фазы загрузки
  useEffect(() => {
    if (progress < 25) setCurrentPhase('street');
    else if (progress < 50) setCurrentPhase('beach');
    else if (progress < 75) setCurrentPhase('church');
    else setCurrentPhase('house');
  }, [progress, setCurrentPhase]);

  return (
    <div className={styles.loadingContainer} role="progressbar" aria-valuenow={progress}>
      {/* Слои рендеринга */}
      <MapBackground progress={progress} />
      
      <TravelingBicycle 
        position={position} 
        rotation={rotation} 
        currentLocation={currentLocation}
      />
      
      <LocationMarker 
        currentLocation={currentLocation}
        isVisible={progress > 5} // Показывать после начала движения
      />
      
      <DynamicPhrases 
        progress={progress}
        currentLocation={currentLocation}
      />
      
      {/* Прогресс бар (опционально, можно скрыть для погружения) */}
      <div className={styles.progressOverlay}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className={styles.progressText}>{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

export default LoadingScreen;
```

---

### 2.2 TravelingBicycle.tsx - Компонент велосипеда
**Файл:** `client/src/components/loading/TravelingBicycle.tsx`

```typescript
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../../styles/loading.module.css';

interface Position {
  x: number;
  y: number;
}

interface TravelingBicycleProps {
  position: Position;
  rotation: number;
  currentLocation: 'street' | 'beach' | 'church' | 'house';
}

const TravelingBicycle: React.FC<TravelingBicycleProps> = ({ 
  position, 
  rotation, 
  currentLocation 
}) => {
  // Спрайт велосипедиста (8 кадров анимации педалирования)
  const spriteFrames = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      x: i * 64, // Ширина кадра 64px
      y: 0
    }));
  }, []);

  return (
    <motion.div
      className={styles.bicycleContainer}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center center',
        zIndex: 100 // Велосипед поверх карты
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Тень под велосипедом */}
      <div className={styles.bicycleShadow} />
      
      {/* Спрайт анимация */}
      <motion.div
        className={styles.bicycleSprite}
        animate={{
          backgroundPositionX: spriteFrames.map(f => `${f.x}px`)
        }}
        transition={{
          backgroundPositionX: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 0.8, // Скорость педалирования
            ease: "steps(8)" // Резкие переходы между кадрами
          }
        }}
        style={{
          backgroundImage: 'url(/assets/images/loading/bicycle-sprite.png)',
          backgroundSize: '512px 64px', // 8 кадров × 64px
          width: '64px',
          height: '64px'
        }}
      />
      
      {/* Эффект пыли при движении (опционально) */}
      <AnimatePresence>
        {currentLocation === 'street' && (
          <motion.div
            className={styles.dustEffect}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.6, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, repeat: Infinity }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TravelingBicycle;
```

---

### 2.3 MapBackground.tsx - Фон с картой и открыткой
**Файл:** `client/src/components/loading/MapBackground.tsx`

```typescript
import React from 'react';
import { motion } from 'framer-motion';
import styles from '../../styles/loading.module.css';

interface MapBackgroundProps {
  progress: number;
}

const MapBackground: React.FC<MapBackgroundProps> = ({ progress }) => {
  // Параллакс эффект: карта движется медленнее велосипеда
  const parallaxOffset = progress * 0.3;

  return (
    <div className={styles.backgroundContainer}>
      {/* Слой 1: Деревянный стол */}
      <div 
        className={styles.woodenTableLayer}
        style={{
          backgroundImage: 'url(/assets/images/loading/wooden-table.png)',
          backgroundSize: 'cover'
        }}
      />
      
      {/* Слой 2: Старая открытка */}
      <motion.div
        className={styles.postcardLayer}
        style={{
          backgroundImage: 'url(/assets/images/loading/postcard-bg.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
        animate={{
          rotate: [0, 0.5, -0.5, 0], // Лёгкое покачивание
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Слой 3: Карта маршрута */}
      <motion.div
        className={styles.mapLayer}
        style={{
          backgroundImage: 'url(/assets/images/loading/map-castelvento.png)',
          backgroundSize: '200% 100%', // Широкая карта для прокрутки
          backgroundPositionX: `${parallaxOffset}%`
        }}
      >
        {/* SVG путь маршрута */}
        <svg className={styles.routePath} viewBox="0 0 1200 400">
          <path
            d="M 100 200 Q 300 150 500 200 T 900 200 T 1100 150"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="3"
            strokeDasharray="10,5"
            opacity="0.7"
          />
          
          {/* Маркеры локаций */}
          <circle cx="100" cy="200" r="8" fill="#8B4513" />
          <circle cx="500" cy="200" r="8" fill="#4682B4" />
          <circle cx="900" cy="200" r="8" fill="#DAA520" />
          <circle cx="1100" cy="150" r="8" fill="#228B22" />
        </svg>
      </motion.div>
    </div>
  );
};

export default MapBackground;
```

---

### 2.4 DynamicPhrases.tsx - Динамические фразы
**Файл:** `client/src/components/loading/DynamicPhrases.tsx`

```typescript
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../../styles/loading.module.css';

interface DynamicPhrasesProps {
  progress: number;
  currentLocation: 'street' | 'beach' | 'church' | 'house';
}

// База фраз для каждой локации
const LOCATION_PHRASES = {
  street: [
    "Доброе утро, Castelvento!",
    "Колёса крутятся, день начинается...",
    "Улицы ещё спят, но мы уже в пути"
  ],
  beach: [
    "Чувствуешь солёный бриз?",
    "Пляж ждёт своих первых посетителей",
    "Волны шепчут истории старого города"
  ],
  church: [
    "Колокола зовут на утреннюю службу",
    "Тишина вокруг древних стен",
    "Здесь время течёт иначе"
  ],
  house: [
    "Домой, где нас ждут",
    "Путешествие завершается",
    "Castelvento — это больше чем город"
  ]
};

const DynamicPhrases: React.FC<DynamicPhrasesProps> = ({ progress, currentLocation }) => {
  // Выбор случайной фразы при входе в локацию
  const currentPhrase = useMemo(() => {
    const phrases = LOCATION_PHRASES[currentLocation];
    const phraseIndex = Math.floor((progress % 25) / 25 * phrases.length);
    return phrases[Math.min(phraseIndex, phrases.length - 1)];
  }, [progress, currentLocation]);

  return (
    <div className={styles.phrasesContainer}>
      <AnimatePresence mode="wait">
        <motion.p
          key={currentPhrase}
          className={styles.phraseText}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {currentPhrase}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

export default DynamicPhrases;
```

---

### 2.5 LocationMarker.tsx - Маркер текущей локации
**Файл:** `client/src/components/loading/LocationMarker.tsx`

```typescript
import React from 'react';
import { motion } from 'framer-motion';
import styles from '../../styles/loading.module.css';

interface LocationMarkerProps {
  currentLocation: 'street' | 'beach' | 'church' | 'house';
  isVisible: boolean;
}

const LOCATION_ICONS = {
  street: '/assets/images/loading/location-icons/street-icon.svg',
  beach: '/assets/images/loading/location-icons/beach-icon.svg',
  church: '/assets/images/loading/location-icons/church-icon.svg',
  house: '/assets/images/loading/location-icons/house-icon.svg'
};

const LOCATION_NAMES = {
  street: 'Улица Via Roma',
  beach: 'Пляж Spiaggia',
  church: 'Церковь San Pietro',
  house: 'Дом на Via Castello'
};

const LocationMarker: React.FC<LocationMarkerProps> = ({ currentLocation, isVisible }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      className={styles.locationMarker}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <img 
        src={LOCATION_ICONS[currentLocation]} 
        alt={LOCATION_NAMES[currentLocation]}
        className={styles.locationIcon}
      />
      <span className={styles.locationName}>
        {LOCATION_NAMES[currentLocation]}
      </span>
    </motion.div>
  );
};

export default LocationMarker;
```

---

## 3. Хуки и логика

### 3.1 useBicycleAnimation.ts - Логика движения
**Файл:** `client/src/hooks/useBicycleAnimation.ts`

```typescript
import { useMemo } from 'react';

interface Position {
  x: number;
  y: number;
}

interface UseBicycleAnimationReturn {
  position: Position;
  currentLocation: 'street' | 'beach' | 'church' | 'house';
  rotation: number;
}

// Координаты ключевых точек маршрута (в пикселях относительно карты)
const ROUTE_POINTS = [
  { x: 100, y: 200, location: 'street' as const },    // Старт: Улица
  { x: 300, y: 180, location: 'street' as const },    // Середина улицы
  { x: 500, y: 200, location: 'beach' as const },     // Пляж
  { x: 700, y: 190, location: 'beach' as const },     // Середина пляжа
  { x: 900, y: 200, location: 'church' as const },    // Церковь
  { x: 1000, y: 180, location: 'church' as const },   // Середина церкви
  { x: 1100, y: 150, location: 'house' as const }     // Финиш: Дом
];

export const useBicycleAnimation = (progress: number): UseBicycleAnimationReturn => {
  const { position, currentLocation, rotation } = useMemo(() => {
    // Нормализуем прогресс от 0 до 1
    const normalizedProgress = Math.min(Math.max(progress / 100, 0), 1);
    
    // Находим текущий сегмент маршрута
    const totalSegments = ROUTE_POINTS.length - 1;
    const currentSegment = Math.min(
      Math.floor(normalizedProgress * totalSegments),
      totalSegments - 1
    );
    
    const startPoint = ROUTE_POINTS[currentSegment];
    const endPoint = ROUTE_POINTS[currentSegment + 1];
    
    // Локальный прогресс внутри сегмента (0-1)
    const segmentProgress = (normalizedProgress * totalSegments) - currentSegment;
    
    // Интерполяция позиции
    const x = startPoint.x + (endPoint.x - startPoint.x) * segmentProgress;
    const y = startPoint.y + (endPoint.y - startPoint.y) * segmentProgress;
    
    // Расчёт угла поворота (в градусах)
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    const rotation = (Math.atan2(dy, dx) * 180) / Math.PI;
    
    // Определение текущей локации
    const currentLocation = startPoint.location;
    
    return {
      position: { x, y },
      currentLocation,
      rotation
    };
  }, [progress]);

  return { position, currentLocation, rotation };
};
```

---

### 3.2 useLoadingProgress.ts - Отслеживание загрузки
**Файл:** `client/src/hooks/useLoadingProgress.ts`

```typescript
import { useState, useEffect } from 'react';
import { useLoadingStore } from '../stores/loadingStore';

export const useLoadingProgress = (assetsToLoad: string[]) => {
  const [loadedCount, setLoadedCount] = useState(0);
  const { setProgress } = useLoadingStore();
  
  useEffect(() => {
    let cancelled = false;
    const total = assetsToLoad.length;
    
    const loadAsset = async (src: string) => {
      try {
        if (src.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
          // Загрузка изображения
          await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = src;
          });
        } else if (src.match(/\.(mp3|wav|ogg)$/i)) {
          // Загрузка аудио
          await new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.oncanplaythrough = resolve;
            audio.onerror = reject;
            audio.src = src;
          });
        } else {
          // Другие ресурсы (просто задержка для симуляции)
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        if (!cancelled) {
          setLoadedCount(prev => {
            const newCount = prev + 1;
            setProgress((newCount / total) * 100);
            return newCount;
          });
        }
      } catch (error) {
        console.warn(`Failed to load asset: ${src}`, error);
        if (!cancelled) {
          setLoadedCount(prev => {
            const newCount = prev + 1; // Считаем даже неудачные загрузки
            setProgress((newCount / total) * 100);
            return newCount;
          });
        }
      }
    };
    
    // Загружаем все ассеты параллельно
    assetsToLoad.forEach(loadAsset);
    
    return () => {
      cancelled = true;
    };
  }, [assetsToLoad, setProgress]);
  
  return { loadedCount, total: assetsToLoad.length };
};
```

---

### 3.3 loadingStore.ts - Zustand store
**Файл:** `client/src/stores/loadingStore.ts`

```typescript
import { create } from 'zustand';

interface LoadingState {
  progress: number;
  isComplete: boolean;
  currentPhase: 'street' | 'beach' | 'church' | 'house';
  totalAssets: number;
  loadedAssets: number;
  
  // Actions
  setProgress: (progress: number) => void;
  setIsComplete: (isComplete: boolean) => void;
  setCurrentPhase: (phase: 'street' | 'beach' | 'church' | 'house') => void;
  setTotalAssets: (total: number) => void;
  incrementLoadedAssets: () => void;
  reset: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  progress: 0,
  isComplete: false,
  currentPhase: 'street',
  totalAssets: 0,
  loadedAssets: 0,
  
  setProgress: (progress) => set({ 
    progress: Math.min(Math.max(progress, 0), 100),
    isComplete: progress >= 100
  }),
  
  setIsComplete: (isComplete) => set({ isComplete }),
  
  setCurrentPhase: (phase) => set({ currentPhase: phase }),
  
  setTotalAssets: (total) => set({ totalAssets: total }),
  
  incrementLoadedAssets: () => set((state) => ({ 
    loadedAssets: state.loadedAssets + 1 
  })),
  
  reset: () => set({
    progress: 0,
    isComplete: false,
    currentPhase: 'street',
    totalAssets: 0,
    loadedAssets: 0
  })
}));
```

---

## 4. Стили (CSS Modules)

**Файл:** `client/src/styles/loading.module.css`

```css
/* Контейнер */
.loadingContainer {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #1a1a1a;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Слои фона */
.backgroundContainer {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.woodenTableLayer {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0.3;
}

.postcardLayer {
  position: absolute;
  width: 90%;
  height: 85%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  filter: sepia(0.6) contrast(1.1);
}

.mapLayer {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.routePath {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* Велосипед */
.bicycleContainer {
  position: absolute;
  z-index: 100;
  will-change: transform, left, top;
}

.bicycleShadow {
  position: absolute;
  width: 50px;
  height: 15px;
  background: radial-gradient(ellipse, rgba(0,0,0,0.3) 0%, transparent 70%);
  bottom: -10px;
  left: 7px;
  filter: blur(2px);
}

.bicycleSprite {
  image-rendering: pixelated; /* Для чёткости спрайта */
}

.dustEffect {
  position: absolute;
  width: 30px;
  height: 30px;
  background: radial-gradient(circle, rgba(210,180,140,0.4) 0%, transparent 70%);
  bottom: 0;
  left: -15px;
  filter: blur(3px);
}

/* Фразы */
.phrasesContainer {
  position: absolute;
  bottom: 10%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  text-align: center;
  padding: 0 20px;
}

.phraseText {
  font-family: 'Georgia', serif;
  font-size: 1.5rem;
  color: #4a3728;
  text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
  max-width: 600px;
  line-height: 1.4;
}

/* Маркер локации */
.locationMarker {
  position: absolute;
  top: 15%;
  right: 5%;
  z-index: 200;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.9);
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border: 2px solid #D4AF37;
}

.locationIcon {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.locationName {
  font-family: 'Georgia', serif;
  font-size: 1rem;
  color: #4a3728;
  font-weight: 600;
  text-align: center;
}

/* Прогресс бар */
.progressOverlay {
  position: absolute;
  bottom: 5%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  display: flex;
  align-items: center;
  gap: 12px;
}

.progressBar {
  width: 300px;
  height: 8px;
  background: rgba(255,255,255,0.3);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.5);
}

.progressFill {
  height: 100%;
  background: linear-gradient(90deg, #D4AF37 0%, #FFD700 100%);
  transition: width 0.3s ease-out;
}

.progressText {
  font-family: 'Georgia', serif;
  font-size: 1rem;
  color: #fff;
  min-width: 40px;
  text-align: right;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

/* Адаптивность */
@media (max-width: 768px) {
  .phraseText {
    font-size: 1.2rem;
  }
  
  .progressBar {
    width: 200px;
  }
  
  .locationMarker {
    top: 10%;
    right: 3%;
    padding: 8px 12px;
  }
  
  .locationIcon {
    width: 36px;
    height: 36px;
  }
  
  .locationName {
    font-size: 0.9rem;
  }
}
```

---

## 5. Интеграция в приложение

### 5.1 Подключение в App.tsx
**Файл:** `client/src/App.tsx`

```typescript
import React, { useState, useEffect, Suspense } from 'react';
import SplashScreen from './components/splash/SplashScreen';
import LoadingScreen from './components/loading/LoadingScreen';
import MainGame from './components/game/MainGame';
import { useLoadingStore } from './stores/loadingStore';

// Список всех ресурсов для предзагрузки
const ASSETS_TO_LOAD = [
  // Изображения
  '/assets/images/loading/postcard-bg.png',
  '/assets/images/loading/wooden-table.png',
  '/assets/images/loading/map-castelvento.png',
  '/assets/images/loading/bicycle-sprite.png',
  '/assets/images/loading/location-icons/street-icon.svg',
  '/assets/images/loading/location-icons/beach-icon.svg',
  '/assets/images/loading/location-icons/church-icon.svg',
  '/assets/images/loading/location-icons/house-icon.svg',
  
  // Аудио
  '/assets/audio/loading/bicycle-wheel.mp3',
  '/assets/audio/loading/bicycle-bell.mp3',
  '/assets/audio/loading/ambient-wind.mp3',
  
  // Добавить здесь остальные ресурсы игры
];

function App() {
  const [appState, setAppState] = useState<'splash' | 'loading' | 'game'>('splash');
  const { reset } = useLoadingStore();

  const handleSplashComplete = () => {
    setAppState('loading');
    reset(); // Сброс состояния загрузки
  };

  const handleLoadingComplete = () => {
    setAppState('game');
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {appState === 'splash' && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}
      
      {appState === 'loading' && (
        <LoadingScreen 
          onComplete={handleLoadingComplete}
          assetsToLoad={ASSETS_TO_LOAD}
        />
      )}
      
      {appState === 'game' && (
        <MainGame />
      )}
    </Suspense>
  );
}

export default App;
```

---

## 6. Требования к ассетам

### 6.1 Изображения
| Ассет | Размер | Формат | Описание |
|-------|--------|--------|----------|
| `postcard-bg.png` | 1920×1080 | PNG | Фон старой выцветшей открытки с эффектом потёртостей |
| `wooden-table.png` | 1920×1080 | PNG | Текстура деревянного стола (зернистость, сучки) |
| `map-castelvento.png` | 2400×800 | PNG | Широкая карта маршрута (вид сверху, стиль hand-drawn) |
| `bicycle-sprite.png` | 512×64 | PNG | Спрайт велосипедиста (8 кадров × 64px), вид сбоку |
| `street-icon.svg` | 64×64 | SVG | Иконка улицы (домик с дорогой) |
| `beach-icon.svg` | 64×64 | SVG | Иконка пляжа (зонтик + волны) |
| `church-icon.svg` | 64×64 | SVG | Иконка церкви (купол + крест) |
| `house-icon.svg` | 64×64 | SVG | Иконка дома (труба + окно) |
| `route-path.svg` | 1200×400 | SVG | Пунктирная линия маршрута (золотистый цвет) |

### 6.2 Аудио
| Ассет | Длительность | Формат | Описание |
|-------|--------------|--------|----------|
| `bicycle-wheel.mp3` | 2s (loop) | MP3 | Ритмичный звук крутящихся колёс по мостовой |
| `bicycle-bell.mp3` | 0.5s | MP3 | Короткий звонок при прохождении контрольных точек |
| `ambient-wind.mp3` | 10s (loop) | MP3 | Фоновый шум ветра с лёгким шелестом листьев |

---

## 7. Acceptance Criteria

### 7.1 Функциональные требования
- [ ] Велосипед начинает движение сразу после появления экрана загрузки
- [ ] Велосипед следует точно по SVG пути маршрута
- [ ] Анимация педалирования синхронизирована со скоростью движения
- [ ] При достижении каждой локации (25%, 50%, 75%, 100%) меняется фраза
- [ ] Маркер текущей локации отображается в правом верхнем углу
- [ ] Прогресс бар точно отражает процент загруженных ресурсов
- [ ] Экран автоматически закрывается при 100% загрузке всех ассетов
- [ ] Все изображения и аудио загружаются до начала анимации

### 7.2 Технические требования
- [ ] FPS не ниже 60 на устройствах среднего уровня
- [ ] Отсутствие рывков при движении велосипеда
- [ ] Корректная работа на мобильных устройствах (touch events)
- [ ] Обработка ошибок загрузки ассетов (не блокирует весь процесс)
- [ ] Память не превышает 150MB во время загрузки
- [ ] Поддержка браузеров: Chrome 90+, Firefox 88+, Safari 14+

### 7.3 Визуальные требования
- [ ] Плавный параллакс-эффект между слоями фона
- [ ] Тень под велосипедом меняет размер в зависимости от "высоты"
- [ ] Фразы появляются с плавной анимацией (fade in/out)
- [ ] Цветовая палитра соответствует стилю "старой открытки" (сепия, приглушённые тона)
- [ ] Логотипы локаций соответствуют описанию в дизайн-документации

---

## 8. Edge Cases и обработка ошибок

### 8.1 Ошибка загрузки ассета
```typescript
// В useLoadingProgress.ts
catch (error) => {
  console.warn(`Failed to load asset: ${src}`, error);
  // Продолжаем загрузку остальных, не блокируем процесс
  setLoadedCount(prev => prev + 1);
}
```

### 8.2 Слишком быстрая загрузка
```typescript
// Минимальное время показа экрана (чтобы пользователь успел увидеть анимацию)
const MIN_LOADING_TIME = 3000; // 3 секунды
if (Date.now() - startTime < MIN_LOADING_TIME) {
  await new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME - (Date.now() - startTime)));
}
```

### 8.3 Мобильные устройства (малая память)
```typescript
// В LoadingScreen.tsx
useEffect(() => {
  const isLowEndDevice = navigator.deviceMemory < 4;
  if (isLowEndDevice) {
    // Уменьшаем качество текстур или отключаем параллакс
    setQualityLevel('low');
  }
}, []);
```

---

## 9. Checklist для разработчика

### Подготовка
- [ ] Создать файловую структуру согласно разделу 1.1
- [ ] Подготовить все ассеты (изображения, аудио) согласно разделу 6
- [ ] Установить зависимости: `framer-motion`, `zustand` (если ещё не установлены)

### Реализация компонентов
- [ ] Реализовать `LoadingScreen.tsx` (главный контейнер)
- [ ] Реализовать `TravelingBicycle.tsx` (спрайт анимация)
- [ ] Реализовать `MapBackground.tsx` (параллакс слои)
- [ ] Реализовать `DynamicPhrases.tsx` (смена фраз)
- [ ] Реализовать `LocationMarker.tsx` (маркеры локаций)

### Реализация логики
- [ ] Написать хук `useBicycleAnimation.ts` (расчёт пути)
- [ ] Написать хук `useLoadingProgress.ts` (отслеживание загрузки)
- [ ] Создать `loadingStore.ts` (Zustand store)

### Стили
- [ ] Создать `loading.module.css` со всеми классами
- [ ] Проверить адаптивность на мобильных устройствах

### Интеграция
- [ ] Подключить `LoadingScreen` в `App.tsx`
- [ ] Настроить переход `SplashScreen → LoadingScreen → MainGame`
- [ ] Протестировать полный цикл загрузки

### Тестирование
- [ ] Проверить все 4 локации (street, beach, church, house)
- [ ] Протестировать на разных скоростях интернета (throttling в DevTools)
- [ ] Проверить обработку ошибок загрузки ассетов
- [ ] Замерить FPS (должен быть ≥60)
- [ ] Протестировать на iOS Safari и Android Chrome

---

## 10. Референсный пример готового кода (сокращённая версия)

```typescript
// client/src/components/loading/LoadingScreen.tsx (final version)
import React, { useEffect } from 'react';
import { useLoadingStore } from '../../stores/loadingStore';
import { useBicycleAnimation } from '../../hooks/useBicycleAnimation';
import { useLoadingProgress } from '../../hooks/useLoadingProgress';
import MapBackground from './MapBackground';
import TravelingBicycle from './TravelingBicycle';
import DynamicPhrases from './DynamicPhrases';
import LocationMarker from './LocationMarker';
import styles from '../../styles/loading.module.css';

const ASSETS = [
  '/assets/images/loading/postcard-bg.png',
  '/assets/images/loading/bicycle-sprite.png',
  // ... остальные ассеты
];

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const { progress, isComplete } = useLoadingStore();
  const { position, rotation, currentLocation } = useBicycleAnimation(progress);
  const { loadedCount, total } = useLoadingProgress(ASSETS);

  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(onComplete, 500);
      return () => clearTimeout(timer);
    }
  }, [isComplete, onComplete]);

  return (
    <div className={styles.loadingContainer}>
      <MapBackground progress={progress} />
      <TravelingBicycle position={position} rotation={rotation} currentLocation={currentLocation} />
      <LocationMarker currentLocation={currentLocation} isVisible={progress > 5} />
      <DynamicPhrases progress={progress} currentLocation={currentLocation} />
      <div className={styles.progressOverlay}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <span>{Math.round(progress)}%</span>
      </div>
    </div>
  );
}
```

---

## 11. Дополнительные рекомендации

### Оптимизация производительности
1. Использовать `will-change` CSS свойство для движущихся элементов
2. Применять `transform` вместо `top/left` для анимации позиции
3. Кэшировать вычисления в `useMemo` для тяжёлых операций
4. Lazy load для непрозрачных слоёв фона

### Доступность (a11y)
1. Добавить `role="progressbar"` и `aria-valuenow` для прогресс бара
2. Обеспечить контрастность текста фраз (минимум 4.5:1)
3. Предусмотреть возможность отключения анимаций через `prefers-reduced-motion`

### Локализация
1. Вынести все фразы в отдельный файл переводов (`locales/ru/loading.json`)
2. Поддерживать как минимум русский и английский языки
3. Использовать `i18next` или аналогичную библиотеку для переключения

---

**Примечание:** Данная спецификация не содержит оценок времени и фокусируется исключительно на технической реализации. Все решения должны соответствовать архитектурным принципам проекта, описанным в `docs/ARCHITECTURE.md`.
