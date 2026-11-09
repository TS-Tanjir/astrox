"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { Plus, Search, Sparkles, Check, AlertCircle, Download, Upload } from "lucide-react";
import toast from "react-hot-toast";

export function CatalogClient({ initialProducts, categories }: { initialProducts: any[]; categories: any[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // New product form states
  const [nameEn, setNameEn] = useState("");
  const [nameBn, setNameBn] = useState("");
  const [code, setCode] = useState(`AX-${Math.floor(100000 + Math.random() * 900000)}`);
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [priceBdt, setPriceBdt] = useState("");
  const [stock, setStock] = useState("20");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000");
  const [submitting, setSubmitting] = useState(false);

  const filtered = products.filter((p) =>
    p.nameEn.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpdateStock = async (variantId: string, newStock: number) => {
    try {
      const res = await fetch("/api/studio/stock", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, stock: newStock }),
      });
      if (!res.ok) throw new Error("Stock update failed");
      toast.success("Variant stock updated!");
    } catch {
      toast.error("Failed to update stock");
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() || !priceBdt) {
      toast.error("Please fill in product name and price");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/studio/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameEn,
          nameBn: nameBn || nameEn,
          code,
          categoryId,
          basePrice: Math.round(parseFloat(priceBdt) * 100),
          stock: parseInt(stock, 10) || 10,
          imageUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setProducts([data.product, ...products]);
      setShowAddModal(false);
      setNameEn("");
      setNameBn("");
      setPriceBdt("");
      toast.success("Product created successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Catalog & Variant Inventory</h1>
          <p className="text-xs text-stone-400 mt-0.5">Track multi-variant stock levels, prices, and archival status.</p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/studio/export/products"
            className="px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 hover:border-[#d9bc82] text-xs font-semibold text-stone-200 flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4 text-[#d9bc82]" />
            <span>Export CSV</span>
          </a>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gold-gradient text-black font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5 shadow-lg shadow-[#d9bc82]/10 hover:opacity-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Product Release</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-stone-900 border border-white/10 max-w-md">
        <Search className="w-4 h-4 text-stone-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by product title or code..."
          className="w-full bg-transparent text-xs text-white placeholder-stone-500 focus:outline-none"
        />
      </div>

      {/* Products Table */}
      <div className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-stone-400 font-mono">
                <th className="py-3 px-3">Item</th>
                <th className="py-3 px-3">Code</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Base Price</th>
                <th className="py-3 px-3">Variants & Stock</th>
                <th className="py-3 px-3 text-right">Storefront</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-stone-200">
              {filtered.map((prod) => {
                const totalStock = prod.variants?.reduce((acc: number, v: any) => acc + v.stock, 0) || 0;

                return (
                  <tr key={prod.id} className="hover:bg-stone-900/40 transition">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-14 rounded-lg overflow-hidden shrink-0 bg-stone-950 border border-white/5">
                          <Image src={prod.images[0]?.url || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200"} alt="" fill className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-white truncate max-w-xs">{prod.nameEn}</div>
                          <div className="text-[11px] text-stone-400">{prod.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-[#d9bc82]">{prod.code}</td>
                    <td className="py-3.5 px-3 text-stone-300">{prod.category?.nameEn}</td>
                    <td className="py-3.5 px-3 font-mono font-bold text-white">{formatMoney(prod.basePrice)}</td>
                    <td className="py-3.5 px-3">
                      <div className="space-y-1">
                        <span className="font-mono text-xs font-semibold text-white">{totalStock} total units</span>
                        <div className="flex flex-wrap gap-1">
                          {prod.variants?.map((v: any) => (
                            <span
                              key={v.id}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                                v.stock <= 5 ? "bg-amber-950/80 text-amber-300 border-amber-800" : "bg-stone-900 text-stone-300 border-white/5"
                              }`}
                            >
                              {[v.option1, v.option2].filter(Boolean).join("/")}: {v.stock}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <Link
                        href={`/p/${prod.slug}`}
                        target="_blank"
                        className="text-xs text-[#d9bc82] hover:underline"
                      >
                        View Live ↗
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form
            onSubmit={handleCreateProduct}
            className="w-full max-w-lg bg-[#0D0D12] border border-[#d9bc82]/40 rounded-3xl p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#d9bc82]" />
                <span>Create New Astrox Product</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-stone-300 font-medium">Product Name (English) *</label>
                <input
                  type="text"
                  required
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. Royal Silk Jacquard Panjabi"
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-300 font-medium">Product Name (Bengali)</label>
                <input
                  type="text"
                  value={nameBn}
                  onChange={(e) => setNameBn(e.target.value)}
                  placeholder="e.g. রাজকীয় সিল্ক জ্যাকার্ড পাঞ্জাবি"
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-stone-300 font-medium">Code (SKU prefix)</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-stone-300 font-medium">Price (BDT) *</label>
                  <input
                    type="number"
                    required
                    value={priceBdt}
                    onChange={(e) => setPriceBdt(e.target.value)}
                    placeholder="6500"
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-stone-300 font-medium">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-stone-300 font-medium">Initial Stock</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-stone-300 font-medium">Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-gold-gradient text-black font-semibold text-xs tracking-wider uppercase disabled:opacity-50"
              >
                {submitting ? "Publishing..." : "Publish Product"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
