import Image from "next/image";
import { Star } from "lucide-react";
import { getStaffByToken } from "@/lib/staff-portal";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PortfolioUploadDialog } from "./portfolio-upload-dialog";
import { DeletePortfolioButton } from "./delete-portfolio-button";
import type { BookingStatus } from "@/lib/supabase/types";

const statusLabels: Record<BookingStatus, string> = {
  pending: "Ожидает",
  confirmed: "Подтверждена",
  completed: "Завершена",
  cancelled: "Отменена",
};

export default async function StaffPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const staff = (await getStaffByToken(token))!;
  const admin = createAdminClient();

  const [{ data: business }, { data: bookings }, { data: reviews }, { data: portfolio }] =
    await Promise.all([
      admin.from("businesses").select("name").eq("id", staff.business_id).maybeSingle(),
      admin
        .from("bookings")
        .select("*")
        .eq("staff_id", staff.id)
        .order("start_at", { ascending: false })
        .limit(50),
      admin
        .from("reviews")
        .select("*")
        .eq("staff_id", staff.id)
        .order("created_at", { ascending: false }),
      admin
        .from("portfolio_items")
        .select("*")
        .eq("staff_id", staff.id)
        .order("sort_order")
        .order("created_at", { ascending: false }),
    ]);

  const clientIds = [...new Set((bookings ?? []).map((b) => b.client_id))];
  const serviceIds = [...new Set((bookings ?? []).map((b) => b.service_id))];

  const [{ data: clients }, { data: services }] = await Promise.all([
    clientIds.length
      ? admin.from("clients").select("id, name, phone").in("id", clientIds)
      : Promise.resolve({ data: [] as { id: string; name: string; phone: string }[] }),
    serviceIds.length
      ? admin.from("services").select("id, name").in("id", serviceIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);

  const clientById = new Map((clients ?? []).map((c) => [c.id, c]));
  const serviceNameById = new Map((services ?? []).map((s) => [s.id, s.name]));

  const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={staff.avatar_url ?? undefined} />
            <AvatarFallback className="text-xl">{staff.name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-heading text-2xl text-espresso">{staff.name}</h1>
            <p className="text-sm text-espresso/60">
              {staff.title ? `${staff.title} · ` : ""}
              {business?.name}
            </p>
          </div>
        </div>

        <section>
          <h2 className="mb-4 font-heading text-xl text-espresso">Мои записи</h2>
          {!bookings?.length ? (
            <Card className="p-8 text-center">
              <CardContent className="px-0 text-espresso/60">Пока нет записей</CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {bookings.map((booking) => {
                const client = clientById.get(booking.client_id);
                const serviceName = serviceNameById.get(booking.service_id);
                return (
                  <Card key={booking.id} className="p-2">
                    <CardContent className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                      <div>
                        <p className="font-medium text-espresso">{client?.name ?? "—"}</p>
                        <p className="text-xs text-espresso/50">
                          {serviceName} · {dateFormatter.format(new Date(booking.start_at))}
                        </p>
                      </div>
                      <Badge variant="secondary">{statusLabels[booking.status]}</Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 font-heading text-xl text-espresso">Отзывы обо мне</h2>
          {!reviews?.length ? (
            <Card className="p-8 text-center">
              <CardContent className="px-0 text-espresso/60">Пока нет отзывов</CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {reviews.map((review) => (
                <Card key={review.id} className="p-2">
                  <CardContent className="px-5 py-4">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex items-center gap-0.5 text-soft-blush">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className="size-3.5"
                            fill={i < review.rating ? "currentColor" : "none"}
                          />
                        ))}
                      </div>
                      {!review.is_published && <Badge variant="secondary">на проверке</Badge>}
                    </div>
                    {review.comment && (
                      <p className="text-sm text-espresso/70">{review.comment}</p>
                    )}
                    <p className="mt-2 text-sm font-medium text-espresso">{review.client_name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-xl text-espresso">Портфолио</h2>
            <PortfolioUploadDialog token={token} />
          </div>
          {!portfolio?.length ? (
            <Card className="p-8 text-center">
              <CardContent className="px-0 text-espresso/60">Пока нет работ</CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {portfolio.map((item) => (
                <div key={item.id} className="group relative overflow-hidden rounded-3xl">
                  <div className="relative aspect-4/5 w-full bg-muted">
                    <Image
                      src={item.image_url}
                      alt={item.caption ?? "Работа"}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>
                  <DeletePortfolioButton token={token} id={item.id} imageUrl={item.image_url} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
