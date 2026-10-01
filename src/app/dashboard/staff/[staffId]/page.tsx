import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StaffFormDialog } from "../staff-form-dialog";
import { PortfolioUploadDialog } from "./portfolio-upload-dialog";
import { DeletePortfolioButton } from "./delete-portfolio-button";

export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ staffId: string }>;
}) {
  const { staffId } = await params;
  const business = await getCurrentBusiness();
  const supabase = await createClient();

  const { data: staff } = await supabase
    .from("staff")
    .select("*")
    .eq("id", staffId)
    .eq("business_id", business!.id)
    .maybeSingle();

  if (!staff) notFound();

  const { data: portfolio } = await supabase
    .from("portfolio_items")
    .select("*")
    .eq("staff_id", staffId)
    .order("sort_order")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/dashboard/staff"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-espresso/60 hover:text-espresso"
      >
        <ArrowLeft className="size-4" /> Все мастера
      </Link>

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
          <StaffFormDialog staff={staff} />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl text-espresso">Портфолио</h2>
        <PortfolioUploadDialog staffId={staff.id} />
      </div>

      {!portfolio?.length ? (
        <Card className="p-10 text-center">
          <CardContent className="px-0">
            <p className="text-espresso/60">Пока нет работ в портфолио</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {portfolio.map((item) => (
            <div key={item.id} className="group relative overflow-hidden rounded-3xl">
              <div className="relative aspect-[4/5] w-full bg-muted">
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
    </div>
  );
}
