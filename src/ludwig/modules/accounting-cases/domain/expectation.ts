/**
 * # Die Erwartung an einem Sachverhalt
 *
 * Was noch kommen muss, damit der Fall schließen kann: eine Unterlage oder
 * eine Zahlung. Lag bis 2026-09-07 in `application/expectation-core.ts` —
 * dort steht die Ableitung, hier steht das Modell (L-70, Muster L-09).
 *
 * Reines Typ-Material ohne Laufzeit: die Datei ist spiegelbar.
 */

// `ExpectationKind` steht in `case.ts` neben `EXPECTATION_KINDS`, das den
// Wertebereich führt. Eine zweite Definition hier wäre eine zweite Wahrheit
// über dieselben zwei Werte (L-210).
export type { ExpectationKind } from "./case";
import type { ExpectationKind } from "./case";
export type ExpectationDirection = "incoming" | "outgoing";
export type DueSource = "invoice_due_date" | "payment_term" | "client_default";
/** Wer die Unterlage besorgt. Kein `agent` — der Agent besorgt keine Belege. */
export type ExpectationAudience = "client" | "accounting";
export type ExpectationResolution = "matched" | "manual" | "obsolete";

export interface ExpectationRow {
  id: string;
  caseId: string;
  caseNumber: string | null;
  caseTitle: string | null;
  kind: ExpectationKind;
  direction: ExpectationDirection;
  expectedDocumentKind: string | null;
  expectedCounterpartyName: string | null;
  expectedCounterpartyPartnerId: string | null;
  expectedAmount: number | null;
  expectedDate: string | null;
  expectedReference: string | null;
  dueDate: string;
  dueSource: DueSource;
  escalationLevel: number;
  /** Abgeleitet, nicht gespeichert: `due_date` gegen heute. */
  overdue: boolean;
  overdueDays: number;
  /** Wer die Unterlage besorgt (F125). Ohne Einfluss auf die Zuständigkeit (F128). */
  audience: ExpectationAudience;
  /** Ein Satz Kontext, der nicht in die Felder passt. Nie Betrag/Referenz/Datum. */
  note: string | null;
  createdAt: string;
}
