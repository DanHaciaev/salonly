"use client";

import { useState } from "react";
import Link from "next/link";
import { Images, MapPin, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StaffForm } from "./staff-form";
import { StaffActiveSwitch, DeleteStaffButton } from "./staff-row-controls";
import { CopyPortalLinkButton } from "./copy-portal-link-button";
import type { Database } from "@/lib/supabase/types";

type Staff = Database["public"]["Tables"]["staff"]["Row"];
type Service = Database["public"]["Tables"]["services"]["Row"];
type Location = Database["public"]["Tables"]["locations"]["Row"];

type Mode = { type: "idle" } | { type: "create" } | { type: "edit"; id: string };

export function StaffManager({
  staff,
  services,
  staffServiceIds,
  locations,
}: {
  staff: Staff[];
  services: Service[];
  staffServiceIds: Map<string, Set<string>>;
  locations: Location[];
}) {
  const locationNameById = new Map(locations.map((l) => [l.id, l.name]));
  const [mode, setMode] = useState<Mode>({ type: "idle" });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl text-espresso">Мастера</h1>
          <p className="mt-1 text-sm text-espresso/60">
            Карточки мастеров и их портфолио на странице салона
          </p>
        </div>
        {mode.type === "idle" && (
          <Button onClick={() => setMode({ type: "create" })}>
            <Plus /> Добавить мастера
          </Button>
        )}
      </div>

      {mode.type === "create" && (
        <StaffForm
          services={services}
          locations={locations}
          onCancel={() => setMode({ type: "idle" })}
          onSaved={() => setMode({ type: "idle" })}
        />
      )}

      {!staff.length && mode.type !== "create" ? (
        <Card className="p-10 text-center">
          <CardContent className="px-0">
            <p className="text-espresso/60">Пока нет ни одного мастера</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((member) =>
            mode.type === "edit" && mode.id === member.id ? (
              <div key={member.id} className="sm:col-span-2 lg:col-span-3">
                <StaffForm
                  staff={member}
                  services={services}
                  assignedServiceIds={staffServiceIds.get(member.id)}
                  locations={locations}
                  onCancel={() => setMode({ type: "idle" })}
                  onSaved={() => setMode({ type: "idle" })}
                />
              </div>
            ) : (
              <Card key={member.id} className="p-2">
                <CardContent className="flex flex-col gap-4 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-12">
                      <AvatarImage src={member.avatar_url ?? undefined} />
                      <AvatarFallback>{member.name.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-espresso">{member.name}</p>
                      {member.title && (
                        <p className="truncate text-sm text-espresso/50">{member.title}</p>
                      )}
                      {member.location_id && locationNameById.has(member.location_id) && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-espresso/40">
                          <MapPin className="size-3" /> {locationNameById.get(member.location_id)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/staff/${member.id}`}>
                          <Images className="size-4" /> Портфолио
                        </Link>
                      </Button>
                      <CopyPortalLinkButton accessToken={member.access_token} />
                    </div>
                    <div className="flex items-center gap-2">
                      <StaffActiveSwitch id={member.id} isActive={member.is_active} />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setMode({ type: "edit", id: member.id })}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <DeleteStaffButton id={member.id} />
                    </div>
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
