/**
 * # Die Auszugszeile, wie sie angezeigt wird
 *
 * Das Anzeigemodell des Kontoauszugs liegt im Design-System
 * (`bank-transaction.ts`, drei geschachtelte Schnitte); es hier noch einmal zu
 * definieren wäre die dritte Kopie — genau das, was L-56 abstellen sollte.
 * Diese Datei macht die andere Hälfte: sie übersetzt die Zeile, die die Query
 * baut, in die Form, die das Set liest.
 *
 * Warum ein Mapper und kein gemeinsamer Typ: die Query-Zeile ist von der
 * Abfrage geformt (Beträge als `string`, Sachverhalte als aggregiertes JSON),
 * das Anzeigemodell von der Anzeige (Beträge als `number`, ein Sachverhalt
 * mit Anzeigetitel). Beides in einen Typ zu zwingen hieße, an einer Stelle zu
 * lügen.
 *
 * Keine Laufzeit außer `Number`, keine UI: die Datei ist spiegelbar.
 */
import type { CaseKind, CaseLifecycle } from "@/ludwig/modules/accounting-cases";
import type { Currency } from "@/ludwig/shared/money";
import type { SepaTags } from "./sepa-tags";

/**
 * Der Zustand des DATEV-Abgleichs einer Zeile, als **Wert der Achse**.
 *
 * `null` in der Spalte heißt „die Kaskade ist für diese Zeile nie gelaufen".
 * Das ist eine Aussage, keine fehlende Angabe — und solange sie als `null`
 * durchgereicht wurde, erfand jede Anzeige ihr eigenes Wort dafür. Die
 * Auszugs-Detailsicht schrieb „kein Treffer" und behauptete damit ein
 * Ergebnis, wo noch nicht gesucht worden war (L-218).
 *
 * Der CHECK trägt `not_run` seit `20260908140000`; geschrieben wird er noch
 * nicht, deshalb normalisiert diese Funktion.
 */
export function bankMatchStage(raw: string | null | undefined): string {
  return raw ?? "not_run";
}

/** Ein Sachverhalt, wie ihn die Auszugszeile nennt. */
export interface StatementLineCase {
  caseId: string;
  caseNumber: string | null;
  fiscalYear: number | null;
  title: string | null;
  /** Achsen-Werte, keine freien Strings — beide haben einen DB-CHECK und ihre
   *  TS-Quelle im Sachverhalts-Modul (dieselbe Lehre wie L-212). */
  kind: CaseKind | null;
  counterpartyName: string | null;
  lifecycleStatus: CaseLifecycle | null;
  /** Der Anteil dieser Zahlung, der auf den Sachverhalt fällt. */
  amount: number | null;
  currency: Currency | null;
  /** Zustand der Buchung an DIESEM Ereignis, nicht am Sachverhalt. */
  eventBookingState: string | null;
  /** Gesetzt heißt „hier kommt nie eine Buchung", und der Text ist der Grund. */
  noBookingRequiredReason: string | null;
}

/** Die Auszugszeile in der Form, die das Set liest. */
export interface StatementLineVM {
  id: string;
  postingDate: string;
  /**
   * **Das Vorzeichen ist die Richtung**: positiv = Eingang, negativ = Ausgang.
   * Eine Zahl, kein String — die Query gibt `numeric` als Text heraus, und
   * einmal an der Grenze zu wandeln ist ehrlicher, als es in fünf Anzeigen
   * zu wiederholen.
   */
  amount: number;
  currency: Currency;
  counterpartyName: string | null;
  purpose: string | null;
  sepaTags: SepaTags | null;
  /**
   * Achse `bank_match_stage`, bereits normalisiert: `not_run` statt `null`.
   * „Nicht gelaufen" ist etwas anderes als „nichts gefunden" — und ein Wert
   * der Achse, kein fehlender (L-218).
   */
  matchStage: string;
  cases: StatementLineCase[];
  /** Σ |Ereignisbetrag| über alle Zuordnungen — der Rest ist `amount` minus das. */
  allocatedSum: number;
  /** Offene Rückfragen am Sachverhalt, nicht an der Zeile. */
  openClarificationsCount: number;
}

/**
 * Eine Zeile des Kontoauszugs.
 *
 * Die Eingabe ist strukturell getippt statt aus `infrastructure/` importiert:
 * die Datei bleibt so ohne Modul-Abhängigkeit und damit spiegelbar.
 */
export function statementLineFromAssignmentRow(row: {
  id: string;
  postingDate: string;
  amount: string;
  currency: string;
  counterpartyName: string | null;
  purpose: string | null;
  sepaTags: Record<string, string> | null;
  matchStage: string | null;
  allocatedSum: number;
  openClarificationsCount: number;
  cases: readonly {
    caseId: string;
    caseNumber: string | null;
    caseKind: string | null;
    caseTitle: string | null;
    caseFiscalYear: number | null;
    caseCounterpartyName: string | null;
    caseLifecycleStatus: string | null;
    eventAmount: number;
    proposalStatus: string | null;
    noBookingRequiredReason: string | null;
  }[];
}): StatementLineVM {
  return {
    id: row.id,
    postingDate: row.postingDate,
    amount: Number(row.amount),
    currency: row.currency as Currency,
    counterpartyName: row.counterpartyName,
    purpose: row.purpose,
    sepaTags: (row.sepaTags as SepaTags | null) ?? null,
    matchStage: bankMatchStage(row.matchStage),
    allocatedSum: row.allocatedSum,
    openClarificationsCount: row.openClarificationsCount,
    cases: row.cases.map((c) => ({
      caseId: c.caseId,
      caseNumber: c.caseNumber,
      fiscalYear: c.caseFiscalYear,
      title: c.caseTitle,
      kind: c.caseKind as CaseKind | null,
      counterpartyName: c.caseCounterpartyName,
      lifecycleStatus: c.caseLifecycleStatus as CaseLifecycle | null,
      amount: c.eventAmount,
      currency: row.currency as Currency,
      // Die Regel dafür steht in der Status-Registry (`resolveEventBookingState`)
      // und gilt für Auszug und Sachverhalts-Verlauf gleichermaßen. Hier kommt
      // der Rohwert durch; wer ihn zeigt, fragt die Registry.
      eventBookingState: c.proposalStatus,
      noBookingRequiredReason: c.noBookingRequiredReason,
    })),
  };
}

/**
 * Eine offene Zahlung der Arbeitsliste.
 *
 * Sie trägt weniger als die Auszugszeile: keinen Sachverhalt (das ist ihre
 * Definition), keinen DATEV-Zustand, keine SEPA-Tags — die Query dahinter
 * sucht das, was noch keinem Vorgang gehört, nicht das, was schon einen hat.
 */
export function statementLineFromOpenRow(row: {
  id: string;
  postingDate: string;
  amount: string;
  currency: string;
  counterpartyName: string | null;
  purpose: string | null;
}): StatementLineVM {
  return {
    id: row.id,
    postingDate: row.postingDate,
    amount: Number(row.amount),
    currency: row.currency as Currency,
    counterpartyName: row.counterpartyName,
    purpose: row.purpose,
    sepaTags: null,
    matchStage: bankMatchStage(null),
    cases: [],
    allocatedSum: 0,
    openClarificationsCount: 0,
  };
}
