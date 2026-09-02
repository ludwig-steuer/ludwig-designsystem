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

import type { AccountKind } from "@/ludwig/core/datev/account-number";

export type ExportLineSide = "debit" | "credit";

/**
 * Externe DATEV-Ablage-Referenz eines Belegs (GLOSSARY „DATEV document
 * reference", `client_source_docs.datev_ref_system/_id`) — Quelle für den
 * EXTF-Beleglink (Feld 20). `bedi` = Belegverwaltung online, `ddms` = DATEV DMS.
 */
export interface DatevDocumentRef {
  system: "bedi" | "ddms";
  id: string;
}

/**
 * Eine Line des Side-Patterns (`client_journal_entry_line`).
 *
 * Sie trägt ALLE DATEV-Felder selbst — Buchungstext, Belegfeld 1/2, KOST1/2.
 * DATEV kennt keine Satz-Kopf-Ebene: die führende Zeile eines Splits wird zu
 * genau einer EXTF-Zeile und liefert deren Felder. Kein Fallback auf den Kopf
 * (StB-Rückspräche 2026-07-14).
 */
export interface ExportableJournalEntryLine {
  lineNo: number;
  side: ExportLineSide;
  /** DB-numeric als String, Punkt-Dezimal, immer > 0 (z.B. "119.00"). */
  amount: string;
  /** DATEV BU-Schlüssel (tax_key), z.B. "9" = Vorsteuer 19 %. */
  taxKey: string | null;
  /** → Buchungstext (max. 60 Zeichen). */
  lineDescription: string | null;
  /** → Belegfeld 1, z.B. Rechnungsnummer (max. 36 Zeichen). */
  externalDocumentNumber: string | null;
  /** → Belegfeld 2 (max. 12 Zeichen). */
  externalDocumentNumber2: string | null;
  /** → KOST1 (Kostenstelle) / KOST2 (Kostenträger), je Zeile eigenständig. */
  kost1: string | null;
  kost2: string | null;
  /**
   * line_no der Basiszeile, zu der diese Steuerzeile gehört (vom Submit-Kern
   * beim Anlegen gesetzt). Der Steuer-Kollaps nutzt sie deterministisch;
   * NULL (Bestand, manuell, DATEV-Import) → ±1-Cent-Heuristik als Fallback.
   */
  taxForLineNo: number | null;
  accountNumberSnapshot: string;
  /**
   * Kontotyp aus `client_ledger_accounts.account_kind` (BL-109). Pflicht, weil
   * die DATEV-Draht-Breite davon abhängt (Sachkonto 8, Personenkonto 9 Stellen)
   * — geraten wird hier nicht mehr.
   */
  accountKind: AccountKind;
  /**
   * `client_ledger_accounts.id` der Zeile (T52.6) — Schlüssel für das
   * Export-Zeit-Mapping Ludwig-vergebener Personenkonten
   * (`source='system_allocated'`, 89xxxx-Platzhalter) auf die von DATEV
   * vergebene Nummer am Personenkonto. Optional: pure Builder-Tests ohne
   * DB-Kontext lassen es weg, dann findet kein Mapping statt.
   */
  accountId?: string;
  /**
   * BL-120: `client_ledger_accounts.accounting_role` — Grundlage der
   * Beleggruppen-Sortierung (debtor → Ausgangsrechnung, creditor →
   * Eingangsrechnung). Optional: fehlend zählt als Sachkonto.
   */
  accountingRole?: string | null;
  /**
   * BL-120: `client_payment_accounts.kind` des Kontos (bank/cash/…), null wenn
   * das Konto kein Zahlungskonto ist. Zahlungskonto gewinnt bei der
   * Beleggruppen-Zuordnung immer (cash → Kasse, sonst Bank).
   */
  paymentAccountKind?: string | null;
}

/**
 * Ein Buchungs-Header (`client_journal_entry`) inkl. Lines. Trägt nur noch,
 * was DATEV am Satz kennt (Datum, Währung) bzw. was Ludwig-intern ist
 * (Status, Export-Marker, Beleglink) — die Buchungsfelder sitzen an den Lines.
 */
export interface ExportableJournalEntry {
  id: string;
  /** Nur `accepted` wird exportiert — alles andere filtert der Builder. */
  status: string;
  /** ISO-Datum YYYY-MM-DD → DATEV-Belegdatum (TTMM). */
  bookingDate: string;
  currency: string;
  /**
   * T10.2-Filter-Hook: sobald die Export-Markierung (`exported_at`)
   * existiert, wird sie hier durchgereicht — Einträge mit gesetztem
   * Zeitstempel werden nie erneut exportiert. Bis dahin `null`.
   */
  exportedAt: string | null;
  /**
   * Distinct über den Sachverhalt referenzierte Belege mit DATEV-Ablage-
   * Referenz (F24-T24.1). Genau einer → Beleglink (Feld 20); leer →
   * still kein Link (dokumentierter Normalfall, Nicht-Ziel); mehrere →
   * uneindeutig, Writer warnt + Feld leer. Fehlt (Unit-Tests) = leer.
   */
  datevDocumentRefs?: DatevDocumentRef[];
  /**
   * Menschenlesbare Sachverhaltsnummer (`client_accounting_case.case_number`
   * über `accounting_event_id → case_id`). Wird als Zusatzinformation 1
   * („LudwigAI-Sachverhalt") an jede EXTF-Zeile des Satzes geschrieben —
   * Rückverweis vom DATEV-Buchungssatz auf den Ludwig-Sachverhalt.
   * Fehlt (kein Event/Case oder Unit-Tests) → Felder bleiben leer.
   */
  caseNumber?: string | null;
  /**
   * Opake Roundtrip-Referenz (`client_journal_entry.export_ref`) — wird als
   * Zusatzinformation 2 („LudwigAI-Ref") an jede EXTF-Zeile geschrieben und
   * macht den Rückweg von einer DATEV-Zeile auf DIE EINE Ludwig-Buchung
   * eindeutig (der Sachverhalts-Match reicht nicht — mehrere Buchungen je
   * Sachverhalt). Getrennt von der internen UUID (decision-log 2026-07-28).
   * Fehlt (Unit-Tests, noch nicht vergeben) → Felder bleiben leer.
   */
  exportRef?: string | null;
  lines: ExportableJournalEntryLine[];
}

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
