"use client";

import { useActionState } from "react";
import { signUp, type SignUpState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";

const initialState: SignUpState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  if (state.needsConfirmation) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <Mail className="size-8 text-soft-blush" />
        <p className="font-heading text-lg text-espresso">Проверьте почту</p>
        <p className="text-sm text-espresso/60">
          Мы отправили письмо со ссылкой подтверждения — перейдите по ней, чтобы
          продолжить настройку салона.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required placeholder="you@salon.com" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Пароль</Label>
        <Input id="password" name="password" type="password" required minLength={8} />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" className="mt-2 h-11" disabled={pending}>
        {pending ? "Создаём аккаунт…" : "Зарегистрироваться"}
      </Button>
    </form>
  );
}
