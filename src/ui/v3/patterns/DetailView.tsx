import type { ReactNode } from "react";

/**
 * The frame of a detail page — five slots, always in this order (0138 way 1).
 *
 * **Pager · Kopf · Signal · Reiter · Körper.** That is D3 of
 * `docs/detailseiten-standard.md`, and until now three entities each built
 * their own frame around it: `CaseDetailView` (0050), `SourceDocumentView`
 * (0071), `LedgerAccountView` (0063). Three files, one structure — the same
 * `flex column` with the same gap, the same „an empty slot drops out with its
 * spacing". The columns of the body were once part of it too; since 0184 they
 * live in `Columns` (0154), where the four patterns are.
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
 * @instead Columns inside the body → Columns. A list with a detail beside it →
 *          MasterDetail. The content of the first tab → the entity's own
 *          `…Facts`. One record beside other work → the entity's drawer.
 */
export function DetailView({
  pager,
  header,
  signal,
  tabs,
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
   * The content of the active tab.
   *
   * **Columns live in the body, not in the frame** (0184): a tab with more
   * than one column wraps its content in `Columns` (0154) and picks one of the
   * four patterns. Until 2026-09-15 this frame offered `aside`/`minDetail` and
   * that carries nothing sends the next caller down the old road.
   */
  children: ReactNode;
}) {
  return (
    <div className="v3dv">
      {pager ? <div className="v3dv__slot">{pager}</div> : null}
      <div className="v3dv__slot">{header}</div>
      {signal ? <div className="v3dv__slot">{signal}</div> : null}
      {tabs ? <div className="v3dv__slot">{tabs}</div> : null}
      <div className="v3dv__slot">{children}</div>
    </div>
  );
}
