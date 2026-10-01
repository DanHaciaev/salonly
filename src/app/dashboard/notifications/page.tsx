import { Mail, Send, Unlink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  connectTelegram,
  disconnectTelegram,
  toggleEmailEnabled,
  toggleTelegramEnabled,
} from "./actions";
import { EmailToggle, TelegramToggle } from "./notification-toggles";

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const business = await getCurrentBusiness();
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("notification_settings")
    .select("*")
    .eq("business_id", business!.id)
    .maybeSingle();

  const emailEnabled = settings?.email_enabled ?? true;
  const telegramEnabled = settings?.telegram_enabled ?? false;
  const chatId = settings?.owner_telegram_chat_id ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl text-espresso">Уведомления</h1>
        <p className="mt-1 text-sm text-espresso/60">
          Куда присылать уведомления о новых записях
        </p>
      </div>

      {error && (
        <Card className="border border-destructive/30 bg-destructive/5 p-4">
          <CardContent className="px-0 text-sm text-destructive">
            {error === "bot-not-configured"
              ? "Telegram-бот ещё не настроен (нет TELEGRAM_BOT_USERNAME в переменных окружения)."
              : "Не удалось создать ссылку для подключения, попробуйте ещё раз."}
          </CardContent>
        </Card>
      )}

      <Card className="p-2">
        <CardContent className="flex items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-3">
            <Mail className="size-5 text-soft-blush" />
            <div>
              <p className="font-medium text-espresso">Email</p>
              <p className="text-sm text-espresso/50">Уведомления о записях на вашу почту</p>
            </div>
          </div>
          <EmailToggle enabled={emailEnabled} action={toggleEmailEnabled} />
        </CardContent>
      </Card>

      <Card className="p-2">
        <CardContent className="flex items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-3">
            <Send className="size-5 text-soft-blush" />
            <div>
              <p className="font-medium text-espresso">Telegram</p>
              <p className="text-sm text-espresso/50">
                {chatId ? "Бот подключён" : "Подключите бота, чтобы получать уведомления"}
              </p>
            </div>
          </div>
          {chatId ? (
            <div className="flex items-center gap-3">
              <TelegramToggle enabled={telegramEnabled} action={toggleTelegramEnabled} />
              <form action={disconnectTelegram}>
                <Button type="submit" variant="ghost" size="icon-sm">
                  <Unlink className="size-4 text-destructive" />
                </Button>
              </form>
            </div>
          ) : (
            <form action={connectTelegram}>
              <Button type="submit" variant="secondary">
                Подключить Telegram
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
