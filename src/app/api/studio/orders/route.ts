import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { OrderStatus } from "@prisma/client";

export async function PATCH(request: Request) {
  try {
    const { orderId, status } = await request.json();
    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing orderId or status" }, { status: 400 });
    }

    const updated = await db.order.update({
      where: { id: orderId },
      data: {
        status: status as OrderStatus,
        events: {
          create: {
            status: status as OrderStatus,
            titleEn: `Order Status Updated to ${status}`,
            titleBn: `অর্ডার স্ট্যাটাস পরিবর্তিত হয়েছে: ${status}`,
            actorName: "Astrox Studio Logistics",
          },
        },
      },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    console.error("Studio Order PATCH error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
