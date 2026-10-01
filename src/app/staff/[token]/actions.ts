"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStaffByToken } from "@/lib/staff-portal";
import { uploadBusinessMedia } from "@/lib/storage";

export type PortfolioFormState = { error?: string };

function getStoragePathFromPublicUrl(url: string) {
  const marker = "/object/public/media/";
  const idx = url.indexOf(marker);
  return idx === -1 ? null : url.slice(idx + marker.length);
}

export async function addPortfolioItem(
  token: string,
  _prevState: PortfolioFormState,
  formData: FormData
): Promise<PortfolioFormState> {
  const staff = await getStaffByToken(token);
  if (!staff) return { error: "Ссылка недействительна" };

  const file = formData.get("image") as File | null;
  const caption = String(formData.get("caption") ?? "").trim();
  if (!file || file.size === 0) return { error: "Выберите изображение" };

  const admin = createAdminClient();

  let imageUrl: string;
  try {
    imageUrl = await uploadBusinessMedia(admin, staff.business_id, "portfolio", file);
  } catch {
    return { error: "Не удалось загрузить изображение" };
  }

  const { error } = await admin.from("portfolio_items").insert({
    staff_id: staff.id,
    image_url: imageUrl,
    caption: caption || null,
  });

  if (error) return { error: "Не удалось сохранить работу" };

  revalidatePath(`/staff/${token}`);
  return {};
}

export async function deletePortfolioItem(token: string, id: string, imageUrl: string) {
  const staff = await getStaffByToken(token);
  if (!staff) return;

  const admin = createAdminClient();
  await admin.from("portfolio_items").delete().eq("id", id).eq("staff_id", staff.id);

  const path = getStoragePathFromPublicUrl(imageUrl);
  if (path) await admin.storage.from("media").remove([path]);

  revalidatePath(`/staff/${token}`);
}
