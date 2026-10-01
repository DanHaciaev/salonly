import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStaffByToken } from "@/lib/staff-portal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const staff = await getStaffByToken(token);
  if (!staff) return {};
  return { title: `${staff.name} — личный кабинет` };
}

export default async function StaffPortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const staff = await getStaffByToken(token);
  if (!staff) notFound();

  return <>{children}</>;
}
