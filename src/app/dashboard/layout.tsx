import { redirect } from "next/navigation";
import { getCurrentBusiness } from "@/lib/business";
import { DashboardShell } from "./dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const business = await getCurrentBusiness();
  if (!business) redirect("/onboarding");

  return <DashboardShell business={business}>{children}</DashboardShell>;
}
