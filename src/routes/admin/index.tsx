import { createFileRoute } from "@tanstack/react-router";
import {
  Package,
  ShoppingCart,
  DollarSign,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";
import { useOrders } from "@/stores/orders";
import { formatNaira } from "@/data/products";
import { getAllProducts } from "@/stores/adminProducts";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const orders = useOrders((s) => s.orders);

  const totalRevenue = orders.reduce((sum, o) => sum + o.grandTotal, 0);
  const pendingOrders = orders.filter(
    (o) => o.status === "awaiting-payment" || o.status === "payment-submitted",
  ).length;
  const completedOrders = orders.filter(
    (o) => o.status === "completed" || o.status === "delivered",
  ).length;
  const allProducts = getAllProducts();
  const totalProducts = allProducts.length;
  const inStockProducts = allProducts.filter(
    (p) => p.availability === "in-stock",
  ).length;

  const stats = [
    {
      label: "Total Revenue",
      value: formatNaira(totalRevenue),
      icon: DollarSign,
      color: "bg-brand-green-soft text-brand-green",
    },
    {
      label: "Total Orders",
      value: orders.length,
      icon: ShoppingCart,
      color: "bg-primary-soft text-primary",
    },
    {
      label: "Pending Verification",
      value: pendingOrders,
      icon: Clock,
      color: "bg-preorder text-preorder-foreground",
    },
    {
      label: "Completed",
      value: completedOrders,
      icon: TrendingUp,
      color: "bg-brand-green-soft text-brand-green",
    },
    {
      label: "Products",
      value: `${inStockProducts}/${totalProducts} in stock`,
      icon: Package,
      color: "bg-secondary text-muted-foreground",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Dashboard Overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome to the CMDA Nigeria store admin panel.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-border/50 bg-card p-5"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`grid h-10 w-10 place-items-center rounded-xl ${stat.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 font-display text-2xl font-bold text-foreground">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent orders */}
      <div className="rounded-2xl border border-border/50 bg-card">
        <div className="border-b border-border px-6 py-4">
          <p className="font-display text-lg font-bold text-foreground">Recent Orders</p>
        </div>
        {orders.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No orders yet. They'll appear here once customers start ordering.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {orders
              .slice()
              .reverse()
              .slice(0, 5)
              .map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-4 px-6 py-4"
                >
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {order.orderNumber} — {order.customerName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">
                      {formatNaira(order.grandTotal)}
                    </p>
                    <p className="text-xs capitalize text-muted-foreground">
                      {order.status.replace(/-/g, " ")}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
