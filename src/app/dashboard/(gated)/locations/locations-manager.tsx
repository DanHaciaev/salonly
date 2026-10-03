"use client";

import { useState } from "react";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { LocationForm } from "./location-form";
import { deleteLocation, toggleLocationActive } from "./actions";
import type { Database } from "@/lib/supabase/types";

type Location = Database["public"]["Tables"]["locations"]["Row"];

type Mode = { type: "idle" } | { type: "create" } | { type: "edit"; id: string };

export function LocationsManager({ locations }: { locations: Location[] }) {
  const [mode, setMode] = useState<Mode>({ type: "idle" });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl text-espresso">Филиалы</h1>
          <p className="mt-1 text-sm text-espresso/60">
            Если у бизнеса несколько точек — клиент выбирает филиал перед записью
          </p>
        </div>
        {mode.type === "idle" && (
          <Button onClick={() => setMode({ type: "create" })}>
            <Plus /> Добавить филиал
          </Button>
        )}
      </div>

      {mode.type === "create" && (
        <LocationForm onCancel={() => setMode({ type: "idle" })} onSaved={() => setMode({ type: "idle" })} />
      )}

      {!locations.length && mode.type !== "create" ? (
        <Card className="p-10 text-center">
          <CardContent className="px-0">
            <p className="text-espresso/60">
              Пока нет ни одного филиала — без них страница салона работает как с одной точкой
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {locations.map((location) =>
            mode.type === "edit" && mode.id === location.id ? (
              <LocationForm
                key={location.id}
                location={location}
                onCancel={() => setMode({ type: "idle" })}
                onSaved={() => setMode({ type: "idle" })}
              />
            ) : (
              <Card key={location.id} className="p-2">
                <CardContent className="flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-soft-blush" />
                    <div className="min-w-0">
                      <p className="font-medium text-espresso">{location.name}</p>
                      {location.address && (
                        <p className="truncate text-sm text-espresso/50">{location.address}</p>
                      )}
                      {location.phone && <p className="text-sm text-espresso/50">{location.phone}</p>}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Switch
                      checked={location.is_active}
                      onCheckedChange={(checked) => toggleLocationActive(location.id, checked)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setMode({ type: "edit", id: location.id })}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        if (confirm("Удалить филиал? Мастера останутся без привязки к филиалу.")) {
                          deleteLocation(location.id);
                        }
                      }}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
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
