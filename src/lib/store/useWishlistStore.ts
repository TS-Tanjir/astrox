"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistStore {
  items: string[]; // product IDs
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggleWishlist: (productId: string) => {
        set((state) => {
          const exists = state.items.includes(productId);
          return {
            items: exists ? state.items.filter((id) => id !== productId) : [...state.items, productId],
          };
        });
      },
      isInWishlist: (productId: string) => {
        return get().items.includes(productId);
      },
    }),
    {
      name: "astrox_wishlist_storage",
    }
  )
);
