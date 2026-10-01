"use client";

import { useActionState } from "react";
import { updateBusinessHours, type HoursFormState } from "./hours-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: HoursFormState = {};

export function HoursForm({ openTime, closeTime }: { openTime: string; closeTime: string }) {
  const [state, formAction, pending] = useActionState(updateBusinessHours, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="open_time">Открытие</Label>
        <Input id="open_time" name="open_time" type="time" required defaultValue={openTime} className="w-32" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="close_time">Закрытие</Label>
        <Input id="close_time" name="close_time" type="time" required defaultValue={closeTime} className="w-32" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Сохраняем…" : "Сохранить"}
      </Button>
      {state.error && <p className="w-full text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="w-full text-sm text-soft-blush">Сохранено, действует для всех дней недели</p>}
    </form>
  );
}
