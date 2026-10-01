import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusSelect } from "./status-select";

export default async function BookingsPage() {
  const business = await getCurrentBusiness();
  const supabase = await createClient();

  const [{ data: bookings }, { data: clients }, { data: services }, { data: staff }] =
    await Promise.all([
      supabase
        .from("bookings")
        .select("*")
        .eq("business_id", business!.id)
        .order("start_at", { ascending: false }),
      supabase.from("clients").select("id, name, phone").eq("business_id", business!.id),
      supabase.from("services").select("id, name").eq("business_id", business!.id),
      supabase.from("staff").select("id, name").eq("business_id", business!.id),
    ]);

  const clientById = new Map((clients ?? []).map((c) => [c.id, c]));
  const serviceById = new Map((services ?? []).map((s) => [s.id, s.name]));
  const staffById = new Map((staff ?? []).map((s) => [s.id, s.name]));

  const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl text-espresso">Записи</h1>
        <p className="mt-1 text-sm text-espresso/60">Все бронирования клиентов</p>
      </div>

      {!bookings?.length ? (
        <Card className="p-10 text-center">
          <CardContent className="px-0">
            <p className="text-espresso/60">Записей пока нет</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="p-2">
          <CardContent className="px-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Услуга</TableHead>
                  <TableHead>Мастер</TableHead>
                  <TableHead>Когда</TableHead>
                  <TableHead>Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => {
                  const client = clientById.get(booking.client_id);
                  return (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <p className="font-medium text-espresso">{client?.name ?? "—"}</p>
                        <p className="text-xs text-espresso/50">{client?.phone}</p>
                      </TableCell>
                      <TableCell>{serviceById.get(booking.service_id) ?? "—"}</TableCell>
                      <TableCell>{staffById.get(booking.staff_id) ?? "—"}</TableCell>
                      <TableCell>{dateFormatter.format(new Date(booking.start_at))}</TableCell>
                      <TableCell>
                        <StatusSelect id={booking.id} status={booking.status} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
