"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleReviewPublished(id: string, isPublished: boolean) {
  const supabase = await createClient();
  await supabase.from("reviews").update({ is_published: isPublished }).eq("id", id);
  revalidatePath("/dashboard/reviews");
}

export async function deleteReview(id: string) {
  const supabase = await createClient();
  await supabase.from("reviews").delete().eq("id", id);
  revalidatePath("/dashboard/reviews");
}
