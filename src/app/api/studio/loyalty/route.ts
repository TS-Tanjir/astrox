import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { getTierFromPoints } from "@/server/services/loyalty";

export async function GET() {
  try {
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

    return NextResponse.json({
      success: true,
      users,
      tierBreakdown,
      totalStarsCirculating,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, pointsDelta, reason } = body;

    if (!userId || pointsDelta === undefined) {
      return NextResponse.json({ error: "userId and pointsDelta required" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const newPoints = Math.max(0, user.loyaltyPoints + parseInt(pointsDelta));
    const newTier = getTierFromPoints(newPoints);

    const updated = await db.user.update({
      where: { id: userId },
      data: {
        loyaltyPoints: newPoints,
        loyaltyTier: newTier,
      },
    });

    await db.activityLog.create({
      data: {
        actorEmail: "admin@astrox.com",
        actorRole: "OWNER",
        action: "ADJUST_LOYALTY_POINTS",
        entityType: "USER",
        entityId: userId,
        summary: `Adjusted points by ${pointsDelta} for ${user.name}. Reason: ${reason || "Admin discretion"}`,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
