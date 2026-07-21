import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Calendar,
  Settings,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { LogoFull, LogoMark } from "@/components/site/Logo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — CMDA Nigeria Store" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const sidebarNav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/conferences", label: "Conferences", icon: Calendar },
];

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <LogoMark className="h-9 w-auto" />
          <div>
            <p className="font-display text-sm font-semibold text-foreground">
              CMDA Store
            </p>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden"
          >
            <X className="h-5 w-5 text-foreground" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {sidebarNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{
                  className:
                    "bg-primary-soft text-primary font-semibold",
                }}
                activeOptions={{ exact: item.to === "/admin" }}
              >
                <Icon className="h-4.5 w-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border px-3 py-4">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Store
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <header className="flex items-center gap-3 border-b border-border bg-background/85 backdrop-blur-xl px-4 py-3 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-lg text-foreground lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="font-display text-lg font-bold text-foreground">Admin</h2>
        </header>
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
