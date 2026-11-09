import { NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idsStr = searchParams.get("ids") || "";
  const ids = idsStr.split(",").filter(Boolean);

  if (ids.length === 0) {
    return NextResponse.json({ products: [] });
  }

  try {
    const products = await db.product.findMany({
      where: { id: { in: ids }, status: "ACTIVE" },
      include: {
        images: { orderBy: { position: "asc" } },
        variants: true,
        category: true,
      },
    });
    return NextResponse.json({ products });
  } catch (err: any) {
    console.error("Wishlist API Error:", err);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}
