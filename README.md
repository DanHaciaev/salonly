# Salonly

Мультитенантная SaaS-платформа онлайн-записи для любого бизнеса по услугам —
копия Altegio. Каждый клиент платформы получает свою страницу (лого,
название, услуги, цены, специалисты, портфолио, отзывы) по адресу
`/<slug>`, его клиенты бронируют без регистрации, владелец управляет всем
через CRM-панель. Подписка платная: 7 дней бесплатно, затем $200/мес через
Stripe.

## Стек

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Supabase** — Postgres, Auth, Storage
- **Tailwind CSS v4** + **shadcn/ui**
- **Stripe** — платная подписка (Checkout + Billing Portal + webhook)
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
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys (Test mode) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe → Developers → API keys (Test mode) |
| `STRIPE_PRICE_ID` | Stripe → Products → цена $200/мес recurring |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Developers → Webhooks → signing secret |

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

### Stripe

1. Зарегистрируйтесь на [stripe.com](https://stripe.com), оставайтесь в **Test mode**
   (переключатель в шапке дашборда) пока не будете готовы принимать реальные платежи.
2. Developers → API keys → скопируйте Secret key и Publishable key.
3. Products → Add product → цена **$200.00**, **Recurring**, **Monthly** → сохраните,
   скопируйте Price ID (`price_...`).
4. После деплоя: Developers → Webhooks → Add endpoint → URL
   `https://<ваш-домен>/api/stripe/webhook`, события — `checkout.session.completed`,
   `customer.subscription.updated`, `customer.subscription.deleted` → скопируйте
   signing secret (`whsec_...`).
5. Тестовая карта для чекаута: `4242 4242 4242 4242`, любая будущая дата, любой CVC.
6. Когда всё проверено — переключите Stripe на Live mode, создайте там тот же продукт
   и замените тестовые ключи на боевые в переменных окружения Vercel.

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
