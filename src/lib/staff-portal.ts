import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";

export const getStaffByToken = cache(async (token: string) => {
  const admin = createAdminClient();
  const { data } = await admin
    .from("staff")
    .select("*")
    .eq("access_token", token)
    .maybeSingle();
  return data;
});
