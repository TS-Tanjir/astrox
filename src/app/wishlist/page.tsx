"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { ProductCard, ProductCardData } from "@/components/store/ProductCard";

export default function WishlistPage() {
  const { items } = useWishlistStore();
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWishlist() {
      if (items.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/wishlist?ids=${items.join(",")}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error("Failed to load wishlist items:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchWishlist();
  }, [items]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#d9bc82]">
            Client Archive
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            Saved Astrox Pieces
          </h1>
        </div>
        <div className="text-xs text-stone-400 font-mono">
          <span className="text-white font-bold">{items.length}</span> items saved
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-stone-400 text-xs">
          <div className="w-6 h-6 border-2 border-[#d9bc82] border-t-transparent rounded-full animate-spin" />
          <span>Retrieving saved pieces...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-stone-900 border border-white/5 flex items-center justify-center mx-auto text-stone-500">
            <Heart className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-semibold text-white">Your Wishlist is Empty</h2>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Click the heart icon on any signature garment, smartwatch, or K-beauty drop to save it for later.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-gold-gradient text-black font-semibold text-xs tracking-wider uppercase"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
