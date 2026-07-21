import type { Availability } from "@/data/products";
import { cn } from "@/lib/utils";

export function AvailabilityBadge({
  availability,
  className,
}: {
  availability: Availability;
  className?: string;
}) {
  const inStock = availability === "in-stock";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm",
        inStock
          ? "bg-instock/90 text-instock-foreground"
          : "bg-preorder/90 text-preorder-foreground",
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          inStock ? "bg-brand-green" : "bg-preorder-foreground",
        )}
        aria-hidden
      />
      {inStock ? "In Stock" : "Pre-Order"}
    </span>
  );
}
