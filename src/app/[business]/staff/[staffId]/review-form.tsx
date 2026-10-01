"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { submitReview, type ReviewFormState } from "./review-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: ReviewFormState = {};

export function ReviewForm({ slug, staffId }: { slug: string; staffId: string }) {
  const action = submitReview.bind(null, slug, staffId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  if (state.success) {
    return (
      <p className="text-sm text-soft-blush">
        Спасибо! Отзыв отправлен и появится на странице после проверки.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <input type="hidden" name="rating" value={rating} />
      <div className="flex flex-col gap-1.5">
        <Label>Оценка</Label>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const value = i + 1;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-soft-blush"
              >
                <Star className="size-6" fill={value <= (hoverRating || rating) ? "currentColor" : "none"} />
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="client_name">Ваше имя</Label>
        <Input id="client_name" name="client_name" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="comment">Отзыв (необязательно)</Label>
        <Textarea id="comment" name="comment" placeholder="Расскажите о своём опыте" />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" className="w-fit" disabled={pending}>
        {pending ? "Отправляем…" : "Оставить отзыв"}
      </Button>
    </form>
  );
}
