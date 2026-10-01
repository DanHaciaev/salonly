import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBusinessBySlug } from "@/lib/get-business";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ business: string }>;
}): Promise<Metadata> {
  const { business: slug } = await params;
  const business = await getBusinessBySlug(slug);
  if (!business) return {};

  return {
    title: `${business.name} — запись онлайн`,
    description: business.description ?? `Онлайн-запись в ${business.name}`,
  };
}

export default async function BusinessLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ business: string }>;
}) {
  const { business: slug } = await params;
  const business = await getBusinessBySlug(slug);
  if (!business) notFound();

  return <>{children}</>;
}
