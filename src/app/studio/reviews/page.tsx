import { db } from "@/server/db";
import { ReviewsClient } from "@/components/studio/ReviewsClient";

export const revalidate = 0;

export default async function StudioReviewsPage() {
  const reviews = await db.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        select: {
          nameEn: true,
          code: true,
          slug: true,
        },
      },
    },
  });

  return <ReviewsClient initialReviews={reviews} />;
}
