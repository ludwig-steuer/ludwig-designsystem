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
