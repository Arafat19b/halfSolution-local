import type { CoverageLevel } from "@/types";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

/**
 * Seuils de couverture IA (capacité estimée d'une tâche, en %).
 * Le seuil bas (60) est celui du backend (analysis/monetization.py) : toute tâche "faible"
 * est donc exactement une opportunité détectée. Garder ces valeurs synchronisées.
 */
export const OPPORTUNITY_THRESHOLD = 60;
export const HIGH_THRESHOLD = 75;

export const LEVELS: Record<CoverageLevel, { label: string; rule: string; color: string }> = {
  high: { label: "Couverture élevée", rule: "≥ 75 %", color: "#5C7C47" },
  medium: { label: "Couverture moyenne", rule: "60 – 74 %", color: "#A9BC93" },
  low: { label: "Couverture faible", rule: "< 60 %", color: "#D6E85A" },
};

export function levelFor(capability: number): CoverageLevel {
  if (capability >= HIGH_THRESHOLD) return "high";
  if (capability >= OPPORTUNITY_THRESHOLD) return "medium";
  return "low";
}

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", short: "Accueil", icon: "layout" },
  { href: "/analyze", label: "Nouvelle analyse", short: "Analyser", icon: "plus" },
  { href: "/history", label: "Mes analyses", short: "Analyses", icon: "history" },
  { href: "/opportunities", label: "Opportunités", short: "Pistes", icon: "spark" },
  { href: "/settings", label: "Paramètres", short: "Réglages", icon: "settings" },
] as const;

export const STORAGE_KEYS = {
  history: "halfsolution:history:v1",
  draft: "halfsolution:draft:v1",
  prefs: "halfsolution:prefs:v1",
  payload: (id: string) => `halfsolution:payload:${id}`,
} as const;

export const EXAMPLE_PRODUCT = {
  name: "StyliApp",
  audience: "Couturiers indépendants et petits ateliers",
  problem:
    "Les couturiers notent les commandes sur des carnets et des messages WhatsApp. Ils perdent des mesures, oublient des dates de livraison et ne savent pas ce que chaque client a déjà payé.",
  value_proposition:
    "Centraliser les commandes, les mesures des clients et les paiements, envoyer des rappels de livraison et donner une vue claire des retouches à faire cette semaine.",
  features: "Fiche client avec mesures\nSuivi des commandes par statut\nRappels de livraison par SMS\nSuivi des acomptes et soldes",
};
