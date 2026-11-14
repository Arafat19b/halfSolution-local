import type { ReactNode } from "react";

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-[#CFCCC0] bg-paper/60 px-6 py-12 text-center">
      <div aria-hidden className="mx-auto mb-4 h-9 w-9 rounded-full" style={{ background: "linear-gradient(90deg, #5C7C47 50%, #D6E85A 50%)" }} />
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-muted">{description}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
