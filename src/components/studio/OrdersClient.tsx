"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/money";
import {
  ShoppingBag,
  Printer,
  CheckCircle2,
  Truck,
  RotateCcw,
  Clock,
  Filter,
  Package,
  Gift,
  ExternalLink,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";

export function OrdersClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [bookingCarrier, setBookingCarrier] = useState(false);

  const filteredOrders =
    activeTab === "ALL" ? orders : orders.filter((o) => o.status === activeTab);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/studio/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update order status");
    }
  };

  const handleBookCourier = async (provider: "PATHAO" | "STEADFAST") => {
    if (!selectedOrder) return;
    setBookingCarrier(true);
    try {
      const res = await fetch("/api/studio/courier/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: selectedOrder.id, providerName: provider }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(data.message || `Booked with ${provider}!`);

      // Update local state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? { ...o, status: "SHIPPED", courierProvider: provider, trackingCode: data.trackingCode }
            : o
        )
      );
      setSelectedOrder({
        ...selectedOrder,
        status: "SHIPPED",
        courierProvider: provider,
        trackingCode: data.trackingCode,
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to book courier");
    } finally {
      setBookingCarrier(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Orders & Consignments</h1>
          <p className="text-xs text-stone-400 mt-0.5">Manage customer orders, track courier fulfillment, and generate A4 invoices.</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/api/studio/export/orders"
            className="px-3.5 py-2 rounded-xl bg-stone-900 border border-white/10 hover:border-[#d9bc82] text-xs font-semibold text-stone-200 flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4 text-[#d9bc82]" />
            <span>Export Orders CSV</span>
          </a>
          <div className="text-xs text-stone-400 font-mono">
            Total: <span className="text-white font-bold">{orders.length}</span> consignments
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {["ALL", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === tab
                ? "bg-[#d9bc82] text-black"
                : "bg-stone-900 text-stone-300 hover:text-white hover:bg-stone-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-stone-400 font-mono">
                <th className="py-3 px-3">Order #</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Destination</th>
                <th className="py-3 px-3">Items</th>
                <th className="py-3 px-3">Total Payable</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-stone-200">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-stone-900/40 transition">
                  <td className="py-3.5 px-3 font-mono font-bold text-[#d9bc82]">{ord.orderNumber}</td>
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-white">{ord.customerName}</div>
                    <div className="text-[11px] text-stone-500 font-mono">{ord.customerPhone}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div>{ord.district}</div>
                    <div className="text-[11px] text-stone-500">{ord.area}</div>
                  </td>
                  <td className="py-3.5 px-3 font-mono">
                    {ord.items.length} item(s)
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-white">
                    {formatMoney(ord.total)}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-stone-900 border border-white/5 text-stone-300">
                      {ord.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        ord.status === "DELIVERED"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : ord.status === "CANCELLED"
                          ? "bg-rose-950 text-rose-300 border border-rose-800"
                          : "bg-amber-950 text-amber-300 border border-amber-800"
                      }`}
                    >
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right space-x-2">
                    <button
                      onClick={() => setSelectedOrder(ord)}
                      className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-[#d9bc82] hover:text-black font-semibold text-[11px] text-stone-200 transition"
                    >
                      Inspect / Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Inspect & Printable Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#0D0D12] border border-[#d9bc82]/40 rounded-3xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[11px] font-mono text-[#d9bc82] uppercase tracking-wider">
                  Consignment Details
                </span>
                <h3 className="text-xl font-bold text-white font-mono">{selectedOrder.orderNumber}</h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/studio/orders/label?orderNumber=${selectedOrder.orderNumber}`}
                  target="_blank"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-white transition"
                >
                  <Package className="w-3.5 h-3.5 text-[#d9bc82]" />
                  <span>A6 Shipping Label</span>
                </a>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-white transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Invoice (A4)</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 rounded-lg text-stone-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Expat Gift Notice if applicable */}
            {selectedOrder.isGift && (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#21180d] to-[#161410] border border-[#d9bc82]/40 text-xs text-stone-200 flex items-start gap-3">
                <Gift className="w-4 h-4 text-[#d9bc82] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-[#d9bc82] block uppercase tracking-wider text-[11px]">
                    🎁 Expat Gift to Bangladesh Order
                  </span>
                  <p className="italic text-stone-300">"{selectedOrder.giftMessage || "Handcrafted Astrox Gift"}"</p>
                  <span className="text-[10px] text-amber-300 block font-mono">
                    Prices are strictly suppressed on physical parcel slips.
                  </span>
                </div>
              </div>
            )}

            {/* Courier Dispatch Booking Bar */}
            <div className="p-4 rounded-xl bg-stone-900 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#d9bc82]" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Courier Logistics & Consignment Booking
                  </span>
                </div>
                {selectedOrder.trackingCode && (
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                    {selectedOrder.courierProvider}: {selectedOrder.trackingCode}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => handleBookCourier("PATHAO")}
                  disabled={bookingCarrier}
                  className="px-3.5 py-2 rounded-xl bg-[#181922] border border-white/10 hover:border-[#d9bc82] text-xs font-semibold text-white flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <Truck className="w-3.5 h-3.5 text-[#d9bc82]" />
                  <span>Book Pathao Express (24h)</span>
                </button>
                <button
                  onClick={() => handleBookCourier("STEADFAST")}
                  disabled={bookingCarrier}
                  className="px-3.5 py-2 rounded-xl bg-[#181922] border border-white/10 hover:border-[#d9bc82] text-xs font-semibold text-white flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <Truck className="w-3.5 h-3.5 text-[#d9bc82]" />
                  <span>Book Steadfast (64 Districts)</span>
                </button>
              </div>
            </div>

            {/* Quick Status Advance */}
            <div className="p-4 rounded-xl bg-stone-900 border border-white/5 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Advance Fulfillment Status:
              </span>
              <div className="flex flex-wrap gap-2">
                {["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"].map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                      className={`px-3 py-1 rounded text-xs font-mono font-semibold transition ${
                        selectedOrder.status === st
                          ? "bg-[#d9bc82] text-black"
                          : "bg-stone-800 text-stone-300 hover:bg-stone-700"
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Invoice Printable View */}
            <div id="printable-invoice" className="p-6 rounded-2xl bg-black border border-white/10 space-y-4 text-xs font-sans">
              <div className="flex justify-between items-start border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-widest font-mono">ASTROX LUXE LTD</h2>
                  <p className="text-stone-400">Sonargaon & Gulshan-2, Dhaka 1212</p>
                  <p className="text-stone-400">Concierge: +880 1700-000001</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[#d9bc82] font-bold text-sm">{selectedOrder.orderNumber}</span>
                  <p className="text-stone-500 font-mono">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Customer */}
              <div className="grid grid-cols-2 gap-4 py-2 border-b border-white/5 text-stone-300">
                <div>
                  <span className="font-semibold text-white block">Recipient:</span>
                  <p>{selectedOrder.customerName}</p>
                  <p>{selectedOrder.customerPhone}</p>
                </div>
                <div>
                  <span className="font-semibold text-white block">Delivery Address:</span>
                  <p>{selectedOrder.street}, {selectedOrder.area}</p>
                  <p>{selectedOrder.district}, {selectedOrder.division}</p>
                </div>
              </div>

              {/* Items */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-stone-400 font-mono">
                    <th className="py-2">Item Description</th>
                    <th className="py-2">Variant</th>
                    <th className="py-2">Qty</th>
                    <th className="py-2 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-stone-200">
                  {selectedOrder.items?.map((it: any) => (
                    <tr key={it.id}>
                      <td className="py-2 font-medium">{it.titleEn}</td>
                      <td className="py-2 text-stone-400 font-mono">{it.variantLabel}</td>
                      <td className="py-2 font-mono">{it.qty}</td>
                      <td className="py-2 text-right font-mono text-[#d9bc82]">{formatMoney(it.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-3 border-t border-white/10 flex justify-between text-sm font-bold text-white">
                <span>Grand Total (Payable via {selectedOrder.paymentMethod})</span>
                <span className="font-mono text-[#d9bc82] text-base">{formatMoney(selectedOrder.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
