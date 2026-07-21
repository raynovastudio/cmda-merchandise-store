import { create } from "zustand";
import { persist } from "zustand/middleware";
import { resolveProduct } from "@/stores/adminProducts";

export type CartItem = {
  key: string;
  productId: string;
  size: string | null;
  color: string | null;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  add: (
    productId: string,
    size: string | null,
    quantity?: number,
    color?: string | null,
  ) => void;
  updateQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const makeKey = (
  productId: string,
  size: string | null,
  color: string | null,
) => `${productId}::${size ?? "one"}::${color ?? "none"}`;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (productId, size, quantity = 1, color = null) =>
        set((state) => {
          const key = makeKey(productId, size, color);
          const existing = state.items.find((i) => i.key === key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === key ? { ...i, quantity: i.quantity + quantity } : i,
              ),
            };
          }
          return {
            items: [...state.items, { key, productId, size, color, quantity }],
          };
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
      const p = resolveProduct(i.productId);
      return sum + (p ? p.price * i.quantity : 0);
    }, 0),
  );
