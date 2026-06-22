import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  variant?: string;
  quantity: number;
  stock: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variant?: string) => void;
  updateQty: (productId: string, qty: number, variant?: string) => void;
  clearCart: () => void;
  subtotal: () => number;
  count: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((s) => {
          const idx = s.items.findIndex(
            (i) => i.productId === item.productId && i.variant === item.variant
          );
          if (idx > -1) {
            const items = [...s.items];
            items[idx].quantity = Math.min(items[idx].quantity + item.quantity, item.stock);
            return { items };
          }
          return { items: [...s.items, item] };
        }),
      removeItem: (productId, variant) =>
        set((s) => ({
          items: s.items.filter((i) => !(i.productId === productId && i.variant === variant)),
        })),
      updateQty: (productId, qty, variant) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.productId === productId && i.variant === variant
              ? { ...i, quantity: Math.max(1, Math.min(qty, i.stock)) }
              : i
          ),
        })),
      clearCart: () => set({ items: [] }),
      subtotal: () => get().items.reduce((a, i) => a + i.price * i.quantity, 0),
      count: () => get().items.reduce((a, i) => a + i.quantity, 0),
    }),
    { name: "lumiere-cart" }
  )
);