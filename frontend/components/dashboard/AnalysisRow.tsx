import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatPct, productTitle } from "@/lib/utils";
import type { AnalysisRecord } from "@/types";

/** Ligne d'analyse : nom, date, score de couverture, nombre d'opportunités, lien vers les résultats. */
export function AnalysisRow({ record, actions }: { record: AnalysisRecord; actions?: ReactNode }) {
  const { score, monetization_opportunities: opps, evaluations } = record.result;
  return (
    <li className="flex flex-col gap-3 rounded-xl border border-line bg-paper p-4 shadow-soft sm:flex-row sm:items-center sm:gap-5">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{productTitle(record.result)}</p>
        <p className="text-xs text-muted">{formatDate(record.createdAt)} · {evaluations.length} tâche{evaluations.length > 1 ? "s" : ""}</p>
      </div>
      <div className="w-full sm:w-44">
        <div className="flex items-baseline justify-between text-xs text-muted">
          <span>Couverture IA</span>
          <span className="text-sm font-medium tabular-nums text-charcoal">{formatPct(score.ai_coverage)}</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-lemon" role="img" aria-label={`Couverture IA ${formatPct(score.ai_coverage)}`}>
          <div className="h-full bg-olive" style={{ width: `${Math.min(100, Math.max(0, score.ai_coverage))}%` }} />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <Badge tone={opps.length ? "lemon" : "neutral"}>{opps.length} opportunité{opps.length > 1 ? "s" : ""}</Badge>
        <div className="flex items-center gap-1">
          {actions}
          <Link href={`/analysis/${record.id}`} className="inline-flex min-h-9 items-center rounded-lg bg-sage px-3 text-sm font-medium text-olive-dark hover:bg-[#E1EAD9]">Consulter</Link>
        </div>
      </div>
    </li>
  );
}
