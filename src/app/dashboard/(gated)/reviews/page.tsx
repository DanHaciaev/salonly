import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReviewPublishedSwitch, DeleteReviewButton } from "./review-row-controls";

export default async function ReviewsPage() {
  const business = await getCurrentBusiness();
  const supabase = await createClient();

  const [{ data: reviews }, { data: staff }] = await Promise.all([
    supabase
      .from("reviews")
      .select("*")
      .eq("business_id", business!.id)
      .order("created_at", { ascending: false }),
    supabase.from("staff").select("id, name").eq("business_id", business!.id),
  ]);

  const staffNameById = new Map((staff ?? []).map((s) => [s.id, s.name]));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl text-espresso">Отзывы</h1>
        <p className="mt-1 text-sm text-espresso/60">
          Опубликованные отзывы видны на странице салона
        </p>
      </div>

      {!reviews?.length ? (
        <Card className="p-10 text-center">
          <CardContent className="px-0">
            <p className="text-espresso/60">Пока нет отзывов</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((review) => (
            <Card key={review.id} className="p-2">
              <CardContent className="flex items-start justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-espresso">{review.client_name}</p>
                    <div className="flex items-center gap-0.5 text-soft-blush">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="size-3.5"
                          fill={i < review.rating ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                    {review.staff_id && staffNameById.has(review.staff_id) && (
                      <Badge variant="secondary">{staffNameById.get(review.staff_id)}</Badge>
                    )}
                  </div>
                  {review.comment && (
                    <p className="mt-1.5 text-sm text-espresso/70">{review.comment}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <ReviewPublishedSwitch id={review.id} isPublished={review.is_published} />
                  <DeleteReviewButton id={review.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
