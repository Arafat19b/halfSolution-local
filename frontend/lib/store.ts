"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { STORAGE_KEYS } from "@/lib/constants";
import { isAnalysisResult } from "@/lib/utils";
import type { AnalysisRecord } from "@/types";

/** Petit store sur localStorage, compatible useSyncExternalStore (snapshots stables). */
function createLocalStore<T>(key: string, fallback: T, parse: (raw: unknown) => T) {
  const listeners = new Set<() => void>();
  let cachedRaw: string | null | undefined;
  let cachedValue: T = fallback;

  const read = (): T => {
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      return fallback;
    }
    if (raw === cachedRaw) return cachedValue;
    cachedRaw = raw;
    try {
      cachedValue = raw ? parse(JSON.parse(raw)) : fallback;
    } catch {
      cachedValue = fallback;
    }
    return cachedValue;
  };

  return {
    subscribe(cb: () => void) {
      listeners.add(cb);
      const onStorage = (e: StorageEvent) => e.key === key && cb();
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(cb);
        window.removeEventListener("storage", onStorage);
      };
    },
    getSnapshot: read,
    getServerSnapshot: () => fallback,
    set(value: T): boolean {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {
        return false; // quota dépassé ou stockage indisponible
      }
      listeners.forEach((l) => l());
      return true;
    },
    clear() {
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
      listeners.forEach((l) => l());
    },
  };
}

const EMPTY_HISTORY: AnalysisRecord[] = [];
const historyStore = createLocalStore<AnalysisRecord[]>(STORAGE_KEYS.history, EMPTY_HISTORY, (raw) => {
  if (!Array.isArray(raw)) return EMPTY_HISTORY;
  return raw.filter(
    (r): r is AnalysisRecord => !!r && typeof r.id === "string" && typeof r.createdAt === "string" && isAnalysisResult(r.result),
  );
});

export interface Prefs {
  profileName: string;
  reduceMotion: boolean;
}
const DEFAULT_PREFS: Prefs = { profileName: "", reduceMotion: false };
const prefsStore = createLocalStore<Prefs>(STORAGE_KEYS.prefs, DEFAULT_PREFS, (raw) => {
  const r = (raw ?? {}) as Partial<Prefs>;
  return { profileName: typeof r.profileName === "string" ? r.profileName : "", reduceMotion: r.reduceMotion === true };
});

export function useHydrated(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready;
}

export function useHistory() {
  const records = useSyncExternalStore(historyStore.subscribe, historyStore.getSnapshot, historyStore.getServerSnapshot);
  const ready = useHydrated();
  const sorted = [...records].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { records: sorted, ready };
}

/** Ajoute ou remplace (par id) une analyse. Retourne false si le navigateur refuse l'écriture. */
export function saveAnalysis(record: AnalysisRecord): boolean {
  const current = historyStore.getSnapshot().filter((r) => r.id !== record.id);
  return historyStore.set([record, ...current]);
}

export function importAnalyses(records: AnalysisRecord[]): boolean {
  const incoming = new Set(records.map((r) => r.id));
  return historyStore.set([...records, ...historyStore.getSnapshot().filter((r) => !incoming.has(r.id))]);
}

export const deleteAnalysis = (id: string) => historyStore.set(historyStore.getSnapshot().filter((r) => r.id !== id));
export const clearHistory = () => historyStore.clear();
export const getHistory = () => historyStore.getSnapshot();

export function usePrefs() {
  const prefs = useSyncExternalStore(prefsStore.subscribe, prefsStore.getSnapshot, prefsStore.getServerSnapshot);
  return { prefs, ready: useHydrated() };
}
export const savePrefs = (p: Prefs) => prefsStore.set(p);

/* ---- Brouillon du formulaire et charge utile d'analyse (survivent à une erreur ou un rechargement) ---- */

export interface Draft {
  name: string;
  audience: string;
  problem: string;
  value_proposition: string;
  features: string;
}
export const EMPTY_DRAFT: Draft = { name: "", audience: "", problem: "", value_proposition: "", features: "" };

export function loadDraft(): Draft {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.draft);
    return raw ? { ...EMPTY_DRAFT, ...JSON.parse(raw) } : EMPTY_DRAFT;
  } catch {
    return EMPTY_DRAFT;
  }
}
export function persistDraft(d: Draft) {
  try {
    window.localStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(d));
  } catch {
    /* ignore */
  }
}
export function clearDraft() {
  try {
    window.localStorage.removeItem(STORAGE_KEYS.draft);
  } catch {
    /* ignore */
  }
}

export function rememberPayload(id: string, payload: unknown) {
  try {
    window.sessionStorage.setItem(STORAGE_KEYS.payload(id), JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}
export function recallPayload<T>(id: string): T | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEYS.payload(id));
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
