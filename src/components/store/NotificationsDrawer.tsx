"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Bell, Sparkles, Truck, Tag, ShieldCheck, Check } from "lucide-react";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

export interface NotificationItem {
  id: string;
  type: "ORDER" | "PROMO" | "VIP";
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  time: string;
  link?: string;
  isRead: boolean;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-01",
    type: "PROMO",
    title: "The Winter Edit 2026 Drops Live",
    titleBn: "উইন্টার এডিট ২০২৬ লাইভ হয়েছে",
    description: "Pure Cashmere pashmina shawls and tailored winter coats now available.",
    descriptionBn: "কাশ্মীরি পশমিনা ও শীতের স্পেশাল কালেকশন ব্রাউজ করুন।",
    time: "10 mins ago",
    link: "/collections/winter-edit",
    isRead: false,
  },
  {
    id: "notif-02",
    type: "ORDER",
    title: "Consignment Dispatched (AX-2026-1003)",
    titleBn: "পার্সেল কুরিয়ারে হস্তান্তর করা হয়েছে",
    description: "Consignment handed over to Pathao Express for same-day delivery in Dhaka.",
    descriptionBn: "পাঠাও এক্সপ্রেসের মাধ্যমে ঢাকায় দ্রুত ডেলিভারি নিশ্চিত করা হচ্ছে।",
    time: "2 hours ago",
    link: "/track?orderNumber=AX-2026-1003&phone=01933445566",
    isRead: false,
  },
  {
    id: "notif-03",
    type: "VIP",
    title: "350 Astrox Stars Privilege Credited",
    titleBn: "৩৫০ অ্যাস্ট্রক্স স্টার পয়েন্ট যোগ হয়েছে",
    description: "Your loyalty tier is now Astral Sovereign. Use points for flat discounts at checkout.",
    descriptionBn: "চেকআউটে পয়েন্ট ব্যবহার করে অতিরিক্ত ছাড় উপভোগ করুন।",
    time: "Yesterday",
    isRead: true,
  },
];

export function NotificationsDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const { locale } = useLocaleStore();

  if (!isOpen) return null;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0D0D12] border-l border-[#d9bc82]/30 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#121319]">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-[#d9bc82]" />
            <h2 className="text-base font-bold text-white tracking-wide">
              {locale === "bn" ? "নোটিফিকেশন ও আপডেট" : "Alerts & Dispatches"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={markAllRead}
              className="text-xs text-[#d9bc82] hover:underline"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={n.link || "#"}
              onClick={onClose}
              className={`block p-4 rounded-2xl border transition group ${
                n.isRead
                  ? "bg-stone-900/40 border-white/5 hover:border-white/20"
                  : "bg-[#141520] border-[#d9bc82]/30 hover:border-[#d9bc82]"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    n.type === "ORDER"
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                      : n.type === "PROMO"
                      ? "bg-rose-950 text-rose-400 border border-rose-800"
                      : "bg-[#d9bc82]/20 text-[#d9bc82] border border-[#d9bc82]/40"
                  }`}
                >
                  {n.type === "ORDER" ? <Truck className="w-4 h-4" /> : n.type === "PROMO" ? <Tag className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white group-hover:text-[#d9bc82] transition truncate">
                      {locale === "bn" ? n.titleBn : n.title}
                    </h3>
                    <span className="text-[10px] text-stone-500 font-mono shrink-0 ml-2">
                      {n.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                    {locale === "bn" ? n.descriptionBn : n.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
