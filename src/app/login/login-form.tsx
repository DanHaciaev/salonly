"use client";

import { useActionState } from "react";
import { logIn, type LoginState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(logIn, initialState);

  return (
    <div className="flex flex-col gap-4">
      <GoogleSignInButton />

      <div className="flex items-center gap-3 text-xs text-espresso/40">
        <div className="h-px flex-1 bg-espresso/10" />
        или email
        <div className="h-px flex-1 bg-espresso/10" />
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required placeholder="you@salon.com" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Пароль</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <Button type="submit" className="mt-2 h-11" disabled={pending}>
          {pending ? "Входим…" : "Войти"}
        </Button>
      </form>
    </div>
  );
}
