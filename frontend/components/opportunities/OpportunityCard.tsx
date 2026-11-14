import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import type { OpportunityView } from "@/types";

/** Carte d'opportunité. `showOrigin` ajoute l'analyse d'origine (page Opportunités). */
export function OpportunityCard({ o, showOrigin = false }: { o: OpportunityView; showOrigin?: boolean }) {
  return (
    <li className="flex flex-col rounded-xl border border-[#C4D74A] bg-paper p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-sans text-base font-semibold leading-snug">{o.task}</h3>
        {o.capability !== null && <Badge tone="lemon">IA : {o.capability} %</Badge>}
      </div>

      <div className="mt-3 border-l-4 border-lemon pl-3">
        <p className="text-xs text-muted">Limite identifiée</p>
        <p className="mt-0.5 text-sm">{o.reason}</p>
      </div>
      <p className="mt-3 text-sm text-muted">
        {o.capability !== null
          ? `Le modèle estime pouvoir réaliser environ ${o.capability} % de cette tâche seul : le reste est un besoin que ni lui ni un simple outil d'IA ne comble. À confirmer auprès de clients réels.`
          : "Le modèle reconnaît une limite sur cette tâche : à confirmer auprès de clients réels."}
      </p>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
        {showOrigin ? (
          <Link href={`/analysis/${o.analysisId}`} className="text-xs text-muted underline-offset-2 hover:text-charcoal hover:underline">
            {o.analysisName} · {formatDate(o.analysisDate)}
          </Link>
        ) : <span />}
        <Link href={`/opportunities/${o.id}`} className="inline-flex min-h-9 items-center gap-1 text-sm font-medium text-olive-dark hover:underline">
          Voir le détail <ArrowUpRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
    </li>
  );
}
