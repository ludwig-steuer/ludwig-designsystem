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
import { journalEntryColumns, type JournalEntryColumn } from "./journal-entry-columns";
import type { JournalEntryRowData } from "./journal-entry";

/**
 * The entries of a list — the batch, the case, the export bucket (0178).
 *
 * The composition is thin on purpose: `DataTable` carries head, sorting,
 * paging and the five states, `journalEntryColumns()` carries the cells. What
 * lives here are the four decisions that would otherwise be taken three
 * times — the row key, the default column set, the order of the document
 * groups, and that a section may not be paged.
 */

type Table = DataTableProps<JournalEntryRowData>;

type Shape =
  | { entries: readonly JournalEntryRowData[]; pager?: TablePager; groups?: never }
  | { groups: readonly TableGroup<JournalEntryRowData>[]; entries?: never; pager?: never };

export type JournalEntryListProps = Shape & {
  head: Table["head"];
  columns?: readonly JournalEntryColumn[];
  sort?: Table["sort"];
  href?: (patch: ListPatch) => string;
  filtered?: Table["filtered"];
  empty?: Table["empty"];
  loading?: boolean;
  error?: Table["error"];
  rowActions?: Table["rowActions"];
  density?: Table["density"];
  /** The whole row leads into the entry — its drawer (0177). */
  entryHref?: (entryId: string) => string;
  accountHref?: (accountNumber: string) => string;
  caseHref?: (caseId: string) => string;
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
  entries: readonly JournalEntryRowData[],
): TableGroup<JournalEntryRowData>[] {
  const order = Object.keys(DOCUMENT_GROUP_LABEL);
  const byKey = new Map<string, JournalEntryRowData[]>();
  const rest: JournalEntryRowData[] = [];
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
  const sections: TableGroup<JournalEntryRowData>[] = order
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
    columns,
    sort,
    href,
    filtered,
    empty,
    loading,
    error,
    rowActions,
    density,
    entryHref,
    accountHref,
    caseHref,
  } = props;

  const shared = {
    columns: journalEntryColumns({
      ...(columns ? { columns } : {}),
      ...(accountHref ? { accountHref } : {}),
      ...(caseHref ? { caseHref } : {}),
    }),
    // Always the entry id: a list that keys on the index loses its selection
    // and its fold-out on every sort (0106).
    rowKey: (entry: JournalEntryRowData) => entry.entryId,
    head,
    ...(sort ? { sort } : {}),
    ...(href ? { href } : {}),
    ...(filtered ? { filtered } : {}),
    ...(empty ? { empty } : {}),
    ...(loading ? { loading } : {}),
    ...(error ? { error } : {}),
    ...(rowActions ? { rowActions } : {}),
    ...(density ? { density } : {}),
    ...(entryHref ? { rowHref: (entry: JournalEntryRowData) => entryHref(entry.entryId) } : {}),
  };

  if (props.groups) return <DataTable<JournalEntryRowData> {...shared} groups={props.groups} />;
  return (
    <DataTable<JournalEntryRowData>
      {...shared}
      rows={[...props.entries]}
      {...(props.pager ? { pager: props.pager } : {})}
    />
  );
}
