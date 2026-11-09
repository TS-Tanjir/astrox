import { NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET() {
  try {
    const orders = await db.order.findMany({
      include: {
        items: true,
        shipment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const rows: string[] = [
      [
        "OrderNumber",
        "Date",
        "CustomerName",
        "CustomerPhone",
        "District",
        "SubtotalBDT",
        "DiscountBDT",
        "ShippingFeeBDT",
        "TotalBDT",
        "PaymentMethod",
        "PaymentStatus",
        "OrderStatus",
        "CourierCarrier",
        "TrackingCode",
        "IsGift",
      ].join(","),
    ];

    const escapeCsv = (str: string | null | undefined) =>
      `"${(str || "").replace(/"/g, '""')}"`;

    for (const ord of orders) {
      rows.push(
        [
          ord.orderNumber,
          ord.createdAt.toISOString().slice(0, 10),
          escapeCsv(ord.customerName),
          ord.customerPhone,
          escapeCsv(ord.district),
          (ord.subtotal / 100).toFixed(2),
          (ord.discount / 100).toFixed(2),
          (ord.shippingFee / 100).toFixed(2),
          (ord.total / 100).toFixed(2),
          ord.paymentMethod,
          ord.paymentStatus,
          ord.status,
          ord.courierProvider,
          ord.trackingCode || "",
          ord.isGift ? "YES" : "NO",
        ].join(",")
      );
    }

    const csvContent = rows.join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="astrox-orders-${Date.now()}.csv"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
