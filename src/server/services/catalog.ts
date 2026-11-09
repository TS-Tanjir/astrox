import { db } from "../db";
import { ProductStatus } from "@prisma/client";

export async function getDepartmentsWithTree() {
  try {
    return await db.category.findMany({
      where: { depth: 1, isVisible: true },
      orderBy: { position: "asc" },
      include: {
        children: {
          where: { isVisible: true },
          orderBy: { position: "asc" },
          include: {
            children: {
              where: { isVisible: true },
              orderBy: { position: "asc" },
            },
          },
        },
      },
    });
  } catch (err) {
    console.warn("Could not load departments:", err);
    return [];
  }
}

export async function getActiveBanners() {
  try {
    return await db.banner.findMany({
      where: { isActive: true },
      orderBy: { position: "asc" },
    });
  } catch (err) {
    console.warn("Could not load active banners:", err);
    return [];
  }
}

export async function getFeaturedProducts(limit = 8) {
  try {
    return await db.product.findMany({
      where: { status: ProductStatus.ACTIVE, isFeatured: true },
      take: limit,
      include: {
        images: { orderBy: { position: "asc" } },
        variants: true,
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.warn("Could not load featured products:", err);
    return [];
  }
}

export async function getFlashDeals(limit = 6) {
  try {
    return await db.product.findMany({
      where: { status: ProductStatus.ACTIVE, isFlashDeal: true },
      take: limit,
      include: {
        images: { orderBy: { position: "asc" } },
        variants: true,
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.warn("Could not load flash deals:", err);
    return [];
  }
}

export async function getFeaturedCollections() {
  try {
    return await db.collection.findMany({
      where: { isFeatured: true },
      include: {
        products: {
          take: 4,
          include: {
            product: {
              include: {
                images: { orderBy: { position: "asc" }, take: 1 },
                variants: true,
              },
            },
          },
        },
      },
    });
  } catch (err) {
    console.warn("Could not load featured collections:", err);
    return [];
  }
}

export async function getProductBySlug(slug: string) {
  return await db.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { price: "asc" } },
      category: {
        include: {
          parent: {
            include: {
              parent: true,
            },
          },
        },
      },
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getRelatedProducts(categoryId: string, excludeId: string, limit = 4) {
  return await db.product.findMany({
    where: {
      categoryId,
      id: { not: excludeId },
      status: ProductStatus.ACTIVE,
    },
    take: limit,
    include: {
      images: { orderBy: { position: "asc" } },
      variants: true,
      category: true,
    },
  });
}

export async function searchProductsAndCategories(query: string) {
  if (!query || query.trim().length === 0) return { products: [], categories: [] };
  const clean = query.trim();

  try {
    const [products, categories] = await Promise.all([
      db.product.findMany({
        where: {
          status: ProductStatus.ACTIVE,
          OR: [
            { nameEn: { contains: clean, mode: "insensitive" } },
            { nameBn: { contains: clean } },
            { code: { contains: clean, mode: "insensitive" } },
            { tags: { has: clean.toLowerCase() } },
          ],
        },
        take: 6,
        include: {
          images: { orderBy: { position: "asc" }, take: 1 },
          variants: true,
          category: true,
        },
      }),
      db.category.findMany({
        where: {
          isVisible: true,
          OR: [
            { nameEn: { contains: clean, mode: "insensitive" } },
            { nameBn: { contains: clean } },
          ],
        },
        take: 4,
        include: {
          parent: true,
        },
      }),
    ]);

    return { products, categories };
  } catch (err) {
    console.warn("Search query failed:", err);
    return { products: [], categories: [] };
  }
}
