"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItemData {
  variantId: string;
  productId: string;
  productSlug: string;
  nameEn: string;
  nameBn: string;
  variantLabel: string;
  unitPricePaisa: number;
  imageUrl: string;
  qty: number;
  maxStock: number;
}

interface CartStore {
  isOpen: boolean;
  items: CartItemData[];
  couponCode: string | null;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItemData, "qty">, qty?: number) => void;
  removeItem: (variantId: string) => void;
  updateQty: (variantId: string, qty: number) => void;
  setCoupon: (code: string | null) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotalPaisa: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      isOpen: false,
      items: [],
      couponCode: null,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (item, qty = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId);
          if (existing) {
            const newQty = Math.min(existing.qty + qty, item.maxStock);
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId ? { ...i, qty: newQty } : i
              ),
              isOpen: true,
            };
          }
          return {
            items: [...state.items, { ...item, qty: Math.min(qty, item.maxStock) }],
            isOpen: true,
          };
        });
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        }));
      },

      updateQty: (variantId, qty) => {
        set((state) => ({
          items: state.items
            .map((i) => (i.variantId === variantId ? { ...i, qty: Math.max(1, Math.min(qty, i.maxStock)) } : i))
            .filter((i) => i.qty > 0),
        }));
      },

      setCoupon: (code) => set({ couponCode: code }),

      clearCart: () => set({ items: [], couponCode: null }),

      getTotalItems: () => {
        return get().items.reduce((acc, item) => acc + item.qty, 0);
      },

      getSubtotalPaisa: () => {
        return get().items.reduce((acc, item) => acc + item.unitPricePaisa * item.qty, 0);
      },
    }),
    {
      name: "astrox_cart_storage",
    }
  )
);
