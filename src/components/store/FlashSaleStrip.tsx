"use client";

import { useState, useEffect } from "react";
import { Zap, Clock, ArrowRight } from "lucide-react";
import { ProductCard, ProductCardData } from "./ProductCard";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

export function FlashSaleStrip({ products }: { products: ProductCardData[] }) {
  const { locale } = useLocaleStore();
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 35, seconds: 48 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!products || products.length === 0) return null;

  return (
    <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#15151E] via-[#0D0D12] to-[#07070A] border border-[#d9bc82]/25 shadow-2xl space-y-6">
        {/* Banner Header with Timer */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/70 text-rose-300 border border-rose-800/40 text-[11px] font-bold tracking-wider uppercase">
              <Zap className="w-3.5 h-3.5 fill-current text-rose-400" />
              <span>{locale === "bn" ? "সীমিত সময়ের বিশেষ অফার" : "Flash Privilege Drop"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {locale === "bn" ? "অ্যাস্ট্রক্স আর্লি প্রিভিউ সেল" : "Timed Privilege Releases"}
            </h2>
          </div>

          {/* Clock Countdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 font-medium flex items-center gap-1.5 mr-2">
              <Clock className="w-4 h-4 text-[#d9bc82]" />
              <span>{locale === "bn" ? "বাকি সময়:" : "Ends in:"}</span>
            </span>

            <div className="flex items-center gap-1.5 font-mono text-center">
              <div className="px-2.5 py-1.5 rounded-lg bg-stone-900 border border-white/10">
                <span className="text-sm font-bold text-[#d9bc82]">{String(timeLeft.hours).padStart(2, "0")}</span>
                <span className="block text-[8px] text-stone-500 uppercase">hrs</span>
              </div>
              <span className="text-stone-500 font-bold">:</span>
              <div className="px-2.5 py-1.5 rounded-lg bg-stone-900 border border-white/10">
                <span className="text-sm font-bold text-[#d9bc82]">{String(timeLeft.minutes).padStart(2, "0")}</span>
                <span className="block text-[8px] text-stone-500 uppercase">min</span>
              </div>
              <span className="text-stone-500 font-bold">:</span>
              <div className="px-2.5 py-1.5 rounded-lg bg-stone-900 border border-white/10">
                <span className="text-sm font-bold text-[#d9bc82]">{String(timeLeft.seconds).padStart(2, "0")}</span>
                <span className="block text-[8px] text-stone-500 uppercase">sec</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
