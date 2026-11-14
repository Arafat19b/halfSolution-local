"use client";

import { Download, Plus } from "lucide-react";
import { TaskCapabilityChart } from "@/components/charts/TaskCapabilityChart";
import { TaskTable } from "@/components/analysis/TaskTable";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { SplitBar } from "@/components/ui/SplitBar";
import { LEVELS, OPPORTUNITY_THRESHOLD, levelFor } from "@/lib/constants";
import { exportResultPdf, formatDate, formatPct, opportunitiesOf, productTitle } from "@/lib/utils";
import type { AnalysisRecord } from "@/types";

/** Synthèse construite uniquement à partir des données renvoyées par le moteur. */
function buildFindings(record: AnalysisRecord): string[] {
  const { score, evaluations } = record.result;
  const opps = opportunitiesOf(record);
  const counts = { high: 0, medium: 0, low: 0 };
  evaluations.forEach((e) => counts[levelFor(e.capability)]++);
  const plural = (n: number, s: string, p = `${s}s`) => `${n} ${n > 1 ? p : s}`;

  const lines = [
    `Sur ${plural(evaluations.length, "tâche")} analysée${evaluations.length > 1 ? "s" : ""}, la couverture IA pondérée est estimée à ${formatPct(score.ai_coverage)}. Il reste ${formatPct(score.gap)} du besoin non couvert.`,
    `${plural(counts.high, "tâche")} en couverture élevée, ${plural(counts.medium, "tâche")} en couverture moyenne et ${plural(counts.low, "tâche")} en couverture faible.`,
  ];
  if (opps.length === 0) {
    lines.push(`Aucune tâche n'est passée sous le seuil de ${OPPORTUNITY_THRESHOLD} % d'après ces estimations.`);
  } else {
    const top = [...opps].sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0))[0];
    lines.push(`${plural(opps.length, "tâche")} sous le seuil de ${OPPORTUNITY_THRESHOLD} % ${opps.length > 1 ? "sont signalées" : "est signalée"} comme piste à explorer.`);
    if (top && top.weight !== null && top.capability !== null) {
      lines.push(`La plus importante pour le client est « ${top.task} » (importance ${top.weight}/5, capacité IA estimée ${top.capability} %).`);
    }
  }
  return lines;
}

function Indicator({ label, value, caption }: { label: string; value: string; caption: string }) {
  return (
    <div className="rounded-lg bg-cream px-4 py-3.5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-serif text-3xl font-medium tabular-nums">{value}</p>
      <p className="mt-0.5 text-xs text-muted">{caption}</p>
    </div>
  );
}

export function AnalysisResults({ record, unsaved = false }: { record: AnalysisRecord; unsaved?: boolean }) {
  const { result } = record;
  const { product, score, evaluations } = result;
  const opps = opportunitiesOf(record);

  return (
    <div className="space-y-10">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 max-w-2xl">
          <h1 className="text-3xl font-medium sm:text-4xl">{productTitle(result)}</h1>
          <p className="mt-1 text-sm text-muted">Analyse du {formatDate(record.createdAt)}{product.audience ? ` · pour ${product.audience}` : ""}</p>
          <p className="mt-3 line-clamp-4 text-[15px] leading-relaxed text-charcoal/80">{product.value_proposition}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="secondary" icon={<Download aria-hidden className="h-4 w-4" />} onClick={() => exportResultPdf(record)}>Exporter le rapport PDF</Button>
          <Button href="/analyze" icon={<Plus aria-hidden className="h-4 w-4" />}>Nouvelle analyse</Button>
        </div>
      </section>

      {unsaved && (
        <Alert tone="error" title="Cette analyse n'a pas pu être enregistrée dans ce navigateur.">
          Le stockage local est plein ou bloqué. Exportez le rapport PDF maintenant : il disparaîtra à la fermeture de la page.
        </Alert>
      )}

      <section aria-labelledby="overview">
        <h2 id="overview" className="sr-only">Vue globale</h2>
        <Card>
          <SplitBar coverage={score.ai_coverage} gap={score.gap} />
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Indicator label="Couverture IA estimée" value={formatPct(score.ai_coverage)} caption="Moyenne pondérée par l'importance" />
            <Indicator label="Gap estimé" value={formatPct(score.gap)} caption="100 % moins la couverture IA" />
            <Indicator label="Tâches analysées" value={String(evaluations.length)} caption={`${opps.length} sous le seuil de ${OPPORTUNITY_THRESHOLD} %`} />
          </div>
        </Card>
        <div className="mt-4">
          <Alert tone="note">Les scores présentés sont des estimations générées par le modèle IA. Ils ne constituent pas un benchmark empirique.</Alert>
        </div>
      </section>

      <section>
        <SectionTitle title="Analyse détaillée des tâches" hint="Ouvrez une tâche pour voir sa limite, son autonomie et la confiance du modèle." />
        <Card className="mb-4">
          <p className="mb-2 text-sm font-medium">Capacité IA estimée par tâche</p>
          <TaskCapabilityChart evaluations={evaluations} />
        </Card>
        <TaskTable evaluations={evaluations} />
        <p className="mt-3 text-xs text-muted">
          Seuils : {(["high", "medium", "low"] as const).map((l) => `${LEVELS[l].label.toLowerCase()} ${LEVELS[l].rule}`).join(" · ")}. Le seuil de {OPPORTUNITY_THRESHOLD} % est celui qu&apos;utilise le moteur pour détecter les opportunités.
        </p>
      </section>

      <section className="rounded-2xl bg-lemon/25 p-4 sm:p-6">
        <SectionTitle title="Opportunités à explorer" hint={`Tâches dont la capacité IA estimée est inférieure à ${OPPORTUNITY_THRESHOLD} %.`} />
        {opps.length === 0 ? (
          <p className="rounded-xl border border-line bg-paper p-5 text-sm">Aucune tâche n&apos;est passée sous le seuil de {OPPORTUNITY_THRESHOLD} % : le moteur ne signale aucune opportunité pour cette analyse.</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">{opps.map((o) => <OpportunityCard key={o.id} o={o} />)}</ul>
        )}
      </section>

      <section aria-labelledby="conclusion">
        <Card>
          <h2 id="conclusion" className="text-xl font-medium">Ce que révèle cette analyse</h2>
          <div className="mt-3 max-w-2xl space-y-2 text-[15px] leading-relaxed">
            {buildFindings(record).map((l, i) => <p key={i}>{l}</p>)}
          </div>
          <p className="mt-5 max-w-2xl rounded-lg border-l-4 border-lemon bg-cream px-4 py-3 text-sm">
            Une limite technique ne garantit pas une opportunité commerciale. Validez le besoin auprès de clients potentiels avant de développer votre solution.
          </p>
        </Card>
      </section>
    </div>
  );
}
