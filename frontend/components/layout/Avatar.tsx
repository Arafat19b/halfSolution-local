import { User } from "lucide-react";
import { cn } from "@/lib/utils";

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  return (
    <span aria-hidden className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage text-sm font-medium text-olive-dark", className)}>
      {initials || <User className="h-4 w-4" />}
    </span>
  );
}
