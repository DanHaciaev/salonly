import Link from "next/link";
import { Images } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StaffFormDialog } from "./staff-form-dialog";
import { StaffActiveSwitch, DeleteStaffButton } from "./staff-row-controls";

export default async function StaffPage() {
  const business = await getCurrentBusiness();
  const supabase = await createClient();

  const { data: staff } = await supabase
    .from("staff")
    .select("*")
    .eq("business_id", business!.id)
    .order("sort_order")
    .order("created_at");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl text-espresso">Мастера</h1>
          <p className="mt-1 text-sm text-espresso/60">
            Карточки мастеров и их портфолио на странице салона
          </p>
        </div>
        <StaffFormDialog />
      </div>

      {!staff?.length ? (
        <Card className="p-10 text-center">
          <CardContent className="px-0">
            <p className="text-espresso/60">Пока нет ни одного мастера</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((member) => (
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
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/staff/${member.id}`}>
                      <Images className="size-4" /> Портфолио
                    </Link>
                  </Button>
                  <div className="flex items-center gap-2">
                    <StaffActiveSwitch id={member.id} isActive={member.is_active} />
                    <StaffFormDialog staff={member} />
                    <DeleteStaffButton id={member.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
