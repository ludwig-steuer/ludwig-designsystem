import { coverageGapFrom } from "./coverage-gap";
import type { GateEingang } from "./readiness";

/**
 * F220 T220.2 — die Kontoauszug-Prüfung **je Zahlungskonto** (Owner-Durchgang
 * 2026-09-15 §1.2: „nicht klar, was geprüft wird").
 *
 * Je gültigem Zahlungskonto (`valid_until` offen oder im Zeitraum); welche
 * davon oben stehen, entscheidet `isStatementCoverageActive`. Erste und
 * letzte Buchung im Zeitraum, Anzahl der Umsätze, daneben die Anzahl des
 * Vormonats als Plausibilität, dazu die Befunde von Gate 1a für dieses Konto
 * (Lücken, Saldenanschluss, ruhend).
 * Gerechnet wird der Stand nach A7: rot, wo das Gate blockt oder eine Lücke
 * meldet oder ein Konto still geworden ist (0 Umsätze, Vormonat > 0); gelb,
 * wo die letzte Buchung mehr als fünf Tage vor dem Periodenende liegt; sonst
 * grün. Der Saldo steht **nicht** hier, sondern in Schritt 4 (Owner).
 */
export type StatementCoverageState = "error" | "warning" | "done";

export interface StatementActivity {
  paymentAccountId: string;
  /** DATEV-Sachkontonummer des Zahlungskontos (1200, 1800 …). */
  ledgerAccountNumber: string;
  label: string;
  /** bank | cash | paypal */
  kind: string;
  firstTransactionDate: string | null;
  lastTransactionDate: string | null;
  transactionCount: number;
  /** Umsätze im Kalendermonat vor dem Zeitraum. */
  previousMonthCount: number;
  /** Auszugserwartung des Kontos — Hand-Entscheidung vor Ableitung (`bank.md` R15a/R15b). */
  statementsExpected: boolean;
}

export interface StatementCoverageAccount extends StatementActivity {
  /** Gate-1a-Befunde dieses Kontos in Menschen-Sprache — Blocker zuerst. */
  gaps: string[];
  state: StatementCoverageState;
  /** Warum die Zeile so steht — ein Satz. */
  stateText: string;
}

/** Fünf umsatzlose Tage vor Periodenende sind noch normal; mehr will jemand sehen. */
export const QUIET_TAIL_DAYS = 5;

function str(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}

function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((Date.parse(toIso) - Date.parse(fromIso)) / 86_400_000);
}

function gapText(o: Record<string, unknown>, periodTo: string): string {
  return coverageGapFrom(o, periodTo)?.text ?? str(o.problem) ?? str(o.warning) ?? "";
}

export function statementCoverageRows(
  activity: readonly StatementActivity[],
  gate1a: GateEingang,
  periodTo: string,
): StatementCoverageAccount[] {
  const blockers = new Map<string, string[]>();
  const warnings = new Map<string, string[]>();
  const gaps = new Set<string>();
  for (const o of gate1a.open) {
    const id = str(o.paymentAccountId);
    if (!id) continue;
    blockers.set(id, [...(blockers.get(id) ?? []), gapText(o, periodTo)]);
  }
  for (const o of gate1a.warnings ?? []) {
    const id = str(o.paymentAccountId);
    if (!id) continue;
    warnings.set(id, [...(warnings.get(id) ?? []), gapText(o, periodTo)]);
    // Eine Deckungslücke ist eine Gate-Warnung mit `coveredTo` — für die
    // Kanzlei ist sie rot: der Auszug fehlt (F141, Owner 2026-09-15).
    if (coverageGapFrom(o, periodTo)) gaps.add(id);
  }

  return activity.map((a) => {
    const texts = [...(blockers.get(a.paymentAccountId) ?? []), ...(warnings.get(a.paymentAccountId) ?? [])];
    const stillGeworden = a.transactionCount === 0 && a.previousMonthCount > 0;
    let state: StatementCoverageState = "done";
    let stateText = "Auszug deckt den Zeitraum ab.";
    if (blockers.has(a.paymentAccountId)) {
      state = "error";
      stateText = texts[0]!;
    } else if (gaps.has(a.paymentAccountId)) {
      state = "error";
      stateText = texts[0]!;
    } else if (stillGeworden) {
      state = "error";
      stateText = `Vormonat ${a.previousMonthCount} Umsätze, jetzt keine — fehlt ein Auszug?`;
    } else if (
      a.lastTransactionDate !== null &&
      daysBetween(a.lastTransactionDate, periodTo) > QUIET_TAIL_DAYS
    ) {
      state = "warning";
      stateText = `Letzte Buchung ${daysBetween(a.lastTransactionDate, periodTo)} Tage vor Periodenende.`;
    } else if (a.transactionCount === 0) {
      stateText = "Keine Umsätze im Zeitraum — auch im Vormonat keine.";
    }
    return { ...a, gaps: texts, state, stateText };
  });
}

/**
 * F234: Gehört das Konto in die Hauptliste der Kontoauszug-Prüfung?
 * Ja, wenn es Auszüge liefern muss. F235 tauscht nur diesen Ausdruck gegen
 * die dreistufige Erwartung.
 */
export function isStatementCoverageActive(a: Pick<StatementActivity, "statementsExpected">): boolean {
  return a.statementsExpected;
}

/**
 * F234: Hauptliste und „Weitere Zahlungskonten". Ein roter Stand wird nie
 * eingeklappt (A7): ein Konto ohne Erwartung mit Gate-1a-Blocker oder
 * Deckungslücke bleibt oben. Reihenfolge innerhalb beider Listen wie geladen
 * (Sachkontonummer).
 */
export function partitionStatementCoverage(rows: readonly StatementCoverageAccount[]): {
  active: StatementCoverageAccount[];
  other: StatementCoverageAccount[];
} {
  const active: StatementCoverageAccount[] = [];
  const other: StatementCoverageAccount[] = [];
  for (const row of rows) (isStatementCoverageActive(row) || row.state === "error" ? active : other).push(row);
  return { active, other };
}
