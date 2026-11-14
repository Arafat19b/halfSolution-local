import { cn } from "@/lib/utils";

/** Logo typographique : un disque coupé en deux (la moitié que l'IA couvre, la moitié qui reste). */
export function Logo({ tone = "dark", showWord = true, className }: { tone?: "dark" | "light"; showWord?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden className="shrink-0">
        <path d="M13 1a12 12 0 0 0 0 24z" fill="#5C7C47" />
        <path d="M13 1a12 12 0 0 1 0 24z" fill="#D6E85A" />
      </svg>
      {showWord && (
        <span className={cn("font-serif text-[1.3rem] font-medium leading-none tracking-tight", tone === "light" ? "text-cream" : "text-charcoal")}>
          Half<span className={tone === "light" ? "text-lemon" : "text-olive"}>Solution</span>
        </span>
      )}
    </span>
  );
}
