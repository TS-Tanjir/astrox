"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

export interface BannerItem {
  id: string;
  titleEn: string;
  titleBn: string;
  subtitleEn: string;
  subtitleBn: string;
  tagEn: string;
  tagBn: string;
  ctaLabelEn: string;
  ctaLabelBn: string;
  ctaType: string;
  ctaTarget: string;
  desktopUrl: string;
  mobileUrl?: string | null;
}

export function OrbitHero({ banners }: { banners: BannerItem[] }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const { locale } = useLocaleStore();

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % banners.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (!banners || banners.length === 0) return null;

  const current = banners[currentIdx];

  const getCtaLink = (item: BannerItem) => {
    if (item.ctaType === "COLLECTION") return `/collections/${item.ctaTarget}`;
    if (item.ctaType === "CATEGORY") return `/c/${item.ctaTarget}`;
    if (item.ctaType === "PRODUCT") return `/p/${item.ctaTarget}`;
    return item.ctaTarget.startsWith("http") ? item.ctaTarget : `/${item.ctaTarget}`;
  };

  return (
    <section className="relative w-full h-[520px] md:h-[660px] overflow-hidden bg-[#07070A]">
      {/* Background Slides */}
      {banners.map((b, idx) => (
        <div
          key={b.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIdx ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <Image
            src={b.desktopUrl}
            alt={b.titleEn}
            fill
            priority={idx === 0}
            className="object-cover scale-105 animate-in zoom-in-95 duration-10000 object-center"
          />
          {/* Subtle Starfield & Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#07070A] via-[#07070A]/60 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07070A] via-[#07070A]/50 to-transparent" />
        </div>
      ))}

      {/* Hero Foreground Content */}
      <div className="relative z-20 max-w-7xl mx-auto h-full px-6 md:px-12 flex flex-col justify-end pb-16 md:pb-24">
        <div className="max-w-2xl space-y-4">
          {/* Tag Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#d9bc82]/40 text-[#d9bc82] text-xs font-semibold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 animate-astral" />
            <span>{locale === "bn" ? current.tagBn : current.tagEn}</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.15]">
            <span className="text-gold-gradient">{locale === "bn" ? current.titleBn : current.titleEn}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm md:text-base text-stone-300 font-light max-w-xl leading-relaxed">
            {locale === "bn" ? current.subtitleBn : current.subtitleEn}
          </p>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              href={getCtaLink(current)}
              className="px-7 py-3.5 rounded-xl bg-gold-gradient text-black font-semibold text-xs md:text-sm tracking-wider uppercase flex items-center gap-2 shadow-2xl shadow-[#d9bc82]/20 hover:scale-105 active:scale-95 transition-all"
            >
              <span>{locale === "bn" ? current.ctaLabelBn : current.ctaLabelEn}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/c/women"
              className="px-6 py-3.5 rounded-xl bg-stone-900/80 backdrop-blur-md border border-white/10 hover:border-[#d9bc82]/50 text-white font-medium text-xs md:text-sm transition hover:bg-stone-800"
            >
              {locale === "bn" ? "সকল বিভাগ ব্রাউজ করুন" : "Browse All Departments"}
            </Link>
          </div>
        </div>
      </div>

      {/* Slide Navigation Dots & Arrows */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 right-6 md:right-12 z-20 flex items-center gap-3">
          <button
            onClick={() => setCurrentIdx((prev) => (prev - 1 + banners.length) % banners.length)}
            className="p-2.5 rounded-full bg-stone-900/80 backdrop-blur-md border border-white/10 hover:border-[#d9bc82] text-white transition"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIdx ? "w-6 bg-[#d9bc82]" : "w-1.5 bg-stone-700"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrentIdx((prev) => (prev + 1) % banners.length)}
            className="p-2.5 rounded-full bg-stone-900/80 backdrop-blur-md border border-white/10 hover:border-[#d9bc82] text-white transition"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
}
