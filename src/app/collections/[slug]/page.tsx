import { db } from "@/server/db";
import { ProductCard } from "@/components/store/ProductCard";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Sparkles, ChevronRight } from "lucide-react";

export const revalidate = 60;

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = await db.collection.findUnique({
    where: { slug },
    include: {
      products: {
        include: {
          product: {
            include: {
              images: { orderBy: { position: "asc" } },
              variants: true,
              category: true,
            },
          },
        },
      },
    },
  });

  if (!collection) {
    notFound();
  }

  // Also query any products tagged with collection slug or featured if collection has few items
  const directProducts = collection.products.map((cp) => cp.product);
  let allProducts = directProducts;
  if (allProducts.length < 4) {
    const fallbackProducts = await db.product.findMany({
      where: { status: "ACTIVE", id: { notIn: directProducts.map((p) => p.id) } },
      take: 8 - allProducts.length,
      include: {
        images: { orderBy: { position: "asc" } },
        variants: true,
        category: true,
      },
    });
    allProducts = [...allProducts, ...fallbackProducts];
  }

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Full-bleed Collection Hero */}
      <div className="relative h-[360px] md:h-[440px] w-full overflow-hidden bg-stone-950 border-b border-white/10">
        <Image
          src={collection.heroUrl || "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=1600"}
          alt={collection.titleEn}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070A] via-[#07070A]/60 to-black/30" />

        <div className="relative z-10 max-w-7xl mx-auto h-full px-6 md:px-12 flex flex-col justify-end pb-12 space-y-3">
          {collection.badgeEn && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#d9bc82]/40 text-[#d9bc82] text-[11px] font-bold tracking-widest uppercase w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{collection.badgeEn}</span>
            </div>
          )}
          <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
            {collection.titleEn}
          </h1>
          {collection.subtitleEn && (
            <p className="text-sm md:text-base text-stone-300 max-w-xl font-light">
              {collection.subtitleEn}
            </p>
          )}
        </div>
      </div>

      {/* 2. Collection Product Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/5 text-xs text-stone-400">
          <nav className="flex items-center gap-1.5">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
            <span className="text-[#d9bc82]">{collection.titleEn}</span>
          </nav>
          <span className="font-mono text-stone-400">Showing {allProducts.length} pieces</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {allProducts.map((p) => (
            <ProductCard key={p.id} product={p as any} />
          ))}
        </div>
      </div>
    </div>
  );
}
