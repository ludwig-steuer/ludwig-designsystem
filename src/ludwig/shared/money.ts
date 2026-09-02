import Decimal from "decimal.js";

export type Currency = "EUR" | "USD" | "CHF" | "GBP";

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
