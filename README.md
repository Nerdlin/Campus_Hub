# Campus Hub — образовательная платформа

Campus Hub — веб-платформа на Next.js/React для студентов, преподавателей и администраторов: дашборды, оценки, расписание, сообщения и AI-функции.

## Основные возможности
- Раздельные интерфейсы для ролей: `student`, `teacher`, `admin`
- Управление пользователями, предметами, оценками и расписанием
- Сообщения и чаты
- Страница материалов и вложений
- API-роут для AI (`/api/gpt`)
- Поддержка светлой/тёмной темы

## Режимы работы
### 1) Локальный full-stack
- Frontend: Next.js
- Backend: локальный `server.js`
- Полный рабочий CRUD и авторизация

### 2) GitHub Pages demo mode
- Если `NEXT_PUBLIC_API_URL` не задан при Pages-сборке, включается демо-режим
- Данные хранятся в `localStorage` браузера
- Ошибка `405` для `/login` в этом режиме не возникает

### 3) Production API mode (Render/VPS)
- Фронтенд отправляет реальные запросы в ваш API
- Нужно задать `NEXT_PUBLIC_API_URL=https://<your-api>/api`

## Быстрый старт (локально)
```bash
npm install
npm run dev
```

По умолчанию:
- приложение: `http://localhost:3000`
- локальный API: `http://localhost:4000`

## Переменные окружения
Создайте `.env.local`:

```env
# Frontend/API
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_BASE_PATH=/Campus_Hub
NEXT_PUBLIC_GITHUB_PAGES=false

# Интеграции
OPENAI_API_KEY=
OPENWEATHER_API_KEY=
NEWSAPI_KEY=

# Локальный API-сервер
PORT=4000
CORS_ORIGIN=*
MAX_UPLOAD_SIZE_MB=10
```

## Демо-аккаунты (Pages demo mode)
- `admin@campushub.local / admin123`
- `teacher@campushub.local / teacher123`
- `student@campushub.local / student123`

## Скрипты
| Скрипт | Что делает |
|---|---|
| `npm run dev` | Запускает Next.js + локальный API |
| `npm run server` | Поднимает только локальный API |
| `npm run build` | Production-сборка |
| `npm run start` | Запуск собранного приложения |
| `npm run lint` | Проверки ESLint |

## Настройка Render (если нужен реальный backend)
1. Поднимите API-сервис на Render.
2. Убедитесь, что доступны роуты вида `/api/login`, `/api/register`, и т.д.
3. В GitHub Actions для Pages передайте:
   - `NEXT_PUBLIC_API_URL=https://<your-render-domain>/api`
4. Перезапустите деплой Pages.

## Почему бывает 405 на GitHub Pages
`405 Method Not Allowed` появляется, когда фронтенд пытается сделать `POST /login` на статический хостинг без API.

В этом репозитории это закрыто demo-режимом: без `NEXT_PUBLIC_API_URL` на Pages приложение уходит в браузерный fallback.

## Структура проекта
```text
Campus_Hub/
  src/
    app/                  # Страницы (App Router)
    components/           # UI и бизнес-компоненты
    hooks/                # React hooks
    lib/
      api.ts              # Единый API слой + demo fallback
      i18n.ts             # Инициализация i18n
    api/                  # Legacy-обёртки для совместимости
  server.js               # Локальный API для разработки
  db.json                 # Данные json-server
  .github/workflows/
    deploy-pages.yml      # Деплой на GitHub Pages
    ci.yml                # CI-проверки
```

## Скриншоты
![Chat](public/preview-chat.png)
![Dark Theme](public/preview-dark.png)
![Admin Panel](public/preview-admin.png)

## Лицензия
MIT
