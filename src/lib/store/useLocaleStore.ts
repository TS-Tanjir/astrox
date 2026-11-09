"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Locale } from "../i18n";

interface LocaleStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set, get) => ({
      locale: "en",
      setLocale: (locale) => set({ locale }),
      toggleLocale: () => set({ locale: get().locale === "en" ? "bn" : "en" }),
    }),
    {
      name: "astrox_locale_storage",
    }
  )
);
