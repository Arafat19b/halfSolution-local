import type { Metadata } from "next";
import { HistoryView } from "@/components/dashboard/HistoryView";

export const metadata: Metadata = { title: "Mes analyses" };

export default function HistoryPage() {
  return <HistoryView />;
}
