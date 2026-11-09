"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, Film, ShoppingBag, Truck } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

export function MobileDock({
  onOpenCategories,
}: {
  onOpenCategories?: () => void;
} = {}) {
  const pathname = usePathname();
  const { openCart, items } = useCartStore();
  const { locale } = useLocaleStore();

  const totalCount = items.reduce((acc, i) => acc + i.qty, 0);

  // Hide mobile dock in studio admin
  if (pathname.startsWith("/studio")) return null;

  const handleCategoriesClick = () => {
    if (onOpenCategories) {
      onOpenCategories();
    } else {
      const el = document.getElementById("department-grid");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = "/#department-grid";
      }
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0E]/95 backdrop-blur-xl border-t border-white/10 px-4 py-2 sm:hidden pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-around">
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-medium transition ${
            pathname === "/" ? "text-[#d9bc82]" : "text-stone-400 hover:text-white"
          }`}
        >
          <Home className="w-5 h-5" />
          <span>{locale === "bn" ? "হোম" : "Home"}</span>
        </Link>

        <button
          onClick={handleCategoriesClick}
          className="flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-medium text-stone-400 hover:text-white transition"
        >
          <Grid className="w-5 h-5" />
          <span>{locale === "bn" ? "বিভাগ" : "Categories"}</span>
        </button>

        <Link
          href="/reels"
          className={`relative flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-medium transition ${
            pathname.startsWith("/reels") ? "text-[#d9bc82]" : "text-stone-400 hover:text-white"
          }`}
        >
          <div className="relative">
            <Film className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <span>{locale === "bn" ? "রিলস" : "Reels"}</span>
        </Link>

        <button
          onClick={openCart}
          className="relative flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-medium text-stone-400 hover:text-white transition"
        >
          <ShoppingBag className="w-5 h-5 text-[#d9bc82]" />
          <span>{locale === "bn" ? "ব্যাগ" : "Bag"}</span>
          {totalCount > 0 && (
            <span className="absolute top-0 right-2 w-4 h-4 text-[9px] font-bold rounded-full bg-gold-gradient text-black flex items-center justify-center">
              {totalCount}
            </span>
          )}
        </button>

        <Link
          href="/track"
          className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-medium transition ${
            pathname.startsWith("/track") ? "text-[#d9bc82]" : "text-stone-400 hover:text-white"
          }`}
        >
          <Truck className="w-5 h-5" />
          <span>{locale === "bn" ? "ট্র্যাক" : "Track"}</span>
        </Link>
      </div>
    </nav>
  );
}
