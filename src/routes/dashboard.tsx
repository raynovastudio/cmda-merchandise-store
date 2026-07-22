import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Package,
  ShoppingBag,
  ChevronRight,
  User,
  Search,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { StatusBadge, OrderTimeline } from "@/components/site/OrderTimeline";
import { useOrders, ORDER_STATUS_LABELS, type Order } from "@/stores/orders";
import { formatNaira } from "@/data/products";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My Orders — CMDA Nigeria Store" },
      { name: "description", content: "Track your CMDA Nigeria merchandise orders." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

type Tab = "all" | "active" | "completed";

function DashboardPage() {
  const allOrders = useOrders((s) => s.orders);
  const [tab, setTab] = useState<Tab>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Email-based identity
  const [lookupEmail, setLookupEmail] = useState(
    () => localStorage.getItem("cmda-customer-email") ?? "",
  );
  const [emailInput, setEmailInput] = useState(lookupEmail);
  const [submitted, setSubmitted] = useState(!!lookupEmail);

  const customerEmail = lookupEmail.trim().toLowerCase();
  const myOrders = submitted
    ? allOrders.filter((o) => o.customerEmail.trim().toLowerCase() === customerEmail)
    : [];

  const filtered = myOrders.filter((o) => {
    if (tab === "active") return !["completed", "cancelled"].includes(o.status);
    if (tab === "completed") return ["completed", "delivered"].includes(o.status);
    return true;
  });

  const activeCount = myOrders.filter(
    (o) => !["completed", "cancelled"].includes(o.status),
  ).length;

  const handleLookup = () => {
    const email = emailInput.trim();
    if (!email) return;
    localStorage.setItem("cmda-customer-email", email);
    setLookupEmail(email);
    setSubmitted(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("cmda-customer-email");
    setLookupEmail("");
    setEmailInput("");
    setSubmitted(false);
    setSelectedOrder(null);
  };

  if (selectedOrder) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <button
            onClick={() => setSelectedOrder(null)}
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to orders
          </button>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Order
              </p>
              <h1 className="mt-1 font-display text-3xl font-bold text-foreground">
                {selectedOrder.orderNumber}
              </h1>
            </div>
            <StatusBadge status={selectedOrder.status} />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <p className="font-display text-lg font-bold text-foreground">
                Order Timeline
              </p>
              <div className="mt-4">
                <OrderTimeline order={selectedOrder} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-border/50 bg-card p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Items
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
                        <p className="truncate font-semibold text-foreground">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`]
                            .filter(Boolean)
                            .join(" · ") || "One size"}{" "}
                          × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-foreground">
                        {formatNaira(item.price * item.quantity)}
                      </p>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold text-foreground">
                      {formatNaira(selectedOrder.subtotal)}
                    </span>
                  </div>
                  {selectedOrder.deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className="font-semibold text-foreground">
                        {formatNaira(selectedOrder.deliveryFee)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="font-display text-foreground">Total</span>
                    <span className="font-display text-foreground">
                      {formatNaira(selectedOrder.grandTotal)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/50 bg-card p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Fulfillment
                </p>
                <p className="mt-2 text-sm font-medium capitalize text-foreground">
                  {selectedOrder.fulfillmentMethod.replace(/-/g, " ")}
                </p>
                {selectedOrder.conferencePickup && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedOrder.conferencePickup.conferenceName}
                  </p>
                )}
                {selectedOrder.fulfillmentMethod === "wholeness-pickup" && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Wholeness House, Gwagwalada, FCT
                  </p>
                )}
                {selectedOrder.delivery && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <p>{selectedOrder.delivery.recipientName}</p>
                    <p>
                      {selectedOrder.delivery.address},{" "}
                      {selectedOrder.delivery.city},{" "}
                      {selectedOrder.delivery.state}
                    </p>
                  </div>
                )}
                {selectedOrder.pickupCode && (
                  <div className="mt-3 rounded-xl bg-secondary/60 p-3">
                    <p className="text-xs text-muted-foreground">Pickup Code</p>
                    <p className="font-display text-xl tracking-wider text-foreground">
                      {selectedOrder.pickupCode}
                    </p>
                  </div>
                )}
              </div>

              {selectedOrder.paymentProof && (
                <div className="rounded-2xl border border-border/50 bg-card p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    Payment Proof
                  </p>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <p>{selectedOrder.paymentProof.fileName}</p>
                    <p>Amount: {formatNaira(selectedOrder.paymentProof.amountPaid)}</p>
                    <p>Date: {selectedOrder.paymentProof.paymentDate}</p>
                    {selectedOrder.paymentProof.paymentReference && (
                      <p>Ref: {selectedOrder.paymentProof.paymentReference}</p>
                    )}
                  </div>
                  {selectedOrder.paymentProof.fileDataUrl &&
                    selectedOrder.paymentProof.fileDataUrl.startsWith("data:image") && (
                      <img
                        src={selectedOrder.paymentProof.fileDataUrl}
                        alt="Payment proof"
                        className="mt-3 max-h-40 rounded-xl border border-border object-contain"
                      />
                    )}
                </div>
              )}
            </div>
          </div>
        </section>
      </SiteLayout>
    );
  }

  // Email lookup screen
  if (!submitted) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-primary-soft text-primary">
              <User className="h-6 w-6" />
            </div>
            <h1 className="mt-4 font-display text-3xl font-bold text-foreground">
              Track Your Orders
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter the email address you used at checkout to see your orders.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-border/50 bg-card p-6 shadow-card">
            <label className="mb-2 block text-sm font-semibold text-foreground">
              Email Address
            </label>
            <div className="flex gap-2">
              <input
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                type="email"
                className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                placeholder="john@example.com"
              />
              <button
                onClick={handleLookup}
                disabled={!emailInput.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Search className="h-4 w-4" />
                Find Orders
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Don't have an account? No problem — just use the same email you entered when placing your order.
          </p>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="border-b border-border/50 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
                  My Orders
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {lookupEmail}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Switch Email</span>
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-1 rounded-xl border border-border bg-background p-1">
          {(
            [
              { key: "all" as Tab, label: "All Orders", count: myOrders.length },
              { key: "active" as Tab, label: "Active", count: activeCount },
              {
                key: "completed" as Tab,
                label: "Completed",
                count: myOrders.length - activeCount,
              },
            ] as const
          ).map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                tab === key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-16 rounded-3xl border border-dashed border-border p-12 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-primary-soft text-primary">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <p className="mt-4 font-display text-2xl text-foreground">
              {tab === "all"
                ? "No orders found"
                : tab === "active"
                  ? "No active orders"
                  : "No completed orders"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {tab === "all"
                ? `No orders found for ${lookupEmail}. Check the email you used at checkout.`
                : "Check back later."}
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              Browse merchandise
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filtered.map((order) => (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="w-full rounded-2xl border border-border/50 bg-card shadow-card p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-card"
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
                      {new Date(order.createdAt).toLocaleDateString("en-NG", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg font-bold text-foreground">
                      {formatNaira(order.grandTotal)}
                    </p>
                    <p className="text-xs capitalize text-muted-foreground">
                      {order.fulfillmentMethod.replace(/-/g, " ")}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="h-4 w-4" />
                  {order.items.length} item{order.items.length > 1 ? "s" : ""}
                  <ChevronRight className="h-4 w-4" />
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
