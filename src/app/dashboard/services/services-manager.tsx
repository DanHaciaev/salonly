"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ServiceForm } from "./service-form";
import { ServiceActiveSwitch, DeleteServiceButton } from "./service-row-controls";
import type { Database } from "@/lib/supabase/types";

type Service = Database["public"]["Tables"]["services"]["Row"];

type Mode = { type: "idle" } | { type: "create" } | { type: "edit"; id: string };

export function ServicesManager({ services }: { services: Service[] }) {
  const [mode, setMode] = useState<Mode>({ type: "idle" });

  const priceFormatter = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl text-espresso">Услуги</h1>
          <p className="mt-1 text-sm text-espresso/60">
            Клиенты увидят их на странице бронирования
          </p>
        </div>
        {mode.type === "idle" && (
          <Button onClick={() => setMode({ type: "create" })}>
            <Plus /> Добавить услугу
          </Button>
        )}
      </div>

      {mode.type === "create" && (
        <ServiceForm onCancel={() => setMode({ type: "idle" })} onSaved={() => setMode({ type: "idle" })} />
      )}

      {!services.length && mode.type !== "create" ? (
        <Card className="p-10 text-center">
          <CardContent className="px-0">
            <p className="text-espresso/60">Пока нет ни одной услуги</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {services.map((service) =>
            mode.type === "edit" && mode.id === service.id ? (
              <ServiceForm
                key={service.id}
                service={service}
                onCancel={() => setMode({ type: "idle" })}
                onSaved={() => setMode({ type: "idle" })}
              />
            ) : (
              <Card key={service.id} className="p-2">
                <CardContent className="flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-espresso">{service.name}</p>
                    {service.description && (
                      <p className="truncate text-sm text-espresso/50">{service.description}</p>
                    )}
                    <p className="text-xs text-espresso/40 sm:hidden">
                      {service.duration_minutes} мин · {priceFormatter.format(service.price)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-5">
                    <span className="hidden text-sm text-espresso/70 sm:inline">
                      {service.duration_minutes} мин
                    </span>
                    <span className="hidden font-heading text-lg text-espresso sm:inline">
                      {priceFormatter.format(service.price)}
                    </span>
                    <ServiceActiveSwitch id={service.id} isActive={service.is_active} />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setMode({ type: "edit", id: service.id })}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <DeleteServiceButton id={service.id} />
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      )}
    </div>
  );
}
