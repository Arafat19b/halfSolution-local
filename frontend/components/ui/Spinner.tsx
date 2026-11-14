import { Loader2 } from "lucide-react";

export function Spinner({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted" role="status">
      <Loader2 className="hs-spin h-4 w-4" aria-hidden />
      {label ?? <span className="sr-only">Chargement</span>}
    </span>
  );
}
