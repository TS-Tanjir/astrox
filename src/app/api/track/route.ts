import { NextResponse } from "next/server";
import { getOrderByTracking } from "@/server/services/order";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get("orderNumber") || "";
  const phone = searchParams.get("phone") || "";

  try {
    const order = await getOrderByTracking(orderNumber, phone);
    if (!order) {
      return NextResponse.json({ order: null }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (err: any) {
    console.error("Tracking API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
