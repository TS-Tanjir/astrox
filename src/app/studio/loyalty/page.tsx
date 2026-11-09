import { db } from "@/server/db";
import { LoyaltyClient } from "@/components/studio/LoyaltyClient";

export const revalidate = 0;

export default async function StudioLoyaltyPage() {
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      loyaltyPoints: true,
      loyaltyTier: true,
      referralCode: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
    orderBy: { loyaltyPoints: "desc" },
    take: 50,
  });

  const tierBreakdown = {
    NOVA: users.filter((u) => u.loyaltyTier === "NOVA").length,
    STELLAR: users.filter((u) => u.loyaltyTier === "STELLAR").length,
    GALAXY: users.filter((u) => u.loyaltyTier === "GALAXY").length,
  };

  const totalStarsCirculating = users.reduce((acc, u) => acc + u.loyaltyPoints, 0);

  return (
    <LoyaltyClient
      initialUsers={users}
      tierBreakdown={tierBreakdown}
      totalStarsCirculating={totalStarsCirculating}
    />
  );
}
