import type { SepaTags } from "@/ludwig/modules/bank-transactions/domain/statement-line";
import type { Currency } from "@/ludwig/shared/money";
import type { CaseLink } from "../accounting-case/case-title";

/**
 * What a statement line looks like in the set — **once**, for all five forms
 * (0100–0103).
 *
 * The mirror carries the **import** side of this entity (`BankTransactionRow`
 * from the parsers) and, since `cc141f7b`, every derivation. What it does not
 * carry is the **display** side: `BankTransactionAssignmentRow` lives in the
 * app's `infrastructure/` and stays there, because it is shaped by the query
 * that builds it. That is the remaining half of finding L-56, and this file is
 * the answer to it: three nested cuts, not three copies.
 *
 * The nesting is the rank order of the profile, and it is not decoration —
 * a cell must be able to take a row, and a row a detail, without a mapping
 * step at the call site.
 */

/** XS — what a foreign view needs to **name** a payment (ranks 1–4, 11). */
export interface BankTransactionCellData {
  id: string;
  /** Rank 4. The **posting** date, never the value date (finding L-61). */
  postingDate: string;
  /**
   * Rank 2. **The sign is the direction**: positive = incoming, negative =
   * outgoing. There is no direction column, and there must not be one.
   *
   * A number, not the app's `string`: every form of the set hands amounts to
   * `Amount`, which formats numbers. Parsing once at the boundary is honest;
   * parsing in five components is a copy of the same decision.
   */
  amount: number;
  currency: Currency;
  /** Rank 3. Missing in 3 % of the lines — then the purpose is the identity. */
  counterpartyName: string | null;
  /** Rank 1 — the raw column value; `derivePurposeParts` cuts it up. */
  purpose: string | null;
  /** Rank 11 — parsed at import time; without it the derivation re-parses. */
  sepaTags?: SepaTags | null;
}

/**
 * S — the line of the statement (adds ranks 5–8).
 *
 * Everything here is **state**: how far the line has come. That is what
 * separates the row from the cell, and why a foreign view that only mentions
 * a payment must not show it.
 */
export interface BankTransactionRowData extends BankTransactionCellData {
  /**
   * Rank 5 and 13 — `client_bank_transactions.match_stage`, axis
   * `bank_match_stage` since `cc141f7b`. `null` means the cascade has not run,
   * which is not the same as „no match".
   */
  matchStage: string | null;
  /** Rank 6 — all assigned cases, in event order. 65 % of lines have none. */
  cases: CaseAssignment[];
  /** Σ |eventAmount| over all events — what is left over is `amount − this`. */
  allocatedSum: number;
  /** Rank 8 — open clarifications of the case, not of the line. */
  openClarificationsCount: number;
}

/**
 * L — everything that stands on a payment (adds ranks 9, 10, 12, 14–18).
 *
 * Only the drawer and the facts show this much; the row would drown in it.
 */
export interface BankTransactionDetailData extends BankTransactionRowData {
  /** Rank 9 — value date. Deviates from the posting date regularly (L-61). */
  valueDate: string | null;
  /** Rank 10 — the identity that holds when the name varies. */
  counterpartyIban: string | null;
  /** Rank 12. */
  counterpartyBic: string | null;
  /** Rank 14. */
  source: "csv" | "qonto" | "manual";
  /** Rank 15 — the import run: what it was called and when it ran. */
  importBatchLabel: string | null;
  importedAt: string;
  /**
   * Rank 16. Filled everywhere and today **identical** to `amount`; it earns
   * a row only when the two differ.
   */
  amountEur: number;
  /** Rank 17 — only Qonto lines have one (6 %). */
  externalId: string | null;
  /** Rank 18 — „for audit and debugging" per the column comment. */
  rawPayload: Record<string, unknown>;
}

/**
 * A case as a payment sees it: the link of 0095, plus the state of **this**
 * event.
 *
 * `CaseLink` names and finds a case; what it cannot say is how far the one
 * booking that connects it to this line has come. That distinction is the
 * sentence the whole family rests on: the state belongs to the event, not to
 * the case — the same case can stand twice in a statement with only one of
 * the two payments booked.
 */
export interface CaseAssignment extends CaseLink {
  /**
   * The booking state of this event, axis `ereignis`. `null` means no booking
   * hangs on it — which is not „not booked yet", see `noBookingRequiredReason`.
   */
  eventBookingState: string | null;
  /** Set means „no booking will ever come here", and the text is the reason. */
  noBookingRequiredReason: string | null;
}
