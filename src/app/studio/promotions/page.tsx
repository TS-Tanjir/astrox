import { db } from "@/server/db";
import { PromotionsClient } from "@/components/studio/PromotionsClient";

export const revalidate = 0;

export default async function StudioPromotionsPage() {
  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <PromotionsClient initialCoupons={coupons} />;
}
