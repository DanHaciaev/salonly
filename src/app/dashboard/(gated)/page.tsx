import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RankedBarList } from "@/components/analytics/ranked-bar-list";
import { DailyBarChart } from "@/components/analytics/daily-bar-chart";

export default async function DashboardOverviewPage() {
  const business = await getCurrentBusiness();
  const supabase = await createClient();

  const [{ count: servicesCount }, { count: staffCount }, { count: bookingsCount }, { count: reviewsCount }] =
    await Promise.all([
      supabase
        .from("services")
        .select("id", { count: "exact", head: true })
        .eq("business_id", business!.id),
      supabase
        .from("staff")
        .select("id", { count: "exact", head: true })
        .eq("business_id", business!.id),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("business_id", business!.id),
      supabase
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("business_id", business!.id)
        .eq("is_published", true),
    ]);

  const stats = [
    { label: "Записей всего", value: bookingsCount ?? 0 },
    { label: "Активных услуг", value: servicesCount ?? 0 },
    { label: "Мастеров", value: staffCount ?? 0 },
    { label: "Отзывов опубликовано", value: reviewsCount ?? 0 },
  ];

  const checklist = [
    { done: (servicesCount ?? 0) > 0, label: "Добавить первую услугу", href: "/dashboard/services" },
    { done: (staffCount ?? 0) > 0, label: "Добавить первого мастера", href: "/dashboard/staff" },
  ];

  const [{ data: bookings }, { data: services }, { data: staff }, { data: topClients }] =
    await Promise.all([
      supabase
        .from("bookings")
        .select("service_id, staff_id, start_at")
        .eq("business_id", business!.id)
        .neq("status", "cancelled"),
      supabase.from("services").select("id, name").eq("business_id", business!.id),
      supabase.from("staff").select("id, name").eq("business_id", business!.id),
      supabase
        .from("clients")
        .select("name, visits_count")
        .eq("business_id", business!.id)
        .order("visits_count", { ascending: false })
        .limit(5),
    ]);

  const serviceNameById = new Map((services ?? []).map((s) => [s.id, s.name]));
  const staffNameById = new Map((staff ?? []).map((s) => [s.id, s.name]));

  const serviceCounts = new Map<string, number>();
  const staffCounts = new Map<string, number>();
  for (const b of bookings ?? []) {
    serviceCounts.set(b.service_id, (serviceCounts.get(b.service_id) ?? 0) + 1);
    staffCounts.set(b.staff_id, (staffCounts.get(b.staff_id) ?? 0) + 1);
  }

  const topServices = [...serviceCounts.entries()]
    .map(([id, value]) => ({ label: serviceNameById.get(id) ?? "—", value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const topStaff = [...staffCounts.entries()]
    .map(([id, value]) => ({ label: staffNameById.get(id) ?? "—", value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (13 - i));
    return d;
  });

  const dayCounts = new Map<string, number>();
  for (const b of bookings ?? []) {
    const key = new Date(b.start_at).toDateString();
    dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1);
  }

  const dailyData = last14Days.map((d) => ({
    label: d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }).slice(0, 5),
    value: dayCounts.get(d.toDateString()) ?? 0,
  }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl text-espresso">Обзор</h1>
        <p className="mt-1 text-sm text-espresso/60">
          Что происходит в {business!.name}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-2">
            <CardContent className="px-5 py-3">
              <p className="text-xs text-espresso/50">{stat.label}</p>
              <p className="mt-1 font-heading text-3xl text-espresso">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {checklist.some((item) => !item.done) && (
        <Card className="bg-espresso p-2 text-dusty-rose">
          <CardContent className="px-6 py-5">
            <p className="font-heading text-xl">Завершите настройку страницы</p>
            <div className="mt-4 flex flex-col gap-2">
              {checklist.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-full bg-white/5 px-4 py-2.5"
                >
                  <span className={item.done ? "text-dusty-rose/50 line-through" : "text-dusty-rose"}>
                    {item.label}
                  </span>
                  {!item.done && (
                    <Button size="sm" variant="secondary" asChild>
                      <Link href={item.href}>
                        Перейти <ArrowRight />
                      </Link>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-2">
          <CardContent className="px-6 py-5">
            <p className="font-heading text-xl text-espresso">Топ услуг</p>
            <p className="mb-4 text-sm text-espresso/50">По количеству записей</p>
            <RankedBarList items={topServices} emptyLabel="Пока нет записей" />
          </CardContent>
        </Card>
        <Card className="p-2">
          <CardContent className="px-6 py-5">
            <p className="font-heading text-xl text-espresso">Топ мастеров</p>
            <p className="mb-4 text-sm text-espresso/50">По количеству записей</p>
            <RankedBarList items={topStaff} emptyLabel="Пока нет записей" />
          </CardContent>
        </Card>
      </div>

      <Card className="p-2">
        <CardContent className="px-6 py-5">
          <p className="font-heading text-xl text-espresso">Записи за 14 дней</p>
          <p className="mb-5 text-sm text-espresso/50">Динамика бронирований</p>
          <DailyBarChart data={dailyData} />
        </CardContent>
      </Card>

      {!!topClients?.length && (
        <Card className="p-2">
          <CardContent className="px-6 py-5">
            <p className="font-heading text-xl text-espresso">Постоянные клиенты</p>
            <p className="mb-4 text-sm text-espresso/50">По числу визитов</p>
            <RankedBarList
              items={topClients.map((c) => ({ label: c.name, value: c.visits_count }))}
              emptyLabel="Пока нет клиентов"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
