"use client";

import { useActionState } from "react";
import { updateBusinessSettings, type SettingsFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSiteHost } from "@/hooks/use-site-host";
import type { Database } from "@/lib/supabase/types";

type Business = Database["public"]["Tables"]["businesses"]["Row"];

const initialState: SettingsFormState = {};

export function SettingsForm({ business }: { business: Business }) {
  const [state, formAction, pending] = useActionState(updateBusinessSettings, initialState);
  const host = useSiteHost();

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-5">
      <div className="flex items-center gap-4">
        <Avatar className="size-16 rounded-2xl">
          <AvatarImage src={business.logo_url ?? undefined} className="object-cover" />
          <AvatarFallback className="rounded-2xl">{business.name.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="logo">Логотип</Label>
          <Input id="logo" name="logo" type="file" accept="image/*" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Название салона</Label>
        <Input id="name" name="name" required defaultValue={business.name} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="slug">Ссылка для клиентов</Label>
        <div className="flex items-center overflow-hidden rounded-full border border-input pl-4 text-sm text-espresso/50 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
          <span className="whitespace-nowrap">{host}/</span>
          <Input
            id="slug"
            name="slug"
            required
            defaultValue={business.slug}
            className="h-11 rounded-none border-none px-1 text-espresso shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Описание</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={business.description ?? ""}
          placeholder="Пара предложений о салоне для клиентов"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Телефон</Label>
          <Input id="phone" name="phone" defaultValue={business.phone ?? ""} placeholder="+7 900 000-00-00" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="address">Адрес</Label>
          <Input id="address" name="address" defaultValue={business.address ?? ""} placeholder="ул. Примерная, 1" />
        </div>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="text-sm text-soft-blush">Сохранено</p>}

      <Button type="submit" className="w-fit" disabled={pending}>
        {pending ? "Сохраняем…" : "Сохранить изменения"}
      </Button>
    </form>
  );
}
