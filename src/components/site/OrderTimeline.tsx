import { Check } from "lucide-react";
import {
  ORDER_STATUS_LABELS,
  type OrderStatus,
  type Order,
} from "@/stores/orders";
import { cn } from "@/lib/utils";

const STATUS_ORDER: OrderStatus[] = [
  "awaiting-payment",
  "payment-submitted",
  "payment-verified",
  "preparing-order",
  "ready-for-conference-pickup",
  "ready-for-delegate-pickup",
  "ready-for-delivery",
  "shipped",
  "delivered",
  "completed",
];

export function OrderTimeline({ order }: { order: Order }) {
  const currentIdx = STATUS_ORDER.indexOf(order.status);
  const timelineStatuses = order.timeline.map((t) => t.status);

  return (
    <div className="space-y-0">
      {STATUS_ORDER.map((status, idx) => {
        const isCompleted = timelineStatuses.includes(status);
        const isCurrent = status === order.status;
        const isPast = idx < currentIdx;

        if (
          status === "ready-for-conference-pickup" &&
          order.fulfillmentMethod !== "conference-pickup"
        )
          return null;
        if (
          status === "ready-for-delegate-pickup" &&
          order.fulfillmentMethod !== "delegate-pickup"
        )
          return null;
        if (
          status === "ready-for-delivery" &&
          order.fulfillmentMethod !== "delivery"
        )
          return null;
        if (status === "shipped" && order.fulfillmentMethod !== "delivery")
          return null;
        if (status === "delivered" && order.fulfillmentMethod !== "delivery")
          return null;

        const timelineEntry = order.timeline.find((t) => t.status === status);
        const isActive = isCompleted || isCurrent;

        return (
          <div key={status} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
                  isActive
                    ? "border-brand-green bg-brand-green text-white shadow-sm"
                    : "border-border bg-background text-muted-foreground",
                )}
              >
                {isActive ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : idx + 1}
              </div>
              {idx < STATUS_ORDER.length - 1 && (
                <div
                  className={cn(
                    "w-0.5 flex-1 min-h-6",
                    isPast || isCurrent ? "bg-brand-green" : "bg-border",
                  )}
                />
              )}
            </div>
            <div className="pb-6">
              <p
                className={cn(
                  "text-sm font-semibold",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {ORDER_STATUS_LABELS[status]}
              </p>
              {timelineEntry && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Date(timelineEntry.date).toLocaleDateString("en-NG", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
              {timelineEntry?.note && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {timelineEntry.note}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const colorMap: Record<OrderStatus, string> = {
    "awaiting-payment": "bg-preorder/90 text-preorder-foreground",
    "payment-submitted": "bg-blue-50 text-blue-700",
    "payment-verified": "bg-brand-green-soft text-brand-green",
    "preparing-order": "bg-primary-soft text-primary",
    "ready-for-conference-pickup": "bg-brand-green-soft text-brand-green",
    "ready-for-delegate-pickup": "bg-brand-green-soft text-brand-green",
    "ready-for-delivery": "bg-brand-green-soft text-brand-green",
    shipped: "bg-blue-50 text-blue-700",
    delivered: "bg-brand-green-soft text-brand-green",
    completed: "bg-brand-green text-white",
    cancelled: "bg-destructive/10 text-destructive",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
        colorMap[status],
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
