"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  ShoppingBag,
  Truck,
  Gift,
  CheckCircle2,
  Lock,
  ArrowRight,
  Globe,
  Sparkles,
} from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { formatMoney } from "@/lib/money";
import { PaymentModal } from "@/components/store/PaymentModal";
import toast from "react-hot-toast";

const BD_DIVISIONS = [
  "Dhaka",
  "Chattogram",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Rangpur",
  "Mymensingh",
];

const POPULAR_DISTRICTS: Record<string, string[]> = {
  Dhaka: ["Dhaka", "Gazipur", "Narayanganj", "Narsingdi", "Faridpur", "Manikganj"],
  Chattogram: ["Chattogram", "Cox's Bazar", "Cumilla", "Feni", "Noakhali"],
  Sylhet: ["Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"],
  Rajshahi: ["Rajshahi", "Bogura", "Pabna", "Sirajganj"],
  Khulna: ["Khulna", "Jashore", "Kushtia"],
  Barishal: ["Barishal", "Patuakhali", "Bhola"],
  Rangpur: ["Rangpur", "Dinajpur"],
  Mymensingh: ["Mymensingh", "Jamalpur"],
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, couponCode, clearCart, getSubtotalPaisa } = useCartStore();
  const { locale } = useLocaleStore();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [division, setDivision] = useState("Dhaka");
  const [district, setDistrict] = useState("Dhaka");
  const [area, setArea] = useState("");
  const [street, setStreet] = useState("");
  const [notes, setNotes] = useState("");

  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [hideInvoicePrice, setHideInvoicePrice] = useState(false);
  const [isExpatGift, setIsExpatGift] = useState(false);
  const [expatSenderName, setExpatSenderName] = useState("");
  const [expatSenderCountry, setExpatSenderCountry] = useState("United Kingdom");
  const [velvetPackaging, setVelvetPackaging] = useState(true);

  const [paymentMethod, setPaymentMethod] = useState<"COD" | "BKASH" | "NAGAD" | "SSLCOMMERZ" | "STRIPE">("COD");
  const [submitting, setSubmitting] = useState(false);
  const [pendingPaymentOrder, setPendingPaymentOrder] = useState<{
    orderNumber: string;
    total: number;
    paymentMethod: "BKASH" | "NAGAD" | "SSLCOMMERZ" | "STRIPE";
  } | null>(null);

  const subtotal = getSubtotalPaisa();
  const freeThreshold = 250000; // ৳2500
  const isFreeDelivery = subtotal >= freeThreshold;
  const deliveryFee = isFreeDelivery ? 0 : district.toLowerCase() === "dhaka" ? 7000 : 13000;

  let couponDiscount = 0;
  if (couponCode === "ASTROX10") couponDiscount = Math.round(subtotal * 0.1);
  if (couponCode === "EIDLUXE") couponDiscount = 50000;
  if (couponCode === "FREESHIP") couponDiscount = 0;

  const total = Math.max(0, subtotal - couponDiscount + deliveryFee);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error(locale === "bn" ? "আপনার শপিং ব্যাগটি খালি" : "Your bag is empty");
      return;
    }

    if (!customerName.trim() || !customerPhone.trim() || !street.trim() || !area.trim()) {
      toast.error(locale === "bn" ? "অনুগ্রহ করে সকল আবশ্যকীয় তথ্য পূরণ করুন" : "Please fill in all required delivery fields");
      return;
    }

    // Phone format check: 01XXXXXXXXX
    const phoneClean = customerPhone.replace(/\s+/g, "");
    if (!/^01\d{9}$/.test(phoneClean)) {
      toast.error("Please enter a valid 11-digit Bangladesh phone number (01XXXXXXXXX)");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone: phoneClean,
          customerEmail,
          division,
          district,
          area,
          street,
          notes,
          isGift,
          giftMessage: isGift ? giftMessage : undefined,
          hideInvoicePrice: isGift ? hideInvoicePrice : false,
          paymentMethod,
          couponCode,
          items: items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Order placement failed");
      }

      clearCart();

      if (paymentMethod === "COD") {
        toast.success(
          locale === "bn"
            ? `অর্ডার সফল হয়েছে! নম্বর: ${data.orderNumber}`
            : `Order placed! Number: ${data.orderNumber}`
        );
        router.push(`/order/${data.orderNumber}`);
      } else {
        // Open Interactive Gateway Modal for bKash, Nagad, Cards, Stripe
        setPendingPaymentOrder({
          orderNumber: data.orderNumber,
          total: data.total,
          paymentMethod: paymentMethod as any,
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-stone-900 border border-white/5 flex items-center justify-center mx-auto text-[#d9bc82]">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white">Your Shopping Bag is Empty</h1>
        <p className="text-xs text-stone-400">Add signature garments or tech drops to proceed with checkout.</p>
        <Link
          href="/"
          className="inline-block mt-4 px-6 py-3 rounded-xl bg-gold-gradient text-black font-semibold text-xs tracking-wider uppercase"
        >
          Discover Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {locale === "bn" ? "এক্সপ্রেস চেকআউট" : "Express Checkout"}
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Secure 256-Bit SSL Encrypted Order Transmission
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#d9bc82] font-medium">
          <Lock className="w-4 h-4" />
          <span>Verified Security</span>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Form: Delivery, Contact, Payment */}
        <div className="lg:col-span-7 space-y-8">
          {/* Step 1: Contact Information */}
          <div className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#d9bc82] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#d9bc82]/20 text-[#d9bc82] flex items-center justify-center text-xs">
                1
              </span>
              <span>{locale === "bn" ? "যোগাযোগের তথ্য" : "Contact Information"}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-300">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Tanzir Rahman"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d9bc82]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-300">
                  Phone Number (BD) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d9bc82] font-mono"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-stone-300">
                  Email Address (Optional for digital invoice)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d9bc82]"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Shipping Destination */}
          <div className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#d9bc82] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#d9bc82]/20 text-[#d9bc82] flex items-center justify-center text-xs">
                2
              </span>
              <span>{locale === "bn" ? "ডেলিভারি ঠিকানা" : "Delivery Destination"}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-300">Division</label>
                <select
                  value={division}
                  onChange={(e) => {
                    setDivision(e.target.value);
                    const list = POPULAR_DISTRICTS[e.target.value];
                    if (list && list[0]) setDistrict(list[0]);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-xs text-white focus:outline-none focus:border-[#d9bc82]"
                >
                  {BD_DIVISIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-300">District</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-xs text-white focus:outline-none focus:border-[#d9bc82]"
                >
                  {(POPULAR_DISTRICTS[division] || [division]).map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-stone-300">
                  Thana / Area / Landmark <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Gulshan-2 / Dhanmondi / Agrabad"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d9bc82]"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-stone-300">
                  Detailed Street Address / House / Flat <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="House 14, Road 45, Apartment 5B"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d9bc82] resize-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-stone-300">
                  Delivery Notes / Courier Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Call before delivery or deliver after 3 PM"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d9bc82]"
                />
              </div>
            </div>

            {/* Gift Options Toggle & Expat Patron Mode */}
            <div className="pt-4 border-t border-white/5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isGift}
                    onChange={(e) => {
                      setIsGift(e.target.checked);
                      if (e.target.checked) setHideInvoicePrice(true);
                    }}
                    className="rounded border-white/20 bg-stone-900 text-[#d9bc82] focus:ring-[#d9bc82]"
                  />
                  <span className="text-xs font-semibold text-stone-200 flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-[#d9bc82]" />
                    <span>Send as an Astrox Royal Gift</span>
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setIsGift(true);
                    setIsExpatGift(!isExpatGift);
                  }}
                  className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition flex items-center gap-1.5 ${
                    isExpatGift
                      ? "bg-[#d9bc82]/20 border-[#d9bc82] text-[#d9bc82]"
                      : "bg-stone-900 border-white/10 text-stone-400 hover:text-white"
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  <span>🌍 Expat Gifting Mode (From Abroad)</span>
                </button>
              </div>

              {isGift && (
                <div className="p-4 rounded-xl bg-[#14151E] border border-[#d9bc82]/30 space-y-3.5 animate-in fade-in">
                  {isExpatGift && (
                    <div className="p-3 rounded-lg bg-black/60 border border-white/5 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#d9bc82] flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Global Expat Patron Details</span>
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <input
                          type="text"
                          value={expatSenderName}
                          onChange={(e) => setExpatSenderName(e.target.value)}
                          placeholder="Sender Name (e.g. Farhan Chowdhury)"
                          className="px-3 py-1.5 rounded-lg bg-stone-900 border border-white/10 text-white"
                        />
                        <select
                          value={expatSenderCountry}
                          onChange={(e) => setExpatSenderCountry(e.target.value)}
                          className="px-3 py-1.5 rounded-lg bg-stone-900 border border-white/10 text-white"
                        >
                          <option value="United Kingdom">United Kingdom (UK)</option>
                          <option value="United States">United States (USA)</option>
                          <option value="Canada">Canada</option>
                          <option value="United Arab Emirates">United Arab Emirates (UAE)</option>
                          <option value="Saudi Arabia">Saudi Arabia (KSA)</option>
                          <option value="Australia">Australia</option>
                          <option value="Singapore">Singapore</option>
                          <option value="Malaysia">Malaysia</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-stone-300">
                      Personalized Calligraphy Gift Card Message:
                    </label>
                    <textarea
                      rows={2}
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      placeholder="Wishing you royal blessings, health and happiness from across the ocean..."
                      className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-white/10 text-xs text-white resize-none"
                    />
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={velvetPackaging}
                        onChange={(e) => setVelvetPackaging(e.target.checked)}
                        className="rounded border-white/20 bg-stone-900 text-[#d9bc82]"
                      />
                      <span className="text-xs text-stone-300">
                        Enclose in Astrox Royal Velvet Box with Hand-stamped Gold Wax Seal
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hideInvoicePrice}
                        onChange={(e) => setHideInvoicePrice(e.target.checked)}
                        className="rounded border-white/20 bg-stone-900 text-[#d9bc82]"
                      />
                      <span className="text-xs text-amber-300 font-medium">
                        Strictly hide all product prices and totals on the delivery parcel slip
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Payment Method */}
          <div className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#d9bc82] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#d9bc82]/20 text-[#d9bc82] flex items-center justify-center text-xs">
                3
              </span>
              <span>{locale === "bn" ? "পেমেন্ট পদ্ধতি" : "Payment Method"}</span>
            </h2>

            <div className="space-y-2.5">
              {/* COD */}
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                  paymentMethod === "COD"
                    ? "bg-[#181922] border-[#d9bc82]"
                    : "bg-stone-900/60 border-white/5 hover:border-white/20"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="mt-0.5 text-[#d9bc82] focus:ring-[#d9bc82]"
                />
                <div className="flex-1">
                  <div className="text-xs font-semibold text-white flex items-center gap-2">
                    <span>Cash on Delivery (COD)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#d9bc82]/20 text-[#d9bc82]">
                      Popular
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Pay securely in cash directly to Pathao / Steadfast courier upon receiving your parcel.
                  </p>
                </div>
              </label>

              {/* bKash */}
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                  paymentMethod === "BKASH"
                    ? "bg-[#181922] border-[#d9bc82]"
                    : "bg-stone-900/60 border-white/5 hover:border-white/20"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "BKASH"}
                  onChange={() => setPaymentMethod("BKASH")}
                  className="mt-0.5 text-[#d9bc82]"
                />
                <div className="flex-1">
                  <div className="text-xs font-semibold text-white">bKash (MFS Instant Sandbox)</div>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Instant tokenized checkout via bKash gateway.
                  </p>
                </div>
              </label>

              {/* SSLCommerz */}
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                  paymentMethod === "SSLCOMMERZ"
                    ? "bg-[#181922] border-[#d9bc82]"
                    : "bg-stone-900/60 border-white/5 hover:border-white/20"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "SSLCOMMERZ"}
                  onChange={() => setPaymentMethod("SSLCOMMERZ")}
                  className="mt-0.5 text-[#d9bc82]"
                />
                <div className="flex-1">
                  <div className="text-xs font-semibold text-white">Visa, Mastercard, Amex & Net Banking</div>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Local & International bank card payment processing via SSLCommerz.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-6 sticky top-28">
            <h2 className="text-base font-bold text-white tracking-wide border-b border-white/10 pb-3 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs text-[#d9bc82] font-mono">{items.length} items</span>
            </h2>

            {/* Items Mini List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-3 text-xs">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-stone-950">
                    <Image src={item.imageUrl} alt="" fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">{item.nameEn}</div>
                    <div className="text-[11px] text-stone-400 font-mono">
                      Qty: {item.qty} · {item.variantLabel}
                    </div>
                  </div>
                  <div className="font-mono font-semibold text-stone-200">
                    {formatMoney(item.unitPricePaisa * item.qty, locale)}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 pt-4 border-t border-white/10 text-xs">
              <div className="flex justify-between text-stone-400">
                <span>Subtotal</span>
                <span className="font-mono text-white">{formatMoney(subtotal, locale)}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Privilege Code ({couponCode})</span>
                  <span className="font-mono">-{formatMoney(couponDiscount, locale)}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-400">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#d9bc82]" />
                  <span>Delivery ({district})</span>
                </span>
                <span className="font-mono text-white">
                  {isFreeDelivery ? "FREE" : formatMoney(deliveryFee, locale)}
                </span>
              </div>

              <div className="flex justify-between text-base font-bold text-white pt-3 border-t border-white/10">
                <span>Total Payable</span>
                <span className="text-xl font-mono text-[#d9bc82]">{formatMoney(total, locale)}</span>
              </div>
            </div>

            {/* Submit Order Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl bg-gold-gradient text-black font-semibold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl shadow-[#d9bc82]/15 hover:opacity-95 active:scale-95 disabled:opacity-50 transition"
            >
              {submitting ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <span>Confirm Order</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500">
              <ShieldCheck className="w-3.5 h-3.5 text-[#d9bc82]" />
              <span>Full buyer protection & 7-day exchange</span>
            </div>
          </div>
        </div>
      </form>

      {/* Interactive Payment Gateway Modal */}
      {pendingPaymentOrder && (
        <PaymentModal
          isOpen={true}
          orderNumber={pendingPaymentOrder.orderNumber}
          totalPaisa={pendingPaymentOrder.total}
          paymentMethod={pendingPaymentOrder.paymentMethod}
          onSuccess={() => {
            router.push(`/order/${pendingPaymentOrder.orderNumber}`);
          }}
          onCancel={() => {
            setPendingPaymentOrder(null);
            toast("Payment paused. You can complete it anytime via your order link.");
          }}
        />
      )}
    </div>
  );
}
