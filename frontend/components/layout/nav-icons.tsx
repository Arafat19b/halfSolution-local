import { History, LayoutDashboard, PlusCircle, Settings, Sparkles } from "lucide-react";
import type { NAV_ITEMS } from "@/lib/constants";

type IconKey = (typeof NAV_ITEMS)[number]["icon"];

export function NavIcon({ name, className }: { name: IconKey; className?: string }) {
  const props = { className, "aria-hidden": true as const, strokeWidth: 1.75 };
  switch (name) {
    case "layout": return <LayoutDashboard {...props} />;
    case "plus": return <PlusCircle {...props} />;
    case "history": return <History {...props} />;
    case "spark": return <Sparkles {...props} />;
    case "settings": return <Settings {...props} />;
  }
}

export function isActive(pathname: string, href: string): boolean {
  if (href === "/analyze") return pathname === "/analyze";
  if (href === "/history") return pathname === "/history" || pathname.startsWith("/analysis/");
  return pathname === href || pathname.startsWith(href + "/");
}
