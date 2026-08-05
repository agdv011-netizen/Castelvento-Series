# Castelvento Series - Полная документация архитектуры

## 📋 Обзор проекта

**Castelvento Series** — это гибридная многожанровая игра, сочетающая:
- 📖 Визуальную новеллу
- ⚔️ RPG элементы
- 🏰 Tycoon механики
- 🎮 Мини-игры (2D/3D)

### Ключевые особенности
- ✅ Кроссплатформенность (Web, Windows, Android, iOS)
- ✅ Клиент-серверная архитектура
- ✅ Система авторизации и сохранений
- ✅ Рейтинги и достижения
- ✅ Монетизация (бесплатная основа + платные DLC)

---

## 🏗️ Архитектура проекта

```
castelvento-series/
├── client/              # React + Vite клиент
│   ├── src/
│   │   ├── core/        # Базовые утилиты
│   │   ├── components/  # UI компоненты
│   │   │   ├── ui/      # Общие UI элементы
│   │   │   ├── novel/   # Компоненты визуальной новеллы
│   │   │   ├── rpg/     # RPG элементы
│   │   │   ├── tycoon/  # Tycoon механики
│   │   │   └── minigames/ # Мини-игры
│   │   ├── hooks/       # Custom React hooks
│   │   ├── store/       # Zustand stores
│   │   └── assets/      # Изображения, аудио, шрифты
│   ├── package.json
│   └── vite.config.ts
│
├── server/              # Node.js + Express сервер
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/        # Авторизация
│   │   │   ├── progress/    # Сохранения прогресса
│   │   │   ├── inventory/   # Инвентарь
│   │   │   ├── leaderboard/ # Рейтинги
│   │   │   └── monetization/# Платежи (Stripe, Steam, IAP)
│   │   ├── common/      # Общие утилиты
│   │   └── config/      # Конфигурация
│   └── package.json
│
├── shared/              # Общий код (валидация, типы)
│   ├── src/
│   └── package.json
│
├── mobile/              # Capacitor для мобильных платформ
│   ├── android/
│   ├── ios/
│   └── package.json
│
├── docker/              # Docker конфигурация
│   └── init.sql         # SQL схема БД
│
├── docs/                # Дополнительная документация
├── docker-compose.yml   # Docker Compose
├── package.json         # Корневой package.json (workspaces)
└── .env.example         # Пример переменных окружения
```

---

## 🛠️ Технологический стек

### Клиент (Frontend)
| Технология | Назначение |
|------------|------------|
| **React 18** | Основной UI фреймворк |
| **Vite** | Сборщик и dev-сервер |
| **TypeScript** | Типизация |
| **Zustand** | Управление состоянием |
| **Framer Motion** | Анимации интерфейса |
| **Howler.js** | Аудио (музыка, SFX) |
| **Phaser 3** | 2D мини-игры |
| **Three.js + R3F** | 3D сцены и эффекты |
| **React Router** | Навигация |
| **i18next** | Интернационализация (RU/EN) |
| **Axios** | HTTP запросы к серверу |

### Сервер (Backend)
| Технология | Назначение |
|------------|------------|
| **Node.js + Express** | REST API |
| **TypeScript** | Типизация |
| **PostgreSQL** | Основная БД |
| **Redis** | Кэш, сессии, рейтинги в реальном времени |
| **JWT** | Аутентификация |
| **Bcrypt** | Хеширование паролей |
| **Zod** | Валидация данных |
| **Stripe** | Платежи (веб, DLC) |
| **Winston** | Логирование |
| **Helmet + CORS** | Безопасность |

### Мобильные платформы
| Технология | Назначение |
|------------|------------|
| **Capacitor 5** | Обёртка для Android/iOS |
| **In-App Purchases** | Встроенные покупки |
| **Push Notifications** | Уведомления |

### Desktop (Windows/Steam)
| Технология | Назначение |
|------------|------------|
| **Electron** | Desktop обёртка |
| **electron-builder** | Сборка установщиков |

### Инфраструктура
| Технология | Назначение |
|------------|------------|
| **Docker + Docker Compose** | Локальная разработка |
| **PostgreSQL 16** | Продакшен БД |
| **Redis 7** | Кэш и сессии |

---

## 🚀 Быстрый старт

### 1. Требования
- Node.js >= 18
- npm >= 9
- Docker + Docker Compose

### 2. Установка зависимостей
```bash
npm install
```

### 3. Настройка окружения
```bash
cp .env.example .env
# Отредактируйте .env, особенно JWT_SECRET и ключи платежей
```

### 4. Запуск баз данных (Docker)
```bash
npm run docker:up
# Или напрямую:
docker-compose up -d
```

### 5. Запуск разработки
```bash
npm run dev
# Запустит клиент (порт 5173) и сервер (порт 3000)
```

### 6. Сборка для продакшена
```bash
npm run build
```

---

## 📱 Сборка для платформ

### Android
```bash
cd mobile
npm install
npx cap sync android
npm run android
# Для сборки APK/AAB:
npm run build:android
```

### iOS
```bash
cd mobile
npm install
npx cap sync ios
npm run ios
# Для сборки в Xcode:
npm run build:ios
```

### Windows (Steam)
```bash
cd client
npm run electron:build
# Создаст установщик в dist/
```

---

## 🔐 Система авторизации

### Поток аутентификации
1. Регистрация через email/пароль
2. Сервер хеширует пароль (bcrypt)
3. Выдача JWT access token (7 дней) + refresh token (30 дней)
4. Access token хранится в памяти, refresh — в httpOnly cookie
5. При истечении access token — автоматическое обновление через refresh

### API эндпоинты
```
POST /api/auth/register      # Регистрация
POST /api/auth/login         # Вход
POST /api/auth/logout        # Выход
POST /api/auth/refresh       # Обновление токена
POST /api/auth/forgot-password # Сброс пароля
GET  /api/auth/me            # Получить текущий профиль
```

---

## 💾 Система сохранений

### Структура сохранения (JSONB)
```json
{
  "player": {
    "name": "Hero",
    "level": 5,
    "stats": {...},
    "inventory": [...]
  },
  "story": {
    "currentChapter": "chapter_3",
    "choices": [...],
    "flags": {...}
  },
  "tycoon": {
    "resources": {...},
    "buildings": [...],
    "employees": [...]
  },
  "minigames": {
    "highscores": {...},
    "unlocked": [...]
  },
  "playtime": 3600,
  "gameVersion": "0.1.0"
}
```

### API эндпоинты
```
GET    /api/saves              # Список сохранений
POST   /api/saves              # Создать сохранение
PUT    /api/saves/:id          # Обновить сохранение
DELETE /api/saves/:id          # Удалить сохранение
```

---

## 🏆 Рейтинги и достижения

### Таблица лидеров
- Поддерживает несколько режимов игры
-实时更新 через Redis Sorted Sets
- Синхронизация с PostgreSQL для персистентности

### API эндпоинты
```
GET /api/leaderboard/:gameMode  # Топ игроков
GET /api/leaderboard/user/:userId # Позиция игрока
POST /api/leaderboard/submit    # Отправить результат
```

---

## 💰 Монетизация

### Модель
- **Базовая игра**: бесплатно
- **DLC**: платные дополнения (главы, персонажи)
- **Косметика**: скины, аватары
- **Валюта**: внутриигровые монеты (опционально)

### Поддерживаемые платформы
| Платформа | Провайдер |
|-----------|-----------|
| Web | Stripe |
| Steam | Steamworks API |
| Android | Google Play Billing |
| iOS | Apple In-App Purchase |

### API эндпоинты
```
POST /api/payments/create-intent    # Создать платеж (Stripe)
POST /api/payments/webhook          # Вебхук от платежной системы
GET  /api/purchases                 # История покупок
POST /api/purchases/restore         # Восстановить покупки
```

---

## 📊 База данных

### Основные таблицы
- `users` — пользователи
- `user_profiles` — профили игроков
- `game_saves` — сохранения
- `inventory_items` — инвентарь
- `purchases` — покупки
- `leaderboard_entries` — рекорды
- `user_sessions` — сессии

Схема находится в `docker/init.sql`

---

## 🌍 Интернационализация

Поддержка языков:
- 🇷🇺 Русский
- 🇬🇧 English

Файлы переводов будут в `client/src/assets/locales/`

---

## 📝 Следующие шаги

1. ✅ **Архитектура создана** — этот документ
2. ⏳ **Инициализация проекта** — установка зависимостей
3. ⏳ **Базовый UI** — экран заставки, главное меню
4. ⏳ **Авторизация** — регистрация/вход
5. ⏳ **Визуальная новелла** — движок диалогов
6. ⏳ **RPG система** — характеристики, инвентарь
7. ⏳ **Tycoon механики** — ресурсы, постройки
8. ⏳ **Мини-игры** — Phaser + Three.js интеграция
9. ⏳ **Серверная логика** — API, БД
10. ⏳ **Тестирование** — unit, integration, e2e
11. ⏳ **Сборка** — мобильные платформы + Steam

---

## 📞 Контакты

Репозиторий: https://github.com/agdv011-netizen/Castelvento-Series
