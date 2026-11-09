import { db } from "@/server/db";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2, Truck, Package, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import { formatMoney } from "@/lib/money";

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await db.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      events: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      {/* Success Badge */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-[#d9bc82]">
          Astrox Regal Order Confirmed
        </span>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Thank you for choosing Astrox, {order.customerName.split(" ")[0]}!
        </h1>
        <p className="text-xs text-stone-400 max-w-md mx-auto">
          Your order has been received and entered fulfillment at our Sonargaon & Dhaka ateliers.
        </p>
      </div>

      {/* Order Info Card */}
      <div className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2">
          <div>
            <div className="text-[11px] text-stone-400 uppercase tracking-wider">Order Reference</div>
            <div className="text-lg font-bold font-mono text-[#d9bc82]">{order.orderNumber}</div>
          </div>
          <div className="sm:text-right">
            <div className="text-[11px] text-stone-400 uppercase tracking-wider">Payment Mode</div>
            <div className="text-xs font-semibold text-white uppercase">{order.paymentMethod} (Due upon delivery)</div>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">Order Items</h3>
          <div className="space-y-3 divide-y divide-white/5">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 pt-3 first:pt-0">
                <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-stone-950">
                  <Image src={item.imageUrl} alt="" fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">{item.titleEn}</h4>
                  <div className="text-xs text-stone-400 font-mono mt-0.5">
                    {item.variantLabel} · Qty: {item.qty}
                  </div>
                </div>
                <div className="text-sm font-semibold font-mono text-[#d9bc82] text-right">
                  {formatMoney(item.lineTotal)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
          <div className="flex justify-between text-stone-400">
            <span>Subtotal</span>
            <span className="font-mono text-white">{formatMoney(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Savings</span>
              <span className="font-mono">-{formatMoney(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-stone-400">
            <span>Delivery</span>
            <span className="font-mono text-white">{order.shippingFee === 0 ? "FREE" : formatMoney(order.shippingFee)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/5">
            <span>Total Payable</span>
            <span className="font-mono text-[#d9bc82] text-lg">{formatMoney(order.total)}</span>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="p-4 rounded-xl bg-stone-900/60 border border-white/5 text-xs text-stone-300 space-y-1">
          <div className="font-semibold text-white flex items-center gap-1.5 mb-1">
            <Truck className="w-4 h-4 text-[#d9bc82]" />
            <span>Delivery Destination</span>
          </div>
          <p>{order.customerName} · {order.customerPhone}</p>
          <p>{order.street}, {order.area}, {order.district}, {order.division}</p>
        </div>
      </div>

      {/* Track & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href={`/track?orderNumber=${order.orderNumber}&phone=${order.customerPhone}`}
          className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-xl bg-gold-gradient text-black font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl hover:opacity-95 transition"
        >
          <span>Track Live Parcel Status</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/"
          className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-stone-900 border border-white/10 text-stone-300 hover:text-white text-xs font-semibold tracking-wider uppercase text-center transition"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
