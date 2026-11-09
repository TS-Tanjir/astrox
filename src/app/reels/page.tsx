"use client";

import { useState } from "react";
import { REELS_ARCHIVE, ReelsModal } from "@/components/store/ReelsModal";
import Image from "next/image";
import Link from "next/link";
import { Play, Sparkles, Heart, ShoppingBag, Music2 } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

export default function ReelsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { locale } = useLocaleStore();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/60 text-rose-300 border border-rose-800/40 text-[10px] font-bold tracking-widest uppercase mb-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>ASTROX RUNWAY & REELS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Shoppable Fashion Runway
          </h1>
          <p className="text-xs text-stone-400 mt-1 max-w-lg">
            Experience high-definition runway motions, fabric fluidity, and acoustic driver teardowns. Click any reel to watch full-screen and buy instantly.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-6 py-3 rounded-xl bg-gold-gradient text-black font-semibold text-xs tracking-wider uppercase flex items-center gap-2 shadow-xl shadow-[#d9bc82]/15 hover:opacity-95 transition"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Launch Fullscreen Player</span>
        </button>
      </div>

      {/* Reels Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
        {REELS_ARCHIVE.map((r, idx) => (
          <div
            key={r.id}
            onClick={() => setModalOpen(true)}
            className="group relative aspect-[9/16] rounded-3xl overflow-hidden bg-stone-950 border border-white/10 hover:border-[#d9bc82]/50 shadow-xl cursor-pointer transition-all duration-300"
          >
            <Image
              src={r.videoPoster}
              alt={r.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />

            {/* Play Button Icon on Hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-[#d9bc82] flex items-center justify-center text-[#d9bc82] shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                <Play className="w-6 h-6 fill-current ml-1" />
              </div>
            </div>

            {/* Top Tag */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-center text-[10px] text-white">
              <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 font-mono">
                {r.atelier}
              </span>
              <span className="flex items-center gap-1 font-mono text-stone-300">
                <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                <span>{r.likesCount}</span>
              </span>
            </div>

            {/* Bottom Meta */}
            <div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-black/75 backdrop-blur-md border border-white/10 space-y-1.5">
              <h3 className="text-xs font-semibold text-white line-clamp-1 group-hover:text-[#d9bc82] transition">
                {locale === "bn" ? r.titleBn : r.title}
              </h3>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono font-bold text-[#d9bc82]">
                  {formatMoney(r.product.basePrice, locale)}
                </span>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider">Tap to view</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ReelsModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
