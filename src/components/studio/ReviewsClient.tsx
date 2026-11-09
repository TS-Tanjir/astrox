"use client";

import { useState } from "react";
import { Star, ShieldCheck, Check, Trash2, X, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

export function ReviewsClient({ initialReviews }: { initialReviews: any[] }) {
  const [reviews, setReviews] = useState(initialReviews);

  const handleToggleApproval = async (id: string, current: boolean) => {
    try {
      const res = await fetch("/api/studio/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: id, isApproved: !current }),
      });
      if (!res.ok) throw new Error("Update failed");

      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isApproved: !current } : r))
      );
      toast.success(
        !current ? "Review approved and made public" : "Review hidden from storefront"
      );
    } catch {
      toast.error("Failed to update review status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this client review?")) return;

    try {
      const res = await fetch(`/api/studio/reviews?reviewId=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success("Review deleted successfully");
    } catch {
      toast.error("Failed to delete review");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Verified Client Reviews</h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Moderate verified buyer feedback, ratings, and fabric experiences across Bangladesh.
          </p>
        </div>
        <div className="text-xs text-stone-400 font-mono">
          Total Reviews: <span className="text-white font-bold">{reviews.length}</span>
        </div>
      </div>

      <div className="grid gap-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className={`p-5 rounded-2xl border transition-all ${
              rev.isApproved
                ? "bg-[#0D0D12] border-white/10"
                : "bg-stone-950/60 border-amber-500/30 opacity-75"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white">{rev.authorName}</span>
                {rev.isVerifiedPurchase && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified Buyer</span>
                  </span>
                )}
                <span className="text-xs text-stone-400 font-mono">
                  {rev.product?.nameEn || "Astrox Product"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex text-[#d9bc82]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating ? "fill-current" : "text-stone-700"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-mono text-stone-400">
                  {new Date(rev.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="py-3 space-y-1">
              <h4 className="text-xs font-bold text-stone-200">{rev.title}</h4>
              <p className="text-xs text-stone-400 leading-relaxed">{rev.comment}</p>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  rev.isApproved
                    ? "bg-emerald-950/80 text-emerald-400"
                    : "bg-amber-950/80 text-amber-400"
                }`}
              >
                {rev.isApproved ? "Approved & Public" : "Pending / Hidden"}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleApproval(rev.id, rev.isApproved)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    rev.isApproved
                      ? "bg-stone-800 text-stone-300 hover:bg-stone-700"
                      : "bg-[#d9bc82] text-black"
                  }`}
                >
                  {rev.isApproved ? "Hide Review" : "Approve & Publish"}
                </button>
                <button
                  onClick={() => handleDelete(rev.id)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
                  title="Delete Review"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-[#0D0D12] border border-white/5 space-y-2">
            <MessageSquare className="w-8 h-8 text-stone-600 mx-auto" />
            <h3 className="text-sm font-semibold text-white">No reviews found</h3>
            <p className="text-xs text-stone-400">Customer feedback will appear here for moderation.</p>
          </div>
        )}
      </div>
    </div>
  );
}
