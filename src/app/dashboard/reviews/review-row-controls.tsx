"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { deleteReview, toggleReviewPublished } from "./actions";

export function ReviewPublishedSwitch({ id, isPublished }: { id: string; isPublished: boolean }) {
  return (
    <Switch checked={isPublished} onCheckedChange={(checked) => toggleReviewPublished(id, checked)} />
  );
}

export function DeleteReviewButton({ id }: { id: string }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={() => {
        if (confirm("Удалить отзыв?")) deleteReview(id);
      }}
    >
      <Trash2 className="size-4 text-destructive" />
    </Button>
  );
}
