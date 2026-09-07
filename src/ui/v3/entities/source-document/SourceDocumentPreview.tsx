import { Card, CardHead } from "../../primitives/Table";
import { EmptyState } from "../../primitives/EmptyState";

/**
 * The original of a document, in a frame (0075).
 *
 * A document *has* an original — that is what sets it apart from every other
 * entity, and why it stands second in drawer, card and view, right after the
 * head (0052, zone 2).
 *
 * Two rules make this an entity form rather than an `<iframe>` at the call
 * site: a missing preview is **said in a sentence** instead of drawn as a grey
 * box, and a partial document says **which pages of which original** one is
 * looking at. Every fifth document in the data is a partial one, cut out of a
 * collection PDF (`split_page_range`, 20 %) — without that line the reader
 * sees three pages and does not know they are pages 5–7 of 24.
 *
 * It deliberately cannot: **load** (the caller hands over `url` or `null`),
 * **render** a PDF itself (the browser does that; whoever wants to page
 * through opens the original), **show a placeholder** where there is nothing,
 * and **zoom** into the excerpt — the partial document is already a file of
 * its own, `excerpt` describes it, it cuts nothing.
 *
 * @when    The original of a document, large — in its drawer, its card, its
 *          view; with `excerpt` for a document cut out of a collection PDF.
 * @instead The frame around it with head, facts and a way out →
 *          SourceDocumentDrawer. The facts without the original →
 *          SourceDocumentFacts. A document mentioned in a sentence →
 *          SourceDocumentCell.
 */
export function SourceDocumentPreview({
  url,
  unavailableReason,
  title = "Beleg",
  fileName,
  pageCount,
  excerpt,
}: {
  /** Signed URL of the original. `null` means **there is none**, not „still loading". */
  url: string | null;
  /** Why there is none, in one sentence. Without it the standard sentence stands. */
  unavailableReason?: string | null;
  /**
   * Heading of the frame. „Vertrag" at a contract — the **kind of document**,
   * from the caller's `sourceDocTypeLabel()`, never derived in here.
   */
  title?: string;
  /** Names the frame for a screen reader: „Vorschau von RE-4471.pdf". */
  fileName?: string | null;
  /** Page count of the document — meta beside the title. */
  pageCount?: number | null;
  /**
   * The excerpt: `split_page_range` plus, where known, the way to the
   * collection original. `null` is a whole document — and says nothing.
   */
  excerpt?: { pages: string; parentTitle?: string; parentHref?: string } | null;
  /**
   * **Gone with the owner decision of 2026-09-07.** There was `md` (62vh) and
   * `lg` (78vh); at 1440 × 900 the taller one pushed „Belegdaten" below the
   * fold, and the rank order of the page profile says the read-out values
   * stand beside the original, not under it. One height for every place the
   * preview appears: `clamp(320px, 62vh, 900px)`.
   *
   * @deprecated Ignored. It stays for one release so no caller breaks.
   */
  height?: "md" | "lg";
}) {
  return (
    <Card>
      <CardHead
        title={title}
        sub={excerpt ? <ExcerptLine excerpt={excerpt} /> : undefined}
        meta={pageCount ? `${pageCount} ${pageCount === 1 ? "Seite" : "Seiten"}` : undefined}
      />
      {url ? (
        <iframe
          className="v2doc__orig"
          src={url}
          // Without a name of its own the frame is a nameless box to a screen
          // reader — and „Vorschau" alone does not say of what.
          title={fileName ? `Vorschau von ${fileName}` : `Vorschau: ${title}`}
        />
      ) : (
        // A sentence, never a placeholder in the shape of a document: a grey
        // box would be a claim about something that is not there.
        <EmptyState
          inline
          title="Keine Vorschau"
          description={unavailableReason ?? "Für diesen Beleg gibt es keine Vorschau."}
        />
      )}
    </Card>
  );
}

/** „Seiten 5–7 aus Sammel-PDF vom 12.08.2026" — the range comes ready-made. */
function ExcerptLine({
  excerpt,
}: {
  excerpt: { pages: string; parentTitle?: string; parentHref?: string };
}) {
  return (
    <>
      Seiten {excerpt.pages}
      {excerpt.parentTitle ? (
        <>
          {" aus "}
          {excerpt.parentHref ? (
            <a className="v2link" href={excerpt.parentHref}>
              {excerpt.parentTitle}
            </a>
          ) : (
            excerpt.parentTitle
          )}
        </>
      ) : (
        " des Originals"
      )}
    </>
  );
}
