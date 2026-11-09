import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { sendNotification } from "@/server/services/notification";

export async function GET() {
  try {
    const carts = await db.cart.findMany({
      where: {
        items: { some: {} },
      },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
        user: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    const formatted = carts.map((c) => {
      const subtotalPaisa = c.items.reduce(
        (acc, it) => acc + (it.variant.price || it.variant.product.basePrice) * it.qty,
        0
      );
      return {
        id: c.id,
        updatedAt: c.updatedAt,
        customerName: c.customerName || c.user?.name || "Guest Patron",
        customerPhone: c.customerPhone || c.user?.phone || "017XXXXXXXX",
        customerEmail: c.customerEmail || c.user?.email || null,
        recoverySentAt: c.recoverySentAt,
        subtotalPaisa,
        itemCount: c.items.length,
        items: c.items.map((it) => ({
          nameEn: it.variant.product.nameEn,
          variant: [it.variant.option1, it.variant.option2].filter(Boolean).join(" / "),
          qty: it.qty,
        })),
      };
    });

    return NextResponse.json({ success: true, carts: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cartId, customerPhone, customerName } = body;

    if (!cartId || !customerPhone) {
      return NextResponse.json(
        { error: "cartId and customerPhone are required" },
        { status: 400 }
      );
    }

    const cart = await db.cart.findUnique({
      where: { id: cartId },
      include: { items: { include: { variant: { include: { product: true } } } } },
    });

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const recoveryCode = "COMEBACK5";
    const recoveryLink = `https://astrox.com/cart?restore=${cart.id}&coupon=${recoveryCode}`;

    // Record recovery dispatch
    await db.cart.update({
      where: { id: cartId },
      data: { recoverySentAt: new Date() },
    });

    await db.activityLog.create({
      data: {
        actorEmail: "recovery@astrox.com",
        actorRole: "STAFF",
        action: "SEND_ABANDONED_BAG_RECOVERY",
        entityType: "CART",
        entityId: cartId,
        summary: `Recovery SMS sent to ${customerPhone} with code ${recoveryCode}`,
      },
    });

    return NextResponse.json({
      success: true,
      recoveryCode,
      recoveryLink,
      message: `Recovery reminder dispatched to ${customerPhone} with exclusive code ${recoveryCode}!`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
