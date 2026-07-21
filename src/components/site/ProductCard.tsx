import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/data/products";
import { formatNaira } from "@/data/products";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { useProductImage } from "@/stores/adminProducts";
import { ImagePlaceholder } from "@/components/admin/ImagePlaceholder";

export function ProductCard({ product }: { product: Product }) {
  const imgSrc = useProductImage(product.id, product.image);

  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/40 bg-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.12)]"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-muted via-muted/80 to-muted/60">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <ImagePlaceholder className="h-full w-full" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          <AvailabilityBadge availability={product.availability} />
          {product.isNew && (
            <span className="rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground backdrop-blur-md">
              New
            </span>
          )}
          {product.bestSeller && (
            <span className="rounded-full bg-foreground/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-background backdrop-blur-md">
              Bestseller
            </span>
          )}
        </div>
        <div className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 translate-y-2">
          <ArrowUpRight className="h-4 w-4 text-foreground" />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary/70">
          {product.category}
        </p>
        <h3 className="font-display text-base font-semibold leading-snug text-foreground line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {product.shortDescription}
        </p>
        <div className="mt-auto pt-2">
          <span className="font-display text-base font-bold text-foreground">
            {formatNaira(product.price)}
          </span>
        </div>
      </div>
    </Link>
  );
}
