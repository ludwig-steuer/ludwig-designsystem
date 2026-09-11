/**
 * Art eines Zahlungskontos (`client_payment_accounts.kind`) — die eine
 * TS-Quelle für den Wertebereich, spiegelt den DB-CHECK
 * `client_payment_accounts_kind_check`.
 *
 * Vorher stand die Liste an fünf Stellen als Literal (Action-Schema,
 * Onboarding-Ableitung, Wizard-Formular, Edit-Seite, Beleggruppen-Kommentar);
 * `employee_clearing` (F102) hätte alle fünf einzeln erwischen müssen.
 *
 * Abgrenzung zur Verrechnungskonto-Kategorie ({@link ../accounting/clearing-account}):
 * die Kategorie sitzt am **Sachkonto** und sagt, WAS das Konto fachlich ist;
 * `kind` sitzt am **Zahlungskonto** und sagt, wie damit bezahlt wird. Der
 * `kind` wird beim Promoten aus der Kategorie abgeleitet
 * (`tag-payment-accounts-core.ts`), nicht zusätzlich gepflegt — sonst gäbe es
 * zwei Wahrheiten über dasselbe Konto.
 */

import { z } from "zod";

export const PAYMENT_ACCOUNT_KINDS = [
  "bank",
  "cash",
  "credit_card",
  "paypal",
  "employee_clearing",
  "other",
] as const;
export type PaymentAccountKind = (typeof PAYMENT_ACCOUNT_KINDS)[number];

export const PaymentAccountKindSchema = z.enum(PAYMENT_ACCOUNT_KINDS);

export const PAYMENT_ACCOUNT_KIND_LABEL: Record<PaymentAccountKind, string> = {
  bank: "Bank",
  cash: "Kasse",
  credit_card: "Kreditkarte",
  paypal: "PayPal / Zahlungsdienstleister",
  employee_clearing: "Mitarbeiter-Auslagen",
  other: "Sonstiges",
};

/** Typwächter für Werte aus DB, Formular oder Agent. */
export function isPaymentAccountKind(value: unknown): value is PaymentAccountKind {
  return typeof value === "string" && (PAYMENT_ACCOUNT_KINDS as readonly string[]).includes(value);
}
