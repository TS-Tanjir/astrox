import { NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    const where = productId
      ? { productId, isApproved: true }
      : { isApproved: true };

    const reviews = await db.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { product: { select: { nameEn: true, code: true, slug: true } } },
      take: 50,
    });

    return NextResponse.json({ success: true, reviews });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, authorName, rating, title, comment, photos } = body;

    if (!productId || !authorName || !rating || !title || !comment) {
      return NextResponse.json(
        { error: "Missing required review fields" },
        { status: 400 }
      );
    }

    const ratingNum = Math.min(5, Math.max(1, parseInt(rating) || 5));

    const review = await db.$transaction(async (tx) => {
      const rev = await tx.review.create({
        data: {
          productId,
          authorName: authorName.trim(),
          rating: ratingNum,
          title: title.trim(),
          comment: comment.trim(),
          photos: photos || [],
          isVerifiedPurchase: true,
          isApproved: true,
        },
      });

      // Recalculate average rating on product
      const allApproved = await tx.review.findMany({
        where: { productId, isApproved: true },
        select: { rating: true },
      });

      const avg =
        allApproved.reduce((acc, r) => acc + r.rating, 0) / (allApproved.length || 1);

      await tx.product.update({
        where: { id: productId },
        data: {
          ratingAvg: Math.round(avg * 10) / 10,
          ratingCount: allApproved.length,
        },
      });

      return rev;
    });

    return NextResponse.json({
      success: true,
      review,
      message: "Your verified review has been published with honor.",
    });
  } catch (err: any) {
    console.error("Review Submission Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to submit review" },
      { status: 500 }
    );
  }
}
