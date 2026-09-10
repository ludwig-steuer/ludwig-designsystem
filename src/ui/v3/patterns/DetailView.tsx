import type { ReactNode } from "react";

import { MasterDetail } from "./MasterDetail";

/**
 * The frame of a detail page — five slots, always in this order (0138 way 1).
 *
 * **Pager · Kopf · Signal · Reiter · Körper.** That is D3 of
 * `docs/detailseiten-standard.md`, and until now three entities each built
 * their own frame around it: `CaseDetailView` (0050), `SourceDocumentView`
 * (0071), `LedgerAccountView` (0063). Three files, one structure — the same
 * `flex column` with the same gap, the same „an empty slot drops out with its
 * spacing", the same `MasterDetail` at the bottom.
 *
 * 0138 held the decision open on purpose: *„three frames with the same
 * structure can still be three frames that happen to look alike; only the
 * fourth case shows whether the structure carries."* The fourth case is 0127,
 * the business partner — and it needed **nothing** the three do not already
 * have. So the frame is here now, and it belongs to `patterns/`: it knows no
 * entity, only slots.
 *
 * **It carries no data at all** — it orders. Ranks 1–4 of the page profile have
 * to be answered without scrolling, so this component sets **no height and no
 * scroll container** of its own around the upper slots. Whoever puts one there
 * takes that answer away.
 *
 * The three existing frames stay until the owner releases their migration;
 * they are the same five slots under an entity name. What is deliberately
 * **not** here is `LedgerAccountView`'s pair of content slots (`summary`,
 * `chart`): they sit where the signal sits but are content, not signal
 * (0138's own correction). When the account page moves over, it brings that
 * slot with its own reason — YAGNI until then.
 *
 * @when    The page around one record: pager, head, signal, tabs, body.
 * @instead A list with a detail beside it → MasterDetail. The content of the
 *          first tab → the entity's own `…Facts`. One record beside other work
 *          → the entity's drawer.
 */
export function DetailView({
  pager,
  header,
  signal,
  tabs,
  aside,
  minDetail,
  children,
}: {
  /**
   * Above everything: where the reader came from and where the next record is
   * (`RecordPager`, 0047). Its `back` names the list — „← Belege", not „←".
   */
  pager?: ReactNode;
  /** The record itself (`EntityHeader`, 0048) — rank 1. */
  header: ReactNode;
  /**
   * What holds for the **whole record** and cannot wait for a tab: the one
   * next action, a banner, a defect zone.
   *
   * **Exactly one**, never a stack — which one wins is a domain order, not a
   * question of display (0144, finding L-267). Absent → the row disappears
   * with its spacing, so nothing looks missing.
   */
  signal?: ReactNode;
  /** The tab bar (`Tabs`). Without tabs the row disappears. */
  tabs?: ReactNode;
  /**
   * What is read **beside** the body instead of above it — the strand of a
   * case, the facts of an account (layout D-L3).
   *
   * Empty → one column, and that is the default (D-L1). A side column is the
   * exception and needs a sentence in the page profile.
   */
  aside?: ReactNode;
  /**
   * The floor of the body column, in pixels, when there is an `aside`.
   *
   * **It has no default, and that is the point.** Both existing values were
   * fought for in acceptances against a measured page: 460 beside the facts of
   * a case (0050 — the default 620 dropped the view into one column at a
   * 1280 px window), 960 beside the seven-column table of an account (0063 —
   * at 620 the posting text was 98 px wide and the contra account lost its
   * name in every row). A frame that invented a number here would quietly
   * overrule both.
   */
  minDetail?: number;
  /** The content of the active tab. */
  children: ReactNode;
}) {
  return (
    <div className="v3dv">
      {pager ? <div className="v3dv__slot">{pager}</div> : null}
      <div className="v3dv__slot">{header}</div>
      {signal ? <div className="v3dv__slot">{signal}</div> : null}
      {tabs ? <div className="v3dv__slot">{tabs}</div> : null}
      {aside ? (
        <MasterDetail
          list={aside}
          detail={children}
          detailWide
          {...(minDetail === undefined ? {} : { minDetail })}
        />
      ) : (
        <div className="v3dv__slot">{children}</div>
      )}
    </div>
  );
}
