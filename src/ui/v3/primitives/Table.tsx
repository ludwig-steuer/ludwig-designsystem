import { Link } from "./Link";
import type { CSSProperties, ReactNode } from "react";

/**
 * v2-Tabellen-Baukasten (F118 §4, Design `Tabellen-Bausteine.dc.html`).
 *
 * Kernregel des Baukastens: **jede Tabelle lebt in einer Karte** mit
 * Kartenkopf und Spaltenkopf — auch bei drei Zeilen. Keine frei schwebenden
 * Zeilen. Getrennt wird über Linien, nie über Zebra-Streifen.
 *
 * Alles hier ist eine Server-Component (kein `"use client"`): die Bausteine
 * bekommen fertiges Markup und `href`s. Interaktion (Ausklappen, Auswahl)
 * baut der Aufrufer in seinem eigenen Client-Wrapper — die Primitive bleibt
 * dumm.
 *
 * Styling: `src/styles/v2.css`, Farben ausschließlich aus `tokens.css`.
 */

/* ── Karte ──────────────────────────────────────────────────────────── */

/**
 * @when    Jede Tabelle und jede abgegrenzte Fläche mit Kopf.
 * @instead Fließtext → ProseCard. Kennzahl → KpiTile.
 */
export function Card({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`v2card${className ? ` ${className}` : ""}`} style={style}>
      {children}
    </div>
  );
}

export function CardHead({
  title,
  sub,
  actions,
}: {
  title: ReactNode;
  sub?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="v2card__h">
      <div>
        <div className="title">{title}</div>
        {sub ? <div className="sub">{sub}</div> : null}
      </div>
      {actions ? <div className="actions">{actions}</div> : null}
    </div>
  );
}

export function CardFoot({ children }: { children: ReactNode }) {
  return <div className="v2card__f">{children}</div>;
}

/* ── Tabelle ────────────────────────────────────────────────────────── */

/**
 * Grid-Tabelle. `cols` ist ein `grid-template-columns`-Wert, `minWidth`
 * erzwingt horizontales Scrollen statt Quetschen (viele Spalten).
 *
 * @when    Gleichartige Sätze in Spalten, auch bei drei Zeilen.
 * @instead Label/Wert-Paare → FieldList. Klick tut etwas im Client → ClickRow, ExpandableRow.
 */
export function Table({
  cols,
  minWidth,
  children,
}: {
  cols: string;
  minWidth?: number;
  children: ReactNode;
}) {
  const body = (
    <div className="v2tbl" style={{ "--v2-cols": cols } as CSSProperties}>
      {children}
    </div>
  );
  if (!minWidth) return body;
  return (
    <div className="v2tbl__scroll">
      <div className="v2tbl__inner" style={{ "--v2-min": `${minWidth}px` } as CSSProperties}>
        {body}
      </div>
    </div>
  );
}

/** Spaltenkopf — die Zellen sind einfache Knoten, Ausrichtung über `v2num`. */
export function HeadRow({ children }: { children: ReactNode }) {
  return <div className="v2tbl__head">{children}</div>;
}

/**
 * Datenzeile. Mit `href` wird sie ein Link (ganze Zeile klickbar), sonst ein
 * `div`. Ein `onClick` gehört in einen Client-Wrapper des Aufrufers.
 *
 * @when    Datenzeile; mit `href` ist die ganze Zeile ein Link.
 * @instead Klick ohne URL → ClickRow.
 */
export function Row({
  children,
  href,
  active,
  className,
}: {
  children: ReactNode;
  href?: string;
  active?: boolean;
  className?: string;
}) {
  const cls =
    "v2tbl__row" +
    (href ? " is-clickable" : "") +
    (active ? " is-active" : "") +
    (className ? ` ${className}` : "");
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return <div className={cls}>{children}</div>;
}

/** Zwischenüberschrift über eine volle Zeile (gruppierte Tabellen). */
export function GroupRow({ children }: { children: ReactNode }) {
  return <div className="v2tbl__group">{children}</div>;
}

/** Leerzustand innerhalb der Karte — Kopfzeilen bleiben stehen. */
export function EmptyRow({ children }: { children: ReactNode }) {
  return <div className="v2tbl__empty">{children}</div>;
}
