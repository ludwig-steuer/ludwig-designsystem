import type { ReactNode } from "react";

import { DOCUMENT_GROUP_LABEL } from "@/ludwig/modules/datev-export/domain/document-group";

import { formatCount } from "../../format";
import {
  DataTable,
  type DataTableProps,
  type ListPatch,
  type TableGroup,
  type TablePager,
} from "../../patterns/DataTable";
import { journalEntryColumns, type EntryRow, type JournalEntryColumnOptions } from "./journal-entry-columns";

/**
 * The entries of a list — the batch, the case, the export bucket (0178).
 *
 * The composition is thin on purpose: `DataTable` carries head, sorting,
 * paging and the five states, `journalEntryColumns()` carries the cells. What
 * lives here are the four decisions that would otherwise be taken three
 * times — the row key, the default column set, the order of the document
 * groups, and that a section may not be paged.
 */

type Table = DataTableProps<EntryRow>;

type Shape =
  | { entries: readonly EntryRow[]; pager?: TablePager; groups?: never }
  | { groups: readonly TableGroup<EntryRow>[]; entries?: never; pager?: never };

export type JournalEntryListProps = Shape & {
  head: Table["head"];
  /** Ludwig's entries or DATEV's records — one stock has one source (0211). */
  source?: JournalEntryColumnOptions["source"];
  /** `compact` in a drawer, fold-out or side card; `full` on a page. */
  variant?: JournalEntryColumnOptions["variant"];
  /** Columns that would be empty here — the case inside a case, the batch inside a batch. */
  without?: JournalEntryColumnOptions["without"];
  /** Columns beyond the defaults — `run` (Durchgang), `exportRef` (DATEV-ID) and the like. */
  include?: JournalEntryColumnOptions["include"];
  sort?: Table["sort"];
  href?: (patch: ListPatch) => string;
  filtered?: Table["filtered"];
  empty?: Table["empty"];
  loading?: boolean;
  error?: Table["error"];
  rowActions?: Table["rowActions"];
  density?: Table["density"];
  /** Σ under the amount column — the caller's sum over the whole stock (E2). */
  totals?: { amount: ReactNode };
  /**
   * The width below which the table scrolls instead of squeezing.
   *
   * With a default, because most of these columns are `fr` tracks and a floor
   * computed from them would be zero: measured at 1000 px, the names then
   * broke one character per line (0178, first browser pass).
   */
  minWidth?: number;
  /** The whole row leads into the entry — its drawer (0177). */
  entryHref?: (entryId: string) => string;
  accountHref?: (accountNumber: string) => string;
  caseHref?: (caseId: string) => string;
  /** The way to the reference work of the tax keys, per stored key (F271). */
  taxKeyHref?: (taxKey: string) => string;
  /** The way into the document drawer (`?document=`). */
  documentHref?: (documentId: string) => string;
  batchHref?: (batchId: string) => string;
};

/** „1 Satz", „14 Sätze" — a section head that says „1 Sätze" reads like a bug. */
function countLabel(n: number): string {
  return n === 1 ? "1 Satz" : `${formatCount(n)} Sätze`;
}

/**
 * The entries in sections, one per document group (0149).
 *
 * The order is the one of `DOCUMENT_GROUP_LABEL` — the batch is filed that
 * way, so it is read that way. Entries without a group come last, under their
 * own word; they are not silently mixed into another section. Nothing is
 * sorted or counted beyond the section figure: the list computes nothing else
 * (E2).
 *
 * @when    Building the sections of a batch list.
 * @instead A flat page with a pager → hand `entries` in instead.
 */
export function journalEntriesByDocumentGroup(
  entries: readonly EntryRow[],
): TableGroup<EntryRow>[] {
  const order = Object.keys(DOCUMENT_GROUP_LABEL);
  const byKey = new Map<string, EntryRow[]>();
  const rest: EntryRow[] = [];
  for (const entry of entries) {
    const key = entry.documentGroup ?? null;
    if (key !== null && order.includes(key)) {
      const list = byKey.get(key);
      if (list) list.push(entry);
      else byKey.set(key, [entry]);
    } else {
      rest.push(entry);
    }
  }
  const sections: TableGroup<EntryRow>[] = order
    .filter((key) => byKey.has(key))
    .map((key) => {
      const rows = byKey.get(key)!;
      return {
        key,
        label: (DOCUMENT_GROUP_LABEL as Record<string, string>)[key] ?? key,
        rows,
        aside: countLabel(rows.length),
      };
    });
  if (rest.length > 0) {
    sections.push({
      key: "none",
      label: "Ohne Beleggruppe",
      rows: rest,
      aside: countLabel(rest.length),
    });
  }
  return sections;
}

/**
 * @when    A list of entries: the content of a batch, the bookings of a case,
 *          a bucket of the export.
 * @instead Picking proposals apart with bulk actions → JournalEntryReviewList
 *          (0164). A handful of entries in a card → JournalEntryRow. One entry
 *          read whole → JournalEntryFacts.
 */
export function JournalEntryList(props: JournalEntryListProps): ReactNode {
  const {
    head,
    source,
    variant = "full",
    without,
    include,
    sort,
    href,
    filtered,
    empty,
    loading,
    error,
    rowActions,
    density,
    totals,
    minWidth,
    entryHref,
    accountHref,
    caseHref,
    taxKeyHref,
    documentHref,
    batchHref,
  } = props;

  const shared = {
    columns: journalEntryColumns({
      variant,
      ...(source ? { source } : {}),
      ...(without ? { without } : {}),
      ...(include ? { include } : {}),
      ...(accountHref ? { accountHref } : {}),
      ...(caseHref ? { caseHref } : {}),
      ...(taxKeyHref ? { taxKeyHref } : {}),
      ...(documentHref ? { documentHref } : {}),
      ...(batchHref ? { batchHref } : {}),
    }),
    // Always the entry id: a list that keys on the index loses its selection
    // and its fold-out on every sort (0106).
    rowKey: (entry: EntryRow) => entry.id,
    head,
    ...(sort ? { sort } : {}),
    ...(href ? { href } : {}),
    ...(filtered ? { filtered } : {}),
    ...(empty ? { empty } : {}),
    ...(loading ? { loading } : {}),
    ...(error ? { error } : {}),
    ...(rowActions ? { rowActions } : {}),
    density: density ?? (variant === "compact" ? "compact" : "default"),
    // The full form computes its floor from the tracks — text and accounts
    // carry px floors since the acceptance of 0211 (M1: a fixed 1180 left the
    // text 52 px once `include` added columns). The compact form must fit a
    // drawer and never scrolls sideways.
    ...(minWidth !== undefined ? { minWidth } : variant === "compact" ? { minWidth: 0 } : {}),
    ...(totals ? { totals: { label: "Summe", cells: { amount: totals.amount } } } : {}),
    ...(entryHref ? { rowHref: (entry: EntryRow) => entryHref(entry.id) } : {}),
  };

  if (props.groups) return <DataTable<EntryRow> {...shared} groups={props.groups} />;
  return (
    <DataTable<EntryRow>
      {...shared}
      rows={[...props.entries]}
      {...(props.pager ? { pager: props.pager } : {})}
    />
  );
}
