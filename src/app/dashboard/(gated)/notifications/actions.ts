"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business";

export async function toggleEmailEnabled(enabled: boolean) {
  const business = await getCurrentBusiness();
  if (!business) return;
  const supabase = await createClient();
  await supabase
    .from("notification_settings")
    .update({ email_enabled: enabled, updated_at: new Date().toISOString() })
    .eq("business_id", business.id);
  revalidatePath("/dashboard/notifications");
}

export async function toggleTelegramEnabled(enabled: boolean) {
  const business = await getCurrentBusiness();
  if (!business) return;
  const supabase = await createClient();
  await supabase
    .from("notification_settings")
    .update({ telegram_enabled: enabled, updated_at: new Date().toISOString() })
    .eq("business_id", business.id);
  revalidatePath("/dashboard/notifications");
}

export async function connectTelegram() {
  const business = await getCurrentBusiness();
  if (!business) redirect("/login");

  const botUsername = process.env.TELEGRAM_BOT_USERNAME;
  if (!botUsername) redirect("/dashboard/notifications?error=bot-not-configured");

  const supabase = await createClient();
  const { data: token, error } = await supabase
    .from("telegram_link_tokens")
    .insert({ kind: "owner", business_id: business.id })
    .select("token")
    .single();

  if (error || !token) redirect("/dashboard/notifications?error=link-failed");

  redirect(`https://t.me/${botUsername}?start=${token.token}`);
}

export async function disconnectTelegram() {
  const business = await getCurrentBusiness();
  if (!business) return;
  const supabase = await createClient();
  await supabase
    .from("notification_settings")
    .update({
      owner_telegram_chat_id: null,
      telegram_enabled: false,
      updated_at: new Date().toISOString(),
    })
    .eq("business_id", business.id);
  revalidatePath("/dashboard/notifications");
}
