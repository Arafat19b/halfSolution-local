import { AlertTriangle, Info } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Alert({ title, children, tone = "info", action }: { title?: string; children?: ReactNode; tone?: "info" | "error" | "note"; action?: ReactNode }) {
  const styles = {
    info: "border-[#D7E2CC] bg-sage",
    note: "border-line bg-paper",
    error: "border-[#E4C5BE] bg-[#FBF1EE]",
  };
  const Icon = tone === "error" ? AlertTriangle : Info;
  return (
    <div role={tone === "error" ? "alert" : "note"} className={cn("flex gap-3 rounded-xl border p-4 text-sm", styles[tone])}>
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", tone === "error" ? "text-danger" : "text-olive")} aria-hidden />
      <div className="min-w-0 flex-1">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className={cn("text-charcoal/80", title && "mt-0.5")}>{children}</div>}
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  );
}
