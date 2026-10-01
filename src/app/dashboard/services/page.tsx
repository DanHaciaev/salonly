import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business";
import { Card, CardContent } from "@/components/ui/card";
import { ServiceFormDialog } from "./service-form-dialog";
import { ServiceActiveSwitch, DeleteServiceButton } from "./service-row-controls";

export default async function ServicesPage() {
  const business = await getCurrentBusiness();
  const supabase = await createClient();

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("business_id", business!.id)
    .order("sort_order")
    .order("created_at");

  const priceFormatter = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl text-espresso">Услуги</h1>
          <p className="mt-1 text-sm text-espresso/60">
            Клиенты увидят их на странице бронирования
          </p>
        </div>
        <ServiceFormDialog />
      </div>

      {!services?.length ? (
        <Card className="p-10 text-center">
          <CardContent className="px-0">
            <p className="text-espresso/60">Пока нет ни одной услуги</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {services.map((service) => (
            <Card key={service.id} className="p-2">
              <CardContent className="flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-medium text-espresso">{service.name}</p>
                  {service.description && (
                    <p className="truncate text-sm text-espresso/50">{service.description}</p>
                  )}
                  <p className="text-xs text-espresso/40 sm:hidden">
                    {service.duration_minutes} мин · {priceFormatter.format(service.price)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-5">
                  <span className="hidden text-sm text-espresso/70 sm:inline">
                    {service.duration_minutes} мин
                  </span>
                  <span className="hidden font-heading text-lg text-espresso sm:inline">
                    {priceFormatter.format(service.price)}
                  </span>
                  <ServiceActiveSwitch id={service.id} isActive={service.is_active} />
                  <ServiceFormDialog service={service} />
                  <DeleteServiceButton id={service.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
