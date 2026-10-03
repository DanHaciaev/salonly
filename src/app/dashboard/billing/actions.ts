"use server";

import { redirect } from "next/navigation";
import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business";
import { configureLemonSqueezy } from "@/lib/lemonsqueezy";

export async function startCheckout() {
  const business = await getCurrentBusiness();
  if (!business) redirect("/onboarding");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  configureLemonSqueezy();

  const storeId = process.env.LEMONSQUEEZY_STORE_ID!;
  const variantId = process.env.LEMONSQUEEZY_VARIANT_ID!;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await createCheckout(storeId, variantId, {
    checkoutData: {
      email: user.email ?? undefined,
      custom: { business_id: business.id },
    },
    productOptions: {
      redirectUrl: `${siteUrl}/dashboard/billing?checkout=success`,
    },
  });

  const url = data?.data.attributes.url;
  if (error || !url) throw new Error("Lemon Squeezy did not return a checkout URL");
  redirect(url);
}
