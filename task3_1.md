# Task 3.1: Cinematic Scene 1-3 (Black Screen → Bicycle Ride)
## Детальная спецификация реализации

---

## 📋 Обзор задачи

**Название:** Opening Cinematic — Scenes 1-3  
**Тип:** Анимационная катсцена с аудио-синхронизацией  
**Длительность:** ~30 секунд  
**Приоритет:** P0 (Critical Path)  

---

## 🎬 Сценарий по сценам

### Сцена 1: Black Screen (0:00 - 0:05)
**Длительность:** 5 секунд  
**Визуал:** Полностью черный экран без каких-либо элементов  
**Аудио последовательность:**
```
0:00 - 0:01: Тишина (полная)
0:01 - 0:02: Звук морских волн (fade in 0.5s)
0:02 - 0:03: Пение птиц (далекое, эхо)
0:03 - 0:05: Звук велосипедной цепи (приближается)
```

**Техническая реализация:**
```typescript
// components/cinematic/Scene1BlackScreen.tsx
import { useEffect, useRef } from 'react';
import { useAudioStore } from '@/stores/audioStore';
import { Howl } from 'howler';

export const Scene1BlackScreen = ({ onComplete }: { onComplete: () => void }) => {
  const { playSound, setVolume } = useAudioStore();
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    // Очищаем все предыдущие таймауты
    return () => timeoutsRef.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const timeline = [
      { time: 0, action: () => {} }, // Черный экран
      { 
        time: 1000, 
        action: () => {
          playSound('waves', { volume: 0, fadeTo: 0.7, duration: 500 });
        }
      },
      { 
        time: 2000, 
        action: () => {
          playSound('birds', { volume: 0.3, distance: 'far' });
        }
      },
      { 
        time: 3000, 
        action: () => {
          playSound('bike_chain', { volume: 0, fadeTo: 0.6, duration: 1000 });
        }
      },
      { 
        time: 5000, 
        action: onComplete 
      }
    ];

    timeline.forEach(({ time, action }) => {
      const timeout = setTimeout(action, time);
      timeoutsRef.current.push(timeout);
    });
  }, [onComplete, playSound]);

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Полностью черный экран без элементов */}
    </div>
  );
};
```

**Аудио файлы:**
- `audio/sfx/waves_ambient.mp3` — цикл морских волн (3 сек)
- `audio/sfx/birds_distant.mp3` — птицы на расстоянии (5 сек)
- `audio/sfx/bicycle_chain_close.mp3` — звук цепи вблизи (2 сек)

---

### Сцена 2: The Wheel (0:05 - 0:15)
**Длительность:** 10 секунд  
**Камера:** Low-angle shot (нижний ракурс), фокус на колесе велосипеда  
**Визуальные элементы:**

#### Слои композиции (снизу вверх):
1. **Cobblestone Ground** — брусчатка с текстурой
2. **Wheel Shadow** — тень от колеса (движется)
3. **Bicycle Wheel** — основное колесо с анимацией вращения
4. **Spokes Blur** — размытие спиц при скорости
5. **Sun Glint** — блики солнца на металле (периодические)
6. **Dust Particles** — частицы пыли (particle system)

**Анимации:**
```typescript
// components/cinematic/Scene2Wheel.tsx
import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';

export const Scene2Wheel = ({ onComplete }: { onComplete: () => void }) => {
  const controls = useAnimation();
  
  useEffect(() => {
    const runAnimation = async () => {
      // Появление колеса (fade in)
      await controls.start({
        opacity: 1,
        duration: 0.5,
        ease: "easeIn"
      });

      // Вращение колеса с ускорением
      await controls.start({
        rotate: 360 * 8, // 8 полных оборотов
        duration: 9.5,
        ease: "easeOut"
      });

      // Блики солнца (пульсация)
      for (let i = 0; i < 3; i++) {
        await controls.start(
          { scale: 1.2, opacity: 0.8 },
          { duration: 0.3, delay: i * 2 }
        );
        await controls.start(
          { scale: 1, opacity: 0.4 },
          { duration: 0.3 }
        );
      }

      onComplete();
    };

    runAnimation();
  }, [controls, onComplete]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-amber-100 to-amber-200">
      {/* Брусчатка */}
      <motion.div
        className="absolute bottom-0 w-full h-1/3 bg-cobblestone-pattern"
        initial={{ x: 0 }}
        animate={{ x: -200 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      {/* Тень колеса */}
      <motion.div
        className="absolute bottom-[10%] left-1/2 w-32 h-8 bg-black/30 rounded-full blur-md"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.4, 0.3]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Основное колесо */}
      <motion.div
        className="absolute bottom-[15%] left-1/2 -translate-x-1/2 w-64 h-64"
        animate={controls}
        initial={{ opacity: 0 }}
      >
        <img 
          src="/assets/cinematic/scenes/wheel_base.png" 
          alt="Bicycle wheel"
          className="w-full h-full object-contain"
        />
        
        {/* Спицы с размытием */}
        <motion.div
          className="absolute inset-0"
          style={{ filter: 'blur(2px)' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <img 
            src="/assets/cinematic/scenes/wheel_spokes.png" 
            alt="Spokes"
            className="w-full h-full object-contain"
          />
        </motion.div>

        {/* Блики */}
        <motion.div
          className="absolute top-0 right-0 w-16 h-16 bg-gradient-radial from-white/80 to-transparent rounded-full"
          animate={{
            opacity: [0.4, 0.8, 0.4],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        />
      </motion.div>

      {/* Частицы пыли */}
      <ParticleEmitter
        count={20}
        direction="up-right"
        speed={0.5}
        color="#D4A574"
        size={2}
      />
    </div>
  );
};
```

**Particle System для пыли:**
```typescript
// components/effects/ParticleEmitter.tsx
interface ParticleEmitterProps {
  count: number;
  direction: 'up' | 'up-right' | 'left';
  speed: number;
  color: string;
  size: number;
}

export const ParticleEmitter: React.FC<ParticleEmitterProps> = ({
  count,
  direction,
  speed,
  color,
  size
}) => {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: 80 + Math.random() * 20,
    vx: direction === 'up-right' ? Math.random() * 2 : direction === 'left' ? -Math.random() * 2 : 0,
    vy: -Math.random() * speed - 0.5,
    opacity: Math.random() * 0.5 + 0.2,
    size: size * (Math.random() * 0.5 + 0.5)
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            backgroundColor: color,
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          initial={{ opacity: particle.opacity, y: 0 }}
          animate={{
            opacity: [particle.opacity, 0],
            x: particle.vx * 10,
            y: particle.vy * 20
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}
    </div>
  );
};
```

**Аудио:**
- Продолжение звука волн (фоновое)
- Звук колеса по брусчатке (ритмичный стук)
- Металлический скрип спиц (периодический)

---

### Сцена 3: The Ride (0:15 - 0:30)
**Длительность:** 15 секунд  
**Камера:** Следует за ногами/педалями, море видно вдали  
**Композиция кадра:**

```
┌─────────────────────────────────────┐
│           SEA (background)          │
│         ~~~~~~~~~~~~~~~~            │
│                                     │
│    [House silhouettes in distance]  │
│                                     │
├─────────────────────────────────────┤
│         COBBLESTONE STREET          │
│                                     │
│      [Legs & Pedals - Center]       │
│         ╱|                          │
│        ╱ |  ← Rolled-up pants       │
│       ╱  |     White socks          │
│      [Shoes]                        │
│         O  ← Pedal                  │
│                                     │
│    [Handlebars with bag]            │
│         ___                         │
│        |   | ← Leather bag          │
│         ‾‾‾                         │
└─────────────────────────────────────┘
```

**Визуальные элементы:**
1. **Ноги в движении** — анимация педалирования
2. **Одежда периода 1940-х:**
   - Закатанные брюки (rolled-up pants)
   - Белые носки (white socks)
   - Старые туфли (old leather shoes)
3. **Руки на руле** — кисти рук в перчатках/без
4. **Сумка на руле** — кожаная сумка почтальона
5. **Море на заднем плане** — параллакс эффект

**Анимация педалирования:**
```typescript
// components/cinematic/Scene3Ride.tsx
import { motion, useCycle } from 'framer-motion';

export const Scene3Ride = ({ onComplete }: { onComplete: () => void }) => {
  const [pedalPhase, cyclePedalPhase] = useCycle(0, 180);

  useEffect(() => {
    const interval = setInterval(() => {
      cyclePedalPhase();
    }, 300); // Скорость педалирования

    const completeTimer = setTimeout(onComplete, 15000);

    return () => {
      clearInterval(interval);
      clearTimeout(completeTimer);
    };
  }, [cyclePedalPhase, onComplete]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Небо и море (параллакс) */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-200 to-amber-100"
        animate={{ x: [0, -50, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {/* Море */}
        <div className="absolute bottom-1/3 w-full h-1/4">
          <motion.img
            src="/assets/cinematic/backgrounds/sea_distant.png"
            alt="Sea"
            className="w-full h-full object-cover"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>

        {/* Дома на горизонте */}
        <motion.div
          className="absolute bottom-1/3 left-0 right-0 h-32"
          style={{ backgroundImage: 'url(/assets/cinematic/backgrounds/town_silhouette.png)' }}
          animate={{ x: [0, -100, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      {/* Брусчатка (движется влево) */}
      <motion.div
        className="absolute bottom-0 w-[200%] h-1/3 bg-cobblestone-texture"
        animate={{ x: [0, -500] }}
        transition={{ duration: 15, ease: "linear" }}
      />

      {/* Ноги и педали */}
      <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2">
        {/* Левая нога */}
        <motion.div
          className="absolute"
          animate={{ rotate: pedalPhase }}
          transition={{ duration: 0.3, ease: "linear" }}
          style={{ originY: 0.8 }}
        >
          <img src="/assets/cinematic/character/leg_left.png" alt="Left leg" />
        </motion.div>

        {/* Правая нога */}
        <motion.div
          className="absolute"
          animate={{ rotate: pedalPhase + 180 }}
          transition={{ duration: 0.3, ease: "linear" }}
          style={{ originY: 0.8 }}
        >
          <img src="/assets/cinematic/character/leg_right.png" alt="Right leg" />
        </motion.div>

        {/* Педали */}
        <motion.div
          className="absolute bottom-0"
          animate={{ rotate: pedalPhase }}
        >
          <img src="/assets/cinematic/props/pedals.png" alt="Pedals" />
        </motion.div>
      </div>

      {/* Руки на руле */}
      <motion.div
        className="absolute bottom-[40%] left-1/2 -translate-x-1/2"
        animate={{ y: [0, 2, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        <img src="/assets/cinematic/character/hands_handlebars.png" alt="Hands on handlebars" />
        
        {/* Сумка */}
        <motion.img
          src="/assets/cinematic/props/leather_bag.png"
          alt="Leather bag"
          className="absolute -bottom-8 left-1/2 -translate-x-1/2"
          animate={{ rotate: [0, 2, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      </motion.div>

      {/* Эффект скорости (motion lines) */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(255,255,255,0.1) 50px, rgba(255,255,255,0.1) 100px)'
        }}
        animate={{ x: [0, -100] }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
};
```

**Аудио для сцены 3:**
- Звук педалей (ритмичный)
- Дыхание велосипедиста (легкое)
- Усиливающийся звук моря
- Отдаленные крики чаек

---

## 🎨 Требования к ассетам

### Необходимые изображения:
```
/assets/cinematic/
├── scenes/
│   ├── wheel_base.png (512x512, PNG с прозрачностью)
│   ├── wheel_spokes.png (512x512, PNG с прозрачностью)
│   └── cobblestone_pattern.png (бесшовная текстура 1024x1024)
├── backgrounds/
│   ├── sea_distant.png (1920x1080)
│   └── town_silhouette.png (1920x400)
├── character/
│   ├── leg_left.png (256x512)
│   ├── leg_right.png (256x512)
│   └── hands_handlebars.png (512x256)
└── props/
    ├── pedals.png (128x128)
    └── leather_bag.png (256x256)
```

### Аудио файлы:
```
/audio/sfx/
├── waves_ambient.mp3 (3 сек, loop)
├── birds_distant.mp3 (5 сек, loop)
├── bicycle_chain_close.mp3 (2 сек, loop)
├── wheel_on_cobblestone.mp3 (ритмичный, 1 сек, loop)
└── metal_squeak.mp3 (короткий, 0.3 сек)
```

---

## ⚙️ Техническая архитектура

### Компоненты:
```
src/
├── components/
│   └── cinematic/
│       ├── OpeningCinematic.tsx (оркестратор)
│       ├── Scene1BlackScreen.tsx
│       ├── Scene2Wheel.tsx
│       ├── Scene3Ride.tsx
│       └── SceneTransition.tsx
├── stores/
│   └── audioStore.ts (Zustand store для аудио)
└── assets/
    └── cinematic/ (все ресурсы)
```

### State Management:
```typescript
// stores/cinematicStore.ts
import { create } from 'zustand';

interface CinematicState {
  currentScene: number;
  isPlaying: boolean;
  progress: number;
  setCurrentScene: (scene: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setProgress: (progress: number) => void;
}

export const useCinematicStore = create<CinematicState>((set) => ({
  currentScene: 0,
  isPlaying: false,
  progress: 0,
  setCurrentScene: (scene) => set({ currentScene: scene }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setProgress: (progress) => set({ progress })
}));
```

### Аудио менеджер:
```typescript
// stores/audioStore.ts
import { create } from 'zustand';
import { Howl, Howler } from 'howler';

interface AudioState {
  sounds: Record<string, Howl>;
  masterVolume: number;
  loadSounds: () => Promise<void>;
  playSound: (name: string, options?: PlayOptions) => void;
  stopSound: (name: string) => void;
  setMasterVolume: (volume: number) => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  sounds: {},
  masterVolume: 1,

  loadSounds: async () => {
    const sounds = {
      waves: new Howl({
        src: ['/audio/sfx/waves_ambient.mp3'],
        loop: true,
        volume: 0
      }),
      birds: new Howl({
        src: ['/audio/sfx/birds_distant.mp3'],
        loop: true,
        volume: 0.3
      }),
      bike_chain: new Howl({
        src: ['/audio/sfx/bicycle_chain_close.mp3'],
        loop: true,
        volume: 0
      })
    };

    set({ sounds });
  },

  playSound: (name, options = {}) => {
    const { sounds } = get();
    const sound = sounds[name];
    
    if (!sound) return;

    if (options.fadeTo !== undefined) {
      sound.fade(sound.volume(), options.fadeTo, options.duration || 1000);
    } else {
      sound.play();
    }
  },

  stopSound: (name) => {
    const { sounds } = get();
    sounds[name]?.stop();
  },

  setMasterVolume: (volume) => {
    Howler.volume(volume);
    set({ masterVolume: volume });
  }
}));
```

---

## ✅ Acceptance Criteria

### Функциональные:
- [ ] Сцена 1 начинается с полностью черного экрана
- [ ] Аудио появляется в правильной последовательности (волны → птицы → велосипед)
- [ ] Сцена 2 показывает колесо с нижнего ракурса
- [ ] Колесо вращается плавно с эффектом размытия спиц
- [ ] Присутствуют блики солнца на металле
- [ ] Частицы пыли поднимаются от колеса
- [ ] Сцена 3 показывает ноги на педалях
- [ ] Одежда соответствует периоду 1940-х
- [ ] Море видно на заднем плане
- [ ] Все переходы между сценами плавные (fade/crossfade)

### Технические:
- [ ] FPS не падает ниже 60 на целевых устройствах
- [ ] Аудио синхронизировано с визуалом (погрешность < 100ms)
- [ ] Все анимации используют GPU acceleration (transform, opacity)
- [ ] Ассеты оптимизированы (WebP для изображений, MP3 для аудио)
- [ ] Поддержка мобильных устройств (touch events, ориентация)
- [ ] Корректная работа в Safari, Chrome, Firefox

### Визуальные:
- [ ] Стиль соответствует watercolor/pencil aesthetic игры
- [ ] Цветовая палитра теплая (amber, sky blue, cobblestone gray)
- [ ] Периодические детали точны (велосипед 1940-х, одежда)
- [ ] Параллакс эффект работает корректно
- [ ] Motion blur применен где необходимо

---

## 🔧 Edge Cases & Обработка ошибок

### 1. Аудио не загружается:
```typescript
try {
  await sound.load();
} catch (error) {
  console.warn(`Failed to load sound: ${name}`, error);
  // Продолжить без звука или использовать fallback
}
```

### 2. Низкая производительность:
```typescript
// Detect low-end devices
const isLowEnd = navigator.hardwareConcurrency <= 4;

if (isLowEnd) {
  // Упростить частицы, уменьшить количество слоев
  setParticleCount(10); // вместо 20
  disableMotionBlur();
}
```

### 3. Автовоспроизведение аудио заблокировано:
```typescript
// Требует взаимодействия пользователя
useEffect(() => {
  const handleFirstInteraction = () => {
    Howler.ctx.resume();
    document.removeEventListener('click', handleFirstInteraction);
  };
  
  document.addEventListener('click', handleFirstInteraction);
}, []);
```

### 4. Неправильное соотношение сторон:
```css
/* Сохранять композицию на разных экранах */
.cinematic-container {
  aspect-ratio: 16/9;
  object-fit: cover;
  max-width: 100%;
  max-height: 100vh;
}
```

---

## 📝 Checklist для разработчика

### Подготовка:
- [ ] Получить все аудио файлы от звукового дизайнера
- [ ] Получить спрайты колеса и ног от художника
- [ ] Проверить лицензии на шрифты (если используются)
- [ ] Создать структуру папок в проекте

### Реализация:
- [ ] Настроить Zustand store для аудио
- [ ] Реализовать Scene1BlackScreen
- [ ] Реализовать Scene2Wheel с particle system
- [ ] Реализовать Scene3Ride с анимацией педалирования
- [ ] Добавить переходы между сценами
- [ ] Интегрировать аудио синхронизацию

### Тестирование:
- [ ] Проверить на desktop (Chrome, Firefox, Safari)
- [ ] Проверить на mobile (iOS Safari, Android Chrome)
- [ ] Проверить работу без звука (mute)
- [ ] Проверить при низкой производительности
- [ ] Измерить FPS во время воспроизведения
- [ ] Проверить синхронизацию аудио/видео

### Оптимизация:
- [ ] Сжать все изображения (TinyPNG/Squoosh)
- [ ] Оптимизировать аудио битрейт
- [ ] Добавить lazy loading для тяжелых ассетов
- [ ] Проверить memory leaks

### Финализация:
- [ ] Code review
- [ ] Обновить документацию
- [ ] Добавить комментарии к сложным участкам кода
- [ ] Создать storybook demos (опционально)

---

## 🎯 Пример готового кода (полная интеграция)

```typescript
// components/cinematic/OpeningCinematic.tsx
import { useState, useCallback } from 'react';
import { Scene1BlackScreen } from './Scene1BlackScreen';
import { Scene2Wheel } from './Scene2Wheel';
import { Scene3Ride } from './Scene3Ride';
import { useCinematicStore } from '@/stores/cinematicStore';
import { useAudioStore } from '@/stores/audioStore';

export const OpeningCinematicPart1 = () => {
  const [currentScene, setCurrentScene] = useState(1);
  const { setIsPlaying } = useCinematicStore();
  const { loadSounds } = useAudioStore();

  // Предзагрузка аудио при монтировании
  useEffect(() => {
    loadSounds();
    setIsPlaying(true);
    return () => setIsPlaying(false);
  }, [loadSounds, setIsPlaying]);

  const handleScene1Complete = useCallback(() => {
    setCurrentScene(2);
  }, []);

  const handleScene2Complete = useCallback(() => {
    setCurrentScene(3);
  }, []);

  const handleScene3Complete = useCallback(() => {
    // Переход к следующей части катсцены или геймплею
    console.log('Part 1 complete, transitioning...');
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full">
      {currentScene === 1 && (
        <Scene1BlackScreen onComplete={handleScene1Complete} />
      )}
      {currentScene === 2 && (
        <Scene2Wheel onComplete={handleScene2Complete} />
      )}
      {currentScene === 3 && (
        <Scene3Ride onComplete={handleScene3Complete} />
      )}
    </div>
  );
};
```

---

## 📚 Ресурсы для разработки

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Howler.js Audio Library](https://github.com/goldfire/howler.js)
- [Zustand State Management](https://github.com/pmndrs/zustand)
- [CSS Animation Best Practices](https://web.dev/animations/)
- [Web Audio API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

---

**Статус:** Готово к реализации  
**Версия спецификации:** 1.0  
**Дата создания:** 2024
