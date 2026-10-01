"use client";

import { useActionState, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { upsertStaff, type StaffFormState } from "./actions";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Database } from "@/lib/supabase/types";

type Staff = Database["public"]["Tables"]["staff"]["Row"];

const initialState: StaffFormState = {};

export function StaffFormDialog({ staff }: { staff?: Staff }) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [state, formAction, pending] = useActionState(upsertStaff, initialState);

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
        {staff ? (
          <Button variant="ghost" size="icon-sm">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button>
            <Plus /> Добавить мастера
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{staff ? "Редактировать мастера" : "Новый мастер"}</DialogTitle>
        </DialogHeader>
        <form
          action={formAction}
          onSubmit={() => setSubmitted(true)}
          className="flex flex-col gap-4"
        >
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
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bio">О мастере</Label>
            <Textarea id="bio" name="bio" defaultValue={staff?.bio ?? ""} placeholder="Опыт, подход, сертификаты" />
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
