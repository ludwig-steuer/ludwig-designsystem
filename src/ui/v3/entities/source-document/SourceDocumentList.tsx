import { StateIcon } from "../../patterns/Review";
import { EmptyState } from "../../primitives/EmptyState";
import type { ReactNode } from "react";
import { ErrorRow, TableLoading } from "../../primitives/Cells";
import { Row, Table } from "../../primitives/Table";
import type { SourceDocumentVM } from "./SourceDocument";
import {
  COMPACT_VIEW,
  sourceDocumentColumns,
  sourceDocumentMinWidth,
  sourceDocumentTracks,
  type SourceDocumentColumnOptions,
} from "./source-document-columns";

/**
 * A handful of documents beside other work (0070).
 *
 * Two of the six lists of this entity are short: the documents at a case
 * (p90 **1**) and the parts of a split collection (p90 **0**). No sorting, no
 * filter, no pager — that is not a table, it is rows with an empty case.
 *
 * **And the empty case is the point.** „No document is expected here" is a
 * **success** and carries its reason; „no documents linked" is a gap. The list
 * cannot tell the two apart — the caller says which one holds.
 */

export type SourceDocumentEmptyKind = "none" | "not-expected";

/**
 * @when    A short, embedded list of documents — at a case, under a
 *          collection document.
 * @instead One of the three long lists → `sourceDocumentColumns()` in
 *          `DataTable`. One document mentioned elsewhere → SourceDocumentCell.
 */
export function SourceDocumentList({
  documents,
  emptyKind = "none",
  reason,
  href,
  processPicture,
  classificationPicture,
  loading,
  error,
}: {
  documents: readonly SourceDocumentVM[];
  /** Which of the two empty cases holds. Defaults to the gap, not the success. */
  emptyKind?: SourceDocumentEmptyKind;
  /** Only with `not-expected`: **why** none is expected. Without it the success is a claim. */
  reason?: string;
  href?: (document: SourceDocumentVM) => string;
  /** The progress of each row (0204) — without it the old completion stands. */
  processPicture?: SourceDocumentColumnOptions["processPicture"];
  classificationPicture?: SourceDocumentColumnOptions["classificationPicture"];
  /** Still loading — skeleton rows in the same tracks (acceptance 0212, M5). */
  loading?: boolean;
  /** Loading failed: what failed, and the way to try again (T5, I7). */
  error?: { message: string; retry?: ReactNode };
}) {
  const columns = sourceDocumentColumns({
    columns: COMPACT_VIEW,
    variant: "compact",
    // Only rows that lead somewhere are links: no `#` for a document without a way.
    ...(href ? { href } : documents.some((d) => d.href) ? { href: (d: SourceDocumentVM) => d.href ?? "#" } : {}),
    ...(processPicture ? { processPicture } : {}),
    ...(classificationPicture ? { classificationPicture } : {}),
  });
  if (loading || error) {
    return (
      <Table cols={sourceDocumentTracks(columns)} minWidth={sourceDocumentMinWidth(columns)}>
        {loading ? <TableLoading rows={2} cols={columns.length} /> : <ErrorRow message={error!.message} action={error!.retry} />}
      </Table>
    );
  }
  if (documents.length === 0) {
    return emptyKind === "not-expected" ? (
      <EmptyState
        inline
        // The tick, because this empty case is a **result**, not a gap — the
        // same mark `DataTable` puts on its finished lists.
        icon={<StateIcon state="done" title="erledigt" />}
        title="Kein Beleg zu erwarten"
        description={reason ?? "Für diesen Vorgang ist kein Beleg vorgesehen."}
      />
    ) : (
      <EmptyState
        inline
        title="Keine verbundenen Belege"
        description="Es hängt noch kein Beleg an diesem Vorgang. Sobald einer eintrifft, steht er hier."
      />
    );
  }
  return (
    // The row brings its own track list (`.v2doc__row`); `cols` only feeds the
    // fallback. A `Table` it needs regardless — a `<tr>` without one is not
    // valid markup (0106).
    // The compact row K of the catalogue (0212): the same cells as every
    // document table, one line each, no head — the list stands in foreign
    // context, where a column head would be a second heading.
    // With its floor, so a frame narrower than the row scrolls instead of
    // cutting the progress (acceptance 0212, M1).
    <Table cols={sourceDocumentTracks(columns)} minWidth={sourceDocumentMinWidth(columns)}>
      {documents.map((d) => (
        <Row key={d.id}>
          {columns.map((c) => (
            <span key={c.key} className={c.align === "end" ? "v2num" : undefined}>
              {c.cell(d)}
            </span>
          ))}
        </Row>
      ))}
    </Table>
  );
}
