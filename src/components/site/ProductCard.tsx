import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/data/products";
import { formatNaira } from "@/data/products";
import { AvailabilityBadge } from "./AvailabilityBadge";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={1024}
          height={1280}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          <AvailabilityBadge availability={product.availability} />
          {product.isNew && (
            <span className="rounded-full bg-primary/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground backdrop-blur-sm">
              New
            </span>
          )}
          {product.bestSeller && (
            <span className="rounded-full bg-foreground/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-background backdrop-blur-sm">
              Bestseller
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          {product.category}
        </p>
        <h3 className="font-display text-lg font-semibold leading-snug text-foreground">
          {product.name}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {product.shortDescription}
        </p>
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="font-display text-lg font-bold text-foreground">
            {formatNaira(product.price)}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2">
            View <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
