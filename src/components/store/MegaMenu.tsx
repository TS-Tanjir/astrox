"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronRight, Sparkles } from "lucide-react";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

export interface MegaCategoryItem {
  id: string;
  slug: string;
  nameEn: string;
  nameBn: string;
  children?: {
    id: string;
    slug: string;
    nameEn: string;
    nameBn: string;
    children?: {
      id: string;
      slug: string;
      nameEn: string;
      nameBn: string;
    }[];
  }[];
}

export function MegaMenu({
  departments,
  isOpen,
  onClose,
}: {
  departments: MegaCategoryItem[];
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeDeptId, setActiveDeptId] = useState<string>(departments[0]?.id || "");
  const { locale } = useLocaleStore();

  if (!isOpen) return null;

  const currentDept = departments.find((d) => d.id === activeDeptId) || departments[0];

  return (
    <div
      onMouseLeave={onClose}
      className="absolute top-full left-0 w-full bg-[#0D0D12] border-b border-[#d9bc82]/20 shadow-2xl z-40 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="max-w-7xl mx-auto flex h-[480px]">
        {/* Left Side: 10 Departments List */}
        <div className="w-64 border-r border-white/10 bg-[#07070A] py-3 overflow-y-auto shrink-0">
          <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#d9bc82]/70">
            {locale === "bn" ? "বিভাগসমূহ" : "Departments"}
          </div>
          <div className="space-y-0.5 px-2">
            {departments.map((dept) => {
              const isActive = dept.id === activeDeptId;
              return (
                <button
                  key={dept.id}
                  onMouseEnter={() => setActiveDeptId(dept.id)}
                  onClick={() => setActiveDeptId(dept.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition text-left ${
                    isActive
                      ? "bg-[#181922] text-[#d9bc82] border-l-2 border-[#d9bc82]"
                      : "text-stone-300 hover:text-white hover:bg-stone-900/60"
                  }`}
                >
                  <span className="truncate">{locale === "bn" ? dept.nameBn : dept.nameEn}</span>
                  <ChevronRight className={`w-4 h-4 shrink-0 transition ${isActive ? "text-[#d9bc82]" : "opacity-30"}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: L2 & L3 Category Columns */}
        <div className="flex-1 p-8 overflow-y-auto">
          {currentDept && (
            <div>
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/5">
                <div>
                  <h3 className="text-xl font-semibold text-white tracking-wide">
                    {locale === "bn" ? currentDept.nameBn : currentDept.nameEn}
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {locale === "bn" ? "সম্পূর্ণ কালেকশন ব্রাউজ করুন" : "Explore curated subcategories"}
                  </p>
                </div>
                <Link
                  href={`/c/${currentDept.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#d9bc82] hover:text-[#fde047] transition group"
                >
                  <span>{locale === "bn" ? "সকল পণ্য দেখুন" : "View All Department"}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Subcategories Grid */}
              <div className="grid grid-cols-3 gap-8">
                {currentDept.children?.map((l2) => (
                  <div key={l2.id} className="space-y-3">
                    <Link
                      href={`/c/${l2.slug}`}
                      onClick={onClose}
                      className="text-sm font-semibold text-stone-200 hover:text-[#d9bc82] transition block border-b border-white/5 pb-1.5"
                    >
                      {locale === "bn" ? l2.nameBn : l2.nameEn}
                    </Link>
                    <ul className="space-y-2">
                      {l2.children?.map((l3) => (
                        <li key={l3.id}>
                          <Link
                            href={`/c/${l3.slug}`}
                            onClick={onClose}
                            className="text-xs text-stone-400 hover:text-white transition flex items-center gap-1.5 group"
                          >
                            <span className="w-1 h-1 rounded-full bg-stone-700 group-hover:bg-[#d9bc82] transition" />
                            <span>{locale === "bn" ? l3.nameBn : l3.nameEn}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Feature Card with Astrox Arch Frame */}
        <div className="w-72 p-6 border-l border-white/5 bg-[#0A0A0F] hidden lg:flex flex-col justify-between shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#d9bc82]/15 text-[#d9bc82] text-[11px] font-semibold mb-3">
              <Sparkles className="w-3 h-3" />
              <span>{locale === "bn" ? "অ্যাস্ট্রক্স সিগনেচার" : "Astrox Signature"}</span>
            </div>
            <h4 className="text-sm font-semibold text-white">
              {locale === "bn" ? "রয়্যাল অ্যারাইভাল ২০২৬" : "The Royal 2026 Drops"}
            </h4>
            <p className="text-xs text-stone-400 mt-1">
              {locale === "bn"
                ? "খাঁটি সিল্ক ও ঢাকাই জামদানি উইভিং। সমগ্র বাংলাদেশে ফ্রি ডেলিভারি।"
                : "Handcrafted luxury tailored for timeless modern majesty."}
            </p>
          </div>

          <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-white/10 group mt-4">
            <Image
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80"
              alt="Astrox Signature Feature"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
              <Link
                href="/c/women"
                onClick={onClose}
                className="w-full py-2 px-3 rounded-lg bg-black/60 backdrop-blur-md border border-[#d9bc82]/30 text-white text-xs font-semibold text-center hover:bg-[#d9bc82] hover:text-black transition"
              >
                {locale === "bn" ? "এক্সপ্লোর করুন" : "Explore Edit"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
