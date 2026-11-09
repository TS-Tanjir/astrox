import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { getCourierAdapter } from "@/server/adapters/couriers";
import { OrderStatus } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const body = await request.json();

    const adapter = getCourierAdapter(provider);
    const update = await adapter.parseWebhook(body);

    if (!update.consignmentId) {
      return NextResponse.json({ error: "Missing consignmentId in payload" }, { status: 400 });
    }

    // Find shipment
    const shipment = await db.shipment.findFirst({
      where: { consignmentId: update.consignmentId },
      include: { order: true },
    });

    if (!shipment) {
      return NextResponse.json(
        { received: true, note: `No shipment found for consignment ${update.consignmentId}` },
        { status: 200 }
      );
    }

    // Atomic update
    await db.$transaction(async (tx) => {
      await tx.shipment.update({
        where: { id: shipment.id },
        data: {
          status: update.status,
          deliveredAt: update.status === OrderStatus.DELIVERED ? new Date() : undefined,
        },
      });

      await tx.order.update({
        where: { id: shipment.orderId },
        data: { status: update.status },
      });

      await tx.orderEvent.create({
        data: {
          orderId: shipment.orderId,
          status: update.status,
          titleEn: `Consignment Update: ${update.status}`,
          titleBn: `কুরিয়ার আপডেট: ${update.status}`,
          note: `${update.statusNote} (${update.location || "Transit Hub"})`,
          actorName: `${adapter.name} Automated Webhook`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      consignmentId: update.consignmentId,
      newStatus: update.status,
    });
  } catch (err: any) {
    console.error("Courier Webhook Processing Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to parse courier webhook" },
      { status: 500 }
    );
  }
}
