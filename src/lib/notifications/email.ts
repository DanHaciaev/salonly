import { Resend } from "resend";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL || "Salonly <onboarding@resend.dev>";

  try {
    await resend.emails.send({ from, to, subject, html });
  } catch {
    // Best-effort — a failed notification should never fail the booking itself.
  }
}
