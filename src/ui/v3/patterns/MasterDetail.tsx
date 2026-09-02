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
}: {
  list: ReactNode;
  detail: ReactNode;
  style?: CSSProperties;
  /**
   * Dreht das Gewicht um: schmale Liste, breites Detail — für Schritte, in
   * denen im Detail gearbeitet und in der Liste nur ausgewählt wird.
   */
  detailBreit?: boolean;
}) {
  return (
    <div className={detailBreit ? "v2md v2md--detail-breit" : "v2md"} style={style}>
      <div>{list}</div>
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
 * Die Liste im Master-Detail: **eine** Karte, Kopfzeile je Gruppe, Zeilen
 * durch Trennlinien statt eigener Rahmen, aktive Zeile mit Akzentleiste
 * (Baukasten §10).
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
