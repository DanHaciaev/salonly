import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business";
import { ServicesManager } from "./services-manager";

export default async function ServicesPage() {
  const business = await getCurrentBusiness();
  const supabase = await createClient();

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("business_id", business!.id)
    .order("sort_order")
    .order("created_at");

  return <ServicesManager services={services ?? []} />;
}
