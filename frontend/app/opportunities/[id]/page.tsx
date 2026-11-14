import { OpportunityDetail } from "@/components/opportunities/OpportunityDetail";

export default function OpportunityPage({ params }: { params: { id: string } }) {
  return <OpportunityDetail id={params.id} />;
}
