import { Link } from "@tanstack/react-router";
import { ShoppingBag, Menu, X, User, Shield } from "lucide-react";
import { useState } from "react";
import { LogoFull, LogoMark } from "./Logo";
import { useCartCount } from "@/stores/cart";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/shop", label: "Apparel", search: { category: "Apparel" as const } },
  { to: "/shop", label: "Publications", search: { category: "Publications" as const } },
];

export function Header() {
  const count = useCartCount();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <LogoMark className="h-10 w-auto shrink-0 sm:hidden" />
          <LogoFull className="hidden h-10 w-auto shrink-0 sm:block" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item, i) => (
            <Link
              key={i}
              to={item.to}
              search={item.search as never}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeOptions={{ exact: true }}
              activeProps={{ className: "bg-primary/8 text-primary font-semibold" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            to="/dashboard"
            className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:inline-flex"
          >
            <User className="h-4 w-4" />
            <span>Orders</span>
          </Link>
          <Link
            to="/admin"
            className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:inline-flex"
          >
            <Shield className="h-4 w-4" />
            <span>Admin</span>
          </Link>
          <div className="mx-1 hidden h-5 w-px bg-border sm:block" />
          <Link
            to="/cart"
            className="relative inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:shadow-md hover:-translate-y-px"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            <span
              className={cn(
                "inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1.5 text-[11px] font-bold tabular-nums",
                count === 0 && "hidden",
              )}
            >
              {count}
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-secondary md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-border/40 transition-all duration-300 md:hidden",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <nav className="mx-auto flex max-w-7xl flex-col gap-0.5 px-4 py-3 sm:px-6">
          {nav.map((item, i) => (
            <Link
              key={i}
              to={item.to}
              search={item.search as never}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              {item.label}
            </Link>
          ))}
          <div className="my-1.5 h-px bg-border" />
          <Link
            to="/dashboard"
            onClick={() => setOpen(false)}
            className="rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            My Orders
          </Link>
          <Link
            to="/admin"
            onClick={() => setOpen(false)}
            className="rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
