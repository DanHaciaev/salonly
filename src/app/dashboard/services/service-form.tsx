"use client";

import { useActionState, useState } from "react";
import { upsertService, type ServiceFormState } from "./actions";
import { useCloseDialogOnSuccess } from "@/hooks/use-close-dialog-on-success";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Database } from "@/lib/supabase/types";

type Service = Database["public"]["Tables"]["services"]["Row"];

const initialState: ServiceFormState = {};

export function ServiceForm({
  service,
  onCancel,
  onSaved,
}: {
  service?: Service;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [state, formAction, pending] = useActionState(upsertService, initialState);

  useCloseDialogOnSuccess({
    pending,
    hasError: !!state.error,
    submitted,
    onClose: onSaved,
  });

  return (
    <div className="rounded-3xl border border-soft-blush/40 bg-white p-5 ring-1 ring-soft-blush/10">
      <p className="mb-4 font-heading text-lg text-espresso">
        {service ? "Редактировать услугу" : "Новая услуга"}
      </p>
      <form action={formAction} onSubmit={() => setSubmitted(true)} className="flex flex-col gap-4">
        {service && <input type="hidden" name="id" value={service.id} />}

        <div className="grid gap-4 sm:grid-cols-[2fr_1fr_1fr]">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Название</Label>
            <Input id="name" name="name" required defaultValue={service?.name} placeholder="Женская стрижка" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="price">Цена, ₽</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min={0}
              step="0.01"
              required
              defaultValue={service?.price}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="duration_minutes">Длительность, мин</Label>
            <Input
              id="duration_minutes"
              name="duration_minutes"
              type="number"
              min={5}
              step={5}
              required
              defaultValue={service?.duration_minutes ?? 60}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Описание</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={service?.description ?? ""}
            placeholder="Коротко опишите услугу"
          />
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
