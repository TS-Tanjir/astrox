import { db } from "../db";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { calculateCartPricing } from "./pricing";

export interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  division: string;
  district: string;
  area: string;
  street: string;
  notes?: string;
  isGift?: boolean;
  giftMessage?: string;
  hideInvoicePrice?: boolean;
  paymentMethod: PaymentMethod;
  couponCode?: string | null;
  idempotencyKey?: string;
  items: {
    variantId: string;
    qty: number;
  }[];
}

export async function createOrder(input: CreateOrderInput) {
  if (!input.items || input.items.length === 0) {
    throw new Error("Cannot place an order with an empty bag.");
  }

  // 1. Check idempotency if provided
  if (input.idempotencyKey) {
    const existing = await db.order.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
      include: { items: true, events: true },
    });
    if (existing) return existing;
  }

  // 2. Fetch variants and verify stock
  const variantIds = input.items.map((i) => i.variantId);
  const variants = await db.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: {
      product: {
        include: {
          images: { take: 1, orderBy: { position: "asc" } },
        },
      },
    },
  });

  if (variants.length !== input.items.length) {
    throw new Error("One or more selected products are unavailable.");
  }

  // Build pricing lines
  const pricingLines = input.items.map((item) => {
    const v = variants.find((x) => x.id === item.variantId)!;
    if (v.stock < item.qty) {
      throw new Error(`Item "${v.product.nameEn}" (${v.option1 || ""} ${v.option2 || ""}) has only ${v.stock} left in stock.`);
    }
    const unitPrice = v.price || v.product.basePrice;
    return {
      variantId: v.id,
      qty: item.qty,
      unitPricePaisa: unitPrice,
    };
  });

  // Calculate pricing
  const pricing = await calculateCartPricing({
    lines: pricingLines,
    district: input.district,
    couponCode: input.couponCode,
  });

  // Generate unique order number (e.g. AX-2026-7842)
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `AX-2026-${randomSuffix}`;

  // Execute in Prisma Transaction
  const order = await db.$transaction(async (tx) => {
    // Decrement variant stocks
    for (const item of input.items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: {
          stock: { decrement: item.qty },
        },
      });
    }

    // Create Order Record
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        idempotencyKey: input.idempotencyKey,
        customerName: input.customerName.trim(),
        customerPhone: input.customerPhone.trim(),
        customerEmail: input.customerEmail?.trim() || null,
        division: input.division,
        district: input.district,
        area: input.area,
        street: input.street,
        notes: input.notes,
        isGift: input.isGift || false,
        giftMessage: input.giftMessage,
        hideInvoicePrice: input.hideInvoicePrice || false,
        subtotal: pricing.subtotal,
        discount: pricing.discount,
        shippingFee: pricing.shippingFee,
        total: pricing.total,
        couponCode: pricing.appliedCoupon?.code || null,
        paymentMethod: input.paymentMethod,
        paymentStatus: input.paymentMethod === PaymentMethod.COD ? PaymentStatus.PENDING : PaymentStatus.PENDING,
        status: OrderStatus.PLACED,
        items: {
          create: input.items.map((item) => {
            const v = variants.find((x) => x.id === item.variantId)!;
            const unitPrice = v.price || v.product.basePrice;
            const imgUrl = v.product.images[0]?.url || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400";
            return {
              productId: v.product.id,
              variantId: v.id,
              productCode: v.product.code,
              productSlug: v.product.slug,
              titleEn: v.product.nameEn,
              titleBn: v.product.nameBn,
              variantLabel: [v.option1, v.option2].filter(Boolean).join(" / ") || "Standard",
              sku: v.sku,
              imageUrl: imgUrl,
              unitPrice,
              qty: item.qty,
              lineTotal: unitPrice * item.qty,
            };
          }),
        },
        events: {
          create: {
            status: OrderStatus.PLACED,
            titleEn: "Order Placed Successfully",
            titleBn: "অর্ডার সফলভাবে সম্পন্ন হয়েছে",
            note: `Payment method: ${input.paymentMethod}. Destination: ${input.district}`,
            actorName: "Customer Checkout",
          },
        },
      },
      include: {
        items: true,
        events: true,
      },
    });

    // If coupon was used, increment usage counter
    if (pricing.appliedCoupon) {
      await tx.coupon.update({
        where: { code: pricing.appliedCoupon.code },
        data: { usedCount: { increment: 1 } },
      });
    }

    return newOrder;
  });

  return order;
}

export async function getOrderByTracking(orderNumber: string, phone: string) {
  const cleanNo = orderNumber.trim().toUpperCase();
  const cleanPhone = phone.trim();

  return await db.order.findFirst({
    where: {
      orderNumber: cleanNo,
      customerPhone: cleanPhone,
    },
    include: {
      items: true,
      events: {
        orderBy: { createdAt: "desc" },
      },
      shipment: true,
    },
  });
}
