/**
 * EXTF-Buchungsstapel des Mandanten → strukturierte Sätze (F69-T69.1).
 *
 * Pure Funktionen, kein IO. **Nie ein LLM**: Beträge, Kontonummern und
 * BU-Schlüssel dürfen nicht durch Transkription laufen (Owner-Entscheid 5).
 *
 * ## Warum ein eigener Parser
 *
 * `bank-transactions/infrastructure/datev-buchungsstapel-parser.ts` liest
 * dieselbe Datei, aber als *Kontoauszug*: sechs Spalten, Vorzeichen aus
 * Bankkonto-Sicht, Konto/Gegenkonto interessieren nicht. Ein Buchungssatz
 * braucht genau die: welches Konto gegen welches, mit welchem Steuerschlüssel.
 * Referenz für die Feldkunde ist der 2026-07-29 gelöschte Python-Importer
 * (`git show 0547c7c9^:…/lexoffice_extf_import_service.py`).
 *
 * ## Dateiaufbau (EXTF v700, CP1252, `;`-getrennt, Strings gequotet)
 *
 *   Zeile 1  File-Header: `"EXTF";700;21;"Buchungsstapel";…`
 *            Feld 2 = Datenkategorie (**21 = Buchungsstapel**), 12 = WJ-Beginn
 *            (`JJJJMMTT`), 13 = Sachkontenlänge, 26 = Kontenrahmen.
 *   Zeile 2  Spalten-Header mit deutschen Bezeichnern.
 *   Zeile 3+ Ein Buchungssatz je Zeile.
 *
 * ## Was hier NICHT entschieden wird
 *
 * Kontenauflösung, Personenkonto-Anlage, Sachverhalts-Bildung und Idempotenz
 * macht der Import-Kern. Dieser Parser liefert Zeilen oder Ablehnungen — er
 * kennt den Mandanten nicht.
 */

import { stripQuotes, tokenizeRow } from "@/ludwig/shared/csv";

/** Datenkategorie im EXTF-File-Header. */
const EXTF_CATEGORY_BUCHUNGSSTAPEL = 21;

/** Spaltennamen im EXTF-Buchungsstapel. `BU-Schlüssel` kommt in zwei Schreibweisen. */
const COLUMN = {
  amount: "Umsatz (ohne Soll/Haben-Kz)",
  debitCredit: "Soll/Haben-Kennzeichen",
  currency: "WKZ Umsatz",
  account: "Konto",
  contraAccount: "Gegenkonto (ohne BU-Schlüssel)",
  taxKey: "BU-Schlüssel",
  bookingDate: "Belegdatum",
  documentNumber: "Belegfeld 1",
  documentNumber2: "Belegfeld 2",
  text: "Buchungstext",
  kost1: "KOST1 - Kostenstelle",
  kost2: "KOST2 - Kostenstelle",
  documentLink: "Beleglink",
} as const;

/**
 * Schreibweise-Varianten je Spalte. Lexoffice/Lexware schreiben `BU-Schluessel`
 * ohne Umlaut, ältere Layouts das Gegenkonto ohne den Klammerzusatz — beides ist
 * dieselbe Spalte, nicht „Spalte fehlt".
 */
const COLUMN_ALIASES: Partial<Record<keyof typeof COLUMN, readonly string[]>> = {
  taxKey: ["BU-Schluessel", "BU-Schlssel"],
  contraAccount: ["Gegenkonto (ohne BU-Schluessel)", "Gegenkonto"],
};

type ColumnKey = keyof typeof COLUMN;

/** Ohne diese Spalten ist die Datei kein verwertbarer Buchungsstapel. */
const REQUIRED_COLUMNS: readonly ColumnKey[] = [
  "amount",
  "debitCredit",
  "account",
  "contraAccount",
  "bookingDate",
];

/** Ein Buchungssatz aus dem Stapel — Soll/Haben bereits aufgelöst. */
export interface ExtfBatchRow {
  /** Zeilennummer in der Datei (1-basiert, wie im Editor) — Anker der Ablehnung. */
  rowNo: number;
  /** Kontonummer der Soll-Seite. */
  debitAccount: string;
  /** Kontonummer der Haben-Seite. */
  creditAccount: string;
  /** Immer positiv, zwei Nachkommastellen als String (kein float, AGENTS.md). */
  amount: string;
  currency: string;
  /** ISO `YYYY-MM-DD`. */
  bookingDate: string;
  /** DATEV-BU-Schlüssel, oder null. */
  taxKey: string | null;
  /**
   * An welche Seite der BU-Schlüssel gehört. In DATEV bezieht er sich auf das
   * **Gegenkonto** (die Spalte heißt „Gegenkonto (ohne BU-Schlüssel)") — bei
   * `S` ist das die Haben-Seite, bei `H` die Soll-Seite. Wer ihn stattdessen an
   * die Konto-Zeile hängt, dreht beim Re-Export die Steuerwirkung um.
   */
  taxKeySide: "debit" | "credit";
  /** Belegfeld 1 — der OPOS-Anker und die Klammer der Sachverhalts-Bildung. */
  documentNumber: string | null;
  documentNumber2: string | null;
  text: string | null;
  kost1: string | null;
  kost2: string | null;
  /**
   * Feld 20 „Beleglink" — in der realen Lieferung der **Dateiname** des
   * Rechnungs-PDFs (`R26-0717_16096_Chase.pdf`), nicht der BEDI-Hash. Die
   * spezifischere Brücke zum nachgereichten Beleg als die Belegnummer allein:
   * sie nennt Beleg UND Konto.
   */
  documentLink: string | null;
  /** Aus den Beleginfo-Slots, wenn vorhanden — Name für Konto und Sachverhalt. */
  counterpartyName: string | null;
}

/** Ein Satz, der nicht importiert werden konnte — mit Grund. */
export interface BatchRejection {
  /** Zeilennummer in der Datei; 0 = die Datei als Ganzes. */
  rowNo: number;
  /** Maschinenlesbare Klasse — die Gruppierung im Gate-Bericht. */
  reason:
    | "format"
    | "unparsable_row"
    | "account_unknown"
    | "account_conflict"
    | "duplicate"
    | "no_cycle";
  /** Für Menschen: was genau schiefging und was zu tun ist. */
  detail: string;
  accountNumber?: string;
  documentNumber?: string;
  amount?: string;
}

export interface ExtfBatchHeader {
  /** WJ-Beginn als ISO-Datum; löst 4-stellige `TTMM`-Belegdaten auf. */
  fiscalYearStart: string | null;
  /** Sachkontenlänge laut Stapel — Personenkonto = diese Länge + 1. */
  accountNumberLength: number | null;
  /** z. B. `skr04`, wenn der Header ihn führt. */
  accountFrameworkCode: string | null;
}

export interface ExtfBatch {
  header: ExtfBatchHeader;
  rows: ExtfBatchRow[];
  /** Zeilen, die schon beim Parsen durchfielen (Format, Betrag, Datum). */
  rejections: BatchRejection[];
}

/** Wird geworfen, wenn die Datei als Ganzes kein Buchungsstapel ist. */
export class ExtfBatchFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExtfBatchFormatError";
  }
}

function decode(bytes: Uint8Array): string[] {
  return new TextDecoder("windows-1252")
    .decode(bytes)
    .split(/\r?\n/)
    .filter((l) => l.length > 0);
}

/**
 * Ist das ein EXTF-Buchungsstapel? Die Weiche vor dem Bank-Format-Routing —
 * bewusst nur der Header, ohne die Datei zu parsen: eine Routing-Entscheidung
 * darf nicht an einer kaputten Datenzeile scheitern.
 */
export function isExtfBuchungsstapel(bytes: Uint8Array): boolean {
  if (bytes.length === 0) return false;
  // Nur den Kopf dekodieren — bei einem 40-MB-Stapel wäre alles andere Verschwendung.
  const head = new TextDecoder("windows-1252").decode(bytes.subarray(0, 2048));
  const firstLine = head.split(/\r?\n/)[0];
  if (!firstLine) return false;
  const cells = tokenizeRow(firstLine).map(stripQuotes);
  return cells[0] === "EXTF" && Number.parseInt(cells[2] ?? "", 10) === EXTF_CATEGORY_BUCHUNGSSTAPEL;
}

function yyyymmddToIso(raw: string): string | null {
  const v = raw.trim();
  return /^\d{8}$/.test(v) ? `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}` : null;
}

function parseHeader(cells: string[]): ExtfBatchHeader {
  const at = (i: number) => (cells[i] ?? "").trim();
  const skl = Number.parseInt(at(13), 10);
  const skr = at(26);
  return {
    fiscalYearStart: yyyymmddToIso(at(12)),
    accountNumberLength: Number.isFinite(skl) && skl > 0 ? skl : null,
    accountFrameworkCode: skr ? `skr${skr.padStart(2, "0")}` : null,
  };
}

/** Spaltenname → Index. Fehlt eine Pflichtspalte, ist die Datei unbrauchbar. */
function mapColumns(headerCells: string[]): Partial<Record<ColumnKey, number>> {
  const index: Partial<Record<ColumnKey, number>> = {};
  for (const key of Object.keys(COLUMN) as ColumnKey[]) {
    const names = [COLUMN[key], ...(COLUMN_ALIASES[key] ?? [])];
    for (const name of names) {
      const i = headerCells.indexOf(name);
      if (i !== -1) {
        index[key] = i;
        break;
      }
    }
  }
  const missing = REQUIRED_COLUMNS.filter((k) => index[k] === undefined);
  if (missing.length) {
    throw new ExtfBatchFormatError(
      `EXTF-Buchungsstapel: Pflichtspalten fehlen (${missing
        .map((k) => COLUMN[k])
        .join(", ")}). Gefunden: ${headerCells.filter(Boolean).slice(0, 12).join(", ")}…`,
    );
  }
  return index;
}

/**
 * Deutscher Betrag → Decimal-String mit zwei Nachkommastellen. Kein `Number`
 * unterwegs: `1.234,56` würde als float schon beim Parsen ungenau.
 */
function parseGermanAmount(raw: string): string | null {
  const cleaned = raw.trim().replace(/\./g, "").replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return null;
  const [whole, frac = ""] = cleaned.split(".");
  const cents = `${frac}00`.slice(0, 2);
  const value = `${whole}.${cents}`;
  return value === "0.00" ? null : value;
}

/** `TTMM` (braucht den WJ-Beginn) oder `TTMMJJJJ` → ISO. */
function parseBelegdatum(raw: string, fiscalYearStart: string | null): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 8) {
    return `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`;
  }
  if (digits.length === 4) {
    if (!fiscalYearStart) return null;
    return `${fiscalYearStart.slice(0, 4)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`;
  }
  return null;
}

/**
 * EXTF führt bis zu 8 Beleginfo-Paare (Art/Inhalt). Interessant ist der
 * Geschäftspartner: er benennt ein neu anzulegendes Personenkonto und den
 * Sachverhalt. Bei Kollision gewinnt der erste Slot.
 */
function extractCounterparty(cells: string[], headerCells: string[]): string | null {
  for (let slot = 1; slot <= 8; slot += 1) {
    const artIdx = headerCells.indexOf(`Beleginfo - Art ${slot}`);
    const contentIdx = headerCells.indexOf(`Beleginfo - Inhalt ${slot}`);
    if (artIdx === -1 || contentIdx === -1) continue;
    const art = (cells[artIdx] ?? "").trim();
    const content = (cells[contentIdx] ?? "").trim();
    if (!content) continue;
    if (art === "Geschäftspartner" || art === "Geschaeftspartner") return content;
  }
  return null;
}

/** Belegnummer aus den Beleginfo-Slots, falls Belegfeld 1 leer blieb. */
function extractDocumentNumberFallback(cells: string[], headerCells: string[]): string | null {
  for (let slot = 1; slot <= 8; slot += 1) {
    const artIdx = headerCells.indexOf(`Beleginfo - Art ${slot}`);
    const contentIdx = headerCells.indexOf(`Beleginfo - Inhalt ${slot}`);
    if (artIdx === -1 || contentIdx === -1) continue;
    if ((cells[artIdx] ?? "").trim() !== "Belegnummer") continue;
    const content = (cells[contentIdx] ?? "").trim();
    if (content) return content;
  }
  return null;
}

/**
 * Datei → Sätze. Wirft nur, wenn die **Datei** unbrauchbar ist; eine einzelne
 * kaputte Zeile wird abgelehnt, nicht geworfen — der Rest des Stapels soll
 * ankommen, und die Ablehnung ist das, was das Gate 1e liest.
 */
export function parseExtfBatch(bytes: Uint8Array): ExtfBatch {
  const lines = decode(bytes);
  if (lines.length < 3) {
    throw new ExtfBatchFormatError(
      "EXTF-Buchungsstapel: weniger als drei Zeilen — File-Header, Spalten-Header oder Sätze fehlen.",
    );
  }
  const headerCells = tokenizeRow(lines[0]!).map(stripQuotes);
  if (headerCells[0] !== "EXTF") {
    throw new ExtfBatchFormatError(
      `EXTF-Buchungsstapel: Datei beginnt nicht mit dem EXTF-Marker (gefunden: „${headerCells[0] ?? ""}").`,
    );
  }
  const category = Number.parseInt(headerCells[2] ?? "", 10);
  if (category !== EXTF_CATEGORY_BUCHUNGSSTAPEL) {
    throw new ExtfBatchFormatError(
      `EXTF-Datei ist Datenkategorie ${category || "?"} („${headerCells[3] ?? ""}"), erwartet ` +
        `${EXTF_CATEGORY_BUCHUNGSSTAPEL} (Buchungsstapel). Stammdaten-Exporte importiert dieser Weg nicht.`,
    );
  }

  const header = parseHeader(headerCells);
  const columnNames = tokenizeRow(lines[1]!).map(stripQuotes);
  const col = mapColumns(columnNames);

  const rows: ExtfBatchRow[] = [];
  const rejections: BatchRejection[] = [];

  for (let i = 2; i < lines.length; i += 1) {
    const rowNo = i + 1;
    const raw = lines[i]!;
    if (raw.trim().length === 0) continue;
    const cells = tokenizeRow(raw).map(stripQuotes);
    const at = (key: ColumnKey): string => {
      const idx = col[key];
      return idx === undefined ? "" : (cells[idx] ?? "").trim();
    };
    const reject = (detail: string, extra: Partial<BatchRejection> = {}) =>
      rejections.push({ rowNo, reason: "unparsable_row", detail, ...extra });

    const amount = parseGermanAmount(at("amount"));
    if (!amount) {
      // Betrag 0 oder leer ist keine Buchung — das ist eine Leerzeile mit
      // Formatierung, kein Fehler des Mandanten. Trotzdem protokollieren,
      // damit die Zahl „geliefert vs. importiert" aufgeht.
      reject(`Betrag „${at("amount")}" ist leer, null oder keine Zahl.`);
      continue;
    }
    const account = at("account");
    const contraAccount = at("contraAccount");
    if (!account || !contraAccount) {
      reject(`Konto („${account}") oder Gegenkonto („${contraAccount}") fehlt.`, { amount });
      continue;
    }
    const sign = at("debitCredit").toUpperCase();
    if (sign !== "S" && sign !== "H") {
      reject(`Soll/Haben-Kennzeichen „${sign}" ist weder S noch H.`, { amount });
      continue;
    }
    const bookingDate = parseBelegdatum(at("bookingDate"), header.fiscalYearStart);
    if (!bookingDate) {
      reject(
        `Belegdatum „${at("bookingDate")}" nicht lesbar` +
          (header.fiscalYearStart ? "." : " (und der File-Header nennt keinen WJ-Beginn für TTMM)."),
        { amount },
      );
      continue;
    }

    // DATEV-Semantik: das Kennzeichen bezieht sich auf `Konto`.
    const [debitAccount, creditAccount] =
      sign === "S" ? [account, contraAccount] : [contraAccount, account];

    rows.push({
      rowNo,
      debitAccount,
      creditAccount,
      amount,
      currency: (at("currency") || "EUR").toUpperCase(),
      bookingDate,
      taxKey: at("taxKey") || null,
      taxKeySide: sign === "S" ? "credit" : "debit",
      documentNumber: at("documentNumber") || extractDocumentNumberFallback(cells, columnNames),
      documentNumber2: at("documentNumber2") || null,
      text: at("text") || null,
      kost1: at("kost1") || null,
      kost2: at("kost2") || null,
      documentLink: at("documentLink") || null,
      counterpartyName: extractCounterparty(cells, columnNames),
    });
  }

  return { header, rows, rejections };
}
