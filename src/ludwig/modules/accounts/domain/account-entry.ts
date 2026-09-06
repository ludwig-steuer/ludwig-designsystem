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
}): AccountFactsVM {
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
  };
}
