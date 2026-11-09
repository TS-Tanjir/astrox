import { db } from "@/server/db";
import { CatalogClient } from "@/components/studio/CatalogClient";

export const revalidate = 0;

export default async function StudioCatalogPage() {
  const [products, categories] = await Promise.all([
    db.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        images: { orderBy: { position: "asc" } },
        variants: true,
        category: true,
      },
    }),
    db.category.findMany({
      where: { depth: { in: [1, 2, 3] } },
      orderBy: { nameEn: "asc" },
    }),
  ]);

  return <CatalogClient initialProducts={products} categories={categories} />;
}
