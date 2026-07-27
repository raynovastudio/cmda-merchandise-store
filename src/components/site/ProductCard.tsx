import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import type { Product } from "@/data/products";
import { formatNaira } from "@/data/products";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { useProductImage } from "@/stores/adminProducts";
import { ImagePlaceholder } from "@/components/admin/ImagePlaceholder";

export function ProductCard({ product }: { product: Product }) {
  const imgSrc = useProductImage(product.id, product.image);
  const hasExternalUrl = !!product.externalUrl;
  const buttonLabel = product.externalUrlLabel || "Learn More";

  if (hasExternalUrl) {
    return (
      <a
        href={product.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex flex-col overflow-hidden rounded-xl border border-border/40 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)]"
      >
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted via-muted/80 to-muted/60">
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
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            <AvailabilityBadge availability={product.availability} />
            {product.isNew && (
              <span className="rounded-full bg-primary/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground backdrop-blur-md">
                New
              </span>
            )}
            {product.bestSeller && (
              <span className="rounded-full bg-foreground/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-background backdrop-blur-md">
                Bestseller
              </span>
            )}
          </div>
          <div className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 translate-y-1.5">
            <ExternalLink className="h-3.5 w-3.5 text-foreground" />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-0.5 p-2.5">
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-primary/70">
            {product.category}
          </p>
          <h3 className="font-display text-[13px] font-semibold leading-snug text-foreground line-clamp-1">
            {product.name}
          </h3>
          <p className="hidden text-[11px] leading-relaxed text-muted-foreground line-clamp-2 sm:line-clamp-1">
            {product.shortDescription}
          </p>
          <div className="mt-auto flex items-center justify-between gap-1 pt-1">
            <span className="font-display text-xs font-bold text-foreground">
              {formatNaira(product.price)}
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
              <ExternalLink className="h-2.5 w-2.5" />
              {buttonLabel}
            </span>
          </div>
        </div>
      </a>
    );
  }

  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border/40 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)]"
    >
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted via-muted/80 to-muted/60">
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
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          <AvailabilityBadge availability={product.availability} />
          {product.isNew && (
            <span className="rounded-full bg-primary/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground backdrop-blur-md">
              New
            </span>
          )}
          {product.bestSeller && (
            <span className="rounded-full bg-foreground/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-background backdrop-blur-md">
              Bestseller
            </span>
          )}
        </div>
        <div className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 translate-y-1.5">
          <ArrowUpRight className="h-3.5 w-3.5 text-foreground" />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-0.5 p-2.5">
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-primary/70">
          {product.category}
        </p>
        <h3 className="font-display text-[13px] font-semibold leading-snug text-foreground line-clamp-1">
          {product.name}
        </h3>
        <p className="hidden text-[11px] leading-relaxed text-muted-foreground line-clamp-2 sm:line-clamp-1">
          {product.shortDescription}
        </p>
        <div className="mt-auto pt-1">
          <span className="font-display text-xs font-bold text-foreground">
            {formatNaira(product.price)}
          </span>
        </div>
      </div>
    </Link>
  );
}
