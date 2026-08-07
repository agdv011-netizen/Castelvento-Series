# Task 4.2: Интерактивные объекты и инвентарь (Interactive Objects & Inventory System)

## Цель
Создать систему взаимодействия с окружением, позволяющую игроку исследовать мир, собирать предметы, комбинировать их и использовать для решения головоломок.

---

## 1. Система интерактивных объектов

### 1.1 Архитектура объекта (InteractiveObject)
Каждый интерактивный объект в сцене наследуется от базового класса и содержит мета-данные.

**Структура данных (TypeScript Interface):**
```typescript
interface InteractiveObject {
  id: string;
  name: string; // Для отображения при наведении
  description: string; // Подробное описание при осмотре
  type: 'pickup' | 'usable' | 'static' | 'npc' | 'door';
  
  // Визуализация
  meshRef: THREE.Mesh; // Ссылка на 3D модель
  highlightColor: number; // Цвет подсветки (hex)
  cursorType: 'pointer' | 'grab' | 'talk' | 'eye';
  
  // Логика
  isPickupable: boolean;
  interactionRange: number; // Дистанция для взаимодействия
  actions: InteractionAction[];
  
  // Состояние
  state: Record<string, any>; // Флаги (открыто/закрыто, включено/выключено)
  inventoryId?: string; // ID предмета, если это лутаемый объект
}

interface InteractionAction {
  id: string;
  label: string; // Текст кнопки (e.g., "Взять", "Открыть", "Говорить")
  icon?: string;
  condition?: () => boolean; // Условие доступности действия
  execute: () => void; // Логика выполнения
}
```

### 1.2 Raycasting и выделение (Highlight System)
**Реализация:**
1.  **Raycaster**: Испускает луч из центра камеры при движении мыши / таче.
2.  **Layers**: Интерактивные объекты находятся на отдельном слое (`layer: 1`), чтобы не пересекаться с декорациями.
3.  **Hover Effect**:
    *   При наведении: изменение цвета материала (`emissive` property) или пост-процессинг (outline pass).
    *   Курсор меняется в зависимости от типа объекта (`cursorType`).
    *   Всплывающая подсказка (Tooltip) с именем объекта через 0.5с после наведения.

**Код выделения (Three.js logic):**
```typescript
function onPointerMove(event: PointerEvent) {
  // Нормализация координат мыши
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(interactiveLayer.children);

  if (intersects.length > 0) {
    const object = intersects[0].object;
    if (currentHovered !== object) {
      resetHighlight(currentHovered);
      applyHighlight(object);
      showTooltip(object.userData.name);
      currentHovered = object;
    }
  } else {
    resetHighlight(currentHovered);
    hideTooltip();
    currentHovered = null;
  }
}
```

### 1.3 Контекстное меню действий
При клике на объект (или нажатии 'E') открывается радиальное или списочное меню доступных действий.
*   **Look**: Показать полное описание (`description`).
*   **Take**: Переместить предмет в инвентарь, скрыть меш со сцены.
*   **Use**: Применить выбранный предмет из инвентаря на этот объект.
*   **Talk**: Запустить диалог (если тип `npc`).

---

## 2. Система инвентаря

### 2.1 Структура данных предмета
```typescript
interface InventoryItem {
  id: string;
  name: string;
  description: string;
  iconUrl: string; // Путь к спрайту иконки
  modelUrl?: string; // Путь к 3D модели для осмотра
  type: 'key' | 'document' | 'tool' | 'quest' | 'material';
  
  // Логика
  stackable: boolean;
  maxStack: number;
  combinableWith: string[]; // IDs предметов, с которыми можно комбинировать
  usableOn: string[]; // IDs объектов, на которых можно применить
  
  // Мета
  acquiredDate: number;
  flags: Record<string, any>;
}
```

### 2.2 UI Инвентаря
**Дизайн:**
*   Стиль: Открытый рюкзак или деревянный ящик на столе.
*   Сетка: Гексагональная или квадратная (максимум 4x6 слотов для реализма).
*   Анимация: Плавное появление (`scale-up`), перетаскивание с тенью.

**Функционал:**
1.  **Drag & Drop**:
    *   Перемещение предметов между слотами.
    *   Объединение стаков (если `stackable: true`).
2.  **Inspect Mode**:
    *   Клик по предмету открывает модальное окно с детальной 3D моделью или большим изображением.
    *   Возможность вращения модели (360°).
    *   Текстовое описание и заметки игрока (можно добавить поле для ввода заметок).
3.  **Context Actions**:
    *   Кнопки "Использовать", "Комбинировать", "Выбросить" (с подтверждением).

### 2.3 Логика комбинации предметов
Алгоритм крафта/комбинации:
1.  Игрок перетаскивает предмет A на предмет B в инвентаре.
2.  Система проверяет массив `combinableWith` у обоих предметов.
3.  Если совпадение найдено -> Запуск скрипта комбинации.
4.  Результат: Удаление исходных предметов, добавление нового предмета в инвентарь + запись флага в глобальное состояние.

**Пример:**
*   `flashlight` + `battery` = `flashlight_charged`
*   `old_key` + `magnet` = `rusty_key_cleaned`

---

## 3. Механика использования предметов (Use System)

### 3.1 Применение на объектах окружения
1.  Игрок выбирает предмет в инвентаре (активный слот).
2.  Наводит курсор на интерактивный объект.
3.  Если `item.usableOn` содержит `object.id`:
    *   Курсор меняется на "Use".
    *   При клике запускается анимация использования.
    *   Обновляется состояние объекта (например, `door.isOpen = true`).
    *   Предмет расходуется (если `consumable: true`) или возвращается в инвентарь.

### 3.2 Скрипты событий
Каждое успешное использование триггерит событие:
```typescript
onItemUsed: (itemId: string, targetId: string) => {
  if (itemId === 'brass_key' && targetId === 'church_door') {
    playAnimation('door_unlock');
    playSound('unlock_mechanism');
    setFlag('church_access', true);
    removeItem('brass_key');
  }
}
```

---

## 4. Технические детали реализации

### 4.1 Управление состоянием (Zustand Store)
```typescript
interface InventoryStore {
  items: InventoryItem[];
  activeItemId: string | null;
  
  addItem: (item: InventoryItem) => void;
  removeItem: (id: string) => void;
  combineItems: (id1: string, id2: string) => boolean;
  useItem: (itemId: string, targetId: string) => boolean;
  toggleInventory: () => void;
  isOpen: boolean;
}
```

### 4.2 Сохранение и загрузка
Инвентарь сохраняется в `savegame.json`:
```json
{
  "inventory": [
    { "id": "postcard_01", "flags": { "read": true } },
    { "id": "bicycle_pump", "state": "equipped" }
  ],
  "worldState": {
    "church_door_unlocked": false,
    "fountain_fixed": true
  }
}
```

---

## 5. Чек-лист реализации

- [ ] Создать базовый класс `InteractiveObject` и типы TypeScript.
- [ ] Реализовать систему Raycasting для выделения объектов.
- [ ] Сделать визуальную подсветку (Highlight) и тултипы.
- [ ] Сверстать UI инвентаря (сетка, слоты, иконки).
- [ ] Реализовать Drag & Drop для предметов.
- [ ] Написать логику подбора предметов (`pickup`) и исчезновения со сцены.
- [ ] Создать режим инспекции предмета (3D просмотр).
- [ ] Реализовать систему комбинации предметов (крафт).
- [ ] Написать систему применения предметов на объектах окружения.
- [ ] Интегрировать звуки взаимодействия (подбор, использование, ошибка).
- [ ] Протестировать на сцене "Пляж": подобрать ракушку, комбинировать с камнем, открыть сундук.

---

## 6. Пример сценария взаимодействия

**Сцена:** Старый маяк.
**Объект:** Заржавленная дверь.
**Предметы:** `RustyKey`, `OilCan`.

1.  Игрок кликает на дверь -> Сообщение: "Она заржавела и не поддается."
2.  Игрок берет `OilCan` из инвентаря.
3.  Наводит на дверь -> Курсор меняется на "Смазать".
4.  Клик -> Анимация смазывания, звук шипения.
5.  Состояние двери меняется на `oiled: true`.
6.  Игрок использует `RustyKey` -> Дверь открывается.
7.  Флаг `lighthouse_entered` становится `true`.
