import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Star, ArrowRight } from "lucide-react";
import { getBusinessBySlug } from "@/lib/get-business";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pill } from "@/components/brand/pill";
import { SectionLabel } from "@/components/brand/section-label";

export default async function BusinessPage({
  params,
  searchParams,
}: {
  params: Promise<{ business: string }>;
  searchParams: Promise<{ location?: string }>;
}) {
  const { business: slug } = await params;
  const { location: selectedLocationId } = await searchParams;
  const business = (await getBusinessBySlug(slug))!;
  const supabase = await createClient();

  const [{ data: services }, { data: staff }, { data: reviews }, { data: locations }] = await Promise.all([
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
    supabase
      .from("reviews")
      .select("*")
      .eq("business_id", business.id)
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("locations")
      .select("*")
      .eq("business_id", business.id)
      .eq("is_active", true)
      .order("sort_order"),
  ]);

  const hasMultipleLocations = (locations?.length ?? 0) > 1;
  const activeLocation = locations?.find((l) => l.id === selectedLocationId);

  // Staff with no location assigned are shown regardless of which location is picked.
  const visibleStaff = (staff ?? []).filter(
    (member) => !activeLocation || !member.location_id || member.location_id === activeLocation.id
  );

  function bookHref(extra?: Record<string, string>) {
    const params = new URLSearchParams(extra);
    if (activeLocation) params.set("location", activeLocation.id);
    const qs = params.toString();
    return `/${slug}/book${qs ? `?${qs}` : ""}`;
  }

  function locationHref(locationId?: string) {
    const params = new URLSearchParams();
    if (locationId) params.set("location", locationId);
    const qs = params.toString();
    return `/${slug}${qs ? `?${qs}` : ""}`;
  }

  const staffIds = visibleStaff.map((s) => s.id);
  const { data: portfolioPreview } = staffIds.length
    ? await supabase
        .from("portfolio_items")
        .select("*")
        .in("staff_id", staffIds)
        .order("sort_order")
    : { data: [] as const };

  const firstPortfolioByStaff = new Map<string, string>();
  for (const item of portfolioPreview ?? []) {
    if (!firstPortfolioByStaff.has(item.staff_id)) {
      firstPortfolioByStaff.set(item.staff_id, item.image_url);
    }
  }

  const avgRating =
    reviews && reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  const priceFormatter = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-espresso/10 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            {business.logo_url ? (
              <Avatar className="size-9 rounded-xl">
                <AvatarImage src={business.logo_url} className="object-cover" />
                <AvatarFallback className="rounded-xl">{business.name.slice(0, 1)}</AvatarFallback>
              </Avatar>
            ) : null}
            <span className="font-heading text-xl text-espresso">{business.name}</span>
          </div>
          <nav className="hidden items-center gap-2 md:flex">
            <Pill className="bg-transparent">
              <a href="#services">Услуги</a>
            </Pill>
            {!!visibleStaff.length && (
              <Pill className="bg-transparent">
                <a href="#staff">Мастера</a>
              </Pill>
            )}
            {!!reviews?.length && (
              <Pill className="bg-transparent">
                <a href="#reviews">Отзывы</a>
              </Pill>
            )}
          </nav>
          <Button asChild>
            <Link href={bookHref()}>
              Записаться <ArrowRight />
            </Link>
          </Button>
        </div>
      </header>

      {/* HERO */}
      <section className="px-6 pt-16 pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
            {(activeLocation?.address ?? business.address) && (
              <Pill>
                <MapPin className="size-3.5" /> {activeLocation?.address ?? business.address}
              </Pill>
            )}
            {(activeLocation?.phone ?? business.phone) && (
              <Pill>
                <Phone className="size-3.5" /> {activeLocation?.phone ?? business.phone}
              </Pill>
            )}
          </div>

          <h1 className="font-heading text-4xl leading-tight text-espresso md:text-6xl">
            {business.name}
          </h1>
          {business.description && (
            <p className="mx-auto mt-5 max-w-xl text-espresso/70 md:text-lg">
              {business.description}
            </p>
          )}

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="h-12 px-7 text-base" asChild>
              <Link href={bookHref()}>
                Записаться онлайн <ArrowRight />
              </Link>
            </Button>
          </div>

          {avgRating && (
            <div className="mx-auto mt-10 flex w-fit items-center gap-3 rounded-full bg-white px-5 py-2.5 shadow-sm">
              <div className="flex items-center gap-0.5 text-soft-blush">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4" fill={i < Math.round(avgRating) ? "currentColor" : "none"} />
                ))}
              </div>
              <span className="font-heading text-lg text-espresso">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-espresso/50">· {reviews!.length} отзывов</span>
            </div>
          )}
        </div>
      </section>

      {/* LOCATIONS */}
      {hasMultipleLocations && (
        <section className="border-y border-espresso/10 bg-white px-6 py-16">
          <div className="mx-auto max-w-4xl">
            <SectionLabel>филиалы</SectionLabel>
            <h2 className="mt-3 mb-8 font-heading text-3xl text-espresso md:text-4xl">
              Выберите удобный филиал
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {locations!.map((location) => {
                const isSelected = activeLocation?.id === location.id;
                return (
                  <Link key={location.id} href={locationHref(isSelected ? undefined : location.id)}>
                    <Card
                      className={`p-2 transition-colors ${
                        isSelected ? "bg-espresso text-dusty-rose" : "bg-white text-espresso hover:border-soft-blush/40"
                      }`}
                    >
                      <CardContent className="px-5 py-4">
                        <p className="font-heading text-lg">{location.name}</p>
                        {location.address && (
                          <p className={`mt-1 text-sm ${isSelected ? "text-dusty-rose/70" : "text-espresso/50"}`}>
                            {location.address}
                          </p>
                        )}
                        {location.phone && (
                          <p className={`text-sm ${isSelected ? "text-dusty-rose/70" : "text-espresso/50"}`}>
                            {location.phone}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* SERVICES */}
      {!!services?.length && (
        <section id="services" className="border-y border-espresso/10 bg-white px-6 py-20 scroll-mt-20">
          <div className="mx-auto max-w-3xl">
            <SectionLabel>услуги</SectionLabel>
            <h2 className="mt-3 mb-10 font-heading text-3xl text-espresso md:text-4xl">
              Что мы предлагаем
            </h2>
            <div className="flex flex-col gap-3">
              {services.map((service) => (
                <Card key={service.id} className="p-2">
                  <CardContent className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="min-w-0">
                      <p className="font-medium text-espresso">{service.name}</p>
                      {service.description && (
                        <p className="mt-0.5 truncate text-sm text-espresso/50">
                          {service.description}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-espresso/40">
                        {service.duration_minutes} мин
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      <span className="font-heading text-xl text-espresso">
                        {priceFormatter.format(service.price)}
                      </span>
                      <Button variant="outline" asChild>
                        <Link href={bookHref({ service: service.id })}>Записаться</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* STAFF */}
      {!!visibleStaff.length && (
        <section id="staff" className="px-6 py-20 scroll-mt-20">
          <div className="mx-auto max-w-5xl">
            <SectionLabel>команда</SectionLabel>
            <h2 className="mt-3 mb-10 font-heading text-3xl text-espresso md:text-4xl">
              Наши мастера
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleStaff.map((member) => {
                const cover = firstPortfolioByStaff.get(member.id);
                return (
                  <Link key={member.id} href={`/${slug}/staff/${member.id}`}>
                    <Card className="h-full overflow-hidden p-0 transition-shadow hover:shadow-md">
                      <div className="relative aspect-[4/3] w-full bg-muted">
                        {cover ? (
                          <Image
                            src={cover}
                            alt={member.name}
                            fill
                            className="object-cover"
                            sizes="(min-width: 1024px) 33vw, 100vw"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Avatar className="size-16">
                              <AvatarImage src={member.avatar_url ?? undefined} />
                              <AvatarFallback className="text-xl">
                                {member.name.slice(0, 1)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                      </div>
                      <CardContent className="px-5 py-4">
                        <p className="font-heading text-lg text-espresso">{member.name}</p>
                        {member.title && (
                          <p className="text-sm text-espresso/50">{member.title}</p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* REVIEWS */}
      {!!reviews?.length && (
        <section id="reviews" className="border-t border-espresso/10 bg-white px-6 py-20 scroll-mt-20">
          <div className="mx-auto max-w-5xl">
            <SectionLabel>отзывы</SectionLabel>
            <h2 className="mt-3 mb-10 font-heading text-3xl text-espresso md:text-4xl">
              Что говорят клиенты
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review) => (
                <Card key={review.id} className="p-2">
                  <CardContent className="px-5 py-4">
                    <div className="mb-2 flex items-center gap-0.5 text-soft-blush">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-3.5" fill={i < review.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                    {review.comment && (
                      <p className="text-sm text-espresso/70">{review.comment}</p>
                    )}
                    <p className="mt-3 text-sm font-medium text-espresso">{review.client_name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FINAL CTA */}
      <section className="px-6 py-20">
        <Card className="mx-auto max-w-4xl bg-gradient-to-br from-soft-blush to-espresso p-12 text-center text-dusty-rose">
          <CardContent className="px-0">
            <h2 className="font-heading text-3xl md:text-4xl">Готовы записаться?</h2>
            <p className="mx-auto mt-3 max-w-md text-dusty-rose/80">
              Выберите услугу, мастера и удобное время — это займёт пару минут.
            </p>
            <Button size="lg" variant="secondary" className="mt-7 h-12 px-7" asChild>
              <Link href={bookHref()}>
                Записаться онлайн <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <footer className="border-t border-espresso/10 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-sm text-espresso/50 md:flex-row">
          <span className="font-heading text-lg text-espresso">{business.name}</span>
          {business.address && <span>{business.address}</span>}
          {business.phone && <span>{business.phone}</span>}
        </div>
      </footer>
    </div>
  );
}
