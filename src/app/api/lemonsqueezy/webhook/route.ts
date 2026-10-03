import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SubscriptionStatus } from "@/lib/supabase/types";

const RELEVANT_EVENTS = new Set([
  "subscription_created",
  "subscription_updated",
  "subscription_cancelled",
  "subscription_resumed",
  "subscription_expired",
  "subscription_paused",
  "subscription_unpaused",
]);

function mapStatus(lsStatus: string): SubscriptionStatus | null {
  switch (lsStatus) {
    case "on_trial":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "cancelled":
    case "expired":
    case "paused":
    case "pause":
      return "canceled";
    default:
      return null;
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-signature") ?? "";

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  const valid =
    signatureBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(signatureBuffer, expectedBuffer);

  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const payload = JSON.parse(rawBody);
  const eventName: string = payload.meta?.event_name ?? "";

  if (!RELEVANT_EVENTS.has(eventName)) {
    return NextResponse.json({ received: true });
  }

  const businessId: string | undefined = payload.meta?.custom_data?.business_id;
  const attrs = payload.data?.attributes;
  const subscriptionId = payload.data?.id ? String(payload.data.id) : null;

  if (!attrs || !subscriptionId) {
    return NextResponse.json({ received: true });
  }

  const admin = createAdminClient();
  const update = {
    lemonsqueezy_customer_id: String(attrs.customer_id),
    lemonsqueezy_subscription_id: subscriptionId,
    subscription_status: mapStatus(attrs.status),
    trial_ends_at: attrs.trial_ends_at ?? null,
    current_period_end: attrs.renews_at ?? null,
  };

  if (businessId) {
    await admin.from("businesses").update(update).eq("id", businessId);
  } else {
    await admin.from("businesses").update(update).eq("lemonsqueezy_subscription_id", subscriptionId);
  }

  return NextResponse.json({ received: true });
}
