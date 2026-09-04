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
 * @when    Every table and every bounded surface with a header.
 * @instead Prose → ProseCard. Key figure → KpiTile.
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
  icon,
  meta,
  actions,
}: {
  title: ReactNode;
  sub?: ReactNode;
  /** Symbol left of title and sub-line (0049) — says which entity this card is about. */
  icon?: ReactNode;
  /** Right of the title, **before** the actions (0049) — „1 Ereignis", a count, a date. */
  meta?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="v2card__h">
      {icon ? <span className="v2card__ico">{icon}</span> : null}
      <div>
        <div className="title">{title}</div>
        {sub ? <div className="sub">{sub}</div> : null}
      </div>
      {meta ? <div className="v2card__meta">{meta}</div> : null}
      {actions ? <div className="actions">{actions}</div> : null}
    </div>
  );
}

export function CardFoot({ children }: { children: ReactNode }) {
  return <div className="v2card__f">{children}</div>;
}

/* ── Tabelle ────────────────────────────────────────────────────────── */

/**
 * How much vertical room a row gets (0057 E9). The page decides it, never the
 * reader — density is a design decision, not a switch (V1).
 */
export type TableDensity = "compact" | "default" | "wide";

/**
 * Grid-Tabelle. `cols` ist ein `grid-template-columns`-Wert, `minWidth`
 * erzwingt horizontales Scrollen statt Quetschen (viele Spalten).
 *
 * @when    Records of the same kind in columns, even with three rows; `density`
 *          when a page needs the tighter or the roomier row.
 * @instead Label/value pairs → FieldList. Click does something client-side → ClickRow, ExpandableRow.
 */
export function Table({
  cols,
  minWidth,
  density = "default",
  children,
}: {
  cols: string;
  minWidth?: number;
  /** `compact` one line per row, `wide` room for a title plus a sub-line. */
  density?: TableDensity;
  children: ReactNode;
}) {
  const body = (
    <div className="v2tbl" data-density={density} style={{ "--v2-cols": cols } as CSSProperties}>
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
 * @when    Data row; with `href` the whole row is a link.
 * @instead Click without a URL → ClickRow.
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
