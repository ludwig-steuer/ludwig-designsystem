import type { CaseListItem } from "@/ludwig/modules/accounting-cases/domain/case";
import { Row } from "../../primitives/Table";
import { caseColumns, type CaseColumnOptions } from "./case-columns";

/**
 * A case as one row (0096).
 *
 * The clerk skims her stock — p90 **190 open** cases per client and year — and
 * has to see three things per row: *what is it about, am I the one, what hangs
 * on it?* Today that row stands twice, hand-written, in two page files, with
 * two different column sets and six cell helpers that exist only there.
 *
 * The cells come from `caseColumns()`, the same set `DataTable` uses. The row
 * is the frame for a short list; the column set is the frame for 190.
 */

/**
 * @when    A short list of cases — the tab of a business partner, a card with
 *          a handful of rows.
 * @instead The main list with sorting, selection and paging → `caseColumns()`
 *          in `DataTable`. One case named in a foreign view → CaseCell.
 */
export function CaseRow({
  case: item,
  ...options
}: { case: CaseListItem } & CaseColumnOptions) {
  const cols = caseColumns(options);
  return (
    // No `href` on `Row`: the row link sits on the display name and covers the
    // row through `.v2rowlink::after`. A `Row href` would wrap the
    // counterparty link — an anchor inside an anchor (Freigabe, reason 1).
    <Row>
      {cols.map((c) => (
        <span key={c.key} className={c.align === "end" ? "v2num" : undefined}>
          {c.cell(item)}
        </span>
      ))}
    </Row>
  );
}
