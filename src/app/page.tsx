import {
  getActiveBanners,
  getDepartmentsWithTree,
  getFeaturedProducts,
  getFlashDeals,
} from "@/server/services/catalog";
import { OrbitHero } from "@/components/store/OrbitHero";
import { DepartmentStrip } from "@/components/store/DepartmentStrip";
import { FlashSaleStrip } from "@/components/store/FlashSaleStrip";
import { ProductCard } from "@/components/store/ProductCard";
import { Astral3DHero } from "@/components/store/Astral3DHero";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, ShieldCheck, Truck, RotateCcw, Award } from "lucide-react";

export const revalidate = 60; // ISR cache revalidation every minute

export default async function HomePage() {
  const [banners, departments, featuredProducts, flashDeals] = await Promise.all([
    getActiveBanners(),
    getDepartmentsWithTree(),
    getFeaturedProducts(8),
    getFlashDeals(4),
  ]);

  return (
    <div className="space-y-4">
      {/* 1. Orbit Hero Carousel */}
      <OrbitHero banners={banners as any} />

      {/* 2. 10 Signature Departments Strip */}
      <DepartmentStrip departments={departments as any} />

      {/* 3. Timed Flash Privilege Drop */}
      {flashDeals.length > 0 && <FlashSaleStrip products={flashDeals as any} />}

      {/* 4. Astral Featured New Arrivals */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#d9bc82] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Astral Curations</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              New Releases & Bestsellers
            </h2>
          </div>
          <Link
            href="/c/women"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#d9bc82] hover:text-[#fde047] transition group"
          >
            <span>Explore All Releases</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p as any} />
          ))}
        </div>
      </section>

      {/* 5. The Astrox Edit & 3D WebGL Hallmark Crest */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl bg-gradient-to-r from-[#0C0E14] via-[#131520] to-[#0A0A0E] border border-[#d9bc82]/30 p-8 md:p-12 shadow-2xl">
          <div className="lg:col-span-7 space-y-4">
            <span className="px-3 py-1 rounded-full bg-[#d9bc82]/15 text-[#d9bc82] border border-[#d9bc82]/30 text-[10px] font-bold tracking-widest uppercase">
              ARTISANAL ARCHIVE & 3D CREST
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
              Bengali Sovereignty, Crafted for the Modern World.
            </h2>
            <p className="text-xs md:text-sm text-stone-300 font-light leading-relaxed">
              Every garment in the Astrox reserve is woven in Sonargaon and Dhaka using pure indigenous count 300 combed cotton and zari thread. Designed to outlast fast-fashion cycles with enduring dignity and effortless presence.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/c/women-ethnic"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-gradient text-black font-semibold text-xs tracking-wider uppercase shadow-xl hover:opacity-95 transition"
              >
                <span>Read The Archive Story</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="text-xs font-mono text-stone-400">
                Four-Point Star · Metallic Gold Specular
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <Astral3DHero />
          </div>
        </div>
      </section>

      {/* 6. Curated Category Showcase (K-Beauty & Tech Audio) */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* K-Beauty Sanctuary */}
        <div className="relative rounded-3xl overflow-hidden border border-white/10 aspect-[16/9] group">
          <Image
            src="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=1000&auto=format&fit=crop&q=80"
            alt="Authentic K-Beauty"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 md:p-8 flex flex-col justify-end space-y-2">
            <span className="text-[10px] font-bold text-[#d9bc82] tracking-widest uppercase">
              100% VERIFIED AUTHENTIC
            </span>
            <h3 className="text-2xl font-bold text-white">Seoul Glow: K-Beauty Sanctuary</h3>
            <p className="text-xs text-stone-300 max-w-sm">
              Air-freighted essences, snail filtrate ampoules & SPF 50+ sunscreens direct from South Korea.
            </p>
            <div>
              <Link
                href="/c/beauty-fragrance"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#d9bc82] hover:text-white transition"
              >
                <span>Shop K-Beauty →</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Precision Audio & ANC */}
        <div className="relative rounded-3xl overflow-hidden border border-white/10 aspect-[16/9] group">
          <Image
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80"
            alt="Precision Audio"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 md:p-8 flex flex-col justify-end space-y-2">
            <span className="text-[10px] font-bold text-[#d9bc82] tracking-widest uppercase">
              OFFICIAL 1-YEAR WARRANTY
            </span>
            <h3 className="text-2xl font-bold text-white">Precision Acoustics & ANC</h3>
            <p className="text-xs text-stone-300 max-w-sm">
              Dual coaxial titanium drivers with 48dB hybrid active noise cancellation.
            </p>
            <div>
              <Link
                href="/c/audio-electronics"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#d9bc82] hover:text-white transition"
              >
                <span>Explore Audio Tech →</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
