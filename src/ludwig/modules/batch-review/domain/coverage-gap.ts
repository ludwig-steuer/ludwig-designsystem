import type { GateEingang } from "./readiness";
import type { ChecklistRow } from "./checklist";

/**
 * Deckungslücken aus Gate 1a in Worten (F141).
 *
 * Endet ein Datei-Import vor dem Periodenende, meldet Gate 1a eine Warnung mit
 * `coveredTo` und `uncoveredDays` — für den Agenten geschrieben, mit Tool-Namen
 * darin. Der Agent läuft autonom und kann die Lücke nicht schließen; entschieden
 * wird sie in der Abnahme, vom Menschen (Owner 03.09.2026). Diese Datei
 * übersetzt dieselben Gate-Felder in Menschen-Sprache — für Schritt 1 (Hinweis)
 * und Schritt 8 (gelb, quittierpflichtig) denselben Text. **Gerechnet wird nur
 * im Gate**; hier wird nur formuliert.
 */

/** Was für die Checkliste aus einer Zeile gebraucht wird — ohne Quittungs-Felder. */
type RohZeile = Omit<ChecklistRow, "acknowledged" | "note" | "acknowledgedBy" | "acknowledgedAt">;

export interface CoverageGap {
  paymentAccountId: string | null;
  label: string;
  /** yyyy-mm-dd — bis hierhin deckt der Auszug. */
  coveredTo: string;
  uncoveredDays: number;
  /** Menschen-Sprache, in Schritt 1 und 8 derselbe Satz. */
  text: string;
}

function str(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}

function fmtDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
}

/** Eine Gate-Warnung → Lücke oder `null` (ohne `coveredTo` ist es keine). */
export function coverageGapFrom(
  o: Record<string, unknown>,
  periodTo: string,
): CoverageGap | null {
  const coveredTo = str(o.coveredTo);
  if (coveredTo == null) return null;

  const gemeldet = o.uncoveredDays;
  const uncoveredDays =
    typeof gemeldet === "number" && Number.isFinite(gemeldet)
      ? gemeldet
      : Math.round((Date.parse(periodTo) - Date.parse(coveredTo)) / 86_400_000);
  // Ein Lauf mit altem periodTo gegen frische Daten hat keine Lücke mehr.
  if (!Number.isFinite(uncoveredDays) || uncoveredDays <= 0) return null;

  const label = str(o.label) ?? str(o.accountNumber) ?? str(o.name) ?? "—";
  return {
    paymentAccountId: str(o.paymentAccountId),
    label,
    coveredTo,
    uncoveredDays,
    text:
      `${label}: Auszug bis ${fmtDate(coveredTo)}, ${uncoveredDays} ` +
      `${uncoveredDays === 1 ? "Tag" : "Tage"} bis zum Periodenende ${fmtDate(periodTo)} ` +
      `ungedeckt. Auszug nachliefern oder begründet quittieren.`,
  };
}

/** Alle Lücken aus `gate.warnings` — die meisten Tage zuerst, dann nach Label. */
export function coverageGaps(gate: GateEingang, periodTo: string): CoverageGap[] {
  return (gate.warnings ?? [])
    .map((o) => coverageGapFrom(o, periodTo))
    .filter((l): l is CoverageGap => l != null)
    .sort((a, b) => b.uncoveredDays - a.uncoveredDays || a.label.localeCompare(b.label));
}

/**
 * Die Zeile „Kontoauszüge lückenlos" um die Lücken ergänzen: gelb und
 * quittierpflichtig. Der `valueHash` trägt die Deckungsgrenzen — kommt ein
 * Auszug nach, verfällt eine alte Quittung; ist die Lücke geschlossen, ist die
 * Zeile wieder grün, ohne dass jemand quittieren muss.
 */
export function completeStatementLine(row: RohZeile, luecken: CoverageGap[]): RohZeile {
  if (luecken.length === 0) return row;
  return {
    ...row,
    done: 0,
    total: 1,
    // Hatte das Gate Blocker, bleibt die Zeile rot — die Lücke kommt dazu.
    level: row.done >= row.total ? "warn" : row.level,
    items: [
      ...row.items,
      ...luecken.map((l) => ({ text: l.label, problem: l.text })),
    ].slice(0, 20),
    valueHash: `${row.valueHash}|${luecken
      .map((l) => `${l.paymentAccountId ?? l.label}:${l.coveredTo}`)
      .join(",")}`,
  };
}
