import { db } from "@/server/db";
import { formatMoney } from "@/lib/money";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  Truck,
  CheckCircle,
  ArrowRight,
  Package,
} from "lucide-react";
import { DashboardCharts } from "@/components/studio/DashboardCharts";

export const revalidate = 0; // Dynamic real-time data

export default async function StudioOverviewPage() {
  // 1. Fetch live metrics from database
  const [orders, products, variants, lowStockVariants] = await Promise.all([
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    db.product.findMany({
      include: { variants: true },
    }),
    db.productVariant.findMany({
      include: { product: true },
    }),
    db.productVariant.findMany({
      where: { stock: { lte: 10 } },
      include: { product: true },
      take: 5,
    }),
  ]);

  const totalRevenue = orders.reduce((acc, o) => acc + (o.status !== "CANCELLED" ? o.total : 0), 0);
  const totalOrders = orders.length;
  const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED").length;
  const codOrders = orders.filter((o) => o.paymentMethod === "COD").length;
  const codShare = totalOrders > 0 ? Math.round((codOrders / totalOrders) * 100) : 0;

  // Group orders by district
  const districtCounts: Record<string, number> = {};
  for (const o of orders) {
    districtCounts[o.district] = (districtCounts[o.district] || 0) + 1;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#d9bc82]">
            Astrox Command Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            Real-Time Business Analytics
          </h1>
        </div>

        <div className="flex gap-3">
          <Link
            href="/studio/orders"
            className="px-4 py-2 rounded-xl bg-stone-900 border border-white/10 hover:border-[#d9bc82] text-xs font-semibold text-stone-200 transition"
          >
            Manage Orders
          </Link>
          <Link
            href="/studio/catalog"
            className="px-4 py-2 rounded-xl bg-gold-gradient text-black font-semibold text-xs tracking-wider uppercase hover:opacity-95 transition"
          >
            Add New Product
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="p-5 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-[#d9bc82]" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{formatMoney(totalRevenue)}</div>
          <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+14.2% vs last cycle</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-[#d9bc82]" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{totalOrders}</div>
          <div className="text-[11px] text-stone-400">
            {deliveredOrders} delivered successfully
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Average Order Value (AOV)</span>
            <TrendingUp className="w-4 h-4 text-[#d9bc82]" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{formatMoney(aov)}</div>
          <div className="text-[11px] text-stone-400">Premium luxury basket size</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Cash on Delivery (COD)</span>
            <Truck className="w-4 h-4 text-[#d9bc82]" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{codShare}%</div>
          <div className="text-[11px] text-stone-400">{codOrders} orders via courier collection</div>
        </div>
      </div>

      {/* Interactive Spline, Bar, Donut Charts & SLA Command */}
      <DashboardCharts
        actualTotalRevenue={totalRevenue}
        actualTotalOrders={totalOrders}
      />

      {/* Action Center Alerts & Inventory Warnings */}
      {lowStockVariants.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Action Required: Low Stock Variant Alerts</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {lowStockVariants.map((v) => (
              <div key={v.id} className="p-3 rounded-xl bg-black/40 border border-amber-500/20 text-xs flex justify-between items-center">
                <div className="min-w-0 pr-2">
                  <div className="font-semibold text-white truncate">{v.product.nameEn}</div>
                  <div className="text-[11px] text-stone-400 font-mono">
                    SKU: {v.sku} · {[v.option1, v.option2].filter(Boolean).join("/")}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 shrink-0">
                  {v.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid: Recent Orders & District Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-semibold text-white">Recent Orders Stream</h3>
            <Link href="/studio/orders" className="text-xs text-[#d9bc82] hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-stone-400 font-mono">
                  <th className="py-2.5">Order</th>
                  <th className="py-2.5">Customer</th>
                  <th className="py-2.5">District</th>
                  <th className="py-2.5">Total</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-stone-200 font-medium">
                {orders.slice(0, 6).map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-900/40 transition">
                    <td className="py-3 font-mono font-bold text-[#d9bc82]">{ord.orderNumber}</td>
                    <td className="py-3 text-white truncate max-w-[140px]">{ord.customerName}</td>
                    <td className="py-3 text-stone-400">{ord.district}</td>
                    <td className="py-3 font-mono">{formatMoney(ord.total)}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-stone-800 text-stone-300">
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* District Fulfillment Distribution */}
        <div className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-4">
          <h3 className="text-sm font-semibold text-white border-b border-white/10 pb-3">
            Orders by Bangladesh District
          </h3>
          <div className="space-y-3">
            {Object.entries(districtCounts).map(([district, count]) => {
              const pct = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0;
              return (
                <div key={district} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-300 font-medium">{district}</span>
                    <span className="text-[#d9bc82] font-mono font-bold">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#d9bc82] to-[#fde047] rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
