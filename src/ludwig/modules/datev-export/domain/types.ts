/**
 * DATEV-Export-Domain — Typen für den EXTF-Buchungsstapel-Writer.
 *
 * Der Writer ist die Rück-Richtung des Onboarding-Imports
 * (`datev_import_service.py` auf der Python-Seite bzw.
 * `bank-transactions/infrastructure/datev-buchungsstapel-parser.ts`
 * für den Web-Import): akzeptierte Ludwig-Buchungen
 * (`client_journal_entry` + `_line`, Side-Pattern) werden als
 * DATEV-Buchungsstapel-CSV (EXTF, CP1252, ';'-getrennt) exportiert,
 * damit DATEV führend bleibt (Variante A, decision-log 2026-07-04).
 */


/** Kopf-Daten für die EXTF-Header-Zeile (Zeile 1 der Datei). */
export interface BuchungsstapelHeader {
  /**
   * DATEV-Beraternummer der Kanzlei. Stand T10.1 gibt es dafür keine
   * strukturierte Spalte (weder `platform_tenants` noch
   * `platform_clients`) — Aufrufer reicht sie optional durch, sonst
   * bleibt das Feld leer und wird beim DATEV-Import manuell ergänzt.
   */
  consultantNumber: string | null;
  /** DATEV-Mandantennummer (`platform_clients.datev_client_number`). */
  clientDatevNumber: string | null;
  /** Wirtschaftsjahr-Beginn, ISO YYYY-MM-DD (Kalenderjahr-WJ angenommen). */
  fiscalYearStart: string;
  /** Sachkontenlänge (`platform_clients.datev_account_length`). */
  accountNumberLength: number;
  /** Datumsbereich des Stapels, ISO YYYY-MM-DD (inklusive). */
  periodFrom: string;
  periodTo: string;
  /** Kontenrahmen, z.B. "skr03"/"skr04" → Header-Feld 26 ("03"/"04"). */
  accountFrameworkCode: string | null;
  /** Basiswährung, z.B. "EUR". */
  currency: string;
  /** Bezeichnung des Stapels (Header-Feld 16). */
  label?: string;
  /** Erzeugungszeitpunkt für Header-Feld 5 — in Tests fixierbar. */
  createdAt?: Date;
}

/** Ergebnis des Builders. */
export interface BuchungsstapelCsvResult {
  /** CP1252-kodierte Datei-Bytes — das, was als Download rausgeht. */
  bytes: Uint8Array;
  /** Gleicher Inhalt als JS-String (Debug/Tests). */
  text: string;
  /** Anzahl DATEV-Daten-Zeilen (Splitbuchungen erzeugen mehrere). */
  rowCount: number;
  /**
   * IDs der tatsächlich exportierten `client_journal_entry`-Header —
   * Übergabepunkt für die T10.2-Markierung (`exported_at` +
   * `export_batch_id`).
   */
  entryIds: string[];
  /**
   * Summe aller Soll- bzw. Haben-Lines der exportierten Buchungen als
   * Dezimal-String mit Punkt ("1234.56") — für die Vorschau der
   * Export-Auslösung (T10.3). Bei balancierten Buchungen identisch.
   */
  debitTotal: string;
  creditTotal: string;
  /** Nicht-fatale Auffälligkeiten (Truncation, CP1252-Ersatzzeichen). */
  warnings: string[];
}
