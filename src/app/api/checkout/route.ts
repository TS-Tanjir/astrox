import { NextResponse } from "next/server";
import { createOrder } from "@/server/services/order";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const order = await createOrder(body);
    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
      total: order.total,
    });
  } catch (err: any) {
    console.error("Checkout API Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to place order." },
      { status: 400 }
    );
  }
}
