import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

export function StatCard({ label, value, caption, icon }: { label: string; value: ReactNode; caption?: string; icon?: ReactNode }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted">{label}</p>
        {icon && <span className="text-olive" aria-hidden>{icon}</span>}
      </div>
      <p className="mt-2 font-serif text-4xl font-medium tabular-nums">{value}</p>
      {caption && <p className="mt-1 text-xs text-muted">{caption}</p>}
    </Card>
  );
}
