import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Package,
  Sparkles,
  Truck,
  HandHeart,
  Shield,
  BookOpen,
  Star,
  ChevronRight,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { useProducts } from "@/stores/adminProducts";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const allProducts = useProducts();
  const featured = allProducts.filter((p) => p.featured);
  const publications = allProducts.filter((p) => p.category === "Publications");

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-primary/[0.02]">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-primary/[0.03] blur-[100px]" />
          <div className="absolute top-1/2 -left-32 h-[400px] w-[400px] rounded-full bg-brand-green/[0.03] blur-[100px]" />
        </div>
        <div className="mx-auto max-w-7xl px-4 pt-8 pb-16 sm:px-6 sm:pt-12 sm:pb-20 lg:px-8 lg:pt-16 lg:pb-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            {/* Left: copy */}
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Official CMDA Nigeria Store
              </div>

              <h1 className="mt-8 text-balance text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Wear the Vision.
                <br />
                <span className="bg-gradient-to-r from-primary via-primary to-brand-green bg-clip-text text-transparent">
                  Support the Mission.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                Purchase authentic CMDA Nigeria merchandise and publications.
                Choose delivery, collect at a conference, or authorize someone to
                collect on your behalf.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-elegant transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  Shop Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-7 py-3.5 text-sm font-semibold text-foreground shadow-card transition-all hover:shadow-card-hover hover:-translate-y-0.5"
                >
                  Browse Collection
                </Link>
              </div>

              {/* Trust strip */}
              <div className="mt-14 flex flex-wrap items-center gap-8 border-t border-border/60 pt-8">
                {[
                  { icon: Shield, label: "Authentic", sub: "Official CMDA goods" },
                  { icon: Truck, label: "Nationwide", sub: "Delivery available" },
                  { icon: HandHeart, label: "Delegate", sub: "Pickup options" },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {label}
                      </p>
                      <p className="text-xs text-muted-foreground">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: hero image */}
            <div
              className="relative animate-fade-up"
              style={{ animationDelay: "120ms" }}
            >
              <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-primary-soft/50 via-transparent to-brand-green-soft/40 blur-xl opacity-70" />
              <div className="relative overflow-hidden rounded-3xl border border-border/30 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.12)]">
                <img
                  src="/New Hero Image.png"
                  alt="CMDA Nigeria members in branded merchandise"
                  width={1600}
                  height={1200}
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-border/60 bg-white/90 p-4 shadow-card backdrop-blur-md sm:block dark:bg-card/90">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-green-soft text-brand-green">
                    <Star className="h-5 w-5 fill-brand-green text-brand-green" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Trusted by chapters
                    </p>
                    <p className="text-xs text-muted-foreground">
                      across Nigeria
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border/40 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
            {[
              {
                icon: Package,
                step: "01",
                title: "Choose your items",
                body: "Browse the collection and add to your cart.",
              },
              {
                icon: HandHeart,
                step: "02",
                title: "Select fulfillment",
                body: "Pickup at a conference, at our office, or delivery to your state.",
              },
              {
                icon: Truck,
                step: "03",
                title: "Receive your order",
                body: "Collect in person or receive via nationwide waybill.",
              },
            ].map(({ icon: Icon, step, title, body }) => (
              <div key={step} className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {step}
                  </span>
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="font-display text-base font-semibold text-foreground">
                    {title}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Featured
            </p>
            <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
              This season&apos;s essentials
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Handpicked items our community loves — from conference-ready
              apparel to meaningful publications.
            </p>
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

      {/* Publications banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-primary/[0.04] via-background to-brand-green/[0.04]">
          <div className="grid items-center gap-0 md:grid-cols-[1fr_1.3fr]">
            {/* Left: copy */}
            <div className="p-8 sm:p-12 lg:p-14">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                <BookOpen className="h-3.5 w-3.5" />
                Publications
              </div>
              <h2 className="mt-6 text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
                Stories, teaching, and the mark of our identity.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
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
            {/* Right: publication cards */}
            <div className="grid grid-cols-2 gap-4 p-6 sm:p-8 lg:p-10">
              {publications.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
              {publications.length === 0 && (
                <div className="col-span-2 flex items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/50 p-10 text-center">
                  <div>
                    <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/40" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      Publications coming soon
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mission / CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-foreground px-8 py-16 text-center sm:px-16 sm:py-20">
          <div className="absolute inset-0 -z-10">
            <div className="absolute -top-20 -right-20 h-[300px] w-[300px] rounded-full bg-primary/20 blur-[120px]" />
            <div className="absolute -bottom-20 -left-20 h-[250px] w-[250px] rounded-full bg-brand-green/20 blur-[100px]" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-background/50">
            Our Mission
          </p>
          <h2 className="mt-5 text-balance text-3xl font-bold text-background sm:text-4xl lg:text-5xl">
            Every purchase supports the
            <br className="hidden sm:block" /> training and outreach of
            <br className="hidden sm:block" /> Christian healthcare professionals.
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-background/60 sm:text-base">
            CMDA Nigeria exists to equip and send. Your merchandise order is more
            than a product — it&apos;s a partnership in the mission.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-elegant transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              Shop to support <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-background/20 bg-transparent px-7 py-3.5 text-sm font-semibold text-background transition-all hover:bg-background/10"
            >
              Track your order <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
