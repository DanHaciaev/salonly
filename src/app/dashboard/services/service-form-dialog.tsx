"use client";

import { useActionState, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { upsertService, type ServiceFormState } from "./actions";
import { useCloseDialogOnSuccess } from "@/hooks/use-close-dialog-on-success";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Database } from "@/lib/supabase/types";

type Service = Database["public"]["Tables"]["services"]["Row"];

const initialState: ServiceFormState = {};

export function ServiceFormDialog({ service }: { service?: Service }) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [state, formAction, pending] = useActionState(upsertService, initialState);

  useCloseDialogOnSuccess({
    pending,
    hasError: !!state.error,
    submitted,
    onClose: () => {
      setOpen(false);
      setSubmitted(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {service ? (
          <Button variant="ghost" size="icon-sm">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button>
            <Plus /> Добавить услугу
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{service ? "Редактировать услугу" : "Новая услуга"}</DialogTitle>
        </DialogHeader>
        <form
          action={formAction}
          onSubmit={() => setSubmitted(true)}
          className="flex flex-col gap-4"
        >
          {service && <input type="hidden" name="id" value={service.id} />}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Название</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={service?.name}
              placeholder="Женская стрижка"
            />
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
          <div className="grid grid-cols-2 gap-3">
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
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Сохраняем…" : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
