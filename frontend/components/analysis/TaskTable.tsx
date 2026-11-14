"use client";

import { ChevronDown } from "lucide-react";
import { Fragment, useState } from "react";
import { CoverageBadge, Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { TaskEvaluation } from "@/types";

function Details({ e }: { e: TaskEvaluation }) {
  return (
    <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
      <div className="sm:col-span-2">
        <dt className="text-muted">Limite principale</dt>
        <dd className="mt-0.5">{e.limitation}</dd>
      </div>
      <div><dt className="text-muted">Importance</dt><dd className="mt-0.5">{e.weight} sur 5</dd></div>
      <div><dt className="text-muted">Autonomie du modèle</dt><dd className="mt-0.5 capitalize">{e.autonomy}</dd></div>
      <div><dt className="text-muted">Confiance du modèle dans son estimation</dt><dd className="mt-0.5 capitalize">{e.confidence}</dd></div>
      <div><dt className="text-muted">Capacité IA estimée</dt><dd className="mt-0.5 tabular-nums">{e.capability} %</dd></div>
    </dl>
  );
}

/** Tableau sur md+, cartes empilées sur mobile. Chaque tâche peut être dépliée pour en voir le détail. */
export function TaskTable({ evaluations }: { evaluations: TaskEvaluation[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const toggle = (i: number) => setOpen((o) => (o === i ? null : i));

  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-line bg-paper shadow-soft md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Analyse détaillée des tâches</caption>
          <thead className="border-b border-line bg-cream/60 text-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Tâche</th>
              <th scope="col" className="px-4 py-3 font-medium">Importance</th>
              <th scope="col" className="px-4 py-3 font-medium">Capacité IA</th>
              <th scope="col" className="px-4 py-3 font-medium">Autonomie</th>
              <th scope="col" className="px-4 py-3 font-medium">Limite principale</th>
              <th scope="col" className="w-10 px-2 py-3"><span className="sr-only">Détails</span></th>
            </tr>
          </thead>
          <tbody>
            {evaluations.map((e, i) => (
              <Fragment key={i}>
                <tr className={cn("border-b border-line last:border-0", open === i && "bg-sage/50")}>
                  <td className="max-w-[16rem] px-4 py-3.5 font-medium">{e.task}</td>
                  <td className="px-4 py-3.5 tabular-nums">{e.weight}/5</td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col items-start gap-1.5">
                      <span className="tabular-nums">{e.capability} %</span>
                      <CoverageBadge capability={e.capability} />
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><Badge className="capitalize">{e.autonomy}</Badge></td>
                  <td className="max-w-[20rem] px-4 py-3.5 text-charcoal/80"><p className={cn(open !== i && "line-clamp-2")}>{e.limitation}</p></td>
                  <td className="px-2 py-3.5">
                    <button type="button" onClick={() => toggle(i)} aria-expanded={open === i} aria-label={`Détails de la tâche : ${e.task}`} className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-sage hover:text-charcoal">
                      <ChevronDown aria-hidden className={cn("h-4 w-4 transition-transform", open === i && "rotate-180")} />
                    </button>
                  </td>
                </tr>
                {open === i && (
                  <tr className="border-b border-line bg-sage/50 last:border-0">
                    <td colSpan={6} className="px-4 pb-5 pt-1"><Details e={e} /></td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {evaluations.map((e, i) => (
          <li key={i} className="rounded-xl border border-line bg-paper p-4 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium leading-snug">{e.task}</p>
              <span className="shrink-0 font-serif text-xl tabular-nums">{e.capability} %</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <CoverageBadge capability={e.capability} />
              <Badge>Importance {e.weight}/5</Badge>
              <Badge className="capitalize">Autonomie {e.autonomy}</Badge>
            </div>
            <p className="mt-3 text-sm text-charcoal/80">{e.limitation}</p>
            <button type="button" onClick={() => toggle(i)} aria-expanded={open === i} className="mt-3 flex min-h-9 items-center gap-1 text-sm font-medium text-olive-dark">
              {open === i ? "Masquer le détail" : "Voir le détail"}
              <ChevronDown aria-hidden className={cn("h-4 w-4 transition-transform", open === i && "rotate-180")} />
            </button>
            {open === i && <div className="mt-3 border-t border-line pt-3"><Details e={e} /></div>}
          </li>
        ))}
      </ul>
    </>
  );
}
