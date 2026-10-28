import { validateIban } from "@/ludwig/shared/iban";

/**
 * F358 — die Bank hinter einer IBAN. Rein, ohne IO: Land und Prüfsumme für
 * jede IBAN, die Bankleitzahl nur für deutsche (`DE` + BLZ an Stelle 5–12).
 * Bankname, BIC und Ort kommen aus `lookupBankByBlz` (Bundesbank-Datei);
 * eine ausländische IBAN hat keine Bank — wir führen keine BIC-Datenbank
 * fürs Ausland.
 */

export interface BankCode {
  blz: string;
  bankName: string;
  shortName: string | null;
  bic: string | null;
  city: string | null;
}

export interface IbanBank {
  valid: boolean;
  /** ISO-Land aus den ersten zwei Zeichen; null, wenn die IBAN nicht einmal das trägt. */
  country: string | null;
  blz?: string;
  bankName?: string;
  shortName?: string | null;
  bic?: string | null;
  city?: string | null;
}

export function resolveBankFromIban(iban: string): IbanBank {
  const stripped = iban.replace(/\s+/g, "").toUpperCase();
  const country = /^[A-Z]{2}/.test(stripped) ? stripped.slice(0, 2) : null;
  const valid = validateIban(stripped).ok;
  if (country !== "DE" || !/^DE\d{20}$/.test(stripped)) return { valid, country };
  return { valid, country, blz: stripped.slice(4, 12) };
}

/** Floskeln, die zwei Namen derselben Bank nicht unterscheiden. */
const FILLER = new Set(["eg", "ag", "gmbh", "bank", "sparkasse"]);

function words(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .split(" ")
    .filter((w) => w && !FILLER.has(w));
}

/**
 * Weicht der hinterlegte Bankname von der Bank laut IBAN ab? Erklärbar statt
 * ähnlich: gleich nach Normalisierung, oder ein gemeinsames Wort mit
 * mindestens vier Zeichen mit Bezeichnung oder Kurzbezeichnung der BLZ.
 * Keine Trigramm-Ähnlichkeit — `similarity()` hängt am search_path.
 */
export function bankNameDiffers(stored: string, bank: Pick<BankCode, "bankName" | "shortName">): boolean {
  const own = words(stored);
  const candidates = [bank.bankName, bank.shortName].filter((n): n is string => !!n).map(words);
  if (candidates.some((c) => c.join(" ") === own.join(" "))) return false;
  const known = new Set(candidates.flat().filter((w) => w.length >= 4));
  return !own.some((w) => w.length >= 4 && known.has(w));
}
