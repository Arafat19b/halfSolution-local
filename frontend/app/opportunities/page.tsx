import type { Metadata } from "next";
import { OpportunitiesView } from "@/components/opportunities/OpportunitiesView";

export const metadata: Metadata = { title: "Opportunités" };

export default function OpportunitiesPage() {
  return <OpportunitiesView />;
}
