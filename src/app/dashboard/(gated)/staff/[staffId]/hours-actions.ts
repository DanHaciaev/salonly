"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type HoursFormState = { error?: string; success?: boolean };

const DAY_VALUES = [0, 1, 2, 3, 4, 5, 6];

export async function updateStaffHours(
  staffId: string,
  _prevState: HoursFormState,
  formData: FormData
): Promise<HoursFormState> {
  const rows: { staff_id: string; day_of_week: number; start_time: string; end_time: string }[] = [];

  for (const day of DAY_VALUES) {
    if (formData.get(`day_${day}_enabled`) !== "on") continue;

    const start = String(formData.get(`day_${day}_start`) ?? "");
    const end = String(formData.get(`day_${day}_end`) ?? "");

    if (!start || !end || start >= end) {
      return { error: "Проверьте время начала и конца для выбранных дней" };
    }

    rows.push({ staff_id: staffId, day_of_week: day, start_time: start, end_time: end });
  }

  const supabase = await createClient();

  await supabase.from("staff_hours").delete().eq("staff_id", staffId);
  if (rows.length) {
    const { error } = await supabase.from("staff_hours").insert(rows);
    if (error) return { error: "Не удалось сохранить расписание" };
  }

  revalidatePath(`/dashboard/staff/${staffId}`);
  return { success: true };
}
