"use client";

import { useCallback, useState } from "react";
import { AnalysisResults } from "@/components/analysis/AnalysisResults";
import { AnalysisRunner } from "@/components/analysis/AnalysisRunner";
import { Spinner } from "@/components/ui/Spinner";
import { useHistory } from "@/lib/store";
import type { AnalysisRecord } from "@/types";

/**
 * Une seule route pour deux états :
 *  - l'analyse existe dans l'historique local → résultats ;
 *  - sinon on suit le job sur le backend (progression, erreurs) jusqu'aux résultats.
 */
export function AnalysisPageClient({ id }: { id: string }) {
  const { records, ready } = useHistory();
  const [memory, setMemory] = useState<{ record: AnalysisRecord; saved: boolean } | null>(null);
  const onDone = useCallback((record: AnalysisRecord, saved: boolean) => setMemory({ record, saved }), []);

  if (!ready) return <div className="py-20 text-center"><Spinner label="Chargement de l'analyse…" /></div>;

  const stored = records.find((r) => r.id === id);
  if (stored) return <AnalysisResults record={stored} />;
  if (memory && memory.record.id === id) return <AnalysisResults record={memory.record} unsaved={!memory.saved} />;
  return <AnalysisRunner id={id} onDone={onDone} />;
}
