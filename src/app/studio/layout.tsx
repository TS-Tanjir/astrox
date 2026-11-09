import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Image as ImageIcon,
  FolderTree,
  Settings,
  History,
  ExternalLink,
  ShieldCheck,
  Tag,
  Star,
  Crown,
  Clock,
} from "lucide-react";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#07070A] text-[#F4F1EA] flex">
      {/* 1. Studio Sidebar */}
      <aside className="w-64 bg-[#0D0D12] border-r border-white/10 flex flex-col justify-between shrink-0 hidden md:flex">
        <div className="p-6 space-y-8">
          <div className="space-y-1">
            <BrandLogo size="md" />
            <div className="flex items-center gap-2 pt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#d9bc82]">
                Studio Engine v1.0
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-medium">
            <Link
              href="/studio"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-stone-200 hover:text-white hover:bg-stone-800/60 transition group"
            >
              <LayoutDashboard className="w-4 h-4 text-[#d9bc82]" />
              <span>Overview Analytics</span>
            </Link>

            <Link
              href="/studio/catalog"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-stone-200 hover:text-white hover:bg-stone-800/60 transition group"
            >
              <Package className="w-4 h-4 text-[#d9bc82]" />
              <span>Catalog & Inventory</span>
            </Link>

            <Link
              href="/studio/orders"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-stone-200 hover:text-white hover:bg-stone-800/60 transition group"
            >
              <ShoppingBag className="w-4 h-4 text-[#d9bc82]" />
              <span>Orders & Fulfillment</span>
            </Link>

            <Link
              href="/studio/banners"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-stone-200 hover:text-white hover:bg-stone-800/60 transition group"
            >
              <ImageIcon className="w-4 h-4 text-[#d9bc82]" />
              <span>Hero Campaigns</span>
            </Link>

            <Link
              href="/studio/promotions"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-stone-200 hover:text-white hover:bg-stone-800/60 transition group"
            >
              <Tag className="w-4 h-4 text-[#d9bc82]" />
              <span>Promotions & Coupons</span>
            </Link>

            <Link
              href="/studio/reviews"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-stone-200 hover:text-white hover:bg-stone-800/60 transition group"
            >
              <Star className="w-4 h-4 text-[#d9bc82]" />
              <span>Verified Reviews</span>
            </Link>

            <Link
              href="/studio/loyalty"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-stone-200 hover:text-white hover:bg-stone-800/60 transition group"
            >
              <Crown className="w-4 h-4 text-[#d9bc82]" />
              <span>Astrox Stars Loyalty</span>
            </Link>

            <Link
              href="/studio/abandoned"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-stone-200 hover:text-white hover:bg-stone-800/60 transition group"
            >
              <Clock className="w-4 h-4 text-[#d9bc82]" />
              <span>Abandoned Bags</span>
            </Link>

            <Link
              href="/studio/activity"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-stone-200 hover:text-white hover:bg-stone-800/60 transition group"
            >
              <History className="w-4 h-4 text-[#d9bc82]" />
              <span>Audit Activity Log</span>
            </Link>
          </nav>
        </div>

        {/* User Card & Storefront link */}
        <div className="p-4 m-4 rounded-2xl bg-stone-900/60 border border-white/5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#d9bc82]/20 border border-[#d9bc82]/40 text-[#d9bc82] flex items-center justify-center font-bold text-xs">
              TR
            </div>
            <div className="flex-1 min-w-0 text-xs">
              <div className="font-semibold text-white truncate">Tanjir Rahman</div>
              <div className="text-[10px] font-mono text-[#d9bc82]">ROLE: OWNER</div>
            </div>
          </div>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition"
          >
            <span>Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>

      {/* 2. Main Studio Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 px-6 bg-[#0D0D12] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-stone-400">Environment:</span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
              LOCAL POSTGRES 17 (ONLINE)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-[#d9bc82] hover:underline flex items-center gap-1.5"
            >
              <span>Back to Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
