# Task 3.3: Cinematic Scene 7-9 (Title Reveal)
## Детальная спецификация реализации

---

## 📋 Обзор задачи

**Название:** Opening Cinematic — Scenes 7-9 (Title Reveal)  
**Тип:** Кинематографическая панорама с анимацией титульного экрана  
**Длительность:** ~25 секунд  
**Приоритет:** P0 (Critical Path)  

---

## 🎬 Сценарий по сценам

### Сцена 7: The Reveal (1:15 - 1:25)
**Длительность:** 10 секунд  
**Действие:** Полная панорама Castelvento, Renzo становится маленькой фигуркой  

#### Визуальные элементы:

**1. Панорама города (Full town panorama)**
- Красные крыши (red rooftops) — десятки домов с черепичными крышами
- Церковная башня (church bell tower) — доминирующий элемент в центре
- Маяк вдали (lighthouse in distance) — слева на горизонте
- Море сверкает (sea sparkling) — справа, солнечные блики на воде
- Чайки летят past camera — передний план, создают глубину
- Солнечные лучи (sun rays) — отражаются на воде и крышах

**2. Движение камеры**
- Начало: Средний план (Renzo еще виден)
- Конец: Широкий план (Renzo — маленькая точка)
- Тип движения: Отъезд + подъем (dolly out + crane up)
- Скорость: Очень плавная, кинематографичная

**3. Параллакс слои (5 уровней)**
```
Layer 1 (foreground): Seagulls flying past camera — fastest
Layer 2 (mid-front): Nearby rooftops, chimneys with smoke
Layer 3 (mid): Church tower, main buildings
Layer 4 (mid-back): Distant houses, lighthouse
Layer 5 (background): Sea, sky, sun — slowest
```

**Техническая реализация:**
```typescript
// components/cinematic/Scene7Reveal.tsx
import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';

export const Scene7Reveal = ({ onComplete }: { onComplete: () => void }) => {
  const cameraControls = useAnimation();

  useEffect(() => {
    const runReveal = async () => {
      // Камера отъезжает и поднимается
      await cameraControls.start({
        scale: [1, 0.4], // Отъезд: объекты становятся меньше
        y: [-100, -400], // Подъем вверх
        x: [0, 50], // Легкое смещение вправо для композиции
        duration: 10,
        ease: "easeInOut"
      });

      onComplete();
    };

    runReveal();
  }, [cameraControls, onComplete]);

  return (
    <motion.div
      className="relative w-full h-full overflow-hidden"
      animate={cameraControls}
      initial={{ scale: 1, x: 0, y: 0 }}
      style={{ transformOrigin: 'center center' }}
    >
      {/* Layer 5: Background - Sea and Sky */}
      <ParallaxLayer
        speed={0.1}
        image="/assets/cinematic/backgrounds/sea_sky_panorama.png"
        position="inset-0"
        zIndex={0}
      />

      {/* Layer 4: Distant elements - Lighthouse, far houses */}
      <ParallaxLayer
        speed={0.3}
        image="/assets/cinematic/backgrounds/distant_elements.png"
        position="bottom-0 left-0 right-0 h-2/3"
        zIndex={1}
      />

      {/* Layer 3: Main town - Church tower, central buildings */}
      <ParallaxLayer
        speed={0.5}
        image="/assets/cinematic/backgrounds/town_center.png"
        position="bottom-0 left-0 right-0 h-1/2"
        zIndex={2}
      >
        {/* Church tower как отдельный элемент для акцента */}
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2">
          <img 
            src="/assets/cinematic/landmarks/church_tower_tall.png" 
            alt="Church tower"
            className="h-64 w-auto"
          />
          {/* Колокольный звон (тихий, вдалеке) */}
          <BellTower chimeInterval={3000} />
        </div>
      </ParallaxLayer>

      {/* Layer 2: Nearby rooftops with chimneys */}
      <ParallaxLayer
        speed={0.7}
        image="/assets/cinematic/backgrounds/nearby_rooftops.png"
        position="bottom-0 left-0 right-0 h-1/3"
        zIndex={3}
      >
        {/* Дымы из труб */}
        {[...Array(8)].map((_, i) => (
          <ChimneySmoke
            key={i}
            position={{
              x: `${20 + i * 10}%`,
              y: `${30 + (i % 3) * 10}%`
            }}
          />
        ))}
      </ParallaxLayer>

      {/* Layer 1: Foreground - Seagulls */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 4 }}>
        {[...Array(6)].map((_, i) => (
          <Seagull
            key={i}
            startSide={i % 2 === 0 ? 'left' : 'right'}
            delay={i * 1.5}
            altitude={20 + Math.random() * 40}
          />
        ))}
      </div>

      {/* Renzo становится маленькой фигуркой */}
      <motion.div
        className="absolute"
        initial={{ 
          bottom: '15%', 
          left: '45%',
          scale: 1 
        }}
        animate={{
          bottom: '8%',
          left: '42%',
          scale: 0.3 // Уменьшается relative to scene
        }}
        transition={{ duration: 10, ease: "easeInOut" }}
      >
        <img 
          src="/assets/cinematic/character/renzo_bike_tiny.png" 
          alt="Renzo (distant)"
          className="w-24 h-auto"
        />
      </motion.div>

      {/* Солнечные лучи (god rays) */}
      <SunRays 
        position={{ x: 70, y: 20 }}
        intensity={0.6}
      />

      {/* Блеск на море (sparkles) */}
      <SeaSparkles 
        area={{ x: 60, y: 50, width: 40, height: 30 }}
        count={20}
      />
    </motion.div>
  );
};

// Компонент параллакс слоя
const ParallaxLayer: React.FC<{
  speed: number;
  image: string;
  position: string;
  zIndex: number;
  children?: React.ReactNode;
}> = ({ speed, image, position, zIndex, children }) => {
  return (
    <motion.div
      className={`absolute ${position}`}
      style={{ 
        backgroundImage: `url(${image})`,
        zIndex
      }}
      animate={{
        x: [0, -100 * speed],
        y: [0, -50 * speed]
      }}
      transition={{ duration: 10, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
};

// Компонент чайки
const Seagull: React.FC<{
  startSide: 'left' | 'right';
  delay: number;
  altitude: number;
}> = ({ startSide, delay, altitude }) => {
  return (
    <motion.div
      className="absolute"
      initial={{
        x: startSide === 'left' ? -100 : '110%',
        y: `${altitude}%`,
        opacity: 0
      }}
      animate={{
        x: startSide === 'left' ? '110%' : -100,
        y: [`${altitude}%`, `${altitude - 10}%`, `${altitude}%`],
        opacity: [0, 1, 1, 0]
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        repeatDelay: 2
      }}
    >
      <img 
        src="/assets/cinematic/animals/seagull.png" 
        alt="Seagull"
        className="w-12 h-auto"
        style={{ filter: 'brightness(0.9)' }}
      />
    </motion.div>
  );
};

// Компонент дыма из трубы
const ChimneySmoke: React.FC<{
  position: { x: string; y: string };
}> = ({ position }) => {
  return (
    <div 
      className="absolute"
      style={{ left: position.x, top: position.y }}
    >
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-6 h-6 bg-gray-300/40 rounded-full blur-md"
          initial={{ 
            y: 0, 
            opacity: 0.6, 
            scale: 0.5 
          }}
          animate={{
            y: -60 - Math.random() * 40,
            opacity: 0,
            scale: 2,
            x: (Math.random() - 0.5) * 40
          }}
          transition={{
            duration: 3 + Math.random(),
            delay: i * 0.6,
            repeat: Infinity
          }}
        />
      ))}
    </div>
  );
};

// Компонент солнечных лучей
const SunRays: React.FC<{
  position: { x: number; y: number };
  intensity: number;
}> = ({ position, intensity }) => {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: '60%',
        height: '60%',
        background: 'radial-gradient(ellipse at center, rgba(255,255,200,0.3) 0%, transparent 70%)',
        transform: 'rotate(45deg)'
      }}
      animate={{
        opacity: [intensity * 0.7, intensity, intensity * 0.7],
        scale: [1, 1.1, 1]
      }}
      transition={{
        duration: 5,
        repeat: Infinity
      }}
    />
  );
};

// Компонент блеска на море
const SeaSparkles: React.FC<{
  area: { x: number; y: number; width: number; height: number };
  count: number;
}> = ({ area, count }) => {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${area.x}%`,
        top: `${area.y}%`,
        width: `${area.width}%`,
        height: `${area.height}%`
      }}
    >
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.5, 0.5]
          }}
          transition={{
            duration: 1 + Math.random(),
            delay: Math.random() * 2,
            repeat: Infinity
          }}
        />
      ))}
    </div>
  );
};
```

**Аудио для сцены 7:**
- Главная тема игры продолжает звучать (полная аранжировка)
- Морской шум (прибой, чайки)
- Отдаленный колокольный звон (церковь)
- Ветер (легкий)
- Звук крыльев чаек (когда пролетают близко)

---

### Сцена 8: Title Card (1:25 - 1:35)
**Длительность:** 10 секунд  
**Действие:** Появление названия "CASTELVENTO 1940s" в стиле акварели  

#### Анимация титула:

**Фаза 1: Pencil Sketch (0-3 сек)**
- Тонкие карандашные линии набрасывают контур букв
- Стиль: hand-drawn sketch, легкие штрихи
- Цвет: graphite gray (#4A4A4A)
- Animation: stroke-dashoffset technique

**Фаза 2: Watercolor Fill (3-7 сек)**
- Акварель заполняет контуры
- Цвета: warm watercolor (terracotta, ochre, sea blue)
- Эффект: paint spreading, bleeding edges
- Texture: paper grain visible

**Фаза 3: Hold & Fade (7-10 сек)**
- Задержка на 3 секунды
- Плавное затухание (fade out)
- Subtitle появляется и исчезает вместе с title

**Текст:**
```
Main Title: CASTELVENTO 1940s
Subtitle Option 1: "Every street has a story."
Subtitle Option 2: "Every life hides a story."
```

**Техническая реализация:**
```typescript
// components/cinematic/Scene8Title.tsx
import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';

export const Scene8Title = ({ onComplete }: { onComplete: () => void }) => {
  const titleControls = useAnimation();
  const [phase, setPhase] = useState<'sketch' | 'fill' | 'hold' | 'fade'>('sketch');

  useEffect(() => {
    const runTitleSequence = async () => {
      // Phase 1: Pencil sketch (3s)
      setPhase('sketch');
      await titleControls.start({
        strokeDashoffset: 0, // Lines draw in
        duration: 3,
        ease: "easeInOut"
      });

      // Phase 2: Watercolor fill (4s)
      setPhase('fill');
      await Promise.all([
        titleControls.start({
          fillOpacity: [0, 1],
          duration: 4,
          ease: "easeOut"
        }),
        // Анимация распространения краски
        watercolorSpread()
      ]);

      // Phase 3: Hold (3s)
      setPhase('hold');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Phase 4: Fade out
      setPhase('fade');
      await titleControls.start({
        opacity: 0,
        duration: 1,
        ease: "easeInOut"
      });

      onComplete();
    };

    runTitleSequence();
  }, [titleControls, onComplete]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Размытый фон панорамы */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/assets/cinematic/backgrounds/town_panorama_blurred.png)',
          filter: 'blur(8px) brightness(0.7)'
        }}
        animate={{ opacity: [1, 0.5] }}
        transition={{ duration: 1 }}
      />

      {/* Основной заголовок */}
      <svg
        viewBox="0 0 800 200"
        className="relative z-10 w-[80%] max-w-4xl"
      >
        <defs>
          {/* Градиент для акварельного эффекта */}
          <linearGradient id="watercolorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C16E5C" /> {/* Terracotta */}
            <stop offset="50%" stopColor="#D4A574" /> {/* Ochre */}
            <stop offset="100%" stopColor="#5B8BA8" /> {/* Sea blue */}
          </linearGradient>

          {/* Текстура бумаги */}
          <pattern id="paperTexture" patternUnits="userSpaceOnUse" width="100" height="100">
            <image href="/assets/textures/watercolor_paper.png" width="100" height="100" />
          </pattern>

          {/* Фильтр для акварельных краев */}
          <filter id="watercolorEdge">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
          </filter>
        </defs>

        {/* Карандашный контур (Phase 1) */}
        <motion.text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-6xl font-bold"
          style={{
            fontFamily: "'Italiana', serif",
            fontSize: '80px',
            letterSpacing: '8px',
            fill: 'none',
            stroke: '#4A4A4A',
            strokeWidth: 2,
            strokeDasharray: 2000,
            strokeDashoffset: 2000
          }}
          animate={titleControls}
        >
          CASTELVENTO
        </motion.text>

        {/* Акварельное заполнение (Phase 2) */}
        <motion.text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-6xl font-bold"
          style={{
            fontFamily: "'Italiana', serif",
            fontSize: '80px',
            letterSpacing: '8px',
            fill: 'url(#watercolorGradient)',
            fillOpacity: 0,
            filter: 'url(#watercolorEdge)',
            mixBlendMode: 'multiply'
          }}
          animate={titleControls}
        >
          CASTELVENTO
        </motion.text>

        {/* Год "1940s" меньшим размером */}
        <motion.text
          x="50%"
          y="75%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-4xl"
          style={{
            fontFamily: "'Caveat', cursive",
            fontSize: '48px',
            fill: '#C16E5C',
            opacity: 0
          }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: ['60%', '75%', '75%', '75%']
          }}
          transition={{
            opacity: { times: [0, 0.3, 0.9, 1], duration: 10 },
            y: { times: [0, 0.3, 0.9, 1], duration: 10 }
          }}
        >
          1940s
        </motion.text>
      </svg>

      {/* Подзаголовок */}
      <motion.div
        className="absolute z-10 mt-32 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: [0, 1, 1, 0],
          y: [30, 0, 0, 0]
        }}
        transition={{
          times: [0, 0.35, 0.85, 1],
          duration: 10,
          ease: "easeInOut"
        }}
        style={{
          fontFamily: "'Caveat', cursive",
          fontSize: '28px',
          color: '#F5F5F5',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          fontStyle: 'italic'
        }}
      >
        "Every street has a story."
      </motion.div>

      {/* Частицы пыли в воздухе (атмосфера) */}
      <FloatingParticles count={30} />
    </div>
  );
};

// Функция распространения акварели
const watercolorSpread = async () => {
  // Имитация распространения краски через canvas или SVG filters
  // Можно использовать библиотеку like paper.js для более сложной симуляции
};

// Компонент плавающих частиц
const FloatingParticles: React.FC<{ count: number }> = ({ count }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/30 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0
          }}
          animate={{
            y: [null, Math.random() * -100],
            opacity: [0, 0.5, 0]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: Math.random() * 5,
            repeat: Infinity
          }}
        />
      ))}
    </div>
  );
};
```

**Аудио для сцены 8:**
- Главная тема достигает кульминации (strings swell)
- Мягкий piano solo
- Почти полная тишина в конце (только ambient)
- Никаких звуковых эффектов на появление текста (сохранять атмосферу)

---

### Сцена 9: Transition (1:35 - 1:40)
**Длительность:** 5 секунд  
**Действие:** Камера спускается к дому Renzo,无缝 переход в геймплей спальни  

#### Требования к переходу:

**1. Движение камеры (Camera descent)**
- Start: Широкая панорама (из сцены 8)
- End: Фокус на конкретном доме (спальня Renzo)
- Motion: Быстрый спуск с zoom in
- Duration: 4 секунды

**2. Match cut technique**
- Exterior shot дома → Interior shot спальни
- Same color palette для seamless transition
- Same camera angle (window position matches)

**3. Preload bedroom scene**
- Загрузить ассеты спальни во время fade title
- Предварительно инициализировать компоненты геймплея
- Игрок получает контроль instant после перехода

**Техническая реализация:**
```typescript
// components/cinematic/Scene9Transition.tsx
import { motion, useAnimation } from 'framer-motion';
import { useEffect, useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';

interface Scene9TransitionProps {
  onComplete: () => void;
  bedroomScene: React.ReactNode;
}

export const Scene9Transition: React.FC<Scene9TransitionProps> = ({
  onComplete,
  bedroomScene
}) => {
  const cameraControls = useAnimation();
  const { setIsGameActive } = useGameStore();

  const executeTransition = useCallback(async () => {
    //快速 спуск камеры к дому
    await cameraControls.start({
      scale: [0.4, 2], // Zoom in
      y: [-400, 200], // Спуск вниз
      x: [50, 0], // Центрирование на доме
      duration: 4,
      ease: "easeIn" // Accelerate into transition
    });

    // Match cut: exterior -> interior
    // Внешний вид окна -> внутренняя комната
    
    // Игрок получает контроль
    setIsGameActive(true);
    
    onComplete();
  }, [cameraControls, onComplete, setIsGameActive]);

  useEffect(() => {
    executeTransition();
  }, [executeTransition]);

  return (
    <motion.div
      className="relative w-full h-full"
      animate={cameraControls}
      initial={{ scale: 0.4, x: 50, y: -400 }}
    >
      {/* Exterior view дома Renzo */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/assets/cinematic/backgrounds/renzo_house_exterior.png)',
          backgroundPosition: 'center center'
        }}
      >
        {/* Окно спальни (target for match cut) */}
        <motion.div
          className="absolute"
          style={{
            top: '40%',
            left: '45%',
            width: '10%',
            height: '15%',
            backgroundColor: 'rgba(255,255,200,0.3)'
          }}
          animate={{
            opacity: [0.3, 0.6, 0],
            scale: [1, 1.5, 0]
          }}
          transition={{ duration: 4, times: [0, 0.7, 1] }}
        />
      </div>

      {/* Interior view спальни (появляется в конце) */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 1] }}
        transition={{ duration: 0.5, delay: 3.5 }}
      >
        {bedroomScene}
      </motion.div>

      {/* Transition overlay (для сглаживания) */}
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0] }}
        transition={{ duration: 4, times: [0, 0.5, 1] }}
      />
    </motion.div>
  );
};
```

**Match cut alignment:**
```typescript
// utils/matchCutCalculator.ts
export function calculateWindowAlignment(
  exteriorWindow: DOMRect,
  interiorWindow: DOMRect
) {
  // Вычислить transform для совмещения окон
  const scaleX = interiorWindow.width / exteriorWindow.width;
  const scaleY = interiorWindow.height / exteriorWindow.height;
  const translateX = interiorWindow.left - exteriorWindow.left * scaleX;
  const translateY = interiorWindow.top - exteriorWindow.top * scaleY;

  return {
    transform: `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`
  };
}
```

**Аудио для сцены 9:**
- Музыка затихает (fade out over 3 seconds)
- Ambient меняется с уличного на комнатный
- Появляются звуки комнаты:
  - Тиканье часов
  - Отдаленный шум улицы (приглушенный)
  - Скрип кровати (когда игрок получает контроль)
- Переход должен быть незаметным для игрока

---

## 🎨 Требования к ассетам

### Изображения:
```
/assets/cinematic/
├── backgrounds/
│   ├── sea_sky_panorama.png (4096x2160, ultra-wide)
│   ├── distant_elements.png (2560x1440)
│   ├── town_center.png (2560x1440)
│   ├── nearby_rooftops.png (1920x1080)
│   ├── renzo_house_exterior.png (1920x1080)
│   └── town_panorama_blurred.png (1920x1080, Gaussian blur 8px)
├── landmarks/
│   └── church_tower_tall.png (400x800)
├── animals/
│   └── seagull.png (спрайт 4 кадра махания крыльями)
├── effects/
│   ├── sun_rays_overlay.png (бесшовная текстура)
│   └── watercolor_paper.png (текстура бумаги 512x512)
└── character/
    └── renzo_bike_tiny.png (96x96)

/assets/bedroom/
├── bedroom_interior.png (1920x1080)
├── window_view.png (совпадает с exterior window position)
└── props/ (мебель, предметы)
```

### Шрифты:
```
/fonts/
├── Italiana-Regular.ttf (для основного заголовка)
└── Caveat-Regular.ttf (для подзаголовка и года)
```

### Аудио:
```
/audio/sfx/
├── seagull_wings_close.mp3
├── church_bell_distant.mp3 (колокол, эхо)
├── wind_gentle.mp3
└── transition/
    ├── music_swells.mp3 (кульминация главной темы)
    ├── fade_to_ambient.mp3
    └── bedroom_ambience.mp3 (часы, приглушенная улица)
```

---

## ⚙️ Техническая архитектура

### Оркестрация всех трех сцен:
```typescript
// components/cinematic/OpeningCinematicPart2.tsx
import { useState, useCallback } from 'react';
import { Scene7Reveal } from './Scene7Reveal';
import { Scene8Title } from './Scene8Title';
import { Scene9Transition } from './Scene9Transition';
import { BedroomScene } from '@/scenes/BedroomScene';
import { useGameStore } from '@/stores/gameStore';

export const OpeningCinematicPart2 = () => {
  const [currentScene, setCurrentScene] = useState(7);
  const { setIsGameActive } = useGameStore();

  const handleScene7Complete = useCallback(() => {
    setCurrentScene(8);
  }, []);

  const handleScene8Complete = useCallback(() => {
    setCurrentScene(9);
  }, []);

  const handleScene9Complete = useCallback(() => {
    setIsGameActive(true);
    console.log('Cinematic complete, gameplay active');
  }, [setIsGameActive]);

  return (
    <div className="fixed inset-0 w-full h-full">
      {currentScene === 7 && (
        <Scene7Reveal onComplete={handleScene7Complete} />
      )}
      {currentScene === 8 && (
        <Scene8Title onComplete={handleScene8Complete} />
      )}
      {currentScene === 9 && (
        <Scene9Transition 
          onComplete={handleScene9Complete}
          bedroomScene={<BedroomScene />}
        />
      )}
    </div>
  );
};
```

### Store для состояния игры:
```typescript
// stores/gameStore.ts
import { create } from 'zustand';

interface GameState {
  isGameActive: boolean;
  currentLocation: 'bedroom' | null;
  cinematicComplete: boolean;
  setIsGameActive: (active: boolean) => void;
  setCurrentLocation: (location: 'bedroom' | 'street' | 'beach') => void;
  setCinematicComplete: (complete: boolean) => void;
}

export const useGameStore = create<GameState>((set) => ({
  isGameActive: false,
  currentLocation: null,
  cinematicComplete: false,
  
  setIsGameActive: (active) => set({ isGameActive: active }),
  setCurrentLocation: (location) => set({ currentLocation: location }),
  setCinematicComplete: (complete) => set({ cinematicComplete: complete })
}));
```

---

## ✅ Acceptance Criteria

### Функциональные:
- [ ] Сцена 7 показывает полную панораму Castelvento
- [ ] Присутствуют все элементы: красные крыши, церковь, маяк, море
- [ ] Чайки летят через экран (передний план)
- [ ] Солнечные лучи видны на воде
- [ ] Renzo становится маленькой фигуркой к концу сцены
- [ ] Сцена 8 показывает анимацию титула
- [ ] Карандашный набросок появляется за 3 секунды
- [ ] Акварельное заполнение происходит за 4 секунды
- [ ] Подзаголовок появляется и исчезает корректно
- [ ] Сцена 9 выполняет переход к спальне
- [ ] Match cut работает seamlessly (окно совпадает)
- [ ] Игрок получает контроль сразу после перехода

### Технические:
- [ ] 60 FPS на desktop во время панорамы
- [ ] Параллакс слои движутся с разной скоростью
- [ ] SVG анимация титула использует stroke-dashoffset
- [ ] Ассеты спальни preload'ятся во время сцены 8
- [ ] Переход между сценами плавный (crossfade)
- [ ] Поддержка 4K resolution для панорамы
- [ ] Mobile optimization (упрощенные эффекты)

### Визуальные:
- [ ] Панорама breathtaking и detailed
- [ ] Титульная анимация feels hand-crafted
- [ ] Акварельный стиль соответствует aesthetic игры
- [ ] Цветовая палитра теплая (morning light)
- [ ] Переход invisible для игрока

### Аудио:
- [ ] Главная тема достигает кульминации в сцене 8
- [ ] Колокольный звон тихий и далекий
- [ ] Переход аудио от exterior к interior незаметный
- [ ] Никаких резких изменений громкости

---

## 🔧 Edge Cases & Обработка ошибок

### 1. Панорама не загружается полностью:
```typescript
// Progressive loading
const [loadingProgress, setLoadingProgress] = useState(0);

useEffect(() => {
  const loadLayers = async () => {
    const layers = ['background', 'distant', 'center', 'rooftops'];
    for (let i = 0; i < layers.length; i++) {
      await preloadLayer(layers[i]);
      setLoadingProgress((i + 1) / layers.length * 100);
    }
  };
  loadLayers();
}, []);
```

### 2. Шрифты не загрузились:
```css
/* Fallback fonts */
.title-font {
  font-family: 'Italiana', 'Times New Roman', serif;
  font-display: swap;
}
```

### 3. Match cut не совпадает:
```typescript
// Dynamic alignment calculation
useEffect(() => {
  const exteriorRect = exteriorWindowRef.current?.getBoundingClientRect();
  const interiorRect = interiorWindowRef.current?.getBoundingClientRect();
  
  if (exteriorRect && interiorRect) {
    const alignment = calculateWindowAlignment(exteriorRect, interiorRect);
    applyTransform(alignment);
  }
}, []);
```

### 4. Игрок пытается взаимодействовать во время перехода:
```typescript
// Block input during transition
useEffect(() => {
  if (isTransitioning) {
    document.body.style.pointerEvents = 'none';
  } else {
    document.body.style.pointerEvents = 'auto';
  }
  
  return () => {
    document.body.style.pointerEvents = 'auto';
  };
}, [isTransitioning]);
```

---

## 📝 Checklist для разработчика

### Подготовка:
- [ ] Получить панорамное изображение города (4K+)
- [ ] Создать SVG для титула с правильными шрифтами
- [ ] Подготовить текстуру акварельной бумаги
- [ ] Записать главную тему музыки (full arrangement)

### Реализация:
- [ ] Реализовать Scene7Reveal с 5 параллакс слоями
- [ ] Добавить анимацию чаек и дыма из труб
- [ ] Создать эффект солнечных лучей и блеска на море
- [ ] Реализовать Scene8Title с stroke-draw и watercolor fill
- [ ] Добавить subtitles с правильной типографикой
- [ ] Реализовать Scene9Transition с match cut
- [ ] Preload bedroom сцены во время титула

### Тестирование:
- [ ] Проверить FPS на слабом hardware
- [ ] Тестировать на разных разрешениях (1080p, 4K, mobile)
- [ ] Проверить синхронизацию аудио и видео
- [ ] Убедиться что переход в геймплей seamless
- [ ] Проверить что игрок получает контроль корректно

### Оптимизация:
- [ ] Сжать панорамное изображение (TinyPNG)
- [ ] Использовать WebP format где возможно
- [ ] Оптимизировать SVG для титула
- [ ] Добавить lazy loading для дальних слоев

---

**Статус:** Готово к реализации  
**Версия спецификации:** 1.0  
**Дата создания:** 2024
