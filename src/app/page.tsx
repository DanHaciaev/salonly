import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Sparkle,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Pill } from "@/components/brand/pill";
import { SectionLabel } from "@/components/brand/section-label";

function NumberBadge({ n }: { n: string }) {
  return (
    <span className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-soft-blush/40 font-heading text-base text-soft-blush">
      {n}
    </span>
  );
}

const steps = [
  {
    n: "01",
    title: "регистрация",
    body: "Создаёте аккаунт, придумываете адрес своей страницы — salonly.app/ваш-бизнес.",
  },
  {
    n: "02",
    title: "настройка страницы",
    body: "Загружаете лого, описываете услуги и цены, добавляете специалистов и их портфолио.",
  },
  {
    n: "03",
    title: "подключение уведомлений",
    body: "Привязываете Telegram-бота или почту — и вы, и клиент получаете уведомления о записи.",
  },
  {
    n: "04",
    title: "приём записей",
    body: "Публикуете ссылку клиентам, записи и аналитика стекаются в вашу CRM-панель.",
  },
];

const plan = {
  price: "$200",
  period: "разово",
  note: "7 дней бесплатно без карты, дальше — один платёж и доступ навсегда",
  features: [
    "Неограниченно специалистов и услуг",
    "Своя страница и своя ссылка",
    "CRM: аналитика, записи, отзывы",
    "Email и Telegram-уведомления",
    "Личный кабинет для каждого специалиста",
    "Гибкое расписание работы под каждого",
    "Никаких подписок и повторных списаний",
  ],
  cta: "Начать бесплатный период",
};

const faqs = [
  {
    q: "Нужно ли клиентам регистрироваться, чтобы записаться?",
    a: "Нет. Клиент открывает страницу вашего бизнеса, выбирает услугу, специалиста и время, оставляет имя и телефон — без создания аккаунта.",
  },
  {
    q: "Как клиенты узнают, что запись подтверждена?",
    a: "Уведомление уходит на email или в Telegram — клиент сам выбирает канал при записи, вы настраиваете оба в один клик.",
  },
  {
    q: "Можно ли изменить дизайн страницы под свой бренд?",
    a: "Да — логотип, название, услуги, цены, состав команды, портфолио и отзывы полностью редактируются в вашей CRM-панели.",
  },
  {
    q: "Это подписка? Будут ли повторные списания?",
    a: "Нет. 7 дней можно пользоваться платформой бесплатно без карты, а дальше — один платёж $200, и доступ открывается навсегда. Больше никаких списаний.",
  },
  {
    q: "Подходит ли платформа не только для салонов красоты?",
    a: "Да — платформой пользуются салоны, студии, мастерские, консультанты и любой другой бизнес, где клиенты записываются на услугу к конкретному специалисту.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-espresso/10 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-heading text-xl font-medium text-espresso">
            salonly
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            <Pill>Возможности</Pill>
            <Pill>Тарифы</Pill>
            <Pill>Как это работает</Pill>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Войти</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">
                Начать бесплатно <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden px-6 pt-14 pb-28">
        <div className="pointer-events-none absolute inset-x-0 top-6 select-none whitespace-nowrap text-center font-heading text-[14vw] leading-none font-light text-espresso/[0.06] md:text-[9vw]">
          BOOKING ONLINE
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <Pill className="mx-auto mb-8 bg-white/80">
            <Sparkle className="size-3.5 text-soft-blush" />
            платформа онлайн-записи нового поколения
          </Pill>

          <h1 className="font-heading text-5xl leading-[1.05] font-medium text-espresso md:text-7xl">
            Ваш бизнес,
            <br />
            <span className="relative inline-block">
              <span className="text-soft-blush">онлайн за 10 минут</span>
              <svg
                viewBox="0 0 300 20"
                className="absolute -bottom-2 left-0 h-4 w-full text-soft-blush"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 14C60 2 240 2 298 14"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-espresso/70 md:text-lg">
            Своя страница записи, CRM для управления услугами и специалистами,
            уведомления клиентам в Telegram и на почту — без разработчиков и
            без лишних настроек.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="h-12 px-7 text-base" asChild>
              <Link href="/signup">
                Создать свою страницу <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-7 text-base" asChild>
              <Link href="/demo-salon">Смотреть демо</Link>
            </Button>
          </div>

          <p className="mt-4 text-xs text-espresso/50">
            established in 2026 · для любого бизнеса по записи: салоны, студии, мастерские, консультации
          </p>
        </div>

        {/* floating cards, echoing the Behance "Scope of Work" + "Google Rate" cards */}
        <div className="relative mx-auto mt-16 grid max-w-4xl gap-5 md:grid-cols-[1.4fr_1fr]">
          <Card className="p-2">
            <CardContent className="px-4">
              <Pill className="mb-4 w-fit">
                <ArrowUpRight className="size-3.5" /> что входит
              </Pill>
              <p className="mb-4 font-heading text-xl text-espresso">
                Всё для приёма онлайн-записи
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Своя страница бизнеса",
                  "Услуги и цены",
                  "Карточки специалистов",
                  "Портфолио работ",
                  "Отзывы клиентов",
                  "CRM-аналитика",
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-espresso"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="justify-center bg-espresso p-2 text-dusty-rose">
            <CardContent className="px-5">
              <Star className="mb-3 size-6 text-blush-pink" />
              <p className="text-sm text-dusty-rose/70">
                Запись онлайн занимает у клиента
              </p>
              <p className="font-heading text-5xl">&lt;2 мин</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* STATEMENT */}
      <section className="border-y border-espresso/10 bg-white px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <SectionLabel>о платформе</SectionLabel>
          <h2 className="mt-5 font-heading text-3xl leading-tight text-espresso md:text-5xl">
            Клиент видит лого, услуги и специалистов вашего бизнеса —
            <span className="text-soft-blush/60"> не очередную безликую форму записи.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-espresso/70">
            Каждый бизнес получает собственный адрес и полностью управляет тем,
            что видят его клиенты: название, логотип, прайс, состав команды,
            портфолио каждого специалиста и отзывы о нём.
          </p>
        </div>
      </section>

      {/* FEATURE GRID — alternating dark / blush cards */}
      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
          <Card className="bg-espresso p-7 text-dusty-rose md:col-span-2">
            <p className="font-heading text-2xl">CRM, которая считает за вас</p>
            <p className="mt-3 text-sm text-dusty-rose/70">
              Видно, какие услуги заказывают чаще всего и у каких специалистов
              больше повторных клиентов — решения по цене и загрузке команды
              принимаются на основе цифр, а не ощущений.
            </p>
          </Card>
          <Card className="bg-blush-pink p-7 text-espresso">
            <p className="font-heading text-2xl">Своя ссылка</p>
            <p className="mt-3 text-sm text-espresso/70">
              salonly.app/ваш-бизнес — отдельная страница для каждого клиента.
            </p>
          </Card>
          <Card className="bg-white p-7 text-espresso">
            <p className="font-heading text-2xl">Портфолио специалистов</p>
            <p className="mt-3 text-sm text-espresso/70">
              У каждого специалиста — личная галерея работ и отзывы клиентов.
            </p>
          </Card>
          <Card className="bg-white p-7 text-espresso md:col-span-2">
            <p className="font-heading text-2xl">Email и Telegram без доплат</p>
            <p className="mt-3 text-sm text-espresso/70">
              Клиент сам выбирает удобный канал — уведомление о записи придёт
              туда, где он его точно увидит.
            </p>
          </Card>
        </div>
      </section>

      {/* STEPS */}
      <section className="border-y border-espresso/10 bg-white px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <SectionLabel>как это работает</SectionLabel>
          <h2 className="mt-4 mb-10 font-heading text-3xl text-espresso md:text-4xl">
            Четыре шага до своей страницы записи
          </h2>
          <div className="flex flex-col">
            {steps.map((step, i) => (
              <div
                key={step.n}
                className={`flex items-start gap-5 py-6 ${
                  i !== steps.length - 1 ? "border-b border-espresso/10" : ""
                }`}
              >
                <NumberBadge n={step.n} />
                <div>
                  <p className="font-heading text-xl text-espresso">{step.title}</p>
                  <p className="mt-1 text-sm text-espresso/70">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl text-center">
          <SectionLabel>тарифы</SectionLabel>
          <h2 className="mx-auto mt-4 max-w-xl font-heading text-3xl text-espresso md:text-4xl">
            Один простой тариф
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-espresso/60">
            Без скрытых условий — 7 дней бесплатно, дальше фиксированная цена
          </p>

          <Card className="mx-auto mt-12 max-w-md bg-espresso p-9 text-left text-dusty-rose ring-2 ring-soft-blush">
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-5xl">{plan.price}</span>
              <span className="text-dusty-rose/60">{plan.period}</span>
            </div>
            <p className="mt-2 text-sm text-dusty-rose/60">{plan.note}</p>

            <ul className="mt-7 space-y-2.5 text-sm">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-soft-blush" />
                  <span className="text-dusty-rose/90">{f}</span>
                </li>
              ))}
            </ul>

            <Button className="mt-8 w-full" variant="secondary" asChild>
              <Link href="/signup">
                {plan.cta} <ArrowRight />
              </Link>
            </Button>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-espresso/10 bg-white px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <SectionLabel>вопросы</SectionLabel>
          <h2 className="mt-4 mb-8 font-heading text-3xl text-espresso md:text-4xl">
            Остались вопросы? Вот ответы
          </h2>
          <Accordion type="single" collapsible className="flex flex-col gap-3">
            {faqs.map((item, i) => (
              <AccordionItem
                key={item.q}
                value={`item-${i}`}
                className="rounded-3xl border-none bg-espresso px-6 text-dusty-rose"
              >
                <AccordionTrigger className="py-5 text-base font-medium hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-dusty-rose/70">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 py-24">
        <Card className="mx-auto max-w-4xl bg-gradient-to-br from-soft-blush to-espresso p-12 text-center text-dusty-rose">
          <CardContent className="px-0">
            <h2 className="font-heading text-3xl md:text-4xl">
              Готовы запустить свой бизнес онлайн?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-dusty-rose/80">
              7 дней бесплатно, своя ссылка для клиентов уже сегодня.
            </p>
            <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Ваш email"
                className="h-12 flex-1 rounded-full border-0 bg-white/95 px-5 text-sm text-espresso placeholder:text-espresso/40 outline-none"
              />
              <Button size="lg" variant="secondary" className="h-12 px-6">
                Начать <ArrowRight />
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <footer className="border-t border-espresso/10 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-espresso/50 md:flex-row">
          <span className="font-heading text-lg text-espresso">salonly</span>
          <span>© {new Date().getFullYear()} salonly — онлайн-запись для любого бизнеса</span>
        </div>
      </footer>
    </div>
  );
}
