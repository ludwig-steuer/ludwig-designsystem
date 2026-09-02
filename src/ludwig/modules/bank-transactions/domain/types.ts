/**
 * Domain-Typen für Bank-Transaktions-Import (Phase 1).
 *
 * `BankTransactionRow` ist die neutrale Form nach dem Parsen — sowohl der
 * DATEV-CSV-Parser als auch der Qonto-API-Client mappen ihre Quellen-
 * spezifischen Felder auf diese Struktur, bevor sie in die Pipeline
 * (Cutoff-Filter, Dedup, Insert, Audit) fließen.
 */

export type BankTransactionSource = "csv" | "qonto" | "manual";

/**
 * Unterstützte Bank-Datei-Formate. Erweitern, sobald ein neuer Parser
 * dazukommt (MT940, OFX, …). Die Format-Detection (`infrastructure/
 * format-detection.ts`) entscheidet anhand des Datei-Headers.
 */
export type BankFileFormatId =
  | "datev-buchungsstapel"
  | "qonto-de-v1"
  | "camt-053"
  | "vr-bank-mt940-xlsx"
  | "commerzbank-csv";

/**
 * Beschreibt ein Quell-Feld im erkannten Format und worauf es im
 * neutralen `BankTransactionRow` abgebildet wird. Für den Wizard-Preview
 * gedacht — der User soll vor dem Import sehen, welches Feld wohin geht.
 * Bei CSV-Formaten ist `sourceHeader` der Spalten-Name; bei XML-Formaten
 * (CAMT) der semantische Pfad (z.B. `Ntry/Amt`).
 */
export interface BankCsvColumnRole {
  /** Spalten-Header oder semantischer Pfad in der Quelldatei. */
  sourceHeader: string;
  /** Zielfeld in `BankTransactionRow`, oder `null` für reine Metadaten. */
  mapsTo:
    | "postingDate"
    | "valueDate"
    | "amount"
    | "currency"
    | "purpose"
    | "counterpartyName"
    | "counterpartyIban"
    | "counterpartyBic"
    | "externalId"
    | null;
  /** Kurze, deutsche Erklärung für die UI ("Buchungsdatum", "Metadatum"…). */
  description: string;
}

/**
 * Dry-Run-Ergebnis aus `analyzeBankCsvAction`. Wird im Wizard Schritt 1
 * gerendert: erkanntes Format, Spalten-Mapping, normalisierte Preview,
 * Counts und Hinweise — aber kein DB-Insert.
 */
export interface BankCsvAnalysis {
  format: BankFileFormatId;
  formatLabel: string;
  columns: BankCsvColumnRole[];
  /** Maximal die ersten 5 Zeilen, bereits normalisiert. */
  preview: BankTransactionRow[];
  rowCount: number;
  /** Anzahl Zeilen mit Original-Währung ≠ Kontowährung (reine Info). */
  nonAccountCurrencyCount: number;
  warnings: string[];
}

/**
 * Kennung des Kontos, zu dem ein Auszug gehört — aus dem Statement-KOPF, nicht aus den Zeilen.
 * Basis für die automatische Kontozuordnung (`docs/topics/bank.md`).
 * Bisher wurde nur die Gegenpartei-IBAN gelesen und die eigene verworfen.
 */
export interface StatementAccountRef {
  /** IBAN des Auszugskontos (CAMT: `Stmt/Acct/Id/IBAN`). */
  iban: string | null;
  /** Kennung ohne IBAN — PayPal-Konto, Kreditkarten-Kreis, Provider-Account-Id. */
  externalAccountId: string | null;
  /** Bankname/BIC, sofern der Auszug ihn trägt — hilft beim Kandidaten-Matching. */
  bankName: string | null;
  bic: string | null;
}

export interface BankTransactionRow {
  /** Stabile externe ID, sofern verfügbar (z.B. Qonto transaction_id). */
  externalId: string | null;
  /** Buchungsdatum (date, ISO-Format YYYY-MM-DD). */
  postingDate: string;
  /** Optional: Wertstellungsdatum. */
  valueDate: string | null;
  /** Originalwährung. Phase 1 erwartet ausschließlich "EUR". */
  currency: string;
  /** Originalbetrag. Vorzeichen: positiv = Eingang, negativ = Ausgang. */
  amount: string;
  /** Verwendungszweck / Buchungstext. */
  purpose: string | null;
  /** Name der Gegenpartei, sofern vorhanden. */
  counterpartyName: string | null;
  /** IBAN der Gegenpartei, sofern vorhanden. */
  counterpartyIban: string | null;
  /** BIC der Gegenpartei, sofern vorhanden. */
  counterpartyBic: string | null;
  /** Original-Daten der Quelle (CSV-Row als Object, Qonto-JSON-Subset). */
  rawPayload: Record<string, unknown>;
}

export interface BankImportPeriod {
  from: string | null;
  to: string | null;
}

/**
 * F66-T66.7: Auszugs-Salden + Sequenz, sofern die Quelle sie ausweist
 * (CAMT <Bal>, Qonto „Kontostand", PDF-Abtipp-Weg). Landen am Import-Batch
 * und sind die Datenbasis des Saldenanschluss-Gates (1a).
 */
export interface StatementBalance {
  opening: number | null;
  closing: number | null;
  sequence: number | null;
}

export interface BankImportResult {
  auditEventId: string | null;
  /** F133: Batch dieses Laufs; null, wenn keiner angelegt wurde (keine Zeilen, kein Saldo). */
  importBatchId: string | null;
  outcome: "success" | "partial" | "failure";
  imported: number;
  ignored: number;
  dedupSkipped: number;
  previousMaxDate: string | null;
  period: BankImportPeriod;
  warnings: string[];
  errors: string[];
  message: string;
}

export class BankImportError extends Error {
  readonly code: BankImportErrorCode;

  constructor(code: BankImportErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options as ErrorOptions);
    this.code = code;
    this.name = "BankImportError";
  }
}

export type BankImportErrorCode =
  | "configuration_missing"
  | "invalid_currency"
  | "parser_error"
  | "storage_error"
  | "qonto_api_error";
