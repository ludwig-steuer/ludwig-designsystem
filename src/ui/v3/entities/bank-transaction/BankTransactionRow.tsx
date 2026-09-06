import { Amount } from "../../primitives/Amount";
import { Row } from "../../primitives/Table";
import {
  bankTransactionColumns,
  type BankTransactionColumnOptions,
} from "./bank-transaction-columns";
import type { BankTransactionRowData } from "./bank-transaction";

/**
 * One line of the statement (0101).
 *
 * **The name is not the type.** The component is `BankTransactionRow` because
 * the family names its forms after the entity plus the form; the data it takes
 * is `BankTransactionRowData`. The mirror also has a `BankTransactionRow` —
 * the **import** row, the parser's output — and this family never imports it.
 * Two different things with one name is a collision the Freigabe decided to
 * live with, rather than renaming the form.
 *
 * The cells come from `bankTransactionColumns()`, the same set `DataTable`
 * uses. The row is the frame for a handful of lines; the column set is the
 * frame for a statement of 251.
 */

/**
 * @when    A short list of statement lines — a card with a handful of rows,
 *          inside a case, inside a step.
 * @instead A statement or a worklist with sorting and paging →
 *          `bankTransactionColumns()` in `DataTable`. One payment mentioned
 *          in a foreign view → BankTransactionCell.
 */
export function BankTransactionRow({
  transaction,
  expanded,
  ...options
}: {
  transaction: BankTransactionRowData;
  /**
   * The sub-rows per assigned case with their part amount and the sum. A
   * **state**, not a switch: the caller holds it (`DataTable expand`, 0057).
   */
  expanded?: boolean;
} & BankTransactionColumnOptions) {
  const cols = bankTransactionColumns(options);
  return (
    <>
      {/*
        **No `href` on the row.** `Row href` makes the whole row an `<a>`, and
        this row's cells carry their own: the case links of `CaseCell` and the
        (i) button of the purpose. An anchor inside an anchor, and a button
        inside an anchor, are invalid markup — measured as a hydration warning
        before this was removed. The ways out of the row are the ways inside
        it; a caller who wants the whole row clickable wants a different row.
      */}
      <Row>
        {cols.map((c) => (
          <span key={c.key} className={c.align === "end" ? "v2num" : undefined}>
            {c.cell(transaction)}
          </span>
        ))}
      </Row>
      {expanded ? <SplitRows transaction={transaction} /> : null}
    </>
  );
}

/**
 * What the line is made of: one sub-row per case with its part amount, and
 * the sum underneath.
 *
 * The sum is there because the question the split raises is „does it add up?",
 * and answering it by mental arithmetic across three rows is exactly what a
 * table is supposed to spare.
 */
function SplitRows({ transaction }: { transaction: BankTransactionRowData }) {
  return (
    // Its own row with one cell over every column (0106) — a `<div>` next to a
    // `<tr>` lands in the `<tbody>` and is neither valid nor a row.
    <tr>
      <td className="v2btxrow__split" colSpan={999}>
        {transaction.cases.map((c) => (
          <div className="v2btxrow__splitrow" key={c.caseId}>
            <span>{c.caseNumber ?? c.caseId.slice(0, 8)}</span>
            <span className="v2btxrow__splittitle">{c.title ?? c.counterpartyName}</span>
            <Amount value={c.amount ?? null} currency={transaction.currency} size="sm" />
          </div>
        ))}
        <div className="v2btxrow__splitrow v2btxrow__splitsum">
          <span />
          <span>zugeordnet</span>
          <Amount value={transaction.allocatedSum} currency={transaction.currency} size="sm" />
        </div>
      </td>
    </tr>
  );
}
