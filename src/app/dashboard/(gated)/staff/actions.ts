"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business";
import { uploadBusinessMedia } from "@/lib/storage";

export type StaffFormState = { error?: string };

export async function upsertStaff(
  _prevState: StaffFormState,
  formData: FormData
): Promise<StaffFormState> {
  const business = await getCurrentBusiness();
  if (!business) return { error: "Салон не найден" };

  const id = formData.get("id") as string | null;
  const name = String(formData.get("name") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const avatarFile = formData.get("avatar") as File | null;
  const serviceIds = formData.getAll("service_ids").map(String);
  const locationId = String(formData.get("location_id") ?? "").trim();

  if (!name) return { error: "Введите имя мастера" };

  const supabase = await createClient();

  let avatarUrl: string | undefined;
  if (avatarFile && avatarFile.size > 0) {
    try {
      avatarUrl = await uploadBusinessMedia(supabase, business.id, "staff", avatarFile);
    } catch {
      return { error: "Не удалось загрузить фото" };
    }
  }

  const payload = {
    business_id: business.id,
    name,
    title: title || null,
    bio: bio || null,
    location_id: locationId || null,
    ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
  };

  const { data: savedStaff, error } = id
    ? await supabase.from("staff").update(payload).eq("id", id).select("id").single()
    : await supabase.from("staff").insert(payload).select("id").single();

  if (error || !savedStaff) return { error: "Не удалось сохранить мастера" };

  await supabase.from("staff_services").delete().eq("staff_id", savedStaff.id);
  if (serviceIds.length) {
    await supabase
      .from("staff_services")
      .insert(serviceIds.map((serviceId) => ({ staff_id: savedStaff.id, service_id: serviceId })));
  }

  revalidatePath("/dashboard/staff");
  return {};
}

export async function deleteStaff(id: string) {
  const supabase = await createClient();
  await supabase.from("staff").delete().eq("id", id);
  revalidatePath("/dashboard/staff");
}

export async function toggleStaffActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("staff").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/dashboard/staff");
}
