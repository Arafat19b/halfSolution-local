"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/layout/Avatar";
import { Logo } from "@/components/layout/Logo";
import { OllamaStatusBadge } from "@/components/layout/OllamaStatusBadge";
import { usePrefs } from "@/lib/store";

const TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  analyze: "Nouvelle analyse",
  history: "Mes analyses",
  opportunities: "Opportunités",
  settings: "Paramètres",
  analysis: "Résultats",
};

function crumbs(pathname: string): { title: string; trail: Array<{ label: string; href: string }> } {
  const [first, second] = pathname.split("/").filter(Boolean);
  if (first === "analysis" && second) return { title: "Analyse", trail: [{ label: "Mes analyses", href: "/history" }] };
  if (first === "opportunities" && second) return { title: "Détail de l'opportunité", trail: [{ label: "Opportunités", href: "/opportunities" }] };
  return { title: TITLES[first ?? "dashboard"] ?? "HalfSolution", trail: [] };
}

export function Header() {
  const pathname = usePathname();
  const { prefs } = usePrefs();
  const { title, trail } = crumbs(pathname);

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/dashboard" className="md:hidden" aria-label="HalfSolution">
            <Logo showWord={false} />
          </Link>
          <div className="min-w-0">
            {trail.length > 0 && (
              <nav aria-label="Fil d'Ariane" className="text-xs text-muted">
                {trail.map((t) => (
                  <Link key={t.href} href={t.href} className="hover:text-charcoal">{t.label}</Link>
                ))}
                <span aria-hidden className="mx-1.5">/</span>
              </nav>
            )}
            <p className="truncate font-serif text-lg font-medium leading-tight">{title}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <OllamaStatusBadge />
          <Link href="/settings" aria-label="Profil et paramètres" className="hidden sm:block">
            <Avatar name={prefs.profileName} />
          </Link>
        </div>
      </div>
    </header>
  );
}
