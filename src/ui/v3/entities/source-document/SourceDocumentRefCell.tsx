import { EntityIcon } from "../../Icons";
import { Link } from "../../primitives/Link";

/**
 * The column „Beleg" of every booking table (0211, brief F334 §4.2): the
 * document number (Belegfeld 1) as the text, and whether a document hangs
 * behind it. Three states, one form each:
 *
 *  - **linked** (the entry's `source_doc_id`, F331) — the document sign and the
 *    number as a link into the document drawer; without a number the sign and
 *    „Beleg";
 *  - **number, no document** — the number muted; `full` adds „ohne Beleg"
 *    under it, `compact` keeps it in the title;
 *  - **nothing** — „ohne Beleg", muted.
 *
 * Sign and link tell linked from not linked — not the colour alone.
 */

/**
 * @when    The document behind a booking entry or a movement, in a table
 *          column — number and whether a document is linked.
 * @instead A document named with its kind and counterparty → SourceDocumentCell.
 *          A document as its own row → SourceDocumentRow.
 */
export function SourceDocumentRefCell({
  number,
  documentId,
  documentHref,
  variant = "full",
}: {
  /** Belegfeld 1 as stored — the DATEV document number. */
  number: string | null;
  /** The linked document (`source_doc_id`); `null` = none linked. */
  documentId?: string | null;
  /** The way into the document drawer (`?document=`). Without it the linked state stays text. */
  documentHref?: (documentId: string) => string;
  variant?: "compact" | "full";
}) {
  const text = number?.trim() || null;
  if (documentId) {
    const body = (
      <>
        <EntityIcon entity="source-document" size={14} />
        <span className={text ? "v2mono" : undefined}>{text ?? "Beleg"}</span>
      </>
    );
    return documentHref ? (
      <Link href={documentHref(documentId)} className="v3docref v3docref--link" title={text ? `Beleg ${text} ansehen` : "Beleg ansehen"}>
        {body}
      </Link>
    ) : (
      <span className="v3docref">{body}</span>
    );
  }
  if (!text) return <span className="v2muted">ohne Beleg</span>;
  return (
    <span className="v3docref v3docref--none" title="Kein Beleg zugeordnet">
      <span className="v2mono v2muted">{text}</span>
      {variant === "full" ? <span className="v2sub">ohne Beleg</span> : null}
    </span>
  );
}
