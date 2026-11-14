"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useHistory } from "@/lib/store";
import { opportunitiesOf } from "@/lib/utils";

export function OpportunitiesView() {
  const { records, ready } = useHistory();
  const [query, setQuery] = useState("");
  const [analysis, setAnalysis] = useState("all");

  const all = useMemo(() => records.flatMap(opportunitiesOf), [records]);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((o) => (analysis === "all" || o.analysisId === analysis) && (!q || `${o.task} ${o.reason} ${o.analysisName}`.toLowerCase().includes(q)));
  }, [all, query, analysis]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-medium sm:text-4xl">Opportunités</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">Tâches dont la capacité IA estimée est inférieure à 60 %, regroupées depuis vos analyses enregistrées dans ce navigateur. Seules les opportunités renvoyées par le moteur sont listées.</p>
      </div>

      {ready && all.length === 0 ? (
        <EmptyState title="Aucune opportunité détectée" description={records.length ? "Aucune tâche de vos analyses n'est passée sous le seuil de 60 %." : "Lancez une analyse : les tâches que l'IA couvre mal apparaîtront ici."} action={<Button href="/analyze">Lancer une analyse</Button>} />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher une tâche ou une limite" aria-label="Rechercher une opportunité" className="min-h-11 w-full rounded-lg border border-line bg-paper pl-10 pr-3 text-sm focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20" />
            </div>
            <select aria-label="Filtrer par analyse" value={analysis} onChange={(e) => setAnalysis(e.target.value)} className="min-h-11 rounded-lg border border-line bg-paper px-3 text-sm focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20">
              <option value="all">Toutes les analyses</option>
              {records.filter((r) => r.result.monetization_opportunities.length).map((r) => <option key={r.id} value={r.id}>{r.result.product.name || "Produit sans nom"}</option>)}
            </select>
          </div>
          <p className="text-sm text-muted" aria-live="polite">{shown.length} opportunité{shown.length > 1 ? "s" : ""}</p>
          {shown.length === 0 ? (
            <p className="rounded-xl border border-line bg-paper p-6 text-center text-sm text-muted">Aucune opportunité ne correspond à cette recherche.</p>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">{shown.map((o) => <OpportunityCard key={o.id} o={o} showOrigin />)}</ul>
          )}
        </>
      )}
    </div>
  );
}
