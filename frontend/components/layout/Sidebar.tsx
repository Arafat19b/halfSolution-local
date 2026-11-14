"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/layout/Avatar";
import { Logo } from "@/components/layout/Logo";
import { NavIcon, isActive } from "@/components/layout/nav-icons";
import { NAV_ITEMS } from "@/lib/constants";
import { usePrefs } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Fixe dès md : barre d'icônes sur tablette, barre complète sur grand écran. Masquée sur mobile (voir MobileNavigation). */
export function Sidebar() {
  const pathname = usePathname();
  const { prefs } = usePrefs();
  const name = prefs.profileName.trim();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[72px] flex-col bg-charcoal text-cream md:flex lg:w-64">
      <div className="flex h-16 items-center justify-center px-4 lg:justify-start lg:px-6">
        <Link href="/dashboard" aria-label="HalfSolution, retour au dashboard">
          <Logo tone="light" className="[&>span]:hidden lg:[&>span]:inline" />
        </Link>
      </div>

      <nav aria-label="Navigation principale" className="mt-4 flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-11 items-center justify-center gap-3 rounded-lg text-sm transition-colors lg:justify-start lg:px-3",
                active ? "bg-cream/10 text-paper" : "text-cream/65 hover:bg-cream/5 hover:text-paper",
              )}
            >
              <NavIcon name={item.icon} className={cn("h-5 w-5 shrink-0", active && "text-lemon")} />
              <span className="hidden lg:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-cream/10 p-3">
        <Link href="/settings" title="Profil local" className="flex items-center justify-center gap-3 rounded-lg p-2 hover:bg-cream/5 lg:justify-start">
          <Avatar name={name} />
          <span className="hidden min-w-0 lg:block">
            <span className="block truncate text-sm text-paper">{name || "Profil local"}</span>
            <span className="block truncate text-xs text-cream/50">Données stockées dans ce navigateur</span>
          </span>
        </Link>
      </div>
    </aside>
  );
}
