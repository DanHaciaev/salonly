import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getBusinessBySlug } from "@/lib/get-business";
import { createClient } from "@/lib/supabase/server";
import { BookingWizard } from "./booking-wizard";

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ business: string }>;
  searchParams: Promise<{ service?: string; staff?: string; location?: string }>;
}) {
  const { business: slug } = await params;
  const { service, staff: staffParam, location: locationId } = await searchParams;
  const business = (await getBusinessBySlug(slug))!;
  const supabase = await createClient();

  const [{ data: services }, { data: staff }] = await Promise.all([
    supabase
      .from("services")
      .select("*")
      .eq("business_id", business.id)
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("staff")
      .select("*")
      .eq("business_id", business.id)
      .eq("is_active", true)
      .order("sort_order"),
  ]);

  const staffIds = (staff ?? []).map((s) => s.id);
  const { data: staffServices } = staffIds.length
    ? await supabase.from("staff_services").select("staff_id, service_id").in("staff_id", staffIds)
    : { data: [] as { staff_id: string; service_id: string }[] };

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto mb-8 max-w-xl">
        <Link
          href={`/${slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-espresso/60 hover:text-espresso"
        >
          <ArrowLeft className="size-4" /> {business.name}
        </Link>
      </div>

      {!services?.length || !staff?.length ? (
        <p className="text-center text-espresso/60">
          Салон ещё не добавил услуги или мастеров для онлайн-записи.
        </p>
      ) : (
        <BookingWizard
          slug={slug}
          services={services}
          staff={staff}
          staffServices={staffServices ?? []}
          initialServiceId={service}
          initialStaffId={staffParam}
          locationId={locationId}
        />
      )}
    </div>
  );
}
