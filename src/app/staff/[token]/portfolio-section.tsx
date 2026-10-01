"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PortfolioForm } from "./portfolio-form";
import { DeletePortfolioButton } from "./delete-portfolio-button";
import type { Database } from "@/lib/supabase/types";

type PortfolioItem = Database["public"]["Tables"]["portfolio_items"]["Row"];

export function PortfolioSection({
  token,
  portfolio,
}: {
  token: string;
  portfolio: PortfolioItem[];
}) {
  const [adding, setAdding] = useState(false);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-xl text-espresso">Портфолио</h2>
        {!adding && (
          <Button onClick={() => setAdding(true)}>
            <Plus /> Добавить работу
          </Button>
        )}
      </div>

      {adding && (
        <div className="mb-4">
          <PortfolioForm token={token} onCancel={() => setAdding(false)} onSaved={() => setAdding(false)} />
        </div>
      )}

      {!portfolio.length ? (
        <Card className="p-8 text-center">
          <CardContent className="px-0 text-espresso/60">Пока нет работ</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {portfolio.map((item) => (
            <div key={item.id} className="group relative overflow-hidden rounded-3xl">
              <div className="relative aspect-4/5 w-full bg-muted">
                <Image
                  src={item.image_url}
                  alt={item.caption ?? "Работа"}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                />
              </div>
              <DeletePortfolioButton token={token} id={item.id} imageUrl={item.image_url} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
