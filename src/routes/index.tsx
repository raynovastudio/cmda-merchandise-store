import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Package, Sparkles, Truck, HandHeart } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { useProducts } from "@/stores/adminProducts";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const allProducts = useProducts();
  const featured = allProducts.filter((p) => p.featured);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-primary/[0.04] blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-brand-green/[0.04] blur-3xl" />
        </div>
        <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-12 sm:px-6 md:grid-cols-[1.05fr_1fr] md:gap-10 md:pt-20 lg:px-8 lg:pt-24">
          <div className="flex flex-col justify-center animate-fade-up">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Official CMDA Nigeria Store
            </span>
            <h1 className="mt-7 text-balance text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-[4.5rem]">
              Official CMDA Nigeria{" "}
              <span className="bg-gradient-to-r from-primary via-primary to-brand-green bg-clip-text text-transparent">
                Merchandise Store
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">
                Wear the Vision. Support the Mission.
              </span>{" "}
              Purchase authentic CMDA Nigeria merchandise and publications.
              Choose delivery, collect at a conference, or authorize someone to
              collect on your behalf.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-elegant transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-7 py-3.5 text-sm font-semibold text-foreground shadow-card transition-all hover:shadow-card-hover hover:-translate-y-0.5"
              >
                Browse Merchandise
              </Link>
            </div>
            <div className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-8">
              <div>
                <p className="font-display text-3xl font-bold text-primary">5+</p>
                <p className="mt-0.5 text-xs font-medium text-muted-foreground">Official products</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-primary">3</p>
                <p className="mt-0.5 text-xs font-medium text-muted-foreground">Fulfillment options</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-primary">100%</p>
                <p className="mt-0.5 text-xs font-medium text-muted-foreground">Authentic goods</p>
              </div>
            </div>
          </div>
          <div className="relative animate-fade-up" style={{ animationDelay: "100ms" }}>
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-primary-soft via-background to-brand-green-soft blur-2xl opacity-60" />
            <div className="relative overflow-hidden rounded-[2rem] border border-border/40 shadow-card-hover">
              <img
                src="/New Hero Image.png"
                alt="CMDA Nigeria members in branded merchandise"
                width={1600}
                height={1200}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-border/60 bg-card/90 p-4 shadow-card backdrop-blur-sm sm:block">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-green-soft text-brand-green">
                  <HandHeart className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Mission-focused
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Every purchase supports the work
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value strip */}
      <section className="border-y border-border/40 bg-secondary/50">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-12 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            {
              icon: Package,
              title: "Conference Pickup",
              body: "Collect your order at any listed CMDA conference.",
            },
            {
              icon: HandHeart,
              title: "Authorized Pickup",
              body: "Nominate someone to collect on your behalf.",
            },
            {
              icon: Truck,
              title: "Nationwide Delivery",
              body: "Waybill delivery to any state in Nigeria.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-display text-base font-semibold text-foreground">{title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Featured
            </p>
            <h2 className="mt-3 text-4xl font-bold text-foreground sm:text-5xl">
              This season&apos;s essentials
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            View all merchandise <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 stagger">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Publications */}
      <section className="mx-auto max-w-7xl px-4 pb-28 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-border/40 bg-gradient-to-br from-primary-soft/60 via-background to-brand-green-soft/40 p-8 sm:p-14">
          <div className="grid gap-12 md:grid-cols-[1fr_1.2fr] md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Publications
              </p>
              <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
                Stories, teaching, and the mark of our identity.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                From the flagship Wholeness Magazine to the Logo Exploration
                Handbook — publications that carry the story of CMDA Nigeria.
              </p>
              <Link
                to="/shop"
                search={{ category: "Publications" } as never}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3.5 text-sm font-semibold text-background transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                Explore publications <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-5">
              {allProducts
                .filter((p) => p.category === "Publications")
                .map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
