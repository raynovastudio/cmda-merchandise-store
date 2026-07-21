import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { AvailabilityBadge } from "@/components/site/AvailabilityBadge";
import { ProductCard } from "@/components/site/ProductCard";
import { formatNaira, getProduct, type ProductColor } from "@/data/products";
import { useCart } from "@/stores/cart";
import { cn } from "@/lib/utils";
import { useProducts, getProductImage, resolveProduct } from "@/stores/adminProducts";
import { ImagePlaceholder } from "@/components/admin/ImagePlaceholder";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = resolveProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Product not found — CMDA Nigeria" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { product } = loaderData;
    return {
      meta: [
        { title: `${product.name} — CMDA Nigeria Store` },
        { name: "description", content: product.shortDescription },
        { property: "og:title", content: product.name },
        { property: "og:description", content: product.shortDescription },
      ],
    };
  },
  notFoundComponent: NotFound,
  errorComponent: ErrorView,
  component: ProductPage,
});

function NotFound() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-4xl font-bold text-foreground">Product not found</h1>
        <p className="mt-2 text-muted-foreground">
          It may have moved or is no longer available.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-flex rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Back to shop
        </Link>
      </div>
    </SiteLayout>
  );
}

function ErrorView({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <SiteLayout>
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-3xl font-bold text-foreground">Something went wrong</h1>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </SiteLayout>
  );
}

function ProductPage() {
  const { product } = Route.useLoaderData();
  const add = useCart((s) => s.add);
  const [size, setSize] = useState<string | null>(product.sizes ? "" : null);
  const [color, setColor] = useState<string | null>(
    product.colors ? "" : null,
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const needsSize = !!product.sizes;
  const needsColor = !!product.colors;
  const canAdd = (!needsSize || !!size) && (!needsColor || !!color);

  const allProducts = useProducts();
  const related = allProducts.filter((p) => p.id !== product.id).slice(0, 3);

  const handleAdd = () => {
    if (!canAdd) return;
    add(product.id, size, qty, color);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to shop
        </Link>
      </div>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-20 sm:px-6 md:grid-cols-2 lg:px-8">
        <div className="group/img relative overflow-hidden rounded-2xl border border-border/30 bg-gradient-to-br from-muted via-muted/80 to-muted/60 shadow-card">
          {getProductImage(product.id, product.image) ? (
            <img
              src={getProductImage(product.id, product.image)}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/img:scale-105"
            />
          ) : (
            <ImagePlaceholder className="h-full min-h-[400px] w-full" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
          <div className="absolute left-4 top-4">
            <AvailabilityBadge availability={product.availability} />
          </div>
        </div>

        <div className="flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {product.category}
          </p>
          <h1 className="mt-3 text-4xl font-bold text-foreground sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-4 font-display text-3xl font-bold text-foreground">
            {formatNaira(product.price)}
          </p>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          {needsSize && (
            <div className="mt-8">
              <div className="mb-2.5 flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Size</p>
                {size && (
                  <p className="text-xs text-muted-foreground">Selected: {size}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes!.map((s: string) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={cn(
                      "min-w-12 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all",
                      size === s
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-card text-foreground hover:border-primary/30 hover:bg-primary/5",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {needsColor && (
            <div className="mt-8">
              <div className="mb-2.5 flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Color</p>
                {color && (
                  <p className="text-xs text-muted-foreground">Selected: {color}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {product.colors!.map((c: ProductColor) => (
                  <button
                    key={c.name}
                    onClick={() => setColor(c.name)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
                      color === c.name
                        ? "border-primary bg-primary/5 text-foreground shadow-sm ring-1 ring-primary/20"
                        : "border-border bg-card text-foreground hover:border-primary/30 hover:bg-primary/5",
                    )}
                  >
                    <span
                      className={cn(
                        "h-5 w-5 rounded-full border-2 shadow-sm",
                        c.hex === "#FFFFFF" ? "border-gray-300" : "border-transparent",
                      )}
                      style={{ backgroundColor: c.hex }}
                    />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <p className="mb-2.5 text-sm font-semibold text-foreground">Quantity</p>
            <div className="inline-flex items-center rounded-xl border border-border bg-card shadow-card">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-11 w-11 place-items-center text-foreground transition-colors hover:bg-secondary"
                aria-label="Decrease"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-bold tabular-nums">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="grid h-11 w-11 place-items-center text-foreground transition-colors hover:bg-secondary"
                aria-label="Increase"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleAdd}
              disabled={!canAdd}
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60",
                added
                  ? "bg-brand-green text-white shadow-sm"
                  : "bg-primary text-primary-foreground shadow-elegant hover:shadow-lg hover:-translate-y-0.5",
              )}
            >
              {added ? (
                <>
                  <Check className="h-4 w-4" /> Added to cart
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" /> Add to cart
                </>
              )}
            </button>
            <Link
              to="/cart"
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-border bg-card px-6 py-4 text-sm font-semibold text-foreground shadow-card transition-all hover:shadow-card-hover hover:-translate-y-0.5"
            >
              View cart
            </Link>
          </div>

          {(!canAdd) && (
            <p className="mt-3 text-xs text-muted-foreground">
              {!needsSize && needsColor && !color && "Select a color to add this product to your cart."}
              {needsSize && !size && !needsColor && "Select a size to add this product to your cart."}
              {needsSize && !size && needsColor && !color && "Select a size and color to add this product to your cart."}
              {needsSize && size && needsColor && !color && "Select a color to add this product to your cart."}
            </p>
          )}

          <div className="mt-10 grid grid-cols-2 gap-4 rounded-2xl bg-secondary/60 p-5 text-sm">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Availability
              </p>
              <p className="mt-1.5 font-semibold text-foreground">
                {product.availability === "in-stock" ? "In Stock" : "Pre-Order"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Category
              </p>
              <p className="mt-1.5 font-semibold text-foreground">{product.category}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-28 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-3xl font-bold text-foreground">You may also like</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 stagger">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
