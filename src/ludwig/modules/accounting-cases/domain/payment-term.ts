/**
 * Zahlungsziel aus dem `payment_term`-Freitext einer Rechnung — Stufe 2 der
 * Frist-Leiter einer Erwartung (siehe `expectation-core.ts`).
 *
 * Gemessen an 139 befüllten `payment_term`-Werten auf Staging (2026-08-27)
 * trifft dieser Parser 52 davon; der Rest sind Rhythmus-Angaben („monatlich
 * zum dritten Werktag"), Zahlungsarten („Credit Card") oder Verweise auf
 * fremde Regelwerke („gemäß der StBVV"). Für die fällt die Leiter auf das
 * Mandanten-Zahlungsziel zurück — bewusst, statt aus einem Rhythmus eine
 * Frist zu erfinden.
 *
 * Pure: kein IO, keine DB. Das Heute-Datum kommt als Parameter herein, damit
 * der Test nicht an der Uhr hängt.
 */

/** Was der Freitext hergab — `days` und `date` schließen sich aus. */
export interface PaymentTermResult {
  /** Zahlungsziel in Tagen ab Rechnungsdatum. */
  days?: number;
  /** Im Text genanntes konkretes Fälligkeitsdatum (ISO `yyyy-mm-dd`). */
  date?: string;
}

/**
 * „Zahlbar sofort", „fällig mit Rechnungsstellung", „rein netto" ohne Frist.
 * Bewusst VOR der Tages-Erkennung geprüft: „Zahlbar sofort siehe Belegdatum"
 * enthält keine Zahl, „zahlbar sofort, rein netto" auch nicht — aber
 * „Zahlungsfrist bis zum 5.07.26" enthält Zahlen, die keine Tage sind.
 */
const IMMEDIATE = /\b(sofort|mit rechnungsstellung|f(ä|ae)llig mit zugang)\b/i;

/** „bis zum 5.07.26", „bis zum 10.07.2026" — Tag.Monat.Jahr, ein- oder zweistellig. */
const EXPLICIT_DATE = /bis\s+zum\s+(\d{1,2})\s*\.\s*(\d{1,2})\s*\.\s*(\d{2,4})/i;

/**
 * „10 Tage", „30 Tage netto", „3 Tag(e) rein netto", „Zahlungsziel 10 Tage".
 * Global, weil Skonto-Klauseln zwei Fristen nennen („10 Tage 2 % Skonto oder
 * 120 Tage netto") — von denen die LÄNGERE das Zahlungsziel ist. Die kürzere
 * ist die Skontofrist und gehört nicht hierher (das ist W3d).
 */
const DAYS = /(\d{1,3})\s*tag/gi;

/** Zweistelliges Jahr auf 2000er auflösen — Rechnungen aus dem letzten Jahrhundert gibt es nicht. */
function fullYear(raw: string): number {
  const n = Number(raw);
  return raw.length <= 2 ? 2000 + n : n;
}

export function parsePaymentTerm(paymentTerm: string | null | undefined): PaymentTermResult | null {
  const text = paymentTerm?.trim();
  if (!text) return null;

  const explicit = EXPLICIT_DATE.exec(text);
  if (explicit) {
    const [, d, m, y] = explicit;
    const year = fullYear(y!);
    const month = Number(m);
    const day = Number(d);
    // Ein unmögliches Datum ist ein Lesefehler, kein Zahlungsziel — dann
    // greift die nächste Stufe der Leiter, statt eine Frist zu erfinden.
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return Number.isNaN(Date.parse(iso)) ? null : { date: iso };
  }

  if (IMMEDIATE.test(text)) return { days: 0 };

  const found = [...text.matchAll(DAYS)].map((m) => Number(m[1]));
  if (found.length === 0) return null;
  // Die längste genannte Frist ist das Netto-Ziel; kürzere sind Skontostufen.
  const days = Math.max(...found);
  // Über einem Jahr ist es kein Zahlungsziel mehr, sondern ein Lesefehler.
  return days > 365 ? null : { days };
}

/**
 * Fälligkeitsdatum aus Rechnungsdatum + Freitext. `null`, wenn der Text
 * nichts hergibt — der Aufrufer geht dann eine Stufe weiter.
 */
export function dueDateFromPaymentTerm(
  invoiceDate: string | null | undefined,
  paymentTerm: string | null | undefined,
): string | null {
  const parsed = parsePaymentTerm(paymentTerm);
  if (!parsed) return null;
  if (parsed.date) return parsed.date;
  if (!invoiceDate) return null;
  return addDays(invoiceDate, parsed.days ?? 0);
}

/** ISO-Datum + n Tage, ohne Zeitzone (Datums-Arithmetik, keine Uhrzeit). */
export function addDays(isoDate: string, days: number): string {
  const base = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(base.getTime())) throw new Error(`Kein gültiges Datum: ${isoDate}`);
  base.setUTCDate(base.getUTCDate() + days);
  return base.toISOString().slice(0, 10);
}
