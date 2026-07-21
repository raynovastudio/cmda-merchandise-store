import { createFileRoute } from "@tanstack/react-router";
import { Plus, Edit, Search, Trash2, Palette, X } from "lucide-react";
import { useState } from "react";
import { formatNaira, type Product, type ProductColor } from "@/data/products";
import { AvailabilityBadge } from "@/components/site/AvailabilityBadge";
import { ImageUpload } from "@/components/admin/ImageUpload";
import {
  useAdminProducts,
  useProducts,
  useProductImage,
} from "@/stores/adminProducts";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

const APPAREL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

type FormState = {
  name: string;
  price: number;
  category: "Apparel" | "Publications";
  availability: "in-stock" | "pre-order";
  shortDescription: string;
  description: string;
  sizes: string[];
  colors: ProductColor[];
  image: string;
};

const emptyForm: FormState = {
  name: "",
  price: 0,
  category: "Apparel",
  availability: "in-stock",
  shortDescription: "",
  description: "",
  sizes: [],
  colors: [],
  image: "",
};

function RowImage({ product }: { product: Product }) {
  const img = useProductImage(product.id, product.image);
  return (
    <img
      src={img}
      alt={product.name}
      className="h-10 w-10 rounded-lg object-cover"
    />
  );
}

function AdminProducts() {
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const {
    customImages,
    customProducts,
    updatedProducts,
    setProductImage,
    removeProductImage,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useAdminProducts();

  const allProducts = useProducts();

  const filtered = allProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setEditingProduct(null);
    setForm({ ...emptyForm, image: "" });
    setShowAddModal(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    const customImg = customImages[product.id] ?? "";
    setForm({
      name: product.name,
      price: product.price,
      category: product.category,
      availability: product.availability,
      shortDescription: product.shortDescription,
      description: product.description,
      sizes: product.sizes ?? [],
      colors: product.colors ?? [],
      image: customImg || product.image,
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingProduct(null);
  };

  const handleSave = () => {
    if (!form.name || !form.price) return;

    if (editingProduct) {
      if (form.image) {
        setProductImage(editingProduct.id, form.image);
      } else if (customImages[editingProduct.id]) {
        removeProductImage(editingProduct.id);
      }
      updateProduct(editingProduct.id, {
        name: form.name,
        price: form.price,
        category: form.category,
        availability: form.availability,
        shortDescription: form.shortDescription,
        description: form.description,
        sizes: form.sizes.length > 0 ? form.sizes : null,
        colors: form.colors.length > 0 ? form.colors : null,
      });
    } else {
      const id = form.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const newProduct: Product = {
        id: `custom-${id}-${Date.now()}`,
        name: form.name,
        price: form.price,
        category: form.category,
        image: "",
        shortDescription: form.shortDescription,
        description: form.description,
        sizes: form.sizes.length > 0 ? form.sizes : null,
        colors: form.colors.length > 0 ? form.colors : null,
        availability: form.availability,
      };
      addProduct(newProduct);
      if (form.image) {
        setProductImage(newProduct.id, form.image);
      }
    }
    closeModal();
  };

  const toggleSize = (s: string) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(s)
        ? f.sizes.filter((x) => x !== s)
        : [...f.sizes, s],
    }));
  };

  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#8B2C6B");

  const addColor = () => {
    if (!newColorName.trim()) return;
    if (form.colors.some((c) => c.name.toLowerCase() === newColorName.toLowerCase())) return;
    setForm((f) => ({
      ...f,
      colors: [...f.colors, { name: newColorName.trim(), hex: newColorHex }],
    }));
    setNewColorName("");
  };

  const removeColor = (name: string) => {
    setForm((f) => ({
      ...f,
      colors: f.colors.filter((c) => c.name !== name),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Product Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your merchandise catalog. Upload images, add new products,
            edit details.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Product
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Category
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Price
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Sizes
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Colors
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <RowImage product={product} />
                      <div>
                        <p className="font-medium text-foreground">
                          {product.name}
                        </p>
                        <p className="max-w-[200px] truncate text-xs text-muted-foreground">
                          {product.shortDescription}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {product.category}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {formatNaira(product.price)}
                  </td>
                  <td className="px-4 py-3">
                    <AvailabilityBadge availability={product.availability} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {product.sizes ? product.sizes.join(", ") : "One Size"}
                  </td>
                  <td className="px-4 py-3">
                    {product.colors && product.colors.length > 0 ? (
                      <div className="flex gap-1">
                        {product.colors.map((c) => (
                          <span
                            key={c.name}
                            title={c.name}
                            className="h-5 w-5 rounded-full border-2 border-background shadow-sm"
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(product)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {product.id.startsWith("custom-") && (
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">No products found.</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-foreground">
                {editingProduct ? "Edit Product" : "Add Product"}
              </h3>
              <button
                onClick={closeModal}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-5">
              <ImageUpload
                value={form.image}
                onChange={(dataUrl) =>
                  setForm((f) => ({ ...f, image: dataUrl }))
                }
              />

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Product Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  placeholder="Product name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Price (₦)
                  </label>
                  <input
                    type="number"
                    value={form.price || ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        price: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        category: e.target.value as "Apparel" | "Publications",
                      }))
                    }
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  >
                    <option>Apparel</option>
                    <option>Publications</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Availability
                </label>
                <select
                  value={form.availability}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      availability: e.target.value as
                        | "in-stock"
                        | "pre-order",
                    }))
                  }
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="in-stock">In Stock</option>
                  <option value="pre-order">Pre-Order</option>
                </select>
              </div>

              {form.category === "Apparel" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Sizes
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {APPAREL_SIZES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSize(s)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                          form.sizes.includes(s)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-foreground hover:border-primary/30"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  <Palette className="mr-1 inline h-4 w-4" />
                  Colors
                </label>
                {form.colors.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {form.colors.map((c) => (
                      <span
                        key={c.name}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium"
                      >
                        <span
                          className="h-4 w-4 rounded-full border shadow-sm"
                          style={{ backgroundColor: c.hex }}
                        />
                        {c.name}
                        <button
                          type="button"
                          onClick={() => removeColor(c.name)}
                          className="ml-0.5 rounded-full p-0.5 text-muted-foreground hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded-lg border border-border bg-background p-0.5"
                  />
                  <input
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addColor()}
                    className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    placeholder="Color name (e.g. Plum)"
                  />
                  <button
                    type="button"
                    onClick={addColor}
                    disabled={!newColorName.trim()}
                    className="rounded-xl border border-border px-3 text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-40"
                  >
                    Add
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Pick a hex color and name it. Customers will see color swatches.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Short Description
                </label>
                <textarea
                  value={form.shortDescription}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      shortDescription: e.target.value,
                    }))
                  }
                  rows={2}
                  className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Full Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={3}
                  className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={closeModal}
                  className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.name || !form.price}
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {editingProduct ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
