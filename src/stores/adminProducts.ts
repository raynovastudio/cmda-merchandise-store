import { create } from "zustand";
import { useMemo, useEffect } from "react";
import { products as baseProducts, type Product, type ProductColor, type Availability } from "@/data/products";
import { supabase } from "@/lib/supabase";

type ProductRow = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  short_description: string;
  description: string;
  sizes: string[] | null;
  colors: ProductColor[] | null;
  availability: string;
  is_custom: boolean;
  created_at: string;
};

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category as "Apparel" | "Publications",
    price: row.price,
    image: row.image ?? "",
    shortDescription: row.short_description ?? "",
    description: row.description ?? "",
    sizes: row.sizes ?? null,
    colors: row.colors ?? null,
    availability: (row.availability as Availability) ?? "in-stock",
  };
}

function productToRow(product: Product, isCustom: boolean): Omit<ProductRow, "created_at"> {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    image: product.image ?? "",
    short_description: product.shortDescription ?? "",
    description: product.description ?? "",
    sizes: product.sizes ?? null,
    colors: product.colors ?? null,
    availability: product.availability,
    is_custom: isCustom,
  };
}

type AdminProductsState = {
  remoteProducts: Record<string, Product>;
  loaded: boolean;
  loading: boolean;

  loadFromSupabase: () => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  setProductImage: (productId: string, imageUrl: string) => Promise<void>;
  removeProductImage: (productId: string) => Promise<void>;
};

export const useAdminProducts = create<AdminProductsState>()((set, get) => ({
  remoteProducts: {},
  loaded: false,
  loading: false,

  loadFromSupabase: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Failed to load products from Supabase:", error.message);
        return;
      }

      const map: Record<string, Product> = {};
      for (const row of (data ?? []) as ProductRow[]) {
        map[row.id] = rowToProduct(row);
      }
      set({ remoteProducts: map, loaded: true });
    } finally {
      set({ loading: false });
    }
  },

  addProduct: async (product) => {
    const row = productToRow(product, true);
    const { error } = await supabase.from("products").insert({
      ...row,
      created_at: new Date().toISOString(),
    });
    if (error) {
      console.error("Failed to add product:", error.message);
      return;
    }
    set((state) => ({
      remoteProducts: { ...state.remoteProducts, [product.id]: product },
    }));
  },

  updateProduct: async (productId, updates) => {
    const existing = get().remoteProducts[productId];
    const base = baseProducts.find((p) => p.id === productId);
    const merged = existing ? { ...existing, ...updates } : base ? { ...base, ...updates } : null;
    if (!merged) return;

    const isCustom = !base;
    const row = productToRow(merged, isCustom);
    const { error } = await supabase
      .from("products")
      .upsert(row, { onConflict: "id" });
    if (error) {
      console.error("Failed to update product:", error.message);
      return;
    }
    set((state) => ({
      remoteProducts: { ...state.remoteProducts, [productId]: merged },
    }));
  },

  deleteProduct: async (productId) => {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);
    if (error) {
      console.error("Failed to delete product:", error.message);
      return;
    }
    set((state) => {
      const { [productId]: _, ...rest } = state.remoteProducts;
      return { remoteProducts: rest };
    });
  },

  setProductImage: async (productId, imageUrl) => {
    const existing = get().remoteProducts[productId];
    const base = baseProducts.find((p) => p.id === productId);
    const product = existing ?? base;
    if (!product) return;

    const updated = { ...product, image: imageUrl };
    const isCustom = !base && !existing;
    const row = productToRow(updated, isCustom || !!existing);
    const { error } = await supabase
      .from("products")
      .upsert(row, { onConflict: "id" });
    if (error) {
      console.error("Failed to save product image:", error.message);
      return;
    }
    set((state) => ({
      remoteProducts: { ...state.remoteProducts, [productId]: updated },
    }));
  },

  removeProductImage: async (productId) => {
    const existing = get().remoteProducts[productId];
    if (!existing) return;

    const updated = { ...existing, image: "" };
    const row = productToRow(updated, true);
    const { error } = await supabase
      .from("products")
      .upsert(row, { onConflict: "id" });
    if (error) {
      console.error("Failed to remove product image:", error.message);
      return;
    }
    set((state) => ({
      remoteProducts: { ...state.remoteProducts, [productId]: updated },
    }));
  },
}));

function mergeProducts(remoteProducts: Record<string, Product>): Product[] {
  const base = [...baseProducts];
  return base.map((p) => {
    const remote = remoteProducts[p.id];
    return remote ? { ...p, ...remote } : p;
  });
}

export function useProducts(): Product[] {
  const remoteProducts = useAdminProducts((s) => s.remoteProducts);
  const loaded = useAdminProducts((s) => s.loaded);

  useEffect(() => {
    if (!loaded) {
      useAdminProducts.getState().loadFromSupabase();
    }
  }, [loaded]);

  return useMemo(() => {
    const customProducts = Object.values(remoteProducts).filter(
      (p) => !baseProducts.some((b) => b.id === p.id),
    );
    return [...mergeProducts(remoteProducts), ...customProducts];
  }, [remoteProducts]);
}

export function useProductImage(productId: string, fallbackImage: string): string {
  const remoteProducts = useAdminProducts((s) => s.remoteProducts);
  const remote = remoteProducts[productId];
  return remote?.image || fallbackImage;
}

export function getProductImage(
  productId: string,
  fallbackImage: string,
): string {
  const { remoteProducts } = useAdminProducts.getState();
  const remote = remoteProducts[productId];
  return remote?.image || fallbackImage;
}

export function getAllProducts(): Product[] {
  const { remoteProducts } = useAdminProducts.getState();
  const customProducts = Object.values(remoteProducts).filter(
    (p) => !baseProducts.some((b) => b.id === p.id),
  );
  return [...mergeProducts(remoteProducts), ...customProducts];
}

export function resolveProduct(id: string): Product | undefined {
  return getAllProducts().find((p) => p.id === id);
}

export function useResolvedProduct(id: string): { product: Product; image: string } | undefined {
  const products = useProducts();
  const remoteProducts = useAdminProducts((s) => s.remoteProducts);
  const product = products.find((p) => p.id === id);
  if (!product) return undefined;
  const remote = remoteProducts[product.id];
  return { product, image: remote?.image || product.image };
}
