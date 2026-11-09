import { db } from "@/server/db";
import { notFound } from "next/navigation";
import { formatMoney } from "@/lib/money";
import { ShieldCheck, Truck, ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";

export const dynamic = "force-dynamic";

export default async function OrderShippingLabelPage({
  searchParams,
}: {
  searchParams: Promise<{ orderNumber?: string; consignmentId?: string }>;
}) {
  const { orderNumber, consignmentId } = await searchParams;

  if (!orderNumber) notFound();

  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { items: true, shipment: true },
  });

  if (!order) notFound();

  const activeConsignment =
    consignmentId || order.shipment?.consignmentId || `PTH-2026-${order.orderNumber.slice(-4)}`;
  const carrierName = order.courierProvider === "STEADFAST" ? "Steadfast Courier" : "Pathao Express";

  const codCollectAmount =
    order.paymentMethod === "COD" && order.paymentStatus !== "PAID" ? order.total : 0;

  return (
    <div className="min-h-screen bg-stone-900 text-black py-8 px-4 flex flex-col items-center">
      {/* Screen action bar */}
      <div className="w-full max-w-[420px] mb-4 flex items-center justify-between print:hidden">
        <Link
          href="/studio/orders"
          className="text-xs font-semibold text-stone-300 hover:text-white flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Studio Orders</span>
        </Link>
        <button
          onClick={() => {}}
          className="px-4 py-2 rounded-xl bg-gold-gradient text-black font-semibold text-xs flex items-center gap-1.5 shadow"
        >
          <Printer className="w-4 h-4" />
          <span>Print A6 Label</span>
        </button>
      </div>

      {/* A6 Printable Label (approx 105mm x 148mm = 400px x 560px) */}
      <div className="w-full max-w-[420px] bg-white border-2 border-black rounded-lg p-5 shadow-2xl space-y-3 font-sans print:shadow-none print:m-0 print:border-2">
        {/* Header with carrier and Astrox logo */}
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div>
            <div className="text-xl font-black uppercase tracking-tight text-black">
              {carrierName}
            </div>
            <span className="text-[10px] font-mono font-bold tracking-wider text-stone-600 block">
              AIR WAYBILL / CONSIGNMENT
            </span>
          </div>

          <div className="text-right">
            <span className="text-base font-black tracking-widest text-black">ASTROX</span>
            <span className="text-[9px] block text-stone-500 font-mono">DHAKA ATELIER</span>
          </div>
        </div>

        {/* Consignment barcode representation */}
        <div className="text-center py-2 bg-stone-100 border border-black/20 rounded">
          <div className="font-mono text-xl font-bold tracking-widest">
            *||| | |||| | ||||| | |||*
          </div>
          <div className="text-xs font-mono font-black tracking-widest mt-1">
            {activeConsignment}
          </div>
        </div>

        {/* Destination & Recipient details */}
        <div className="border-2 border-black p-3 rounded space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600">
              RECIPIENT / SHIP TO:
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-black text-white uppercase">
              DISTRICT: {order.district}
            </span>
          </div>
          <div className="text-base font-bold text-black">{order.customerName}</div>
          <div className="text-sm font-mono font-bold text-black">{order.customerPhone}</div>
          <div className="text-xs leading-snug text-stone-800 pt-1">
            {order.street}, {order.area}, {order.district}, {order.division}
          </div>
          {order.notes && (
            <div className="text-[11px] font-semibold text-rose-700 pt-1">
              Note: {order.notes}
            </div>
          )}
        </div>

        {/* COD Collection Amount or Prepaid badge */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="border-2 border-black p-2 rounded bg-amber-50">
            <span className="text-[10px] font-bold text-stone-600 block uppercase">
              COD TO COLLECT
            </span>
            <span className="text-lg font-black font-mono text-black">
              {codCollectAmount > 0 ? formatMoney(codCollectAmount) : "PAID / ৳0"}
            </span>
          </div>

          <div className="border-2 border-black p-2 rounded">
            <span className="text-[10px] font-bold text-stone-600 block uppercase">
              ORDER REFERENCE
            </span>
            <span className="text-sm font-black font-mono text-black mt-1 block">
              {order.orderNumber}
            </span>
          </div>
        </div>

        {/* Package Contents & Inspection notice */}
        <div className="text-[11px] text-stone-700 border-t border-black/30 pt-2 space-y-1">
          <div className="flex justify-between font-mono">
            <span>Contents: {order.items.length} item(s)</span>
            <span>Weight: ~750g</span>
          </div>
          <div className="text-[10px] text-stone-600 italic">
            {order.items.map((i) => `${i.titleEn} (${i.variantLabel})`).join(" • ")}
          </div>
        </div>

        {/* Return Address & Footer instructions */}
        <div className="border-t-2 border-black pt-2 flex items-center justify-between text-[10px]">
          <div>
            <span className="font-bold block">RETURN SENDER:</span>
            <span>Astrox Astral Atelier, Sonargaon Road, Dhaka 1205</span>
            <span className="block font-mono">Helpline: +880 1700-000001</span>
          </div>
          <div className="w-12 h-12 border border-black flex items-center justify-center font-mono text-[9px] text-center font-bold">
            QR CODE
          </div>
        </div>
      </div>
    </div>
  );
}
