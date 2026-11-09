"use client";

import { useState } from "react";
import { Search, Truck, CheckCircle, Package, Clock, ShieldCheck, MapPin } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import toast from "react-hot-toast";

export default function TrackPage() {
  const { locale } = useLocaleStore();
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) {
      toast.error("Please enter both Order Number and Phone Number");
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/track?orderNumber=${encodeURIComponent(orderNumber.trim())}&phone=${encodeURIComponent(phone.trim())}`);
      const data = await res.json();
      if (!res.ok || !data.order) {
        setOrder(null);
        toast.error("No matching order found. Please check your details.");
      } else {
        setOrder(data.order);
      }
    } catch {
      toast.error("Network error while tracking parcel.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 space-y-10">
      <div className="text-center space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#d9bc82]">
          Courier & Fulfillment
        </span>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Track Your Astrox Parcel
        </h1>
        <p className="text-xs text-stone-400 max-w-md mx-auto">
          Enter your order reference number and registered phone number to view live consignment milestones.
        </p>
      </div>

      {/* Lookup Form */}
      <form onSubmit={handleTrack} className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-4 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-stone-300">Order Number</label>
            <input
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. AX-2026-1001"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-xs text-white placeholder-stone-500 font-mono focus:outline-none focus:border-[#d9bc82]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-stone-300">Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-xs text-white placeholder-stone-500 font-mono focus:outline-none focus:border-[#d9bc82]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-gold-gradient text-black font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:opacity-95 transition shadow-lg shadow-[#d9bc82]/10"
        >
          {loading ? (
            <span>Locating Consignment...</span>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Track Parcel Live</span>
            </>
          )}
        </button>
      </form>

      {/* Results View */}
      {searched && !loading && !order && (
        <div className="p-8 rounded-2xl bg-[#0D0D12] border border-white/5 text-center text-stone-400 space-y-2">
          <Truck className="w-8 h-8 text-stone-500 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No Order Found</h3>
          <p className="text-xs text-stone-500">
            Please double-check your order number (e.g. AX-2026-1001) and phone number.
          </p>
        </div>
      )}

      {order && (
        <div className="p-6 md:p-8 rounded-3xl bg-[#0D0D12] border border-white/10 space-y-8 shadow-2xl">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="text-[11px] text-stone-400 uppercase tracking-wider">Active Consignment</div>
              <div className="text-xl font-bold font-mono text-[#d9bc82]">{order.orderNumber}</div>
              <div className="text-xs text-stone-400 mt-1">Recipient: {order.customerName}</div>
            </div>
            <div className="sm:text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#d9bc82]/20 text-[#d9bc82] border border-[#d9bc82]/40">
                {order.status}
              </span>
              <div className="text-xs text-stone-400 mt-1">Courier: {order.courierProvider || "Pathao Express"}</div>
            </div>
          </div>

          {/* Timeline Milestones */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Shipment Timeline
            </h3>

            <div className="space-y-4 pl-4 border-l-2 border-[#d9bc82]/30">
              {order.events?.map((ev: any, idx: number) => (
                <div key={ev.id || idx} className="relative pl-4 space-y-1">
                  <div className="absolute -left-[23px] top-0.5 w-3.5 h-3.5 rounded-full bg-[#d9bc82] ring-4 ring-[#0D0D12]" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{ev.titleEn}</span>
                    <span className="text-stone-500 font-mono text-[11px]">
                      {new Date(ev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {ev.note && <p className="text-[11px] text-stone-400">{ev.note}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Items Summary */}
          <div className="pt-6 border-t border-white/10 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Parcel Contents
            </h3>
            <div className="space-y-2">
              {order.items?.map((it: any) => (
                <div key={it.id} className="flex justify-between items-center text-xs py-1">
                  <span className="text-stone-200">
                    {it.titleEn} <span className="text-stone-500 font-mono">({it.variantLabel}) x{it.qty}</span>
                  </span>
                  <span className="font-mono text-[#d9bc82]">{formatMoney(it.lineTotal)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
