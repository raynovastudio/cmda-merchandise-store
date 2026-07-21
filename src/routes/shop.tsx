import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { useProducts } from "@/stores/adminProducts";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  category: z.enum(["Apparel", "Publications"]).optional(),
  availability: z.enum(["in-stock", "pre-order"]).optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Shop All Merchandise — CMDA Nigeria" },
      {
        name: "description",
        content:
          "Browse all CMDA Nigeria official merchandise and publications. In-stock and pre-order items available.",
      },
      { property: "og:title", content: "Shop — CMDA Nigeria" },
      {
        property: "og:description",
        content: "Official CMDA Nigeria apparel and publications.",
      },
    ],
  }),
  component: ShopPage,
});

const categories = ["All", "Apparel", "Publications"] as const;
const availabilities = [
  { key: "all", label: "All" },
  { key: "in-stock", label: "In Stock" },
  { key: "pre-order", label: "Pre-Order" },
] as const;

function ShopPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState("");

  const activeCategory = search.category ?? "All";
  const activeAvailability = search.availability ?? "all";

  const allProducts = useProducts();

  const filtered = useMemo(() => {
    return allProducts.filter((p) => {
      if (activeCategory !== "All" && p.category !== activeCategory) return false;
      if (activeAvailability !== "all" && p.availability !== activeAvailability)
        return false;
      if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [allProducts, activeCategory, activeAvailability, q]);

  return (
    <SiteLayout>
      <section className="border-b border-border/40 bg-secondary/50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Merchandise
          </p>
          <h1 className="mt-3 text-4xl font-bold text-foreground sm:text-5xl">
            Shop all merchandise
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">
            Official CMDA Nigeria apparel and publications. Every purchase
            supports the mission.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Category:
            </span>
            {categories.map((c) => {
              const active = activeCategory === c;
              return (
                <button
                  key={c}
                  onClick={() =>
                    navigate({
                      search: (prev: z.infer<typeof searchSchema>) => ({
                        ...prev,
                        category: c === "All" ? undefined : c,
                      }),
                    })
                  }
                  className={cn(
                    "rounded-xl border px-4 py-1.5 text-sm font-medium transition-all",
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-card text-foreground hover:border-primary/30 hover:bg-primary/5",
                  )}
                >
                  {c}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {availabilities.map(({ key, label }) => {
                const active = activeAvailability === key;
                return (
                  <button
                    key={key}
                    onClick={() =>
                      navigate({
                        search: (prev: z.infer<typeof searchSchema>) => ({
                          ...prev,
                          availability:
                            key === "all"
                              ? undefined
                              : (key as "in-stock" | "pre-order"),
                        }),
                      })
                    }
                    className={cn(
                      "rounded-xl border px-3 py-1.5 text-xs font-medium transition-all",
                      active
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/30",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 md:w-56"
              />
            </label>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 stagger">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-16 rounded-3xl border border-dashed border-border p-14 text-center">
            <p className="font-display text-2xl font-bold text-foreground">No matches</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try clearing filters or searching for something else.
            </p>
            <Link
              to="/shop"
              className="mt-7 inline-flex rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm"
            >
              Reset
            </Link>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
