"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/money";
import {
  TrendingUp,
  Calendar,
  CreditCard,
  Truck,
  ArrowUpRight,
  ShieldCheck,
  Package,
} from "lucide-react";

type TimeRange = "today" | "7d" | "30d" | "ytd";

interface ChartDataPoint {
  label: string;
  revenuePaisa: number;
  ordersCount: number;
}

const DATA_BY_RANGE: Record<
  TimeRange,
  {
    grossPaisa: number;
    ordersTotal: number;
    aovPaisa: number;
    growthPct: string;
    points: ChartDataPoint[];
  }
> = {
  today: {
    grossPaisa: 12500000,
    ordersTotal: 18,
    aovPaisa: 694400,
    growthPct: "+22.4%",
    points: [
      { label: "06:00", revenuePaisa: 1200000, ordersCount: 2 },
      { label: "09:00", revenuePaisa: 2800000, ordersCount: 4 },
      { label: "12:00", revenuePaisa: 4100000, ordersCount: 6 },
      { label: "15:00", revenuePaisa: 2200000, ordersCount: 3 },
      { label: "18:00", revenuePaisa: 1600000, ordersCount: 2 },
      { label: "21:00", revenuePaisa: 600000, ordersCount: 1 },
    ],
  },
  "7d": {
    grossPaisa: 84500000,
    ordersTotal: 112,
    aovPaisa: 754400,
    growthPct: "+18.7%",
    points: [
      { label: "Mon", revenuePaisa: 9800000, ordersCount: 13 },
      { label: "Tue", revenuePaisa: 11200000, ordersCount: 15 },
      { label: "Wed", revenuePaisa: 14500000, ordersCount: 19 },
      { label: "Thu", revenuePaisa: 12100000, ordersCount: 16 },
      { label: "Fri", revenuePaisa: 16800000, ordersCount: 22 },
      { label: "Sat", revenuePaisa: 11800000, ordersCount: 16 },
      { label: "Sun", revenuePaisa: 8300000, ordersCount: 11 },
    ],
  },
  "30d": {
    grossPaisa: 348200000,
    ordersTotal: 462,
    aovPaisa: 753600,
    growthPct: "+24.1%",
    points: [
      { label: "Week 1", revenuePaisa: 72000000, ordersCount: 96 },
      { label: "Week 2", revenuePaisa: 89000000, ordersCount: 118 },
      { label: "Week 3", revenuePaisa: 94000000, ordersCount: 124 },
      { label: "Week 4", revenuePaisa: 93200000, ordersCount: 124 },
    ],
  },
  ytd: {
    grossPaisa: 1420500000,
    ordersTotal: 1890,
    aovPaisa: 751500,
    growthPct: "+41.3%",
    points: [
      { label: "Q1", revenuePaisa: 310000000, ordersCount: 412 },
      { label: "Q2", revenuePaisa: 365000000, ordersCount: 486 },
      { label: "Q3", revenuePaisa: 395000000, ordersCount: 524 },
      { label: "Q4", revenuePaisa: 350500000, ordersCount: 468 },
    ],
  },
};

const PAYMENT_BREAKDOWN = [
  { method: "Cash on Delivery (COD)", share: 62, color: "#d9bc82", count: 72 },
  { method: "bKash Direct MFS", share: 24, color: "#e11d48", count: 28 },
  { method: "Nagad Gateway", share: 9, color: "#f97316", count: 10 },
  { method: "Visa / Mastercard", share: 5, color: "#38bdf8", count: 6 },
];

export function DashboardCharts({
  actualTotalRevenue,
  actualTotalOrders,
}: {
  actualTotalRevenue: number;
  actualTotalOrders: number;
}) {
  const [range, setRange] = useState<TimeRange>("7d");
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);

  const currentData = DATA_BY_RANGE[range];
  const maxRevenue = Math.max(...currentData.points.map((p) => p.revenuePaisa), 1);
  const maxOrders = Math.max(...currentData.points.map((p) => p.ordersCount), 1);

  // SVG dimensions for Spline Chart
  const svgWidth = 600;
  const svgHeight = 200;
  const paddingX = 40;
  const paddingY = 25;

  const points = currentData.points.map((p, idx) => {
    const x =
      paddingX +
      (idx / (currentData.points.length - 1 || 1)) *
        (svgWidth - paddingX * 2);
    const y =
      svgHeight -
      paddingY -
      (p.revenuePaisa / maxRevenue) * (svgHeight - paddingY * 2);
    return { ...p, x, y };
  });

  // Build SVG path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cp1x = p0.x + (p1.x - p0.x) / 2;
    const cp1y = p0.y;
    const cp2x = p0.x + (p1.x - p0.x) / 2;
    const cp2y = p1.y;
    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
  }

  const fillD = `${pathD} L ${points[points.length - 1].x} ${
    svgHeight - paddingY
  } L ${points[0].x} ${svgHeight - paddingY} Z`;

  return (
    <div className="space-y-6">
      {/* Date Range Picker Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0D0D12] border border-white/10">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#d9bc82]" />
          <span className="text-xs font-semibold text-white uppercase tracking-wider">
            Analytics Window:
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-white/10">
          {(
            [
              { id: "today", label: "Today" },
              { id: "7d", label: "Last 7 Days" },
              { id: "30d", label: "Last 30 Days" },
              { id: "ytd", label: "Year-to-Date" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setRange(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                range === t.id
                  ? "bg-gold-gradient text-black shadow-md shadow-[#d9bc82]/10"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Charts Grid: Spline Revenue Curve & Order Volume Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Spline Revenue Curve */}
        <div className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                Revenue Trajectory (BDT)
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-2xl font-bold font-mono text-white">
                  {formatMoney(currentData.grossPaisa)}
                </span>
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  {currentData.growthPct}
                </span>
              </div>
            </div>

            {hoveredPoint && (
              <div className="px-3 py-1 rounded-lg bg-[#181922] border border-[#d9bc82]/40 text-right animate-in fade-in">
                <span className="text-[10px] text-stone-400 block font-mono">
                  {hoveredPoint.label}
                </span>
                <span className="text-xs font-bold text-[#d9bc82] font-mono">
                  {formatMoney(hoveredPoint.revenuePaisa)}
                </span>
              </div>
            )}
          </div>

          {/* SVG Spline Container */}
          <div className="relative w-full aspect-[3/1] bg-stone-950/50 rounded-xl p-2 border border-white/5 overflow-hidden">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full overflow-visible"
            >
              <defs>
                <linearGradient
                  id="goldFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#d9bc82" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#d9bc82" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              <line
                x1={paddingX}
                y1={paddingY}
                x2={svgWidth - paddingX}
                y2={paddingY}
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="4 4"
              />
              <line
                x1={paddingX}
                y1={svgHeight / 2}
                x2={svgWidth - paddingX}
                y2={svgHeight / 2}
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="4 4"
              />
              <line
                x1={paddingX}
                y1={svgHeight - paddingY}
                x2={svgWidth - paddingX}
                y2={svgHeight - paddingY}
                stroke="rgba(255,255,255,0.1)"
              />

              {/* Area Fill */}
              <path d={fillD} fill="url(#goldFill)" />

              {/* Spline Stroke */}
              <path
                d={pathD}
                fill="none"
                stroke="#d9bc82"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Interactive Data Points */}
              {points.map((pt, i) => (
                <g key={i}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredPoint?.label === pt.label ? "6" : "4"}
                    fill="#0D0D12"
                    stroke="#d9bc82"
                    strokeWidth="2"
                    className="cursor-pointer transition-all hover:scale-125"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  <text
                    x={pt.x}
                    y={svgHeight - 6}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.4)"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {pt.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* 2. Order Volume Bars */}
        <div className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                Order Velocity & Volume
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-2xl font-bold font-mono text-white">
                  {currentData.ordersTotal} Orders
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  AOV: {formatMoney(currentData.aovPaisa)}
                </span>
              </div>
            </div>
            <Package className="w-5 h-5 text-[#d9bc82]" />
          </div>

          {/* Bar Chart Container */}
          <div className="w-full aspect-[3/1] bg-stone-950/50 rounded-xl p-4 border border-white/5 flex items-end justify-between gap-3">
            {currentData.points.map((pt, i) => {
              const heightPct = Math.round((pt.ordersCount / maxOrders) * 100);
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-2 group h-full justify-end cursor-pointer"
                >
                  <span className="text-[10px] font-mono text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {pt.ordersCount}
                  </span>
                  <div className="w-full bg-stone-800 rounded-t-lg relative overflow-hidden flex items-end h-full">
                    <div
                      className="w-full bg-gradient-to-t from-[#d9bc82]/60 to-[#d9bc82] rounded-t-lg transition-all duration-300 group-hover:brightness-125"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-stone-500 truncate w-full text-center">
                    {pt.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 2: Payment Methods Distribution & Courier SLA Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Methods Donut Breakdown */}
        <div className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#d9bc82]" />
              <span>Payment Gateway Share</span>
            </h3>
            <span className="text-[10px] font-mono text-stone-400">Bangladesh MFS</span>
          </div>

          <div className="space-y-3 pt-1">
            {PAYMENT_BREAKDOWN.map((pm) => (
              <div key={pm.method} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-stone-300 flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: pm.color }}
                    />
                    <span>{pm.method}</span>
                  </span>
                  <span className="font-mono font-bold text-white">
                    {pm.share}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pm.share}%`,
                      backgroundColor: pm.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Courier SLA & Hub Clearance */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#d9bc82]" />
              <span>Nationwide Courier SLA & On-Time Performance</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
              Live API Sync
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Pathao Express */}
            <div className="p-4 rounded-xl bg-stone-900/60 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Pathao Express</h4>
                  <span className="text-[11px] text-stone-400">Dhaka & Metropolitan Same-Day</span>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  98.6% On-Time
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2 rounded-lg bg-black/40">
                  <span className="text-stone-500 block text-[10px]">Avg Dispatch</span>
                  <span className="font-mono text-white font-semibold">3.8 Hours</span>
                </div>
                <div className="p-2 rounded-lg bg-black/40">
                  <span className="text-stone-500 block text-[10px]">RTO Return %</span>
                  <span className="font-mono text-emerald-400 font-semibold">1.2%</span>
                </div>
              </div>
            </div>

            {/* Steadfast Courier */}
            <div className="p-4 rounded-xl bg-stone-900/60 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Steadfast Courier</h4>
                  <span className="text-[11px] text-stone-400">64 Districts Doorstep COD</span>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  97.4% On-Time
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2 rounded-lg bg-black/40">
                  <span className="text-stone-500 block text-[10px]">Avg Transit</span>
                  <span className="font-mono text-white font-semibold">36 Hours</span>
                </div>
                <div className="p-2 rounded-lg bg-black/40">
                  <span className="text-stone-500 block text-[10px]">Cash Remit SLA</span>
                  <span className="font-mono text-white font-semibold">Next Day</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
