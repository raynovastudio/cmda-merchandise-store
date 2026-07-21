import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getProduct } from "@/data/products";

export type CartItem = {
  key: string; // productId + size
  productId: string;
  size: string | null;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  add: (productId: string, size: string | null, quantity?: number) => void;
  updateQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const makeKey = (productId: string, size: string | null) =>
  `${productId}::${size ?? "one"}`;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (productId, size, quantity = 1) =>
        set((state) => {
          const key = makeKey(productId, size);
          const existing = state.items.find((i) => i.key === key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === key ? { ...i, quantity: i.quantity + quantity } : i,
              ),
            };
          }
          return { items: [...state.items, { key, productId, size, quantity }] };
        }),
      updateQuantity: (key, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.key === key ? { ...i, quantity } : i))
            .filter((i) => i.quantity > 0),
        })),
      remove: (key) =>
        set((state) => ({ items: state.items.filter((i) => i.key !== key) })),
      clear: () => set({ items: [] }),
    }),
    { name: "cmda-cart" },
  ),
);

export const useCartCount = () =>
  useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));

export const useCartSubtotal = () =>
  useCart((s) =>
    s.items.reduce((sum, i) => {
      const p = getProduct(i.productId);
      return sum + (p ? p.price * i.quantity : 0);
    }, 0),
  );
