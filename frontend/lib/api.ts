import { API_URL } from "@/lib/constants";
import type { AnalysisJob, ApiErrorBody, AppConfig, OllamaStatus, ProductContext } from "@/types";

export class ApiClientError extends Error {
  constructor(public body: ApiErrorBody, public status?: number) {
    super(body.message);
  }
}

const UNREACHABLE: ApiErrorBody = {
  code: "api_unreachable",
  message: "L'API HalfSolution est injoignable.",
  hint: `Vérifiez que le backend tourne (uvicorn api.main:app --port 8000) et que NEXT_PUBLIC_API_URL pointe vers ${API_URL}.`,
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...init, headers: { "Content-Type": "application/json", ...init?.headers }, cache: "no-store" });
  } catch {
    throw new ApiClientError(UNREACHABLE);
  }
  if (!res.ok) {
    let body: ApiErrorBody = { code: "http_error", message: `Erreur ${res.status} du serveur.` };
    try {
      const json = await res.json();
      const d = json?.detail;
      if (d && typeof d === "object" && !Array.isArray(d) && d.message) body = d as ApiErrorBody;
      else if (Array.isArray(d)) body = { code: "validation", message: "Certains champs sont invalides.", hint: d.map((e: { msg?: string }) => e.msg).filter(Boolean).join(" ; ") };
    } catch {
      /* corps non JSON : on garde l'erreur générique */
    }
    throw new ApiClientError(body, res.status);
  }
  return res.json() as Promise<T>;
}

export const api = {
  config: () => request<AppConfig>("/api/config"),
  ollamaStatus: () => request<OllamaStatus>("/api/ollama/status"),
  startAnalysis: (p: ProductContext) =>
    request<{ id: string; status: string; created_at: string }>("/api/analyze", { method: "POST", body: JSON.stringify(p) }),
  analysisJob: (id: string) => request<AnalysisJob>(`/api/analyze/${encodeURIComponent(id)}`),
};
