import { redirect } from "next/navigation";
import { getCurrentBusiness } from "@/lib/business";

const ACCESS_ALLOWED_STATUSES = new Set(["trialing", "active"]);

export default async function GatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const business = await getCurrentBusiness();
  if (!business) redirect("/onboarding");

  if (!business.subscription_status || !ACCESS_ALLOWED_STATUSES.has(business.subscription_status)) {
    redirect("/dashboard/billing");
  }

  return <>{children}</>;
}
