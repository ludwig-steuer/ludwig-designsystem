import Decimal from "decimal.js";

export const CURRENCIES = ["EUR", "USD", "CHF", "GBP"] as const;
export type Currency = (typeof CURRENCIES)[number];

/**
 * Roher DB-Wert → `Currency`, mit EUR als Rückfall.
 *
 * Die Spalte ist `text` ohne CHECK; ein unbekannter Code darf die Anzeige
 * nicht zerlegen. EUR ist die richtige Annahme — jeder Mandant bucht in Euro,
 * Fremdwährung ist die Ausnahme und steht zusätzlich am Beleg.
 */
export function asCurrency(value: string | null | undefined): Currency {
  return (CURRENCIES as readonly string[]).includes(value ?? "") ? (value as Currency) : "EUR";
}

export interface Money {
  amount: Decimal;
  currency: Currency;
}

export function money(amount: Decimal | string | number, currency: Currency): Money {
  const value = amount instanceof Decimal ? amount : new Decimal(typeof amount === "number" ? String(amount) : amount);
  return { amount: value, currency };
}

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot add money in different currencies: ${a.currency} vs ${b.currency}`);
  }
  return { amount: a.amount.plus(b.amount), currency: a.currency };
}

export function formatMoney(m: Money, locale = "de-DE"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: m.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(m.amount.toNumber());
}

/**
 * Deutsche Geldeingabe → Zahl.
 *
 * Nimmt die drei Schreibweisen, die in der Praxis vorkommen: „1.234,56"
 * (deutsch), „1234.56" (aus Tabellen und Schnittstellen) und „1 234,56"
 * (mit schmalem oder normalem Leerzeichen). Währungszeichen und
 * Buchstaben werden verworfen.
 *
 * Die Regel für den Dezimaltrenner: **das letzte Vorkommen von Komma oder
 * Punkt ist einer, wenn danach genau ein oder zwei Ziffern stehen** — sonst
 * ist es ein Tausendertrenner. Damit wird „1.234" zu 1234 und nicht zu 1,234,
 * und „1234.56" zu 1234,56 statt zu 123456.
 *
 * Genau daran scheiterte `parseEuro` in `ui/booking/format.ts`: es entfernte
 * **alle** Punkte und machte aus „1234.56" die Zahl 123456 — ein Faktor 100
 * bei jedem Betrag, der aus einer Tabelle kam (L-01).
 *
 * `null` heißt „keine Zahl erkennbar" und nicht 0. Wer 0 als Rückfall will,
 * schreibt `?? 0` — aber ein leeres Feld ist kein Nullbetrag, und ein
 * Tippfehler erst recht nicht.
 */
export function parseGermanAmount(input: string | number | null | undefined): number | null {
  if (input == null) return null;
  if (typeof input === "number") return Number.isFinite(input) ? input : null;

  const raw = input.replace(/[^0-9.,\-]/g, "").trim();
  if (raw === "" || raw === "-") return null;

  const lastComma = raw.lastIndexOf(",");
  const lastDot = raw.lastIndexOf(".");
  const sep = Math.max(lastComma, lastDot);

  let normalized: string;
  if (sep === -1) {
    normalized = raw;
  } else {
    const decimals = raw.length - sep - 1;
    if (decimals >= 1 && decimals <= 2) {
      // Der letzte Trenner trennt die Nachkommastellen ab.
      normalized = raw.slice(0, sep).replace(/[.,]/g, "") + "." + raw.slice(sep + 1);
    } else {
      // Kein Dezimaltrenner — alles sind Tausendertrenner.
      normalized = raw.replace(/[.,]/g, "");
    }
  }

  const n = Number.parseFloat(normalized);
  return Number.isFinite(n) ? n : null;
}
