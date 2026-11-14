import { AnalysisPageClient } from "@/components/analysis/AnalysisPageClient";

export default function AnalysisPage({ params }: { params: { id: string } }) {
  return <AnalysisPageClient id={params.id} />;
}
