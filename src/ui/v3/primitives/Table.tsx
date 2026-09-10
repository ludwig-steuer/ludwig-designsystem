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

/**
 * The head of a card — title, sub-line, and the actions that belong to the
 * whole card.
 *
 * @when    Every card that carries a table or a bounded surface (the kit's
 *          rule: no free-floating rows).
 * @instead The head of a page → PageHeader. The head of one entity →
 *          EntityHeader. The column head of a table → HeadRow.
 */
export function CardHead({
  title,
  sub,
  icon,
  meta,
  actions,
  sticky,
}: {
  title: ReactNode;
  sub?: ReactNode;
  /** Symbol left of title and sub-line (0049) — says which entity this card is about. */
  icon?: ReactNode;
  /** Right of the title, **before** the actions (0049) — „1 Ereignis", a count, a date. */
  meta?: ReactNode;
  actions?: ReactNode;
  /**
   * The head stays in view while the card scrolls (F202).
   *
   * **The head, not the bar inside it.** A `position: sticky` never sticks
   * beyond the bounds of its parent — a selection bar sitting in the head can
   * only stick within the head, and the head is as tall as its content.
   * Measured 2026-09-10: with `sticky` on the bar alone it scrolled away
   * (top −565 instead of 0). If the head sticks, everything in it sticks —
   * the title included, and while scrolling a long list that is more right
   * than wrong.
   */
  sticky?: boolean;
}) {
  return (
    <div className={sticky ? "v2card__h v2card__h--sticky" : "v2card__h"}>
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

/**
 * The foot of a card — the pager, a sum, the way onwards.
 *
 * @when    Something belongs under the card's content and is not a row.
 * @instead A row that spans the table → GroupRow. Actions of the whole
 *          card → CardHead.
 */
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
  sections,
  minWidth,
  density = "default",
  children,
}: {
  cols: string;
  /**
   * Named row groups, one `<tbody>` each — the head row of a section, then its
   * rows. Without it the table keeps its single body, which is what all 52
   * callers before 0149 rely on.
   *
   * `children` stays for the column head row; a section carries only its own
   * rows.
   */
  sections?: readonly { key: string; children: ReactNode }[];
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
      {/* The column head row keeps its own body, sections or not — it belongs
          to the table, not to any one of them. */}
      <tbody className="v2tbl__body">{children}</tbody>
      {/* One `<tbody>` per section, because that **is** a row group. A single
          body with five headings in it would make `scope="rowgroup"` a lie:
          the first heading would claim every remaining cell, including the
          other four sections (0149). */}
      {sections?.map((s) => (
        <tbody className="v2tbl__body" key={s.key}>
          {s.children}
        </tbody>
      ))}
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

/**
 * The column heads of a table — the cells are plain nodes, alignment comes
 * from `v2num`.
 *
 * @when    The column heads of a table.
 * @instead A data row → Row. A heading over a group of rows → GroupRow.
 */
export function HeadRow({ children }: { children: ReactNode }) {
  return <tr className="v2tbl__head">{cells(children, "th")}</tr>;
}

/**
 * Data row. With `href` the **first cell** becomes the link, and it covers the
 * whole row through `.v2rowlink::after`.
 *
 * The row itself used to be an `<a>`. A `<tr>` cannot be one, and it was the
 * wrong shape anyway: a row with a second link inside it gave anchors within
 * anchors. This way one focus stop remains, the link keeps its own text — so
 * it needs no `aria-label` — and whatever else is clickable lies above it
 * (I11).
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

/**
 * A heading across one full row, for grouped tables.
 *
 * @when    A heading over a group of rows, spanning every column.
 * @instead The column heads → HeadRow. Nothing to show → EmptyRow.
 */
export function GroupRow({
  children,
  select,
}: {
  children: ReactNode;
  /** The checkbox for exactly this section — left of the word (0149). */
  select?: ReactNode;
}) {
  return (
    <tr>
      {/* A **`<th scope="rowgroup">`**, not a `<td>` with `role`: the heading
          of a row group is a header cell, and `<tbody>` is the group. Saying
          it with ARIA would rebuild what the elements already are — and an
          `aria-label` on a row group is announced inconsistently, while a
          `<th>` is read as the header it is (0149). */}
      <th className="v2tbl__group" colSpan={SPAN_ALL} scope="rowgroup">
        {select}
        {children}
      </th>
    </tr>
  );
}

/**
 * The empty state inside the card — the column heads stay put.
 *
 * @when    The table has no rows and says so inside the card.
 * @instead Still loading → TableLoading. Loading failed → ErrorRow.
 */
export function EmptyRow({ children }: { children: ReactNode }) {
  return (
    <tr>
      <td className="v2tbl__empty" colSpan={SPAN_ALL}>
        {children}
      </td>
    </tr>
  );
}
