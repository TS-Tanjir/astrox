import { db } from "@/server/db";
import { AbandonedClient } from "@/components/studio/AbandonedClient";

export const revalidate = 0;

export default async function StudioAbandonedPage() {
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
      customerPhone: c.customerPhone || c.user?.phone || "01711223344",
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

  return <AbandonedClient initialCarts={formatted} />;
}
