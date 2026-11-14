"use client";

import { Plus, Search, Trash2, Upload } from "lucide-react";
import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { AnalysisRow } from "@/components/dashboard/AnalysisRow";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { OPPORTUNITY_THRESHOLD, levelFor } from "@/lib/constants";
import { deleteAnalysis, importAnalyses, useHistory } from "@/lib/store";
import { cn, isAnalysisResult, productTitle } from "@/lib/utils";
import type { AnalysisRecord } from "@/types";

type Sort = "recent" | "oldest" | "coverage-desc" | "coverage-asc";
type Filter = "all" | "high" | "medium" | "low" | "with-opps";

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: "all", label: "Toutes" },
  { key: "high", label: "Couverture élevée" },
  { key: "medium", label: "Couverture moyenne" },
  { key: "low", label: "Couverture faible" },
  { key: "with-opps", label: "Avec opportunités" },
];

const selectCls = "min-h-11 rounded-lg border border-line bg-paper px-3 text-sm focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20";

export function HistoryView() {
  const { records, ready } = useHistory();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("recent");
  const [notice, setNotice] = useState<{ tone: "info" | "error"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = records.filter((r) => {
      const c = r.result.score.ai_coverage;
      if (q && !`${productTitle(r.result)} ${r.result.product.audience}`.toLowerCase().includes(q)) return false;
      if (filter === "with-opps") return r.result.monetization_opportunities.length > 0;
      if (filter !== "all") return levelFor(c) === filter;
      return true;
    });
    const by: Record<Sort, (a: AnalysisRecord, b: AnalysisRecord) => number> = {
      recent: (a, b) => b.createdAt.localeCompare(a.createdAt),
      oldest: (a, b) => a.createdAt.localeCompare(b.createdAt),
      "coverage-desc": (a, b) => b.result.score.ai_coverage - a.result.score.ai_coverage,
      "coverage-asc": (a, b) => a.result.score.ai_coverage - b.result.score.ai_coverage,
    };
    return list.sort(by[sort]);
  }, [records, query, filter, sort]);

  async function onImport(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    const imported: AnalysisRecord[] = [];
    let rejected = 0;
    for (const file of files) {
      try {
        const data: unknown = JSON.parse(await file.text());
        if (!isAnalysisResult(data)) throw new Error("format");
        imported.push({ id: `import-${Date.now().toString(36)}${imported.length}`, createdAt: new Date(file.lastModified).toISOString(), result: data });
      } catch {
        rejected++;
      }
    }
    if (imported.length && !importAnalyses(imported)) return setNotice({ tone: "error", text: "Le stockage du navigateur est plein ou bloqué : import impossible." });
    setNotice({
      tone: rejected ? "error" : "info",
      text: `${imported.length} rapport${imported.length > 1 ? "s" : ""} importé${imported.length > 1 ? "s" : ""}${rejected ? `, ${rejected} fichier${rejected > 1 ? "s" : ""} ignoré${rejected > 1 ? "s" : ""} (ce n'est pas un rapport HalfSolution ou Streamlit)` : ""}.`,
    });
  }

  function remove(r: AnalysisRecord) {
    if (window.confirm(`Supprimer l'analyse « ${productTitle(r.result)} » de ce navigateur ?`)) deleteAnalysis(r.id);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium sm:text-4xl">Mes analyses</h1>
          <p className="mt-1 text-sm text-muted">Historique local : ces analyses sont enregistrées uniquement dans ce navigateur. Le serveur ne conserve pas d&apos;historique.</p>
        </div>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept="application/json,.json" multiple hidden onChange={onImport} aria-label="Importer des rapports JSON" />
          <Button variant="secondary" icon={<Upload aria-hidden className="h-4 w-4" />} onClick={() => fileRef.current?.click()}>Importer un rapport</Button>
          <Button href="/analyze" icon={<Plus aria-hidden className="h-4 w-4" />}>Nouvelle analyse</Button>
        </div>
      </div>

      {notice && <Alert tone={notice.tone === "error" ? "error" : "info"}>{notice.text}</Alert>}

      {ready && records.length === 0 ? (
        <EmptyState title="Aucune analyse enregistrée" description="Vos analyses terminées apparaîtront ici. Vous pouvez aussi importer un rapport JSON exporté depuis HalfSolution ou depuis l'ancienne interface Streamlit." action={<Button href="/analyze">Lancer une analyse</Button>} />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un produit ou un public cible" aria-label="Rechercher une analyse" className={cn(selectCls, "w-full pl-10")} />
            </div>
            <select aria-label="Trier" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={selectCls}>
              <option value="recent">Plus récentes</option>
              <option value="oldest">Plus anciennes</option>
              <option value="coverage-desc">Couverture IA décroissante</option>
              <option value="coverage-asc">Couverture IA croissante</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer">
            {FILTERS.map((f) => (
              <button key={f.key} type="button" aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}
                className={cn("min-h-9 rounded-full border px-3.5 text-sm transition-colors", filter === f.key ? "border-olive bg-olive text-paper" : "border-line bg-paper hover:border-muted")}>
                {f.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted">Niveaux selon la couverture IA globale de l&apos;analyse : élevée ≥ 75 %, moyenne {OPPORTUNITY_THRESHOLD}–74 %, faible &lt; {OPPORTUNITY_THRESHOLD} %.</p>

          {ready && shown.length === 0 ? (
            <p className="rounded-xl border border-line bg-paper p-6 text-center text-sm text-muted">Aucune analyse ne correspond à cette recherche.</p>
          ) : (
            <ul className="space-y-3">
              {shown.map((r) => (
                <AnalysisRow key={r.id} record={r} actions={
                  <button type="button" onClick={() => remove(r)} aria-label={`Supprimer l'analyse ${productTitle(r.result)}`} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-[#FBF1EE] hover:text-danger">
                    <Trash2 aria-hidden className="h-4 w-4" />
                  </button>
                } />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
