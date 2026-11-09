import { NextResponse } from "next/server";
import { searchProductsAndCategories } from "@/server/services/catalog";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  try {
    const results = await searchProductsAndCategories(q);
    return NextResponse.json(results);
  } catch (err) {
    console.error("Search API Error:", err);
    return NextResponse.json({ products: [], categories: [] }, { status: 500 });
  }
}
