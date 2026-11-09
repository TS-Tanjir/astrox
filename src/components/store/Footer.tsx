"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import { ShieldCheck, Truck, RotateCcw, Award, Sparkles, Send } from "lucide-react";

export function Footer() {
  const { locale } = useLocaleStore();

  return (
    <footer className="bg-[#050508] border-t border-white/10 text-stone-400 mt-20">
      {/* 1. Value Proposition Pillars */}
      <div className="border-b border-white/5 py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-stone-900 border border-white/5 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-[#d9bc82]" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                {locale === "bn" ? "এক্সপ্রেস ডেলিভারি" : "Express Delivery"}
              </h4>
              <p className="text-xs text-stone-400 mt-1">
                {locale === "bn" ? "২৪-৪৮ ঘণ্টার মধ্যে সমগ্র বাংলাদেশে" : "24–48h courier coverage across all 64 districts"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-stone-900 border border-white/5 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#d9bc82]" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                {locale === "bn" ? "ক্যাশ অন ডেলিভারি" : "Cash on Delivery"}
              </h4>
              <p className="text-xs text-stone-400 mt-1">
                {locale === "bn" ? "পণ্য হাতে পেয়ে মূল্য পরিশোধের সুবিধা" : "Inspect your parcel upon arrival anywhere in BD"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-stone-900 border border-white/5 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5 text-[#d9bc82]" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                {locale === "bn" ? "সহজ ৭ দিনের এক্সচেঞ্জ" : "7-Day Exchange"}
              </h4>
              <p className="text-xs text-stone-400 mt-1">
                {locale === "bn" ? "কোনোরূপ ঝামেলা ছাড়াই সাইজ বদল" : "Hassle-free size replacement & returns"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-stone-900 border border-white/5 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-[#d9bc82]" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                {locale === "bn" ? "১০০% আসল প্রোডাক্ট" : "Authentic Craft"}
              </h4>
              <p className="text-xs text-stone-400 mt-1">
                {locale === "bn" ? "খাঁটি তাঁত ও অফিসিয়াল টেক ওয়ারেন্টি" : "Sonargaon hand-looms & verified tech"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Links */}
      <div className="py-16 px-4 md:px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12">
        {/* Brand Column */}
        <div className="md:col-span-2 space-y-4">
          <BrandLogo size="lg" />
          <p className="text-xs text-stone-400 max-w-sm leading-relaxed mt-2">
            {locale === "bn"
              ? "অ্যাস্ট্রক্স — আভিজাত্যের আধুনিক রূপান্তর। ঐতিহ্যবাহী ঢাকাই মসলিন শাড়ি, রাজকীয় জ্যাকার্ড পাঞ্জাবি, কোরিয়ান স্কিনকেয়ার ও প্রিমিয়াম অ্যাকোস্টিক অডিও।"
              : "Astrox represents astral sovereignty and timeless Bengali craftsmanship. Curating hand-loomed heritage, modern festive attire, verified K-Beauty, and precision audio acoustics."}
          </p>

          <div className="pt-2">
            <div className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#d9bc82]" />
              <span>{locale === "bn" ? "অ্যাস্ট্রক্স ইনসাইডার প্রিভিলেজ" : "Astrox Insider Privilege"}</span>
            </div>
            <div className="flex gap-2 max-w-sm">
              <input
                type="email"
                placeholder={locale === "bn" ? "আপনার ইমেইল দিন..." : "Enter your email for private drops..."}
                className="flex-1 px-3 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d9bc82]"
              />
              <button className="px-4 py-2.5 rounded-xl bg-gold-gradient text-black font-semibold text-xs tracking-wider uppercase hover:opacity-95 transition flex items-center gap-1.5">
                <span>Join</span>
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Collections */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#d9bc82]">
            {locale === "bn" ? "বিশেষ কালেকশন" : "Signature Edits"}
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/collections/winter-edit" className="hover:text-white transition">
                The Winter Edit 2026
              </Link>
            </li>
            <li>
              <Link href="/collections/eid-festive" className="hover:text-white transition">
                Royal Eid Festive Preview
              </Link>
            </li>
            <li>
              <Link href="/collections/k-beauty-sanctuary" className="hover:text-white transition">
                Seoul Glow: K-Beauty
              </Link>
            </li>
            <li>
              <Link href="/collections/astral-audio" className="hover:text-white transition">
                Precision ANC Audio
              </Link>
            </li>
            <li>
              <Link href="/collections/gift-to-bangladesh" className="hover:text-white transition">
                Gift to Bangladesh (Expatriates)
              </Link>
            </li>
          </ul>
        </div>

        {/* Departments */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#d9bc82]">
            {locale === "bn" ? "জনপ্রিয় বিভাগ" : "Departments"}
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/c/women" className="hover:text-white transition">
                Women&apos;s Festive & Muslin
              </Link>
            </li>
            <li>
              <Link href="/c/men" className="hover:text-white transition">
                Men&apos;s Royal Panjabi & Kabli
              </Link>
            </li>
            <li>
              <Link href="/c/audio-electronics" className="hover:text-white transition">
                TWS Earbuds & Laptops
              </Link>
            </li>
            <li>
              <Link href="/c/phones-wearables" className="hover:text-white transition">
                AMOLED Calling Smartwatches
              </Link>
            </li>
            <li>
              <Link href="/c/beauty-fragrance" className="hover:text-white transition">
                Fragrance & Dehn Al Oud
              </Link>
            </li>
            <li>
              <Link href="/c/bags-watches-jewellery" className="hover:text-white transition">
                Full-Grain Leather Briefcases
              </Link>
            </li>
          </ul>
        </div>

        {/* Client Concierge & Support */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#d9bc82]">
            {locale === "bn" ? "গ্রাহক সেবা" : "Client Concierge"}
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/track" className="hover:text-white transition">
                {locale === "bn" ? "অর্ডার ট্র্যাকিং" : "Track Your Order"}
              </Link>
            </li>
            <li>
              <span className="text-stone-300">Hotline: +880 1700-000001</span>
            </li>
            <li>
              <span className="text-stone-300">Email: concierge@astrox.com</span>
            </li>
            <li>
              <span className="text-stone-400">Gulshan-2, Dhaka 1212, Bangladesh</span>
            </li>
            <li className="pt-2">
              <Link
                href="/studio"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 border border-white/10 text-stone-300 hover:text-[#d9bc82] hover:border-[#d9bc82]/40 transition text-xs font-medium"
              >
                <span>Astrox Studio Admin</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* 3. Bottom Bar: Logistics, Payments, Copyright */}
      <div className="border-t border-white/5 py-6 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            © 2026 Astrox Luxe Ltd. All Rights Reserved. Engineered with Astral Precision for Bangladesh.
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-stone-900 text-stone-400 border border-white/5">
              Cash on Delivery (COD)
            </span>
            <span className="px-2 py-0.5 rounded bg-stone-900 text-stone-400 border border-white/5">
              bKash / Nagad
            </span>
            <span className="px-2 py-0.5 rounded bg-stone-900 text-stone-400 border border-white/5">
              Pathao / Steadfast
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
