import { DataTable, type ListPatch } from "../../patterns/DataTable";
import type { TableDensity } from "../../primitives/Table";
import {
  bankTransactionColumns,
  type BankTransactionColumn,
} from "./bank-transaction-columns";
import type { BankTransactionRowData } from "./bank-transaction";

/**
 * The statement of one payment account (0085).
 *
 * The statement is **not a bookkeeping view — it is a search list for what is
 * still open.** 65 % of the positions belong to no case, and at a p90 of 251
 * lines per account and year, a list in which open and settled rows look the
 * same is a list to scroll through.
 *
 * The running balance stands **under** the list, never per row: a per-row
 * balance is only true under exactly one sort order and no filter, and this
 * list is both sorted and filtered. A number that means something different
 * after every filter click is worse than none (page profile).
 */

/**
 * Expanding and jumping exclude each other — a row that folds open should not
 * also go somewhere. Since 2026-09-07 that stands in the **type** and no
 * longer only in a runtime condition: `DataTable` (0057) does the same, and
 * the comment here claimed the opposite.
 */
type RowWayProps =
  | {
      /**
       * What stands under a row when it is folded open — the split into its
       * cases with their part amounts. `DataTable` brings the chevron and the
       * state; the caller says **what** is inside, because only 4 % of the
       * rows have anything.
       */
      expand: (t: BankTransactionRowData) => React.ReactNode;
      rowHref?: never;
    }
  | {
      /**
       * Where a row leads — the drawer of one payment (0103). The page profile
       * calls looking one up „often" and gives it a click; without this prop
       * the row is mute.
       *
       * The link sits on the **counterparty**, not on the first cell: a link
       * whose text is „30.08.2026" does not say where it goes. That is why it
       * goes through the column set and not through `DataTable`, which puts it
       * on cell 0.
       */
      rowHref?: (t: BankTransactionRowData) => string;
      expand?: never;
    };

/**
 * @when    The statement of one payment account: sorted, filtered, paged.
 * @instead Every open payment across accounts, with bulk assignment →
 *          BankTransactionWorklist. A handful of rows → BankTransactionRow.
 */
export function BankTransactionList({
  transactions,
  caseHref,
  openHref,
  expand,
  rowHref,
  columns,
  listHref,
  sort,
  pager,
  loading,
  error,
  filtered,
  head,
  footer,
  density,
  minWidth = 1400,
}: {
  /** The rows of **this page**, already sorted and filtered. */
  transactions: BankTransactionRowData[];
  caseHref: (caseId: string) => string;
  /** Where „offen" leads — the assignment. The list shows, it does not assign. */
  openHref?: string;
  columns?: BankTransactionColumn[];
  listHref?: (patch: ListPatch) => string;
  sort?: { key: string; dir: "asc" | "desc" };
  pager?: { page: number; pageSize: number; totalItems: number; totalPages: number };
  loading?: boolean;
  error?: { message: string; retry?: React.ReactNode };
  /** Empty **because of the filter** — a different sentence than an empty account. */
  filtered?: { summary: string; resetHref: string };
  head: { title: React.ReactNode; sub?: React.ReactNode; actions?: React.ReactNode };
  /**
   * Zone 6 — what stands under the list. The balance goes here, and nowhere
   * else; while its numbers are missing (finding L-58) it stays empty.
   */
  footer?: React.ReactNode;
  density?: TableDensity;
  /**
   * Measured, not guessed: the seven fixed tracks of the full set weigh
   * 1060 px, plus 70 px of gutters and 36 px of card padding — 1166 px before
   * the purpose gets anything. At the old default of 1250 that left it 84 px,
   * and the head „Verwendungszweck" (123 px) stood 39 px outside its own
   * cell. At 1400 the purpose has 234 px; below that `DataTable` scrolls
   * horizontally instead of cutting a column off.
   */
  minWidth?: number;
} & RowWayProps) {
  const cols = bankTransactionColumns({
    caseHref,
    ...(openHref ? { openHref } : {}),
    ...(columns ? { columns } : {}),
    ...(rowHref ? { rowHref } : {}),
  });

  return (
    <DataTable<BankTransactionRowData>
      rows={transactions}
      columns={cols}
      rowKey={(t) => t.id}
      head={head}
      minWidth={minWidth}
      {...(density ? { density } : {})}
      {...(listHref ? { href: listHref } : {})}
      {...(sort ? { sort } : {})}
      {...(pager ? { pager } : {})}
      {...(loading ? { loading } : {})}
      {...(error ? { error } : {})}
      {...(filtered ? { filtered } : {})}
      {...(footer !== undefined ? { next: footer } : {})}
      {...(expand ? { expand } : {})}
      empty={{
        // „Konto ohne Bewegung" is a **fact**, not a success and not a gap: an
        // account that saw no money in the period is neither finished nor
        // broken. That is why it carries no tick.
        title: "Auf diesem Konto ist im Zeitraum nichts gebucht worden.",
        description: "Sobald ein Auszug importiert wird, stehen die Zahlungen hier.",
      }}
    />
  );
}
