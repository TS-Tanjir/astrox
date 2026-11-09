"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Sparkles, ArrowRight } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

interface SearchResultProduct {
  id: string;
  code: string;
  slug: string;
  nameEn: string;
  nameBn: string;
  basePrice: number;
  images: { url: string }[];
  category: { nameEn: string; nameBn: string };
}

interface SearchResultCategory {
  id: string;
  slug: string;
  nameEn: string;
  nameBn: string;
}

export function SearchCommand({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ products: SearchResultProduct[]; categories: SearchResultCategory[] }>({
    products: [],
    categories: [],
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const { locale } = useLocaleStore();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults({ products: [], categories: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ products: [], categories: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-28 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0D0D12] border border-[#d9bc82]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-[#12131A]">
          <Search className="w-5 h-5 text-[#d9bc82] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={locale === "bn" ? "শাড়ি, পাঞ্জাবি, এএনসি ইয়ারবাডস বা কে-বিউটি খুঁজুন..." : "Search fine sarees, festive panjabis, ANC earbuds, K-beauty..."}
            className="w-full bg-transparent text-white placeholder-stone-500 focus:outline-none text-base font-medium"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-stone-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs px-2.5 py-1 rounded bg-stone-800 text-stone-300 hover:bg-stone-700 transition"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-stone-400 text-sm">
              <div className="w-6 h-6 border-2 border-[#d9bc82] border-t-transparent rounded-full animate-spin" />
              <span>Scanning Astral Luxe archives...</span>
            </div>
          )}

          {!loading && query && results.products.length === 0 && results.categories.length === 0 && (
            <div className="py-12 text-center text-stone-400">
              <Sparkles className="w-8 h-8 text-[#d9bc82]/40 mx-auto mb-2" />
              <p className="font-medium text-stone-300">No archival matches found</p>
              <p className="text-xs text-stone-500 mt-1">Try searching for &quot;Panjabi&quot;, &quot;Muslin&quot;, &quot;Earbuds&quot;, or &quot;Snail&quot;</p>
            </div>
          )}

          {/* Quick Categories */}
          {results.categories.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#d9bc82] mb-2 px-2">
                Departments & Categories
              </div>
              <div className="flex flex-wrap gap-2">
                {results.categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/c/${c.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-900 border border-white/5 hover:border-[#d9bc82]/50 text-sm text-stone-200 transition group"
                  >
                    <span>{locale === "bn" ? c.nameBn : c.nameEn}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#d9bc82] opacity-60 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Matched Products */}
          {results.products.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#d9bc82] mb-2 px-2">
                Curated Products
              </div>
              <div className="grid gap-2">
                {results.products.map((p) => (
                  <Link
                    key={p.id}
                    href={`/p/${p.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-900/60 border border-white/5 hover:border-[#d9bc82]/40 hover:bg-stone-900 transition group"
                  >
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-stone-950">
                      <Image
                        src={p.images[0]?.url || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200"}
                        alt={p.nameEn}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-[#d9bc82] font-mono tracking-tight">{p.code}</div>
                      <div className="text-sm font-medium text-white truncate group-hover:text-[#d9bc82] transition-colors">
                        {locale === "bn" ? p.nameBn : p.nameEn}
                      </div>
                      <div className="text-xs text-stone-400">
                        {locale === "bn" ? p.category.nameBn : p.category.nameEn}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold text-white">
                        {formatMoney(p.basePrice, locale)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Default suggestion chips when empty */}
          {!query && (
            <div className="py-6 px-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
                Trending Searches in Bangladesh
              </div>
              <div className="flex flex-wrap gap-2">
                {["Dhakai Muslin", "Jacquard Panjabi", "ANC Earbuds", "K-Beauty Serum", "Cashmere Shawl", "Executive Kabli", "Leather Briefcase"].map(
                  (term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-3 py-1.5 rounded-full bg-stone-900 border border-white/5 hover:border-[#d9bc82]/40 text-xs text-stone-300 transition"
                    >
                      {term}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
