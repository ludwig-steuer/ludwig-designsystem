"use client";

import type { CSSProperties, ReactNode } from "react";

/**
 * Master-Detail und die beiden Flächen darin — das Arbeitsflächen-Muster des
 * Designs (F123 T123.1, seit F128 eigene Datei unter `patterns/`).
 */

/**
 * Master-Detail: Liste links, Detail rechts und beim Scrollen stehenbleibend.
 * Der kanonische Ersatz für das Modal (UX-Guidelines L2) — die Auswahl gehört in einen
 * eigenen Such-Parameter (`?sel=`), nicht in den Drawer-Parameter (R8).
 *
 * @when    Picking from a list, working on the selected item on the right.
 * @instead Single confirmation without a list → Dialog. Sequence of steps → StepRail.
 */
export function MasterDetail({
  list,
  detail,
  style,
  detailBreit = false,
  minDetail = 620,
}: {
  list: ReactNode;
  detail: ReactNode;
  style?: CSSProperties;
  /**
   * Dreht das Gewicht um: schmale Liste, breites Detail — für Schritte, in
   * denen im Detail gearbeitet und in der Liste nur ausgewählt wird.
   */
  detailBreit?: boolean;
  /**
   * How much the wide half needs before the two stop standing next to each
   * other, in px. **The caller knows this, the pattern does not**: a table of
   * movements needs 620, a list of facts stays readable at 484 — and a floor
   * that fits one starves the other (found in 0063 and immediately again in
   * 0050, one width apart). Below `440 + minDetail + gap` the two wrap.
   */
  minDetail?: number;
}) {
  if (!detailBreit) {
    return (
      <div className="v2md" style={style}>
        <div>{list}</div>
        <div className="v2md__detail">{detail}</div>
      </div>
    );
  }
  // The reversed layout needs a **floor**: without one the narrow column keeps
  // its 440 px at every width and never falls back to a single column — a wide
  // table beside it then loses its right-hand columns into the horizontal
  // scroll (found in 0063, where the credit column stood at no width at all).
  //
  // The floor is a flex basis, not a container query, and that is the whole
  // point: a query would need the threshold as a literal, and the threshold
  // belongs to the caller. Here the wide half asks for `minDetail` and wraps
  // when it cannot have it.
  return (
    <div
      className="v2md v2md--detail-breit"
      style={{ ...style, "--v2md-min": `${minDetail}px` } as CSSProperties}
    >
      <div className="v2md__list">{list}</div>
      <div className="v2md__detail">{detail}</div>
    </div>
  );
}

export interface ListItem {
  key: string;
  title: ReactNode;
  sub?: ReactNode;
  badges?: ReactNode;
  href?: string;
}

export interface ListGroup {
  title: string;
  count?: number;
  items: ListItem[];
}

/**
 * The list of a master-detail: **one** card, a head per group, rows parted by
 * lines instead of frames of their own, the active row with an accent bar
 * (kit §10).
 *
 * @when    The left half of a MasterDetail — the list one picks from.
 * @instead The right half → DetailPane. The whole frame → MasterDetail.
 */
export function ListPane({
  groups,
  activeKey,
  onPick,
  empty = "Nichts zu prüfen.",
}: {
  groups: ListGroup[];
  activeKey?: string;
  onPick?: (key: string) => void;
  empty?: string;
}) {
  const leer = groups.every((g) => g.items.length === 0);
  return (
    <div className="v2lp">
      {leer ? (
        <div className="v2lp__empty">{empty}</div>
      ) : (
        groups
          .filter((g) => g.items.length > 0)
          .map((g) => (
            <div key={g.title}>
              <div className="v2lp__grp">
                <span>{g.title}</span>
                {g.count === undefined ? null : <span>{g.count}</span>}
              </div>
              {g.items.map((it) => (
                <button
                  key={it.key}
                  type="button"
                  className={`v2lp__item${it.key === activeKey ? " is-active" : ""}`}
                  aria-current={it.key === activeKey}
                  onClick={() => onPick?.(it.key)}
                >
                  <span className="v2lp__title">
                    {it.title}
                    {it.badges ? <span className="v2lp__badges">{it.badges}</span> : null}
                  </span>
                  {it.sub ? <span className="v2lp__sub">{it.sub}</span> : null}
                </button>
              ))}
            </div>
          ))
      )}
    </div>
  );
}

/**
 * The right half of the master-detail — the pane the selection fills.
 *
 * It exists as its own export because the list and the detail come from two
 * different places in a page: the list is the page's, the detail belongs to
 * whatever was selected.
 *
 * @when    The right side of a MasterDetail, with its own head and body.
 * @instead The whole two-column frame → MasterDetail. A detail that stands
 *          alone on a page → CaseDetailView and its kin.
 */
export function DetailPane({
  title,
  sub,
  children,
  empty,
}: {
  title?: ReactNode;
  sub?: ReactNode;
  children?: ReactNode;
  empty?: string;
}) {
  if (!title && !children) {
    return <div className="v2dp"><div className="v2dp__empty">{empty ?? "Zeile wählen für das Detail."}</div></div>;
  }
  return (
    <div className="v2dp">
      {title ? <div className="v2dp__title">{title}</div> : null}
      {sub ? <div className="v2dp__sub">{sub}</div> : null}
      {children}
    </div>
  );
}
