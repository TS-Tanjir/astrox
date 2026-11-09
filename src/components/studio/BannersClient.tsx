"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Sparkles, Check, Eye, Monitor, Smartphone, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export function BannersClient({ initialBanners }: { initialBanners: any[] }) {
  const [banners, setBanners] = useState(initialBanners);
  const [selectedPreviewBanner, setSelectedPreviewBanner] = useState(
    initialBanners[0] || null
  );
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "mobile">(
    "desktop"
  );
  const [showAdd, setShowAdd] = useState(false);

  const [titleEn, setTitleEn] = useState("");
  const [subtitleEn, setSubtitleEn] = useState("");
  const [tagEn, setTagEn] = useState("SEASONAL LUXE");
  const [ctaLabelEn, setCtaLabelEn] = useState("Explore Drop");
  const [ctaTarget, setCtaTarget] = useState("winter-edit");
  const [desktopUrl, setDesktopUrl] = useState("https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1920");
  const [submitting, setSubmitting] = useState(false);

  const handleToggle = async (id: string, current: boolean) => {
    try {
      const res = await fetch("/api/studio/banners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !current }),
      });
      if (!res.ok) throw new Error("Toggle failed");
      setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, isActive: !current } : b)));
      toast.success("Campaign visibility updated");
    } catch {
      toast.error("Failed to update banner status");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn.trim() || !desktopUrl) {
      toast.error("Please provide title and desktop banner image URL");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/studio/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleEn,
          titleBn: titleEn,
          subtitleEn,
          subtitleBn: subtitleEn,
          tagEn,
          tagBn: tagEn,
          ctaLabelEn,
          ctaLabelBn: ctaLabelEn,
          ctaType: "COLLECTION",
          ctaTarget,
          desktopUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setBanners([...banners, data.banner]);
      setShowAdd(false);
      setTitleEn("");
      setSubtitleEn("");
      toast.success("New hero campaign launched!");
    } catch (err: any) {
      toast.error(err.message || "Failed to create campaign banner");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Hero Campaign Banners</h1>
          <p className="text-xs text-stone-400 mt-0.5">Control homepage billboard carousels, CTA links, and seasonal schedules.</p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2.5 rounded-xl bg-gold-gradient text-black font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5 shadow-lg shadow-[#d9bc82]/10 hover:opacity-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Hero Campaign</span>
        </button>
      </div>

      {/* Live Viewport Simulator (Desktop vs Mobile Frame) */}
      {selectedPreviewBanner && (
        <div className="p-6 rounded-2xl bg-[#0D0D12] border border-[#d9bc82]/30 space-y-4 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#d9bc82]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Live Storefront Billboard Simulator
              </h3>
              <span className="text-xs text-stone-400 font-mono">
                — {selectedPreviewBanner.titleEn}
              </span>
            </div>

            {/* Viewport Toggles */}
            <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setPreviewViewport("desktop")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  previewViewport === "desktop"
                    ? "bg-gold-gradient text-black"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop (16:9)</span>
              </button>
              <button
                onClick={() => setPreviewViewport("mobile")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  previewViewport === "mobile"
                    ? "bg-gold-gradient text-black"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile (Phone Frame)</span>
              </button>
            </div>
          </div>

          {/* Simulator Canvas */}
          <div className="flex justify-center items-center py-4 bg-stone-950/80 rounded-2xl border border-white/5 overflow-hidden">
            {previewViewport === "desktop" ? (
              /* Desktop Viewport Preview */
              <div className="w-full max-w-4xl relative aspect-[21/9] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <Image
                  src={selectedPreviewBanner.desktopUrl}
                  alt={selectedPreviewBanner.titleEn}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
                <div className="absolute inset-0 p-8 flex flex-col justify-center max-w-md space-y-3">
                  <span className="px-2.5 py-1 rounded bg-[#d9bc82]/20 border border-[#d9bc82]/40 text-[#d9bc82] text-[10px] font-bold font-mono tracking-widest uppercase w-fit">
                    {selectedPreviewBanner.tagEn}
                  </span>
                  <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">
                    {selectedPreviewBanner.titleEn}
                  </h2>
                  <p className="text-xs text-stone-300 line-clamp-2">
                    {selectedPreviewBanner.subtitleEn}
                  </p>
                  <div className="pt-2">
                    <span className="px-4 py-2 rounded-xl bg-gold-gradient text-black font-semibold text-xs inline-flex items-center gap-1.5 shadow-lg">
                      <span>{selectedPreviewBanner.ctaLabelEn || "Explore Collection"}</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Mobile Phone Frame Preview */
              <div className="w-[300px] h-[520px] rounded-[36px] border-4 border-stone-700 bg-black relative overflow-hidden shadow-2xl flex flex-col justify-between">
                {/* Dynamic Island / Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-stone-900 rounded-full z-20 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-950 mr-4" />
                </div>

                {/* Banner background on phone */}
                <div className="relative w-full h-full">
                  <Image
                    src={selectedPreviewBanner.desktopUrl}
                    alt={selectedPreviewBanner.titleEn}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                  {/* Phone Content Overlay */}
                  <div className="absolute bottom-6 left-4 right-4 space-y-2 z-10">
                    <span className="px-2 py-0.5 rounded bg-[#d9bc82]/20 border border-[#d9bc82]/40 text-[#d9bc82] text-[9px] font-bold font-mono uppercase">
                      {selectedPreviewBanner.tagEn}
                    </span>
                    <h3 className="text-lg font-bold text-white leading-tight">
                      {selectedPreviewBanner.titleEn}
                    </h3>
                    <p className="text-[11px] text-stone-300 line-clamp-2">
                      {selectedPreviewBanner.subtitleEn}
                    </p>
                    <button className="w-full py-2.5 rounded-xl bg-gold-gradient text-black font-semibold text-xs tracking-wider uppercase mt-2">
                      {selectedPreviewBanner.ctaLabelEn || "Shop Drop"}
                    </button>
                  </div>
                </div>

                {/* Home Indicator bar */}
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/40 rounded-full z-20" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grid of Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((b) => (
          <div
            key={b.id}
            className="rounded-2xl bg-[#0D0D12] border border-white/10 overflow-hidden flex flex-col justify-between shadow-xl"
          >
            <div className="relative aspect-[16/9] w-full bg-stone-950">
              <Image src={b.desktopUrl} alt={b.titleEn} fill className="object-cover" />
              <div className="absolute top-3 right-3 flex gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    b.isActive
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      : "bg-stone-800 text-stone-400 border border-white/10"
                  }`}
                >
                  {b.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
              <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-black/75 text-[#d9bc82]">
                CTA: {b.ctaTarget}
              </div>
            </div>

            <div className="p-5 space-y-3">
              <div>
                <span className="text-[10px] font-mono text-[#d9bc82] uppercase">{b.tagEn}</span>
                <h3 className="text-base font-bold text-white truncate mt-0.5">{b.titleEn}</h3>
                <p className="text-xs text-stone-400 line-clamp-2 mt-1">{b.subtitleEn}</p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={() => setSelectedPreviewBanner(b)}
                  className="flex items-center gap-1.5 text-xs text-[#d9bc82] hover:underline"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Simulator</span>
                </button>

                <button
                  onClick={() => handleToggle(b.id, b.isActive)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    b.isActive
                      ? "bg-stone-800 text-stone-300 hover:bg-stone-700"
                      : "bg-emerald-900/60 text-emerald-300 border border-emerald-700"
                  }`}
                >
                  {b.isActive ? "Pause Campaign" : "Activate Campaign"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-lg bg-[#0D0D12] border border-[#d9bc82]/40 rounded-3xl p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#d9bc82]" />
                <span>Launch Campaign Banner</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-stone-300 font-medium">Headline Title *</label>
                <input
                  type="text"
                  required
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="e.g. Royal Festive Collection"
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-300 font-medium">Subtitle Description</label>
                <input
                  type="text"
                  value={subtitleEn}
                  onChange={(e) => setSubtitleEn(e.target.value)}
                  placeholder="e.g. Discover hand-loomed sarees and royal garments."
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-stone-300 font-medium">Tag Pill</label>
                  <input
                    type="text"
                    value={tagEn}
                    onChange={(e) => setTagEn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-stone-300 font-medium">CTA Button Label</label>
                  <input
                    type="text"
                    value={ctaLabelEn}
                    onChange={(e) => setCtaLabelEn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-stone-300 font-medium">Desktop Image URL *</label>
                <input
                  type="url"
                  required
                  value={desktopUrl}
                  onChange={(e) => setDesktopUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-white font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-gold-gradient text-black font-semibold text-xs tracking-wider uppercase disabled:opacity-50"
              >
                {submitting ? "Launching..." : "Launch Campaign"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
