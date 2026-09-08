/**
 * # Eine Bewegung auf einem Konto
 *
 * Bis 2026-09-06 gab es dafür zwei Typen, die sich nicht kannten:
 * `AccountLedgerRow` (snake_case, Beträge als `string`, Ludwig-Seite) und
 * `TruthAccountEntryRow` (camelCase, Beträge als `number`, DATEV-Spiegel).
 * Keiner trug, von welcher Seite er kam — die Vereinigung war die
 * Tab-Umschaltung auf der Konto-Detailseite (L-14).
 *
 * Hier steht die kanonische Form. Die Herkunft ist ein **Wert**, kein
 * Tab: `source` sagt, wer die Bewegung führt, und beide Seiten liegen im
 * selben Array. Erst damit lässt sich fragen „was steht in DATEV, das
 * Ludwig nicht hat" — die Frage, um die es am Kontoblatt geht.
 *
 * Keine Laufzeit außer den beiden Adaptern, keine UI, kein DB-Zugriff:
 * die Datei ist spiegelbar.
 */

/** Welche Seite die Bewegung führt. */
export type AccountEntrySource = "ludwig" | "datev";

/**
 * Eine Bewegung, unabhängig von der Seite.
 *
 * Beträge sind Zahlen in Kontowährung, immer positiv — die Richtung steckt
 * darin, ob `debitAmount` oder `creditAmount` gefüllt ist. Felder, die es
 * nur auf einer Seite gibt, sind optional und tragen im Kommentar, welche.
 */
export interface AccountEntry {
  id: string;
  source: AccountEntrySource;
  postingDate: string | null;
  /** DATEV Belegfeld 1 — auf beiden Seiten dasselbe Feld. */
  documentNumber: string | null;
  /** Buchungstext. */
  text: string | null;
  debitAmount: number;
  creditAmount: number;
  /** Die übrigen Konten des Satzes, kommasepariert. */
  contraAccounts: string | null;

  // — nur `ludwig` —
  /** Laufender Saldo bis einschließlich dieser Zeile. */
  runningBalance?: number | null;
  counterpartyName?: string | null;
  /** `ai_proposed` · `manual` · `system_reversal` · `recurring_rule`. */
  entryOrigin?: string | null;
  /** Achse `buchung`: proposed · accepted · posted · reversed. */
  status?: string | null;
  /** Deeplink-Ziel `/cases/<caseId>?event=<eventId>`. */
  eventId?: string | null;
  caseId?: string | null;
  exportedAt?: string | null;
  /** Gesetzt, wenn der Abgleich die Bewegung im Spiegel wiedergefunden hat. */
  datevMirrorEntryId?: string | null;

  // — nur `datev` —
  accountingSequenceId?: string | null;
  /** Sachverhalts-Nummer, die DATEV als Zusatzinformation führt. */
  ludwigCaseNumber?: string | null;
  /** Achse `mirror_match`. */
  matchState?: string | null;
  /** DATEV-Herkunftskennzeichen: RE, WK, SV, JA, AN, KS. */
  markOfOrigin?: string | null;
}

/** Betrag aus einer `numeric`-Spalte; NULL und Unparsbares werden 0. */
function amount(value: string | number | null | undefined): number {
  if (value == null) return 0;
  const n = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Ludwig-Zeile → kanonische Bewegung.
 *
 * Der Parametertyp ist strukturell und nicht importiert: die Domäne von
 * `accounts` soll nicht von `accounting-cases/infrastructure` abhängen, nur
 * damit sie eine Zeile umformen kann.
 */
export function accountEntryFromLedgerRow(row: {
  id: string;
  booking_date: string;
  belegfeld1: string | null;
  buchungstext: string | null;
  debit_amount: string;
  credit_amount: string;
  running_balance: string;
  counter_account_number: string | null;
  counter_account_name: string | null;
  creditor_name: string | null;
  origin: string | null;
  event_id: string | null;
  case_id: string | null;
  status: string;
  exported_at: string | null;
  datev_mirror_entry_id: string | null;
}): AccountEntry {
  return {
    id: row.id,
    source: "ludwig",
    postingDate: row.booking_date,
    documentNumber: row.belegfeld1,
    text: row.buchungstext,
    debitAmount: amount(row.debit_amount),
    creditAmount: amount(row.credit_amount),
    contraAccounts: row.counter_account_number,
    runningBalance: amount(row.running_balance),
    counterpartyName: row.creditor_name ?? row.counter_account_name,
    entryOrigin: row.origin,
    status: row.status,
    eventId: row.event_id,
    caseId: row.case_id,
    exportedAt: row.exported_at,
    datevMirrorEntryId: row.datev_mirror_entry_id,
  };
}

/** DATEV-Spiegel-Zeile → kanonische Bewegung. */
export function accountEntryFromTruthRow(row: {
  id: string;
  postingDate: string | null;
  belegfeld1: string | null;
  text: string | null;
  accountingSequenceId: string | null;
  ludwigCaseNumber: string | null;
  matchState: string | null;
  debitAmount: number;
  creditAmount: number;
  contraAccounts: string | null;
  markOfOrigin?: string | null;
}): AccountEntry {
  return {
    id: row.id,
    source: "datev",
    postingDate: row.postingDate,
    documentNumber: row.belegfeld1,
    text: row.text,
    debitAmount: amount(row.debitAmount),
    creditAmount: amount(row.creditAmount),
    contraAccounts: row.contraAccounts,
    accountingSequenceId: row.accountingSequenceId,
    ludwigCaseNumber: row.ludwigCaseNumber,
    matchState: row.matchState,
    markOfOrigin: row.markOfOrigin ?? null,
  };
}

/**
 * # Die Fakten eines Kontos in einem Wirtschaftsjahr
 *
 * Bis 2026-09-06 zweimal von Hand zusammengesetzt — im Kopf des
 * Konto-Drawers und in den Kennzahlen der Konto-Detailseite, jedes Mal aus
 * anderen Teilen (L-13).
 *
 * `usageBookingCount` und `lastBookingDate` sind bewusst **jahresübergreifend**:
 * sie beantworten „wird dieses Konto überhaupt benutzt", und diese Frage
 * verliert ihren Sinn, wenn man sie aufs Jahr beschneidet.
 */
export interface AccountFactsVM {
  accountNumber: string;
  accountName: string | null;
  /** Rolle im Kontenrahmen, etwa `expense` oder `bank`. */
  accountingRole: string | null;
  fiscalYear: number;
  /** Sätze des Jahres auf der Ludwig-Seite. */
  ludwigEntryCount: number;
  /** Sätze des Jahres im DATEV-Spiegel. */
  datevEntryCount: number;
  /** Davon noch nicht freigegeben. */
  openProposalCount: number;
  /** Über alle Jahre. */
  usageBookingCount: number;
  /** Über alle Jahre. */
  lastBookingDate: string | null;

  // — 2026-09-07 ergänzt (L-94) —

  /** Währung der drei Beträge. Ohne sie ist eine Zahl keine Aussage. */
  currency: string;
  /** Summe aller Sollbuchungen des Jahres. */
  totalDebit: number;
  /** Summe aller Habenbuchungen des Jahres. */
  totalCredit: number;
  /**
   * Saldo laut DATEV — die führende Zahl. „Wie viel liegt drauf" beantwortet
   * das Kontoblatt aus DATEV, nicht aus Ludwig.
   */
  datevBalance: number | null;
  /**
   * Was Ludwig zusätzlich gebucht hat und in DATEV noch nicht steht — das
   * Delta, nicht der zweite Saldo. Zwei konkurrierende Salden nebeneinander
   * wären die teuerste Art, dieselbe Frage zweimal zu beantworten.
   */
  ludwigOnlyAmount: number | null;
  /**
   * Wie viele Sätze diesen Betrag ausmachen (L-209). Nicht `ludwigEntryCount`
   * — der zählt alle Ludwig-Sätze des Jahres, also auch die, die in DATEV
   * längst stehen. Wer den Satz „x Sätze über y €" schreibt, braucht diese
   * Zahl; mit der anderen stünde dort eine größere, falsche.
   */
  ludwigOnlyCount: number | null;
}

/**
 * Ein Monat auf dem Konto — die Balken des Verlaufs.
 *
 * Lag als `AccountMonthTotals` in `accounting-cases/infrastructure`; die
 * Monatswerte gehören zum Konto, nicht zum Sachverhalt, und der Spiegel nimmt
 * aus `infrastructure/` nichts (L-95).
 */
export interface AccountMonth {
  /** 1–12. */
  month: number;
  debit: number;
  credit: number;
}

/**
 * Die Fakten aus den Teilen bauen, die Drawer und Detailseite ohnehin laden.
 *
 * Eine Funktion statt zweier Handmontagen — genau die Doppelung aus L-13.
 * Was eine Seite nicht hat (der Drawer kennt keine Jahres-übergreifende
 * Nutzung), gibt sie als `null` bzw. `0` mit; die Form bleibt dieselbe.
 */
export function accountFacts(input: {
  accountNumber: string;
  accountName: string | null;
  accountingRole: string | null;
  fiscalYear: number;
  ludwigEntryCount: number;
  datevEntryCount: number;
  openProposalCount?: number;
  usageBookingCount?: number | null;
  lastBookingDate?: string | null;
  currency?: string;
  months?: readonly AccountMonth[];
  datevBalance?: number | null;
  ludwigOnlyAmount?: number | null;
  ludwigOnlyCount?: number | null;
}): AccountFactsVM {
  // Σ Soll und Σ Haben aus den Monatswerten, statt sie an jeder Aufrufstelle
  // erneut zu summieren (L-94, Rang 7 des Entitätsprofils).
  const months = input.months ?? [];
  const totalDebit = months.reduce((sum, m) => sum + m.debit, 0);
  const totalCredit = months.reduce((sum, m) => sum + m.credit, 0);
  return {
    accountNumber: input.accountNumber,
    accountName: input.accountName,
    accountingRole: input.accountingRole,
    fiscalYear: input.fiscalYear,
    ludwigEntryCount: input.ludwigEntryCount,
    datevEntryCount: input.datevEntryCount,
    openProposalCount: input.openProposalCount ?? 0,
    usageBookingCount: input.usageBookingCount ?? 0,
    lastBookingDate: input.lastBookingDate ?? null,
    currency: input.currency ?? "EUR",
    totalDebit,
    totalCredit,
    datevBalance: input.datevBalance ?? null,
    ludwigOnlyAmount: input.ludwigOnlyAmount ?? null,
    ludwigOnlyCount: input.ludwigOnlyCount ?? null,
  };
}

/**
 * # Woher eine Bewegung kommt — die vier Klassen
 *
 * `source` sagt, welche Seite die Zeile geliefert hat. Das ist die halbe
 * Antwort: die eigentliche Frage am Kontoblatt ist, ob **beide Seiten
 * dasselbe sagen**. Vier Fälle, und sie schließen sich aus:
 *
 * - `datev` — steht nur im Spiegel, Ludwig kennt die Bewegung nicht.
 * - `mirrored` — Ludwig hat gebucht, DATEV hat es bestätigt.
 * - `exported` — Ludwig hat exportiert, im Spiegel ist sie **nicht**
 *   wiedergefunden. Der Fall, der auffallen muss (Push-204 ≠ angekommen).
 * - `ludwig` — nur in Ludwig, noch nicht an DATEV übergeben.
 */
export type AccountEntryOrigin = "datev" | "mirrored" | "exported" | "ludwig";

export function accountEntryOrigin(entry: AccountEntry): AccountEntryOrigin {
  if (entry.source === "datev") {
    return entry.matchState?.startsWith("matched_") ? "mirrored" : "datev";
  }
  if (entry.datevMirrorEntryId) return "mirrored";
  return entry.exportedAt ? "exported" : "ludwig";
}
