"use client";

import { useActionState, useState } from "react";
import { upsertStaff, type StaffFormState } from "./actions";
import { useCloseDialogOnSuccess } from "@/hooks/use-close-dialog-on-success";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import type { Database } from "@/lib/supabase/types";

type Staff = Database["public"]["Tables"]["staff"]["Row"];
type Service = Database["public"]["Tables"]["services"]["Row"];

const initialState: StaffFormState = {};

export function StaffForm({
  staff,
  services,
  assignedServiceIds,
  onCancel,
  onSaved,
}: {
  staff?: Staff;
  services: Service[];
  assignedServiceIds?: Set<string>;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [state, formAction, pending] = useActionState(upsertStaff, initialState);

  useCloseDialogOnSuccess({
    pending,
    hasError: !!state.error,
    submitted,
    onClose: onSaved,
  });

  return (
    <div className="rounded-3xl border border-soft-blush/40 bg-white p-5 ring-1 ring-soft-blush/10">
      <p className="mb-4 font-heading text-lg text-espresso">
        {staff ? "Редактировать мастера" : "Новый мастер"}
      </p>
      <form action={formAction} onSubmit={() => setSubmitted(true)} className="flex flex-col gap-4">
        {staff && <input type="hidden" name="id" value={staff.id} />}

        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarImage src={staff?.avatar_url ?? undefined} />
            <AvatarFallback>{(staff?.name ?? "?").slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="avatar">Фото</Label>
            <Input id="avatar" name="avatar" type="file" accept="image/*" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Имя</Label>
            <Input id="name" name="name" required defaultValue={staff?.name} placeholder="Анна Иванова" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Специализация</Label>
            <Input
              id="title"
              name="title"
              defaultValue={staff?.title ?? ""}
              placeholder="Старший стилист"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bio">О мастере</Label>
          <Textarea id="bio" name="bio" defaultValue={staff?.bio ?? ""} placeholder="Опыт, подход, сертификаты" />
        </div>

        {!!services.length && (
          <div className="flex flex-col gap-2">
            <Label>Какие услуги выполняет</Label>
            <p className="-mt-1 text-xs text-espresso/50">
              Ничего не отмечено — мастер доступен для всех услуг
            </p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {services.map((service) => (
                <label
                  key={service.id}
                  className="flex items-center gap-2 rounded-xl border border-input px-3 py-2 text-sm text-espresso"
                >
                  <Checkbox
                    name="service_ids"
                    value={service.id}
                    defaultChecked={assignedServiceIds?.has(service.id)}
                  />
                  {service.name}
                </label>
              ))}
            </div>
          </div>
        )}

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
