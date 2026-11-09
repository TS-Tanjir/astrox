"use client";

import { useEffect, useState } from "react";
import { Download, Sparkles, X } from "lucide-react";

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("Astrox SW registered:", reg.scope))
        .catch((err) => console.log("Astrox SW registration failed:", err));
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="p-4 rounded-2xl bg-[#0D0D12] border border-[#d9bc82]/40 shadow-2xl max-w-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-gradient p-2 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Install Astrox App</div>
            <p className="text-[10px] text-stone-400">Add to home screen for instant VIP access</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 rounded-xl bg-gold-gradient text-black font-semibold text-[11px] uppercase tracking-wider shadow"
          >
            Install
          </button>
          <button
            onClick={() => setShowPrompt(false)}
            className="p-1 rounded-lg text-stone-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
