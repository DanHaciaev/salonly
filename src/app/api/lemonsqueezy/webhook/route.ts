import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

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

  // The $200 fee is a one-time purchase (Lemon Squeezy "order"), not a
  // subscription — a paid order grants lifetime access, nothing to renew.
  if (eventName !== "order_created") {
    return NextResponse.json({ received: true });
  }

  const businessId: string | undefined = payload.meta?.custom_data?.business_id;
  const attrs = payload.data?.attributes;
  const orderId = payload.data?.id ? String(payload.data.id) : null;

  if (!businessId || !attrs || !orderId || attrs.status !== "paid") {
    return NextResponse.json({ received: true });
  }

  const admin = createAdminClient();
  await admin
    .from("businesses")
    .update({
      lemonsqueezy_customer_id: String(attrs.customer_id),
      lemonsqueezy_order_id: orderId,
      subscription_status: "active",
      paid_at: new Date().toISOString(),
    })
    .eq("id", businessId);

  return NextResponse.json({ received: true });
}
