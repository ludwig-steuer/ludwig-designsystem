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
  nextAction,
  tabs,
  aside,
  children,
}: {
  /** Above everything: the supply is the frame (`RecordPager`, 0047). */
  pager?: ReactNode;
  /** The file itself (`EntityHeader`, 0048). */
  header: ReactNode;
  /** The one next action (`StatusCallout`, 0049) — absent when the case waits on someone else. */
  nextAction?: ReactNode;
  /** The tab bar (`Tabs`, 0049). Without tabs the row disappears. */
  tabs?: ReactNode;
  /** The strand on the left (`CaseTimeline`, 0040). Empty → one column. */
  aside?: ReactNode;
  /** The content of the active tab — `CaseFacts` sits in here on the first one. */
  children: ReactNode;
}) {
  return (
    <div className="v2cdv">
      {/* Jede leere Zeile entfällt samt Abstand (0048): ein Fall ohne nächste
          Handlung soll nicht aussehen, als fehlte dort etwas. */}
      {pager ? <div className="v2cdv__pager">{pager}</div> : null}
      <div className="v2cdv__head">{header}</div>
      {nextAction ? <div className="v2cdv__next">{nextAction}</div> : null}
      {tabs ? <div className="v2cdv__tabs">{tabs}</div> : null}
      {aside ? (
        <MasterDetail list={aside} detail={children} detailBreit />
      ) : (
        <div className="v2cdv__body">{children}</div>
      )}
    </div>
  );
}
