import { StateIcon } from "../../patterns/Review";
import { EmptyState } from "../../primitives/EmptyState";
import { Table } from "../../primitives/Table";
import { SourceDocumentRow, type SourceDocumentVM } from "./SourceDocument";

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
}: {
  documents: readonly SourceDocumentVM[];
  /** Which of the two empty cases holds. Defaults to the gap, not the success. */
  emptyKind?: SourceDocumentEmptyKind;
  /** Only with `not-expected`: **why** none is expected. Without it the success is a claim. */
  reason?: string;
  href?: (document: SourceDocumentVM) => string;
}) {
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
    <Table cols="minmax(0, 1fr)">
      {documents.map((d) => (
        <SourceDocumentRow
          key={d.id}
          document={href ? { ...d, href: href(d) } : d}
        />
      ))}
    </Table>
  );
}
