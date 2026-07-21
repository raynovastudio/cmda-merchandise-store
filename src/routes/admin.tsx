import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Calendar,
  ChevronLeft,
  Menu,
  X,
  Bell,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { LogoMark } from "@/components/site/Logo";
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
    <div className="dark flex h-screen overflow-hidden bg-background text-foreground">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Sidebar header */}
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
            <LogoMark className="h-6 w-auto brightness-0 invert" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">CMDA Store</p>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 text-muted-foreground hover:text-foreground lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
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
                  className: "bg-primary/15 text-primary font-semibold",
                }}
                activeOptions={{ exact: item.to === "/admin" }}
              >
                <Icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Back to store */}
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

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-lg text-foreground lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground">
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
