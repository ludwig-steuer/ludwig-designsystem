import type { ReactNode } from "react";

import { DataTable, type ColumnDef } from "../../patterns/DataTable";
import { TextButton } from "../../primitives/TextButton";
import type { BankTransactionFactsData, BankTransactionRowData } from "./bank-transaction";
import { COMPACT_COLUMNS, bankTransactionColumns } from "./bank-transaction-columns";
import { BankTransactionFoldout } from "./BankTransactionFacts";

/**
 * A few lines of a statement in a foreign place (0193) — the payment of a
 * review step, the payments of a case, the coverage of an account.
 *
 * The app built this four times, four ways. Here it is one card with one
 * **fixed** column set: date · payment · case · booking · amount. No sorting,
 * no pager, no filter — whoever needs those wants the statement itself
 * (`BankTransactionList`), and the head says how to get there.
 *
 * **Every line folds open** to its details (owner 2026-09-21): counterparty
 * with IBAN, purpose in full, the assignment with the state per case, where
 * the line came from. The split is part of that, not a fold-out of its own.
 * It stands on `DataTable`, so the fold-out, the empty state and the width
 * floor are the list's — and the card stays a server component.
 */

/**
 * @when    A handful of statement lines inside something else — a review
 *          step, a case, an account page, a drawer.
 * @instead The statement of an account, sorted and paged →
 *          BankTransactionList. Open payments to be assigned in one go →
 *          BankTransactionWorklist. One payment named in running text →
 *          BankTransactionCell.
 */
export function BankTransactionExcerpt<T extends BankTransactionFactsData>({
  title,
  sub,
  transactions,
  caseHref,
  openHref,
  rowHref,
  statementHref,
  actions,
  empty,
  extraColumn,
}: {
  title: ReactNode;
  sub?: ReactNode;
  /**
   * The lines, in the caller's order — the excerpt does not sort. Whatever of
   * the detail they carry (IBAN, BIC, source, import) shows in the fold-out.
   */
  transactions: readonly T[];
  caseHref: (caseId: string) => string;
  /** Where „offen" leads — the assignment. */
  openHref?: string;
  /** Where a line's name leads — the drawer of one payment. */
  rowHref?: (t: BankTransactionRowData) => string;
  /**
   * The way to the **whole** statement of this account (owner 2026-09-21):
   * every excerpt is a cut, and the reader has to be able to see the rest.
   * Fixed place (the card head, right) and fixed words („Gesamten
   * Kontoauszug öffnen") — not left to each caller's `actions`, or it would
   * look different at every place again. An excerpt covers **one** account;
   * lines of several accounts are several excerpts, each with its way.
   */
  statementHref?: string;
  actions?: ReactNode;
  /** An empty excerpt is a sentence with a reason, never an empty card. */
  empty?: { title: string; hint?: string };
  /**
   * **One** column of the place, before the amount — what only this place
   * knows about the line, such as why a review step lists it („Grund", owner
   * 2026-09-21). One, not a column set: more would make the excerpt the
   * statement again. The lines may carry more than a statement line for it —
   * `T` is whatever the caller passes.
   */
  extraColumn?: ColumnDef<T>;
}) {
  const fixed: ColumnDef<T>[] = bankTransactionColumns({
    caseHref,
    columns: [...COMPACT_COLUMNS],
    ...(openHref ? { openHref } : {}),
    ...(rowHref ? { rowHref } : {}),
  });
  // The amount stays the last column: a number column at the right edge (V3).
  const columns = extraColumn ? [...fixed.slice(0, -1), extraColumn, ...fixed.slice(-1)] : fixed;
  const headActions =
    actions || statementHref ? (
      <>
        {actions}
        {statementHref ? (
          <TextButton tone="quiet" href={statementHref}>
            Gesamten Kontoauszug öffnen
          </TextButton>
        ) : null}
      </>
    ) : undefined;

  return (
    <DataTable<T>
      rows={[...transactions]}
      columns={columns}
      rowKey={(t) => t.id}
      head={{ title, ...(sub ? { sub } : {}), ...(headActions ? { actions: headActions } : {}) }}
      expand={(t) => <BankTransactionFoldout transaction={t} caseHref={caseHref} />}
      empty={{
        title: empty?.title ?? "Keine Zahlung.",
        ...(empty?.hint ? { description: empty.hint } : {}),
      }}
    />
  );
}
