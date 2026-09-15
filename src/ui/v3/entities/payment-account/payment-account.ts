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

/**
 * What a person may set on a payment account (0183).
 *
 * **Local, and that is a finding** (L-337): the mirror carries no draft for
 * this entity — the recurring rule brings its `RuleDraft` along, this one has
 * none. The field names follow the columns, so the swap stays a swap.
 */
export interface PaymentAccountDraft {
  displayName: string;
  kind: PaymentAccountKind;
  iban: string | null;
  bic: string | null;
  bankName: string | null;
  /** Card identifier where there is no IBAN (`external_account_id`). */
  externalAccountId: string | null;
  ledgerAccountNumber: string | null;
  /** `null` = leave it derived; `true`/`false` = a human decided. */
  expectsStatements: boolean | null;
  autoAssignPaymentMethod: string | null;
  /** Set = switched off from that day (`valid_until`). */
  validUntil: string | null;
}

/**
 * An empty draft — a new account starts as a bank account, the common case in
 * onboarding.
 *
 * @when    Opening PaymentAccountEditor without a `defaultValue`.
 * @instead Changing an existing account → hand its draft in.
 */
export function emptyPaymentAccountDraft(): PaymentAccountDraft {
  return {
    displayName: "",
    kind: "bank",
    iban: null,
    bic: null,
    bankName: null,
    externalAccountId: null,
    ledgerAccountNumber: null,
    expectsStatements: null,
    autoAssignPaymentMethod: null,
    validUntil: null,
  };
}
