"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingBag,
  Heart,
  Grid,
  Truck,
  Globe,
  Sliders,
  PhoneCall,
  Film,
  Bell,
  User,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useCartStore } from "@/lib/store/useCartStore";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { SearchCommand } from "./SearchCommand";
import { MegaMenu, MegaCategoryItem } from "./MegaMenu";
import { ReelsModal } from "./ReelsModal";
import { AccountDrawer } from "./AccountDrawer";
import { NotificationsDrawer } from "./NotificationsDrawer";

export function Header({ departments }: { departments: MegaCategoryItem[] }) {
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [reelsOpen, setReelsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { openCart, items } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { locale, toggleLocale } = useLocaleStore();

  const totalCartCount = items.reduce((acc, i) => acc + i.qty, 0);

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* 1. Top Concierge & Language Bar */}
      <div className="bg-[#050508] border-b border-white/5 py-1.5 px-4 md:px-8 text-[11px] font-medium text-stone-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-stone-300">
              <PhoneCall className="w-3 h-3 text-[#d9bc82]" />
              <span>{locale === "bn" ? "কনসিয়ার্জ সাপোর্ট:" : "Concierge Hotline:"}</span>
              <span className="text-[#d9bc82] font-mono">+880 1700-000001</span>
            </span>
            <span className="hidden md:inline text-stone-600">|</span>
            <span className="hidden md:inline text-stone-400">
              {locale === "bn" ? "সমগ্র বাংলাদেশে ফ্রি এক্সপ্রেস ডেলিভারি (৳২৫০০+ অর্ডারে)" : "Complimentary Express Delivery on orders over ৳2,500"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/track"
              className="flex items-center gap-1 hover:text-[#d9bc82] transition"
            >
              <Truck className="w-3.5 h-3.5 text-[#d9bc82]" />
              <span>{locale === "bn" ? "পার্সেল ট্র্যাক করুন" : "Track Parcel"}</span>
            </Link>

            <span className="text-stone-600">|</span>

            {/* Language Switcher */}
            <button
              onClick={toggleLocale}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-white/10 hover:border-[#d9bc82]/40 text-stone-300 hover:text-white transition"
              title="Toggle English / বাংলা"
            >
              <Globe className="w-3 h-3 text-[#d9bc82]" />
              <span className="font-semibold text-xs tracking-wider">{locale === "en" ? "বাংলা" : "ENGLISH"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Glass Header */}
      <div className="glass-panel border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between gap-4 md:gap-8">
          {/* Logo & Mega Menu Button */}
          <div className="flex items-center gap-6">
            <BrandLogo size="md" />

            <button
              onMouseEnter={() => setMegaOpen(true)}
              onClick={() => setMegaOpen(!megaOpen)}
              className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900/80 border border-white/10 hover:border-[#d9bc82]/40 text-stone-200 text-xs font-semibold uppercase tracking-wider transition group"
            >
              <Grid className="w-3.5 h-3.5 text-[#d9bc82] group-hover:rotate-90 transition-transform duration-300" />
              <span>{locale === "bn" ? "সকল বিভাগ" : "Departments"}</span>
            </button>

            {/* Runway / Reels Live Pill */}
            <button
              onClick={() => setReelsOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-stone-900 via-[#1c1813] to-stone-900 border border-[#d9bc82]/40 hover:border-[#d9bc82] text-xs font-semibold text-white transition group shadow-sm"
              title="Astrox Live Runway Reels"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <Film className="w-3.5 h-3.5 text-[#d9bc82]" />
              <span className="tracking-wide">{locale === "bn" ? "রানওয়ে রিলস" : "Runway Reels"}</span>
            </button>
          </div>

          {/* 3. Instant Search Input (Desktop) */}
          <div className="flex-1 max-w-xl hidden md:block">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-stone-900/80 border border-white/10 hover:border-[#d9bc82]/40 text-stone-400 text-xs transition group"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-stone-400 group-hover:text-[#d9bc82] transition" />
                <span className="group-hover:text-stone-300 transition">
                  {locale === "bn"
                    ? "শাড়ি, পাঞ্জাবি, এএনসি ইয়ারবাডস বা কে-বিউটি খুঁজুন..."
                    : "Search sarees, panjabi, K-beauty, ANC earbuds..."}
                </span>
              </div>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-stone-400 bg-black/40 border border-white/10 rounded">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* 4. Action Icons: Search (mobile), Wishlist, Cart, Studio */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 md:hidden transition"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2.5 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 transition"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 text-stone-300" />
              {wishlistItems.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 text-[10px] font-bold rounded-full bg-[#d9bc82] text-black flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Notifications Trigger */}
            <button
              onClick={() => setNotificationsOpen(true)}
              className="relative p-2.5 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 transition"
              aria-label="Notifications"
              title="Astrox Drops & Updates"
            >
              <Bell className="w-5 h-5 text-stone-300" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-[#0A0A0E]" />
            </button>

            {/* Account & Sovereign Club Trigger */}
            <button
              onClick={() => setAccountOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 border border-white/5 hover:border-[#d9bc82]/30 transition group"
              aria-label="VIP Account & Concierge"
              title="Astrox Sovereign Club & Concierge"
            >
              <User className="w-4 h-4 text-[#d9bc82] group-hover:scale-105 transition-transform" />
              <span className="text-xs font-semibold text-stone-200">Sovereign</span>
            </button>

            {/* Shopping Bag Trigger */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900 border border-[#d9bc82]/30 hover:border-[#d9bc82] transition group"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5 text-[#d9bc82] group-hover:scale-105 transition-transform" />
              <span className="hidden sm:inline text-xs font-semibold text-white tracking-wide">
                {locale === "bn" ? "ব্যাগ" : "Bag"}
              </span>
              {totalCartCount > 0 && (
                <span className="px-1.5 py-0.5 text-[11px] font-mono font-bold rounded-full bg-gold-gradient text-black">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Astrox Studio Shortcut */}
            <Link
              href="/studio"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#181922] border border-white/10 hover:border-[#d9bc82]/40 text-stone-300 hover:text-[#d9bc82] text-xs font-medium transition"
              title="Astrox Studio Management"
            >
              <Sliders className="w-3.5 h-3.5 text-[#d9bc82]" />
              <span>Studio</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Constellation Mega Menu Dropdown */}
      <MegaMenu
        departments={departments}
        isOpen={megaOpen}
        onClose={() => setMegaOpen(false)}
      />

      {/* ⌘K Command Palette Modal */}
      <SearchCommand isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Runway / Shoppable Reels Modal */}
      <ReelsModal isOpen={reelsOpen} onClose={() => setReelsOpen(false)} />

      {/* Sovereign Club & Live Concierge Drawer */}
      <AccountDrawer isOpen={accountOpen} onClose={() => setAccountOpen(false)} />

      {/* Real-time Order & Privilege Notifications Drawer */}
      <NotificationsDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </header>
  );
}
