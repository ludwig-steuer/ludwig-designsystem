import type { PaymentAccountKind } from "@/ludwig/core/accounting/payment-account-kind";
import type { StatementExpectationLevel } from "@/ludwig/core/accounting/statement-expectation";
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
  /** The level in force (`statement_expectation`, F235). */
  statementExpectation?: StatementExpectationLevel | null;
  /** The level a human set (`statement_expectation_manual`); `null` = derived. */
  statementExpectationManual?: StatementExpectationLevel | null;
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
 * The level in force when the caller has it; otherwise the human's decision;
 * otherwise `expectsStatements`. The last step is exact, not a guess: the
 * app's derivation only ever sets `required` or `none` (`expected` is set by a
 * human, registry), and `expects_statements` mirrors „not none" (F235). Where a
 * human set the level is an addition, not part of the value (0180 addendum).
 *
 * @when    Showing the statement expectation of an account.
 * @instead The word of a kind → PAYMENT_ACCOUNT_KIND_LABEL.
 */
export function statementExpectationOf(account: PaymentAccountRowData): StatementExpectationLevel {
  return (
    account.statementExpectation ??
    account.statementExpectationManual ??
    (account.expectsStatements ? "required" : "none")
  );
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
  /** `null` = leave it derived; otherwise the level a human sets (F235). */
  statementExpectationManual: StatementExpectationLevel | null;
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
    statementExpectationManual: null,
    autoAssignPaymentMethod: null,
    validUntil: null,
  };
}
