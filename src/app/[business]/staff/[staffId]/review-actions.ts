"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBusinessBySlug } from "@/lib/get-business";

export type ReviewFormState = { error?: string; success?: boolean };

export async function submitReview(
  slug: string,
  staffId: string,
  _prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const business = await getBusinessBySlug(slug);
  if (!business) return { error: "Салон не найден" };

  const clientName = String(formData.get("client_name") ?? "").trim();
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "").trim();

  if (!clientName) return { error: "Введите имя" };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Выберите оценку от 1 до 5" };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("reviews").insert({
    business_id: business.id,
    staff_id: staffId,
    client_name: clientName,
    rating,
    comment: comment || null,
    is_published: false,
  });

  if (error) return { error: "Не удалось отправить отзыв" };

  revalidatePath(`/${slug}/staff/${staffId}`);
  return { success: true };
}
