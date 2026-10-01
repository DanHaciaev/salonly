"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBusinessBySlug } from "@/lib/get-business";
import { sendBookingNotifications } from "@/lib/notifications/send-booking-notifications";
import type { NotifyChannel } from "@/lib/supabase/types";

const SLOT_STEP_MINUTES = 15;

export async function getAvailableSlotsAction(
  businessId: string,
  staffId: string,
  durationMinutes: number,
  date: string
): Promise<string[]> {
  const supabase = await createClient();
  const dayOfWeek = new Date(`${date}T00:00:00`).getDay();

  const { data: hours } = await supabase
    .from("business_hours")
    .select("open_time, close_time")
    .eq("business_id", businessId)
    .eq("day_of_week", dayOfWeek)
    .maybeSingle();

  const openTime = hours?.open_time?.slice(0, 5) ?? "09:00";
  const closeTime = hours?.close_time?.slice(0, 5) ?? "20:00";

  const dayStart = new Date(`${date}T00:00:00`);
  const rangeStart = new Date(`${date}T${openTime}:00`);
  const rangeEnd = new Date(`${date}T${closeTime}:00`);

  const { data: bookings } = await supabase
    .from("bookings")
    .select("start_at, end_at")
    .eq("staff_id", staffId)
    .neq("status", "cancelled")
    .gte("start_at", dayStart.toISOString())
    .lt("start_at", new Date(dayStart.getTime() + 24 * 60 * 60 * 1000).toISOString());

  const busy = (bookings ?? []).map((b) => ({
    start: new Date(b.start_at).getTime(),
    end: new Date(b.end_at).getTime(),
  }));

  const slots: string[] = [];
  const durationMs = durationMinutes * 60 * 1000;
  const stepMs = SLOT_STEP_MINUTES * 60 * 1000;
  const now = Date.now();

  for (let t = rangeStart.getTime(); t + durationMs <= rangeEnd.getTime(); t += stepMs) {
    if (t < now) continue;
    const slotEnd = t + durationMs;
    const overlaps = busy.some((b) => t < b.end && slotEnd > b.start);
    if (!overlaps) {
      const d = new Date(t);
      slots.push(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    }
  }

  return slots;
}

export type CreateBookingInput = {
  slug: string;
  serviceId: string;
  staffId: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  email?: string;
  notifyChannel: NotifyChannel;
};

export type CreateBookingResult = { error?: string; success?: boolean; telegramLink?: string };

export async function createBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
  const business = await getBusinessBySlug(input.slug);
  if (!business) return { error: "Салон не найден" };

  const name = input.name.trim();
  const phone = input.phone.trim();
  const email = input.email?.trim() || null;

  if (!name || !phone) return { error: "Укажите имя и телефон" };

  const admin = createAdminClient();

  const { data: service } = await admin
    .from("services")
    .select("*")
    .eq("id", input.serviceId)
    .eq("business_id", business.id)
    .maybeSingle();
  if (!service) return { error: "Услуга не найдена" };

  const { data: staff } = await admin
    .from("staff")
    .select("id")
    .eq("id", input.staffId)
    .eq("business_id", business.id)
    .maybeSingle();
  if (!staff) return { error: "Мастер не найден" };

  const startAt = new Date(`${input.date}T${input.time}:00`);
  const endAt = new Date(startAt.getTime() + service.duration_minutes * 60 * 1000);

  const { data: conflicts } = await admin
    .from("bookings")
    .select("id")
    .eq("staff_id", input.staffId)
    .neq("status", "cancelled")
    .lt("start_at", endAt.toISOString())
    .gt("end_at", startAt.toISOString());

  if (conflicts && conflicts.length > 0) {
    return { error: "Это время уже занято, выберите другое" };
  }

  const { data: existingClient } = await admin
    .from("clients")
    .select("*")
    .eq("business_id", business.id)
    .eq("phone", phone)
    .maybeSingle();

  let clientId: string;
  const telegramChatId: string | null = existingClient?.telegram_chat_id ?? null;

  if (existingClient) {
    clientId = existingClient.id;
    await admin
      .from("clients")
      .update({
        name,
        email: email ?? existingClient.email,
        visits_count: existingClient.visits_count + 1,
        last_visit_at: new Date().toISOString(),
      })
      .eq("id", clientId);
  } else {
    const { data: newClient, error: clientError } = await admin
      .from("clients")
      .insert({
        business_id: business.id,
        name,
        phone,
        email,
        visits_count: 1,
        last_visit_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (clientError || !newClient) return { error: "Не удалось сохранить данные клиента" };
    clientId = newClient.id;
  }

  const { data: booking, error: bookingError } = await admin
    .from("bookings")
    .insert({
      business_id: business.id,
      service_id: service.id,
      staff_id: input.staffId,
      client_id: clientId,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
      notify_channel: input.notifyChannel,
    })
    .select("*")
    .single();

  if (bookingError || !booking) return { error: "Не удалось создать запись, попробуйте ещё раз" };

  let telegramLink: string | undefined;
  if (input.notifyChannel === "telegram" && !telegramChatId) {
    const botUsername = process.env.TELEGRAM_BOT_USERNAME;
    if (botUsername) {
      const { data: token } = await admin
        .from("telegram_link_tokens")
        .insert({ kind: "client", business_id: business.id, client_id: clientId })
        .select("token")
        .single();
      if (token) telegramLink = `https://t.me/${botUsername}?start=${token.token}`;
    }
  }

  await sendBookingNotifications({
    business,
    booking,
    service,
    client: { name, phone, email, telegramChatId },
  });

  return { success: true, telegramLink };
}
