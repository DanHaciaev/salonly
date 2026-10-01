import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business";
import { Card, CardContent } from "@/components/ui/card";
import { SettingsForm } from "./settings-form";
import { HoursForm } from "./hours-form";

export default async function SettingsPage() {
  const business = await getCurrentBusiness();
  const supabase = await createClient();

  const { data: hours } = await supabase
    .from("business_hours")
    .select("*")
    .eq("business_id", business!.id)
    .eq("day_of_week", 1)
    .maybeSingle();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl text-espresso">Настройки салона</h1>
        <p className="mt-1 text-sm text-espresso/60">
          Это видят клиенты на странице бронирования
        </p>
      </div>
      <SettingsForm business={business!} />

      <Card className="max-w-xl p-2">
        <CardContent className="px-6 py-5">
          <p className="font-heading text-xl text-espresso">Часы работы</p>
          <p className="mb-4 text-sm text-espresso/60">
            Одно время для всех дней недели — используется для расчёта слотов записи
          </p>
          <HoursForm openTime={hours?.open_time?.slice(0, 5) ?? "09:00"} closeTime={hours?.close_time?.slice(0, 5) ?? "20:00"} />
        </CardContent>
      </Card>
    </div>
  );
}
