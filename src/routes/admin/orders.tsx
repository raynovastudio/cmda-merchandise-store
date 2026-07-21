import { createFileRoute } from "@tanstack/react-router";
import {
  Search,
  ChevronRight,
  Download,
  CheckCircle2,
  XCircle,
  QrCode,
  Printer,
} from "lucide-react";
import { useState } from "react";
import {
  useOrders,
  ORDER_STATUS_LABELS,
  type Order,
  type OrderStatus,
} from "@/stores/orders";
import { StatusBadge, OrderTimeline } from "@/components/site/OrderTimeline";
import { formatNaira } from "@/data/products";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

type FilterTab = "all" | "awaiting-payment" | "payment-submitted" | "pickup" | "delivery" | "completed";

function AdminOrders() {
  const orders = useOrders((s) => s.orders);
  const updateOrderStatus = useOrders((s) => s.updateOrderStatus);
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showQR, setShowQR] = useState(false);

  const filtered = orders.filter((o) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !o.orderNumber.toLowerCase().includes(q) &&
        !o.customerName.toLowerCase().includes(q) &&
        !o.customerPhone.includes(q) &&
        !o.customerEmail.toLowerCase().includes(q)
      )
        return false;
    }
    if (filterTab === "awaiting-payment")
      return o.status === "awaiting-payment";
    if (filterTab === "payment-submitted")
      return o.status === "payment-submitted";
    if (filterTab === "pickup")
      return (
        o.fulfillmentMethod === "conference-pickup" ||
        o.fulfillmentMethod === "delegate-pickup"
      );
    if (filterTab === "delivery") return o.fulfillmentMethod === "delivery";
    if (filterTab === "completed")
      return ["completed", "delivered"].includes(o.status);
    return true;
  });

  const handleApprovePayment = (orderId: string) => {
    updateOrderStatus(orderId, "payment-verified", "Payment approved by admin.");
  };

  const handleRejectPayment = (orderId: string) => {
    updateOrderStatus(orderId, "cancelled", "Payment rejected by admin.");
  };

  const handleUpdateStatus = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status, `Status updated to ${ORDER_STATUS_LABELS[status]}.`);
  };

  const filterTabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "All", count: orders.length },
    {
      key: "awaiting-payment",
      label: "Awaiting Payment",
      count: orders.filter((o) => o.status === "awaiting-payment").length,
    },
    {
      key: "payment-submitted",
      label: "Needs Verification",
      count: orders.filter((o) => o.status === "payment-submitted").length,
    },
    {
      key: "pickup",
      label: "Pickup Orders",
      count: orders.filter(
        (o) =>
          o.fulfillmentMethod === "conference-pickup" ||
          o.fulfillmentMethod === "delegate-pickup",
      ).length,
    },
    {
      key: "delivery",
      label: "Delivery Orders",
      count: orders.filter((o) => o.fulfillmentMethod === "delivery").length,
    },
    {
      key: "completed",
      label: "Completed",
      count: orders.filter((o) =>
        ["completed", "delivered"].includes(o.status),
      ).length,
    },
  ];

  const exportCSV = () => {
    const headers = [
      "Order Number",
      "Customer",
      "Email",
      "Phone",
      "Total",
      "Status",
      "Fulfillment",
      "Date",
    ];
    const rows = filtered.map((o) => [
      o.orderNumber,
      o.customerName,
      o.customerEmail,
      o.customerPhone,
      String(o.grandTotal),
      ORDER_STATUS_LABELS[o.status],
      o.fulfillmentMethod,
      new Date(o.createdAt).toLocaleDateString("en-NG"),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cmda-orders.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (selectedOrder) {
    const statusOptions: OrderStatus[] = [
      "payment-submitted",
      "payment-verified",
      "preparing-order",
      "ready-for-conference-pickup",
      "ready-for-delegate-pickup",
      "ready-for-delivery",
      "shipped",
      "delivered",
      "completed",
      "cancelled",
    ];

    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedOrder(null)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to orders
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              {selectedOrder.orderNumber}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Placed on{" "}
              {new Date(selectedOrder.createdAt).toLocaleDateString("en-NG", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={selectedOrder.status} />
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground"
            >
              <Printer className="h-4 w-4" /> Print
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            {/* Status controls */}
            <div className="rounded-2xl border border-border/50 bg-card p-5">
              <p className="font-display text-lg font-bold text-foreground">
                Update Status
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {statusOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleUpdateStatus(selectedOrder.id, s)}
                    className={cn(
                      "rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
                      selectedOrder.status === s
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {ORDER_STATUS_LABELS[s]}
                  </button>
                ))}
              </div>

              {selectedOrder.status === "payment-submitted" && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      handleApprovePayment(selectedOrder.id);
                      setSelectedOrder({
                        ...selectedOrder,
                        status: "payment-verified",
                      });
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-green px-4 py-2 text-sm font-semibold text-white"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Approve Payment
                  </button>
                  <button
                    onClick={() => {
                      handleRejectPayment(selectedOrder.id);
                      setSelectedOrder({
                        ...selectedOrder,
                        status: "cancelled",
                      });
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-destructive/15 px-4 py-2 text-sm font-semibold text-destructive"
                  >
                    <XCircle className="h-4 w-4" /> Reject Payment
                  </button>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="rounded-2xl border border-border/50 bg-card p-5">
              <p className="font-display text-lg font-bold text-foreground">Timeline</p>
              <div className="mt-4">
                <OrderTimeline order={selectedOrder} />
              </div>
            </div>

            {/* Items */}
            <div className="rounded-2xl border border-border/50 bg-card p-5">
              <p className="font-display text-lg font-bold text-foreground">
                Items Ordered
              </p>
              <ul className="mt-3 space-y-3">
                {selectedOrder.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`]
                          .filter(Boolean)
                          .join(" · ") || "One size"}{" "}
                        × {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-foreground">
                      {formatNaira(item.price * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">
                    {formatNaira(selectedOrder.subtotal)}
                  </span>
                </div>
                {selectedOrder.deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="font-medium text-foreground">
                      {formatNaira(selectedOrder.deliveryFee)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="font-display text-foreground">
                    Grand Total
                  </span>
                  <span className="font-display text-foreground">
                    {formatNaira(selectedOrder.grandTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Customer */}
            <div className="rounded-2xl border border-border/50 bg-card p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Customer
              </p>
              <div className="mt-2 space-y-1 text-sm">
                <p className="font-medium text-foreground">
                  {selectedOrder.customerName}
                </p>
                <p className="text-muted-foreground">
                  {selectedOrder.customerEmail}
                </p>
                <p className="text-muted-foreground">
                  {selectedOrder.customerPhone}
                </p>
                {selectedOrder.membershipNumber && (
                  <p className="text-muted-foreground">
                    Membership: {selectedOrder.membershipNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Fulfillment */}
            <div className="rounded-2xl border border-border/50 bg-card p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Fulfillment
              </p>
              <div className="mt-2 text-sm">
                <p className="font-medium capitalize text-foreground">
                  {selectedOrder.fulfillmentMethod.replace(/-/g, " ")}
                </p>
                {selectedOrder.conferencePickup && (
                  <p className="mt-1 text-muted-foreground">
                    {selectedOrder.conferencePickup.conferenceName}
                  </p>
                )}
                {selectedOrder.delegatePickup && (
                  <div className="mt-2 space-y-1 text-muted-foreground">
                    <p className="font-medium text-foreground">
                      {selectedOrder.delegatePickup.fullName}
                    </p>
                    <p>{selectedOrder.delegatePickup.phone}</p>
                    <p>{selectedOrder.delegatePickup.email}</p>
                    <p>
                      Relationship: {selectedOrder.delegatePickup.relationship}
                    </p>
                    {selectedOrder.delegatePickup.instructions && (
                      <p className="italic">
                        "{selectedOrder.delegatePickup.instructions}"
                      </p>
                    )}
                  </div>
                )}
                {selectedOrder.delivery && (
                  <div className="mt-2 space-y-1 text-muted-foreground">
                    <p>{selectedOrder.delivery.recipientName}</p>
                    <p>{selectedOrder.delivery.phone}</p>
                    <p>
                      {selectedOrder.delivery.address},{" "}
                      {selectedOrder.delivery.city},{" "}
                      {selectedOrder.delivery.state}
                    </p>
                    {selectedOrder.delivery.instructions && (
                      <p className="italic">
                        "{selectedOrder.delivery.instructions}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Pickup code */}
            {selectedOrder.pickupCode && (
              <div className="rounded-2xl border border-border/50 bg-card p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Pickup Code
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <p className="font-display text-3xl font-bold tracking-wider text-foreground">
                    {selectedOrder.pickupCode}
                  </p>
                  <button
                    onClick={() => setShowQR(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary-soft px-3 py-1.5 text-xs font-medium text-primary"
                  >
                    <QrCode className="h-3.5 w-3.5" /> QR Code
                  </button>
                </div>
                {selectedOrder.pickupVerified && (
                  <p className="mt-2 text-xs text-brand-green">
                    ✓ Pickup verified
                  </p>
                )}
              </div>
            )}

            {/* Payment proof */}
            {selectedOrder.paymentProof && (
              <div className="rounded-2xl border border-border/50 bg-card p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Payment Proof
                </p>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <p>{selectedOrder.paymentProof.fileName}</p>
                  <p>
                    Amount:{" "}
                    {formatNaira(selectedOrder.paymentProof.amountPaid)}
                  </p>
                  <p>Date: {selectedOrder.paymentProof.paymentDate}</p>
                  {selectedOrder.paymentProof.paymentReference && (
                    <p>Ref: {selectedOrder.paymentProof.paymentReference}</p>
                  )}
                </div>
                {selectedOrder.paymentProof.fileDataUrl &&
                  selectedOrder.paymentProof.fileDataUrl.startsWith(
                    "data:image",
                  ) && (
                    <img
                      src={selectedOrder.paymentProof.fileDataUrl}
                      alt="Payment proof"
                      className="mt-3 max-h-48 rounded-xl border border-border object-contain"
                    />
                  )}
              </div>
            )}
          </div>
        </div>

        {/* QR Modal */}
        {showQR && selectedOrder.pickupCode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-2xl">
              <p className="font-display text-xl font-bold text-foreground">
                Pickup Code
              </p>
              <p className="mt-4 font-display text-5xl tracking-wider text-foreground">
                {selectedOrder.pickupCode}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {selectedOrder.customerName}
              </p>
              {selectedOrder.delegatePickup && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Authorized: {selectedOrder.delegatePickup.fullName}
                </p>
              )}
              <button
                onClick={() => setShowQR(false)}
                className="mt-6 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Order Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and fulfill customer orders.
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order #, name, phone, or email..."
          className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-background p-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterTab(tab.key)}
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors",
              filterTab === tab.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center">
          <p className="font-display text-2xl font-bold text-foreground">
            No orders found
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {search ? "Try a different search term." : "No orders match this filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <button
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="w-full rounded-2xl border border-border/50 bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-card"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-lg font-bold text-foreground">
                      {order.orderNumber}
                    </p>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {order.customerName} · {order.customerPhone}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.items.length} item{order.items.length > 1 ? "s" : ""} ·{" "}
                    <span className="capitalize">
                      {order.fulfillmentMethod.replace(/-/g, " ")}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-display text-lg font-bold text-foreground">
                      {formatNaira(order.grandTotal)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
