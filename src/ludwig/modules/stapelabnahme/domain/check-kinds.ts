/**
 * Der Katalog der quittierbaren Prüfpunkte (F118 B1).
 *
 * Fest wie die Status-Registry und **deckungsgleich mit dem CHECK der
 * Migration** `20260829190000_client_review_checks.sql`: eine neue Art braucht
 * beide Seiten, damit niemand still eine zweite Schreibweise einführt. Der
 * Deckungstest hält sie zusammen.
 */
export const CHECK_KINDS = [
  "statements_complete",
  "documents_handled",
  "bank_transactions_booked",
  "bank_transactions_proposed",
  "clearing_accounts_zero",
  "export_simulation",
  "cases_proposed",
  "entries_accepted",
  "questions_answered",
  "conventions_decided",
  "volume_comparison",
  "account_comparison",
  // F123: quittiert wird nicht mehr nur die Checklisten-Zeile, sondern der
  // einzelne Gegenstand — dieses Konto, diese Bankzeile, dieser Prüfpunkt.
  "bank_balance_link",
  "open_item_waiting",
  "duplicate_pair",
  "account_first_use",
  "account_missing",
  "account_deviation",
  "account_sign",
  "account_consistency",
  "vat_finding",
  "gate_override",
  "proposal_checkpoint",
  "volume_row",
  "docs_complete_in_period",
  "docs_complete_before_period",
] as const;

export type CheckKind = (typeof CHECK_KINDS)[number];

export function isCheckKind(value: string): value is CheckKind {
  return (CHECK_KINDS as readonly string[]).includes(value);
}
