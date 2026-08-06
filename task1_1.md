# Task 1.1: Splash Screen Implementation (Black Screen → Logo)

## 📌 Общая информация

**Задача:** Создать начальный splash screen, который воспроизводится при загрузке приложения.  
**Приоритет:** P0 (Critical Path)  
**Расположение в клиенте:** `client/src/screens/SplashScreen/`  
**Основной компонент:** `SplashScreen.tsx`  

---

## 🎯 Цель задачи

Реализовать атмосферный загрузочный экран продолжительностью ~5 секунд без UI элементов, состоящий из:
1. Чёрного экрана при старте
2. Последовательного воспроизведения звуков (волны → велосипедный звонок)
3. Анимации появления логотипа студии в стиле карандашного наброска
4. Эффекта заполнения логотипа акварелью
5. Плавного затухания и перехода к Loading Screen

---

## 📁 Структура файлов

Создать следующую структуру файлов в директории `client/src/`:

```
client/src/
├── screens/
│   └── SplashScreen/
│       ├── SplashScreen.tsx          # Основной компонент
│       ├── SplashScreen.styles.ts    # Стили (если нужны)
│       └── index.ts                  # Экспорт компонента
├── components/
│   └── Logo/
│       ├── Logo.tsx                  # Компонент логотипа
│       └── Logo.styles.ts            # Стили логотипа
├── assets/
│   ├── images/
│   │   └── logo-outline.svg          # SVG контур логотипа (карандашный)
│   └── audio/
│       ├── waves.mp3                 # Звук волн
│       └── bicycle-bell.mp3          # Звук велосипедного звонка
└── hooks/
    └── useSplashAnimation.ts         # Хук управления анимацией
```

---

## 🔧 Технические требования

### 1. Создание основного компонента SplashScreen.tsx

**Файл:** `client/src/screens/SplashScreen/SplashScreen.tsx`

**Зависимости:**
- `react` — `useState`, `useEffect`, `useRef`
- `framer-motion` — `motion`, `useAnimation`, `AnimatePresence`
- `howler` — `Howl` для управления аудио
- `zustand` — для доступа к store (опционально, для отслеживания состояния загрузки)

**Логика компонента:**

```typescript
// Псевдокод структуры
function SplashScreen({ onComplete }: { onComplete: () => void }) {
  // Состояния
  const [phase, setPhase] = useState<'black' | 'waves' | 'bell' | 'logo-draw' | 'logo-fill' | 'fade-out'>('black');
  
  // Тайминги
  // 0s: чёрный экран
  // 1s: звук волн
  // 2s: звук звонка
  // 2s+: начало анимации логотипа (карандашный набросок)
  // 3s+: заполнение акварелью (1 секунда)
  // 4s: удержание
  // 5s: начало fade-out
  
  useEffect(() => {
    // Управление последовательностью фаз через setTimeout
  }, [phase]);
  
  return (
    <div className="splash-screen">
      <AnimatePresence>
        {phase !== 'fade-out' && (
          <Logo phase={phase} />
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

### 2. Реализация хука useSplashAnimation.ts

**Файл:** `client/src/hooks/useSplashAnimation.ts`

**Назначение:** Инкапсуляция логики таймингов и последовательности анимаций.

**Требования к реализации:**

```typescript
export function useSplashAnimation(onComplete: () => void) {
  const [phase, setPhase] = useState<SplashPhase>('black');
  const controls = useAnimation();
  
  // Инициализация аудио (презагрузка)
  const wavesSound = useRef<Howl | null>(null);
  const bellSound = useRef<Howl | null>(null);
  
  useEffect(() => {
    // Создание Howl объектов
    wavesSound.current = new Howl({
      src: ['/assets/audio/waves.mp3'],
      preload: true,
      volume: 0.8,
    });
    
    bellSound.current = new Howl({
      src: ['/assets/audio/bicycle-bell.mp3'],
      preload: true,
      volume: 0.9,
    });
    
    // Запуск последовательности
    startSequence();
    
    return () => {
      // Очистка таймеров
    };
  }, []);
  
  const startSequence = () => {
    // Фаза 1: Чёрный экран (0-1s)
    setTimeout(() => {
      setPhase('waves');
      wavesSound.current?.play();
    }, 1000);
    
    // Фаза 2: Звук звонка (1-2s)
    setTimeout(() => {
      setPhase('bell');
      bellSound.current?.play();
    }, 2000);
    
    // Фаза 3: Начало отрисовки логотипа (2s)
    setTimeout(() => {
      setPhase('logo-draw');
      controls.start('draw');
    }, 2000);
    
    // Фаза 4: Заполнение акварелью (3s, длительность 1s)
    setTimeout(() => {
      setPhase('logo-fill');
      controls.start('fill');
    }, 3000);
    
    // Фаза 5: Удержание (4s)
    setTimeout(() => {
      setPhase('hold');
    }, 4000);
    
    // Фаза 6: Fade-out (5s)
    setTimeout(() => {
      setPhase('fade-out');
    }, 5000);
    
    // Фаза 7: Завершение (5.5s)
    setTimeout(() => {
      onComplete();
    }, 5500);
  };
  
  return { phase, controls };
}
```

---

### 3. Компонент логотипа Logo.tsx

**Файл:** `client/src/components/Logo/Logo.tsx`

**Требования:**

1. **SVG структура:**
   - Логотип должен быть SVG с двумя основными слоями:
     - `outline` — контур для эффекта карандашного наброска
     - `fill` — слой для акварельного заполнения

2. **Анимация карандашного наброска (draw):**
   - Использовать `strokeDasharray` и `strokeDashoffset` в CSS/SVG
   - Начальное состояние: `strokeDashoffset = полная длина пути`
   - Конечное состояние: `strokeDashoffset = 0`
   - Длительность: ~1 секунда
   - Easing: `easeInOut`

3. **Анимация акварельного заполнения (fill):**
   - Использовать `opacity` transition для слоя заполнения
   - Начальное состояние: `opacity: 0`
   - Конечное состояние: `opacity: 1`
   - Длительность: 1 секунда
   - Эффект "проявления" через mask или clip-path

**Пример структуры SVG:**

```tsx
<motion.svg
  viewBox="0 0 400 400"
  initial={{ opacity: 0 }}
  animate={controls}
  variants={{
    visible: { opacity: 1 },
    draw: {
      strokeDashoffset: 0,
      transition: { duration: 1, ease: 'easeInOut' }
    },
    fill: {
      opacity: 1,
      transition: { duration: 1, ease: 'easeOut' }
    }
  }}
>
  {/* Слой акварельного заполнения */}
  <motion.path
    d="..." // путь логотипа
    fill="url(#watercolor-gradient)"
    initial={{ opacity: 0 }}
    variants={{
      fill: { opacity: 1 }
    }}
  />
  
  {/* Слой карандашного контура */}
  <path
    d="..." // тот же путь
    stroke="#2c2c2c"
    strokeWidth="2"
    fill="none"
    style={{
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength
    }}
  />
  
  {/* Градиент для акварели */}
  <defs>
    <linearGradient id="watercolor-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#4a90d9" />
      <stop offset="50%" stopColor="#6ba3e0" />
      <stop offset="100%" stopColor="#4a90d9" />
    </linearGradient>
  </defs>
</motion.svg>
```

---

### 4. Обработка мобильных устройств (Autoplay Policy)

**Проблема:** Браузеры блокируют автовоспроизведение аудио без взаимодействия пользователя.

**Решение:**

1. **Вариант A: Отложенный старт до первого взаимодействия**
   ```typescript
   useEffect(() => {
     const handleFirstInteraction = () => {
       // Разблокировка аудио контекста
       if (wavesSound.current?.state() !== 'loaded') {
         wavesSound.current?.load();
       }
       document.removeEventListener('click', handleFirstInteraction);
       document.removeEventListener('touchstart', handleFirstInteraction);
     };
     
     document.addEventListener('click', handleFirstInteraction);
     document.addEventListener('touchstart', handleFirstInteraction);
     
     return () => {
       document.removeEventListener('click', handleFirstInteraction);
       document.removeEventListener('touchstart', handleFirstInteraction);
     };
   }, []);
   ```

2. **Вариант B: Использование Howler.js unlock()**
   ```typescript
   import { Howl, Howler } from 'howler';
   
   // При первом взаимодействии
   Howler.unlock();
   ```

3. **Вариант C: Визуальная подсказка пользователю**
   - Если аудио не воспроизводится, показать текст "Click to start"
   - После клика запустить последовательность

---

### 5. Стилизация SplashScreen.styles.ts

**Файл:** `client/src/screens/SplashScreen/SplashScreen.styles.ts`

**Требования:**

```typescript
export const styles = {
  container: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    overflow: 'hidden',
  },
  logoWrapper: {
    width: '300px',
    height: '300px',
    maxWidth: '80vw',
    maxHeight: '80vw',
  },
};
```

**CSS классы (если используется CSS modules):**

```css
.splash-screen {
  position: fixed;
  inset: 0;
  background-color: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  overflow: hidden;
}

.logo-container {
  width: 300px;
  height: 300px;
  max-width: 80vw;
  max-height: 80vw;
}

/* Анимация карандашного штриха */
@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}

/* Анимация акварельного проявления */
@keyframes watercolor-fill {
  from {
    opacity: 0;
    filter: blur(10px);
  }
  to {
    opacity: 1;
    filter: blur(0);
  }
}
```

---

### 6. Интеграция с роутингом

**Файл:** `client/src/App.tsx` (или главный роутер)

**Требования:**

1. SplashScreen рендерится условно при первом запуске
2. После завершения анимации происходит переход на Loading Screen
3. Состояние "splash завершён" сохраняется в Zustand store

**Пример интеграции:**

```typescript
function App() {
  const [showSplash, setShowSplash] = useState(true);
  const { setSplashCompleted } = useAppStore();
  
  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    setSplashCompleted(true);
  }, [setSplashCompleted]);
  
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }
  
  return (
    <Routes>
      <Route path="/" element={<LoadingScreen />} />
      {/* остальные роуты */}
    </Routes>
  );
}
```

---

### 7. Store (Zustand) для состояния splash

**Файл:** `client/src/store/appStore.ts`

**Добавить состояние:**

```typescript
interface AppState {
  splashCompleted: boolean;
  setSplashCompleted: (completed: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  splashCompleted: false,
  setSplashCompleted: (completed) => set({ splashCompleted: completed }),
}));
```

---

## 🎨 Ассеты

### Необходимые файлы:

1. **logo-outline.svg**
   - Формат: SVG
   - Контур логотипа студии
   - Толщина штриха: 2px
   - Цвет: #2c2c2c (тёмно-серый)
   - Должен иметь чёткие пути для анимации stroke-dashoffset

2. **logo-watercolor.png** (опционально)
   - Формат: PNG с прозрачным фоном
   - Размер: 512x512px минимум
   - Стиль: акварельная текстура
   - Используется для слоя заполнения

3. **waves.mp3**
   - Длительность: 3-5 секунд
   - Формат: MP3, 128kbps минимум
   - Звук морских волн

4. **bicycle-bell.mp3**
   - Длительность: 1-2 секунды
   - Формат: MP3, 128kbps минимум
   - Звук велосипедного звонка

**Расположение ассетов:** `client/src/assets/`

---

## ✅ Acceptance Criteria (Критерии приёмки)

### Функциональные:

- [ ] При загрузке приложения отображается полностью чёрный экран
- [ ] Через 1 секунду воспроизводится звук волн
- [ ] Через 2 секунды воспроизводится звук велосипедного звонка
- [ ] Логотип появляется как карандашный набросок (анимация отрисовки)
- [ ] Через 1 секунду после начала отрисовки логотип заполняется акварельным эффектом
- [ ] Логотип удерживается 1 секунду в заполненном состоянии
- [ ] Логотип плавно затухает (fade-out)
- [ ] Общая длительность splash screen составляет ~5-5.5 секунд
- [ ] После завершения splash screen автоматически переходит на Loading Screen

### Технические:

- [ ] Анимация работает на 60 FPS
- [ ] Аудио预加载 (preload) реализовано корректно
- [ ] Обработана политика автовоспроизведения на мобильных устройствах
- [ ] SVG логотип масштабируется корректно на разных разрешениях
- [ ] Нет утечек памяти (таймеры очищаются при unmount)
- [ ] Код типизирован TypeScript

### Визуальные:

- [ ] Карандашный набросок выглядит естественно (не механически)
- [ ] Акварельное заполнение имеет мягкие края
- [ ] Переходы между фазами плавные, без рывков
- [ ] Чёрный фон действительно #000000 (без оттенков)

---

## 🔍 Edge Cases и обработка ошибок

### 1. Аудио не загрузилось

```typescript
const handleAudioError = () => {
  console.warn('Audio failed to load, continuing without sound');
  // Продолжить анимацию без звука
};

wavesSound.current.on('loaderror', handleAudioError);
```

### 2. Пользователь свернул вкладку во время splash

```typescript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Поставить на паузу (опционально)
    } else {
      // Продолжить (опционально)
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);
```

### 3. Медленное устройство (низкий FPS)

- Упростить анимацию (убрать сложные фильтры)
- Использовать `will-change` CSS property для оптимизации
- Проверять `performance.now()` для точных таймингов

---

## 📝 Checklist для разработчика

### Подготовка:

- [ ] Созданы все необходимые директории
- [ ] Ассеты размещены в правильных папках
- [ ] Установлены зависимости (framer-motion, howler уже в package.json)

### Реализация:

- [ ] Создан компонент SplashScreen.tsx
- [ ] Создан хук useSplashAnimation.ts
- [ ] Создан компонент Logo.tsx
- [ ] Настроены стили
- [ ] Реализована последовательность таймингов
- [ ] Настроено аудио с Howler.js
- [ ] Реализована анимация карандашного наброска
- [ ] Реализована анимация акварельного заполнения
- [ ] Обработана мобильная autoplay policy

### Интеграция:

- [ ] SplashScreen интегрирован в App.tsx
- [ ] Добавлено состояние в Zustand store
- [ ] Реализован переход к Loading Screen

### Тестирование:

- [ ] Проверено на desktop (Chrome, Firefox, Safari)
- [ ] Проверено на mobile (iOS Safari, Android Chrome)
- [ ] Проверена работа аудио
- [ ] Проверена производительность (60 FPS)
- [ ] Проверены edge cases

### Финал:

- [ ] Код отформатирован (Prettier)
- [ ] Пройден ESLint
- [ ] Добавлены комментарии к сложным участкам
- [ ] Типы TypeScript проверены

---

## 🚀 Пример готового кода (референс)

**client/src/screens/SplashScreen/SplashScreen.tsx:**

```typescript
import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';
import { useSplashAnimation } from '../../hooks/useSplashAnimation';
import { Logo } from '../../components/Logo/Logo';
import { styles } from './SplashScreen.styles';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const { phase, controls } = useSplashAnimation(onComplete);
  const wavesRef = useRef<Howl | null>(null);
  const bellRef = useRef<Howl | null>(null);
  
  useEffect(() => {
    // Инициализация аудио
    wavesRef.current = new Howl({
      src: ['/src/assets/audio/waves.mp3'],
      preload: true,
      volume: 0.8,
      onloaderror: () => console.warn('Waves audio failed to load'),
    });
    
    bellRef.current = new Howl({
      src: ['/src/assets/audio/bicycle-bell.mp3'],
      preload: true,
      volume: 0.9,
      onloaderror: () => console.warn('Bell audio failed to load'),
    });
    
    // Разблокировка аудио на мобильных
    const unlockAudio = () => {
      Howler.unlock();
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };
    
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
    
    return () => {
      wavesRef.current?.unload();
      bellRef.current?.unload();
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };
  }, []);
  
  return (
    <motion.div
      style={styles.container}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence>
        {phase !== 'complete' && (
          <motion.div style={styles.logoWrapper}>
            <Logo phase={phase} controls={controls} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
```

---

## 📚 Дополнительные ресурсы

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Howler.js Documentation](https://github.com/goldfire/howler.js)
- [SVG Stroke Animation](https://css-tricks.com/svg-line-animation-works/)
- [Web Audio Autoplay Policy](https://developer.chrome.com/blog/autoplay/)

---

## ⚠️ Важные замечания

1. **Не использовать setInterval** — только setTimeout для цепочки таймингов
2. **Очищать все таймеры** в cleanup функции useEffect
3. **Тестировать на реальных мобильных устройствах** — эмуляторы могут не воспроизводить проблемы с аудио
4. **SVG пути должны быть непрерывными** для корректной анимации stroke-dashoffset
5. **Аудиофайлы должны быть оптимизированы** по размеру для быстрой загрузки
