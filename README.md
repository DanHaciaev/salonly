# Salonly

Мультитенантная SaaS-платформа онлайн-записи для любого бизнеса по услугам —
копия Altegio. Каждый клиент платформы получает свою страницу (лого,
название, услуги, цены, специалисты, портфолио, отзывы) по адресу
`/<slug>`, его клиенты бронируют без регистрации, владелец управляет всем
через CRM-панель. Доступ платный: 7 дней бесплатно без карты, затем разовый
платёж $200 через Lemon Squeezy — доступ открывается навсегда, без подписки
и повторных списаний (Stripe не поддерживает Молдову как страну продавца,
Lemon Squeezy и Paddle — поддерживают; взял Lemon Squeezy за более простой API).

## Стек

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Supabase** — Postgres, Auth, Storage
- **Tailwind CSS v4** + **shadcn/ui**
- **Lemon Squeezy** — разовая оплата доступа (Checkout + webhook)
- **Resend** — email-уведомления
- **Telegram Bot API** — уведомления в Telegram

## Структура

- `/` — маркетинговый лендинг самой платформы
- `/login`, `/signup`, `/onboarding` — вход и регистрация владельца
- `/dashboard/*` — CRM: услуги, мастера (+портфолио, расписание), записи, отзывы, уведомления, настройки, аналитика
- `/dashboard/billing` — подписка (вне гейта по оплате, иначе владелец не смог бы её оформить)
- `/[business]` — публичная страница по `slug`
- `/[business]/book` — флоу онлайн-записи (слоты считаются от расписания конкретного мастера)
- `/[business]/staff/[staffId]` — портфолио и отзывы мастера
- `/staff/[token]` — личный кабинет мастера без пароля (свои записи, отзывы, портфолио)

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
| `LEMONSQUEEZY_API_KEY` | Lemon Squeezy → Settings → API (Test mode) |
| `LEMONSQUEEZY_STORE_ID` | Lemon Squeezy → Settings → General |
| `LEMONSQUEEZY_VARIANT_ID` | Lemon Squeezy → Products → вариант подписки $200/мес |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Lemon Squeezy → Settings → Webhooks → signing secret |

### Применение схемы БД

Миграции в `supabase/migrations/` (по порядку, через SQL Editor или CLI):
`0001_init.sql` (базовая схема), `0002_staff_access_token.sql` (личный
кабинет мастера), `0003_staff_hours.sql` (расписание по мастерам, убирает
`business_hours`), `0004_billing.sql` (подписка).

Проще всего применить вручную: Supabase Dashboard → **SQL Editor** → New query →
вставить содержимое файла → **Run**, по одному файлу за раз.

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

### Lemon Squeezy

1. Зарегистрируйтесь на [lemonsqueezy.com](https://lemonsqueezy.com), создайте Store.
   Оставайтесь в **Test mode** (переключатель в дашборде), пока не будете готовы
   принимать реальные платежи.
2. Settings → API → создайте API-ключ.
3. Settings → General → скопируйте Store ID.
4. Products → New product → тип **Single payment**, цена **$200.00** (разовая, не
   подписка — 7-дневный бесплатный период считается в самом приложении, Lemon
   Squeezy тут не участвует) → сохраните, скопируйте Variant ID (виден в URL
   страницы варианта).
5. После деплоя: Settings → Webhooks → Add webhook → URL
   `https://<ваш-домен>/api/lemonsqueezy/webhook`, события — только
   `order_created` → задайте Signing secret (любая строка, впишите её же в
   `LEMONSQUEEZY_WEBHOOK_SECRET`).
6. В Test mode чекаут принимает тестовые карты — номер и подсказки показываются
   прямо на форме оплаты при открытом переключателе Test mode.
7. Когда всё проверено — выключите Test mode, создайте тот же продукт в боевом
   режиме и замените тестовые ключи на боевые в переменных окружения Vercel.

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
4. После первого деплоя настройте Telegram- и Lemon Squeezy-вебхуки (см. выше) на домен Vercel.
