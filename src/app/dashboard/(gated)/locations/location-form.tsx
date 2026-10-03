"use client";

import { useActionState, useState } from "react";
import { upsertLocation, type LocationFormState } from "./actions";
import { useCloseDialogOnSuccess } from "@/hooks/use-close-dialog-on-success";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Database } from "@/lib/supabase/types";

type Location = Database["public"]["Tables"]["locations"]["Row"];

const initialState: LocationFormState = {};

export function LocationForm({
  location,
  onCancel,
  onSaved,
}: {
  location?: Location;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [state, formAction, pending] = useActionState(upsertLocation, initialState);

  useCloseDialogOnSuccess({
    pending,
    hasError: !!state.error,
    submitted,
    onClose: onSaved,
  });

  return (
    <div className="rounded-3xl border border-soft-blush/40 bg-white p-5 ring-1 ring-soft-blush/10">
      <p className="mb-4 font-heading text-lg text-espresso">
        {location ? "Редактировать филиал" : "Новый филиал"}
      </p>
      <form action={formAction} onSubmit={() => setSubmitted(true)} className="flex flex-col gap-4">
        {location && <input type="hidden" name="id" value={location.id} />}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Название</Label>
            <Input id="name" name="name" required defaultValue={location?.name} placeholder="На Ботанике" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Телефон</Label>
            <Input id="phone" name="phone" defaultValue={location?.phone ?? ""} placeholder="+373 22 000 000" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="address">Адрес</Label>
          <Input id="address" name="address" defaultValue={location?.address ?? ""} placeholder="ул. Примерная, 12" />
        </div>

        {state.error && <p className="text-sm text-destructive">{state.error}</p>}

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Сохраняем…" : "Сохранить"}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Отмена
          </Button>
        </div>
      </form>
    </div>
  );
}
