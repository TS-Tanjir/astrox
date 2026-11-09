import { NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET() {
  try {
    const products = await db.product.findMany({
      include: {
        category: true,
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const rows: string[] = [
      ["ProductCode", "Slug", "NameEn", "Category", "Brand", "SKU", "Option1", "Option2", "PriceBDT", "Stock", "Status"].join(","),
    ];

    for (const p of products) {
      for (const v of p.variants) {
        const priceBdt = ((v.price || p.basePrice) / 100).toFixed(2);
        const escapeCsv = (str: string | null | undefined) =>
          `"${(str || "").replace(/"/g, '""')}"`;

        rows.push(
          [
            p.code,
            p.slug,
            escapeCsv(p.nameEn),
            escapeCsv(p.category.nameEn),
            p.brand,
            v.sku,
            escapeCsv(v.option1),
            escapeCsv(v.option2),
            priceBdt,
            v.stock,
            p.status,
          ].join(",")
        );
      }
    }

    const csvContent = rows.join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="astrox-products-${Date.now()}.csv"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
