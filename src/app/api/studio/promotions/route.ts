import { NextResponse } from "next/server";
import { db } from "@/server/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      code,
      titleEn,
      discountType,
      discountValue,
      minSubtotal,
      maxDiscount,
      usageLimit,
    } = body;

    if (!code || !titleEn || discountValue === undefined) {
      return NextResponse.json(
        { error: "Code, title, and discount value are required" },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    const existing = await db.coupon.findUnique({
      where: { code: cleanCode },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Coupon code "${cleanCode}" already exists` },
        { status: 400 }
      );
    }

    const coupon = await db.coupon.create({
      data: {
        code: cleanCode,
        titleEn: titleEn.trim(),
        titleBn: titleEn.trim(),
        discountType: discountType || "PERCENT",
        discountValue: parseInt(discountValue) || 10,
        minSubtotal: parseInt(minSubtotal) || 0,
        maxDiscount: maxDiscount ? parseInt(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (err: any) {
    console.error("Coupon creation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, isActive } = body;

    if (!id || typeof isActive !== "boolean") {
      return NextResponse.json({ error: "id and isActive required" }, { status: 400 });
    }

    const coupon = await db.coupon.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    await db.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
