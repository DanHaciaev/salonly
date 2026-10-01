"use client";

import { useActionState, useState } from "react";
import { addPortfolioItem, type PortfolioFormState } from "./actions";
import { useCloseDialogOnSuccess } from "@/hooks/use-close-dialog-on-success";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: PortfolioFormState = {};

export function PortfolioForm({
  token,
  onCancel,
  onSaved,
}: {
  token: string;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const action = addPortfolioItem.bind(null, token);
  const [state, formAction, pending] = useActionState(action, initialState);

  useCloseDialogOnSuccess({
    pending,
    hasError: !!state.error,
    submitted,
    onClose: onSaved,
  });

  return (
    <div className="rounded-3xl border border-soft-blush/40 bg-white p-5 ring-1 ring-soft-blush/10">
      <p className="mb-4 font-heading text-lg text-espresso">Новая работа в портфолио</p>
      <form
        action={formAction}
        onSubmit={() => setSubmitted(true)}
        className="flex flex-col gap-4 sm:flex-row sm:items-end"
      >
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="image">Изображение</Label>
          <Input id="image" name="image" type="file" accept="image/*" required />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="caption">Подпись (необязательно)</Label>
          <Input id="caption" name="caption" placeholder="Окрашивание балаяж" />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Загружаем…" : "Добавить"}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Отмена
          </Button>
        </div>
      </form>
      {state.error && <p className="mt-2 text-sm text-destructive">{state.error}</p>}
    </div>
  );
}
