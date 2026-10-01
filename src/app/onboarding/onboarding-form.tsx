"use client";

import { useActionState, useState } from "react";
import { createBusiness, type OnboardingState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: OnboardingState = {};

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(createBusiness, initialState);
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Название салона</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="Студия красоты «Лиза»"
          onChange={(e) => {
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="slug">Ссылка для клиентов</Label>
        <div className="flex items-center overflow-hidden rounded-full border border-input bg-transparent pl-4 text-sm text-espresso/50 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
          <span className="whitespace-nowrap">salonly.app/</span>
          <Input
            id="slug"
            name="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            placeholder="liza-studio"
            className="h-11 rounded-none border-none px-1 text-espresso shadow-none focus-visible:ring-0"
          />
        </div>
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" className="mt-2 h-11" disabled={pending}>
        {pending ? "Создаём страницу…" : "Создать страницу салона"}
      </Button>
    </form>
  );
}
