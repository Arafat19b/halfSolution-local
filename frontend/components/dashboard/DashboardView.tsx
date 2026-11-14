"use client";

import { BarChart3, ListChecks, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { CoverageDistribution } from "@/components/charts/CoverageDistribution";
import { AnalysisRow } from "@/components/dashboard/AnalysisRow";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";
import { levelFor } from "@/lib/constants";
import { useHistory } from "@/lib/store";
import { formatPct, opportunitiesOf } from "@/lib/utils";
import type { CoverageLevel } from "@/types";

export function DashboardView() {
  const { records, ready } = useHistory();
  const hasData = ready && records.length > 0;

  const opportunities = records.flatMap(opportunitiesOf);
  const mean = records.length ? records.reduce((s, r) => s + r.result.score.ai_coverage, 0) / records.length : null;
  const counts: Record<CoverageLevel, number> = { high: 0, medium: 0, low: 0 };
  records.forEach((r) => r.result.evaluations.forEach((e) => counts[levelFor(e.capability)]++));
  const totalTasks = counts.high + counts.medium + counts.low;

  return (
    <div className="space-y-10">
      <section className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-medium leading-tight sm:text-5xl sm:leading-[1.1]">Découvrez ce que l&apos;IA peut faire. Identifiez ce qu&apos;il reste à construire.</h1>
        </div>
        <Button href="/analyze" icon={<Plus aria-hidden className="h-4 w-4" />} className="shrink-0 sm:min-w-44">Nouvelle analyse</Button>
      </section>

      <section aria-label="Statistiques" className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Analyses réalisées" value={ready ? records.length : "–"} caption="Enregistrées dans ce navigateur" icon={<ListChecks className="h-5 w-5" />} />
        <StatCard label="Couverture IA moyenne" value={mean === null ? "–" : formatPct(Math.round(mean * 10) / 10)} caption={mean === null ? "Aucune analyse pour l'instant" : "Moyenne des scores calculés par le moteur"} icon={<BarChart3 className="h-5 w-5" />} />
        <StatCard label="Opportunités détectées" value={ready ? opportunities.length : "–"} caption="Tâches sous le seuil de 60 %" icon={<Sparkles className="h-5 w-5" />} />
      </section>

      {ready && !hasData ? (
        <EmptyState title="Aucune analyse pour l'instant" description="Décrivez une idée de SaaS : HalfSolution estime ce que l'IA couvre déjà et repère ce qui reste à construire. Vos résultats apparaîtront ici." action={<Button href="/analyze" icon={<Plus aria-hidden className="h-4 w-4" />}>Lancer ma première analyse</Button>} />
      ) : (
        <>
          <div className="grid gap-8 lg:grid-cols-5">
            <section className="lg:col-span-3">
              <SectionTitle title="Analyses récentes" action={<Link href="/history" className="text-sm font-medium text-olive-dark hover:underline">Tout voir</Link>} />
              <ul className="space-y-3">{records.slice(0, 4).map((r) => <AnalysisRow key={r.id} record={r} />)}</ul>
            </section>
            <section className="lg:col-span-2">
              <SectionTitle title="Niveau de couverture des tâches" hint={`${totalTasks} tâche${totalTasks > 1 ? "s" : ""} sur toutes les analyses`} />
              <Card><CoverageDistribution counts={counts} /></Card>
            </section>
          </div>

          <section>
            <SectionTitle title="Opportunités identifiées" action={<Link href="/opportunities" className="text-sm font-medium text-olive-dark hover:underline">Toutes les opportunités</Link>} />
            {opportunities.length === 0 ? (
              <p className="rounded-xl border border-line bg-paper p-5 text-sm text-muted">Aucune tâche sous le seuil de 60 % dans vos analyses.</p>
            ) : (
              <ul className="grid gap-4 md:grid-cols-2">{opportunities.slice(0, 4).map((o) => <OpportunityCard key={o.id} o={o} showOrigin />)}</ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
