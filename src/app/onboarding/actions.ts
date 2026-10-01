"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type OnboardingState = { error?: string };

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createBusiness(
  _prevState: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? ""));

  if (!name) return { error: "Введите название салона" };
  if (slug.length < 2) return { error: "Ссылка слишком короткая" };

  const { data: business, error } = await supabase
    .from("businesses")
    .insert({ owner_id: user.id, name, slug })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      if (error.message.includes("slug")) {
        return { error: "Такая ссылка уже занята, выберите другую" };
      }
      // owner_id unique violation — business already exists for this user.
      redirect("/dashboard");
    }
    return { error: "Не удалось создать салон, попробуйте ещё раз" };
  }

  await supabase.from("notification_settings").insert({ business_id: business.id });

  redirect("/dashboard");
}
