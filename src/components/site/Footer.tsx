import { Link } from "@tanstack/react-router";
import { LogoFull } from "./Logo";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/40 bg-foreground text-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center rounded-xl bg-white/10 px-3 py-2">
              <LogoFull className="h-11 w-auto" />
            </div>
            <span className="font-display text-lg font-bold text-background">CMDA Nigeria</span>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-background/60">
            The official merchandise store of the Christian Medical and Dental
            Association of Nigeria — Students&apos; Arm. Wear the vision. Support the mission.
          </p>
        </div>
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-background/40">
            Shop
          </p>
          <ul className="space-y-2.5 text-sm text-background/70">
            <li><Link to="/shop" className="transition-colors hover:text-background">All Merchandise</Link></li>
            <li><Link to="/shop" search={{ category: "Apparel" } as never} className="transition-colors hover:text-background">Apparel</Link></li>
            <li><Link to="/shop" search={{ category: "Publications" } as never} className="transition-colors hover:text-background">Publications</Link></li>
            <li><Link to="/cart" className="transition-colors hover:text-background">Cart</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-background/40">
            National Office
          </p>
          <ul className="space-y-2.5 text-sm text-background/70">
            <li>Wholeness House Gwagwalada, FCT.</li>
            <li>office@cmdanigeria.org</li>
            <li>+234 (809) 153 3339</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-background/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-background/40 sm:flex-row sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} CMDA Nigeria — Students&apos; Arm. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="h-3 w-3 fill-current text-destructive" /> for the mission
          </p>
        </div>
      </div>
    </footer>
  );
}
