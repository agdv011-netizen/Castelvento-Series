# Task 3.4: Chapter 1 - Scenes 19-27 (Rising Action & Mystery Deepens)

## Overview
Реализация второй половины Главы 1, охватывающей углубление в тайну, встречу с призраком/воспоминанием, поиск улик в архиве и развитие отношений между Ренцо и Еленой. Сцены 19-27 представляют собой нарастающее напряжение и переход от романтической прогулки к мистическому расследованию.

---

## Scene 19: "The Whispering Archive" (Вступающий коридор архива)

### 1.1 Состояние окружения
**Локация:** Коридор перед городским архивом Castelvento
**Время:** Поздний вечер, сумерки
**Погода:** Легкий туман, усиливающий атмосферу таинственности

**Технические требования:**
```typescript
interface ArchiveCorridorState {
  lighting: {
    ambientColor: '#2a2a3a'; // Темно-синие сумерки
    pointLights: [
      { position: [x, y, z], intensity: 0.6, color: '#ffaa00' } // Одинокий фонарь
    ];
    fog: {
      type: 'exponential';
      density: 0.02;
      color: '#1a1a2a';
    };
  };
  environment: {
    walls: 'aged_stone_texture';
    floor: 'cobblestone_worn';
    particles: 'dust_motes_slow';
  };
  audio: {
    ambient: 'wind_whisper_low';
    reverb: 'large_hall_small';
    triggers: ['footstep_echo', 'paper_rustle_distant'];
  };
}
```

### 1.2 Логика камеры
**Тип:** Плавное приближение (Dolly In)
**Длительность:** 8 секунд
**Траектория:** От общего плана коридора к двери архива

```typescript
const scene19Camera: CameraSequence = {
  start: {
    position: { x: 0, y: 1.7, z: -8 },
    target: { x: 0, y: 1.7, z: 2 },
    fov: 65
  },
  keyframes: [
    { time: 0, position: { x: 0, y: 1.7, z: -8 }, target: { x: 0, y: 1.7, z: 2 } },
    { time: 4, position: { x: 0.5, y: 1.6, z: -4 }, target: { x: 0, y: 1.7, z: 1 } },
    { time: 8, position: { x: 0, y: 1.6, z: -1 }, target: { x: 0, y: 1.65, z: 0.5 } }
  ],
  easing: 'easeInOutCubic',
  shake: { intensity: 0.3, frequency: 0.5 } // Легкая дрожь от напряжения
};
```

### 1.3 Диалоговый блок
**Участники:** Ренцо, Елена
**Стиль:** Шепот, замедленный темп

```typescript
const scene19Dialogue: DialogueBlock = {
  id: 'scene_19_archive_approach',
  background: 'archive_corridor_blur',
  characters: [
    {
      id: 'renzo',
      sprite: 'renzo_concerned_shadow',
      position: 'left',
      expression: 'worried'
    },
    {
      id: 'elena',
      sprite: 'elena_determined_twilight',
      position: 'right',
      expression: 'curious_brave'
    }
  ],
  lines: [
    {
      speaker: 'renzo',
      text: 'Ты уверена, что мы должны быть здесь? Уже поздно...',
      voiceover: 'audio/renzo_scene19_line1.ogg',
      duration: 3.5,
      typewriterSpeed: 45
    },
    {
      speaker: 'elena',
      text: 'Именно поэтому. Когда город спит, его секреты просыпаются.',
      voiceover: 'audio/elena_scene19_line1.ogg',
      duration: 4,
      typewriterSpeed: 40,
      emotion: 'mysterious_smile'
    },
    {
      speaker: 'renzo',
      text: 'Твои слова звучат как начало страшной истории...',
      duration: 3,
      typewriterSpeed: 50
    },
    {
      speaker: 'elena',
      text: 'А может, это и есть наша история?',
      duration: 3.5,
      typewriterSpeed: 45,
      triggerNextScene: true
    }
  ],
  choices: null // Линейная сцена
};
```

### 1.4 Интерактивные элементы
**Дверь архива:**
- **Trigger Zone:** 2 метра перед дверью
- **Interaction:** 'push_open_heavy'
- **Animation:** Медленное открывание со скрипом (2.5 секунды)
- **Audio:** 'door_wood_heavy_creak_long'
- **Visual Effect:** Пыль поднимается при открывании

```typescript
const archiveDoor: InteractiveObject = {
  id: 'archive_door_main',
  type: 'door_heavy_wood',
  position: { x: 0, y: 0, z: 0.5 },
  rotation: { x: 0, y: -15, z: 0 },
  animations: {
    idle: 'door_closed_sway',
    opening: 'door_push_open_slow',
    open: 'door_fully_open'
  },
  interaction: {
    prompt: 'Открыть дверь архива',
    action: 'open_archive',
    cooldown: 0,
    requiresItem: null
  },
  effects: {
    onOpen: [
      { type: 'particle', name: 'dust_cloud', intensity: 0.7 },
      { type: 'light', change: { intensity: '+0.3' } },
      { type: 'audio', play: 'door_creak_reverb' }
    ]
  }
};
```

---

## Scene 20: "Inside the Archive" (Внутри архива)

### 2.1 Состояние окружения
**Локация:** Главный зал архива Castelvento
**Освещение:** Тусклые лампы, длинные тени
**Атмосфера:** Пыльно, старо, загадочно

**Техническая реализация:**
```typescript
interface ArchiveInteriorState {
  geometry: {
    shelves: 'tall_wooden_floor_to_ceiling';
    tables: 'scattered_reading_desks';
    papers: 'stacks_loose_documents';
  };
  lighting: {
    mainSource: 'gas_lamp_center';
    shadows: 'long_dynamic';
    godRays: 'volumetric_dust';
  };
  postProcessing: {
    vignette: 0.4;
    grain: 0.15;
    colorGrade: 'sepia_cool';
    bloom: 0.3;
  };
  physics: {
    paperPhysics: 'enabled_lightweight';
    dustParticles: 'volumetric_godrays';
  };
}
```

### 2.2 Навигация и исследование
**Режим:** Point-and-Click Exploration
**Зоны интереса:**
1. Центральный стол с картой
2. Старый картотечный шкаф
3. Запертая дверь в глубине
4. Окно с видом на город

```typescript
const archiveInteractables: InteractiveZone[] = [
  {
    id: 'central_table_map',
    type: 'examine',
    position: { x: 2, y: 0.8, z: -3 },
    radius: 1.5,
    prompt: 'Изучить старую карту',
    action: 'examine_map_closeup',
    cameraOverride: {
      position: { x: 2.5, y: 1.2, z: -2 },
      target: { x: 2, y: 0.9, z: -3 },
      fov: 45
    }
  },
  {
    id: 'card_catalogue',
    type: 'search',
    position: { x: -3, y: 0, z: -5 },
    radius: 2,
    prompt: 'Поискать в картотеке',
    action: 'shuffle_cards_animation',
    minigame: {
      type: 'pattern_match',
      difficulty: 'medium',
      timeLimit: null
    }
  },
  {
    id: 'locked_door_back',
    type: 'locked',
    position: { x: 0, y: 0, z: -8 },
    radius: 1.5,
    prompt: 'Заперто... Нужен ключ',
    action: 'try_door_locked',
    feedback: 'shake_camera_negative'
  }
];
```

### 2.3 Аудио-дизайн
**Ambient Layer:**
- Тихий гул старого здания
- Скрип половиц
- Шелест бумаги (случайные триггеры)
- Удаленный бой часов

**SFX Triggers:**
```typescript
const archiveAudioTriggers = {
  footsteps: {
    surface: 'wood_old',
    variation: 5,
    reverb: 'large_room'
  },
  paperRustle: {
    triggerChance: 0.02, // 2% шанс каждый кадр
    volumeRange: [0.1, 0.3],
    pitchRange: [0.9, 1.1]
  },
  clockTower: {
    triggerTime: 'scene_time_sync',
    volume: 0.4,
    filter: 'lowpass_800hz'
  }
};
```

---

## Scene 21: "The Ghostly Apparition" (Призрачное видение)

### 3.1 Визуальные эффекты призрака
**Тип:** Полупрозрачная проекция прошлого
**Техника:** Render Target + Alpha Blending + Distortion

```typescript
interface GhostEffect {
  shader: {
    type: 'ghost_projection';
    uniforms: {
      uOpacity: 0.6;
      uDistortion: 0.15;
      uGlowIntensity: 0.8;
      uColorShift: vec3(0.8, 0.9, 1.0);
    };
  };
  animation: {
    flicker: { frequency: 2, amplitude: 0.1 };
    drift: { speed: 0.3, direction: 'upward' };
    fadeSequence: ['appear_distort', 'stabilize', 'flicker_intense', 'dissolve_particles'];
  };
  postProcess: {
    chromaticAberration: 0.02;
    blurAmount: 0.5;
    colorDesaturation: 0.7;
  };
}
```

### 3.2 Сценарий появления
**Фаза 1: Предчувствие (3 секунды)**
- Температура цвета смещается к холодному синему
- Звуки затихают, остается только эхо
- Частицы пыли замирают в воздухе
- Камера слегка дрожит

**Фаза 2: Материализация (5 секунд)**
- Из тумана формируется силуэт
- Постепенное проявление деталей одежды
- Лицо остается в тени
- Аудио: нарастающий эмбиент с высокими частотами

**Фаза 3: Взаимодействие (10-15 секунд)**
- Призрак указывает направление
- Произносит ключевую фразу (эхо)
- Исчезает, оставляя подсказку

```typescript
const ghostSequence: ScriptedEvent = {
  id: 'scene_21_ghost_appearance',
  timeline: [
    {
      time: 0,
      actions: [
        { type: 'colorGrade', target: { temperature: -20, tint: 15 } },
        { type: 'audioFade', track: 'ambient', targetVolume: 0.2, duration: 2 },
        { type: 'particleFreeze', intensity: 0.8 }
      ]
    },
    {
      time: 3,
      actions: [
        { type: 'spawnEntity', entity: 'ghost_silhouette', animation: 'materialize_slow' },
        { type: 'cameraShake', intensity: 0.5, duration: 1 },
        { type: 'audioPlay', clip: 'ghost_appear_swirl' }
      ]
    },
    {
      time: 8,
      actions: [
        { type: 'dialogue', block: 'ghost_whisper' },
        { type: 'gesture', entity: 'ghost', animation: 'point_direction' }
      ]
    },
    {
      time: 18,
      actions: [
        { type: 'entityFade', entity: 'ghost', duration: 3 },
        { type: 'spawnItem', item: 'clue_paper', position: { x: 0, y: 0.5, z: 0 } },
        { type: 'colorGradeReset', duration: 2 }
      ]
    }
  ]
};
```

### 3.3 Диалог призрака
**Текст:** Обрывки фраз из прошлого
**Обработка голоса:** Реверберация + питч-шифт + фильтр

```typescript
const ghostDialogue = {
  lines: [
    {
      text: 'Ищи... там, где время остановилось...',
      voiceover: 'audio/ghost_whisper_1.ogg',
      effects: {
        reverb: 'cathedral_large',
        pitchShift: -2, // Ниже на 2 полутона
        lowpass: 600,
        delay: { time: 0.3, feedback: 0.4 }
      },
      subtitles: {
        style: 'ghostly',
        color: '#aaccff',
        animation: 'fade_in_out_slow'
      }
    },
    {
      text: '...ключ скрыт в тенях колокольни...',
      voiceover: 'audio/ghost_whisper_2.ogg',
      effects: {
        reverb: 'cathedral_large',
        pitchShift: -2,
        lowpass: 500
      }
    }
  ]
};
```

---

## Scene 22: "Discovering the Clue" (Нахождение улики)

### 4.1 Интерактивный объект: Старое письмо
**Модель:** Пожелтевший лист с печатями
**Физика:** Легкий, колыхается от движения мыши

```typescript
interface ClueLetter {
  model: {
    mesh: 'paper_aged_curled';
    texture: 'paper_yellow_stained';
    normalMap: 'paper_creases';
  };
  physics: {
    mass: 0.01;
    drag: 0.5;
    constraints: 'hinged_top_edge';
  };
  interaction: {
    hoverHighlight: { color: '#fff8dc', intensity: 0.3 };
    grabPoint: { x: 0, y: 0.5, z: 0 };
    examineMode: 'fullscreen_overlay';
  };
  content: {
    text: 'handwritten_italian_1920s';
    seal: 'wax_broken_family_crest';
    hiddenMessage: 'uv_light_required'; // Для будущих сцен
  };
}
```

### 4.2 Режим исследования улики
**UI Overlay:** Увеличенное изображение письма
**Функции:**
- Перетаскивание для осмотра
- Колесико мыши для зума
- Кнопка "Перевернуть"
- Опционально: УФ-фонарик (если уже получен)

```typescript
const clueExaminationUI = {
  overlay: {
    background: 'dark_vignette',
    frame: 'ornate_vintage_border',
    closeButton: { position: 'top_right', icon: 'x_mark' }
  },
  controls: {
    zoom: { min: 1, max: 5, step: 0.1 },
    rotate: { enabled: true, snapAngles: [0, 90, 180, 270] },
    flip: { animation: 'flip_horizontal_3d', duration: 0.6 }
  },
  annotations: [
    {
      id: 'date_stamp',
      position: { x: 0.8, y: 0.1 },
      tooltip: 'Дата: 15 октября 1923',
      highlight: true
    },
    {
      id: 'family_seal',
      position: { x: 0.2, y: 0.8 },
      tooltip: 'Печать семьи Castello',
      unlockLore: 'castello_family_history'
    },
    {
      id: 'faded_ink',
      position: { x: 0.5, y: 0.5 },
      tooltip: 'Почти нечитаемо...',
      hint: 'Нужен специальный свет'
    }
  ]
};
```

### 4.3 Обновление журнала улик
**Система:** Коллекционируемые доказательства
**Хранение:** В меню "Дневник детектива"

```typescript
interface ClueJournalEntry {
  id: 'clue_letter_1923';
  title: 'Загадочное письмо';
  dateFound: 'in_game_date';
  location: 'Городской архив';
  description: 'Старое письмо с поврежденной печатью семьи Castello. Текст почти стерся, но упоминается "тайна колокольни".',
  image: 'textures/clues/letter_1923_front.jpg';
  imageBack: 'textures/clues/letter_1923_back.jpg';
  connections: ['mystery_castello_family', 'location_bell_tower'];
  status: 'active'; // active, solved, irrelevant
  notes: string[]; // Заметки игрока
}
```

---

## Scene 23: "Renzo's Doubt" (Сомнения Ренцо)

### 5.1 Монолог Ренцо
**Формат:** Внутренний голос (Voice Over)
**Визуал:** Размытый фон, фокус на лице Ренцо

```typescript
const renzoMonologue: Cutscene = {
  camera: {
    type: 'close_up_face',
    angle: 'three_quarter',
    focusDistance: 0.3,
    aperture: 1.8 // Сильное размытие фона
  },
  character: {
    model: 'renzo_high_detail',
    expression: 'conflicted_thoughtful',
    eyeMovement: 'tracking_invisible_thoughts',
    microExpressions: ['furrow_brow', 'lip_bite', 'side_glance']
  },
  voiceover: {
    file: 'audio/renzo_monologue_doubt.ogg',
    mix: {
      reverb: 'internal_thought',
      eq: 'telephone_filter',
      stereoWidth: 0.5
    }
  },
  subtitles: {
    position: 'bottom_center',
    style: 'thought_bubble',
    animation: 'slow_fade'
  }
};
```

**Текст монолога:**
> "Что я делаю здесь? Елена права, это безумие. Призраки, старые письма... Я художник, а не детектив. Но почему тогда мое сердце бьется так быстро? Почему я не могу просто уйти?"

### 5.2 Визуальная метафора
**Эффект:** Наложение воспоминаний поверх реальности
**Техника:** Double Exposure Shader

```typescript
const doubtVisualMetaphor = {
  shader: 'double_exposure_blend',
  layers: [
    { source: 'current_scene', opacity: 0.7 },
    { source: 'memory_canvas_sketches', opacity: 0.5, blendMode: 'screen' },
    { source: 'ghost_silhouette_faint', opacity: 0.3, blendMode: 'add' }
  ],
  transition: {
    type: 'paint_dissolve',
    duration: 4,
    direction: 'left_to_right'
  }
};
```

---

## Scene 24: "Elena's Revelation" (Откровение Елены)

### 6.1 Контекст сцены
Елена раскрывает Ренцо свою личную связь с тайной Castelvento. Эмоциональная кульминация первой половины главы.

### 6.2 Расположение персонажей
**Камера:** Средний план, оба персонажа в кадре
**Освещение:** Мягкий свет от единственной лампы, создающий интимную атмосферу

```typescript
const revelationBlocking: SceneBlocking = {
  characters: [
    {
      id: 'elena',
      position: { x: -1, y: 0, z: 2 },
      rotation: { y: 15 },
      posture: 'leaning_forward earnest',
      hands: 'clasped_together'
    },
    {
      id: 'renzo',
      position: { x: 1, y: 0, z: 2 },
      rotation: { y: -15 },
      posture: 'sitting_back surprised',
      hands: 'restless_gesturing'
    }
  ],
  camera: {
    movement: 'slow_push_in',
    speed: 0.05,
    finalFraming: 'medium_close_two_shot'
  },
  lighting: {
    keyLight: { intensity: 0.8, color: '#ffdd88' },
    fillLight: { intensity: 0.3, color: '#4455aa' },
    rimLight: { intensity: 0.5, color: '#ffffff' }
  }
};
```

### 6.3 Диалоговая структура
**Тип:** Ветвящийся диалог с выбором тональности ответа
**Варианты выбора:**
1. Поддерживающий ("Я с тобой")
2. Скептический ("Это невероятно")
3. Практический ("Что нам делать дальше?")

```typescript
const elenaRevelationDialogue: DialogueTree = {
  root: {
    speaker: 'elena',
    text: 'Ренцо, я должна тебе кое-что сказать. Эта тайна... она не просто история для книги.',
    voiceover: 'audio/elena_scene24_reveal.ogg',
    next: 'choice_point_1'
  },
  choice_point_1: {
    type: 'choice',
    options: [
      {
        id: 'supportive',
        text: 'Я слушаю тебя, Елена.',
        mood: 'warm_supportive',
        next: 'elena_continues_trust'
      },
      {
        id: 'skeptical',
        text: 'Ты говоришь загадками. Что именно ты имеешь в виду?',
        mood: 'confused_skeptical',
        next: 'elena_explains_detail'
      },
      {
        id: 'practical',
        text: 'Хорошо. И как это меняет наши планы?',
        mood: 'focused_practical',
        next: 'elena_outlines_next_steps'
      }
    ]
  },
  elena_continues_trust: {
    speaker: 'elena',
    text: 'Моя бабушка рассказывала мне об этом всю жизнь. Семья Castello... они мои предки.',
    emotion: 'vulnerable_serious',
    unlockRelationship: 'trust_level_2'
  },
  // ... другие ветки диалога
};
```

### 6.4 Эмоциональная анимация
**Facial Capture:** Детальная мимика для передачи эмоций
**Body Language:** Язык тела соответствует состоянию персонажа

```typescript
const elenaEmotions: AnimationState = {
  base: 'nervous_fidgeting',
  transitions: [
    {
      from: 'nervous',
      to: 'determined',
      trigger: 'dialogue_choice_made',
      duration: 1.5,
      layers: {
        face: 'expression_resolve',
        eyes: 'direct_gaze',
        hands: 'stop_fidgeting_clench',
        posture: 'straighten_spine'
      }
    }
  ],
  microExpressions: [
    { name: 'lip_quiver', timing: 'before_speaking', intensity: 0.6 },
    { name: 'deep_breath', timing: 'pause_before_reveal', intensity: 1.0 },
    { name: 'eye_contact_hold', timing: 'during_key_line', intensity: 0.9 }
  ]
};
```

---

## Scene 25: "The Secret Passage" (Тайный проход)

### 7.1 Обнаружение механизма
**Trigger:** Осмотр определенной книги на полке
**Механика:** Quick Time Event или простая последовательность действий

```typescript
const secretPassageDiscovery: Puzzle = {
  triggerObject: {
    id: 'book_red_leather_bound',
    position: { x: -2.5, y: 1.2, z: -4 },
    highlightColor: '#8b0000',
    interactPrompt: 'Осмотреть книгу'
  },
  puzzle: {
    type: 'sequence_pull',
    steps: [
      { action: 'pull_book', direction: 'out', distance: 0.3 },
      { action: 'rotate_book', angle: 90, direction: 'clockwise' },
      { action: 'push_book', direction: 'in', distance: 0.1 }
    ],
    timeLimit: null,
    hints: ['Книга двигается странно...', 'Механизм щелкает'],
    failureState: null // Нет провала, только замедление
  },
  success: {
    audio: ['mechanism_click', 'stone_grinding_deep'],
    animation: 'bookshelf_rotate_reveal',
    duration: 5,
    cameraShake: { intensity: 0.8, duration: 3 }
  }
};
```

### 7.2 Анимация открытия прохода
**Геометрия:** Вращающийся книжный шкаф
**Физика:** Тяжелый механизм с инерцией

```typescript
const bookshelfMechanism: AnimatedObject = {
  pivot: { x: -2.5, y: 0, z: -4 },
  rotationAxis: 'y',
  totalRotation: -95,
  duration: 5,
  easing: 'easeInOutQuad',
  soundSync: {
    startSound: 'mechanism_engage',
    loopSound: 'stone_grinding_continuous',
    endSound: 'thud_final_position'
  },
  particles: {
    dust: { burstOnStart: true, continuous: true },
    sparks: { chance: 0.1, from: 'metal_friction' }
  },
  lighting: {
    reveal: {
      type: 'point_light',
      color: '#ffaa00',
      intensity: 0,
      animateTo: 1.2,
      duration: 2
    }
  }
};
```

### 7.3 Вид на тайный проход
**Визуал:** Темный каменный коридор, уходящий вниз
**Атмосфера:** Холодный воздух, запах сырости

```typescript
const secretPassageReveal: Environment = {
  geometry: {
    walls: 'rough stone blocks',
    floor: 'worn stone steps descending',
    ceiling: 'vaulted arches low'
  },
  lighting: {
    source: 'torch_wall_mounts unlit',
    playerLight: 'flashlight_or_lantern required',
    fog: { density: 0.05, color: '#1a1a1a' }
  },
  audio: {
    ambient: 'underground_drip_echo',
    wind: 'draft_from_depths',
    reverb: 'tunnel_narrow_long'
  },
  interactables: [
    {
      id: 'torch_first',
      type: 'pickup_light_source',
      position: { x: 0, y: 1.5, z: -2 },
      state: 'unlit',
      requiresItem: 'matches_or_lighter'
    }
  ]
};
```

---

## Scene 26: "Descent into Darkness" (Спуск во тьму)

### 8.1 Переход управления
**Смена режима:** От катсцены к геймплею
**Туториал:** Управление источником света

```typescript
const descentGameplay: GameplaySegment = {
  startCondition: 'player_enters_passage_threshold',
  objectives: [
    {
      id: 'find_light',
      text: 'Найдите способ осветить путь',
      completed: false,
      hints: ['Осмотрите стены', 'Ищите факелы или лампы']
    },
    {
      id: 'descend_stairs',
      text: 'Спуститесь по лестнице',
      completed: false,
      lockedUntil: 'find_light'
    }
  ],
  mechanics: {
    lightSource: {
      type: 'dynamic_point_light',
      attachedTo: 'player_camera',
      range: 8,
      intensity: 1.2,
      color: '#ffcc66',
      flicker: { enabled: true, speed: 0.5, intensity: 0.1 }
    },
    darkness: {
      outsideLightRange: { visibility: 0.05, color: '#0a0a0a' },
      fearMeter: { enabled: false } // Только атмосфера, не хоррор
    }
  }
};
```

### 8.2 Атмосферные эффекты
**Звук:** Капли воды, эхо шагов, далекий ветер
**Визуал:** Дыхание видимое на холоде, паутина

```typescript
const undergroundAtmosphere: VFX = {
  particles: [
    {
      name: 'breath_vapor',
      emitter: 'player_mouth_position',
      rate: 2,
      lifetime: 1.5,
      texture: 'vapor_puff',
      behavior: 'rise_and_dissipate'
    },
    {
      name: 'dust_in_light',
      emitter: 'light_source_volume',
      rate: 50,
      lifetime: 3,
      texture: 'dust mote',
      behavior: 'float_random'
    },
    {
      name: 'water_drips',
      emitter: 'ceiling_positions_array',
      rate: 0.5,
      lifetime: 2,
      physics: 'gravity_with Splash'
    }
  ],
  audioZones: [
    {
      position: { x: 0, y: -5, z: -10 },
      radius: 5,
      sound: 'water_drip_close',
      volume: 0.6
    },
    {
      position: { x: 0, y: -15, z: -20 },
      radius: 10,
      sound: 'wind_howl distant',
      volume: 0.3
    }
  ]
};
```

### 8.3 Первая находка в проходе
**Предмет:** Старый фонарь или записка на стене

```typescript
const firstFind: PickupItem = {
  id: 'item_old_lantern',
  type: 'tool_light_source',
  position: { x: 0.5, y: 1.2, z: -5 },
  model: 'lantern brass oxidized',
  glow: { color: '#ffaa00', intensity: 0.5 },
  pickup: {
    animation: 'reach_and_grab',
    duration: 1.2,
    sound: 'metal_clink_soft'
  },
  upgrade: {
    replaces: 'weak_flashlight',
    benefits: ['wider_beam', 'warmer_color', 'no_battery_needed']
  },
  lore: {
    text: 'Фонарь смотрителя. Похоже, его оставили здесь недавно...',
    unlock: 'keeper_presence_recent'
  }
};
```

---

## Scene 27: "The Hidden Chamber" (Скрытая камера)

### 9.1 Открытие комнаты
**Момент:** Игрок достигает дна лестницы
**Катсцена:** Автоматическое зажигание света

```typescript
const chamberReveal: Cutscene = {
  trigger: 'player_reaches_bottom_step',
  sequence: [
    {
      time: 0,
      action: 'freeze_player_input',
      duration: 0.5
    },
    {
      time: 0.5,
      action: 'auto_light_lantern',
      animation: 'flame_ignite',
      sound: 'whoosh_flame_catch'
    },
    {
      time: 1.5,
      action: 'camera_pan_slow',
      from: { yaw: 0, pitch: 0 },
      to: { yaw: 180, pitch: -10 },
      duration: 6
    },
    {
      time: 2,
      action: 'reveal_room_details',
      fadeDuration: 3
    },
    {
      time: 7.5,
      action: 'resume_player_input'
    }
  ]
};
```

### 9.2 Описание скрытой камеры
**Назначение:** Тайная лаборатория/студия предка
**Детали:** Чертежи, инструменты, незаконченные работы

```typescript
const hiddenChamber: Environment = {
  dimensions: { width: 8, height: 4, depth: 10 },
  theme: 'alchemist_artist_studio_1920s',
  objects: [
    {
      id: 'large_work_table',
      position: { x: 0, y: 0.8, z: -5 },
      items: ['blueprints_scattered', 'compass_brass', 'ink_bottles']
    },
    {
      id: 'wall_blueprints',
      position: { x: -3, y: 1.5, z: -8 },
      content: 'architectural_drawings_castelvento_secret_layers',
      interactable: true,
      examination: 'zoom_blueprint_details'
    },
    {
      id: 'display_case',
      position: { x: 3, y: 0, z: -6 },
      locked: true,
      contains: 'key_item_family_medallion',
      lockType: 'puzzle_lock_combination'
    },
    {
      id: 'journal_on_stand',
      position: { x: -1, y: 1, z: -3 },
      open: true,
      pages: 'readable_journal_entries backstory',
      autoRead: false
    }
  ],
  lighting: {
    primary: 'lantern_player_carried',
    secondary: 'candle_remnants unlit',
    atmosphere: 'mysterious_discovery'
  }
};
```

### 9.3 Ключевой предмет: Семейный медальон
**Важность:** Открывает следующие главы
**Описание:** Серебряный медальон с гравировкой

```typescript
const familyMedallion: KeyItem = {
  id: 'key_castello_medallion',
  name: 'Медальон семьи Castello',
  description: 'Серебряный медальон с изображением герба семьи. Внутри выгравировано: "La verità è nella luce" (Истина в свете).',
  model: {
    mesh: 'medallion silver detailed',
    texture: 'metal tarnished with wear',
    animation: 'gentle swing when moved'
  },
  acquisition: {
    method: 'solve_display_case_puzzle',
    puzzle: {
      type: 'symbol_sequence',
      clues: ['found_on_blueprints', 'journal_hint_page_47'],
      attempts: 'unlimited',
      solution: ['sun', 'tower', 'book', 'key']
    }
  },
  abilities: [
    {
      name: 'Unlock Castello areas',
      description: 'Открывает запертые зоны с гербом семьи'
    },
    {
      name: 'Reveal hidden inscriptions',
      description: 'Активирует невидимые надписи при близком рассмотрении'
    }
  ],
  journalEntry: {
    category: 'key_items',
    image: 'textures/items/medallion_castello.jpg',
    lore: 'Этот медальон принадлежало первому хранителю тайн Castelvento...'
  }
};
```

---

## Technical Implementation Checklist

### Графика и рендеринг
- [ ] Настроить систему объемного освещения (God Rays) для сцен в архиве
- [ ] Реализовать шейдер призрака с эффектом дисторшн и мерцания
- [ ] Создать LOD-модели для множества книг в архиве
- [ ] Настроить пост-обработку: виньетирование, зернистость, цветокоррекция
- [ ] Оптимизировать рендеринг большого количества частиц (пыль, капли)

### Аудио система
- [ ] Настроить динамическую реверберацию для разных помещений
- [ ] Реализовать систему позиционного 3D-звука для шагов и эффектов
- [ ] Создать микс для внутренних монологов (фильтры, эквалайзер)
- [ ] Добавить случайные триггеры атмосферных звуков
- [ ] Синхронизировать звуковые эффекты с анимациями механизмов

### Интерактивность
- [ ] Реализовать механику осмотра предметов с зумом и вращением
- [ ] Создать систему подсказок для интерактивных объектов
- [ ] Настроить физику легких объектов (бумага, ткань)
- [ ] Реализовать QTE для открытия секретных механизмов
- [ ] Создать UI для журнала улик и коллекционных предметов

### Диалоговая система
- [ ] Поддержать ветвящиеся диалоги с выбором реплик
- [ ] Настроить синхронизацию губ с аудио (lip-sync)
- [ ] Реализовать систему эмоций для спрайтов персонажей
- [ ] Добавить поддержку субтитров с настройками стиля
- [ ] Создать систему запоминания выборов для влияния на сюжет

### Сохранение прогресса
- [ ] Сохранять состояние найденных улик
- [ ] Фиксировать пройденные диалоговые ветки
- [ ] Сохранять положение открытых секретных дверей
- [ ] Запоминать полученные ключевые предметы
- [ ] Создавать контрольные точки перед важными сценами

### Производительность
- [ ] Оптимизировать количество draw calls для библиотечных полок
- [ ] Использовать occlusion culling для скрытых зон
- [ ] Настроить level streaming для плавных переходов
- [ ] Реализовать pooling для частиц и звуковых источников
- [ ] Протестировать FPS на целевых устройствах

---

## Acceptance Criteria

### Функциональные
1. Все 9 сцен (19-27) воспроизводятся последовательно без ошибок
2. Игрок может взаимодействовать со всеми заявленными объектами
3. Диалоговая система корректно обрабатывает все варианты выбора
4. Система улик сохраняет все найденные предметы
5. Механизм открытия тайного прохода работает корректно

### Визуальные
1. Эффект призрака выглядит убедительно и атмосферно
2. Освещение в архиве и подземелье создает нужную атмосферу
3. Анимации персонажей плавные и соответствуют эмоциям
4. UI элементов минималистичен и соответствует винтажному стилю
5. Переходы между сценами плавные, без резких скачков

### Аудио
1. Все реплики озвучены и синхронизированы с текстом
2. Фоновая музыка меняется в соответствии с настроением сцены
3. Звуковые эффекты срабатывают в правильный момент
4. Микс голосов и музыки сбалансирован
5. Реверберация корректно применяется для разных помещений

### Технические
1. FPS не опускается ниже 30 на целевых устройствах
2. Время загрузки между сценами не превышает 3 секунд
3. Сохранения создаются корректно и загружаются без ошибок
4. Отсутствуют критические баги и вылеты
5. Код соответствует принятым стандартам проекта

---

## Edge Cases & Error Handling

### Возможные проблемы и решения

1. **Игрок пропускает важную улику**
   - Решение: Система мягких подсказок после 2 минут бездействия
   -Fallback: Улика становится доступной позже через диалог

2. **QTE провален多次**
   - Решение: После 3 неудач предлагать пропустить мини-игру
   - Альтернатива: Упростить последовательность автоматически

3. **Аудиофайл не загрузился**
   - Решение: Автоматическое переключение на субтитры
   - Логирование: Отправить отчет об ошибке разработчикам

4. **Текстуры не подгрузились**
   - Решение: Показать заглушки с цветовой кодировкой
   - Восстановление: Повторная попытка загрузки в фоне

5. **Сохранение повредилось**
   - Решение: Автоматическое создание backup сохранений
   - Восстановление: Откат к предыдущей контрольной точке

---

## References & Inspiration

### Визуальные референсы
- **Архив:** Библиотека в фильме "Имя розы" (1986)
- **Призрак:** Эффекты из игры "Hellblade: Senua's Sacrifice"
- **Освещение:** Картины Караваджо (кьяроскуро)
- **Тайные проходы:** Серия игр "Professor Layton"

### Аудио референсы
- **Атмосфера:** Саундтрек "Silent Hill 2" (ambient tracks)
- **Голос призрака:** Обработка вокала в "Hellblade"
- **Механизмы:** Звуки из серии "Myst"

### Геймплейные референсы
- **Исследование:** Серия "Gone Home"
- **Диалоги:** "Life is Strange" (ветвления)
- **Головоломки:** "The Witness" (логические цепочки)

---

## Notes for Developers

### Приоритеты реализации
1. **Высокий приоритет:** Базовая навигация, диалоги, ключевые катсцены
2. **Средний приоритет:** Побочные взаимодействия, коллекционные предметы
3. **Низкий приоритет:** Дополнительные анимации, пасхалки, альтернативные пути

### Технические ограничения
- Максимальное количество одновременных источников света: 8
- Лимит полигонов для сцены архива: 50,000 треугольников
- Максимальный размер текстур: 2048x2048 (1024 для мобильных)
- Лимит аудио каналов: 32 одновременных звука

### Рекомендации по оптимизации
- Использовать атласы текстур для мелких объектов
- Применять билборды для дальних объектов
- Кэшировать часто используемые анимации
- Пулить звуковые источники и частицы

---

*Документ содержит полную техническую спецификацию для реализации сцен 19-27 Главы 1. Все требования обязательны к исполнению для достижения задуманного качества продукта.*
