import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { getCourierAdapter } from "@/server/adapters/couriers";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, providerName } = body;

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true, shipment: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.shipment) {
      return NextResponse.json({
        success: true,
        alreadyBooked: true,
        consignmentId: order.shipment.consignmentId,
        trackingUrl: order.shipment.trackingUrl,
        message: `Consignment is already booked with ${order.shipment.provider}`,
      });
    }

    const adapter = getCourierAdapter(providerName || order.courierProvider);

    // Calculate COD amount to collect
    const amountToCollectPaisa =
      order.paymentMethod === PaymentMethod.COD && order.paymentStatus !== PaymentStatus.PAID
        ? order.total
        : 0;

    const itemSummary = order.items.map((i) => `${i.titleEn} (x${i.qty})`).join(", ");

    const booking = await adapter.book({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      district: order.district,
      area: order.area,
      street: order.street,
      amountToCollectPaisa,
      itemSummary,
    });

    // Save shipment record and update order
    const updated = await db.$transaction(async (tx) => {
      const shipment = await tx.shipment.create({
        data: {
          orderId: order.id,
          provider: adapter.id,
          consignmentId: booking.consignmentId,
          trackingUrl: booking.trackingUrl,
          status: "BOOKED",
          fee: booking.feePaisa,
        },
      });

      const ord = await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.SHIPPED,
          courierProvider: adapter.id,
          trackingCode: booking.trackingCode,
        },
      });

      await tx.orderEvent.create({
        data: {
          orderId: order.id,
          status: OrderStatus.SHIPPED,
          titleEn: `Dispatched via ${adapter.name}`,
          titleBn: `${adapter.name}-এর মাধ্যমে পাঠানো হয়েছে`,
          note: `Consignment ID: ${booking.consignmentId}. Tracking Code: ${booking.trackingCode}`,
          actorName: "Astrox Studio Dispatcher",
        },
      });

      return { shipment, order: ord };
    });

    return NextResponse.json({
      success: true,
      consignmentId: booking.consignmentId,
      trackingCode: booking.trackingCode,
      trackingUrl: booking.trackingUrl,
      labelUrl: booking.labelUrl,
      carrierName: adapter.name,
      message: `Consignment successfully registered with ${adapter.name}!`,
    });
  } catch (err: any) {
    console.error("Courier Booking Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to book courier consignment" },
      { status: 500 }
    );
  }
}
