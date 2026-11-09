import { NextResponse } from "next/server";
import { db } from "@/server/db";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { reviewId, isApproved } = body;

    if (!reviewId || typeof isApproved !== "boolean") {
      return NextResponse.json({ error: "reviewId and isApproved required" }, { status: 400 });
    }

    const review = await db.review.update({
      where: { id: reviewId },
      data: { isApproved },
    });

    return NextResponse.json({ success: true, review });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get("reviewId");

    if (!reviewId) {
      return NextResponse.json({ error: "reviewId required" }, { status: 400 });
    }

    await db.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
