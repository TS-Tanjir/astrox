import { NextResponse } from "next/server";
import { db } from "@/server/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { csvData, dryRun = false } = body;

    if (!csvData || typeof csvData !== "string") {
      return NextResponse.json({ error: "csvData string is required" }, { status: 400 });
    }

    const lines = csvData
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      return NextResponse.json(
        { error: "CSV file must contain a header and at least one data row" },
        { status: 400 }
      );
    }

    const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim().toLowerCase());
    const skuIdx = headers.findIndex((h) => h.includes("sku"));
    const stockIdx = headers.findIndex((h) => h.includes("stock"));
    const priceIdx = headers.findIndex((h) => h.includes("price"));

    if (skuIdx === -1 || stockIdx === -1) {
      return NextResponse.json(
        { error: "CSV must have 'SKU' and 'Stock' columns" },
        { status: 400 }
      );
    }

    const updates: { sku: string; stock: number; pricePaisa?: number }[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(",").map((p) => p.replace(/"/g, "").trim());
      const sku = parts[skuIdx];
      const stock = parseInt(parts[stockIdx]);
      const priceBdt = priceIdx !== -1 ? parseFloat(parts[priceIdx]) : NaN;

      if (!sku) {
        errors.push(`Row ${i + 1}: Missing SKU`);
        continue;
      }
      if (isNaN(stock) || stock < 0) {
        errors.push(`Row ${i + 1} (${sku}): Invalid stock value "${parts[stockIdx]}"`);
        continue;
      }

      const item: { sku: string; stock: number; pricePaisa?: number } = { sku, stock };
      if (!isNaN(priceBdt) && priceBdt >= 0) {
        item.pricePaisa = Math.round(priceBdt * 100);
      }
      updates.push(item);
    }

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        rowsParsed: updates.length,
        errorsFound: errors.length,
        errors,
        preview: updates.slice(0, 5),
      });
    }

    // Apply updates
    let updatedCount = 0;
    for (const u of updates) {
      const variant = await db.productVariant.findUnique({
        where: { sku: u.sku },
      });
      if (variant) {
        await db.productVariant.update({
          where: { sku: u.sku },
          data: {
            stock: u.stock,
            price: u.pricePaisa !== undefined ? u.pricePaisa : variant.price,
          },
        });
        updatedCount++;
      } else {
        errors.push(`SKU not found in catalog: ${u.sku}`);
      }
    }

    return NextResponse.json({
      success: true,
      dryRun: false,
      updatedCount,
      errorsCount: errors.length,
      errors,
      message: `Successfully synchronized ${updatedCount} variants from CSV.`,
    });
  } catch (err: any) {
    console.error("CSV Import Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
