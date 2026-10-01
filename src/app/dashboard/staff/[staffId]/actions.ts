"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business";
import { uploadBusinessMedia } from "@/lib/storage";

export type PortfolioFormState = { error?: string };

function getStoragePathFromPublicUrl(url: string) {
  const marker = "/object/public/media/";
  const idx = url.indexOf(marker);
  return idx === -1 ? null : url.slice(idx + marker.length);
}

export async function addPortfolioItem(
  staffId: string,
  _prevState: PortfolioFormState,
  formData: FormData
): Promise<PortfolioFormState> {
  const business = await getCurrentBusiness();
  if (!business) return { error: "Салон не найден" };

  const file = formData.get("image") as File | null;
  const caption = String(formData.get("caption") ?? "").trim();

  if (!file || file.size === 0) return { error: "Выберите изображение" };

  const supabase = await createClient();

  let imageUrl: string;
  try {
    imageUrl = await uploadBusinessMedia(supabase, business.id, "portfolio", file);
  } catch {
    return { error: "Не удалось загрузить изображение" };
  }

  const { error } = await supabase.from("portfolio_items").insert({
    staff_id: staffId,
    image_url: imageUrl,
    caption: caption || null,
  });

  if (error) return { error: "Не удалось сохранить работу" };

  revalidatePath(`/dashboard/staff/${staffId}`);
  return {};
}

export async function deletePortfolioItem(id: string, staffId: string, imageUrl: string) {
  const supabase = await createClient();
  await supabase.from("portfolio_items").delete().eq("id", id);

  const path = getStoragePathFromPublicUrl(imageUrl);
  if (path) await supabase.storage.from("media").remove([path]);

  revalidatePath(`/dashboard/staff/${staffId}`);
}
