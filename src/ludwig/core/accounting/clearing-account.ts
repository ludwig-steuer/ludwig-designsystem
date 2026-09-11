/**
 * Verrechnungskonto-Kategorie (F103) — das Vokabular, das `is_clearing_account`
 * ersetzt.
 *
 * Ein **Verrechnungskonto** ist ein Sachkonto, das nicht Aufwand, Erlös, Anlage
 * oder Zahlungsmittel ist, sondern eine Bewegung *zwischenparkt*, bis eine
 * Gegenbewegung sie auflöst. Kennzeichen: wiederkehrender Ausgleich, Zielsaldo
 * null. Ein Boolean trug das nicht: „Karte", „Lohnverbindlichkeit" und
 * „durchlaufender Posten" verlangen unterschiedliche Folgehandlungen.
 *
 * Zwei Achsen hängen an der Kategorie, beide hier abgeleitet statt je Konto
 * gepflegt:
 *
 *  - **Zielsaldo null** ({@link hasTargetBalanceZero}) — steuert die
 *    Verprobung im Buchungslauf (Gate 4d). `shareholder` und
 *    `payroll_liability` tragen zwischen Entstehung und Zahltag zu Recht einen
 *    Saldo und bleiben draußen; sonst meldete jeder Monatswechsel Fehlalarm.
 *  - **Zahlungsfähig** ({@link isPayableClearingType}) — darf ein
 *    `client_payment_accounts`-Eintrag entstehen? Die Kategorie schlägt die
 *    DATEV-Kontenfunktion in BEIDE Richtungen: `1360 Geldtransit` wird trotz
 *    Kontenfunktion 10 kein Zahlungskonto (niemand zahlt „per Geldtransit"),
 *    `1617 Corporate Card` wird trotz Kontenfunktion 13 eines.
 *
 * `central_settlement` (F206, Zentralregulierer wie DZB/ZEG) liegt auf beiden
 * Achsen wie `money_transit`: Zielsaldo null — je Abrechnung —, aber kein
 * Zahlungskonto, die Sammellastschrift läuft über die Bank.
 *
 * Werte englisch (Schema-Regel), Labels deutsch (UI + GLOSSARY).
 */

import { z } from "zod";

export const CLEARING_ACCOUNT_TYPES = [
  "credit_card",
  "employee_expense",
  "shareholder",
  "payroll",
  "payroll_liability",
  "payment_gateway",
  "suspense",
  "money_transit",
  "central_settlement",
] as const;
export type ClearingAccountType = (typeof CLEARING_ACCOUNT_TYPES)[number];

/**
 * Einzige TS-Quelle für den Wertebereich — spiegelt den DB-CHECK
 * `client_ledger_accounts_clearing_account_type_check`. Tools und Actions
 * bauen kein lokales `z.enum` nach.
 */
export const ClearingAccountTypeSchema = z.enum(CLEARING_ACCOUNT_TYPES);

export const CLEARING_ACCOUNT_TYPE_LABEL: Record<ClearingAccountType, string> = {
  credit_card: "Kreditkarte",
  employee_expense: "Spesen / Mitarbeiterauslagen",
  shareholder: "Gesellschafter",
  payroll: "Lohnverrechnung",
  payroll_liability: "Lohnverbindlichkeiten",
  payment_gateway: "Zahlungsdienstleister",
  suspense: "Klärung / durchlaufende Posten",
  money_transit: "Geldtransit",
  central_settlement: "Zentralregulierung",
};

/**
 * Kategorien, deren Konto am Ende ausgeglichen sein MUSS — entweder dauerhaft
 * (`payroll`, `suspense`, `money_transit`) oder je Abrechnung (`credit_card`,
 * `employee_expense`, `payment_gateway`, `central_settlement`). Nur sie gehen in
 * die Verprobung.
 */
const TARGET_BALANCE_ZERO: ReadonlySet<ClearingAccountType> = new Set([
  "credit_card",
  "employee_expense",
  "payment_gateway",
  "payroll",
  "suspense",
  "money_transit",
  // je Abrechnung, wie credit_card (F206)
  "central_settlement",
]);

/**
 * Kategorien, mit denen tatsächlich bezahlt wird: es gibt einen Auszug, und
 * eine eingehende Abrechnung muss ihr Konto treffen (F102 macht sie buchbar).
 * Der Rest hat keinen Zahlungsvorgang „von diesem Konto".
 */
const PAYABLE: ReadonlySet<ClearingAccountType> = new Set([
  "credit_card",
  "employee_expense",
  "payment_gateway",
]);

export function hasTargetBalanceZero(type: ClearingAccountType): boolean {
  return TARGET_BALANCE_ZERO.has(type);
}

export function isPayableClearingType(type: ClearingAccountType): boolean {
  return PAYABLE.has(type);
}

/** Für SQL-`in`-Listen: die Kategorien mit Zielsaldo null. */
export const TARGET_BALANCE_ZERO_TYPES: readonly ClearingAccountType[] =
  CLEARING_ACCOUNT_TYPES.filter(hasTargetBalanceZero);

/** Für SQL-`in`-Listen: die zahlungsfähigen Kategorien. */
export const PAYABLE_CLEARING_TYPES: readonly ClearingAccountType[] =
  CLEARING_ACCOUNT_TYPES.filter(isPayableClearingType);

/** Label eines (evtl. unbekannten) DB-Werts. NULL = kein Verrechnungskonto. */
export function clearingAccountTypeLabel(value: string | null | undefined): string {
  if (!value) return "kein Verrechnungskonto";
  return CLEARING_ACCOUNT_TYPE_LABEL[value as ClearingAccountType] ?? value;
}

/** Typwächter für Werte, die aus DB, Formular oder Agent kommen. */
export function isClearingAccountType(value: unknown): value is ClearingAccountType {
  return typeof value === "string" && (CLEARING_ACCOUNT_TYPES as readonly string[]).includes(value);
}
