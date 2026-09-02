/**
 * F83-T83.3 — Deterministische Zahlungsart eines Bank-Abgangs im
 * Lohn-Zahlungskreis. Pure, testbar, ohne DB: Empfängername + Verwendungszweck
 * rein, Zahlungsart raus.
 *
 * Warum überhaupt deterministisch: Lohn/SV/Lohnsteuer sind der statischste
 * Buchungskreis (fester Empfängerkreis, monatlicher Rhythmus, feste Konten) —
 * und trotzdem entschied bisher je Fall ein LLM, mit dem Ergebnis aus P1
 * (Aufwand statt Tilgung, ~14 Fälle im 61015-Replay).
 *
 * Kein Treffer heißt **null** = Residuum für den Agenten. Geraten wird nicht:
 * leerer oder untypischer Verwendungszweck bleibt beim normalen Weg.
 */

/** Zahlungsart im Lohn-Zahlungskreis; `null` = keine (normaler Weg). */
export type PayrollPaymentKind = "wage_net" | "social_insurance" | "wage_tax";

/** Kontenrolle im Referenz-Katalog (`reference_account_framework_entries.payroll_role`). */
export type PayrollAccountRole =
  | "wage_liability"
  | "wage_tax_liability"
  | "social_security_liability"
  | "payroll_clearing";

/** Zahlungsart → Kontenrolle, gegen die getilgt wird. */
export const PAYROLL_ROLE_BY_KIND: Record<PayrollPaymentKind, PayrollAccountRole> = {
  wage_net: "wage_liability",
  social_insurance: "social_security_liability",
  wage_tax: "wage_tax_liability",
};

/**
 * Finanzamt-Empfänger. Bewusst eine Konstante statt einer Tabelle: die Steuerart
 * entscheidet ohnehin der Verwendungszweck, und ein Finanzamt heißt in jedem
 * Auszug „Finanzamt" / „Finanzkasse".
 */
const TAX_OFFICE_PATTERNS = ["%finanzamt%", "%finanzkasse%", "fa %"] as const;

/** Lohnsteuer im Verwendungszweck — grenzt gegen USt-Vorauszahlungen ab (P1 [29]). */
const WAGE_TAX_PURPOSE = /(lohnsteuer|lohn-?\s?u\.?\s?kirchensteuer|lohn\/kirchensteuer|\blst\b)/i;

/** Umsatzsteuer im Verwendungszweck — gehört NICHT in dieses Ticket, also Residuum. */
const VAT_PURPOSE = /(umsatzsteuer|\bust\b|ust-?vz|voranmeldung)/i;

/**
 * Netto-Lohn/Gehalt im Verwendungszweck. Ohne Wortgrenze vorn, damit deutsche
 * Komposita greifen („Aushilfslohn", „Gehaltszahlung"); alles mit „steuer"
 * fällt vorher heraus, sonst würde „Lohnsteuer" hier landen.
 */
const WAGE_PURPOSE = /(gehalt|gehäl|lohn|löhn|entgeltabrechnung)/i;

/**
 * ILIKE-Muster → RegExp. `%` am Rand wird zur **Wortgrenze** (nicht zu `.*`):
 * „%aok%" soll „AOK Bayern" und „ÜBW AOK" treffen, aber kein Wort, in dem die
 * Buchstabenfolge zufällig steckt. Innere `%` bleiben `.*`, `_` wird `.`.
 */
export function ilikePatternToRegExp(pattern: string): RegExp {
  const startsWild = pattern.startsWith("%");
  const endsWild = pattern.endsWith("%");
  const core = pattern.slice(startsWild ? 1 : 0, endsWild ? pattern.length - 1 : undefined);
  const escaped = core
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/%/g, ".*")
    .replace(/_/g, ".");
  return new RegExp(`${startsWild ? "\\b" : "^"}${escaped}${endsWild ? "\\b" : "$"}`, "i");
}

function matchesAny(value: string, patterns: readonly string[]): boolean {
  return patterns.some((p) => ilikePatternToRegExp(p).test(value));
}

export interface PayrollClassificationInput {
  /** Empfängername des Abgangs (Bank-Gegenpartei). */
  counterpartyName: string | null | undefined;
  /** Verwendungszweck, roh wie in der DB (SEPA-Tag-Block ist unschädlich). */
  purpose: string | null | undefined;
  /** ILIKE-Muster aus `reference_social_insurance_carriers`. */
  carrierPatterns: readonly string[];
}

/**
 * Zahlungsart eines Bank-**Abgangs**. Reihenfolge ist bedeutungstragend:
 * der Träger-Treffer schlägt den Verwendungszweck (SV-Zahlungen tragen oft nur
 * „ÜBW BKK MTU"), die Steuerart entscheidet der Verwendungszweck.
 */
export function classifyPayrollPayment(input: PayrollClassificationInput): PayrollPaymentKind | null {
  const name = (input.counterpartyName ?? "").trim();
  const purpose = (input.purpose ?? "").trim();

  if (name && matchesAny(name, input.carrierPatterns)) return "social_insurance";
  if (name && matchesAny(name, TAX_OFFICE_PATTERNS)) {
    return WAGE_TAX_PURPOSE.test(purpose) && !VAT_PURPOSE.test(purpose) ? "wage_tax" : null;
  }
  if (!purpose) return null;
  if (/steuer/i.test(purpose)) return null;
  return WAGE_PURPOSE.test(purpose) ? "wage_net" : null;
}

/**
 * Belegfeld 1 des Lohn-Zahlungskreises: die Monatsnummer `YYYYMM` (erste
 * F78-Konvention). Monat aus dem Verwendungszweck („Gehalt 07.2026",
 * „LSt 06/2026"), sonst der Buchungsmonat.
 */
export function payrollPeriodBelegfeld(
  purpose: string | null | undefined,
  bookingDateIso: string,
): string {
  const m = /(?<!\d)(0[1-9]|1[0-2])\s*[./-]\s*(20\d{2}|\d{2})(?!\d)/.exec(purpose ?? "");
  if (m) {
    const year = m[2]!.length === 4 ? m[2]! : `20${m[2]!}`;
    return `${year}${m[1]}`;
  }
  return `${bookingDateIso.slice(0, 4)}${bookingDateIso.slice(5, 7)}`;
}
