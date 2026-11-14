"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavIcon, isActive } from "@/components/layout/nav-icons";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Barre d'onglets fixe en bas de l'écran, sous le breakpoint md. */
export function MobileNavigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigation principale" className="fixed inset-x-0 bottom-0 z-30 border-t border-cream/10 bg-charcoal pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="grid grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn("flex min-h-[3.75rem] flex-col items-center justify-center gap-1 text-[11px]", active ? "text-paper" : "text-cream/60")}
              >
                <NavIcon name={item.icon} className={cn("h-5 w-5", active && "text-lemon")} />
                {item.short}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
