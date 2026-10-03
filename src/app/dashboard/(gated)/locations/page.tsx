import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business";
import { LocationsManager } from "./locations-manager";

export default async function LocationsPage() {
  const business = await getCurrentBusiness();
  const supabase = await createClient();

  const { data: locations } = await supabase
    .from("locations")
    .select("*")
    .eq("business_id", business!.id)
    .order("sort_order")
    .order("created_at");

  return <LocationsManager locations={locations ?? []} />;
}
