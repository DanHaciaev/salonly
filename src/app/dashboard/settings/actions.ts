"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business";
import { uploadBusinessMedia } from "@/lib/storage";

export type SettingsFormState = { error?: string; success?: boolean };

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function updateBusinessSettings(
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const business = await getCurrentBusiness();
  if (!business) return { error: "Салон не найден" };

  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? ""));
  const description = String(formData.get("description") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const logoFile = formData.get("logo") as File | null;

  if (!name) return { error: "Введите название салона" };
  if (slug.length < 2) return { error: "Ссылка слишком короткая" };

  const supabase = await createClient();

  let logoUrl: string | undefined;
  if (logoFile && logoFile.size > 0) {
    try {
      logoUrl = await uploadBusinessMedia(supabase, business.id, "logo", logoFile);
    } catch {
      return { error: "Не удалось загрузить логотип" };
    }
  }

  const { error } = await supabase
    .from("businesses")
    .update({
      name,
      slug,
      description: description || null,
      phone: phone || null,
      address: address || null,
      updated_at: new Date().toISOString(),
      ...(logoUrl ? { logo_url: logoUrl } : {}),
    })
    .eq("id", business.id);

  if (error) {
    if (error.code === "23505") return { error: "Такая ссылка уже занята" };
    return { error: "Не удалось сохранить настройки" };
  }

  revalidatePath("/dashboard/settings");
  revalidatePath(`/${slug}`);
  return { success: true };
}
