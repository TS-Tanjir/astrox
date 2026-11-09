"use client";

import Link from "next/link";
import { Sparkles, User, Smartphone, Headphones, Flame, Watch, Home, Smile, Activity, Gift } from "lucide-react";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  User,
  Smartphone,
  Headphones,
  Flame,
  Watch,
  Home,
  Smile,
  Activity,
  Gift,
};

interface DeptItem {
  id: string;
  slug: string;
  nameEn: string;
  nameBn: string;
  iconName?: string | null;
}

export function DepartmentStrip({ departments }: { departments: DeptItem[] }) {
  const { locale } = useLocaleStore();

  return (
    <section id="department-grid" className="py-12 px-4 md:px-8 max-w-7xl mx-auto scroll-mt-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#d9bc82]">
            {locale === "bn" ? "এক্সক্লুসিভ ক্যাটাগরি" : "Curated Taxonomy"}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            {locale === "bn" ? "১০ টি সিগনেচার বিভাগ" : "Explore 10 Signature Departments"}
          </h2>
        </div>
        <Link
          href="/c/women"
          className="text-xs font-semibold text-[#d9bc82] hover:underline"
        >
          {locale === "bn" ? "সকল পণ্য →" : "All Collections →"}
        </Link>
      </div>

      {/* Grid of 10 Departments */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
        {departments.map((dept) => {
          const IconComponent = (dept.iconName && ICON_MAP[dept.iconName]) || Sparkles;

          return (
            <Link
              key={dept.id}
              href={`/c/${dept.slug}`}
              className="group p-4 rounded-2xl bg-[#0D0D12] border border-white/5 hover:border-[#d9bc82]/40 hover:bg-[#12131A] transition-all duration-300 flex flex-col items-center text-center space-y-2.5 shadow-sm hover:shadow-xl"
            >
              <div className="w-12 h-12 rounded-xl bg-stone-900 border border-white/5 flex items-center justify-center text-[#d9bc82] group-hover:scale-110 group-hover:bg-[#d9bc82]/10 transition-all duration-300">
                <IconComponent className="w-6 h-6" />
              </div>
              <h3 className="text-xs font-semibold text-stone-200 group-hover:text-white transition line-clamp-1">
                {locale === "bn" ? dept.nameBn : dept.nameEn}
              </h3>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
