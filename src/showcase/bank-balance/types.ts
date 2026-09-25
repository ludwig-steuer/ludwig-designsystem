/**
 * The view model of F298 §7, story-local until the app ships it (0202). The
 * design system compiles against the live app, so a type the app does not
 * have yet cannot come from `@/ludwig/*`. Delete this file once it does.
 *
 * Deviations from the brief, named in 0202: `headline` per switch position
 * (A2); `explanation[].amount` is the contribution to the released
 * difference, `null` outside the calculation (A3); the `remainder` entry
 * carries the sentence of the remainder line and is not summed (A4).
 */

export type BalanceSourceKind = "ledger" | "statement_rows" | "statement_balance" | "manual";
export type ManualBalanceSource = "paper_statement" | "online_banking" | "bank_confirmation" | "other";
export type ReconciliationVerdict =
  | "fits"
  | "fits_with_proposals"
  | "explained"
  | "differs"
  | "not_checkable"
  | "optional";
export type FindingLevel = "error" | "warning" | "notice";

export interface SourcedAmount {
  amount: number;
  /** ISO day the balance holds for. */
  asOf: string;
  sourceLabel: string;
  sourceDetail: string | null;
  href: string | null;
}

/** One share of a ledger balance — DATEV, a batch DATEV does not have yet, a client batch. */
export interface LedgerPart {
  label: string;
  amount: number;
  detail: string | null;
}

export interface LedgerTriple {
  old: SourcedAmount;
  /** What the old balance is made of, when more than DATEV stands in it (0202, owner 2026-09-25). */
  oldParts?: LedgerPart[];
  movement: number;
  movementCount: number;
  new: SourcedAmount;
}

export type ManualAmount = SourcedAmount & {
  source: ManualBalanceSource;
  by: string;
  at: string;
  note: string | null;
};

export interface ExplanationLine {
  key: string;
  level: FindingLevel | "done";
  /** Contribution to the released difference „new"; `null` = outside the calculation. */
  amount: number | null;
  count: number | null;
  text: string;
  action: { label: string; href: string } | null;
}

export interface BankBalanceComparison {
  paymentAccountId: string;
  label: string;
  kind: "bank" | "cash" | "paypal" | "credit_card" | "money_transit";
  period: { from: string; to: string };
  coverage: {
    transactionCount: number;
    booked: number;
    proposedOnly: number;
    noProposal: number;
    noCase: number;
    waived: number;
    bookingsWithoutTransactionCount: number;
  };
  ledger: { released: LedgerTriple; withProposals: LedgerTriple };
  proposalsOutsidePeriod: Array<{
    bookingDate: string;
    amount: number;
    counterparty: string | null;
    caseNumber: string | null;
    alreadyInDatev: boolean;
  }>;
  statement: {
    movement: { amount: number; count: number } | null;
    old: SourcedAmount | null;
    new: SourcedAmount | null;
    coveredFrom: string | null;
    coveredTo: string | null;
  };
  manual: { old: ManualAmount | null; new: ManualAmount | null };
  verdict: { released: ReconciliationVerdict; withProposals: ReconciliationVerdict };
  explanation: ExplanationLine[];
  remainder: number | null;
  headline: { released: string; withProposals: string };
}

/** One account of the collapsed row of dormant accounts (R15d, 0202 A6). */
export interface DormantAccount {
  paymentAccountId: string;
  label: string;
  lastTransactionDate: string | null;
  /** Had transactions in the previous period and none in this one. */
  wentQuiet: boolean;
}
