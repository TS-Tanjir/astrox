import { NextResponse } from "next/server";
import { db } from "@/server/db";

export async function POST(request: Request) {
  try {
    const { nameEn, nameBn, code, categoryId, basePrice, stock, imageUrl } = await request.json();

    const slug = nameEn
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-") + `-${Date.now().toString().slice(-4)}`;

    const product = await db.product.create({
      data: {
        code,
        slug,
        nameEn,
        nameBn,
        descriptionEn: `${nameEn}. Tailored with artisanal excellence for Astrox Bangladesh.`,
        descriptionBn: `${nameBn || nameEn}। ঐতিহ্য ও আধুনিকতার মেলবন্ধন।`,
        categoryId,
        basePrice,
        brand: "Astrox",
        optionNames: ["Size"],
        variants: {
          create: [
            {
              sku: `${code}-STD`,
              option1: "Standard",
              price: basePrice,
              stock: stock || 10,
            },
          ],
        },
        images: {
          create: [
            {
              url: imageUrl || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000",
              position: 0,
            },
          ],
        },
      },
      include: {
        images: true,
        variants: true,
        category: true,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    console.error("Product creation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
