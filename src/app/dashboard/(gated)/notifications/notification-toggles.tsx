"use client";

import { Switch } from "@/components/ui/switch";

export function EmailToggle({
  enabled,
  action,
}: {
  enabled: boolean;
  action: (enabled: boolean) => void;
}) {
  return <Switch checked={enabled} onCheckedChange={action} />;
}

export function TelegramToggle({
  enabled,
  action,
}: {
  enabled: boolean;
  action: (enabled: boolean) => void;
}) {
  return <Switch checked={enabled} onCheckedChange={action} />;
}
