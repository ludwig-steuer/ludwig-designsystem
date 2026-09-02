/** Formatting + parsing helpers for booking components (de-DE money). */
// Direkt aus der Registry, nicht über das Barrel: `@/ui/status` exportiert
// auch `FlowModal`, und das zieht `@/modules/invoices` samt DB-Treiber in
// jedes Bundle, das eine Zahl formatiert (P22).
import { resolveStatus } from "@/ui/status/status-registry";

export function fmtMoney(
  amount: number | null | undefined,
  currency: string | null | undefined = "EUR",
): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: currency || "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** `1234.5` → `1.234,50 €` (no currency lookup, always €). */
export function fmtEuro(n: number): string {
  return (
    n.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " €"
  );
}

/** Parses a German-formatted amount string (`1.234,56 €`) into a number. */
export function parseEuro(s: string | number | null | undefined): number {
  if (s == null) return 0;
  if (typeof s === "number") return Number.isNaN(s) ? 0 : s;
  const cleaned = s
    .replace(/[^0-9.,-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const n = Number.parseFloat(cleaned);
  return Number.isNaN(n) ? 0 : n;
}

/** Raw `0..1` confidence → integer percent, or null. */
export function confPercent(value: number | null | undefined): number | null {
  if (value == null || Number.isNaN(value)) return null;
  // Tolerate values already expressed as 0..100.
  const pct = value <= 1 ? value * 100 : value;
  return Math.round(pct);
}

export type ConfLevel = "high" | "med" | "low";

export function confLevel(percent: number): ConfLevel {
  if (percent >= 85) return "high";
  if (percent >= 60) return "med";
  return "low";
}

/* --------------------------------------------------------------------- */
/* Satz-Konfidenz-Ampel (grün/gelb/orange/rot)                            */
/* --------------------------------------------------------------------- */

/** Ampelstufe eines Buchungssatzes (gebandete `proposal_confidence`). */
export type ConfDot = "green" | "yellow" | "orange" | "red";

export interface LineConf {
  level: ConfDot;
  /** Tooltip-Erklärung der Stufe. */
  title: string;
}

/** Tooltip-Text einer Ampelstufe — Label + Erklärung aus der zentralen
 *  Registry, damit die Ampel überall dasselbe bedeutet. */
function confDotTitle(level: ConfDot): string {
  const d = resolveStatus("konfidenz", level);
  return d.description ? `${d.label} — ${d.description}` : d.label;
}

/**
 * Bestimmt die Ampel eines Buchungssatzes (Owner-Entscheid 2026-08-29: die
 * Bewertung gilt dem Satz, nicht der Zeile — die frühere Zeilen-Ampel
 * `client_journal_entry_line.confidence` wird nicht mehr gelesen):
 *  1. Manuell gebuchte Sätze (`origin='manual'`) sind vom Menschen verantwortet → grün.
 *  2. Sonst aus der Satz-Konfidenz (`proposal_confidence`) gebandet
 *     (≥85 grün, ≥70 gelb, ≥50 orange, <50 rot).
 *  3. Kein Signal (Import/Regelwerk ohne Konfidenz) → kein Punkt (`null`).
 */
export function entryConfLevel(entry: { confidence: number | null; origin: string }): LineConf | null {
  if (entry.origin === "manual") {
    return { level: "green", title: "Manuell gebucht — vom Mitarbeiter verantwortet" };
  }
  const pct = confPercent(entry.confidence);
  if (pct == null) return null;
  const level: ConfDot = pct >= 85 ? "green" : pct >= 70 ? "yellow" : pct >= 50 ? "orange" : "red";
  return { level, title: `${confDotTitle(level)} (Satz-Konfidenz ${pct} %)` };
}

/**
 * Mandanten-Scope aus dem aktuellen Pfad (`/clients/<slug>/<jahr>/…`) — Basis
 * für Links, die die geteilte Buchungs-UI selbst baut (z.B. auf die Stapel-
 * Detailseite), ohne slug/Jahr durch jede Ebene zu reichen. Passt der Pfad
 * nicht (Gallery, Screens außerhalb eines Mandanten), gibt es keinen Link.
 */
export function clientScopeFromPath(pathname: string | null | undefined): string | null {
  return /^\/clients\/[^/]+\/\d{4}(?=$|\/)/.exec(pathname ?? "")?.[0] ?? null;
}
