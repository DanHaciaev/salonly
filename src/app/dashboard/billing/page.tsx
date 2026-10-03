import { CheckCircle2, CreditCard, Sparkle } from "lucide-react";
import { getCurrentBusiness } from "@/lib/business";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { startCheckout, openBillingPortal } from "./actions";

const statusLabels: Record<string, string> = {
  trialing: "Пробный период",
  active: "Подписка активна",
  past_due: "Проблема с оплатой",
  canceled: "Подписка отменена",
  incomplete: "Оплата не завершена",
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  const business = await getCurrentBusiness();
  const status = business?.subscription_status ?? null;

  const dateFormatter = new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl text-espresso">Подписка</h1>
        <p className="mt-1 text-sm text-espresso/60">Тариф и оплата доступа к платформе</p>
      </div>

      {checkout === "cancelled" && (
        <Card className="border border-destructive/30 bg-destructive/5 p-4">
          <CardContent className="px-0 text-sm text-destructive">
            Оформление подписки отменено — доступ откроется после оплаты.
          </CardContent>
        </Card>
      )}

      {!status ? (
        <Card className="bg-espresso p-9 text-dusty-rose">
          <CardContent className="px-0">
            <Sparkle className="mb-4 size-6 text-blush-pink" />
            <p className="font-heading text-2xl">7 дней бесплатно</p>
            <p className="mt-2 text-sm text-dusty-rose/70">
              Дальше — $200 в месяц. Карта привязывается сейчас, но первое списание
              произойдёт только через 7 дней — отменить можно в любой момент до этого
              без списаний.
            </p>
            <form action={startCheckout} className="mt-7">
              <Button type="submit" variant="secondary" size="lg" className="w-full">
                <CreditCard /> Начать бесплатный период
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="p-2">
          <CardContent className="px-6 py-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-soft-blush" />
              <p className="font-heading text-xl text-espresso">{statusLabels[status] ?? status}</p>
            </div>

            {status === "trialing" && business?.trial_ends_at && (
              <p className="mt-2 text-sm text-espresso/60">
                Бесплатный период до {dateFormatter.format(new Date(business.trial_ends_at))}, дальше —
                $200/мес.
              </p>
            )}
            {status === "active" && business?.current_period_end && (
              <p className="mt-2 text-sm text-espresso/60">
                Следующее списание {dateFormatter.format(new Date(business.current_period_end))}
              </p>
            )}
            {status === "past_due" && (
              <p className="mt-2 text-sm text-destructive">
                Не удалось списать оплату — обновите способ оплаты, чтобы не потерять доступ.
              </p>
            )}
            {status === "canceled" && (
              <p className="mt-2 text-sm text-espresso/60">
                Подписка отменена. Чтобы продолжить пользоваться платформой, оформите её заново.
              </p>
            )}

            {status === "canceled" || status === "incomplete" ? (
              <form action={startCheckout} className="mt-6">
                <Button type="submit" className="w-full">
                  Оформить подписку
                </Button>
              </form>
            ) : (
              <form action={openBillingPortal} className="mt-6">
                <Button type="submit" variant="outline" className="w-full">
                  <CreditCard /> Управлять оплатой
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
