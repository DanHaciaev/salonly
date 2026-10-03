"use client";

import { X } from "lucide-react";
import { deletePortfolioItem } from "./actions";

export function DeletePortfolioButton({
  id,
  staffId,
  imageUrl,
}: {
  id: string;
  staffId: string;
  imageUrl: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        if (confirm("Удалить эту работу из портфолио?")) {
          deletePortfolioItem(id, staffId, imageUrl);
        }
      }}
      className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-espresso/70 text-dusty-rose opacity-0 transition-opacity group-hover:opacity-100"
    >
      <X className="size-4" />
    </button>
  );
}
