"use client";

import { useState } from "react";
import Image from "next/image";
import { formatMoney } from "@/lib/money";
import { ShieldCheck, Lock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

interface PaymentModalProps {
  isOpen: boolean;
  orderNumber: string;
  totalPaisa: number;
  paymentMethod: "BKASH" | "NAGAD" | "SSLCOMMERZ" | "STRIPE";
  onSuccess: () => void;
  onCancel: () => void;
}

export function PaymentModal({
  isOpen,
  orderNumber,
  totalPaisa,
  paymentMethod,
  onSuccess,
  onCancel,
}: PaymentModalProps) {
  const [pinOrOtp, setPinOrOtp] = useState("12345");
  const [phoneOrCard, setPhoneOrCard] = useState("01700000001");
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const res = await fetch("/api/checkout/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber,
          provider: paymentMethod,
          pinOrOtp,
          rawPayload: {
            phoneOrCard,
            amountPaisa: totalPaisa,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Payment verification failed");
      }

      toast.success(data.message || "Payment authorized successfully!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Payment failed. Please retry.");
    } finally {
      setProcessing(false);
    }
  };

  const isBkash = paymentMethod === "BKASH";
  const isNagad = paymentMethod === "NAGAD";
  const isCard = paymentMethod === "SSLCOMMERZ" || paymentMethod === "STRIPE";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-[#0D0D12] border border-[#d9bc82]/40 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Gateway Brand Header */}
        <div
          className={`p-6 text-white flex items-center justify-between ${
            isBkash
              ? "bg-gradient-to-r from-[#D12053] to-[#E2136E]"
              : isNagad
              ? "bg-gradient-to-r from-[#E04F26] to-[#F15A24]"
              : "bg-gradient-to-r from-[#1B1F3B] to-[#2B3260]"
          }`}
        >
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-white/80 block">
              SECURE CHECKOUT GATEWAY
            </span>
            <h3 className="text-xl font-bold tracking-tight">
              {isBkash
                ? "bKash Direct Payment"
                : isNagad
                ? "Nagad Digital Gateway"
                : "Astrox 3D-Secure Card Clearance"}
            </h3>
          </div>
          <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Lock className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Order Details Bar */}
        <div className="px-6 py-4 bg-[#14151E] border-b border-white/5 flex items-center justify-between text-xs">
          <div>
            <span className="text-stone-400 block font-mono">Invoice Reference</span>
            <span className="text-white font-mono font-bold text-sm">{orderNumber}</span>
          </div>
          <div className="text-right">
            <span className="text-stone-400 block font-mono">Payable Amount</span>
            <span className="text-[#d9bc82] font-mono font-bold text-base">
              {formatMoney(totalPaisa)}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConfirmPayment} className="p-6 space-y-4 text-xs">
          {isBkash && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-stone-300 font-medium">bKash Account Number</label>
                <input
                  type="text"
                  required
                  value={phoneOrCard}
                  onChange={(e) => setPhoneOrCard(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-stone-300 font-medium">
                  bKash Verification PIN (Demo Sandbox: 12345)
                </label>
                <input
                  type="password"
                  required
                  maxLength={5}
                  value={pinOrOtp}
                  onChange={(e) => setPinOrOtp(e.target.value)}
                  placeholder="•••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white font-mono tracking-widest text-center text-base"
                />
              </div>
            </div>
          )}

          {isNagad && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-stone-300 font-medium">Nagad Registered Mobile Number</label>
                <input
                  type="text"
                  required
                  value={phoneOrCard}
                  onChange={(e) => setPhoneOrCard(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-stone-300 font-medium">Secret PIN (Demo: 12345)</label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  value={pinOrOtp}
                  onChange={(e) => setPinOrOtp(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white font-mono tracking-widest text-center text-base"
                />
              </div>
            </div>
          )}

          {isCard && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-stone-300 font-medium">Card Number (Visa / Master / AMEX)</label>
                <input
                  type="text"
                  required
                  value={phoneOrCard}
                  onChange={(e) => setPhoneOrCard(e.target.value)}
                  placeholder="4242 •••• •••• 4242"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-stone-300 font-medium">Expiry</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    defaultValue="12/28"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-stone-300 font-medium">CVV / CVC</label>
                  <input
                    type="password"
                    maxLength={4}
                    defaultValue="888"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white font-mono text-center"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2 text-[11px] text-stone-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>256-bit TLS encrypted bank handshake. Tokenized authorization.</span>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl bg-stone-900 border border-white/10 text-stone-300 font-semibold hover:bg-stone-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="flex-1 py-3 rounded-xl bg-gold-gradient text-black font-semibold uppercase tracking-wider disabled:opacity-50 transition shadow-lg shadow-[#d9bc82]/10"
            >
              {processing ? "Authorizing..." : "Confirm & Pay"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
