"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business";

export type LocationFormState = { error?: string };

export async function upsertLocation(
  _prevState: LocationFormState,
  formData: FormData
): Promise<LocationFormState> {
  const business = await getCurrentBusiness();
  if (!business) return { error: "Салон не найден" };

  const id = formData.get("id") as string | null;
  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!name) return { error: "Введите название филиала" };

  const supabase = await createClient();
  const payload = {
    business_id: business.id,
    name,
    address: address || null,
    phone: phone || null,
  };

  const { error } = id
    ? await supabase.from("locations").update(payload).eq("id", id)
    : await supabase.from("locations").insert(payload);

  if (error) return { error: "Не удалось сохранить филиал" };

  revalidatePath("/dashboard/locations");
  revalidatePath("/dashboard/staff");
  return {};
}

export async function deleteLocation(id: string) {
  const supabase = await createClient();
  await supabase.from("locations").delete().eq("id", id);
  revalidatePath("/dashboard/locations");
  revalidatePath("/dashboard/staff");
}

export async function toggleLocationActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("locations").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/dashboard/locations");
}
