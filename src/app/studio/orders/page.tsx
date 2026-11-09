import { db } from "@/server/db";
import { OrdersClient } from "@/components/studio/OrdersClient";

export const revalidate = 0;

export default async function StudioOrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      events: { orderBy: { createdAt: "desc" } },
    },
  });

  return <OrdersClient initialOrders={orders} />;
}
