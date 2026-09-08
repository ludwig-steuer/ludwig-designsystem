/**
 * Kanonisches Sichtmodell eines Buchungssatzes und seiner Zeilen.
 *
 * Bildschirm-agnostisch: Sachverhalt, Beleg oder jede andere Oberfläche bildet
 * ihre Daten auf diese Formen ab und rendert dieselben Komponenten. Beträge
 * sind positive Zahlen in `currency`; `confidence` ist der rohe `0..1`-Wert
 * aus `client_journal_entry.proposal_confidence`.
 *
 * Die Datei lag bis 2026-09-06 als `ui/booking/types.ts` unter `ui/` und hat
 * das Domänen-VM der Klärungen (`overview-vm.ts`) gezwungen, aus `@/ui/`
 * zu importieren — womit `sync-ludwig.sh` es übersprang (L-06, L-07, L-09).
 * Sie enthält nur Typen, keine Laufzeit und keine UI; `@/ui/booking`
 * re-exportiert sie unverändert weiter.
 */
import type { Currency } from "@/ludwig/shared/money";

export type BookingSide = "debit" | "credit";

/** Mirrors `client_journal_entry.status`. */
export type BookingStatus = "proposed" | "accepted" | "posted" | "reversed";

export interface BookingLineVM {
  side: BookingSide;
  /** Snapshot account number, e.g. `6815`. */
  accountNumber: string;
  /** Snapshot account name, e.g. `Telefon`. */
  accountName: string;
  /** Always positive. */
  amount: number;
  /** DATEV Steuerschlüssel (BU), e.g. `VST19` — may be NULL. */
  taxKey: string | null;
  /** Tax rate in percent, e.g. `19` — may be NULL. */
  taxRatePercent: number | null;
  /**
   * DATEV-Felder der Teilbuchung. DATEV kennt keine Satz-Kopf-Ebene — eine
   * Zeile IST ein Buchungssatz und trägt Buchungstext, Belegfeld 1/2 und
   * KOST1/2 selbst (StB-Rückspräche 2026-07-14).
   */
  lineText?: string | null;
  /** DATEV Belegfeld 1, z.B. Rechnungsnummer (F33: Multizahlung). */
  externalDocumentNumber?: string | null;
  /** DATEV Belegfeld 2. */
  externalDocumentNumber2?: string | null;
  /** DATEV KOST1 (Kostenstelle) / KOST2 (Kostenträger) — je Zeile eigenständig. */
  kost1?: string | null;
  kost2?: string | null;
  /**
   * F152: DATEV „Sachverhalt L+L" (§ 13b-Fallcode, 1–16), den der Submit-Kern
   * aus dem Sitzland des Ausstellers gesetzt hat. Reine Anzeige neben dem
   * BU-Schlüssel — keine Zustandsachse, eine Klasse (F151).
   */
  reverseChargeCase?: number | null;
  /** Marks a line the AI is unsure about (renders a hint). */
  uncertain?: boolean;
  // Keine Zeilen-Ampel mehr (2026-08-29): die Ampel gilt dem Satz, siehe
  // `entryConfLevel` in `./format` über `JournalEntryVM.confidence`.
}

/**
 * Strukturell entkoppelte Sicht auf eine `rationale source` (F03) — vermeidet
 * einen Import aus dem accounting-cases-Domain in die geteilte Booking-UI.
 * Kanonische Definition: `accounting-cases/domain/rationale-source.ts`.
 */
export interface RationaleSourceLike {
  kind: string;
  id?: string;
  url?: string;
  citation?: string;
  quote?: string;
  /**
   * Nur bei `kind='ledger_account'`: aufgelöste Kontonummer (aus der id), damit
   * der Aufrufer einen Konto-Link bauen kann. NULL = id nicht (mehr) auflösbar
   * → Chip bleibt nicht-klickbar (kein toter Link).
   */
  accountNumber?: string | null;
}

export interface JournalEntryVM {
  journalEntryId: string;
  status: BookingStatus;
  /** `ai_proposed` | `manual` | `recurring_rule` | `system_reversal` | `client_import`. */
  origin: string;
  /** Wie freigegeben: `ai_unmodified` | `ai_edited` | `manual_only` | `imported`. */
  acceptanceQuality?: string | null;
  /** Raw `0..1` confidence, or NULL for non-AI bookings. */
  confidence: number | null;
  bookingDate: string | null;
  /** German free-text AI reasoning (`proposal_rationale`). */
  rationale: string | null;
  /** Belegte Quellen der Entscheidung (`proposal_rationale.sources`, F03). */
  sources?: RationaleSourceLike[];
  /**
   * Repair-Kette (F31-T31.1): dieser Satz ersetzt einen vom Judge geflaggten.
   * Trägt den Befund, auf den der Booking-Agent geantwortet hat.
   */
  repairedFrom?: { judgeComment: string | null; violatedCriteria: string[] } | null;
  /** GoBD-locked → not editable, only reversible. */
  isLocked: boolean;
  /**
   * DATEV-Export-Markierung (F10-T10.2): Anzeige-Datum des Exports, oder
   * NULL/undefined = nie exportiert. Exportierte Buchungen sind nur noch
   * stornierbar (Guard serverseitig).
   */
  exportedAt?: string | null;
  /** Dateiname des Export-Stapels (Batch-Info fürs Badge). */
  exportFileName?: string | null;
  /**
   * Opake DATEV-Roundtrip-Referenz („LW-XXXXXXXX", `client_journal_entry.export_ref`).
   * Sie geht als Zusatzinformation „LudwigAI-Ref" mit in den Stapel und ist die
   * ID, über die die Kanzlei eine DATEV-Zeile wieder dieser Buchung zuordnet.
   * NULL = die Buchung war noch in keinem Exportvorgang.
   */
  exportRef?: string | null;
  /** Verbundener Exportvorgang: Id (für den Link), Stapelnummer, Zustand. */
  exportBatchId?: string | null;
  exportStapelnummer?: string | null;
  exportBatchState?: string | null;
  /** Anlage / letzte Änderung des Satzes (ISO-Timestamps). */
  createdAt?: string | null;
  updatedAt?: string | null;
  /** Blocked by an open clarification → not yet bookable. */
  blocked: boolean;
  currency: Currency;
  lines: BookingLineVM[];
}

export interface KontoOption {
  id?: string;
  accountNumber: string;
  accountName: string;
  /** `general_ledger` | `creditor` | `debtor` | `revenue` | `other`. */
  role?: string;
  /** Usage count for ranking the combobox (optional). */
  uses?: number;
}

export interface TaxKeyOption {
  /** DATEV BU key, e.g. `9`. Empty string = "unklar → Review". */
  key: string;
  label: string;
  ratePercent: number | null;
}

/**
 * Kompakt-Darstellung eines Buchungs-Vorschlags (`BookingProposalCompact`) —
 * Teilmenge von `JournalEntryVM`. Aufrufer geben ihre Buchung (z. B.
 * `CaseEventBooking`) direkt herein; die Zeilen genügen strukturell
 * `BookingLineVM`.
 */
export interface CompactBookingVM {
  status: string;
  origin: string;
  isLocked: boolean;
  proposalConfidence: number | null;
  lines: BookingLineVM[];
}
