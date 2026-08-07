# Task 3.2: Cinematic Scene 4-6 (Through Town → Market Chaos)
## Детальная спецификация реализации

---

## 📋 Обзор задачи

**Название:** Opening Cinematic — Scenes 4-6  
**Тип:** Анимационная катсцена с множеством NPC и динамической камерой  
**Длительность:** ~45 секунд  
**Приоритет:** P0 (Critical Path)  

---

## 🎬 Сценарий по сценам

### Сцена 4: The Promenade (0:30 - 0:45)
**Длительность:** 15 секунд  
**Локация:** Набережная Castelvento  
**Действие:** Renzo мчится вдоль набережной, приветствуя местных жителей  

#### Персонажи и их действия:

**1. Рыбаки (Fishermen mending nets)**
- Позиция: Слева от пути, сидят на камнях
- Действие: Чинят сети, машут рукой при появлении Renzo
- Анимация: Руки работают с сетью → пауза → wave → resume
- Диалог: "Buongiorno, Renato!"

**2. Женщина с цветами (Woman watering flowers)**
- Позиция: Справа, у окна дома
- Действие: Поливает цветы в горшках → смотрит вверх → улыбается
- Анимация: Полив → lift head → smile → return to watering
- Диалог: "Che bella giornata!"

**3. Владелец кафе (Café owner opening)**
- Позиция: У входа в кафе, открывает ставни
- Действие: Открывает деревянные ставни → окликает Renzo
- Анимация: Push shutters open → turn → call out
- Диалог: "Renato! Coffee later?"

**4. Дети с мячом (Kids playing soccer)**
- Позиция: На площади перед набережной
- Действие: Играют в футбол → мяч почти попадает в Renzo → он уклоняется
- Анимация: Kick → ball rolls → Renzo dodges → kids laugh
- Диалог: "Attento!" "Scusi!"

#### Композиция кадра:
```
┌─────────────────────────────────────────────────────┐
│                    SEA                              │
│              ~~~~~~~~~~~~~~~                        │
│                                                     │
│    [Fishermen]           [Café]    [Woman]          │
│       🎣🎣               ☕🏪        🌸              │
│                                                     │
│         ╔═══════════════════════════════╗           │
│         ║      PROMENADE STREET         ║           │
│         ║                               ║           │
│    [Kids⚽]    -->  [RENZO 🚲]  -->     ║           │
│         ║                               ║           │
│         ╚═══════════════════════════════╝           │
│                                                     │
│           [Buildings with shutters]                 │
└─────────────────────────────────────────────────────┘
```

**Техническая реализация:**
```typescript
// components/cinematic/Scene4Promenade.tsx
import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';

interface NPCProps {
  type: 'fisherman' | 'flower-woman' | 'cafe-owner' | 'kid';
  position: { x: number; y: number };
  onInteraction: () => void;
}

const NPC: React.FC<NPCProps> = ({ type, position, onInteraction }) => {
  const controls = useAnimation();
  const [state, setState] = useState<'idle' | 'interacting' | 'return'>('idle');

  useEffect(() => {
    const triggerInteraction = async () => {
      // Ждем пока Renzo приблизится (timing-based)
      await new Promise(resolve => setTimeout(resolve, getDelayForType(type)));
      
      setState('interacting');
      onInteraction();
      
      // Возврат к idle анимации
      await new Promise(resolve => setTimeout(resolve, 2000));
      setState('return');
    };

    triggerInteraction();
  }, [type, onInteraction]);

  const getAnimation = () => {
    switch (type) {
      case 'fisherman':
        return state === 'interacting' 
          ? { rotate: [0, 15, 0], transition: { duration: 1 } }
          : { rotate: [0, 5, 0], transition: { duration: 3, repeat: Infinity } };
      case 'flower-woman':
        return state === 'interacting'
          ? { y: [-10, 0], opacity: [0.8, 1] }
          : { y: [0, 5, 0], transition: { duration: 4, repeat: Infinity } };
      // ... другие типы
    }
  };

  return (
    <motion.div
      className="absolute"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      animate={getAnimation()}
    >
      <img src={`/assets/cinematic/npcs/${type}.png`} alt={type} />
      {state === 'interacting' && (
        <SpeechBubble text={getDialogueForType(type)} />
      )}
    </motion.div>
  );
};

export const Scene4Promenade = ({ onComplete }: { onComplete: () => void }) => {
  const [renzoPosition, setRenzoPosition] = useState(0);

  useEffect(() => {
    const moveRenzo = async () => {
      // Renzo движется слева направо
      for (let i = 0; i <= 100; i += 2) {
        setRenzoPosition(i);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      onComplete();
    };

    moveRenzo();
  }, [onComplete]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-r from-sky-200 to-sky-100">
      {/* Море на заднем плане */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-1/3"
        style={{ backgroundImage: 'url(/assets/cinematic/backgrounds/sea_panorama.png)' }}
        animate={{ backgroundPositionX: [0, -100] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />

      {/* Набережная */}
      <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-promenade-texture" />

      {/* Здания */}
      <motion.div
        className="absolute bottom-1/3 left-0 right-0 h-1/3"
        style={{ backgroundImage: 'url(/assets/cinematic/backgrounds/promenade_buildings.png)' }}
        animate={{ x: [0, -200] }}
        transition={{ duration: 15, ease: "linear" }}
      />

      {/* NPC */}
      <NPC 
        type="fisherman" 
        position={{ x: 10, y: 40 }} 
        onInteraction={() => console.log('Fisherman waves')}
      />
      <NPC 
        type="flower-woman" 
        position={{ x: 70, y: 20 }} 
        onInteraction={() => console.log('Woman smiles')}
      />
      <NPC 
        type="cafe-owner" 
        position={{ x: 50, y: 35 }} 
        onInteraction={() => console.log('Owner calls out')}
      />
      <NPC 
        type="kid" 
        position={{ x: 30, y: 50 }} 
        onInteraction={() => console.log('Kids play')}
      />

      {/* Renzo на велосипеде */}
      <motion.div
        className="absolute bottom-[20%]"
        style={{ left: `${renzoPosition}%` }}
      >
        <img src="/assets/cinematic/character/renzo_bike_full.png" alt="Renzo cycling" />
      </motion.div>

      {/* Мяч (если взаимодействие с детьми) */}
      <motion.div
        className="absolute bottom-[25%]"
        initial={{ left: '25%', opacity: 0 }}
        animate={{ 
          left: ['25%', '45%'],
          opacity: [0, 1, 0]
        }}
        transition={{ duration: 2, delay: 3 }}
      >
        <img src="/assets/cinematic/props/soccer_ball.png" alt="Ball" width={32} />
      </motion.div>
    </div>
  );
};
```

**Компонент SpeechBubble:**
```typescript
// components/ui/SpeechBubble.tsx
interface SpeechBubbleProps {
  text: string;
  duration?: number;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({ text, duration = 2000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <motion.div
      className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white rounded-2xl px-4 py-2 shadow-lg"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      style={{ 
        fontFamily: "'Caveat', cursive",
        fontSize: '18px',
        whiteSpace: 'nowrap'
      }}
    >
      {text}
      {/* Хвостик пузыря */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white transform rotate-45" />
    </motion.div>
  );
};
```

**Аудио для сцены 4:**
- Фоновый шум моря и чаек
- Звук велосипеда по брусчатке
- Итальянские реплики (позиционированный звук):
  - `"Buongiorno, Renato!"` — слева
  - `"Che bella giornata!"` — справа, выше
  - `"Renato! Coffee later?"` — центр
  - `"Attento!" "Scusi!"` — детский голос, близко
- Легкая итальянская музыка (тарантелла, тихо)

---

### Сцена 5: The Market (0:45 - 1:00)
**Длительность:** 15 секунд  
**Локация:** Рыночная площадь Castelvento  
**Действие:** Renzo петляет между лавками, создавая хаос  

#### Элементы сцены:

**1. Куры (Chickens scatter)**
- Количество: 5-7 кур
- Поведение: Клюют зерна → пугаются → разбегаются в разные стороны
- Анимация: Peck → startled → run (direction based on Renzo's path)

**2. Телега с фруктами (Fruit cart nearly tips)**
- Позиция: Центр пути
- Событие: Renzo задевает телегу → она наклоняется → фрукты катятся
- Анимация: Stationary → tilt 15° → apples roll out → vendor catches cart
- Звук: Wood creak → fruits rolling → "Mamma mia!"

**3. Продавец (Vendor yelling)**
- Реакция: Hands up → yell → shake fist
- Диалог: "Ragazzo! Attento!"
- Анимация: Surprise → anger → resignation

**4. Женщина-покупатель (Woman shakes head)**
- Позиция: Справа от телеги
- Реакция: Смотрит на хаос → качает головой → вздыхает
- Анимация: Observe → head shake → sigh (shoulders rise/fall)

**5. Велосипедный звонок (Renzo rings bell)**
- Действие: Renzo звонит в звонок, предупреждая всех
- Звук: "Dzyń! Dzyń!" (два звонка)
- Анимация: Hand reaches → press bell → release

**Траектория движения Renzo:**
```
Start → weave left → dodge cart → weave right → exit

    [Chicken]    [Cart]    [Woman]
        🐔        🛒         👩
          \       / \       /
           \     /   \     /
            \   /     \   /
             \ /       \ /
              X         X
             / \       / \
            /   \     /   \
           /     \   /     \
          /       \ /       \
        START    [RENZO]    END
                  🚲
```

**Техническая реализация:**
```typescript
// components/cinematic/Scene5Market.tsx
import { motion, useCycle } from 'framer-motion';

export const Scene5Market = ({ onComplete }: { onComplete: () => void }) => {
  const [chaosLevel, setChaosLevel] = useState(0); // 0-3, increases as Renzo moves
  
  // Путь Renzo с уклонениями
  const renzoPath = [
    { x: 0, y: 0 },      // Start
    { x: 20, y: -30 },   // Weave left
    { x: 40, y: 10 },    // Dodge cart
    { x: 60, y: -20 },   // Weave right
    { x: 100, y: 0 }     // Exit
  ];

  useEffect(() => {
    const animateRenzo = async () => {
      for (const point of renzoPath) {
        // Move Renzo
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Trigger chaos events based on position
        if (point.x === 40) {
          setChaosLevel(2); // Cart incident
        }
      }
      onComplete();
    };

    animateRenzo();
  }, [onComplete]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-market-day">
      {/* Рыночные палатки */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute market-stall"
            style={{ 
              left: `${15 + i * 15}%`,
              backgroundImage: `url(/assets/cinematic/backgrounds/market_stall_${i % 3}.png)`
            }}
            animate={{ x: [-50, 0] }}
            transition={{ duration: 15, ease: "linear" }}
          />
        ))}
      </div>

      {/* Куры */}
      {[...Array(6)].map((_, i) => (
        <Chicken
          key={i}
          initialPos={{ x: 30 + i * 10, y: 60 }}
          scatterTrigger={chaosLevel >= 1}
          scatterDirection={i % 2 === 0 ? 'left' : 'right'}
        />
      ))}

      {/* Телега с фруктами */}
      <FruitCart
        position={{ x: 50, y: 50 }}
        tilted={chaosLevel >= 2}
        onFruitsRoll={() => setChaosLevel(3)}
      />

      {/* Продавец */}
      <Vendor
        position={{ x: 52, y: 35 }}
        reaction={chaosLevel >= 2 ? 'angry' : 'neutral'}
        dialogue={chaosLevel >= 2 ? "Ragazzo! Attento!" : ""}
      />

      {/* Женщина */}
      <WomanShopper
        position={{ x: 65, y: 45 }}
        reacting={chaosLevel >= 2}
      />

      {/* Renzo */}
      <motion.div
        className="absolute bottom-[20%]"
        animate={{
          left: renzoPath.map(p => `${p.x}%`),
          top: renzoPath.map(p => `calc(80% - ${p.y}px)`)
        }}
        transition={{ duration: 15, ease: "easeInOut" }}
      >
        <img src="/assets/cinematic/character/renzo_bike_leaning.png" alt="Renzo weaving" />
        
        {/* Звонок */}
        <BellSound 
          triggerAt={chaosLevel >= 1} 
          rings={2} 
        />
      </motion.div>

      {/* Летящие фрукты */}
      {chaosLevel >= 3 && (
        <FlyingFruits count={8} />
      )}
    </div>
  );
};

// Компонент куры
const Chicken: React.FC<{
  initialPos: { x: number; y: number };
  scatterTrigger: boolean;
  scatterDirection: 'left' | 'right';
}> = ({ initialPos, scatterTrigger, scatterDirection }) => {
  return (
    <motion.div
      className="absolute"
      style={{ left: `${initialPos.x}%`, top: `${initialPos.y}%` }}
      animate={scatterTrigger ? {
        x: scatterDirection === 'left' ? -200 : 200,
        rotate: scatterDirection === 'left' ? -45 : 45,
        opacity: [1, 1, 0]
      } : {
        y: [0, 5, 0],
        transition: { duration: 2, repeat: Infinity }
      }}
    >
      <img src="/assets/cinematic/npcs/chicken.png" alt="Chicken" width={40} />
    </motion.div>
  );
};

// Компонент телеги
const FruitCart: React.FC<{
  position: { x: number; y: number };
  tilted: boolean;
  onFruitsRoll: () => void;
}> = ({ position, tilted, onFruitsRoll }) => {
  useEffect(() => {
    if (tilted) {
      setTimeout(onFruitsRoll, 500);
    }
  }, [tilted, onFruitsRoll]);

  return (
    <motion.div
      className="absolute"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      animate={{ rotate: tilted ? 15 : 0 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <img src="/assets/cinematic/props/fruit_cart.png" alt="Fruit cart" />
      
      {/* Фрукты внутри */}
      {!tilted && (
        <div className="absolute top-2 left-2">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute fruit"
              style={{
                left: `${(i % 4) * 15}px`,
                top: `${Math.floor(i / 4) * 15}px`,
                backgroundColor: ['#ff6b6b', '#ffd93d', '#6bcb77'][i % 3]
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};
```

**Аудио для сцены 5:**
- Базарный шум (разговоры, шаги)
- Кудахтанье кур (до и после испуга)
- Скрип телеги
- Звук катящихся фруктов
- Реплика продавца: "Ragazzo! Attento!" (громко, эмоционально)
- Вздох женщины
- Велосипедный звонок: "Dzyń! Dzyń!"
- Музыка ускоряется, становится более хаотичной

---

### Сцена 6: The Hill (1:00 - 1:15)
**Длительность:** 15 секунд  
**Локация:** Подъем в гору к старой части города  
**Действие:** Renzo поднимается в гору, камера открывается панорама города  

#### Визуальные элементы:

**1. Камера поднимается (Camera rises gradually)**
- Начало: Уровень улицы, фокус на Renzo
- Конец: Высокий угол, вид на половину города
- Движение: Плавное, синусоидальное (ease-in-out)
- Duration: 15 секунд

**2. Вид на город (Half town visible)**
- Красные крыши (red rooftops)
- Церковная башня (church bell tower) — доминирующий элемент
- Площадь (piazza) внизу
- Узкие улочки (narrow streets)

**3. Поезд на станции (Train at station)**
- Позиция: Справа вдали, на заднем плане
- Действие: Выпускает пар → гудок
- Анимация: Steam particles rise → whistle sound
- Тайминг: 1:10 (через 10 секунд от начала сцены)

**4. Гудок поезда (Train whistle)**
- Звук: Паровозный гудок, эхо
- Громкость: Нарастает, затем затихает
- Эффект: Reverb для ощущения пространства

**5. Музыка нарастает (Main theme swells)**
- Переход от хаотичной базарной музыки к главной теме
- Инструменты:Accordion, strings, piano
- Эмоция: Ностальгия, предвкушение

**Техническая реализация:**
```typescript
// components/cinematic/Scene6Hill.tsx
import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';

export const Scene6Hill = ({ onComplete }: { onComplete: () => void }) => {
  const cameraControls = useAnimation();
  const [trainVisible, setTrainVisible] = useState(false);

  useEffect(() => {
    const runScene = async () => {
      // Подъем камеры
      await cameraControls.start({
        y: -300,
        scale: 0.7,
        duration: 15,
        ease: "easeInOut"
      });

      // Поезд появляется на 10 секунде
      setTimeout(() => setTrainVisible(true), 10000);

      // Завершение сцены
      setTimeout(onComplete, 15000);
    };

    runScene();
  }, [cameraControls, onComplete]);

  return (
    <motion.div
      className="relative w-full h-full overflow-hidden"
      animate={cameraControls}
      initial={{ y: 0, scale: 1 }}
    >
      {/* Небо */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 to-amber-100" />

      {/* Город (параллакс слои) */}
      <ParallaxLayer
        speed={0.2}
        image="/assets/cinematic/backgrounds/town_distant.png"
        position="top-0"
      />
      
      <ParallaxLayer
        speed={0.5}
        image="/assets/cinematic/backgrounds/church_tower.png"
        position="top-1/4"
      />
      
      <ParallaxLayer
        speed={0.8}
        image="/assets/cinematic/backgrounds/rooftops.png"
        position="top-1/2"
      />

      {/* Поезд */}
      {trainVisible && (
        <TrainWithSteam
          position={{ x: 70, y: 30 }}
          onWhistle={() => playSound('train_whistle')}
        />
      )}

      {/* Дорога в гору */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1/2"
        style={{ 
          backgroundImage: 'url(/assets/cinematic/backgrounds/hill_road.png)',
          transformOrigin: 'bottom center'
        }}
        animate={{ scaleY: 1.2 }}
        transition={{ duration: 15 }}
      />

      {/* Renzo поднимается */}
      <motion.div
        className="absolute"
        animate={{
          bottom: ['10%', '40%'],
          left: ['50%', '45%'] // Немного влево при подъеме
        }}
        transition={{ duration: 15, ease: "easeOut" }}
      >
        <img 
          src="/assets/cinematic/character/renzo_bike_climbing.png" 
          alt="Renzo climbing hill"
          className="w-48 h-auto"
        />
      </motion.div>

      {/* Частицы пара от поезда */}
      {trainVisible && (
        <SteamParticles
          origin={{ x: 72, y: 28 }}
          count={20}
          direction="up"
        />
      )}
    </motion.div>
  );
};

// Компонент параллакс слоя
const ParallaxLayer: React.FC<{
  speed: number;
  image: string;
  position: string;
}> = ({ speed, image, position }) => {
  return (
    <motion.div
      className={`absolute ${position} left-0 right-0`}
      style={{ backgroundImage: `url(${image})` }}
      animate={{ y: [0, -50 * speed] }}
      transition={{ duration: 15, ease: "easeInOut" }}
    />
  );
};

// Компонент поезда с паром
const TrainWithSteam: React.FC<{
  position: { x: number; y: number };
  onWhistle: () => void;
}> = ({ position, onWhistle }) => {
  useEffect(() => {
    const whistleTimer = setTimeout(onWhistle, 2000);
    return () => clearTimeout(whistleTimer);
  }, [onWhistle]);

  return (
    <motion.div
      className="absolute"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 3 }}
    >
      <img src="/assets/cinematic/props/steam_train.png" alt="Train" width={120} />
    </motion.div>
  );
};

// Частицы пара
const SteamParticles: React.FC<{
  origin: { x: number; y: number };
  count: number;
  direction: 'up' | 'left' | 'right';
}> = ({ origin, count, direction }) => {
  return (
    <div className="absolute pointer-events-none">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-4 h-4 bg-white/40 rounded-full blur-md"
          style={{
            left: `${origin.x}%`,
            top: `${origin.y}%`
          }}
          initial={{ opacity: 0.8, scale: 0.5 }}
          animate={{
            opacity: 0,
            y: direction === 'up' ? -100 - Math.random() * 50 : 0,
            x: (Math.random() - 0.5) * 50,
            scale: 2
          }}
          transition={{
            duration: 2 + Math.random(),
            delay: i * 0.2,
            repeat: Infinity
          }}
        />
      ))}
    </div>
  );
};
```

**Аудио для сцены 6:**
- Затихающий базарный шум (удаляется)
- Дыхание Renzo (усталое от подъема)
- Звук велосипеда в гору (медленнее, напряженнее)
- Ветер (усиливается с высотой)
- **Паровозный гудок** (на 1:10, громкий, с эхом)
- **Главная тема игры** начинает звучать (фортепиано + аккордеон)
- Переход к следующей сцене через crossfade музыки

---

## 🎨 Требования к ассетам

### Изображения:
```
/assets/cinematic/
├── backgrounds/
│   ├── sea_panorama.png (2560x1080)
│   ├── promenade_buildings.png (1920x600)
│   ├── market_stalls.png (бесшовная текстура)
│   ├── town_distant.png (1920x800)
│   ├── church_tower.png (400x600)
│   ├── rooftops.png (1920x400)
│   └── hill_road.png (1920x1080)
├── npcs/
│   ├── fisherman_mending.png (спрайт 4 кадра)
│   ├── flower_woman.png (спрайт 3 кадра)
│   ├── cafe_owner.png (спрайт 3 кадра)
│   ├── kids_playing.png (спрайт 6 кадров)
│   ├── vendor_angry.png (спрайт 4 кадра)
│   ├── woman_shopper.png (спрайт 2 кадра)
│   └── chicken.png (спрайт 4 кадра)
├── props/
│   ├── fishing_nets.png
│   ├── flower_pots.png
│   ├── café_sign.png
│   ├── soccer_ball.png
│   ├── fruit_cart.png
│   ├── fruits_collection.png (apple, orange, grape)
│   └── steam_train.png (200x100)
└── character/
    ├── renzo_bike_full.png
    ├── renzo_bike_leaning.png
    └── renzo_bike_climbing.png
```

### Аудио:
```
/audio/sfx/
├── market_ambient.mp3 (толпа, разговоры)
├── chickens_clucking.mp3
├── cart_creak.mp3
├── fruits_rolling.mp3
├── vendor_yell_1.mp3 ("Ragazzo!")
├── vendor_yell_2.mp3 ("Attento!")
├── woman_sigh.mp3
├── bicycle_bell_double.mp3 ("Dzyń! Dzyń!")
├── train_whistle_long.mp3
├── steam_release.mp3
└── music/
    ├── tarantella_market.mp3 (быстрая, хаотичная)
    └── main_theme_piano.mp3 (главная тема)
```

### Диалоги (итальянский):
```
/audio/dialogue/scene4/
├── fisherman_buongiorno.mp3 ("Buongiorno, Renato!")
├── woman_bella_giornata.mp3 ("Che bella giornata!")
├── cafe_owner_coffee.mp3 ("Renato! Coffee later?")
└── kids_attento_scusi.mp3 ("Attento!" "Scusi!")

/audio/dialogue/scene5/
├── vendor_ragazzo.mp3 ("Ragazzo!")
└── vendor_attento.mp3 ("Attento!")
```

---

## ⚙️ Техническая архитектура

### State Management для сцены:
```typescript
// stores/cinematicScene5Store.ts
import { create } from 'zustand';

interface Scene5State {
  chaosLevel: number; // 0-3
  renzoPosition: number; // 0-100
  chickensScattered: boolean;
  cartTilted: boolean;
  fruitsRolled: boolean;
  setChaosLevel: (level: number) => void;
  setRenzoPosition: (pos: number) => void;
  triggerChaosEvent: (event: 'chickens' | 'cart' | 'fruits') => void;
}

export const useScene5Store = create<Scene5State>((set, get) => ({
  chaosLevel: 0,
  renzoPosition: 0,
  chickensScattered: false,
  cartTilted: false,
  fruitsRolled: false,

  setChaosLevel: (level) => set({ chaosLevel: level }),
  setRenzoPosition: (pos) => set({ renzoPosition: pos }),

  triggerChaosEvent: (event) => {
    const state = get();
    
    if (event === 'chickens' && !state.chickensScattered) {
      set({ chickensScattered: true, chaosLevel: 1 });
    }
    
    if (event === 'cart' && !state.cartTilted) {
      set({ cartTilted: true, chaosLevel: 2 });
    }
    
    if (event === 'fruits' && !state.fruitsRolled) {
      set({ fruitsRolled: true, chaosLevel: 3 });
    }
  }
}));
```

### Audio positioning system:
```typescript
// utils/spatialAudio.ts
import { Howl } from 'howler';

interface Position {
  x: number; // -1 (left) to 1 (right)
  y: number; // -1 (bottom) to 1 (top)
  z?: number; // distance
}

export class SpatialAudioController {
  private listener: HTMLAudioElement;
  
  constructor() {
    this.listener = new Audio();
  }

  playPositionalSound(
    sound: Howl,
    position: Position,
    listenerPosition: Position = { x: 0, y: 0, z: 0 }
  ) {
    // Calculate relative position
    const relX = position.x - listenerPosition.x;
    const relZ = (position.z || 0) - (listenerPosition.z || 0);

    // Set panning (-1 to 1)
    const pan = Math.max(-1, Math.min(1, relX));
    
    // Set volume based on distance
    const distance = Math.sqrt(relX ** 2 + relZ ** 2);
    const volume = Math.max(0, 1 - distance / 10);

    sound.stereo(pan);
    sound.volume(volume);
    sound.play();
  }
}
```

---

## ✅ Acceptance Criteria

### Функциональные:
- [ ] Сцена 4 показывает набережную с 4 типами NPC
- [ ] Каждый NPC имеет уникальную анимацию и диалог
- [ ] Renzo движется слева направо через всю сцену
- [ ] Дети играют с мячом, мяч почти попадает в Renzo
- [ ] Все итальянские реплики воспроизводятся в правильный момент
- [ ] Сцена 5 показывает рыночную площадь
- [ ] Куры разбегаются когда Renzo приближается
- [ ] Teleга наклоняется, фрукты выкатываются
- [ ] Продавец кричит "Ragazzo! Attento!"
- [ ] Renzo звонит в звонок дважды
- [ ] Сцена 6 показывает подъем в гору
- [ ] Камера плавно поднимается за 15 секунд
- [ ] Половина города видна (крыши, церковь, площадь)
- [ ] Поезд выпускает пар и гудит
- [ ] Главная тема музыки начинает звучать

### Технические:
- [ ] 60 FPS на desktop, 30+ FPS на mobile
- [ ] Все NPC используют sprite sheets (не отдельные изображения)
- [ ] Параллакс эффект работает корректно
- [ ] Аудио позиционируется пространственно (левый/правый канал)
- [ ] Диалоги синхронизированы с анимацией рта (базовая)
- [ ] Поддержка aspect ratio от 16:9 до 19.5:9 (mobile)
- [ ] Оптимизированная загрузка ассетов (lazy loading)

### Визуальные:
- [ ] Стиль соответствует watercolor aesthetic игры
- [ ] NPC одеты в стиле 1940-х годов
- [ ] Рынок выглядит оживленным и детализированным
- [ ] Панорама города впечатляющая и атмосферная
- [ ] Цветовая палитра теплая (утреннее солнце)
- [ ] Движения камеры кинематографичные

### Аудио:
- [ ] Итальянские диалоги записаны носителями языка
- [ ] Звуковые эффекты синхронизированы с действием
- [ ] Музыкальный переход от сцены 5 к 6 плавный
- [ ] Гудок поезда слышен с правильным reverb
- [ ] Микширование аудио не перегружено

---

## 🔧 Edge Cases & Обработка ошибок

### 1. Слишком много NPC одновременно:
```typescript
// Limit active NPCs based on performance
const maxActiveNPCs = isLowEndDevice ? 4 : 8;

const visibleNPCs = allNPCs.slice(0, maxActiveNPCs);
```

### 2. Ассеты не загружены вовремя:
```typescript
// Preload critical assets before scene starts
const preloadAssets = async () => {
  const criticalAssets = [
    '/assets/cinematic/npcs/fisherman.png',
    '/assets/cinematic/npcs/vendor.png',
    '/audio/dialogue/scene5/vendor_ragazzo.mp3'
  ];

  await Promise.all(criticalAssets.map(preload));
};
```

### 3. Камера выходит за пределы:
```typescript
// Clamp camera position
const clampedY = Math.max(minY, Math.min(maxY, cameraY));
```

### 4. Диалог не синхронизирован:
```typescript
// Use visual cue if audio fails
if (!dialogueAudio.isPlaying) {
  showSubtitle(dialogueText);
}
```

---

## 📝 Checklist для разработчика

### Подготовка:
- [ ] Получить все спрайты NPC от художника
- [ ] Записать итальянские диалоги с носителями
- [ ] Создать текстуры рынка и набережной
- [ ] Подготовить главную тему музыки

### Реализация:
- [ ] Реализовать Scene4Promenade с 4 типами NPC
- [ ] Добавить систему SpeechBubble для диалогов
- [ ] Реализовать Scene5Market с физикой фруктов
- [ ] Создать particle system для кур и пара
- [ ] Реализовать Scene6Hill с подъемом камеры
- [ ] Добавить поезд с particle system для пара
- [ ] Интегрировать spatial audio

### Тестирование:
- [ ] Проверить все диалоги на правильность произношения
- [ ] Измерить FPS во время хаотичной сцены 5
- [ ] Проверить работу на mobile устройствах
- [ ] Протестировать аудио на разных устройствах
- [ ] Проверить плавность перехода между сценами

### Оптимизация:
- [ ] Сжать все текстуры рынка
- [ ] Использовать sprite sheets для NPC
- [ ] Оптимизировать количество частиц
- [ ] Добавить LOD для дальних объектов

---

**Статус:** Готово к реализации  
**Версия спецификации:** 1.0  
**Дата создания:** 2024
