import { db } from "../db";

export type LoyaltyTier = "NOVA" | "STELLAR" | "GALAXY";

export interface TierBenefits {
  tier: LoyaltyTier;
  labelEn: string;
  labelBn: string;
  multiplier: number; // Stars per ৳100
  freePackaging: boolean;
  dedicatedConcierge: boolean;
  minPoints: number;
}

export const TIER_CONFIG: Record<LoyaltyTier, TierBenefits> = {
  NOVA: {
    tier: "NOVA",
    labelEn: "Nova Patron",
    labelBn: "নোভা গ্রাহক",
    multiplier: 1.0,
    freePackaging: false,
    dedicatedConcierge: false,
    minPoints: 0,
  },
  STELLAR: {
    tier: "STELLAR",
    labelEn: "Stellar Aristocrat",
    labelBn: "স্টেলার অভিজাত",
    multiplier: 1.5,
    freePackaging: false,
    dedicatedConcierge: true,
    minPoints: 1000,
  },
  GALAXY: {
    tier: "GALAXY",
    labelEn: "Galaxy Sovereign",
    labelBn: "গ্যালাক্সি সার্বভৌম",
    multiplier: 2.0,
    freePackaging: true,
    dedicatedConcierge: true,
    minPoints: 5000,
  },
};

export function getTierFromPoints(points: number): LoyaltyTier {
  if (points >= 5000) return "GALAXY";
  if (points >= 1000) return "STELLAR";
  return "NOVA";
}

export function calculateStarsEarned(totalPaisa: number, tier: LoyaltyTier = "NOVA"): number {
  const bdtSpent = Math.floor(totalPaisa / 100);
  const baseStars = Math.floor(bdtSpent / 100);
  const multiplier = TIER_CONFIG[tier]?.multiplier || 1.0;
  return Math.floor(baseStars * multiplier);
}

export function calculateStarsDiscountPaisa(starsToRedeem: number, maxSubtotalPaisa: number): number {
  // 1 Star = ৳1 discount (100 paisa)
  // Max redemption: up to 30% of order subtotal
  const maxAllowedPaisa = Math.floor(maxSubtotalPaisa * 0.3);
  const requestedPaisa = starsToRedeem * 100;
  return Math.min(requestedPaisa, maxAllowedPaisa);
}

export async function awardStarsForOrder(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  });

  if (!order || !order.userId || !order.user) return null;

  const currentTier = (order.user.loyaltyTier as LoyaltyTier) || "NOVA";
  const starsEarned = calculateStarsEarned(order.total, currentTier);

  if (starsEarned <= 0) return null;

  const newTotalPoints = order.user.loyaltyPoints + starsEarned;
  const newTier = getTierFromPoints(newTotalPoints);

  await db.user.update({
    where: { id: order.userId },
    data: {
      loyaltyPoints: newTotalPoints,
      loyaltyTier: newTier,
    },
  });

  return { starsEarned, newTotalPoints, newTier };
}
