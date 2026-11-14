"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiClientError } from "@/lib/api";
import type { ApiErrorBody, OllamaStatus } from "@/types";

export type StatusState =
  | { phase: "loading" }
  | { phase: "ready"; status: OllamaStatus }
  | { phase: "api_down"; error: ApiErrorBody };

export function useOllamaStatus() {
  const [state, setState] = useState<StatusState>({ phase: "loading" });

  const refresh = useCallback(async () => {
    setState({ phase: "loading" });
    try {
      setState({ phase: "ready", status: await api.ollamaStatus() });
    } catch (e) {
      const error = e instanceof ApiClientError ? e.body : { code: "api_unreachable", message: "API injoignable." };
      setState({ phase: "api_down", error });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { state, refresh };
}
