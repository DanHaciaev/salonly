import { CheckCircle2, CreditCard, Sparkle } from "lucide-react";
import { getCurrentBusiness } from "@/lib/business";
import { hasActiveAccess } from "@/lib/subscription";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { startCheckout } from "./actions";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  const business = await getCurrentBusiness();
  const dateFormatter = new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "long", year: "numeric" });

  const isPaid = business?.subscription_status === "active";
  const isTrialActive = !isPaid && business && hasActiveAccess(business);

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl text-espresso">Оплата доступа</h1>
        <p className="mt-1 text-sm text-espresso/60">Разовый платёж — без подписки и ежемесячных списаний</p>
      </div>

      {checkout === "cancelled" && (
        <Card className="border border-destructive/30 bg-destructive/5 p-4">
          <CardContent className="px-0 text-sm text-destructive">
            Оплата отменена — доступ откроется после оплаты.
          </CardContent>
        </Card>
      )}

      {isPaid ? (
        <Card className="p-2">
          <CardContent className="px-6 py-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-soft-blush" />
              <p className="font-heading text-xl text-espresso">Доступ открыт навсегда</p>
            </div>
            {business?.paid_at && (
              <p className="mt-2 text-sm text-espresso/60">
                Оплачено {dateFormatter.format(new Date(business.paid_at))} — больше ничего платить не нужно.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-espresso p-9 text-dusty-rose">
          <CardContent className="px-0">
            <Sparkle className="mb-4 size-6 text-blush-pink" />
            {isTrialActive ? (
              <>
                <p className="font-heading text-2xl">Бесплатный период активен</p>
                <p className="mt-2 text-sm text-dusty-rose/70">
                  Пользуйтесь платформой бесплатно до{" "}
                  {business && dateFormatter.format(new Date(business.trial_ends_at))}. Дальше, чтобы
                  сохранить доступ, нужно оплатить $200 — один раз, без подписки и повторных списаний.
                </p>
              </>
            ) : (
              <>
                <p className="font-heading text-2xl">Бесплатный период закончился</p>
                <p className="mt-2 text-sm text-dusty-rose/70">
                  Чтобы продолжить пользоваться платформой, оплатите $200 — один раз, доступ открывается
                  навсегда, без подписки и повторных списаний.
                </p>
              </>
            )}
            <form action={startCheckout} className="mt-7">
              <Button type="submit" variant="secondary" size="lg" className="w-full">
                <CreditCard /> Оплатить $200
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
