"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { formatMoney } from "@/lib/money";

export function CartDrawer() {
  const { isOpen, closeCart, items, removeItem, updateQty, couponCode, setCoupon, getSubtotalPaisa } = useCartStore();
  const { locale } = useLocaleStore();
  const [promoInput, setPromoInput] = useState("");
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  const subtotal = getSubtotalPaisa();
  const freeThreshold = 250000; // ৳2500 in paisa
  const progressPercent = Math.min(100, Math.round((subtotal / freeThreshold) * 100));
  const remaining = Math.max(0, freeThreshold - subtotal);

  const handleApplyPromo = () => {
    if (!promoInput.trim()) return;
    const clean = promoInput.trim().toUpperCase();
    if (["ASTROX10", "EIDLUXE", "FREESHIP"].includes(clean)) {
      setCoupon(clean);
      setPromoMessage(`✨ Applied code ${clean}!`);
    } else {
      setPromoMessage("❌ Invalid privilege code. Try ASTROX10 or FREESHIP");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0D0D12] border-l border-[#d9bc82]/20 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#121319]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#d9bc82]" />
            <h2 className="text-lg font-semibold text-white tracking-wide">
              {locale === "bn" ? "আপনার শপিং ব্যাগ" : "Shopping Bag"}
            </h2>
            <span className="px-2 py-0.5 text-xs font-mono rounded-full bg-[#d9bc82]/20 text-[#d9bc82]">
              {items.reduce((acc, i) => acc + i.qty, 0)}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-[#181922] to-[#121319] border-b border-white/5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-stone-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#d9bc82]" />
              {remaining === 0 ? (
                <span className="text-[#d9bc82] font-medium">
                  {locale === "bn" ? "✨ ফ্রি ডেলিভারি আনলক হয়েছে!" : "✨ Free Delivery Unlocked across BD!"}
                </span>
              ) : (
                <span>
                  {locale === "bn"
                    ? `ফ্রি ডেলিভারির জন্য আরও ${formatMoney(remaining, "bn")} প্রয়োজন`
                    : `Add ${formatMoney(remaining, "en")} more for Free Delivery`}
                </span>
              )}
            </span>
            <span className="font-mono text-[#d9bc82] text-xs font-semibold">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#d9bc82] to-[#fde047] transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400 space-y-3">
              <div className="w-16 h-16 rounded-full bg-stone-900 border border-white/5 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-[#d9bc82]/40" />
              </div>
              <p className="text-base font-medium text-stone-200">
                {locale === "bn" ? "আপনার শপিং ব্যাগটি খালি" : "Your bag is currently empty"}
              </p>
              <p className="text-xs text-stone-500 max-w-xs">
                {locale === "bn"
                  ? "আমাদের ঐতিহ্যবাহী জামদানি শাড়ি, প্রিমিয়াম পাঞ্জাবি ও কে-বিউটি কালেকশন দেখুন।"
                  : "Explore our hand-loomed Muslin sarees, Jacquard panjabis, and K-Beauty serums."}
              </p>
              <button
                onClick={closeCart}
                className="mt-4 px-6 py-2.5 rounded-xl bg-gold-gradient text-black font-semibold text-xs tracking-wider uppercase hover:opacity-95 transition"
              >
                {locale === "bn" ? "কালেকশন ব্রাউজ করুন" : "Explore Collections"}
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.variantId}
                className="flex gap-4 p-3.5 rounded-xl bg-[#12131A] border border-white/5 hover:border-[#d9bc82]/30 transition group"
              >
                <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-stone-950">
                  <Image
                    src={item.imageUrl}
                    alt={item.nameEn}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/p/${item.productSlug}`}
                        onClick={closeCart}
                        className="text-sm font-medium text-white hover:text-[#d9bc82] transition line-clamp-1"
                      >
                        {locale === "bn" ? item.nameBn : item.nameEn}
                      </Link>
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="text-stone-500 hover:text-rose-400 p-0.5 transition"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-stone-400 mt-0.5 font-medium">
                      {item.variantLabel}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="text-sm font-semibold text-[#d9bc82]">
                      {formatMoney(item.unitPricePaisa * item.qty, locale)}
                    </div>
                    {/* Stepper */}
                    <div className="flex items-center border border-stone-800 rounded-lg bg-stone-900/80">
                      <button
                        onClick={() => updateQty(item.variantId, item.qty - 1)}
                        className="p-1 hover:text-white text-stone-400 transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center text-xs font-mono font-medium text-white">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.variantId, item.qty + 1)}
                        disabled={item.qty >= item.maxStock}
                        className="p-1 hover:text-white text-stone-400 disabled:opacity-30 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {items.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-[#121319] space-y-4">
            {/* Promo Code Box */}
            <div className="space-y-1.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder={locale === "bn" ? "প্রমো কোড (যেমন ASTROX10)" : "Privilege code (e.g. ASTROX10)"}
                  className="flex-1 px-3 py-2 rounded-lg bg-stone-900 border border-white/10 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d9bc82]"
                />
                <button
                  onClick={handleApplyPromo}
                  className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-[#d9bc82] hover:text-black text-xs font-semibold text-stone-200 transition"
                >
                  {locale === "bn" ? "প্রয়োগ" : "Apply"}
                </button>
              </div>
              {promoMessage && (
                <p className="text-[11px] text-stone-300 font-medium px-1">{promoMessage}</p>
              )}
              {couponCode && (
                <div className="flex items-center justify-between text-xs px-1 text-[#d9bc82]">
                  <span>Active privilege: {couponCode}</span>
                  <button onClick={() => setCoupon(null)} className="underline text-stone-400 hover:text-white">
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Calculations */}
            <div className="space-y-2 text-sm pt-2 border-t border-white/5">
              <div className="flex justify-between text-stone-400 text-xs">
                <span>{locale === "bn" ? "সাবটোটাল" : "Subtotal"}</span>
                <span className="text-white font-mono">{formatMoney(subtotal, locale)}</span>
              </div>
              <div className="flex justify-between text-stone-400 text-xs">
                <span>{locale === "bn" ? "আনুমানিক ডেলিভারি" : "Estimated Delivery"}</span>
                <span className="text-white font-mono">
                  {remaining === 0 ? "FREE" : formatMoney(7000, locale)}
                </span>
              </div>
              <div className="flex justify-between text-base font-semibold text-white pt-2 border-t border-white/5">
                <span>{locale === "bn" ? "সর্বমোট" : "Total"}</span>
                <span className="text-[#d9bc82] font-mono text-lg">
                  {formatMoney(remaining === 0 ? subtotal : subtotal + 7000, locale)}
                </span>
              </div>
            </div>

            {/* Checkout Link */}
            <Link
              href="/checkout"
              onClick={closeCart}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gold-gradient text-black font-semibold text-sm tracking-wide uppercase shadow-lg shadow-[#d9bc82]/10 hover:opacity-95 transition"
            >
              <span>{locale === "bn" ? "চেকআউট করুন" : "Proceed to Checkout"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500">
              <ShieldCheck className="w-3.5 h-3.5 text-[#d9bc82]" />
              <span>Cash on Delivery & Verified Authentic Luxury</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
