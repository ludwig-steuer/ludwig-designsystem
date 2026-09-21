import type { ReactNode } from "react";

import { columnsMinWidth } from "../../patterns/DataTable";
import { EmptyState } from "../../primitives/EmptyState";
import { TextButton } from "../../primitives/TextButton";
import { Card, CardHead, HeadRow, Table } from "../../primitives/Table";
import type { BankTransactionRowData } from "./bank-transaction";
import {
  COMPACT_COLUMNS,
  bankTransactionColumns,
  bankTransactionTracks,
} from "./bank-transaction-columns";
import { BankTransactionRow } from "./BankTransactionRow";

/**
 * A few lines of a statement in a foreign place (0193) — the payment of a
 * review step, the payments of a case, the coverage of an account.
 *
 * The app built this four times, four ways. Here it is one card with one
 * **fixed** column set: date · payment · case · booking · amount. No sorting,
 * no pager, no filter — whoever needs those wants the statement itself
 * (`BankTransactionList`).
 *
 * A split line shows its cases with their part amounts right away: in a
 * handful of lines that is information, not noise, and it keeps the card a
 * server component — no fold-out state.
 */

/**
 * @when    A handful of statement lines inside something else — a review
 *          step, a case, an account page.
 * @instead The statement of an account, sorted and paged →
 *          BankTransactionList. Open payments to be assigned in one go →
 *          BankTransactionWorklist. One payment named in running text →
 *          BankTransactionCell.
 */
export function BankTransactionExcerpt({
  title,
  sub,
  transactions,
  caseHref,
  openHref,
  rowHref,
  statementHref,
  actions,
  empty,
}: {
  title: ReactNode;
  sub?: ReactNode;
  /** The lines, in the caller's order — the excerpt does not sort. */
  transactions: readonly BankTransactionRowData[];
  caseHref: (caseId: string) => string;
  /** Where „offen" leads — the assignment. */
  openHref?: string;
  /** Where a line leads — the drawer of one payment. */
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
}) {
  const options = {
    caseHref,
    columns: [...COMPACT_COLUMNS],
    ...(openHref ? { openHref } : {}),
    ...(rowHref ? { rowHref } : {}),
  };
  const columns = bankTransactionColumns(options);

  return (
    <Card>
      <CardHead
        title={title}
        {...(sub ? { sub } : {})}
        {...(actions || statementHref
          ? {
              actions: (
                <>
                  {actions}
                  {statementHref ? (
                    <TextButton tone="quiet" href={statementHref}>
                      Gesamten Kontoauszug öffnen
                    </TextButton>
                  ) : null}
                </>
              ),
            }
          : {})}
      />
      {transactions.length === 0 ? (
        <div className="v3boxbody">
          <EmptyState
            inline
            title={empty?.title ?? "Keine Zahlung."}
            {...(empty?.hint ? { description: empty.hint } : {})}
          />
        </div>
      ) : (
        <Table cols={bankTransactionTracks(columns)} minWidth={columnsMinWidth(columns)}>
          <HeadRow>
            {columns.map((c) => (
              <span key={c.key} className={c.align === "end" ? "v2num" : undefined}>
                {c.header}
                {c.headerAside}
              </span>
            ))}
          </HeadRow>
          {transactions.map((t) => (
            <BankTransactionRow
              key={t.id}
              transaction={t}
              expanded={t.cases.length > 1}
              {...options}
            />
          ))}
        </Table>
      )}
    </Card>
  );
}
