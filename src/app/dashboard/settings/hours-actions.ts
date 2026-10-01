"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business";

export type HoursFormState = { error?: string; success?: boolean };

export async function updateBusinessHours(
  _prevState: HoursFormState,
  formData: FormData
): Promise<HoursFormState> {
  const business = await getCurrentBusiness();
  if (!business) return { error: "Салон не найден" };

  const openTime = String(formData.get("open_time") ?? "");
  const closeTime = String(formData.get("close_time") ?? "");

  if (!openTime || !closeTime || openTime >= closeTime) {
    return { error: "Проверьте время открытия и закрытия" };
  }

  const supabase = await createClient();
  const rows = Array.from({ length: 7 }, (_, dayOfWeek) => ({
    business_id: business.id,
    day_of_week: dayOfWeek,
    open_time: openTime,
    close_time: closeTime,
  }));

  const { error } = await supabase
    .from("business_hours")
    .upsert(rows, { onConflict: "business_id,day_of_week" });

  if (error) return { error: "Не удалось сохранить часы работы" };

  revalidatePath("/dashboard/settings");
  return { success: true };
}
