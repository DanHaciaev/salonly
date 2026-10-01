import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const getBusinessBySlug = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data;
});
