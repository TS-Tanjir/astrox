"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/money";
import { ShoppingBag, Clock, Send, CheckCircle2, AlertCircle, Phone, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export function AbandonedClient({ initialCarts }: { initialCarts: any[] }) {
  const [carts, setCarts] = useState(initialCarts);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const handleSendRecovery = async (cart: any) => {
    setSendingId(cart.id);
    try {
      const res = await fetch("/api/studio/abandoned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId: cart.id,
          customerPhone: cart.customerPhone,
          customerName: cart.customerName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCarts((prev) =>
        prev.map((c) =>
          c.id === cart.id ? { ...c, recoverySentAt: new Date().toISOString() } : c
        )
      );
      toast.success(data.message || "Recovery dispatched successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to dispatch recovery");
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Abandoned Bag Recovery</h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Identify patron bags left before checkout completion and dispatch automated recovery SMS/email with incentive codes.
          </p>
        </div>
        <div className="text-xs text-stone-400 font-mono">
          Pending Bags: <span className="text-[#d9bc82] font-bold">{carts.length}</span>
        </div>
      </div>

      <div className="grid gap-4">
        {carts.map((c) => (
          <div
            key={c.id}
            className="p-5 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-3 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white">{c.customerName}</span>
                <span className="flex items-center gap-1 text-xs font-mono text-stone-400">
                  <Phone className="w-3 h-3 text-[#d9bc82]" />
                  <span>{c.customerPhone}</span>
                </span>
                <span className="flex items-center gap-1 text-[11px] text-stone-500 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(c.updatedAt).toLocaleTimeString()}</span>
                </span>
              </div>

              <div className="text-xs text-stone-300">
                <span className="text-stone-500 mr-2">{c.itemCount} item(s):</span>
                <span className="font-mono">
                  {c.items.map((i: any) => `${i.nameEn} (${i.variant})`).join(" • ")}
                </span>
              </div>

              <div className="text-xs font-mono">
                <span className="text-stone-400">Abandoned Bag Value: </span>
                <span className="text-base font-bold text-[#d9bc82]">
                  {formatMoney(c.subtotalPaisa)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {c.recoverySentAt ? (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs font-mono text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Recovery Dispatched</span>
                </div>
              ) : (
                <button
                  onClick={() => handleSendRecovery(c)}
                  disabled={sendingId === c.id}
                  className="px-4 py-2.5 rounded-xl bg-gold-gradient text-black font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-[#d9bc82]/10 hover:opacity-95 transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendingId === c.id ? "Dispatching..." : "Send Recovery SMS (5% Off)"}</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {carts.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-[#0D0D12] border border-white/5 space-y-2">
            <ShoppingBag className="w-8 h-8 text-stone-600 mx-auto" />
            <h3 className="text-sm font-semibold text-white">No abandoned bags recorded</h3>
            <p className="text-xs text-stone-400">All customer carts have either completed or checked out.</p>
          </div>
        )}
      </div>
    </div>
  );
}
