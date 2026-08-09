# Task 6.2: Location Framework (First 5 Areas) — Detailed Implementation Specification

## 📋 Overview
**Task ID:** 6.2  
**Title:** Location Framework (First 5 Areas)  
**Priority:** P1 (High)  
**Parent Feature:** World & Locations  

Создание универсального фреймворка для интерактивных локаций и реализация первых 5 областей Castelvento с полным набором взаимодействий, NPC и атмосферных элементов.

---

## 🎯 Functional Requirements

### 1. Архитектура системы локаций

#### 1.1 Базовая структура локации
```typescript
// types/location.ts
interface Location {
  id: string;
  name: string;
  description: string;
  
  // Visual
  background: {
    day: string;      // URL изображения
    evening?: string; // Опционально
    night?: string;   // Опционально
  };
  
  // Layout
  areas: LocationArea[];
  hotspots: Hotspot[];
  
  // NPCs
  npcSpawns: NPCSpawn[];
  
  // Audio
  soundscape: {
    ambient: string;
    day?: string;
    night?: string;
    weatherVariants?: WeatherSounds;
  };
  
  // Gameplay
  quests: QuestLocation[];
  interactables: InteractableObject[];
  
  // Constraints
  timeRestrictions?: TimeRange;
  unlockRequirement?: QuestRequirement;
  
  // Metadata
  tags: string[];
  firstVisitMessage?: string;
}

interface LocationArea {
  id: string;
  name: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  backgroundLayer?: string;
  enterTrigger?: () => void;
}

interface Hotspot {
  id: string;
  type: 'clickable' | 'hover' | 'zone';
  position: { x: number; y: number };
  size: { width: number; height: number };
  interaction: InteractionConfig;
  visualHint?: HintStyle;
  condition?: ConditionCheck;
}

interface NPCSpawn {
  npcId: string;
  schedule: ScheduleEntry[];
  defaultPosition: { x: number; y: number };
  dialogueTreeId: string;
}
```

#### 1.2 Компонент Location Engine
```typescript
// components/Location/LocationEngine.tsx
const LocationEngine: React.FC<{ locationId: string }> = ({ locationId }) => {
  const location = useLocationStore(state => state.getLocation(locationId));
  const currentTime = useTimeStore(state => state.hour);
  const visitedLocations = usePlayerStore(state => state.visitedLocations);
  
  // Определение визуальной темы по времени суток
  const timeTheme = getTimeTheme(currentTime); // 'day' | 'evening' | 'night'
  const backgroundImage = location.background[timeTheme] || location.background.day;
  
  // Проверка условий разблокировки
  const isUnlocked = checkLocationUnlock(location.unlockRequirement);
  
  // First visit trigger
  useEffect(() => {
    if (!visitedLocations.includes(locationId)) {
      onFirstVisit(location);
      markAsVisited(locationId);
    }
  }, [locationId]);
  
  if (!isUnlocked) {
    return <LocationLockedScreen location={location} />;
  }
  
  return (
    <div className="location-container">
      {/* Background Layer */}
      <LocationBackground 
        image={backgroundImage}
        transitionDuration={2000}
      />
      
      {/* Area Layers */}
      {location.areas.map(area => (
        <LocationArea
          key={area.id}
          area={area}
          onEnter={area.enterTrigger}
        />
      ))}
      
      {/* Interactive Hotspots */}
      <HotspotLayer hotspots={location.hotspots} />
      
      {/* NPCs */}
      <NPCLayer 
        locationId={locationId}
        spawns={location.npcSpawns}
      />
      
      {/* Weather Overlay */}
      <WeatherOverlay currentWeather={useWeatherStore.getState().current} />
      
      {/* UI Overlays */}
      <LocationUI 
        name={location.name}
        description={location.description}
      />
    </div>
  );
};
```

### 2. Реализация первых 5 локаций

---

## 🏠 Локация 1: Дом Ренцо (Renzo's House)

### 2.1.1 Конфигурация локации
```json
{
  "id": "renzo_house",
  "name": "Casa di Renzo",
  "description": "Your childhood home. Three rooms filled with memories.",
  
  "background": {
    "day": "/assets/locations/house/interior_day.png",
    "evening": "/assets/locations/house/interior_evening.png",
    "night": "/assets/locations/house/interior_night.png"
  },
  
  "areas": [
    {
      "id": "bedroom",
      "name": "Bedroom",
      "bounds": { "x": 0, "y": 0, "width": 800, "height": 600 },
      "backgroundLayer": "bedroom_layer"
    },
    {
      "id": "hallway",
      "name": "Hallway",
      "bounds": { "x": 800, "y": 0, "width": 400, "height": 600 }
    },
    {
      "id": "kitchen",
      "name": "Kitchen",
      "bounds": { "x": 1200, "y": 0, "width": 720, "height": 600 }
    },
    {
      "id": "garden",
      "name": "Garden",
      "bounds": { "x": 0, "y": 600, "width": 1920, "height": 480 }
    }
  ],
  
  "hotspots": [
    {
      "id": "bed_journal",
      "type": "clickable",
      "position": { "x": 150, "y": 350 },
      "size": { "width": 80, "height": 60 },
      "interaction": {
        "type": "open_journal",
        "text": "Your old journal. Pages filled with teenage thoughts."
      },
      "visualHint": {
        "type": "glow",
        "color": "#FFD700",
        "pulseSpeed": 2
      }
    },
    {
      "id": "desk_photo",
      "type": "clickable",
      "position": { "x": 450, "y": 380 },
      "size": { "width": 60, "height": 80 },
      "interaction": {
        "type": "examine",
        "text": "A faded photograph of you and Nonna at the beach, summer 1938.",
        "emotion": "nostalgic"
      }
    },
    {
      "id": "window_view",
      "type": "hover",
      "position": { "x": 600, "y": 200 },
      "size": { "width": 150, "height": 200 },
      "interaction": {
        "type": "view_description",
        "text": "The piazza looks peaceful today. Maria is sweeping her steps."
      }
    },
    {
      "id": "kitchen_cookie_jar",
      "type": "clickable",
      "position": { "x": 1350, "y": 320 },
      "size": { "width": 70, "height": 90 },
      "interaction": {
        "type": "take_item",
        "itemId": "nonna_cookie",
        "amount": 1,
        "respawnTime": 1440,
        "text": "Nonna's secret recipe cookies. Still warm."
      },
      "condition": {
        "type": "time_range",
        "hours": { "min": 7, "max": 10 }
      }
    },
    {
      "id": "garden_lemon_tree",
      "type": "clickable",
      "position": { "x": 1600, "y": 750 },
      "size": { "width": 120, "height": 180 },
      "interaction": {
        "type": "take_item",
        "itemId": "lemon",
        "amount": "1-3",
        "respawnTime": 2880,
        "text": "Fresh lemons from Nonna's tree."
      }
    },
    {
      "id": "door_exit",
      "type": "zone",
      "position": { "x": 900, "y": 550 },
      "size": { "width": 100, "height": 50 },
      "interaction": {
        "type": "transition",
        "targetLocation": "town_square",
        "transitionTime": 3
      }
    }
  ],
  
  "npcSpawns": [
    {
      "npcId": "nonna_maria",
      "schedule": [
        {
          "startTime": 360,
          "endTime": 480,
          "areaId": "kitchen",
          "position": { "x": 1300, "y": 400 },
          "animation": "cooking"
        },
        {
          "startTime": 720,
          "endTime": 1080,
          "areaId": "garden",
          "position": { "x": 1500, "y": 800 },
          "animation": "watering_plants"
        },
        {
          "startTime": 1080,
          "endTime": 1260,
          "areaId": "kitchen",
          "position": { "x": 1300, "y": 400 },
          "animation": "preparing_dinner"
        }
      ],
      "defaultPosition": { "x": 1300, "y": 400 },
      "dialogueTreeId": "dialogue_nonna_maria"
    }
  ],
  
  "soundscape": {
    "ambient": "/assets/audio/locations/house/ambient_indoor.mp3",
    "day": "/assets/audio/locations/house/day_birds.mp3",
    "night": "/assets/audio/locations/house/night_crickets.mp3",
    "weatherVariants": {
      "rain": "/assets/audio/weather/rain_on_roof.mp3",
      "wind": "/assets/audio/weather/wind_through_shutters.mp3"
    }
  },
  
  "tags": ["home", "safe_zone", "starting_location"],
  "firstVisitMessage": "Home. Everything is exactly as you left it."
}
```

### 2.1.2 Визуальная композиция
```
┌─────────────────────────────────────────────────────────────┐
│                    BEDROOM (Спальня)                        │
│  ┌──────────┐                              ┌───────────┐   │
│  │  Кровать │         Окно с видом        │   Стол    │   │
│  │          │         на площадь          │  с фото   │   │
│  └──────────┘                              └───────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                    HALLWAY (Коридор)                        │
│              ┌─────┐                    ┌──────┐           │
│              │Дверь│                    │Лестница          │
│              │выход│                    │наверх            │
│              └─────┘                    └──────┘           │
├─────────────────────────────────────────────────────────────┤
│                    KITCHEN (Кухня)                          │
│  ┌─────────┐    ┌─────────┐         ┌────────────┐         │
│  │ Печь    │    │  Стол   │         │Банка с     │         │
│  │         │    │         │         │печеньем    │         │
│  └─────────┘    └─────────┘         └────────────┘         │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    GARDEN (Сад)                             │
│                                                              │
│    ┌──────┐                           ╭────────╮           │
│    │Беседка│                         ( Лимонное )          │
│    └──────┘                          (  дерево  )          │
│                                      ╰────────╯           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.1.3 Компоненты для локации дома
```typescript
// components/Locations/RenzoHouse/HouseScene.tsx
const RenzoHouseScene: React.FC = () => {
  const currentArea = usePlayerStore(state => state.currentArea);
  const timeOfDay = useTimeStore(state => state.timeOfDay);
  
  return (
    <div className={`house-scene house-${timeOfDay}`}>
      {/* Параллакс слои */}
      <ParallaxLayer speed={0.1} src="/assets/locations/house/bg_far.png" />
      <ParallaxLayer speed={0.3} src="/assets/locations/house/mid_walls.png" />
      <ParallaxLayer speed={0.6} src="/assets/locations/house/foreground_furniture.png" />
      
      {/* Динамическое освещение */}
      <LightingOverlay 
        timeOfDay={timeOfDay}
        lightSources={[
          { x: 450, y: 200, radius: 150, intensity: timeOfDay === 'night' ? 0.8 : 0 },
          { x: 1300, y: 250, radius: 200, intensity: timeOfDay === 'evening' ? 0.6 : 0.3 }
        ]}
      />
      
      {/* Интерактивные объекты */}
      <InteractiveObjects layer="house" />
      
      {/* NPC */}
      {currentArea === 'kitchen' && <NonnaMariaNPC />}
      {currentArea === 'garden' && <GardenAmbient />}
      
      {/* Переходы между комнатами */}
      <AreaTransitions 
        from={currentArea}
        availableAreas={['bedroom', 'hallway', 'kitchen', 'garden']}
      />
    </div>
  );
};
```

---

## ⛪ Локация 2: Городская Площадь (Piazza Centrale / Town Square)

### 2.2.1 Конфигурация локации
```json
{
  "id": "town_square",
  "name": "Piazza Centrale",
  "description": "Heart of Castelvento. Everyone gathers here.",
  
  "background": {
    "day": "/assets/locations/square/piazza_day.png",
    "evening": "/assets/locations/square/piazza_evening.png",
    "night": "/assets/locations/square/piazza_night.png"
  },
  
  "areas": [
    {
      "id": "fountain_area",
      "name": "Fountain Plaza",
      "bounds": { "x": 700, "y": 400, "width": 500, "height": 400 }
    },
    {
      "id": "church_steps",
      "name": "Church Steps",
      "bounds": { "x": 1200, "y": 200, "width": 400, "height": 500 }
    },
    {
      "id": "market_corner",
      "name": "Market Corner",
      "bounds": { "x": 200, "y": 500, "width": 400, "height": 300 }
    },
    {
      "id": "cafe_terrace",
      "name": "Café Terrace",
      "bounds": { "x": 100, "y": 300, "width": 300, "height": 250 }
    }
  ],
  
  "hotspots": [
    {
      "id": "fountain_coin",
      "type": "clickable",
      "position": { "x": 950, "y": 550 },
      "size": { "width": 100, "height": 100 },
      "interaction": {
        "type": "make_wish",
        "cost": 1,
        "currency": "lire",
        "text": "You toss a coin into the fountain. Some say it brings good luck.",
        "effect": {
          "type": "mood_boost",
          "value": 5
        }
      },
      "visualHint": {
        "type": "sparkle",
        "particleCount": 5
      }
    },
    {
      "id": "bulletin_board",
      "type": "clickable",
      "position": { "x": 1250, "y": 350 },
      "size": { "width": 120, "height": 150 },
      "interaction": {
        "type": "view_quests",
        "questBoardId": "town_square_board"
      }
    },
    {
      "id": "cafe_table",
      "type": "clickable",
      "position": { "x": 200, "y": 450 },
      "size": { "width": 80, "height": 80 },
      "interaction": {
        "type": "buy_item",
        "vendorId": "cafe_giuseppe",
        "menu": ["espresso", "cappuccino", "cornetto", "gelato"]
      },
      "condition": {
        "type": "npc_present",
        "npcId": "cafe_giuseppe"
      }
    },
    {
      "id": "pigeons",
      "type": "hover",
      "position": { "x": 850, "y": 600 },
      "size": { "width": 200, "height": 150 },
      "interaction": {
        "type": "ambient_interaction",
        "text": "Pigeons scatter as you approach. One brave soul pecks at crumbs."
      }
    }
  ],
  
  "npcSpawns": [
    {
      "npcId": "priest_don_giovanni",
      "schedule": [
        {
          "startTime": 420,
          "endTime": 480,
          "areaId": "church_steps",
          "position": { "x": 1300, "y": 250 },
          "animation": "greeting_parishioners"
        },
        {
          "startTime": 1080,
          "endTime": 1140,
          "areaId": "fountain_area",
          "position": { "x": 900, "y": 500 },
          "animation": "feeding_pigeons"
        }
      ],
      "dialogueTreeId": "dialogue_priest"
    },
    {
      "npcId": "cafe_giuseppe",
      "schedule": [
        {
          "startTime": 360,
          "endTime": 1320,
          "areaId": "cafe_terrace",
          "position": { "x": 150, "y": 350 },
          "animation": "serving_coffee"
        }
      ],
      "dialogueTreeId": "dialogue_barista"
    },
    {
      "npcId": "flower_girl_sofia",
      "schedule": [
        {
          "startTime": 540,
          "endTime": 1080,
          "areaId": "market_corner",
          "position": { "x": 300, "y": 600 },
          "animation": "arranging_flowers"
        }
      ],
      "dialogueTreeId": "dialogue_flower_girl",
      "affinityRequired": 10
    }
  ],
  
  "soundscape": {
    "ambient": "/assets/audio/locations/square/ambient_crowd.mp3",
    "day": "/assets/audio/locations/square/day_market_noise.mp3",
    "evening": "/assets/audio/locations/square/evening_cafe_music.mp3",
    "night": "/assets/audio/locations/square/night_fountain.mp3"
  },
  
  "tags": ["central", "social_hub", "quests_available"],
  "firstVisitMessage": "The heart of Castelvento beats strong in the piazza."
}
```

### 2.2.2 Схема площади
```
                    CHURCH
                       │
            ┌──────────┴──────────┐
            │   Church Steps      │
            │   (Don Giovanni)    │
            └──────────┬──────────┘
                       │
    ┌──────────────────┼──────────────────┐
    │                  │                  │
    │  Market Corner   │  Fountain Plaza  │  Café Terrace
    │  (Sofia flowers) │   (Pigeons)      │  (Giuseppe coffee)
    │                  │                  │
    └──────────────────┴──────────────────┘
                       │
            ┌──────────┴──────────┐
            │   Streets Exit      │
            │   to other areas    │
            └─────────────────────┘
```

---

## 🏪 Локация 3: Рыночная Улица (Market Street / Via del Mercato)

### 2.3.1 Конфигурация локации
```json
{
  "id": "market_street",
  "name": "Via del Mercato",
  "description": "Bustling market street. Fresh produce, fish, and gossip.",
  
  "background": {
    "day": "/assets/locations/market/street_day.png",
    "evening": "/assets/locations/market/street_evening.png"
  },
  
  "hotspots": [
    {
      "id": "fish_stall",
      "type": "clickable",
      "position": { "x": 300, "y": 450 },
      "size": { "width": 150, "height": 120 },
      "interaction": {
        "type": "buy_item",
        "vendorId": "fisherman_peppe",
        "inventory": ["fresh_sea_bass", "sardines", "octopus", "clams"],
        "pricesDynamic": true
      }
    },
    {
      "id": "fruit_stall",
      "type": "clickable",
      "position": { "x": 550, "y": 450 },
      "size": { "width": 180, "height": 140 },
      "interaction": {
        "type": "buy_item",
        "vendorId": "greengrocer_maria",
        "inventory": ["tomatoes", "lemons", "olives", "figs", "grapes"]
      }
    },
    {
      "id": "bread_stall",
      "type": "clickable",
      "position": { "x": 800, "y": 450 },
      "size": { "width": 140, "height": 120 },
      "interaction": {
        "type": "buy_item",
        "vendorId": "baker_lucia",
        "inventory": ["pane_di_casa", "focaccia", "taralli", "cuddura"]
      }
    },
    {
      "id": "rumor_hearsay",
      "type": "hover",
      "position": { "x": 600, "y": 300 },
      "size": { "width": 400, "height": 100 },
      "interaction": {
        "type": "overhear_dialogue",
        "dialogues": [
          "Did you hear? The train was late again...",
          "They say Elena is coming back from Rome!",
          "Prices keep rising. War is coming, I tell you."
        ],
        "randomPick": true
      }
    }
  ],
  
  "npcSpawns": [
    {
      "npcId": "fisherman_peppe",
      "schedule": [{ "startTime": 300, "endTime": 720, "areaId": "fish_stall" }],
      "dialogueTreeId": "dialogue_fisherman"
    },
    {
      "npcId": "greengrocer_maria",
      "schedule": [{ "startTime": 360, "endTime": 780, "areaId": "fruit_stall" }],
      "dialogueTreeId": "dialogue_greengrocer"
    },
    {
      "npcId": "baker_lucia",
      "schedule": [{ "startTime": 240, "endTime": 660, "areaId": "bread_stall" }],
      "dialogueTreeId": "dialogue_baker"
    }
  ],
  
  "soundscape": {
    "ambient": "/assets/audio/locations/market/market_crowd.mp3",
    "day": "/assets/audio/locations/market/vendors_calling.mp3"
  },
  
  "tags": ["shopping", "vendors", "dynamic_prices"],
  "firstVisitMessage": "The market is alive with colors, smells, and voices."
}
```

---

## 🏖️ Локация 4: Пляжная Променад (Beach Promenade / Lungomare)

### 2.4.1 Конфигурация локации
```json
{
  "id": "beach_promenade",
  "name": "Lungomare",
  "description": "Sea breeze, crashing waves, and endless horizon.",
  
  "background": {
    "day": "/assets/locations/beach/promenade_day.png",
    "sunset": "/assets/locations/beach/promenade_sunset.png",
    "night": "/assets/locations/beach/promenade_night.png"
  },
  
  "hotspots": [
    {
      "id": "pier_end",
      "type": "clickable",
      "position": { "x": 1500, "y": 600 },
      "size": { "width": 200, "height": 150 },
      "interaction": {
        "type": "contemplate",
        "text": "The sea stretches endlessly. Somewhere beyond lies Rome... and your future.",
        "moodEffect": "reflective"
      }
    },
    {
      "id": "lifeguard_station",
      "type": "clickable",
      "position": { "x": 800, "y": 500 },
      "size": { "width": 100, "height": 120 },
      "interaction": {
        "type": "talk_to_npc",
        "npcId": "lifeguard_tonio"
      },
      "condition": {
        "type": "time_range",
        "hours": { "min": 8, "max": 20 }
      }
    },
    {
      "id": "wave_sound",
      "type": "zone",
      "position": { "x": 0, "y": 600 },
      "size": { "width": 1920, "height": 200 },
      "interaction": {
        "type": "ambient_trigger",
        "soundVolume": 0.8,
        "onEnter": "playWaves",
        "onExit": "fadeWaves"
      }
    }
  ],
  
  "npcSpawns": [
    {
      "npcId": "lifeguard_tonio",
      "schedule": [{ "startTime": 480, "endTime": 1200, "areaId": "lifeguard_station" }],
      "dialogueTreeId": "dialogue_lifeguard"
    },
    {
      "npcId": "old_man_fishing",
      "schedule": [{ "startTime": 300, "endTime": 600, "areaId": "pier_end" }],
      "dialogueTreeId": "dialogue_old_fisherman"
    }
  ],
  
  "soundscape": {
    "ambient": "/assets/audio/locations/beach/waves_crashing.mp3",
    "day": "/assets/audio/locations/beach/seagulls.mp3",
    "night": "/assets/audio/locations/beach/night_waves.mp3"
  },
  
  "tags": ["sea", "relaxation", "sunset_views"],
  "firstVisitMessage": "The sea remembers every story ever told to its waves."
}
```

---

## 🚂 Локация 5: Железнодорожная Станция (Train Station / Stazione)

### 2.5.1 Конфигурация локации
```json
{
  "id": "train_station",
  "name": "Stazione di Castelvento",
  "description": "Gateway to the outside world. Trains to Rome twice daily.",
  
  "background": {
    "day": "/assets/locations/station/platform_day.png",
    "evening": "/assets/locations/station/platform_evening.png",
    "night": "/assets/locations/station/platform_night.png"
  },
  
  "hotspots": [
    {
      "id": "ticket_booth",
      "type": "clickable",
      "position": { "x": 400, "y": 400 },
      "size": { "width": 120, "height": 150 },
      "interaction": {
        "type": "buy_ticket",
        "destinations": [
          { "name": "Rome", "price": 25, "duration": 180 },
          { "name": "Naples", "price": 15, "duration": 120 }
        ],
        "schedule": [
          { "time": "08:30", "destination": "Rome" },
          { "time": "14:15", "destination": "Naples" },
          { "time": "19:45", "destination": "Rome" }
        ]
      }
    },
    {
      "id": "departure_board",
      "type": "hover",
      "position": { "x": 700, "y": 250 },
      "size": { "width": 200, "height": 150 },
      "interaction": {
        "type": "view_schedule",
        "boardType": "departures"
      }
    },
    {
      "id": "waiting_room",
      "type": "zone",
      "position": { "x": 1000, "y": 500 },
      "size": { "width": 300, "height": 200 },
      "interaction": {
        "type": "enter_sublocation",
        "sublocationId": "station_waiting_room"
      }
    },
    {
      "id": "train_arrival_trigger",
      "type": "zone",
      "position": { "x": 1200, "y": 600 },
      "size": { "width": 400, "height": 100 },
      "interaction": {
        "type": "trigger_event",
        "eventId": "train_arrival",
        "condition": {
          "type": "scheduled_time",
          "checkInterval": 60
        }
      }
    }
  ],
  
  "npcSpawns": [
    {
      "npcId": "station_master",
      "schedule": [{ "startTime": 300, "endTime": 1320, "areaId": "ticket_booth" }],
      "dialogueTreeId": "dialogue_station_master"
    },
    {
      "npcId": "traveler_random",
      "schedule": [],
      "spawnCondition": {
        "type": "random",
        "chance": 0.3,
        "maxConcurrent": 2
      },
      "dialogueTreeId": "dialogue_traveler_generic"
    }
  ],
  
  "soundscape": {
    "ambient": "/assets/audio/locations/station/platform_ambience.mp3",
    "trainArrival": "/assets/audio/locations/station/train_whistle_approach.mp3",
    "trainDeparture": "/assets/audio/locations/station/train_departure.mp3"
  },
  
  "tags": ["transport", "unlock_after_chapter_1", "story_critical"],
  "unlockRequirement": {
    "type": "quest_progress",
    "questId": "chapter_1_complete",
    "requiredStep": 10
  },
  "firstVisitMessage": "The station hums with anticipation. Where will the tracks take you?"
}
```

---

## 🔧 Technical Implementation

### 3.1 Location Store (Zustand)
```typescript
// stores/locationStore.ts
import { create } from 'zustand';

interface LocationState {
  currentLocation: string | null;
  currentArea: string | null;
  visitedLocations: string[];
  locationHistory: LocationVisit[];
  
  // Actions
  enterLocation: (locationId: string, areaId?: string) => void;
  exitLocation: () => void;
  changeArea: (areaId: string) => void;
  markLocationVisited: (locationId: string) => void;
  getHotspots: () => Hotspot[];
  getActiveNPCs: () => NPCSpawn[];
  playSoundscape: () => void;
  stopSoundscape: () => void;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  currentLocation: null,
  currentArea: null,
  visitedLocations: ['renzo_house'],
  locationHistory: [],
  
  enterLocation: (locationId, areaId = 'default') => {
    const location = LOCATIONS[locationId];
    
    // Проверка разблокировки
    if (!checkUnlock(location.unlockRequirement)) {
      throw new Error(`Location ${locationId} is locked`);
    }
    
    // Остановить текущий soundscape
    get().stopSoundscape();
    
    set({
      currentLocation: locationId,
      currentArea: areaId,
    });
    
    // Запустить новый soundscape
    get().playSoundscape();
    
    // Trigger first visit message
    if (!get().visitedLocations.includes(locationId)) {
      showFirstVisitMessage(location.firstVisitMessage);
      get().markLocationVisited(locationId);
    }
  },
  
  exitLocation: () => {
    get().stopSoundscape();
    set({ currentLocation: null, currentArea: null });
  },
  
  changeArea: (areaId) => {
    set({ currentArea: areaId });
    
    const location = LOCATIONS[get().currentLocation!];
    const area = location.areas.find(a => a.id === areaId);
    
    if (area?.enterTrigger) {
      area.enterTrigger();
    }
  },
  
  markLocationVisited: (locationId) => {
    set(state => ({
      visitedLocations: [...state.visitedLocations, locationId],
      locationHistory: [
        ...state.locationHistory,
        { locationId, timestamp: Date.now() }
      ]
    }));
  },
  
  getHotspots: () => {
    const location = LOCATIONS[get().currentLocation!];
    if (!location) return [];
    
    return location.hotspots.filter(hotspot => {
      if (!hotspot.condition) return true;
      return checkCondition(hotspot.condition);
    });
  },
  
  getActiveNPCs: () => {
    const location = LOCATIONS[get().currentLocation!];
    const currentHour = useTimeStore.getState().hour;
    
    if (!location) return [];
    
    return location.npcSpawns.filter(spawn => {
      return spawn.schedule.some(entry => 
        currentHour >= entry.startTime / 60 && 
        currentHour < entry.endTime / 60
      );
    });
  },
  
  playSoundscape: () => {
    const location = LOCATIONS[get().currentLocation!];
    if (!location) return;
    
    const timeOfDay = useTimeStore.getState().timeOfDay;
    const audioKey = location.soundscape[timeOfDay] || location.soundscape.ambient;
    
    playAudio(audioKey, { loop: true, fade: 2000 });
  },
  
  stopSoundscape: () => {
    fadeOutAudio({ duration: 1000 });
  },
}));
```

### 3.2 Базовый компонент локации
```typescript
// components/Location/BaseLocation.tsx
const BaseLocation: React.FC<{ locationId: string }> = ({ locationId }) => {
  const location = LOCATIONS[locationId];
  const { enterLocation, exitLocation, getHotspots, getActiveNPCs } = useLocationStore();
  const timeOfDay = useTimeStore(state => state.timeOfDay);
  
  useEffect(() => {
    enterLocation(locationId);
    return () => exitLocation();
  }, [locationId]);
  
  const backgroundImage = location.background[timeOfDay] || location.background.day;
  const hotspots = getHotspots();
  const activeNPCs = getActiveNPCs();
  
  return (
    <div className="location-base">
      {/* Background */}
      <div 
        className="location-background"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        {/* Parallax layers if defined */}
        {location.parallaxLayers?.map((layer, idx) => (
          <ParallaxLayer
            key={idx}
            src={layer.image}
            speed={layer.speed}
            depth={layer.depth}
          />
        ))}
      </div>
      
      {/* Areas */}
      {location.areas.map(area => (
        <LocationArea
          key={area.id}
          area={area}
          isActive={useLocationStore(state => state.currentArea) === area.id}
        />
      ))}
      
      {/* Hotspots */}
      <HotspotRenderer hotspots={hotspots} />
      
      {/* NPCs */}
      <NPCRenderer npcs={activeNPCs} />
      
      {/* Weather & Time Effects */}
      <TimeEffects timeOfDay={timeOfDay} />
      <WeatherEffects />
      
      {/* Location-specific UI */}
      <LocationHUD 
        name={location.name}
        description={location.description}
      />
    </div>
  );
};
```

---

## ✅ Acceptance Criteria

### Для всех 5 локаций
- [ ] Каждая локация имеет уникальный визуальный стиль
- [ ] Фоны корректно меняются в зависимости от времени суток
- [ ] Все hotspots реагируют на взаимодействия (клик, hover, вход в зону)
- [ ] NPC появляются и исчезают согласно расписанию
- [ ] Soundscape проигрывается и плавно затухает при переходе
- [ ] Первое посещение показывает уникальное сообщение
- [ ] Сохранение прогресса посещений работает

### Специфичные требования
- **Дом Ренцо**: 4 зоны, 6+ hotspots, Nonna Maria с расписанием
- **Площадь**: 4 зоны, фонтан с механикой монеток, 3+ NPC
- **Рынок**: 3+ торговых лавки с покупками, динамические диалоги
- **Пляж**: Зона волн с аудио-триггером, пирс для размышлений
- **Станция**: Расписание поездов, покупка билетов, заблокирована до конца главы 1

### Технические требования
- [ ] Плавный FPS (60) на всех локациях
- [ ] Отсутствие memory leaks при переключении
- [ ] Корректная работа на мобильных устройствах
- [ ] Предзагрузка следующей локации
- [ ] Типизация TypeScript без `any`

---

## 🎨 Assets Checklist

### Графика
- [ ] 5 background изображений для каждой локации (day/evening/night варианты)
- [ ] Слои для параллакс эффекта
- [ ] Иконки для hotspots
- [ ] Спрайты для NPC (idle, walk, activity animations)
- [ ] Оверлеи для погоды и времени суток

### Аудио
- [ ] 5 ambient tracks для локаций
- [ ] Варианты для времени суток (day/night)
- [ ] Звуки погоды (дождь, ветер)
- [ ] SFX для взаимодействий (шаги, двери, предметы)

---

## 🔗 Related Tasks
- **Task 6.1**: Map & Travel System (навигация между локациями)
- **Task 7.1**: NPC Schedule System (расписания NPC)
- **Task 8.1**: Top HUD (отображение статистики во время игры)
- **Task 4.2**: Interactive Objects (базовая механика hotspots)
