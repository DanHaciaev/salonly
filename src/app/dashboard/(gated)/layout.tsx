import { redirect } from "next/navigation";
import { getCurrentBusiness } from "@/lib/business";
import { hasActiveAccess } from "@/lib/subscription";

export default async function GatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const business = await getCurrentBusiness();
  if (!business) redirect("/onboarding");

  if (!hasActiveAccess(business)) redirect("/dashboard/billing");

  return <>{children}</>;
}
