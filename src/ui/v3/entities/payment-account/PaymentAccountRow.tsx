import { Row } from "../../primitives/Table";
import {
  paymentAccountColumns,
  type PaymentAccountColumn,
  type PaymentAccountColumnOptions,
} from "./payment-account-columns";
import type { PaymentAccountRowData } from "./payment-account";

/**
 * One payment account as a row of a short list (0180) — the cells come from
 * `paymentAccountColumns()`, so the card and the table say the same thing.
 *
 * @when    A handful of payment accounts in a card — in a step, in a preview.
 * @instead The year's list or the configuration with sorting →
 *          `paymentAccountColumns()` in `DataTable`. One account named in a
 *          foreign row → PaymentAccountCell.
 */
export function PaymentAccountRow({
  account,
  columns,
  statementHref,
  accountHref,
}: {
  account: PaymentAccountRowData;
  columns?: readonly PaymentAccountColumn[];
  statementHref?: PaymentAccountColumnOptions["statementHref"];
  accountHref?: PaymentAccountColumnOptions["accountHref"];
}) {
  const cells = paymentAccountColumns({
    ...(columns ? { columns } : {}),
    ...(statementHref ? { statementHref } : {}),
    ...(accountHref ? { accountHref } : {}),
  }).map((column) => (
    <span key={column.key} className={column.align === "end" ? "v2num" : undefined}>
      {column.cell(account)}
    </span>
  ));
  return <Row>{cells}</Row>;
}
