"use client";

import { useState } from "react";
import Image from "next/image";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StaffForm } from "../staff-form";
import { CopyPortalLinkButton } from "../copy-portal-link-button";
import { PortfolioForm } from "./portfolio-form";
import { DeletePortfolioButton } from "./delete-portfolio-button";
import { ScheduleForm } from "./schedule-form";
import type { Database } from "@/lib/supabase/types";

type Staff = Database["public"]["Tables"]["staff"]["Row"];
type Service = Database["public"]["Tables"]["services"]["Row"];
type PortfolioItem = Database["public"]["Tables"]["portfolio_items"]["Row"];
type StaffHours = Database["public"]["Tables"]["staff_hours"]["Row"];

export function StaffDetailManager({
  staff,
  portfolio,
  services,
  assignedServiceIds,
  hours,
}: {
  staff: Staff;
  portfolio: PortfolioItem[];
  services: Service[];
  assignedServiceIds: Set<string>;
  hours: StaffHours[];
}) {
  const [editingHeader, setEditingHeader] = useState(false);
  const [addingPortfolio, setAddingPortfolio] = useState(false);

  return (
    <>
      {editingHeader ? (
        <StaffForm
          staff={staff}
          services={services}
          assignedServiceIds={assignedServiceIds}
          onCancel={() => setEditingHeader(false)}
          onSaved={() => setEditingHeader(false)}
        />
      ) : (
        <Card className="p-2">
          <CardContent className="flex items-center justify-between gap-4 px-6 py-5">
            <div className="flex items-center gap-4">
              <Avatar className="size-16">
                <AvatarImage src={staff.avatar_url ?? undefined} />
                <AvatarFallback>{staff.name.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-heading text-2xl text-espresso">{staff.name}</p>
                {staff.title && <p className="text-sm text-espresso/60">{staff.title}</p>}
                {staff.bio && <p className="mt-1 max-w-lg text-sm text-espresso/50">{staff.bio}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CopyPortalLinkButton accessToken={staff.access_token} />
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => setEditingHeader(true)}>
                <Pencil className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8">
        <h2 className="mb-4 font-heading text-2xl text-espresso">Расписание</h2>
        <ScheduleForm staffId={staff.id} hours={hours} />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-heading text-2xl text-espresso">Портфолио</h2>
        {!addingPortfolio && (
          <Button onClick={() => setAddingPortfolio(true)}>
            <Plus /> Добавить работу
          </Button>
        )}
      </div>

      {addingPortfolio && (
        <div className="mt-4">
          <PortfolioForm
            staffId={staff.id}
            onCancel={() => setAddingPortfolio(false)}
            onSaved={() => setAddingPortfolio(false)}
          />
        </div>
      )}

      {!portfolio.length ? (
        <Card className="mt-4 p-10 text-center">
          <CardContent className="px-0">
            <p className="text-espresso/60">Пока нет работ в портфолио</p>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {portfolio.map((item) => (
            <div key={item.id} className="group relative overflow-hidden rounded-3xl">
              <div className="relative aspect-4/5 w-full bg-muted">
                <Image
                  src={item.image_url}
                  alt={item.caption ?? "Работа мастера"}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                />
              </div>
              {item.caption && (
                <p className="absolute bottom-0 w-full bg-espresso/60 px-3 py-2 text-xs text-dusty-rose">
                  {item.caption}
                </p>
              )}
              <DeletePortfolioButton id={item.id} staffId={staff.id} imageUrl={item.image_url} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
