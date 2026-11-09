import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { getPaymentAdapter } from "@/server/adapters/payments";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const providerUpper = provider.toUpperCase() as PaymentMethod;
    const body = await request.json();

    const orderNumber = body.orderNumber || body.order_id || body.tran_id;
    if (!orderNumber) {
      return NextResponse.json(
        { error: "Missing order reference in webhook payload" },
        { status: 400 }
      );
    }

    const order = await db.order.findUnique({
      where: { orderNumber },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      return NextResponse.json({ received: true, note: "Already processed" });
    }

    const adapter = getPaymentAdapter(providerUpper);
    const confirmResult = await adapter.confirm({
      orderNumber,
      providerRef: body.trxId || body.val_id || orderNumber,
      rawPayload: body,
    });

    if (confirmResult.status === "PAID") {
      await db.$transaction(async (tx) => {
        await tx.payment.create({
          data: {
            orderId: order.id,
            method: providerUpper,
            providerRef: confirmResult.providerRef,
            amount: order.total,
            status: PaymentStatus.PAID,
            rawPayload: confirmResult.rawPayload,
          },
        });

        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: PaymentStatus.PAID,
            status: OrderStatus.CONFIRMED,
          },
        });

        await tx.orderEvent.create({
          data: {
            orderId: order.id,
            status: OrderStatus.CONFIRMED,
            titleEn: `Payment Verified via ${providerUpper} Webhook`,
            titleBn: `${providerUpper} ওয়েবহুক দ্বারা পেমেন্ট নিশ্চিত`,
            note: confirmResult.message,
            actorName: `${providerUpper} Async Webhook`,
          },
        });
      });
    }

    return NextResponse.json({ received: true, status: confirmResult.status });
  } catch (err: any) {
    console.error("Payment Webhook Error:", err);
    return NextResponse.json(
      { error: err.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}
