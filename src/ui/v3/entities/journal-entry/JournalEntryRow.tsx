import { Row } from "../../primitives/Table";
import {
  journalEntryColumns,
  type JournalEntryColumn,
  type JournalEntryColumnOptions,
} from "./journal-entry-columns";
import type { JournalEntryRowData } from "./journal-entry";

/**
 * One entry as a row of a short list (0175) — the cells come from
 * `journalEntryColumns()`, so the card and the table say the same thing.
 *
 * @when    A handful of entries in a card — at a case, in a preview, in a step.
 * @instead A batch or an export bucket with sorting and paging →
 *          `journalEntryColumns()` in `DataTable`. One entry named in a
 *          foreign row → JournalEntryCell.
 */
export function JournalEntryRow({
  entry,
  columns,
  accountHref,
  caseHref,
  entryHref,
}: {
  entry: JournalEntryRowData;
  columns?: readonly JournalEntryColumn[];
  accountHref?: JournalEntryColumnOptions["accountHref"];
  caseHref?: JournalEntryColumnOptions["caseHref"];
  /**
   * The way into the entry — the drawer. With it the **whole row** is the
   * link; the account number and the case keep their own ways, and where both
   * would meet, the inner one wins (I11: never two targets in one anchor).
   */
  entryHref?: (entryId: string) => string;
}) {
  const cells = journalEntryColumns({
    ...(columns ? { columns } : {}),
    ...(accountHref ? { accountHref } : {}),
    ...(caseHref ? { caseHref } : {}),
  }).map((column) => (
    <span key={column.key} className={column.align === "end" ? "v2num" : undefined}>
      {column.cell(entry)}
    </span>
  ));
  return entryHref ? <Row href={entryHref(entry.entryId)}>{cells}</Row> : <Row>{cells}</Row>;
}
