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
    ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
  };

  const { error } = id
    ? await supabase.from("staff").update(payload).eq("id", id)
    : await supabase.from("staff").insert(payload);

  if (error) return { error: "Не удалось сохранить мастера" };

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
