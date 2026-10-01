import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTelegramMessage } from "@/lib/notifications/telegram";

export async function POST(request: NextRequest) {
  const update = await request.json().catch(() => null);
  const message = update?.message;
  const text: string | undefined = message?.text;
  const chatId: string | undefined = message?.chat?.id?.toString();

  if (!text || !chatId) return NextResponse.json({ ok: true });

  const match = text.match(/^\/start\s+(\S+)/);
  if (!match) return NextResponse.json({ ok: true });

  const token = match[1];
  const admin = createAdminClient();

  const { data: linkToken } = await admin
    .from("telegram_link_tokens")
    .select("*")
    .eq("token", token)
    .is("consumed_at", null)
    .maybeSingle();

  if (!linkToken) {
    await sendTelegramMessage(chatId, "Ссылка недействительна или уже использована.");
    return NextResponse.json({ ok: true });
  }

  if (linkToken.kind === "owner") {
    await admin
      .from("notification_settings")
      .update({
        owner_telegram_chat_id: chatId,
        telegram_enabled: true,
        updated_at: new Date().toISOString(),
      })
      .eq("business_id", linkToken.business_id);
    await sendTelegramMessage(chatId, "Готово! Теперь уведомления о новых записях будут приходить сюда.");
  } else if (linkToken.kind === "client" && linkToken.client_id) {
    await admin.from("clients").update({ telegram_chat_id: chatId }).eq("id", linkToken.client_id);
    await sendTelegramMessage(chatId, "Готово! Мы будем присылать сюда уведомления о ваших записях.");
  }

  await admin
    .from("telegram_link_tokens")
    .update({ consumed_at: new Date().toISOString() })
    .eq("token", token);

  return NextResponse.json({ ok: true });
}
