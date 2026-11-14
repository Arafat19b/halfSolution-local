import type { Metadata } from "next";
import { AnalyzeForm } from "@/components/analysis/AnalyzeForm";

export const metadata: Metadata = { title: "Nouvelle analyse" };

export default function AnalyzePage() {
  return <AnalyzeForm />;
}
