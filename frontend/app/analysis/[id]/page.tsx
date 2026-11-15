import { AnalysisPageClient } from "@/components/analysis/AnalysisPageClient";

export default async function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AnalysisPageClient id={id} />;
}
