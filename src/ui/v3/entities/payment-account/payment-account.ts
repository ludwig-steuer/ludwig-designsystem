import type { PaymentAccountKind } from "@/ludwig/core/accounting/payment-account-kind";
import type { PaymentAccountFacts } from "@/ludwig/modules/bank-transactions/domain/payment-account-options";
import type { Currency } from "@/ludwig/shared/money";

/**
 * A payment account as a row needs it (0180) — the mirrored facts plus what
 * only the app's query carries today (**L-314**: `PaymentAccountWithStats`
 * lives in the infrastructure, not in `domain/`).
 *
 * All of it optional on purpose: the row shows what it is given and claims
 * nothing where the caller is silent. The day the stats are lifted into the
 * domain, the intersection here falls away.
 */
export type PaymentAccountRowData = PaymentAccountFacts & {
  /** The kind — the word comes from `PAYMENT_ACCOUNT_KIND_LABEL`. */
  kind?: PaymentAccountKind | null;
  ledgerAccountNumber?: string | null;
  ledgerAccountName?: string | null;
  /** The card identifier where there is no IBAN (`external_account_id`). */
  externalAccountId?: string | null;
  inflow?: number | null;
  outflow?: number | null;
  net?: number | null;
  firstMovement?: string | null;
  lastMovement?: string | null;
  /** A human set the statement expectation by hand. */
  expectsStatementsManual?: boolean | null;
  integrationStatus?: string | null;
  /** Set = the payment channel is switched off (`valid_until`). */
  validUntil?: string | null;
  /** Bank lines of this account that carry no case yet — 0 is the goal. */
  unassignedCount?: number | null;
  currency?: Currency;
};

/**
 * Which value of the axis `statement_expectation` the account carries.
 *
 * Derived from two columns, as the axis says: whether statements are expected,
 * and whether a human decided it. The rule stands here so that both lists read
 * it the same way — the account itself carries no such value (the axis is
 * computed, `status-registry.ts`).
 *
 * @when    Showing the statement expectation of an account.
 * @instead The word of a kind → PAYMENT_ACCOUNT_KIND_LABEL.
 */
export function statementExpectationOf(account: PaymentAccountRowData): string {
  const byHand = account.expectsStatementsManual === true;
  if (account.expectsStatements) return byHand ? "erwartet_hand" : "erwartet";
  return byHand ? "keine_hand" : "keine";
}
