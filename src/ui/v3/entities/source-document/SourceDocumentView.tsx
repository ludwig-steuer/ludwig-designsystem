import type { ReactNode } from "react";

/**
 * The frame of the document detail page (0071).
 *
 * It carries **no data at all** — it orders, exactly like `CaseDetailView`
 * (0050). The order is the reason it exists: pager, head, banner, tabs, and
 * then the content of the active tab. That is the rank order 1–9 of the page
 * profile `docs/seiten/beleg-detail.md`, and because it is the point of this
 * view it is **not** a prop.
 *
 * Why a frame and not a view with twelve data props: twelve props would be a
 * second page — one that has to be kept in step with the first every time a
 * tab, an action or a state moves. Five of the six tabs need their own server
 * calls; the page loads them and hands the result in.
 *
 * Ranks 1–4 — which document, does it match the paper, what did Ludwig read,
 * how far is it — have to be answered **without scrolling**. The view sets no
 * height and no scroll container of its own around the upper slots; whoever
 * puts one there takes that answer away.
 *
 * @when    The page around one document: pager, head, banner, tabs, content.
 * @instead The content of the first tab → SourceDocumentCard. One document
 *          looked up beside other work → SourceDocumentDrawer. A list of them
 *          → sourceDocumentColumns in DataTable.
 */
export function SourceDocumentView({
  pager,
  header,
  signal,
  tabs,
  children,
}: {
  /**
   * Above everything: where the reader came from and where the next one is
   * (`RecordPager`, 0047 — its `back` names the list, „← Belege" or
   * „← Problematische Belege"). The page knows the list, the view does not.
   */
  pager?: ReactNode;
  /** The document itself (`EntityHeader`, 0048) — rank 1 and 4. */
  header: ReactNode;
  /**
   * The **signal** of the whole record: what holds for the whole document and
   * cannot wait for a tab — „wird eingeordnet" (and that the page refreshes
   * itself), „Einordnung fehlgeschlagen", a duplicate suspicion. Absent → the
   * row disappears with its spacing, so nothing looks missing.
   *
   * **Exactly one**, never a stack: which one wins is a domain order, not a
   * question of display (0144, finding L-267).
   *
   * Called `banner` until 0138 — same slot, same meaning, one name across the
   * three detail frames (D3).
   */
  signal?: ReactNode;
  /** The tab bar (`Tabs`). Without tabs the row disappears. */
  tabs?: ReactNode;
  /** The content of the active tab — `SourceDocumentCard` sits in the first. */
  children: ReactNode;
}) {
  return (
    <div className="v2docview">
      {pager ? <div className="v2docview__pager">{pager}</div> : null}
      <div className="v2docview__head">{header}</div>
      {signal ? <div className="v2docview__banner">{signal}</div> : null}
      {tabs ? <div className="v2docview__tabs">{tabs}</div> : null}
      <div className="v2docview__body">{children}</div>
    </div>
  );
}
