import { getProductBySlug, getRelatedProducts } from "@/server/services/catalog";
import { ProductDetailClient } from "@/components/store/ProductDetailClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found — Astrox" };
  }

  return {
    title: `${product.nameEn} — Astrox Luxury Bangladesh`,
    description: product.descriptionEn.slice(0, 160),
    openGraph: {
      title: product.nameEn,
      description: product.descriptionEn.slice(0, 160),
      images: [{ url: product.images[0]?.url || "/brand/astrox-mark.svg" }],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.categoryId, product.id, 4);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nameEn,
    image: product.images.map((img: any) => img.url),
    description: product.descriptionEn,
    sku: product.code,
    brand: {
      "@type": "Brand",
      name: "Astrox",
    },
    offers: {
      "@type": "Offer",
      url: `https://astrox.com/p/${product.slug}`,
      priceCurrency: "BDT",
      price: (product.basePrice / 100).toFixed(2),
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Astrox",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.ratingAvg,
      reviewCount: Math.max(1, product.ratingCount),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}
