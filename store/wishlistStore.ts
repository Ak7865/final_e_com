import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
}

interface WishState {
  items: WishItem[];
  toggle: (item: WishItem) => void;
  removeItem: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) =>
        set((s) =>
          s.items.find((i) => i.productId === item.productId)
            ? { items: s.items.filter((i) => i.productId !== item.productId) }
            : { items: [...s.items, item] }
        ),
      removeItem: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.productId !== id) })),
      has: (id) => !!get().items.find((i) => i.productId === id),
      clear: () => set({ items: [] }),
    }),
    { name: "lumiere-wishlist" }
  )
);