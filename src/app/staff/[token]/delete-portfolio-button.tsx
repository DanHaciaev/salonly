"use client";

import { X } from "lucide-react";
import { deletePortfolioItem } from "./actions";

export function DeletePortfolioButton({
  token,
  id,
  imageUrl,
}: {
  token: string;
  id: string;
  imageUrl: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        if (confirm("Удалить эту работу из портфолио?")) {
          deletePortfolioItem(token, id, imageUrl);
        }
      }}
      className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-espresso/70 text-dusty-rose opacity-0 transition-opacity group-hover:opacity-100"
    >
      <X className="size-4" />
    </button>
  );
}
