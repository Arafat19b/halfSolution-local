"use client";

import { useEffect, useState } from "react";
import { formatPct } from "@/lib/utils";

/**
 * Élément signature : la barre « moitié-solution ».
 * La part couverte par l'IA (olive) est séparée du besoin restant (jaune citron).
 * Valeurs reçues du backend, jamais recalculées ici.
 */
export function SplitBar({ coverage, gap, animate = true }: { coverage: number; gap: number; animate?: boolean }) {
  const [shown, setShown] = useState(animate ? 0 : coverage);
  useEffect(() => {
    if (!animate) {
      setShown(coverage);
      return;
    }
    const t = requestAnimationFrame(() => setShown(coverage));
    return () => cancelAnimationFrame(t);
  }, [coverage, animate]);

  const pct = Math.min(100, Math.max(0, shown));
  return (
    <div>
      <div
        role="img"
        aria-label={`Couverture IA estimée ${formatPct(coverage)}, besoin non couvert ${formatPct(gap)}`}
        className="relative h-14 overflow-hidden rounded-xl bg-lemon sm:h-16"
      >
        <div className="h-full bg-olive transition-[width] duration-1000 ease-out" style={{ width: `${pct}%` }} />
        <div className="absolute inset-y-0 w-0.5 bg-paper transition-[left] duration-1000 ease-out" style={{ left: `calc(${pct}% - 1px)` }} aria-hidden />
      </div>
      <div className="mt-3 flex flex-col gap-1.5 text-sm sm:flex-row sm:justify-between sm:gap-4">
        <p><span className="mr-2 inline-block h-2.5 w-2.5 rounded-sm bg-olive align-middle" aria-hidden />Couvert par l&apos;IA <strong className="ml-1 tabular-nums">{formatPct(coverage)}</strong></p>
        <p className="sm:text-right"><span className="mr-2 inline-block h-2.5 w-2.5 rounded-sm bg-lemon align-middle ring-1 ring-[#C4D74A]" aria-hidden />Non couvert <strong className="ml-1 tabular-nums">{formatPct(gap)}</strong></p>
      </div>
    </div>
  );
}
