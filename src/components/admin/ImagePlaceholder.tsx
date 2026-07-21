import { Package } from "lucide-react";

export function ImagePlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-muted via-muted/80 to-muted/60 ${className ?? ""}`}
    >
      <Package className="h-10 w-10 text-muted-foreground/60" />
      <p className="text-xs font-medium text-muted-foreground/70">
        Upload product image
      </p>
    </div>
  );
}
