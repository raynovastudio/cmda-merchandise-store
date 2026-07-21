import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { AvailabilityBadge } from "@/components/site/AvailabilityBadge";
import { formatNaira, getProduct } from "@/data/products";
import { useCart, useCartSubtotal } from "@/stores/cart";
import { getProductImage, resolveProduct } from "@/stores/adminProducts";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — CMDA Nigeria Store" },
      { name: "description", content: "Review your CMDA Nigeria merchandise before checkout." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const items = useCart((s) => s.items);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const remove = useCart((s) => s.remove);
  const subtotal = useCartSubtotal();

  const hasItems = items.length > 0;

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Cart
          </p>
          <h1 className="mt-3 text-4xl font-bold text-foreground sm:text-5xl">
            Your merchandise
          </h1>
        </div>

        {!hasItems ? (
          <div className="rounded-3xl border border-dashed border-border p-14 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary-soft text-primary">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <p className="mt-5 font-display text-2xl font-bold text-foreground">
              Your cart is empty
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Add some official CMDA merchandise to get started.
            </p>
            <Link
              to="/shop"
              className="mt-7 inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm"
            >
              Browse merchandise
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
            <ul className="space-y-3">
              {items.map((item) => {
                const p = resolveProduct(item.productId);
                if (!p) return null;
                return (
                  <li
                    key={item.key}
                    className="grid grid-cols-[96px_1fr] gap-4 rounded-2xl border border-border/50 bg-card p-4 shadow-card sm:grid-cols-[120px_1fr_auto] sm:gap-6 sm:p-5"
                  >
                    <Link
                      to="/product/$id"
                      params={{ id: p.id }}
                      className="overflow-hidden rounded-xl bg-muted"
                    >
                      <img
                        src={getProductImage(p.id, p.image)}
                        alt={p.name}
                        width={240}
                        height={300}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </Link>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                            {p.category}
                          </p>
                          <Link
                            to="/product/$id"
                            params={{ id: p.id }}
                            className="mt-0.5 block font-display text-lg font-semibold text-foreground hover:text-primary"
                          >
                            {p.name}
                          </Link>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            {item.size && <span>Size: {item.size}</span>}
                            {item.color && <span>Color: {item.color}</span>}
                            <AvailabilityBadge availability={p.availability} />
                          </div>
                        </div>
                        <p className="font-display text-lg font-bold text-foreground sm:hidden">
                          {formatNaira(p.price * item.quantity)}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center rounded-xl border border-border bg-background">
                          <button
                            onClick={() =>
                              updateQuantity(item.key, item.quantity - 1)
                            }
                            className="grid h-9 w-9 place-items-center transition-colors hover:bg-secondary rounded-l-xl"
                            aria-label="Decrease"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.key, item.quantity + 1)
                            }
                            className="grid h-9 w-9 place-items-center transition-colors hover:bg-secondary rounded-r-xl"
                            aria-label="Increase"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => remove(item.key)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>
                    </div>

                    <p className="hidden self-center font-display text-lg font-bold text-foreground sm:block">
                      {formatNaira(p.price * item.quantity)}
                    </p>
                  </li>
                );
              })}
            </ul>

            <aside className="h-fit rounded-2xl border border-border/50 bg-card p-6 shadow-card">
              <p className="font-display text-xl font-bold text-foreground">Order summary</p>
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-semibold text-foreground">
                    {formatNaira(subtotal)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery fee</dt>
                  <dd className="text-muted-foreground">Calculated at checkout</dd>
                </div>
                <div className="my-3 h-px bg-border" />
                <div className="flex justify-between">
                  <dt className="font-display text-lg font-bold text-foreground">Total</dt>
                  <dd className="font-display text-lg font-bold text-foreground">
                    {formatNaira(subtotal)}
                  </dd>
                </div>
              </dl>

              <Link
                to="/checkout"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-elegant transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                Proceed to Checkout
              </Link>
              <Link
                to="/shop"
                className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary/30 hover:bg-primary/5"
              >
                Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
