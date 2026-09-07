/**
 * # Das Ereignis am Sachverhalt
 *
 * Was an einem Sachverhalt passiert ist: ein Beleg kam, eine Zahlung ging
 * raus, eine Korrektur wurde gebucht. Das Ereignis ist die mittlere Schicht
 * der Kette Beleg → Ereignis → Sachverhalt → Buchung.
 *
 * Lag bis 2026-09-07 in `infrastructure/case-detail-queries.ts` — aus
 * `infrastructure/` nimmt der Spiegel nichts, und die Zeitleiste des
 * Design-Systems arbeitete deshalb gegen eine lokale Kopie (L-08).
 *
 * Reines Typ-Material: die Datei ist spiegelbar.
 */

export interface CaseEventBookingLine {
  lineNo: number;
  side: "debit" | "credit";
  amount: number;
  accountNumber: string;
  accountName: string;
  taxKey: string | null;
  taxRatePercent: number | null;
  /** DATEV Buchungstext dieser Zeile. */
  lineText: string | null;
  /** DATEV Belegfeld 1 / 2 dieser Zeile. */
  externalDocumentNumber: string | null;
  externalDocumentNumber2: string | null;
  /** DATEV KOST1 / KOST2 dieser Zeile (Aufwandssplit je Kostenstelle). */
  kost1: string | null;
  kost2: string | null;
}

export interface CaseEventBooking {
  journalEntryId: string;
  status: string;
  origin: string;
  bookingDate: string;
  isLocked: boolean;
  proposalConfidence: number | null;
  /** Wie freigegeben: `ai_unmodified` | `ai_edited` | `manual_only` | `imported`. */
  acceptanceQuality: string | null;
  /** Strukturierte KI-Begründung (`proposal_rationale` jsonb) — enthält u.a.
   *  ``judge[].reasoning_short`` (deutscher Klartext) + ``overall_confidence``. */
  proposalRationale: Record<string, unknown> | null;
  /** DATEV-Export-Markierung (T10.2): Zeitpunkt, oder null = nie exportiert. */
  exportedAt: string | null;
  /** Dateiname des Export-Stapels (`client_datev_export_batches.file_name`). */
  exportFileName: string | null;
  /**
   * Opake Roundtrip-Referenz (`export_ref`, „LW-XXXXXXXX") — geht als
   * DATEV-Zusatzinformation „LudwigAI-Ref" mit und ist damit DIE ID, über die
   * eine DATEV-Zeile wieder auf diese Buchung zeigt. NULL = noch nie in einem
   * Exportvorgang gewesen (die Referenz wird beim Stapel-Bau vergeben).
   */
  exportRef: string | null;
  /** Verbundener Exportvorgang (`export_batch_id`) + dessen Nummer/Zustand. */
  exportBatchId: string | null;
  exportStapelnummer: string | null;
  exportBatchState: string | null;
  /** Anlage/letzte Änderung des Satzes (Debug + Nachvollzug). */
  createdAt: string | null;
  updatedAt: string | null;
  lines: CaseEventBookingLine[];
}

export interface CaseEventSourceDoc {
  sourceDocId: string;
  sourceDocType: string | null;
  storedFileId: string | null;
  originalFileName: string | null;
  vendorName: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  invoiceTotalValue: number | null;
  currency: string | null;
  classCounterpartyName: string | null;
  classCounterpartyVatId: string | null;
  classCaseSummary: string | null;
  classSummary: string | null;
}

export interface CaseEventBankTransaction {
  bankTransactionId: string;
  postingDate: string;
  amount: number;
  amountEur: number | null;
  currency: string;
  purpose: string | null;
  counterpartyName: string | null;
  paymentAccountName: string | null;
}

export interface CaseEvent {
  eventId: string;
  kind: string;
  eventDate: string;
  fiscalYear: number;
  amount: number;
  currency: string;
  notes: string | null;
  /** Optionaler kurzer Anzeigename (vom Agenten/Menschen gesetzt); NULL → deriveTitle. */
  title: string | null;
  /** F36: gesetzt = Event wurde durch ein neueres ersetzt (Korrekturbeleg). */
  supersededByEventId: string | null;
  /** Gesetzt = an diesem Ereignis entsteht absichtlich nie eine Buchung; der
   *  Text ist die Begründung und wird dem Nutzer angezeigt. */
  noBookingRequiredReason: string | null;
  sourceDoc: CaseEventSourceDoc | null;
  bankTransaction: CaseEventBankTransaction | null;
  booking: CaseEventBooking | null;
}
