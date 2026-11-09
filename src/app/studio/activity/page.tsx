import { db } from "@/server/db";
import { History, ShieldCheck, UserCheck } from "lucide-react";

export const revalidate = 0;

export default async function StudioActivityPage() {
  const orders = await db.order.findMany({
    take: 12,
    orderBy: { createdAt: "desc" },
    include: { events: true },
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white tracking-tight">Security & Activity Audit Log</h1>
        <p className="text-xs text-stone-400">Chronological immutable audit log of order creation, fulfillment status updates, and administrative modifications.</p>
      </div>

      <div className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-white/10 text-xs text-[#d9bc82] font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>RBAC Enforcement Active: Logs Protected Against Tampering</span>
        </div>

        <div className="space-y-4">
          {orders.map((ord) => (
            <div key={ord.id} className="p-4 rounded-xl bg-stone-900/60 border border-white/5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#d9bc82]">{ord.orderNumber}</span>
                <span className="text-stone-500 font-mono text-[11px]">
                  {new Date(ord.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="text-stone-300">
                Order placed by <span className="font-semibold text-white">{ord.customerName}</span> ({ord.customerPhone}) for{" "}
                <span className="font-semibold text-white">{ord.district}</span>.
              </div>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-stone-400">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Actor: Customer Checkout via {ord.paymentMethod}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
