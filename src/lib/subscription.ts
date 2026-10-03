import type { Database } from "./supabase/types";

type Business = Database["public"]["Tables"]["businesses"]["Row"];

/**
 * A business has CRM access either during its 7-day free trial or after
 * paying once for lifetime access — there's no recurring renewal to check.
 */
export function hasActiveAccess(business: Pick<Business, "subscription_status" | "trial_ends_at">) {
  if (business.subscription_status === "active") return true;
  return new Date(business.trial_ends_at) > new Date();
}
