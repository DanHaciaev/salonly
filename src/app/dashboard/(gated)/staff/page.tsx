import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business";
import { StaffManager } from "./staff-manager";

export default async function StaffPage() {
  const business = await getCurrentBusiness();
  const supabase = await createClient();

  const [{ data: staff }, { data: services }, { data: locations }] = await Promise.all([
    supabase
      .from("staff")
      .select("*")
      .eq("business_id", business!.id)
      .order("sort_order")
      .order("created_at"),
    supabase
      .from("services")
      .select("*")
      .eq("business_id", business!.id)
      .order("sort_order"),
    supabase
      .from("locations")
      .select("*")
      .eq("business_id", business!.id)
      .order("sort_order"),
  ]);

  const staffIds = (staff ?? []).map((s) => s.id);
  const { data: assignments } = staffIds.length
    ? await supabase.from("staff_services").select("staff_id, service_id").in("staff_id", staffIds)
    : { data: [] as { staff_id: string; service_id: string }[] };

  const staffServiceIds = new Map<string, Set<string>>();
  for (const row of assignments ?? []) {
    if (!staffServiceIds.has(row.staff_id)) staffServiceIds.set(row.staff_id, new Set());
    staffServiceIds.get(row.staff_id)!.add(row.service_id);
  }

  return (
    <StaffManager
      staff={staff ?? []}
      services={services ?? []}
      staffServiceIds={staffServiceIds}
      locations={locations ?? []}
    />
  );
}
