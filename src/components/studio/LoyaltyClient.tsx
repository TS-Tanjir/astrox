"use client";

import { useState } from "react";
import { Crown, Sparkles, Award, TrendingUp, Users, Plus, Star } from "lucide-react";
import toast from "react-hot-toast";

export function LoyaltyClient({
  initialUsers,
  tierBreakdown,
  totalStarsCirculating,
}: {
  initialUsers: any[];
  tierBreakdown: Record<string, number>;
  totalStarsCirculating: number;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [bonusPoints, setBonusPoints] = useState("250");
  const [bonusReason, setBonusReason] = useState("VIP Sovereign Tier Elevation");
  const [submitting, setSubmitting] = useState(false);

  const handleGrantBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/studio/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          pointsDelta: parseInt(bonusPoints),
          reason: bonusReason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, ...data.user } : u))
      );
      toast.success(`Awarded ${bonusPoints} Stars to ${selectedUser.name}!`);
      setSelectedUser(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to adjust points");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Astrox Stars Loyalty & VIP Tiers</h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Manage customer tier privileges, point balances, and VIP concierge invitations.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#d9bc82]/10 border border-[#d9bc82]/30 text-xs font-mono font-bold text-[#d9bc82]">
          <Star className="w-4 h-4 fill-current" />
          <span>{totalStarsCirculating.toLocaleString()} Stars Active in Circulation</span>
        </div>
      </div>

      {/* Tier Breakdown KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span className="font-semibold text-stone-300">Nova Patrons</span>
            <span className="text-[10px] font-mono text-stone-500">0 - 999 pts</span>
          </div>
          <div className="text-3xl font-bold font-mono text-white">{tierBreakdown.NOVA || 0}</div>
          <p className="text-[11px] text-stone-400">1.0 Star per ৳100 spent · Standard Dispatch</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D0D12] border border-amber-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#d9bc82] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#d9bc82]" />
              <span>Stellar Aristocrats</span>
            </span>
            <span className="text-[10px] font-mono text-amber-400">1,000 - 4,999 pts</span>
          </div>
          <div className="text-3xl font-bold font-mono text-white">{tierBreakdown.STELLAR || 0}</div>
          <p className="text-[11px] text-stone-400">1.5 Stars per ৳100 · 5% Birthday Bonus · Priority Dispatch</p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1b1710] to-[#0D0D12] border border-[#d9bc82]/40 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#d9bc82] flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-[#d9bc82]" />
              <span>Galaxy Sovereigns</span>
            </span>
            <span className="text-[10px] font-mono text-[#d9bc82]">5,000+ pts</span>
          </div>
          <div className="text-3xl font-bold font-mono text-white">{tierBreakdown.GALAXY || 0}</div>
          <p className="text-[11px] text-[#d9bc82]/80">2.0 Stars per ৳100 · Free Velvet Box & Wax Seal · 24/7 Atelier Concierge</p>
        </div>
      </div>

      {/* Patrons Table */}
      <div className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-4">
        <h3 className="text-sm font-semibold text-white border-b border-white/5 pb-3">
          Top Sovereign Patrons
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-stone-400 font-mono">
                <th className="py-2.5 px-3">Patron</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3">Tier</th>
                <th className="py-2.5 px-3">Stars Balance</th>
                <th className="py-2.5 px-3">Lifetime Orders</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-stone-200 font-medium">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-stone-900/40 transition">
                  <td className="py-3 px-3">
                    <div className="font-bold text-white">{u.name}</div>
                  </td>
                  <td className="py-3 px-3 font-mono text-stone-400">{u.phone || u.email || "N/A"}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        u.loyaltyTier === "GALAXY"
                          ? "bg-[#d9bc82]/20 text-[#d9bc82] border border-[#d9bc82]/40"
                          : u.loyaltyTier === "STELLAR"
                          ? "bg-amber-950 text-amber-300 border border-amber-800"
                          : "bg-stone-800 text-stone-400"
                      }`}
                    >
                      {u.loyaltyTier}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-[#d9bc82]">
                    {u.loyaltyPoints.toLocaleString()} Stars
                  </td>
                  <td className="py-3 px-3 font-mono">{u._count?.orders || 0}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedUser(u)}
                      className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs text-stone-200 transition"
                    >
                      Grant Bonus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grant Bonus Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <form
            onSubmit={handleGrantBonus}
            className="w-full max-w-md bg-[#0D0D12] border border-[#d9bc82]/40 rounded-3xl p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-[#d9bc82]" />
                <span>Grant Loyalty Stars — {selectedUser.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-stone-300 font-medium block mb-1">Stars to Credit / Debit</label>
                <input
                  type="number"
                  required
                  value={bonusPoints}
                  onChange={(e) => setBonusPoints(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-stone-300 font-medium block mb-1">Audit Reason</label>
                <input
                  type="text"
                  required
                  value={bonusReason}
                  onChange={(e) => setBonusReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-white"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-gold-gradient text-black font-semibold text-xs tracking-wider uppercase disabled:opacity-50"
              >
                {submitting ? "Applying..." : "Confirm Stars"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
