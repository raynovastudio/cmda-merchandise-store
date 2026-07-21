import { create } from "zustand";
import { persist } from "zustand/middleware";
import { products as baseProducts, type Product } from "@/data/products";

type AdminProductsState = {
  customImages: Record<string, string>;
  customProducts: Product[];
  updatedProducts: Record<string, Partial<Product>>;

  setProductImage: (productId: string, dataUrl: string) => void;
  removeProductImage: (productId: string) => void;

  addProduct: (product: Product) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
};

export const useAdminProducts = create<AdminProductsState>()(
  persist(
    (set) => ({
      customImages: {},
      customProducts: [],
      updatedProducts: {},

      setProductImage: (productId, dataUrl) =>
        set((state) => ({
          customImages: { ...state.customImages, [productId]: dataUrl },
        })),

      removeProductImage: (productId) =>
        set((state) => {
          const { [productId]: _, ...rest } = state.customImages;
          return { customImages: rest };
        }),

      addProduct: (product) =>
        set((state) => ({
          customProducts: [...state.customProducts, product],
        })),

      updateProduct: (productId, updates) =>
        set((state) => ({
          updatedProducts: {
            ...state.updatedProducts,
            [productId]: {
              ...(state.updatedProducts[productId] ?? {}),
              ...updates,
            },
          },
        })),

      deleteProduct: (productId) =>
        set((state) => ({
          customProducts: state.customProducts.filter(
            (p) => p.id !== productId,
          ),
        })),
    }),
    { name: "cmda-admin-products" },
  ),
);

export function getProductImage(
  productId: string,
  fallbackImage: string,
): string {
  const { customImages } = useAdminProducts.getState();
  return customImages[productId] ?? fallbackImage;
}

export function getAllProducts(): Product[] {
  const { customProducts, updatedProducts } = useAdminProducts.getState();
  const base: Product[] = [...baseProducts, ...customProducts];
  return base.map((p) => {
    const updates = updatedProducts[p.id];
    return updates ? { ...p, ...updates } : p;
  });
}

export function resolveProduct(id: string): Product | undefined {
  return getAllProducts().find((p) => p.id === id);
}
