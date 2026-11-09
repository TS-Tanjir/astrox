import { MetadataRoute } from "next";
import { db } from "@/server/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://astrox.com";

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/reels`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/track`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/wishlist`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  // Fetch all categories
  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const categories = await db.category.findMany({
      where: { isVisible: true },
      select: { slug: true, updatedAt: true },
    });
    categoryRoutes = categories.map((c) => ({
      url: `${baseUrl}/c/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (err) {
    console.warn("Could not load categories for sitemap:", err);
  }

  // Fetch all products
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await db.product.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
    });
    productRoutes = products.map((p) => ({
      url: `${baseUrl}/p/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "daily",
      priority: 0.85,
    }));
  } catch (err) {
    console.warn("Could not load products for sitemap:", err);
  }

  // Fetch all collections
  let collectionRoutes: MetadataRoute.Sitemap = [];
  try {
    const collections = await db.collection.findMany({
      select: { slug: true },
    });
    collectionRoutes = collections.map((col) => ({
      url: `${baseUrl}/collections/${col.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (err) {
    console.warn("Could not load collections for sitemap:", err);
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...collectionRoutes];
}
