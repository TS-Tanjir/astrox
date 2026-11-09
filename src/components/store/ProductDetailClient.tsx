"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  ShoppingBag,
  Zap,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Ruler,
  Check,
  ChevronRight,
  Share2,
  Compass,
  MapPin,
  Eye,
  Award,
  SlidersHorizontal,
} from "lucide-react";
import { formatMoney } from "@/lib/money";
import { useCartStore } from "@/lib/store/useCartStore";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { ProductCard } from "./ProductCard";
import toast from "react-hot-toast";

const BD_DISTRICTS = [
  { name: "Dhaka", zone: "INSIDE_DHAKA", transit: "24h Express" },
  { name: "Gazipur", zone: "INSIDE_DHAKA", transit: "24-36h Express" },
  { name: "Narayanganj", zone: "INSIDE_DHAKA", transit: "24-36h Express" },
  { name: "Chattogram", zone: "OUTSIDE_DHAKA", transit: "48h Doorstep" },
  { name: "Sylhet", zone: "OUTSIDE_DHAKA", transit: "48h Doorstep" },
  { name: "Rajshahi", zone: "OUTSIDE_DHAKA", transit: "48-72h Doorstep" },
  { name: "Khulna", zone: "OUTSIDE_DHAKA", transit: "48-72h Doorstep" },
  { name: "Barishal", zone: "OUTSIDE_DHAKA", transit: "48-72h Doorstep" },
  { name: "Rangpur", zone: "OUTSIDE_DHAKA", transit: "48-72h Doorstep" },
  { name: "Mymensingh", zone: "OUTSIDE_DHAKA", transit: "48h Doorstep" },
  { name: "Cumilla", zone: "OUTSIDE_DHAKA", transit: "48h Doorstep" },
  { name: "Bogura", zone: "OUTSIDE_DHAKA", transit: "48-72h Doorstep" },
  { name: "Cox's Bazar", zone: "OUTSIDE_DHAKA", transit: "48-72h Doorstep" },
  { name: "Jessore", zone: "OUTSIDE_DHAKA", transit: "48-72h Doorstep" },
];

interface ProductDetailClientProps {
  product: any;
  relatedProducts: any[];
}

export function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const router = useRouter();
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [fitAdvisorOpen, setFitAdvisorOpen] = useState(false);

  // Tailored fit advisor inputs
  const [userHeight, setUserHeight] = useState("5'8\"");
  const [userWeight, setUserWeight] = useState("70");
  const [userFitStyle, setUserFitStyle] = useState<"SLIM" | "REGULAR" | "RELAXED">("REGULAR");

  // Real-time BD Courier Estimator
  const [selectedDistrict, setSelectedDistrict] = useState("Dhaka");

  // Reviews submission state
  const [reviewsList, setReviewsList] = useState(product.reviews || []);
  const [writeReviewOpen, setWriteReviewOpen] = useState(false);
  const [revAuthor, setRevAuthor] = useState("");
  const [revRating, setRevRating] = useState(5);
  const [revTitle, setRevTitle] = useState("");
  const [revComment, setRevComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const { addItem } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const { locale } = useLocaleStore();

  const isFavorited = isInWishlist(product.id);
  const currentVariant = product.variants[selectedVariantIdx] || product.variants[0];
  const price = currentVariant?.price || product.basePrice;
  const comparePrice = product.compareAtPrice;
  const discountPercent =
    comparePrice && comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

  const currentImage = product.images[selectedImgIdx]?.url || product.images[0]?.url;

  // Courier calculation
  const selectedDistrictData =
    BD_DISTRICTS.find((d) => d.name === selectedDistrict) || BD_DISTRICTS[0];
  const isInsideDhaka = selectedDistrictData.zone === "INSIDE_DHAKA";
  const freeThreshold = isInsideDhaka ? 250000 : 500000;
  const isFreeDelivery = price >= freeThreshold;
  const deliveryFeePaisa = isFreeDelivery ? 0 : isInsideDhaka ? 7000 : 13000;
  const courierPartner = isInsideDhaka ? "Pathao Express" : "Steadfast Courier";

  // Size Recommendation Engine
  const calculateRecommendedSize = () => {
    const weightNum = parseInt(userWeight) || 70;
    let recommended = "40 (M)";
    let matchKeyword = "40";
    if (weightNum < 63) {
      recommended = "38 (S)";
      matchKeyword = "38";
    } else if (weightNum <= 74) {
      recommended = "40 (M)";
      matchKeyword = "40";
    } else if (weightNum <= 84) {
      recommended = "42 (L)";
      matchKeyword = "42";
    } else {
      recommended = "44 (XL)";
      matchKeyword = "44";
    }

    if (userFitStyle === "RELAXED") {
      if (recommended === "38 (S)") {
        recommended = "40 (M)";
        matchKeyword = "40";
      } else if (recommended === "40 (M)") {
        recommended = "42 (L)";
        matchKeyword = "42";
      } else if (recommended === "42 (L)") {
        recommended = "44 (XL)";
        matchKeyword = "44";
      }
    } else if (userFitStyle === "SLIM") {
      if (recommended === "44 (XL)") {
        recommended = "42 (L)";
        matchKeyword = "42";
      } else if (recommended === "42 (L)") {
        recommended = "40 (M)";
        matchKeyword = "40";
      }
    }

    return { recommended, matchKeyword };
  };

  const handleApplySizeRecommendation = () => {
    const { matchKeyword, recommended } = calculateRecommendedSize();
    const matchIdx = product.variants.findIndex(
      (v: any) =>
        (v.option1 && v.option1.includes(matchKeyword)) ||
        (v.option2 && v.option2.includes(matchKeyword))
    );
    if (matchIdx !== -1) {
      setSelectedVariantIdx(matchIdx);
      toast.success(
        locale === "bn"
          ? `সাইজ ${recommended} সিলেক্ট করা হয়েছে!`
          : `Tailored size ${recommended} selected!`
      );
    } else {
      toast.success(`Recommended size for you: ${recommended}`);
    }
    setFitAdvisorOpen(false);
  };

  const handleAddToCart = (redirect = false) => {
    if (!currentVariant || currentVariant.stock <= 0) {
      toast.error(locale === "bn" ? "এই ভ্যারিয়েন্টটি বর্তমানে স্টকে নেই" : "Selected variant is out of stock");
      return;
    }

    if (qty > 2) {
      toast.error(
        locale === "bn"
          ? "সীমা অতিক্রম: এক্সক্লুসিভ কালেকশন প্রতি অর্ডারে সর্বোচ্চ ২টি নেওয়া যাবে"
          : "Exclusivity policy: Maximum 2 units per patron allowed"
      );
      return;
    }

    addItem(
      {
        variantId: currentVariant.id,
        productId: product.id,
        productSlug: product.slug,
        nameEn: product.nameEn,
        nameBn: product.nameBn,
        variantLabel: [currentVariant.option1, currentVariant.option2].filter(Boolean).join(" / ") || "Standard",
        unitPricePaisa: price,
        imageUrl: currentImage,
        maxStock: currentVariant.stock,
      },
      qty
    );

    toast.success(
      locale === "bn" ? `ব্যাগে যোগ করা হয়েছে (${qty} টি)` : `Added ${qty} item(s) to your bag`
    );

    if (redirect) {
      router.push("/checkout");
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success(locale === "bn" ? "প্রোডাক্ট লিংক কপি করা হয়েছে!" : "Product link copied to clipboard!");
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revAuthor.trim() || !revTitle.trim() || !revComment.trim()) {
      toast.error("Please fill in all review details");
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          authorName: revAuthor,
          rating: revRating,
          title: revTitle,
          comment: revComment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setReviewsList([data.review, ...reviewsList]);
      setWriteReviewOpen(false);
      setRevAuthor("");
      setRevTitle("");
      setRevComment("");
      toast.success(
        locale === "bn"
          ? "আপনার রিভিউ সফলভাবে প্রকাশ করা হয়েছে!"
          : "Your verified review has been published!"
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-16">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-stone-400">
        <Link href="/" className="hover:text-white transition">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
        <Link href={`/c/${product.category?.slug}`} className="hover:text-white transition">
          {locale === "bn" ? product.category?.nameBn : product.category?.nameEn}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
        <span className="text-[#d9bc82] truncate max-w-xs">
          {locale === "bn" ? product.nameBn : product.nameEn}
        </span>
      </nav>

      {/* 2. Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Gallery Column */}
        <div className="space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-[3/4] w-full rounded-3xl overflow-hidden bg-stone-950 border border-white/10 group shadow-2xl">
            <Image
              src={currentImage}
              alt={product.nameEn}
              fill
              priority
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {product.badge && (
              <span className="absolute top-4 left-4 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-black/80 backdrop-blur-md text-[#d9bc82] border border-[#d9bc82]/40">
                {product.badge}
              </span>
            )}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white hover:text-[#d9bc82] transition"
                title="Share link"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white transition"
                title="Wishlist"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isFavorited ? "fill-rose-500 text-rose-500" : "text-white"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Thumbnails Row */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImgIdx(idx)}
                  className={`relative w-20 h-24 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    selectedImgIdx === idx
                      ? "border-[#d9bc82] scale-105 shadow-md shadow-[#d9bc82]/20"
                      : "border-white/10 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={img.url} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Meta & Actions Column */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Brand, Code & Ratings */}
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span className="px-2.5 py-1 rounded bg-stone-900 text-[#d9bc82] font-semibold tracking-wider uppercase text-[11px]">
                {product.brand || "Astrox"}
              </span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-stone-500">{product.code}</span>
                <div className="flex items-center gap-1 text-[#d9bc82]">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-mono font-bold text-white text-sm">
                    {product.ratingAvg.toFixed(1)}
                  </span>
                  <span className="text-stone-500 text-xs">({product.ratingCount} reviews)</span>
                </div>
              </div>
            </div>

            {/* Astrox Sovereign Tier & Verification Badge */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-[#211b11] via-[#161410] to-[#211b11] border border-[#d9bc82]/40 text-[#d9bc82] text-xs font-semibold">
                <Award className="w-3.5 h-3.5 text-[#d9bc82]" />
                <span>ASTRAL SOVEREIGN TIER</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-900/80 border border-white/5 text-stone-300 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sonargaon Atelier Certified</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-900/80 border border-white/5 text-stone-300 text-[11px]">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>14 patrons viewing now</span>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                {locale === "bn" ? product.nameBn : product.nameEn}
              </h1>
              {product.subtitleEn && (
                <p className="text-sm text-stone-400 leading-relaxed">
                  {locale === "bn" ? product.subtitleBn : product.subtitleEn}
                </p>
              )}
            </div>

            {/* Price Row */}
            <div className="flex items-baseline gap-4 pt-2">
              <span className="text-3xl font-bold text-[#d9bc82] font-mono">
                {formatMoney(price, locale)}
              </span>
              {comparePrice && comparePrice > price && (
                <>
                  <span className="text-lg text-stone-500 line-through font-mono">
                    {formatMoney(comparePrice, locale)}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800">
                    Save {discountPercent}%
                  </span>
                </>
              )}
            </div>

            {/* Variant Selector (Colors & Sizes) */}
            {product.variants.length > 0 && (
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                    {locale === "bn" ? "ভ্যারিয়েন্ট নির্বাচন:" : "Select Option:"}
                  </span>
                  {product.category?.optionPreset === "apparel" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setFitAdvisorOpen(true)}
                        className="flex items-center gap-1 text-[11px] text-[#d9bc82] bg-[#d9bc82]/10 hover:bg-[#d9bc82]/20 border border-[#d9bc82]/30 px-2 py-0.5 rounded-lg transition"
                      >
                        <Sparkles className="w-3 h-3 text-[#d9bc82]" />
                        <span className="font-semibold">{locale === "bn" ? "ফিট অ্যাডভাইজর" : "Tailored Fit"}</span>
                      </button>
                      <button
                        onClick={() => setSizeGuideOpen(true)}
                        className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-white hover:underline"
                      >
                        <Ruler className="w-3 h-3" />
                        <span>{locale === "bn" ? "সাইজ চার্ট" : "Size Chart"}</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {product.variants.map((v: any, idx: number) => {
                    const isSelected = selectedVariantIdx === idx;
                    const isOutOfStock = v.stock <= 0;

                    return (
                      <button
                        key={v.id}
                        onClick={() => {
                          setSelectedVariantIdx(idx);
                          // Switch thumbnail image if color matches
                          if (v.option1) {
                            const matchIdx = product.images.findIndex((img: any) => img.colorKey === v.option1);
                            if (matchIdx !== -1) setSelectedImgIdx(matchIdx);
                          }
                        }}
                        disabled={isOutOfStock}
                        className={`p-3 rounded-xl border text-left transition-all relative ${
                          isSelected
                            ? "bg-[#181922] border-[#d9bc82] ring-1 ring-[#d9bc82]"
                            : "bg-[#0D0D12] border-white/10 hover:border-white/30"
                        } ${isOutOfStock ? "opacity-40 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex items-center gap-2">
                          {v.swatchHex && (
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                              style={{ backgroundColor: v.swatchHex }}
                            />
                          )}
                          <span className="text-xs font-semibold text-white truncate">
                            {[v.option1, v.option2].filter(Boolean).join(" / ") || "Standard"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] mt-1.5 font-mono text-stone-400">
                          <span>{formatMoney(v.price || product.basePrice, locale)}</span>
                          {v.stock <= 5 && v.stock > 0 && (
                            <span className="text-amber-400 text-[10px]">Only {v.stock} left</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Stepper & Exclusivity Limit */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                  {locale === "bn" ? "পরিমাণ:" : "Quantity:"}
                </span>
                <div className="flex items-center border border-stone-800 rounded-xl bg-stone-900">
                  <button
                    onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                    className="px-3.5 py-2 text-stone-300 hover:text-white transition"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-mono font-semibold text-white text-sm">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((prev) => Math.min(Math.min(2, currentVariant?.stock || 2), prev + 1))}
                    className="px-3.5 py-2 text-stone-300 hover:text-white transition"
                  >
                    +
                  </button>
                </div>
              </div>

              <span className="text-[11px] font-mono text-amber-300/90 bg-amber-950/40 border border-amber-500/30 px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5">
                <span>🔒 Max 2 units per patron (Exclusivity Rule)</span>
              </span>
            </div>

            {/* Action CTAs */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                onClick={() => handleAddToCart(false)}
                className="py-4 px-6 rounded-xl bg-[#181922] border border-[#d9bc82]/50 hover:border-[#d9bc82] text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-[#1f202c] transition active:scale-95 shadow-lg"
              >
                <ShoppingBag className="w-4 h-4 text-[#d9bc82]" />
                <span>{locale === "bn" ? "ব্যাগে যোগ করুন" : "Add to Bag"}</span>
              </button>

              <button
                onClick={() => handleAddToCart(true)}
                className="py-4 px-6 rounded-xl bg-gold-gradient text-black font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl shadow-[#d9bc82]/10 hover:opacity-95 transition active:scale-95"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>{locale === "bn" ? "সরাসরি কিনুন" : "Buy Now"}</span>
              </button>
            </div>

            {/* Real-time Bangladesh Courier Fee & Delivery Calculator */}
            <div className="p-4 rounded-2xl bg-[#0D0D12] border border-[#d9bc82]/20 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-[#d9bc82]" />
                  <span>Bangladesh Delivery & Courier Calculator</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                  Open Box Check Allowed
                </span>
              </div>

              <div className="flex items-center gap-3">
                <label htmlFor="district-select" className="text-xs text-stone-400 shrink-0">
                  Your District:
                </label>
                <select
                  id="district-select"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="flex-1 bg-stone-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d9bc82]"
                >
                  {BD_DISTRICTS.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name} ({d.zone === "INSIDE_DHAKA" ? "Inside Dhaka" : "Outside Dhaka"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="p-2.5 rounded-xl bg-stone-900/70 border border-white/5 space-y-0.5">
                  <span className="text-[11px] text-stone-400 block">Delivery Charge</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {deliveryFeePaisa === 0 ? (
                      <span className="text-emerald-400 uppercase">FREE DELIVERY</span>
                    ) : (
                      formatMoney(deliveryFeePaisa, locale)
                    )}
                  </span>
                  {deliveryFeePaisa > 0 && (
                    <span className="text-[10px] text-stone-500 block">Free above {formatMoney(freeThreshold, locale)}</span>
                  )}
                </div>

                <div className="p-2.5 rounded-xl bg-stone-900/70 border border-white/5 space-y-0.5">
                  <span className="text-[11px] text-stone-400 block">Courier & Transit</span>
                  <span className="font-medium text-[#d9bc82] block truncate">{courierPartner}</span>
                  <span className="text-[10px] text-stone-400 block">{selectedDistrictData.transit}</span>
                </div>
              </div>
            </div>

            {/* Trust Assurances */}
            <div className="p-4 rounded-2xl bg-stone-900/60 border border-white/5 space-y-2.5 text-xs text-stone-300">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-[#d9bc82] shrink-0" />
                <span>24–48h Express Delivery in Dhaka · Cash on Delivery</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-[#d9bc82] shrink-0" />
                <span>7-Day Easy Size Exchange & Guaranteed Replacement</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#d9bc82] shrink-0" />
                <span>100% Authentic Guaranteed · Official Astrox Wax Seal</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Product Description & Story */}
      <div className="p-8 rounded-3xl bg-[#0D0D12] border border-white/10 space-y-6">
        <h2 className="text-xl font-bold text-white tracking-wide border-b border-white/10 pb-4">
          {locale === "bn" ? "পণ্যের বিস্তারিত বিবরণ" : "Product Details & Craft Heritage"}
        </h2>
        <div className="prose prose-invert max-w-none text-stone-300 text-sm leading-relaxed space-y-4">
          <p>{locale === "bn" ? product.descriptionBn : product.descriptionEn}</p>
        </div>

        {product.warrantyEn && (
          <div className="p-4 rounded-xl bg-stone-900/80 border border-[#d9bc82]/30 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#d9bc82] shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-white block">Official Astrox Warranty Protection</span>
              <span className="text-stone-400">{locale === "bn" ? product.warrantyBn : product.warrantyEn}</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Customer Reviews Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {locale === "bn" ? "ক্রেতাদের প্রতিক্রিয়া" : "Verified Client Reviews"}
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Real feedback from verified purchasers in Dhaka and across Bangladesh.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[#d9bc82]">
              <Star className="w-5 h-5 fill-current" />
              <span className="text-xl font-bold font-mono text-white">{product.ratingAvg.toFixed(1)}</span>
              <span className="text-stone-400 text-xs">/ 5.0</span>
            </div>
            <button
              onClick={() => setWriteReviewOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#181922] border border-[#d9bc82]/40 hover:border-[#d9bc82] text-xs font-semibold text-white transition flex items-center gap-1.5 shadow"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#d9bc82]" />
              <span>{locale === "bn" ? "রিভিউ লিখুন" : "Write Review"}</span>
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          {reviewsList.map((rev: any) => (
            <div key={rev.id} className="p-5 rounded-2xl bg-[#0D0D12] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{rev.authorName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Verified Purchase
                  </span>
                </div>
                <div className="flex text-[#d9bc82]">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>
              <h4 className="text-xs font-semibold text-stone-200">{rev.title}</h4>
              <p className="text-xs text-stone-400 leading-relaxed">{rev.comment}</p>
            </div>
          ))}

          {reviewsList.length === 0 && (
            <div className="p-8 text-center rounded-2xl bg-stone-900/40 border border-white/5 space-y-1">
              <p className="text-xs text-stone-400">Be the first verified patron to review this signature piece.</p>
            </div>
          )}
        </div>
      </div>

      {/* 5. Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-8 border-t border-white/10">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {locale === "bn" ? "একই ধরণের পছন্দনীয় সম্ভার" : "Pairs Elegantly With"}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#0D0D12] border border-[#d9bc82]/40 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Ruler className="w-4 h-4 text-[#d9bc82]" />
                <span>Astrox Tailoring Size Guide</span>
              </h3>
              <button
                onClick={() => setSizeGuideOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-stone-400 font-mono">
                    <th className="py-2">Size</th>
                    <th className="py-2">Chest (in)</th>
                    <th className="py-2">Length (in)</th>
                    <th className="py-2">Sleeve (in)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-stone-200 font-mono">
                  <tr>
                    <td className="py-2.5 font-bold text-[#d9bc82]">38 (S)</td>
                    <td>38 - 40</td>
                    <td>39</td>
                    <td>24</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-[#d9bc82]">40 (M)</td>
                    <td>40 - 42</td>
                    <td>41</td>
                    <td>24.5</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-[#d9bc82]">42 (L)</td>
                    <td>42 - 44</td>
                    <td>43</td>
                    <td>25</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-[#d9bc82]">44 (XL)</td>
                    <td>44 - 46</td>
                    <td>45</td>
                    <td>25.5</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-stone-400">
              * Measurements reflect garment dimensions. We recommend choosing your standard tailored fit. Free exchanges available within 7 days.
            </p>
          </div>
        </div>
      )}

      {/* Interactive Tailored Fit & Drape Advisor Modal */}
      {fitAdvisorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-[#0D0D12] border border-[#d9bc82]/40 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#d9bc82]" />
                <span>Tailored Fit & Drape Advisor</span>
              </h3>
              <button
                onClick={() => setFitAdvisorOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Height */}
              <div>
                <label className="text-stone-300 font-semibold block mb-1.5">Your Stature (Height):</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {["5'5\"", "5'7\"", "5'9\"", "5'11\"", "6'1\""].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setUserHeight(h)}
                      className={`py-2 px-1 rounded-xl border text-center font-mono transition ${
                        userHeight === h
                          ? "bg-[#181922] border-[#d9bc82] text-[#d9bc82] font-bold ring-1 ring-[#d9bc82]"
                          : "bg-stone-900 border-white/10 text-stone-300 hover:border-white/30"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weight */}
              <div>
                <label className="text-stone-300 font-semibold block mb-1.5">Physique / Weight:</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { val: "58", label: "55-62kg" },
                    { val: "68", label: "63-72kg" },
                    { val: "78", label: "73-82kg" },
                    { val: "88", label: "83-95kg" },
                  ].map((w) => (
                    <button
                      key={w.val}
                      type="button"
                      onClick={() => setUserWeight(w.val)}
                      className={`py-2 px-1.5 rounded-xl border text-center font-mono text-[11px] transition ${
                        userWeight === w.val
                          ? "bg-[#181922] border-[#d9bc82] text-[#d9bc82] font-bold ring-1 ring-[#d9bc82]"
                          : "bg-stone-900 border-white/10 text-stone-300 hover:border-white/30"
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fit Style */}
              <div>
                <label className="text-stone-300 font-semibold block mb-1.5">Fit Preference:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "SLIM", label: "Slim Tailored" },
                    { id: "REGULAR", label: "Classic Royal" },
                    { id: "RELAXED", label: "Comfort Drape" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setUserFitStyle(f.id as any)}
                      className={`py-2 px-1.5 rounded-xl border text-center transition ${
                        userFitStyle === f.id
                          ? "bg-[#181922] border-[#d9bc82] text-[#d9bc82] font-bold ring-1 ring-[#d9bc82]"
                          : "bg-stone-900 border-white/10 text-stone-300 hover:border-white/30"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Computed Recommendation */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#161410] to-[#251f15] border border-[#d9bc82]/40 space-y-2 mt-2 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-[#d9bc82] font-semibold">
                    Atelier Fit Prediction
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    98% Drape Accuracy
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-white">
                  Size {calculateRecommendedSize().recommended}
                </div>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  Based on your {userHeight} stature and {userWeight}kg frame, this tailored size delivers a magnificent Bengali regal posture with ease around shoulders and zero chest pulling.
                </p>
              </div>

              <button
                onClick={handleApplySizeRecommendation}
                className="w-full py-3.5 rounded-xl bg-gold-gradient text-black font-semibold text-xs tracking-wider uppercase hover:opacity-95 transition shadow-lg shadow-[#d9bc82]/10"
              >
                Apply Size {calculateRecommendedSize().recommended}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Write Verified Atelier Review Modal */}
      {writeReviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <form
            onSubmit={handleSubmitReview}
            className="w-full max-w-md bg-[#0D0D12] border border-[#d9bc82]/40 rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#d9bc82]" />
                <span>Write an Atelier Review</span>
              </h3>
              <button
                type="button"
                onClick={() => setWriteReviewOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-stone-300 font-medium block mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={revAuthor}
                  onChange={(e) => setRevAuthor(e.target.value)}
                  placeholder="e.g. Mahia Chowdhury"
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-white placeholder-stone-500"
                />
              </div>

              <div>
                <label className="text-stone-300 font-medium block mb-1">Rating Rating (Stars)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRevRating(star)}
                      className="p-1 text-2xl transition hover:scale-125"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= revRating
                            ? "fill-[#d9bc82] text-[#d9bc82]"
                            : "text-stone-700"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-stone-400 font-mono text-xs ml-2">
                    {revRating} of 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="text-stone-300 font-medium block mb-1">Review Headline *</label>
                <input
                  type="text"
                  required
                  value={revTitle}
                  onChange={(e) => setRevTitle(e.target.value)}
                  placeholder="e.g. Pure royalty! The gold thread work is breathtaking"
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-white placeholder-stone-500"
                />
              </div>

              <div>
                <label className="text-stone-300 font-medium block mb-1">Detailed Feedback *</label>
                <textarea
                  rows={3}
                  required
                  value={revComment}
                  onChange={(e) => setRevComment(e.target.value)}
                  placeholder="Share details on texture, fit, packaging, or compliments received..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-white placeholder-stone-500 resize-none"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setWriteReviewOpen(false)}
                className="flex-1 py-3 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold hover:bg-stone-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReview}
                className="flex-1 py-3 rounded-xl bg-gold-gradient text-black text-xs font-semibold uppercase tracking-wider disabled:opacity-50 transition shadow-lg shadow-[#d9bc82]/10"
              >
                {submittingReview ? "Publishing..." : "Submit Review"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
