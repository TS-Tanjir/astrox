"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Sparkles, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { formatMoney } from "@/lib/money";

export default function CartPage() {
  const { items, removeItem, updateQty, couponCode, getSubtotalPaisa } = useCartStore();
  const { locale } = useLocaleStore();

  const subtotal = getSubtotalPaisa();
  const freeThreshold = 250000;
  const isFreeDelivery = subtotal >= freeThreshold;
  const remaining = Math.max(0, freeThreshold - subtotal);
  const deliveryFee = isFreeDelivery ? 0 : 7000;

  let couponDiscount = 0;
  if (couponCode === "ASTROX10") couponDiscount = Math.round(subtotal * 0.1);
  if (couponCode === "EIDLUXE") couponDiscount = 50000;

  const total = Math.max(0, subtotal - couponDiscount + deliveryFee);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-stone-900 border border-white/5 flex items-center justify-center mx-auto text-[#d9bc82]">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white">Your Shopping Bag is Empty</h1>
        <p className="text-xs text-stone-400">Discover handwoven luxury garments, ANC audio, and Seoul skincare.</p>
        <Link
          href="/"
          className="inline-block mt-4 px-6 py-3 rounded-xl bg-gold-gradient text-black font-semibold text-xs tracking-wider uppercase"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {locale === "bn" ? "আপনার শপিং ব্যাগ" : "Your Shopping Bag"}
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Complimentary delivery and 7-day exchange coverage included on all orders.
          </p>
        </div>
        <div className="text-xs font-mono text-stone-400">
          <span className="text-white font-bold">{items.length}</span> signature pieces
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.variantId}
              className="flex gap-4 p-4 rounded-2xl bg-[#0D0D12] border border-white/5 items-center justify-between group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative w-20 h-24 rounded-xl overflow-hidden shrink-0 bg-stone-950">
                  <Image src={item.imageUrl} alt={item.nameEn} fill className="object-cover" />
                </div>
                <div className="min-w-0 space-y-1">
                  <Link
                    href={`/p/${item.productSlug}`}
                    className="text-sm font-semibold text-white hover:text-[#d9bc82] transition truncate block"
                  >
                    {item.nameEn}
                  </Link>
                  <div className="text-xs text-stone-400 font-mono">{item.variantLabel}</div>
                  <div className="text-sm font-bold font-mono text-[#d9bc82] pt-1">
                    {formatMoney(item.unitPricePaisa, locale)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 shrink-0">
                {/* Stepper */}
                <div className="flex items-center border border-stone-800 rounded-lg bg-stone-900">
                  <button
                    onClick={() => updateQty(item.variantId, item.qty - 1)}
                    className="px-2.5 py-1 text-stone-400 hover:text-white"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-mono font-medium text-white">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.variantId, item.qty + 1)}
                    className="px-2.5 py-1 text-stone-400 hover:text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-sm font-bold font-mono text-white min-w-[70px] text-right">
                  {formatMoney(item.unitPricePaisa * item.qty, locale)}
                </div>

                <button
                  onClick={() => removeItem(item.variantId)}
                  className="p-2 text-stone-500 hover:text-rose-400 transition"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Box */}
        <div className="lg:col-span-4">
          <div className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-6 sticky top-28">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white border-b border-white/10 pb-3">
              Summary
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-stone-400">
                <span>Subtotal</span>
                <span className="font-mono text-white">{formatMoney(subtotal, locale)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Privilege ({couponCode})</span>
                  <span className="font-mono">-{formatMoney(couponDiscount, locale)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-400">
                <span>Estimated Delivery</span>
                <span className="font-mono text-white">{isFreeDelivery ? "FREE" : formatMoney(deliveryFee, locale)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-3 border-t border-white/10">
                <span>Total</span>
                <span className="font-mono text-[#d9bc82] text-xl">{formatMoney(total, locale)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full py-4 rounded-xl bg-gold-gradient text-black font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl shadow-[#d9bc82]/10 hover:opacity-95 transition"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500">
              <ShieldCheck className="w-3.5 h-3.5 text-[#d9bc82]" />
              <span>Cash on Delivery Available across Bangladesh</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
