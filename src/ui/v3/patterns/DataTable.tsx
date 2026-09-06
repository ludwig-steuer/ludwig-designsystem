import { ActionIcon } from "../Icons";
import type { ReactNode } from "react";

import { RowActions } from "../primitives/ActionBar";
import { ActionButton, type ActionResult, type ConfirmSpec } from "../primitives/ActionButton";
import { Button } from "../primitives/Button";
import { ErrorRow, TableLoading } from "../primitives/Cells";
import { EmptyState } from "../primitives/EmptyState";
import { ExpandableRow } from "../primitives/ExpandableRow";
import { Link } from "../primitives/Link";
import { MenuItem, OverflowMenu } from "../primitives/OverflowMenu";
import { Pagination } from "../primitives/Pagination";
import {
  SelectAllCell,
  SelectRowCell,
  SelectionScope,
  SelectionScopeBar,
  type BulkAction,
} from "../primitives/Selection";
import {
  Card,
  CardFoot,
  CardHead,
  EmptyRow,
  HeadRow,
  Row,
  Table,
  type TableDensity,
} from "../primitives/Table";
import { TextButton } from "../primitives/TextButton";
import { StateIcon } from "./Review";

/**
 * The list page as one bracket (0057).
 *
 * Thirteen list pages put the same card together by hand today: card, column
 * head, rows, the five states, paging. None of them sorts, none of them lets
 * you pick rows, each of them writes its own empty text. This is that card,
 * once — the way `LogBrowser` is the bracket over `LogList`.
 *
 * It **loads nothing and sorts nothing** (E1, E2): `rows` are the rows of this
 * page, already sorted and filtered; `sort`, `pager` and `filtered` are the
 * mirror of the URL, and `href` builds the next one. A column head is a link,
 * not a state — sorting fifty of five hundred rows locally would show them in
 * the wrong order.
 *
 * The file carries **no client directive** (E3): `cell`, `rowHref`, `expand`,
 * `rowActions` and `selection.label` run on the server and hand their result
 * on as ReactNode.
 * The three parts that carry state are islands of their own — the selection
 * (`Selection.tsx`), the fold-out (`ExpandableRow.tsx`) and the row menu
 * (`OverflowMenu.tsx`). Server Actions are serializable and may cross.
 */

export interface ColumnDef<T> {
  /** Also the sort name that goes into the URL. */
  key: string;
  /**
   * Normal case, no capitals (A2). With `sortable` it should be a **plain
   * string**: it becomes the word of the sort link and its spoken name.
   * Everything that stands next to it — above all the (i) of a status column,
   * which Z4 demands — belongs in `headerAside`, not here.
   */
  header: ReactNode;
  /**
   * What stands next to the column name and must **not** be inside the sort
   * link: the `StatusInfoButton` of a status column (Z4). A button inside an
   * `<a>` is invalid HTML and is read out inconsistently; that it works today
   * rests on `StatusInfoButton` stopping the click (0094 b).
   */
  headerAside?: ReactNode;
  /** A component or a pure function, rendered on the server. */
  cell: (row: T) => ReactNode;
  /** One grid track: „1fr" (default), „120px", „max-content". */
  width?: string;
  /** „end" for amounts and counts — puts `v2num` on head **and** cell (V3). */
  align?: "start" | "end";
  /** Opt-in; without it no arrow and no link. */
  sortable?: boolean;
}

/** One action on one row. Either a jump (`href`) or a Server Action (`action`). */
export interface RowAction {
  label: string;
  icon?: ReactNode;
  /** A jump — drawer over a search param (L3) or a page. */
  href?: string;
  /** A Server Action, bound to the row by the caller. */
  action?: () => Promise<ActionResult>;
  confirm?: ConfirmSpec;
  tone?: "danger";
  /** Stays visible when the rest moves into the menu (E8). */
  primary?: boolean;
}

export type { BulkAction };

/** The grip column in front of the data — selection and chevron, `v3.css`. */
const PICK = "var(--v2-tbl-pick)";

/** What a click on head or page size changes in the URL. */
export type ListPatch = {
  page?: number;
  pageSize?: number;
  sort?: string;
  dir?: "asc" | "desc";
};

interface DataTableBase<T> {
  /** The rows of **this page**, already sorted and filtered. */
  rows: T[];
  columns: ColumnDef<T>[];
  /** Key for React, for the selection and for the fold-out. */
  rowKey: (row: T) => string;
  /** Zone 1 — every table in a card, with a head, even when empty (V5). */
  head: {
    title: ReactNode;
    sub?: ReactNode;
    icon?: ReactNode;
    meta?: ReactNode;
    actions?: ReactNode;
  };
  /** Row measure (E9) — the page decides, not the reader. */
  density?: TableDensity;
  /** From where it scrolls horizontally instead of squeezing. */
  minWidth?: number;
  /** The last column, always visible (V14): ≤ 2 inline, ≥ 3 primary plus menu. */
  rowActions?: (row: T) => RowAction[];
  /** The state out of the URL; the active column carries the arrow, and the link says the state in words. */
  sort?: { key: string; dir: "asc" | "desc" };
  /**
   * The page builds the URL. Required as soon as `sort` or `pager` is set —
   * without it a sortable head stays a plain word and no pager is rendered.
   */
  href?: (patch: ListPatch) => string;
  /** Zone 5 — the four numbers are `PageResult` without its `items`. */
  pager?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    pageSizeOptions?: number[];
  };
  /** Selection column, head box, bar in zone 1 (I5). */
  selection?: {
    actions: BulkAction[];
    /** The text of the checkbox; without it the row key stands there. */
    label?: (row: T) => string;
  };
  /** A filter is on: gives the empty text **after** the filter (T6). */
  filtered?: { summary: string; resetHref: string };
  /** Empty text, **never filled**; `done` is the finished case with a number (L6). */
  empty?: { title: string; description?: ReactNode; action?: ReactNode; done?: boolean };
  /** Head and column head stay in place (I7). */
  loading?: boolean;
  /** Text after T5 plus one way to try again (I7). */
  error?: { message: string; retry?: ReactNode };
  /** Zone 6 — the next step with its number (I10). */
  next?: ReactNode;
}

/**
 * `expand` and `rowHref` exclude each other: a row that folds out cannot at
 * the same time be a link. Whoever needs both gets the chevron as a cell of
 * its own — that is in the backlog of 0057.
 */
export type DataTableProps<T> = DataTableBase<T> &
  (
    | { rowHref?: (row: T) => string; expand?: never }
    | { expand: (row: T) => ReactNode; rowHref?: never }
  );

/**
 * @when    A list page: columns, page, sorting over the URL, selection with
 *          bulk actions, row actions, the five states — all in one card.
 * @instead Pick from a list and work on it next to the list → MasterDetail. A
 *          log someone narrows down → LogBrowser. A hand-set table of three
 *          rows without state → Card with Table and Row. The filter above the
 *          card → FilterBar, it stays with the page.
 */
export function DataTable<T>(props: DataTableProps<T>) {
  const {
    rows,
    columns,
    rowKey,
    head,
    density = "default",
    minWidth,
    rowActions,
    sort,
    href,
    pager,
    selection,
    filtered,
    empty,
    loading,
    error,
    next,
    rowHref,
    expand,
  } = props as DataTableBase<T> & {
    rowHref?: (row: T) => string;
    expand?: (row: T) => ReactNode;
  };

  // One grip track in front for each of selection and chevron, `max-content`
  // behind for the actions — the columns fall back to one share each. The
  // width of a grip track is a measure and lives in the CSS (A5).
  //
  // The fallback is `minmax(0, 1fr)` and not `1fr`, because a bare `1fr` is
  // `minmax(auto, 1fr)`: `auto` is the **min-content** width of the cell, and
  // head and rows are separate grids with different content — each would size
  // the track itself. Measured in 0101 before the fix: the amount column stood
  // at three different positions across six rows and ran 111 px past the head.
  const cols = [
    selection ? PICK : null,
    expand ? PICK : null,
    ...columns.map((c) => c.width ?? "minmax(0, 1fr)"),
    rowActions ? "max-content" : null,
  ]
    .filter(Boolean)
    .join(" ");

  const headRow = (
    <HeadRow>
      {selection ? <SelectAllCell /> : null}
      {expand ? <span /> : null}
      {columns.map((c) => headCell(c, sort, href))}
      {rowActions ? <th scope="col" className="v2actions">Aktionen</th> : null}
    </HeadRow>
  );

  const body = loading ? (
    <TableLoading rows={5} cols={columns.length} />
  ) : error ? (
    <ErrorRow message={error.message} action={error.retry} />
  ) : rows.length > 0 ? (
    rows.map((row) => bodyRow(row, props))
  ) : filtered ? (
    <EmptyRow>
      <EmptyState
        inline
        title={`Keine Treffer für „${filtered.summary}“.`}
        action={<TextButton href={filtered.resetHref}>Filter zurücksetzen</TextButton>}
      />
    </EmptyRow>
  ) : empty ? (
    <EmptyRow>
      <EmptyState
        inline
        icon={empty.done ? <StateIcon state="done" title="erledigt" /> : undefined}
        title={empty.title}
        description={empty.description}
        action={empty.action}
      />
    </EmptyRow>
  ) : null;

  // Zone 5 only stands under rows: a pager under „nothing here" would be a
  // second statement about the same emptiness.
  const showPager = !loading && !error && rows.length > 0 && pager && href;

  const card = (
    <Card>
      <CardHead
        title={head.title}
        sub={head.sub}
        icon={head.icon}
        meta={head.meta}
        actions={
          selection ? (
            <SelectionScopeBar actions={selection.actions} fallback={head.actions} />
          ) : (
            head.actions
          )
        }
      />
      <Table cols={cols} minWidth={minWidth} density={density}>
        {headRow}
        {body}
      </Table>
      {showPager ? (
        <Pagination
          page={pager.page}
          pageSize={pager.pageSize}
          totalItems={pager.totalItems}
          totalPages={pager.totalPages}
          buildHref={(page) => href({ page })}
          pageSizeOptions={pager.pageSizeOptions}
          buildSizeHref={
            pager.pageSizeOptions ? (pageSize) => href({ pageSize, page: 1 }) : undefined
          }
        />
      ) : null}
      {next ? <CardFoot>{next}</CardFoot> : null}
    </Card>
  );

  if (!selection) return card;
  // `key` on the page: a page change empties the selection, because „12
  // ausgewählt" can only mean twelve of the rows in front of you (E1).
  return (
    <SelectionScope key={pager?.page ?? 0} order={rows.map(rowKey)}>
      {card}
    </SelectionScope>
  );
}

/**
 * A sortable head is a link on `href({ sort, dir, page: 1 })`: the first click
 * sorts ascending, a click on the active column turns it around. Only the
 * active one carries the arrow.
 *
 * **The sort state stands in the name of the link, not in `aria-sort`** (0094
 * a). `aria-sort` only works on a `columnheader`, and `.v2tbl` is a grid of
 * `div`s without table semantics — the attribute sat on a `<span>` and no
 * reading aid ever saw it. Giving the family real table roles founders on
 * three shapes in which the row **is** the control (`Row href`, the pickable
 * `ChecklistLine`, `ExpandableRow`); that is a redesign, and it has its own
 * task (0106). Until then the link says it in words, which is announced
 * everywhere: „Nach Betrag sortieren — derzeit aufsteigend".
 *
 * `headerAside` stays outside the link: a button inside an `<a>` is invalid
 * HTML (0094 b).
 */
function headCell<T>(
  col: ColumnDef<T>,
  sort: { key: string; dir: "asc" | "desc" } | undefined,
  href: ((patch: ListPatch) => string) | undefined,
) {
  const cls = col.align === "end" ? "v2num" : undefined;
  if (!col.sortable || !href) {
    return (
      <th key={col.key} scope="col" className={cls}>
        {col.header}
        {col.headerAside}
      </th>
    );
  }
  const active = sort?.key === col.key;
  const asc = active && sort.dir === "asc";
  const name = typeof col.header === "string" ? col.header : col.key;
  const state = active
    ? `derzeit ${asc ? "aufsteigend" : "absteigend"}`
    : "derzeit nicht sortiert";
  return (
    // `aria-sort` is back where it belongs (0106): on the `columnheader`. It
    // only ever worked there, and until the table was a real table there was
    // no such element — 0094 measured it at a `<span>`, doing nothing. The
    // `aria-label` of the link stays: it says the state in words, which is
    // read out everywhere, while `aria-sort` is announced by some readers and
    // not by others.
    <th
      key={col.key}
      scope="col"
      className={cls}
      aria-sort={active ? (asc ? "ascending" : "descending") : "none"}
    >
      <Link
        className="v2sortlink"
        href={href({ sort: col.key, dir: asc ? "desc" : "asc", page: 1 })}
        aria-label={`Nach ${name} sortieren — ${state}`}
      >
        {col.header}
        {active ? <ActionIcon action={asc ? "sort-asc" : "sort-desc"} size={12} /> : null}
      </Link>
      {col.headerAside}
    </th>
  );
}

function bodyRow<T>(row: T, props: DataTableProps<T>): ReactNode {
  const { columns, rowKey, rowActions, selection } = props;
  const { rowHref, expand } = props as {
    rowHref?: (row: T) => string;
    expand?: (row: T) => ReactNode;
  };
  const key = rowKey(row);

  // Every column gets exactly one grid cell, whatever `cell` returns.
  const cells = columns.map((col, i) => {
    const content = col.cell(row);
    return (
      <span key={col.key} className={col.align === "end" ? "v2num" : undefined}>
        {/* The whole row leads to the detail (I11), and it does so without an
            `<a>` inside an `<a>`: the link of the first column covers the row
            through `.v2rowlink`, keeps its own text and stays the one focus
            stop for the target. Buttons and the checkbox lie above it. */}
        {rowHref && i === 0 ? (
          <Link className="v2rowlink" href={rowHref(row)}>
            {content}
          </Link>
        ) : (
          content
        )}
      </span>
    );
  });

  const select = selection ? (
    <SelectRowCell rowKey={key} label={selection.label?.(row) ?? key} />
  ) : null;
  const actions = rowActions ? <RowActions>{rowActionCells(rowActions(row))}</RowActions> : null;

  if (expand) {
    return (
      <ExpandableRow
        key={key}
        lead={select}
        summary={
          <>
            {cells}
            {actions}
          </>
        }
      >
        {expand(row)}
      </ExpandableRow>
    );
  }

  return (
    <Row key={key}>
      {select}
      {cells}
      {actions}
    </Row>
  );
}

/**
 * By count, not by measured room (E8): up to two stand inline, from three on
 * the `primary` ones stay and the rest move into the menu. Always visible,
 * never on hover only — a hidden action does not exist for the keyboard (V14).
 */
function rowActionCells(list: RowAction[]): ReactNode {
  if (list.length <= 2) return list.map(inlineAction);
  const primary = list.filter((a) => a.primary);
  const rest = list.filter((a) => !a.primary);
  return (
    <>
      {primary.map(inlineAction)}
      <OverflowMenu size="xs" label="Mehr">
        {rest.map(menuAction)}
      </OverflowMenu>
    </>
  );
}

function inlineAction(a: RowAction): ReactNode {
  if (a.href !== undefined) {
    return (
      <Button key={a.label} href={a.href} size="xs" variant="tertiary" icon={a.icon}>
        {a.label}
      </Button>
    );
  }
  return (
    <ActionButton
      key={a.label}
      size="xs"
      variant={a.tone === "danger" ? "danger" : "tertiary"}
      icon={a.icon}
      confirm={a.confirm}
      action={a.action ?? (async () => {})}
    >
      {a.label}
    </ActionButton>
  );
}

function menuAction(a: RowAction): ReactNode {
  if (a.href !== undefined) {
    return (
      <MenuItem key={a.label} href={a.href} icon={a.icon} tone={a.tone}>
        {a.label}
      </MenuItem>
    );
  }
  // An action in the menu stays an `ActionButton` — it brings the pending
  // lock, the error line and the confirmation with it. A `MenuItem` around it
  // would be a button inside a button, so the entry only takes its shape from
  // the CSS.
  return (
    <span
      key={a.label}
      className={`v2menu__act${a.tone === "danger" ? " v2menu__act--danger" : ""}`}
    >
      <ActionButton
        size="sm"
        variant="tertiary"
        icon={a.icon}
        confirm={a.confirm}
        action={a.action ?? (async () => {})}
      >
        {a.label}
      </ActionButton>
    </span>
  );
}
