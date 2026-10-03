import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business";
import { StaffDetailManager } from "./staff-detail-manager";

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

  const [{ data: portfolio }, { data: services }, { data: assignments }, { data: hours }] =
    await Promise.all([
      supabase
        .from("portfolio_items")
        .select("*")
        .eq("staff_id", staffId)
        .order("sort_order")
        .order("created_at", { ascending: false }),
      supabase.from("services").select("*").eq("business_id", business!.id).order("sort_order"),
      supabase.from("staff_services").select("service_id").eq("staff_id", staffId),
      supabase.from("staff_hours").select("*").eq("staff_id", staffId),
    ]);

  const assignedServiceIds = new Set((assignments ?? []).map((a) => a.service_id));

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/dashboard/staff"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-espresso/60 hover:text-espresso"
      >
        <ArrowLeft className="size-4" /> Все мастера
      </Link>

      <StaffDetailManager
        staff={staff}
        portfolio={portfolio ?? []}
        services={services ?? []}
        assignedServiceIds={assignedServiceIds}
        hours={hours ?? []}
      />
    </div>
  );
}
