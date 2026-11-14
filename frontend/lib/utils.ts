import type { AnalysisRecord, AnalysisResult, OpportunityView } from "@/types";

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Date inconnue";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(d);
}

const PCT = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });
export function formatPct(n: number): string {
  return `${PCT.format(n)}\u00A0%`;
}

export function productTitle(result: AnalysisResult): string {
  return result.product.name?.trim() || "Produit sans nom";
}

export function slugify(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "analyse";
}

// ---- PDF export -------------------------------------------------------

/** Type minimal pour jsPDF (évite @types/jspdf) */
interface JsPDFInstance {
  setFontSize(s: number): void;
  setFont(f: string, style: string): void;
  setTextColor(c: string): void;
  setDrawColor(c: string): void;
  splitTextToSize(txt: string, w: number): string[];
  text(txt: string, x: number, y: number): void;
  line(x1: number, y1: number, x2: number, y2: number): void;
  addPage(): void;
  output(type: "bloburl"): string;
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function makePdfDoc(): JsPDFInstance {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { jsPDF } = require("jspdf") as { jsPDF: new (o?: unknown) => JsPDFInstance };
  return new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
}

function writeAnalysis(doc: JsPDFInstance, result: AnalysisResult, createdAt: string, startY: number): number {
  const W = 210;
  const MARGIN = 18;
  const COL = W - MARGIN * 2;
  let y = startY;

  const addLine = (txt: string, size = 10, style: "normal" | "bold" = "normal", color = "#1A1A18") => {
    doc.setFontSize(size);
    doc.setFont("helvetica", style);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(txt, COL);
    lines.forEach((l: string) => {
      if (y > 275) { doc.addPage(); y = MARGIN; }
      doc.text(l, MARGIN, y);
      y += size * 0.45;
    });
    y += 1.5;
  };

  const rule = () => {
    if (y > 275) { doc.addPage(); y = MARGIN; }
    doc.setDrawColor("#E5E2D9");
    doc.line(MARGIN, y, W - MARGIN, y);
    y += 5;
  };

  // En-tête produit
  addLine(result.product.name || "Produit sans nom", 13, "bold");
  if (result.product.audience) addLine(`Cible : ${result.product.audience}`, 9, "normal", "#6B6860");
  addLine(formatDate(createdAt), 9, "normal", "#6B6860");
  y += 2;
  addLine(result.product.value_proposition, 10);
  rule();

  // Scores
  addLine("Scores", 11, "bold");
  addLine(`Couverture IA estimée : ${result.score.ai_coverage.toFixed(1)} %  ·  Gap : ${result.score.gap.toFixed(1)} %  ·  ${result.evaluations.length} tâche(s)`, 10);
  y += 2;
  rule();

  // Évaluations
  addLine("Analyse par tâche", 11, "bold");
  y += 2;
  result.evaluations.forEach((e, i) => {
    addLine(`${i + 1}. ${e.task}`, 10, "bold");
    addLine(`   Capacité IA : ${e.capability} %  ·  Autonomie : ${e.autonomy}  ·  Confiance : ${(e as { confidence?: string }).confidence ?? "—"}`, 9, "normal", "#6B6860");
    if (e.limitation) addLine(`   Limite : ${e.limitation}`, 9, "normal", "#6B6860");
    y += 1.5;
  });
  rule();

  // Opportunités
  if (result.monetization_opportunities.length > 0) {
    addLine("Opportunités à explorer", 11, "bold");
    y += 2;
    result.monetization_opportunities.forEach((o, i) => {
      addLine(`${i + 1}. ${o.task}`, 10, "bold");
      addLine(`   ${o.reason}`, 9, "normal", "#6B6860");
      y += 1.5;
    });
    rule();
  }

  addLine("Note : scores estimés par un LLM local, non empiriques. Validez le besoin auprès de clients réels.", 8, "normal", "#6B6860");
  return y;
}

export function exportResultPdf(record: AnalysisRecord): void {
  const doc = makePdfDoc();
  const W = 210;
  const MARGIN = 18;
  let y = MARGIN;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor("#1A1A18");
  doc.text("HalfSolution — Rapport d'analyse", MARGIN, y);
  y += 8;
  doc.setDrawColor("#E5E2D9");
  doc.line(MARGIN, y, W - MARGIN, y);
  y += 7;

  writeAnalysis(doc, record.result, record.createdAt, y);
  triggerDownload(doc.output("bloburl"), `halfsolution-${slugify(productTitle(record.result))}.pdf`);
}

export function exportHistoryPdf(records: AnalysisRecord[]): void {
  if (records.length === 0) return;
  const doc = makePdfDoc();
  const W = 210;
  const MARGIN = 18;
  let y = MARGIN;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor("#1A1A18");
  doc.text("HalfSolution — Historique des analyses", MARGIN, y);
  y += 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#6B6860");
  doc.text(`${records.length} analyse(s) · ${formatDate(new Date().toISOString())}`, MARGIN, y);
  y += 6;
  doc.setDrawColor("#E5E2D9");
  doc.line(MARGIN, y, W - MARGIN, y);
  y += 6;

  records.forEach((record, idx) => {
    if (idx > 0) { doc.addPage(); y = MARGIN; }
    y = writeAnalysis(doc, record.result, record.createdAt, y);
  });

  triggerDownload(doc.output("bloburl"), "halfsolution-historique.pdf");
}

// ---- Opportunités -------------------------------------------------------

/** Extrait les opportunités réellement retournées par le moteur, jointes à l'évaluation de la même tâche. */
export function opportunitiesOf(record: AnalysisRecord): OpportunityView[] {
  const { result } = record;
  return result.monetization_opportunities.map((o, i) => {
    const ev = result.evaluations.find((e) => e.task === o.task);
    return {
      id: `${record.id}-${i}`,
      analysisId: record.id,
      analysisName: productTitle(result),
      analysisDate: record.createdAt,
      task: o.task,
      reason: o.reason,
      capability: ev?.capability ?? null,
      weight: ev?.weight ?? null,
      autonomy: ev?.autonomy ?? null,
      confidence: ev?.confidence ?? null,
    };
  });
}

export function findOpportunity(records: AnalysisRecord[], id: string): OpportunityView | null {
  const cut = id.lastIndexOf("-");
  if (cut < 1) return null;
  const analysisId = id.slice(0, cut);
  const record = records.find((r) => r.id === analysisId);
  return record ? opportunitiesOf(record).find((o) => o.id === id) ?? null : null;
}

/** Vérifie qu'un objet JSON importé a la forme d'un rapport du moteur. */
export function isAnalysisResult(x: unknown): x is AnalysisResult {
  if (!x || typeof x !== "object") return false;
  const r = x as Record<string, unknown>;
  const score = r.score as Record<string, unknown> | undefined;
  return (
    !!r.product && typeof r.product === "object" &&
    !!score && typeof score.ai_coverage === "number" && typeof score.gap === "number" &&
    Array.isArray(r.evaluations) && Array.isArray(r.monetization_opportunities) &&
    (r.evaluations as unknown[]).every((e) => !!e && typeof (e as Record<string, unknown>).task === "string" && typeof (e as Record<string, unknown>).capability === "number")
  );
}
