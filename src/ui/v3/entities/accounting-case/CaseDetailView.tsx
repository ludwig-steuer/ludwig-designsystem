import type { ReactNode } from "react";

import { MasterDetail } from "../../patterns/MasterDetail";

/**
 * The frame of the case detail page (0050).
 *
 * It carries **no data at all** — it orders. The order is the reason it
 * exists: pager, head, the one next action, the tabs, and then the strand
 * beside the content. That is the rank order 1–9 of the page profile, and
 * because it is the point of this view it is **not** a prop.
 *
 * Ranks 1–4 — who this is, where it stands, what to do next, what happened —
 * have to be answered **without scrolling**. So the view sets no height and no
 * scroll container of its own around the upper three slots; whoever puts one
 * there takes that answer away.
 *
 * @when    The page around one case: pager, head, next action, tabs, strand.
 * @instead Any list with a detail beside it → MasterDetail. The facts inside
 *          the first tab → CaseFacts. The drawer beside other work →
 *          CaseDrawer.
 */
export function CaseDetailView({
  pager,
  header,
  signal,
  tabs,
  aside,
  children,
}: {
  /** Above everything: the supply is the frame (`RecordPager`, 0047). */
  pager?: ReactNode;
  /** The file itself (`EntityHeader`, 0048). */
  header: ReactNode;
  /**
   * The **signal** of the whole record: the one next action
   * (`StatusCallout`, 0049) — absent when the case waits on someone else.
   *
   * Called `nextAction` until 0138. The name has changed, not the meaning:
   * three detail frames carried this slot under three names, and the standard
   * describes them in **one** slot row (D3). A page that moves from one entity
   * to the next should not have to relearn what the third row is called.
   */
  signal?: ReactNode;
  /** The tab bar (`Tabs`, 0049). Without tabs the row disappears. */
  tabs?: ReactNode;
  /** The strand on the left (`CaseTimeline`, 0040). Empty → one column. */
  aside?: ReactNode;
  /** The content of the active tab — `CaseFacts` sits in here on the first one. */
  children: ReactNode;
}) {
  return (
    <div className="v2cdv">
      {/* An empty row drops out with its spacing (0048): a case without a
          next action must not look as if something were missing there. */}
      {pager ? <div className="v2cdv__pager">{pager}</div> : null}
      <div className="v2cdv__head">{header}</div>
      {signal ? <div className="v2cdv__next">{signal}</div> : null}
      {tabs ? <div className="v2cdv__tabs">{tabs}</div> : null}
      {aside ? (
        // 460 px instead of the default 620: what stands on the right are
        // facts, not a table — they stay readable in the detail column, and
        // with the default the view fell into a single column at a 1280 px
        // window (acceptance of 0050). **Not 484:** the threshold would then
        // sit exactly on the page width at 1280, and a browser with
        // space-taking scrollbars loses about 15 px and wraps unnoticed
        // (acceptance of 0116). 460 leaves 24 px of room.
        <MasterDetail list={aside} detail={children} detailBreit minDetail={460} />
      ) : (
        <div className="v2cdv__body">{children}</div>
      )}
    </div>
  );
}
