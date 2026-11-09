import { db } from "@/server/db";
import { ProductCard } from "@/components/store/ProductCard";
import Link from "next/link";
import { ChevronRight, Filter, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";

export const revalidate = 60;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; minPrice?: string; maxPrice?: string; inStock?: string }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { sort, minPrice, maxPrice, inStock } = await searchParams;

  // 1. Locate Category (Level 1, Level 2, or Level 3)
  const category = await db.category.findUnique({
    where: { slug },
    include: {
      parent: {
        include: {
          parent: true,
        },
      },
      children: {
        include: {
          children: true,
        },
      },
    },
  });

  if (!category) {
    notFound();
  }

  // 2. Collect all descendant category IDs so department queries include subcategories
  const allCategoryIds = [category.id];
  if (category.children && category.children.length > 0) {
    for (const child of category.children) {
      allCategoryIds.push(child.id);
      if (child.children && child.children.length > 0) {
        for (const sub of child.children) {
          allCategoryIds.push(sub.id);
        }
      }
    }
  }

  // 3. Query Products with filters
  const whereClause: any = {
    categoryId: { in: allCategoryIds },
    status: "ACTIVE",
  };

  if (minPrice || maxPrice) {
    whereClause.basePrice = {};
    if (minPrice) whereClause.basePrice.gte = parseInt(minPrice) * 100;
    if (maxPrice) whereClause.basePrice.lte = parseInt(maxPrice) * 100;
  }

  let orderBy: any = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { basePrice: "asc" };
  if (sort === "price-desc") orderBy = { basePrice: "desc" };
  if (sort === "rating") orderBy = { ratingAvg: "desc" };

  const products = await db.product.findMany({
    where: whereClause,
    orderBy,
    include: {
      images: { orderBy: { position: "asc" } },
      variants: true,
      category: true,
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-stone-400">
        <Link href="/" className="hover:text-white transition">
          Home
        </Link>
        {category.parent?.parent && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
            <Link href={`/c/${category.parent.parent.slug}`} className="hover:text-white transition">
              {category.parent.parent.nameEn}
            </Link>
          </>
        )}
        {category.parent && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
            <Link href={`/c/${category.parent.slug}`} className="hover:text-white transition">
              {category.parent.nameEn}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
        <span className="text-[#d9bc82] font-medium">{category.nameEn}</span>
      </nav>

      {/* 2. Category Title & Subcategory Pills */}
      <div className="space-y-4 border-b border-white/5 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              {category.nameEn}
            </h1>
            <p className="text-sm text-stone-400 mt-1 max-w-xl">
              {category.descriptionEn || `Explore handpicked luxury curations in ${category.nameEn}. Fast delivery across Bangladesh.`}
            </p>
          </div>
          <div className="text-xs text-stone-400 font-mono">
            Showing <span className="text-white font-bold">{products.length}</span> signature products
          </div>
        </div>

        {/* Child Category Pills */}
        {category.children && category.children.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {category.children.map((sub) => (
              <Link
                key={sub.id}
                href={`/c/${sub.slug}`}
                className="px-3.5 py-1.5 rounded-full bg-stone-900 border border-white/10 hover:border-[#d9bc82] text-xs text-stone-300 hover:text-white transition"
              >
                {sub.nameEn}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 3. Products Grid with Fast Sort Links */}
      <div className="space-y-6">
        {/* Sort Bar */}
        <div className="flex items-center justify-between py-2 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#d9bc82]" />
            <span>Sort by:</span>
            <div className="flex gap-2">
              <Link
                href={`/c/${category.slug}`}
                className={`px-2.5 py-1 rounded-md transition ${
                  !sort ? "bg-[#d9bc82]/20 text-[#d9bc82] font-semibold" : "hover:text-white"
                }`}
              >
                Newest
              </Link>
              <Link
                href={`/c/${category.slug}?sort=price-asc`}
                className={`px-2.5 py-1 rounded-md transition ${
                  sort === "price-asc" ? "bg-[#d9bc82]/20 text-[#d9bc82] font-semibold" : "hover:text-white"
                }`}
              >
                Price: Low to High
              </Link>
              <Link
                href={`/c/${category.slug}?sort=price-desc`}
                className={`px-2.5 py-1 rounded-md transition ${
                  sort === "price-desc" ? "bg-[#d9bc82]/20 text-[#d9bc82] font-semibold" : "hover:text-white"
                }`}
              >
                Price: High to Low
              </Link>
              <Link
                href={`/c/${category.slug}?sort=rating`}
                className={`px-2.5 py-1 rounded-md transition ${
                  sort === "rating" ? "bg-[#d9bc82]/20 text-[#d9bc82] font-semibold" : "hover:text-white"
                }`}
              >
                Highest Rated
              </Link>
            </div>
          </div>
        </div>

        {/* Grid */}
        {products.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Sparkles className="w-10 h-10 text-[#d9bc82]/40 mx-auto" />
            <h3 className="text-lg font-semibold text-white">No products found in this category</h3>
            <p className="text-xs text-stone-400">
              New archival releases will be dropped soon. Check back shortly!
            </p>
            <Link
              href="/"
              className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-xs font-semibold text-[#d9bc82] hover:border-[#d9bc82] transition"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
