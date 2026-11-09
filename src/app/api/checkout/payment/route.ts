import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { getPaymentAdapter } from "@/server/adapters/payments";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderNumber, provider, pinOrOtp, rawPayload } = body;

    if (!orderNumber || !provider) {
      return NextResponse.json(
        { error: "orderNumber and provider are required" },
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
      return NextResponse.json({
        success: true,
        orderNumber: order.orderNumber,
        status: "ALREADY_PAID",
        message: "This order is already marked as paid.",
      });
    }

    const adapter = getPaymentAdapter(provider as PaymentMethod);
    const confirmResult = await adapter.confirm({
      orderNumber,
      providerRef: order.orderNumber,
      pinOrOtp,
      rawPayload: {
        ...rawPayload,
        amountPaisa: order.total,
        customerPhone: order.customerPhone,
      },
    });

    if (confirmResult.status !== "PAID") {
      return NextResponse.json(
        {
          success: false,
          status: confirmResult.status,
          error: confirmResult.message || "Payment authentication failed.",
        },
        { status: 400 }
      );
    }

    // Atomic transaction: Record payment, update order status, append timeline event
    await db.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          orderId: order.id,
          method: provider as PaymentMethod,
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
          titleEn: `Payment Verified (${provider})`,
          titleBn: `পেমেন্ট সম্পন্ন হয়েছে (${provider})`,
          note: confirmResult.message,
          actorName: `${provider} Gateway Integration`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      status: "PAID",
      providerRef: confirmResult.providerRef,
      message: confirmResult.message,
    });
  } catch (err: any) {
    console.error("Payment Confirmation API Error:", err);
    return NextResponse.json(
      { error: err.message || "Payment processing failed" },
      { status: 500 }
    );
  }
}
