"use client";

import { ArrowLeft, ClipboardCheck } from "lucide-react";
import Link from "next/link";
import { Badge, CoverageBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { OPPORTUNITY_THRESHOLD } from "@/lib/constants";
import { useHistory } from "@/lib/store";
import { findOpportunity, formatDate } from "@/lib/utils";

/** Pistes de validation générales. Ce sont des recommandations de HalfSolution, pas des résultats du moteur. */
const TO_VERIFY = [
  "Interrogez 5 à 10 clients potentiels : comment gèrent-ils cette tâche aujourd'hui, et que leur coûte la situation actuelle ?",
  "Cherchez les outils, services ou habitudes qui couvrent déjà ce besoin, avec ou sans IA.",
  "Testez la tâche vous-même avec le modèle sur des cas réels : le score est une estimation, mesurez la qualité, le temps et les erreurs.",
  "Vérifiez que des clients seraient prêts à payer pour y répondre, avant d'écrire du code.",
  "Précisez ce qu'il faudrait garantir au client (fiabilité, données conservées, suivi) et si vous pouvez le garantir.",
];

export function OpportunityDetail({ id }: { id: string }) {
  const { records, ready } = useHistory();
  if (!ready) return <div className="py-20 text-center"><Spinner label="Chargement…" /></div>;

  const o = findOpportunity(records, id);
  if (!o) {
    return <EmptyState title="Opportunité introuvable" description="Cette opportunité n'existe pas dans l'historique de ce navigateur. L'analyse a peut-être été supprimée." action={<Button href="/opportunities">Voir les opportunités</Button>} />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link href="/opportunities" className="inline-flex min-h-9 items-center gap-1.5 text-sm text-muted hover:text-charcoal"><ArrowLeft aria-hidden className="h-4 w-4" />Toutes les opportunités</Link>

      <section>
        <Badge tone="lemon">Opportunité à explorer</Badge>
        <h1 className="mt-3 text-3xl font-medium sm:text-4xl">{o.task}</h1>
        <div className="mt-5 rounded-xl border border-[#C4D74A] border-l-8 border-l-lemon bg-paper p-5 shadow-soft">
          <p className="text-sm text-muted">Besoin identifié et limite principale</p>
          <p className="mt-1 text-lg leading-snug">{o.reason}</p>
          <p className="mt-3 text-sm text-muted">Cette limite est celle que le modèle a lui-même reconnue en évaluant la tâche. Elle indique où l&apos;IA seule ne suffit pas, pas qu&apos;un marché existe.</p>
        </div>
      </section>

      <section>
        <SectionTitle title="Ce que dit l'analyse" />
        <Card>
          <dl className="grid gap-5 sm:grid-cols-2">
            <div><dt className="text-sm text-muted">Capacité IA estimée</dt><dd className="mt-1 flex items-center gap-3"><span className="font-serif text-3xl tabular-nums">{o.capability ?? "–"}{o.capability !== null && " %"}</span>{o.capability !== null && <CoverageBadge capability={o.capability} />}</dd></div>
            <div><dt className="text-sm text-muted">Importance pour le client</dt><dd className="mt-1 font-serif text-3xl tabular-nums">{o.weight ?? "–"}{o.weight !== null && <span className="text-lg text-muted"> / 5</span>}</dd></div>
            <div><dt className="text-sm text-muted">Autonomie du modèle</dt><dd className="mt-1 capitalize">{o.autonomy ?? "Non précisée"}</dd></div>
            <div><dt className="text-sm text-muted">Confiance du modèle</dt><dd className="mt-1 capitalize">{o.confidence ?? "Non précisée"}</dd></div>
          </dl>
          {o.capability !== null && (
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-lemon" role="img" aria-label={`Capacité IA ${o.capability} %, seuil ${OPPORTUNITY_THRESHOLD} %`}>
              <div className="h-full bg-olive" style={{ width: `${o.capability}%` }} />
            </div>
          )}
          <p className="mt-5 border-t border-line pt-4 text-sm">
            Analyse d&apos;origine : <Link href={`/analysis/${o.analysisId}`} className="font-medium text-olive-dark underline-offset-2 hover:underline">{o.analysisName}</Link>
            <span className="text-muted"> · {formatDate(o.analysisDate)}</span>
          </p>
        </Card>
      </section>

      <section>
        <SectionTitle title="À vérifier avant de développer" hint="Recommandations générales de HalfSolution. Elles ne proviennent pas du moteur d'analyse." />
        <Card>
          <ul className="space-y-3">
            {TO_VERIFY.map((t) => (
              <li key={t} className="flex gap-3 text-[15px]"><ClipboardCheck aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-olive" /><span>{t}</span></li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
