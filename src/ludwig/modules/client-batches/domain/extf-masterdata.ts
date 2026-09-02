/**
 * EXTF-Stammdaten (Datenkategorie 16, „Debitoren/Kreditoren") → Personenkonten-
 * Verzeichnis (F72-T72.1).
 *
 * Pure Funktionen, kein IO, nie ein LLM.
 *
 * ## Wozu
 *
 * Der Buchungsstapel des Mandanten trägt **keine Namen**: die Beleginfo-Slots
 * sind in der realen Lieferung durchweg leer. Ohne diese Datei hieße jedes neu
 * angelegte Personenkonto `Debitor 16096` — und die Konflikt-Prüfung aus F69
 * liefe nie an, weil es keinen Namen zu vergleichen gibt.
 *
 * ## Was NICHT gelesen wird
 *
 * Die Datei führt Adresse, Telefon, E-Mail, bis zu drei Bankverbindungen mit
 * IBAN. Nichts davon wird gebraucht, und es sind die Kundendaten eines fremden
 * Unternehmens — der Parser liest **Nummer, Name, Adressattyp**, sonst nichts.
 * Was nicht gelesen wird, kann auch nicht versehentlich gespeichert werden.
 */

import { stripQuotes, tokenizeRow } from "@/ludwig/shared/csv";

/** Datenkategorie im EXTF-File-Header. */
const EXTF_CATEGORY_MASTERDATA = 16;

/**
 * Wo der Name steht, hängt am Adressattyp — die Datei führt drei Spalten und
 * füllt je Zeile genau eine.
 */
const COLUMN = {
  account: "Konto",
  companyName: "Name (Adressattyp Unternehmen)",
  personLastName: "Name (Adressattyp natürl. Person)",
  personFirstName: "Vorname (Adressattyp natürl. Person)",
  unspecifiedName: "Name (Adressattyp keine Angabe)",
  addresseeType: "Adressattyp",
} as const;

export interface MasterdataAccount {
  /** Zeilennummer in der Datei (1-basiert) — Anker der Ablehnung. */
  rowNo: number;
  accountNumber: string;
  /** Ein Name, aus der zum Adressattyp passenden Spalte. */
  name: string;
  /** `creditor` | `debtor`, aus dem Nummernkreis. */
  accountingRole: "creditor" | "debtor";
}

export interface MasterdataFile {
  accounts: MasterdataAccount[];
  /** Zeilen ohne Nummer, ohne Namen oder mit unbestimmbarer Rolle. */
  skipped: Array<{ rowNo: number; accountNumber: string; reason: string }>;
}

export class ExtfMasterdataFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExtfMasterdataFormatError";
  }
}

/** Ist das eine EXTF-Stammdaten-Datei? Weiche im Ingest, nur der Header. */
export function isExtfMasterdata(bytes: Uint8Array): boolean {
  if (bytes.length === 0) return false;
  const head = new TextDecoder("windows-1252").decode(bytes.subarray(0, 2048));
  const firstLine = head.split(/\r?\n/)[0];
  if (!firstLine) return false;
  const cells = tokenizeRow(firstLine).map(stripQuotes);
  return cells[0] === "EXTF" && Number.parseInt(cells[2] ?? "", 10) === EXTF_CATEGORY_MASTERDATA;
}

/**
 * Personenkonto-Rolle aus dem Nummernkreis.
 *
 * DATEV vergibt Debitoren und Kreditoren in getrennten Bereichen: bei
 * Sachkontenlänge 4 laufen Debitoren von 10000 bis 69999, Kreditoren ab 70000.
 * Allgemein entscheidet die **erste Ziffer**: unter 7 Debitor, ab 7 Kreditor.
 *
 * Bewusst nicht der Dateiname („EXTF_Debitorenstammdaten…"): den vergibt die
 * Software des Mandanten und er lässt sich umbenennen. Die Nummer ist die
 * Tatsache.
 *
 * `null` heißt „nicht bestimmbar" — die Zeile wird übersprungen, nicht geraten.
 */
export function roleFromNumberRange(
  accountNumber: string,
  accountNumberLength: number,
): "creditor" | "debtor" | null {
  const n = accountNumber.trim();
  if (n.length !== accountNumberLength + 1 || !/^\d+$/.test(n)) return null;
  const lead = Number.parseInt(n[0]!, 10);
  return lead >= 7 ? "creditor" : "debtor";
}

/** Der Name aus der zum Adressattyp passenden Spalte; leer heißt „kein Name". */
function buildName(cells: Record<string, string>): string {
  const company = (cells[COLUMN.companyName] ?? "").trim();
  if (company) return company;
  const last = (cells[COLUMN.personLastName] ?? "").trim();
  const first = (cells[COLUMN.personFirstName] ?? "").trim();
  // „Nachname, Vorname" (Owner-Entscheid 2026-08-12): DATEV-Konvention für
  // Personenkonten. Die andere Reihenfolge würde beim ersten Abgleich für jedes
  // Konto einen Namenskonflikt melden — `accountNameKey` ist
  // schreibweise-tolerant, aber nicht reihenfolgetolerant.
  if (last) return first ? `${last}, ${first}` : last;
  return (cells[COLUMN.unspecifiedName] ?? "").trim();
}

/**
 * Datei → Verzeichnis-Einträge. Wirft nur, wenn die **Datei** unbrauchbar ist;
 * eine einzelne unvollständige Zeile wird übersprungen und protokolliert.
 */
export function parseExtfMasterdata(
  bytes: Uint8Array,
  accountNumberLength: number,
): MasterdataFile {
  const lines = new TextDecoder("windows-1252")
    .decode(bytes)
    .split(/\r?\n/)
    .filter((l) => l.length > 0);
  if (lines.length < 3) {
    throw new ExtfMasterdataFormatError(
      "EXTF-Stammdaten: weniger als drei Zeilen — File-Header, Spalten-Header oder Sätze fehlen.",
    );
  }
  const header = tokenizeRow(lines[0]!).map(stripQuotes);
  if (header[0] !== "EXTF") {
    throw new ExtfMasterdataFormatError(
      `EXTF-Stammdaten: Datei beginnt nicht mit dem EXTF-Marker (gefunden: „${header[0] ?? ""}").`,
    );
  }
  const category = Number.parseInt(header[2] ?? "", 10);
  if (category !== EXTF_CATEGORY_MASTERDATA) {
    throw new ExtfMasterdataFormatError(
      `EXTF-Datei ist Datenkategorie ${category || "?"} („${header[3] ?? ""}"), erwartet ` +
        `${EXTF_CATEGORY_MASTERDATA} (Debitoren/Kreditoren).`,
    );
  }

  const columns = tokenizeRow(lines[1]!).map(stripQuotes);
  const accountIdx = columns.indexOf(COLUMN.account);
  if (accountIdx === -1) {
    throw new ExtfMasterdataFormatError(
      `EXTF-Stammdaten: Pflichtspalte „${COLUMN.account}" fehlt. Gefunden: ${columns.slice(0, 8).join(", ")}…`,
    );
  }

  const accounts: MasterdataAccount[] = [];
  const skipped: MasterdataFile["skipped"] = [];
  const seen = new Set<string>();

  for (let i = 2; i < lines.length; i += 1) {
    const rowNo = i + 1;
    const raw = lines[i]!;
    if (raw.trim().length === 0) continue;
    const cells = tokenizeRow(raw).map(stripQuotes);
    const byName: Record<string, string> = {};
    for (let c = 0; c < columns.length; c += 1) {
      const key = columns[c];
      if (key) byName[key] = cells[c] ?? "";
    }
    const accountNumber = (byName[COLUMN.account] ?? "").trim();
    if (!accountNumber) continue; // Leerzeile des Export-Programms, kein Fehler

    const name = buildName(byName);
    if (!name) {
      skipped.push({ rowNo, accountNumber, reason: "Kein Name in der Zeile — nichts zu übernehmen." });
      continue;
    }
    const accountingRole = roleFromNumberRange(accountNumber, accountNumberLength);
    if (!accountingRole) {
      skipped.push({
        rowNo,
        accountNumber,
        reason:
          `Kontonummer passt nicht zum Personenkonto-Format des Wirtschaftsjahres ` +
          `(${accountNumberLength + 1} Ziffern erwartet) — Rolle nicht bestimmbar.`,
      });
      continue;
    }
    // Dieselbe Nummer zweimal in einer Datei: der erste Eintrag gewinnt, der
    // zweite wird gemeldet. Stilles Überschreiben wäre hier die schlechteste
    // Variante — man sähe nicht, dass die Quelle sich widerspricht.
    if (seen.has(accountNumber)) {
      skipped.push({
        rowNo,
        accountNumber,
        reason: "Kontonummer kommt in dieser Datei mehrfach vor — der erste Eintrag gilt.",
      });
      continue;
    }
    seen.add(accountNumber);
    accounts.push({ rowNo, accountNumber, name, accountingRole });
  }

  return { accounts, skipped };
}
