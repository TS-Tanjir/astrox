"use client";

import { useState } from "react";
import Link from "next/link";
import {
  X,
  User,
  Crown,
  ShoppingBag,
  Heart,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Send,
  Truck,
  ExternalLink,
} from "lucide-react";
import { useLocaleStore } from "@/lib/store/useLocaleStore";
import toast from "react-hot-toast";

export function AccountDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { locale } = useLocaleStore();
  const [activeTab, setActiveTab] = useState<"PROFILE" | "CONCIERGE">("PROFILE");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Welcome to the Astrox Astral Concierge. How may our Sonargaon & Dhaka ateliers assist you today?",
      time: "Just now",
    },
  ]);

  if (!isOpen) return null;

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMsg, time: "Just now" }]);
    setChatInput("");

    setTimeout(() => {
      let reply = "Our concierge team has received your query. All orders placed today in Dhaka qualify for 24h express dispatch with complimentary gift wrapping.";
      if (userMsg.toLowerCase().includes("size") || userMsg.toLowerCase().includes("fit")) {
        reply = "For traditional panjabi and kabli sets, we recommend selecting your exact tailored chest size (e.g. Size 40 for M). We offer 7 days complimentary home exchange if adjustments are needed.";
      } else if (userMsg.toLowerCase().includes("delivery") || userMsg.toLowerCase().includes("courier")) {
        reply = "We dispatch via Pathao Express and Steadfast with full tracking. Inside Dhaka delivery is ৳70 (Free on ৳2,500+) and outside Dhaka is ৳130.";
      }
      setMessages((prev) => [...prev, { sender: "bot", text: reply, time: "Just now" }]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0D0D12] border-l border-[#d9bc82]/30 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#121319]">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-[#d9bc82]" />
            <h2 className="text-base font-bold text-white tracking-wide">
              {locale === "bn" ? "অ্যাস্ট্রক্স মেম্বারশিপ" : "Astrox Client Account"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 p-2 bg-[#08080C] border-b border-white/5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("PROFILE")}
            className={`py-2 rounded-xl transition ${
              activeTab === "PROFILE" ? "bg-[#181922] text-[#d9bc82] shadow" : "text-stone-400 hover:text-white"
            }`}
          >
            Member Overview
          </button>
          <button
            onClick={() => setActiveTab("CONCIERGE")}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === "CONCIERGE" ? "bg-[#181922] text-[#d9bc82] shadow" : "text-stone-400 hover:text-white"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>24/7 Concierge</span>
          </button>
        </div>

        {/* Tab 1: Member Overview */}
        {activeTab === "PROFILE" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* VIP Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#231F14] via-[#15151D] to-[#0A0A0F] border border-[#d9bc82]/40 shadow-xl space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono text-[#d9bc82] tracking-widest uppercase block">
                    ASTRAL CLUB SOVEREIGN
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">Tanjir Rahman</h3>
                  <p className="text-xs text-stone-400 font-mono">01700000001 · Gulshan-2, Dhaka</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-[#d9bc82]/20 border border-[#d9bc82] text-[#d9bc82] flex items-center justify-center">
                  <Crown className="w-5 h-5" />
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-between items-center text-xs">
                <div>
                  <span className="text-stone-400 block text-[10px]">Privilege Balance</span>
                  <span className="text-base font-bold text-[#d9bc82] font-mono">350 Stars (৳350)</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#d9bc82]/20 text-[#d9bc82] text-[10px] font-bold">
                  VIP LEVEL 2
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">Quick Access</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link
                  href="/track?orderNumber=AX-2026-1001&phone=01711223344"
                  onClick={onClose}
                  className="p-3 rounded-xl bg-stone-900 border border-white/5 hover:border-[#d9bc82]/40 text-stone-200 transition flex items-center gap-2"
                >
                  <Truck className="w-4 h-4 text-[#d9bc82]" />
                  <span>Recent Orders</span>
                </Link>

                <Link
                  href="/wishlist"
                  onClick={onClose}
                  className="p-3 rounded-xl bg-stone-900 border border-white/5 hover:border-[#d9bc82]/40 text-stone-200 transition flex items-center gap-2"
                >
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span>Saved Pieces</span>
                </Link>
              </div>
            </div>

            {/* Saved Addresses */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Primary Delivery Destination
              </h4>
              <div className="p-4 rounded-xl bg-stone-900/80 border border-white/5 text-xs text-stone-300 space-y-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#d9bc82]" />
                    <span>Gulshan-2 Atelier Residence</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400">
                    Default
                  </span>
                </div>
                <p>House 14, Road 45, Apartment 5B</p>
                <p>Gulshan-2, Dhaka 1212, Bangladesh</p>
              </div>
            </div>

            {/* Studio Admin link */}
            <div className="pt-2">
              <Link
                href="/studio"
                onClick={onClose}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#15151D] border border-[#d9bc82]/30 hover:border-[#d9bc82] text-xs font-semibold text-white transition group"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#d9bc82]" />
                  <span>Launch Astrox Studio (Admin & Analytics)</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#d9bc82] group-hover:translate-x-0.5 transition" />
              </Link>
            </div>
          </div>
        )}

        {/* Tab 2: 24/7 Concierge Chat */}
        {activeTab === "CONCIERGE" && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                      m.sender === "user"
                        ? "bg-[#d9bc82] text-black font-medium"
                        : "bg-stone-900 border border-white/10 text-stone-200"
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[9px] text-stone-500 mt-1 font-mono">{m.time}</span>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendChat} className="p-4 border-t border-white/10 bg-[#121319] flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask concierge about size, delivery, fabric..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d9bc82]"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-gold-gradient text-black hover:opacity-95 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
