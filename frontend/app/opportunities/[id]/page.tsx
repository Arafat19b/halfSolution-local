import { OpportunityDetail } from "@/components/opportunities/OpportunityDetail";

export default async function OpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OpportunityDetail id={id} />;
}
