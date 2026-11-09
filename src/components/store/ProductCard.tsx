"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Star, Check } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { useCartStore } from "@/lib/store/useCartStore";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import toast from "react-hot-toast";

export interface ProductCardData {
  id: string;
  code: string;
  slug: string;
  nameEn: string;
  nameBn: string;
  subtitleEn?: string | null;
  subtitleBn?: string | null;
  basePrice: number;
  compareAtPrice?: number | null;
  badge?: string | null;
  ratingAvg: number;
  ratingCount: number;
  images: { url: string; colorKey?: string | null }[];
  variants: {
    id: string;
    sku: string;
    option1?: string | null;
    option2?: string | null;
    swatchHex?: string | null;
    price?: number | null;
    stock: number;
  }[];
  category?: { nameEn: string; nameBn: string; slug: string };
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isQuickAdding, setIsQuickAdding] = useState(false);

  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const { locale } = useLocaleStore();

  const isFavorited = isInWishlist(product.id);
  const primaryImage = product.images[0]?.url || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800";
  const hoverImage = product.images[1]?.url || primaryImage;

  const currentVariant = product.variants[selectedVariantIdx] || product.variants[0];
  const price = currentVariant?.price || product.basePrice;
  const comparePrice = product.compareAtPrice;

  const discountPercent =
    comparePrice && comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentVariant || currentVariant.stock <= 0) {
      toast.error(locale === "bn" ? "এই সাইজ বা রংটি বর্তমানে স্টকে নেই" : "Variant is currently out of stock");
      return;
    }

    setIsQuickAdding(true);
    addItem(
      {
        variantId: currentVariant.id,
        productId: product.id,
        productSlug: product.slug,
        nameEn: product.nameEn,
        nameBn: product.nameBn,
        variantLabel: [currentVariant.option1, currentVariant.option2].filter(Boolean).join(" / ") || "Standard",
        unitPricePaisa: price,
        imageUrl: primaryImage,
        maxStock: currentVariant.stock,
      },
      1
    );

    toast.success(
      locale === "bn" ? `ব্যাগে যোগ করা হয়েছে: ${product.nameBn}` : `Added to bag: ${product.nameEn}`
    );

    setTimeout(() => setIsQuickAdding(false), 500);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col bg-[#0D0D12] rounded-2xl border border-white/5 hover:border-[#d9bc82]/40 transition-all duration-300 shadow-md hover:shadow-2xl overflow-hidden"
    >
      {/* 1. Image Container with Arch Mask & Badges */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-950">
        <Link href={`/p/${product.slug}`} className="block w-full h-full">
          <Image
            src={isHovered ? hoverImage : primaryImage}
            alt={product.nameEn}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.badge && (
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-black/75 backdrop-blur-md text-[#d9bc82] border border-[#d9bc82]/30 shadow-sm">
              {product.badge}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-tight bg-rose-950/80 backdrop-blur-md text-rose-300 border border-rose-800/40">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
            toast(
              isFavorited
                ? locale === "bn" ? "পছন্দের তালিকা থেকে সরানো হয়েছে" : "Removed from wishlist"
                : locale === "bn" ? "পছন্দের তালিকায় সংরক্ষিত" : "Saved to wishlist",
              { icon: isFavorited ? "💔" : "✨" }
            );
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 hover:border-[#d9bc82] text-white transition z-10"
          aria-label="Wishlist"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorited ? "fill-rose-500 text-rose-500" : "text-stone-300 hover:text-white"
            }`}
          />
        </button>

        {/* Quick Add Overlay on Hover (Desktop) */}
        <div className="absolute bottom-3 left-3 right-3 hidden sm:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-10">
          <button
            onClick={handleQuickAdd}
            disabled={isQuickAdding || (currentVariant && currentVariant.stock <= 0)}
            className="w-full py-2.5 px-4 rounded-xl bg-gold-gradient text-black font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl hover:opacity-95 active:scale-95 transition disabled:opacity-50"
          >
            {isQuickAdding ? (
              <>
                <Check className="w-4 h-4" />
                <span>{locale === "bn" ? "যোগ হয়েছে" : "Added"}</span>
              </>
            ) : currentVariant && currentVariant.stock <= 0 ? (
              <span>{locale === "bn" ? "স্টক শেষ" : "Sold Out"}</span>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>{locale === "bn" ? "ব্যাগে যোগ করুন" : "Quick Add"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
            <span className="truncate uppercase tracking-wider text-[10px] text-stone-500 font-medium">
              {locale === "bn" ? product.category?.nameBn : product.category?.nameEn}
            </span>
            <div className="flex items-center gap-1 shrink-0 text-[#d9bc82]">
              <Star className="w-3 h-3 fill-current" />
              <span className="text-[11px] font-mono font-medium text-stone-300">
                {product.ratingAvg.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Title */}
          <Link href={`/p/${product.slug}`} className="block group-hover:text-[#d9bc82] transition-colors">
            <h3 className="text-sm font-semibold text-white line-clamp-1">
              {locale === "bn" ? product.nameBn : product.nameEn}
            </h3>
            {product.subtitleEn && (
              <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">
                {locale === "bn" ? product.subtitleBn : product.subtitleEn}
              </p>
            )}
          </Link>
        </div>

        {/* Color Swatches if multi-color */}
        {product.variants.some((v) => v.swatchHex) && (
          <div className="flex items-center gap-1.5 pt-1">
            {product.variants
              .filter((v, i, self) => i === self.findIndex((t) => t.swatchHex === v.swatchHex))
              .slice(0, 4)
              .map((variant, idx) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariantIdx(idx)}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    selectedVariantIdx === idx
                      ? "ring-2 ring-[#d9bc82] scale-110 border-transparent"
                      : "border-white/20 hover:scale-105"
                  }`}
                  style={{ backgroundColor: variant.swatchHex || "#666" }}
                  title={variant.option1 || ""}
                />
              ))}
            {product.variants.length > 4 && (
              <span className="text-[10px] text-stone-500 font-mono">+{product.variants.length - 4}</span>
            )}
          </div>
        )}

        {/* Pricing & Mobile Quick Add */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-[#d9bc82] font-mono">
              {formatMoney(price, locale)}
            </span>
            {comparePrice && comparePrice > price && (
              <span className="text-xs text-stone-500 line-through font-mono">
                {formatMoney(comparePrice, locale)}
              </span>
            )}
          </div>

          {/* Mobile Quick Add Button */}
          <button
            onClick={handleQuickAdd}
            disabled={isQuickAdding || (currentVariant && currentVariant.stock <= 0)}
            className="sm:hidden p-2 rounded-lg bg-[#181922] border border-white/10 hover:border-[#d9bc82] text-[#d9bc82] transition"
            aria-label="Quick Add"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
