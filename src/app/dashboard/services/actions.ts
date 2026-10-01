"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business";

export type ServiceFormState = { error?: string };

export async function upsertService(
  _prevState: ServiceFormState,
  formData: FormData
): Promise<ServiceFormState> {
  const business = await getCurrentBusiness();
  if (!business) return { error: "Салон не найден" };

  const id = formData.get("id") as string | null;
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price"));
  const durationMinutes = Number(formData.get("duration_minutes"));

  if (!name) return { error: "Введите название услуги" };
  if (!Number.isFinite(price) || price < 0) return { error: "Некорректная цена" };
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return { error: "Некорректная длительность" };
  }

  const supabase = await createClient();
  const payload = {
    business_id: business.id,
    name,
    description: description || null,
    price,
    duration_minutes: durationMinutes,
  };

  const { error } = id
    ? await supabase.from("services").update(payload).eq("id", id)
    : await supabase.from("services").insert(payload);

  if (error) return { error: "Не удалось сохранить услугу" };

  revalidatePath("/dashboard/services");
  return {};
}

export async function deleteService(id: string) {
  const supabase = await createClient();
  await supabase.from("services").delete().eq("id", id);
  revalidatePath("/dashboard/services");
}

export async function toggleServiceActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("services").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/dashboard/services");
}
