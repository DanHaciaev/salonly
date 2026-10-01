import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "./email";
import { sendTelegramMessage } from "./telegram";
import type { Database } from "@/lib/supabase/types";

type Business = Database["public"]["Tables"]["businesses"]["Row"];
type Service = Database["public"]["Tables"]["services"]["Row"];
type Booking = Database["public"]["Tables"]["bookings"]["Row"];

export async function sendBookingNotifications({
  business,
  booking,
  service,
  client,
}: {
  business: Business;
  booking: Booking;
  service: Service;
  client: { name: string; phone: string; email: string | null; telegramChatId: string | null };
}) {
  const admin = createAdminClient();

  const [{ data: settings }, { data: staff }] = await Promise.all([
    admin
      .from("notification_settings")
      .select("*")
      .eq("business_id", business.id)
      .maybeSingle(),
    admin.from("staff").select("name").eq("id", booking.staff_id).maybeSingle(),
  ]);

  const staffName = staff?.name ?? "мастер";
  const dateLabel = new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(booking.start_at));

  const tasks: Promise<unknown>[] = [];

  if (settings?.email_enabled !== false) {
    const { data: ownerUser } = await admin.auth.admin.getUserById(business.owner_id);
    const ownerEmail = ownerUser.user?.email;
    if (ownerEmail) {
      tasks.push(
        sendEmail({
          to: ownerEmail,
          subject: `Новая запись — ${client.name}`,
          html: `<p>${client.name} (${client.phone}) записан(а) на «${service.name}» к ${staffName}, ${dateLabel}.</p>`,
        })
      );
    }
  }

  if (settings?.telegram_enabled && settings.owner_telegram_chat_id) {
    tasks.push(
      sendTelegramMessage(
        settings.owner_telegram_chat_id,
        `📅 Новая запись\n${client.name} (${client.phone})\n${service.name} — ${staffName}\n${dateLabel}`
      )
    );
  }

  if (booking.notify_channel === "email" && client.email) {
    tasks.push(
      sendEmail({
        to: client.email,
        subject: `Вы записаны в ${business.name}`,
        html: `<p>Здравствуйте, ${client.name}! Вы записаны на «${service.name}» к ${staffName}, ${dateLabel}.${
          business.address ? ` Адрес: ${business.address}.` : ""
        }</p>`,
      })
    );
  } else if (booking.notify_channel === "telegram" && client.telegramChatId) {
    tasks.push(
      sendTelegramMessage(
        client.telegramChatId,
        `Вы записаны в ${business.name}\n${service.name} — ${staffName}\n${dateLabel}`
      )
    );
  }

  await Promise.allSettled(tasks);
}
