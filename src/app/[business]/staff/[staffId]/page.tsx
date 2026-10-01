import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { getBusinessBySlug } from "@/lib/get-business";
import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ReviewForm } from "./review-form";

export default async function PublicStaffPage({
  params,
}: {
  params: Promise<{ business: string; staffId: string }>;
}) {
  const { business: slug, staffId } = await params;
  const business = (await getBusinessBySlug(slug))!;
  const supabase = await createClient();

  const { data: member } = await supabase
    .from("staff")
    .select("*")
    .eq("id", staffId)
    .eq("business_id", business.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!member) notFound();

  const [{ data: portfolio }, { data: reviews }] = await Promise.all([
    supabase
      .from("portfolio_items")
      .select("*")
      .eq("staff_id", staffId)
      .order("sort_order")
      .order("created_at", { ascending: false }),
    supabase
      .from("reviews")
      .select("*")
      .eq("staff_id", staffId)
      .eq("is_published", true)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <Link
          href={`/${slug}#staff`}
          className="inline-flex items-center gap-1.5 text-sm text-espresso/60 hover:text-espresso"
        >
          <ArrowLeft className="size-4" /> {business.name}
        </Link>

        <div className="mt-6 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-20">
              <AvatarImage src={member.avatar_url ?? undefined} />
              <AvatarFallback className="text-2xl">{member.name.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-heading text-3xl text-espresso">{member.name}</h1>
              {member.title && <p className="text-espresso/60">{member.title}</p>}
            </div>
          </div>
          <Button size="lg" className="h-12 px-7" asChild>
            <Link href={`/${slug}/book?staff=${member.id}`}>
              Записаться <ArrowRight />
            </Link>
          </Button>
        </div>

        {member.bio && <p className="mt-6 max-w-2xl text-espresso/70">{member.bio}</p>}

        {!!portfolio?.length && (
          <div className="mt-12">
            <h2 className="mb-5 font-heading text-2xl text-espresso">Портфолио</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {portfolio.map((item) => (
                <div key={item.id} className="overflow-hidden rounded-3xl">
                  <div className="relative aspect-[4/5] w-full bg-muted">
                    <Image
                      src={item.image_url}
                      alt={item.caption ?? member.name}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 33vw, 50vw"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!!reviews?.length && (
          <div className="mt-12">
            <h2 className="mb-5 font-heading text-2xl text-espresso">Отзывы</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review) => (
                <Card key={review.id} className="p-2">
                  <CardContent className="px-5 py-4">
                    <div className="mb-2 flex items-center gap-0.5 text-soft-blush">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-3.5" fill={i < review.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                    {review.comment && <p className="text-sm text-espresso/70">{review.comment}</p>}
                    <p className="mt-3 text-sm font-medium text-espresso">{review.client_name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12">
          <h2 className="mb-5 font-heading text-2xl text-espresso">Оставить отзыв</h2>
          <ReviewForm slug={slug} staffId={member.id} />
        </div>
      </div>
    </div>
  );
}
