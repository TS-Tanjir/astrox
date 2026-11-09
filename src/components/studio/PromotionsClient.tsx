"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/money";
import { Tag, Plus, Sparkles, Check, Trash2, Percent, Gift, Truck } from "lucide-react";
import toast from "react-hot-toast";

export function PromotionsClient({ initialCoupons }: { initialCoupons: any[] }) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [showAdd, setShowAdd] = useState(false);

  const [code, setCode] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENT" | "FIXED" | "FREE_SHIPPING">("PERCENT");
  const [discountValue, setDiscountValue] = useState(15);
  const [minSubtotal, setMinSubtotal] = useState(250000); // ৳2500
  const [maxDiscount, setMaxDiscount] = useState<number | "">(200000); // ৳2000
  const [usageLimit, setUsageLimit] = useState<number | "">(250);
  const [submitting, setSubmitting] = useState(false);

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      const res = await fetch("/api/studio/promotions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !current }),
      });
      if (!res.ok) throw new Error("Toggle failed");

      setCoupons((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isActive: !current } : c))
      );
      toast.success("Coupon status updated");
    } catch {
      toast.error("Failed to update coupon status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promotional coupon?")) return;
    try {
      const res = await fetch(`/api/studio/promotions?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast.success("Coupon removed");
    } catch {
      toast.error("Failed to delete coupon");
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !titleEn.trim()) {
      toast.error("Please provide code and campaign title");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/studio/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          titleEn,
          discountType,
          discountValue: discountType === "FREE_SHIPPING" ? 0 : discountValue,
          minSubtotal,
          maxDiscount: maxDiscount === "" ? null : maxDiscount,
          usageLimit: usageLimit === "" ? null : usageLimit,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCoupons([data.coupon, ...coupons]);
      setShowAdd(false);
      setCode("");
      setTitleEn("");
      toast.success(`Promotional code ${data.coupon.code} launched!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create coupon");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Promotions & Coupons</h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Configure seasonal discount codes, minimum baskets, and client redemption limits.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2.5 rounded-xl bg-gold-gradient text-black font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5 shadow-lg shadow-[#d9bc82]/10 hover:opacity-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Promotion Code</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="p-5 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-4 flex flex-col justify-between shadow-xl"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-bold text-[#d9bc82] tracking-wider bg-[#d9bc82]/10 border border-[#d9bc82]/30 px-3 py-1 rounded-xl">
                  {c.code}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    c.isActive
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      : "bg-stone-800 text-stone-400"
                  }`}
                >
                  {c.isActive ? "ACTIVE" : "PAUSED"}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mt-1">{c.titleEn}</h3>
                <div className="text-xs font-mono text-stone-300 font-bold mt-1">
                  {c.discountType === "PERCENT" && `${c.discountValue}% Off Subtotal`}
                  {c.discountType === "FIXED" && `Flat ${formatMoney(c.discountValue)} Off`}
                  {c.discountType === "FREE_SHIPPING" && "Complimentary Nationwide Delivery"}
                </div>
              </div>

              <div className="text-[11px] text-stone-400 font-mono space-y-1 pt-2 border-t border-white/5">
                <div>Min Spend: {formatMoney(c.minSubtotal)}</div>
                {c.maxDiscount && <div>Max Cap: {formatMoney(c.maxDiscount)}</div>}
                <div>
                  Redemptions: {c.usedCount}
                  {c.usageLimit ? ` / ${c.usageLimit} Max` : " (Unlimited)"}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <button
                onClick={() => handleToggleActive(c.id, c.isActive)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  c.isActive
                    ? "bg-stone-800 text-stone-300 hover:bg-stone-700"
                    : "bg-[#d9bc82] text-black"
                }`}
              >
                {c.isActive ? "Pause Code" : "Activate Code"}
              </button>
              <button
                onClick={() => handleDelete(c.id)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Coupon Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <form
            onSubmit={handleCreateCoupon}
            className="w-full max-w-md bg-[#0D0D12] border border-[#d9bc82]/40 rounded-3xl p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#d9bc82]" />
                <span>Launch New Privilege Code</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-stone-300 font-medium block mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. POHELA2026"
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-white font-mono uppercase tracking-wider"
                />
              </div>

              <div>
                <label className="text-stone-300 font-medium block mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="e.g. Pohela Boishakh Sovereign Drop"
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-stone-300 font-medium block mb-1">Discount Type</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-white"
                >
                  <option value="PERCENT">Percentage Discount (%)</option>
                  <option value="FIXED">Flat BDT Amount (Paisa)</option>
                  <option value="FREE_SHIPPING">Free Complimentary Shipping</option>
                </select>
              </div>

              {discountType !== "FREE_SHIPPING" && (
                <div>
                  <label className="text-stone-300 font-medium block mb-1">
                    {discountType === "PERCENT" ? "Discount Percentage (e.g. 15%)" : "Amount (in Paisa, e.g. 100000 = ৳1,000)"}
                  </label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-white font-mono"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 font-medium block mb-1">Min Spend (Paisa)</label>
                  <input
                    type="number"
                    value={minSubtotal}
                    onChange={(e) => setMinSubtotal(parseInt(e.target.value) || 0)}
                    placeholder="250000"
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone-300 font-medium block mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value === "" ? "" : parseInt(e.target.value))}
                    placeholder="500"
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-gold-gradient text-black font-semibold text-xs tracking-wider uppercase disabled:opacity-50"
              >
                {submitting ? "Launching..." : "Launch Code"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
