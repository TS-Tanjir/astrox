"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Heart,
  ShoppingBag,
  Volume2,
  VolumeX,
  Share2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Music2,
  Check,
} from "lucide-react";
import { formatMoney } from "@/lib/money";
import { useCartStore } from "@/lib/store/useCartStore";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import toast from "react-hot-toast";

export interface ReelData {
  id: string;
  title: string;
  titleBn: string;
  atelier: string;
  audioTrack: string;
  videoPoster: string;
  videoUrl?: string;
  likesCount: number;
  product: {
    id: string;
    code: string;
    slug: string;
    nameEn: string;
    nameBn: string;
    basePrice: number;
    comparePrice?: number;
    imageUrl: string;
    variantId: string;
    variantLabel: string;
    stock: number;
  };
}

export const REELS_ARCHIVE: ReelData[] = [
  {
    id: "reel-01",
    title: "The 300-Count Muslin Fluidity Test",
    titleBn: "৩০০ কাউন্ট ঢাকাই মসলিনের রাজকীয় উইভিং",
    atelier: "@AstroxSonargaonAtelier",
    audioTrack: "Astrox Sitar & Minimal Ambient — Gold Edition",
    videoPoster: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1080&auto=format&fit=crop&q=85",
    likesCount: 1420,
    product: {
      id: "prod-01",
      code: "AX-000101",
      slug: "dhakai-jamdani-golden-muslin-saree",
      nameEn: "Imperial Dhakai Jamdani Muslin Saree",
      nameBn: "ঢাকাই জামদানি গোল্ডেন মসলিন শাড়ি",
      basePrice: 1850000,
      comparePrice: 2200000,
      imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400",
      variantId: "AX-SAR-01-GLD",
      variantLabel: "Champagne Gold / Free Size",
      stock: 8,
    },
  },
  {
    id: "reel-02",
    title: "Obsidian Gold Jacquard: Metallic Gilt Reflections",
    titleBn: "অবসিডিয়ান গোল্ড জ্যাকার্ড পাঞ্জাবি লাইভ রানওয়ে",
    atelier: "@AstroxHommeCouture",
    audioTrack: "Midnight in Gulshan — Astrox Lounge Mix",
    videoPoster: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=1080&auto=format&fit=crop&q=85",
    likesCount: 2850,
    product: {
      id: "prod-02",
      code: "AX-000201",
      slug: "jacquard-silk-kabli-panjabi-midnight-gold",
      nameEn: "Obsidian & Gold Jacquard Festive Panjabi",
      nameBn: "অবসিডিয়ান গোল্ড জ্যাকার্ড রয়্যাল পাঞ্জাবি",
      basePrice: 695000,
      comparePrice: 799000,
      imageUrl: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=400",
      variantId: "AX-PAN-01-BLK-40",
      variantLabel: "Obsidian Black / 40 (M)",
      stock: 22,
    },
  },
  {
    id: "reel-03",
    title: "48dB Hybrid ANC Drivers in Acoustic Chamber",
    titleBn: "অ্যাস্ট্রক্স নোভা প্রো নয়েজ ক্যান্সেলেশন টেস্ট",
    atelier: "@AstroxAcousticLabs",
    audioTrack: "Sub-Bass Resonance 20Hz — Acoustic Demo",
    videoPoster: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1080&auto=format&fit=crop&q=85",
    likesCount: 3940,
    product: {
      id: "prod-03",
      code: "AX-000301",
      slug: "astrox-nova-pro-anc-wireless-earbuds",
      nameEn: "Astrox Nova Pro ANC Wireless Earbuds",
      nameBn: "অ্যাস্ট্রক্স নোভা প্রো অ্যাক্টিভ নয়েজ ক্যান্সেলিং বাডস",
      basePrice: 720000,
      comparePrice: 850000,
      imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400",
      variantId: "AX-EAR-01-MBL",
      variantLabel: "Matte Obsidian / 1 Year Official",
      stock: 25,
    },
  },
  {
    id: "reel-04",
    title: "96% Snail Mucin Essence: Barrier Hydration Swatch",
    titleBn: "অথেনটিক কোরিয়ান গ্লাস-স্কিন সিরাম সোয়াচ",
    atelier: "@SeoulAlchemyByAstrox",
    audioTrack: "Seoul Rain — Lo-Fi Chill Beats",
    videoPoster: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1080&auto=format&fit=crop&q=85",
    likesCount: 5120,
    product: {
      id: "prod-04",
      code: "AX-000401",
      slug: "cosrx-advanced-snail-96-mucin-essence",
      nameEn: "Astrox Pure Glow Snail & Peptide Ampoule",
      nameBn: "অ্যাস্ট্রক্স পিওর গ্লো স্নেল ও পেপটাইড অ্যাম্পুল",
      basePrice: 215000,
      comparePrice: 260000,
      imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400",
      variantId: "AX-KBE-01-100ML",
      variantLabel: "100ml Full Size",
      stock: 45,
    },
  },
];

export function ReelsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [likedReels, setLikedReels] = useState<Record<string, boolean>>({});
  const [addingToBag, setAddingToBag] = useState(false);

  const { addItem } = useCartStore();
  const { locale } = useLocaleStore();

  if (!isOpen) return null;

  const reel = REELS_ARCHIVE[currentIdx];
  const isLiked = likedReels[reel.id];

  const handleNext = () => setCurrentIdx((prev) => (prev + 1) % REELS_ARCHIVE.length);
  const handlePrev = () => setCurrentIdx((prev) => (prev - 1 + REELS_ARCHIVE.length) % REELS_ARCHIVE.length);

  const toggleLike = () => {
    setLikedReels((prev) => ({ ...prev, [reel.id]: !prev[reel.id] }));
    if (!isLiked) {
      toast("✨ Added to your Astral Favorites", { icon: "💛" });
    }
  };

  const handleQuickAdd = () => {
    setAddingToBag(true);
    addItem({
      variantId: reel.product.variantId,
      productId: reel.product.id,
      productSlug: reel.product.slug,
      nameEn: reel.product.nameEn,
      nameBn: reel.product.nameBn,
      variantLabel: reel.product.variantLabel,
      unitPricePaisa: reel.product.basePrice,
      imageUrl: reel.product.imageUrl,
      maxStock: reel.product.stock,
    });
    toast.success(locale === "bn" ? "ব্যাগে যোগ করা হয়েছে!" : "Added piece to your bag!");
    setTimeout(() => setAddingToBag(false), 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-50 p-2.5 rounded-full bg-stone-900/80 border border-white/10 text-stone-300 hover:text-white hover:bg-stone-800 transition"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Main 9:16 Vertical Reel Player Container */}
      <div className="relative w-full max-w-[420px] h-[85vh] max-h-[780px] rounded-3xl overflow-hidden bg-black border border-[#d9bc82]/30 shadow-2xl flex flex-col justify-between">
        {/* Background Visual Stream */}
        <div className="absolute inset-0 z-0">
          <Image
            src={reel.videoPoster}
            alt={reel.title}
            fill
            priority
            className="object-cover scale-105 animate-in zoom-in-95 duration-7000"
          />
          {/* Subtle gradient overlays for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
        </div>

        {/* Top Header Bar inside Reel */}
        <div className="relative z-10 p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase bg-black/60 text-[#d9bc82] border border-[#d9bc82]/30">
              ASTROX RUNWAY LIVE
            </span>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white hover:text-[#d9bc82] transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Right Action Icons (Like, Share, Prev, Next) */}
        <div className="absolute right-4 bottom-32 z-20 flex flex-col items-center gap-4">
          {/* Like */}
          <button
            onClick={toggleLike}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="p-3 rounded-full bg-black/60 backdrop-blur-md border border-white/10 group-hover:scale-110 transition">
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isLiked ? "fill-rose-500 text-rose-500" : "text-white"
                }`}
              />
            </div>
            <span className="text-[10px] font-mono text-white font-semibold">
              {reel.likesCount + (isLiked ? 1 : 0)}
            </span>
          </button>

          {/* Share */}
          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.origin + `/p/${reel.product.slug}`);
                toast.success("Reel link copied!");
              }
            }}
            className="p-3 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white hover:text-[#d9bc82] transition"
          >
            <Share2 className="w-5 h-5" />
          </button>

          {/* Prev Reel */}
          <button
            onClick={handlePrev}
            className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-stone-300 hover:text-white transition"
            title="Previous Reel"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          {/* Next Reel */}
          <button
            onClick={handleNext}
            className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-stone-300 hover:text-white transition"
            title="Next Reel"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Content: Atelier info & Shoppable Product Card */}
        <div className="relative z-10 p-5 space-y-3">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-[#d9bc82] flex items-center gap-1.5">
              <span>{reel.atelier}</span>
              <Sparkles className="w-3 h-3" />
            </div>
            <h3 className="text-sm font-bold text-white leading-snug">
              {locale === "bn" ? reel.titleBn : reel.title}
            </h3>
            <div className="flex items-center gap-1.5 text-[10px] text-stone-300">
              <Music2 className="w-3 h-3 text-[#d9bc82]" />
              <span className="truncate">{reel.audioTrack}</span>
            </div>
          </div>

          {/* Shoppable Product Card Attached to this Reel */}
          <div className="p-3 rounded-2xl bg-[#0D0D12]/95 backdrop-blur-xl border border-[#d9bc82]/40 shadow-2xl flex items-center justify-between gap-3">
            <Link
              href={`/p/${reel.product.slug}`}
              onClick={onClose}
              className="flex items-center gap-3 min-w-0 flex-1 group"
            >
              <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-stone-950 border border-white/10">
                <Image src={reel.product.imageUrl} alt="" fill className="object-cover group-hover:scale-105 transition" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate group-hover:text-[#d9bc82] transition">
                  {locale === "bn" ? reel.product.nameBn : reel.product.nameEn}
                </div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xs font-bold font-mono text-[#d9bc82]">
                    {formatMoney(reel.product.basePrice, locale)}
                  </span>
                  {reel.product.comparePrice && (
                    <span className="text-[10px] text-stone-500 line-through font-mono">
                      {formatMoney(reel.product.comparePrice, locale)}
                    </span>
                  )}
                </div>
              </div>
            </Link>

            <button
              onClick={handleQuickAdd}
              disabled={addingToBag}
              className="px-3.5 py-2.5 rounded-xl bg-gold-gradient text-black font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5 shadow-lg shadow-[#d9bc82]/20 hover:opacity-95 active:scale-95 transition shrink-0"
            >
              {addingToBag ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Buy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
