import type { ReactNode } from "react";
import { LEVELS, levelFor } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "olive" | "lemon" | "sage"; className?: string }) {
  const tones = {
    neutral: "bg-cream text-muted border-line",
    olive: "bg-olive text-paper border-olive",
    sage: "bg-sage text-olive-dark border-[#D7E2CC]",
    lemon: "bg-lemon text-charcoal border-[#C4D74A]",
  };
  return <span className={cn("inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium", tones[tone], className)}>{children}</span>;
}

export function CoverageBadge({ capability }: { capability: number }) {
  const level = levelFor(capability);
  const tone = level === "high" ? "olive" : level === "medium" ? "sage" : "lemon";
  return <Badge tone={tone}>{LEVELS[level].label}</Badge>;
}
