# Salonly

Мультитенантная SaaS-платформа онлайн-записи для салонов красоты — копия Altegio.
Каждый салон получает свою страницу (лого, название, услуги, цены, мастера,
портфолио, отзывы) по адресу `/<slug>`, клиенты бронируют без регистрации,
владелец управляет всем через CRM-панель.

## Стек

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Supabase** — Postgres, Auth, Storage
- **Tailwind CSS v4** + **shadcn/ui**
- **Resend** — email-уведомления
- **Telegram Bot API** — уведомления в Telegram

## Структура

- `/` — маркетинговый лендинг самой платформы
- `/login`, `/signup`, `/onboarding` — вход и регистрация владельца салона
- `/dashboard/*` — CRM: услуги, мастера (+портфолио), записи, отзывы, уведомления, настройки, аналитика
- `/[business]` — публичная страница салона по его `slug`
- `/[business]/book` — флоу онлайн-записи
- `/[business]/staff/[staffId]` — портфолио и отзывы мастера

## Настройка окружения

Скопируйте `.env.local.example` в `.env.local` и заполните:

```bash
cp .env.local.example .env.local
```

| Переменная | Где взять |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API (publishable/anon key) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (secret/service_role key) |
| `RESEND_API_KEY` | resend.com → API Keys |
| `RESEND_FROM_EMAIL` | Проверенный отправитель в Resend |
| `TELEGRAM_BOT_TOKEN` | @BotFather → `/newbot` |
| `TELEGRAM_BOT_USERNAME` | Юзернейм бота без `@` |
| `NEXT_PUBLIC_SITE_URL` | URL деплоя (в деве — `http://localhost:3000`) |

### Применение схемы БД

Схема и RLS-политики лежат в `supabase/migrations/0001_init.sql`.

Проще всего применить её вручную: Supabase Dashboard → **SQL Editor** → New query →
вставить содержимое файла → **Run**.

Либо через CLI (нужна авторизация `supabase login`):

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
```

### Telegram-бот

1. Создайте бота через [@BotFather](https://t.me/BotFather), сохраните токен и юзернейм.
2. После деплоя укажите вебхук:
   ```bash
   curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<ваш-домен>/api/telegram/webhook"
   ```
   Вебхук требует публичный HTTPS-адрес — локально (на `localhost`) бот работать не будет,
   только после деплоя на Vercel.

## Локальная разработка

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Деплой

1. Запушьте репозиторий в GitHub.
2. Импортируйте его в [Vercel](https://vercel.com/new).
3. Добавьте все переменные из `.env.local` в Vercel → Project Settings → Environment Variables
   (для `NEXT_PUBLIC_SITE_URL` укажите итоговый домен Vercel).
4. После первого деплоя настройте Telegram-вебхук (см. выше) на домен Vercel.
