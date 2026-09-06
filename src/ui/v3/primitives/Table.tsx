import { Children, Fragment, isValidElement, type CSSProperties, type ReactNode } from "react";
import { Link } from "./Link";

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
    // A real `<table>`, and the grid stays on the row: `display: block` on the
    // table and the body, `display: grid` on `tr` — measured in the review of
    // 0094 (finding B2) to give the full tree table · row · columnheader · cell.
    <table className="v2tbl" data-density={density} style={{ "--v2-cols": cols } as CSSProperties}>
      <tbody className="v2tbl__body">{children}</tbody>
    </table>
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


/* ── Zellen ─────────────────────────────────────────────────────────── */

/**
 * Wraps the caller's cells in `<th>` or `<td>` — the one place that knows a
 * row is a row (0106).
 *
 * The set's tables were a CSS grid of `<div>`s: no rows, no column headers, no
 * cells. A screen reader could not read a row column by column; it heard a
 * sequence of texts. Since the grid sits on the **row** and not on the
 * container, a real `<table>` keeps every measure — `grid-template-columns`
 * with `1fr`, the `gap`, the tracks of forty call sites — and needs no
 * `<colgroup>` and no single `role` attribute.
 *
 * The wrapping happens here so that those forty call sites stay as they are.
 * Fragments are flattened, because a cell group written as `<>…</>` is one
 * child to React and would land in one cell; `null` and `false` are skipped,
 * exactly as the grid skipped them before. A child that is already a `td` or
 * `th` passes through — the story files that write them today (finding 0091)
 * become right instead of wrong.
 */
function cells(children: ReactNode, tag: "td" | "th", cellClass?: string): ReactNode {
  const out: ReactNode[] = [];
  const walk = (node: ReactNode) => {
    Children.forEach(node, (child) => {
      if (child === null || child === undefined || typeof child === "boolean") return;
      if (isValidElement(child) && child.type === Fragment) {
        walk((child.props as { children?: ReactNode }).children);
        return;
      }
      if (isValidElement(child) && (child.type === "td" || child.type === "th")) {
        out.push(child);
        return;
      }
      out.push(child);
    });
  };
  walk(children);
  return out.map((c, i) =>
    isValidElement(c) && (c.type === "td" || c.type === "th") ? (
      c
    ) : tag === "th" ? (
      <th key={i} scope="col" className={cellClass}>
        {c}
      </th>
    ) : (
      <td key={i} className={cellClass}>
        {c}
      </td>
    ),
  );
}

/** A row that spans every column — group heading, empty state, expanded detail. */
const SPAN_ALL = 999;

/**
 * The same wrapping for the client twins of `Row` — `ClickRow`,
 * `ExpandableRow`, `ComparisonTable`, the register of 0014.
 *
 * `lead` wraps the content of the **first** cell: that is where the row's own
 * control goes, and from there `.v2rowlink`/`.v2rowbtn` covers the row. A
 * `<tr>` can be neither a link nor a button, and a row that is one is no
 * longer a row for a screen reader.
 *
 * @when    A client component builds its own `<tr>` and needs the cells.
 * @instead A plain data row → Row.
 */
export function rowCells(
  children: ReactNode,
  lead?: (content: ReactNode) => ReactNode,
): ReactNode {
  const parts = cells(children, "td") as ReactNode[];
  if (!lead) return parts;
  const [first, ...rest] = parts;
  const inner = isValidElement(first)
    ? (first.props as { children?: ReactNode }).children
    : first;
  return [
    <td className="v2tbl__lead" key="lead">
      {lead(inner)}
    </td>,
    ...rest,
  ];
}

/** Spaltenkopf — die Zellen sind einfache Knoten, Ausrichtung über `v2num`. */
export function HeadRow({ children }: { children: ReactNode }) {
  return <tr className="v2tbl__head">{cells(children, "th")}</tr>;
}

/**
 * Datenzeile. Mit `href` wird die **erste Zelle** der Link, der über
 * `.v2rowlink::after` die ganze Zeile abdeckt.
 *
 * Vorher war die Zeile selbst ein `<a>`. Ein `<tr>` kann das nicht sein, und
 * es war ohnehin die falsche Form: eine Zeile mit einem zweiten Link darin
 * ergab Anker im Anker. So bleibt ein Fokus-Halt, der Link behält seinen
 * eigenen Text — also braucht er kein `aria-label` —, und was sonst klickbar
 * ist, liegt darüber (I11).
 *
 * @when    Data row; with `href` the whole row leads to one target.
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
    "v2tbl__row" + (active ? " is-active" : "") + (className ? ` ${className}` : "");
  if (!href) return <tr className={cls}>{cells(children, "td")}</tr>;
  const parts = cells(children, "td") as ReactNode[];
  const [first, ...rest] = parts;
  return (
    <tr className={cls}>
      <td className="v2tbl__lead">
        <Link href={href} className="v2rowlink">
          {isValidElement(first) ? (first.props as { children?: ReactNode }).children : first}
        </Link>
      </td>
      {rest}
    </tr>
  );
}

/** Zwischenüberschrift über eine volle Zeile (gruppierte Tabellen). */
export function GroupRow({ children }: { children: ReactNode }) {
  return (
    <tr>
      <td className="v2tbl__group" colSpan={SPAN_ALL}>
        {children}
      </td>
    </tr>
  );
}

/** Leerzustand innerhalb der Karte — Kopfzeilen bleiben stehen. */
export function EmptyRow({ children }: { children: ReactNode }) {
  return (
    <tr>
      <td className="v2tbl__empty" colSpan={SPAN_ALL}>
        {children}
      </td>
    </tr>
  );
}
