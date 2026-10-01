"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { addPortfolioItem, type PortfolioFormState } from "./actions";
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
import { useCloseDialogOnSuccess } from "@/hooks/use-close-dialog-on-success";

const initialState: PortfolioFormState = {};

export function PortfolioUploadDialog({ token }: { token: string }) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const action = addPortfolioItem.bind(null, token);
  const [state, formAction, pending] = useActionState(action, initialState);

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
        <Button>
          <Plus /> Добавить работу
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новая работа в портфолио</DialogTitle>
        </DialogHeader>
        <form
          action={formAction}
          onSubmit={() => setSubmitted(true)}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="image">Изображение</Label>
            <Input id="image" name="image" type="file" accept="image/*" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="caption">Подпись (необязательно)</Label>
            <Input id="caption" name="caption" placeholder="Окрашивание балаяж" />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Загружаем…" : "Добавить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
