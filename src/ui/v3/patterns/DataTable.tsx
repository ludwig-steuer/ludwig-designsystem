import { ActionIcon } from "../Icons";
import type { ReactNode } from "react";

import { RowActions } from "../primitives/ActionBar";
import {
  ActionButton,
  type ActionResult,
  type AskSpec,
  type ConfirmSpec,
} from "../primitives/ActionButton";
import { Button, type ButtonVariant } from "../primitives/Button";
import { ErrorRow, TableLoading } from "../primitives/Cells";
import { EmptyState } from "../primitives/EmptyState";
import { ExpandableRow } from "../primitives/ExpandableRow";
import { Link } from "../primitives/Link";
import { MenuItem, OverflowMenu } from "../primitives/OverflowMenu";
import { Pagination } from "../primitives/Pagination";
import {
  SelectAllCell,
  SelectGroupCell,
  SelectRowCell,
  SelectionScope,
  SelectionScopeBar,
  type AnyBulkAction,
  type BulkAction,
} from "../primitives/Selection";
import {
  Card,
  CardFoot,
  CardHead,
  EmptyRow,
  GroupRow,
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

/**
 * The width below which a table has to scroll instead of squeezing.
 *
 * Every fixed track plus the floor of every flexible one, the gutters between
 * them and the card padding. It reads **only** `width` — nothing about it
 * belongs to any one entity, which is why it lives here and not, as it did
 * until 0147, inside a document catalogue where only that catalogue found it.
 *
 * `1fr` without a `minmax()` counts as zero: a flexible track without a floor
 * has none, and inventing one would be a claim. Whoever wants a floor writes
 * it into the track width, where it belongs.
 *
 * @when    A table is built by hand with `Table` and needs the same floor `DataTable` computes.
 * @instead `DataTable` does it itself — pass `minWidth` only to overrule it.
 */
export function columnsMinWidth<T>(columns: readonly ColumnDef<T>[]): number {
  const GUTTER = 10;
  // `.v2tbl` sits in a card with `padding: 12px 18px` (v3.css) — 36 px.
  // Measured while building 0085 and confirmed by its acceptance 2026-09-07.
  const PADDING = 36;
  const floor = (width: string | undefined): number => {
    if (!width) return 0;
    const min = /minmax\(\s*(\d+)px/.exec(width);
    if (min?.[1]) return Number(min[1]);
    const px = /^(\d+)px$/.exec(width.trim());
    return px?.[1] ? Number(px[1]) : 0;
  };
  const tracks = columns.reduce((sum, c) => sum + floor(c.width), 0);
  return tracks + GUTTER * Math.max(0, columns.length - 1) + PADDING;
}

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
interface RowActionBase {
  label: string;
  icon?: ReactNode;
  tone?: "danger";
  /** Stays visible when the rest moves into the menu (E8). */
  primary?: boolean;
}

/**
 * One action on one row — **exactly one of three shapes**, and the type says
 * so instead of a comment.
 *
 * Until 2026-09-08 this was one interface with four independent optional
 * fields, and both the spec and the comment beside it claimed an exclusion
 * that did not exist: `{href, ask, action}` and `{confirm, ask}` compiled
 * fine, and at run time one half was silently dropped. The acceptance of 0122
 * proved it with a type probe.
 *
 * - **A jump.** `href`, and nothing else — a jump asks nothing and confirms
 *   nothing.
 * - **An action that asks first** (0121/0122). `ask` **is** the confirmation
 *   dialog, so it carries `title`, `confirmLabel` and `tone` itself; `action`
 *   gets what it asked for and is therefore required — `ask` without `action`
 *   was a silent no-op.
 * - **An action that just runs**, with an optional confirmation.
 */
export type RowAction<Input = void> = RowActionBase &
  (
    | { href: string; action?: never; ask?: never; confirm?: never }
    | {
        /** Gets what `ask` asked for. */
        action: (input: Input) => Promise<ActionResult>;
        ask: AskSpec<Input>;
        href?: never;
        confirm?: never;
      }
    | {
        action: () => Promise<ActionResult>;
        confirm?: ConfirmSpec;
        href?: never;
        ask?: never;
      }
  );

/**
 * A list of row actions where each may ask for something different — the same
 * gap as `AnyBulkAction`: TypeScript has no existential type, so the list
 * position cannot say „some `Input`, one per entry".
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyRowAction = RowAction<any>;

/**
 * Types one row action. Without it the caller annotates `input` by hand and
 * nothing checks that `ask.initial` and `action`'s parameter are the same
 * thing — **name the type**: `rowAction<string>({…})`, because a full
 * `AskSpec` puts `Input` in a contravariant position and inference lands on
 * `unknown`.
 *
 * @when    Building `rowActions` where an action asks something first.
 * @instead An action that just runs, or a jump → the plain object literal.
 */
export function rowAction<Input>(action: RowAction<Input>): AnyRowAction {
  return action;
}

export type { AnyBulkAction, BulkAction };

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
  /**
   * The width below which the table scrolls instead of squeezing.
   *
   * **An override, not a duty** (0147). Without it the table computes the
   * floor from its own column widths; `0` switches it off for a table that
   * *should* squeeze. It used to be a plain prop, and the one page that forgot
   * it lost two columns off the right edge without a scrollbar — a prop you
   * can forget is a bug waiting for its caller (finding L-273).
   */
  minWidth?: number;
  /** The last column, always visible (V14): ≤ 2 inline, ≥ 3 primary plus menu. */
  rowActions?: (row: T) => AnyRowAction[];
  /**
   * A class for **one** row — for a state that belongs to the whole line and
   * not to a cell: a draft that is dimmed, a row that is struck through.
   *
   * It is not a way in through the back door for colour: `V6` still holds,
   * and a state that means something gets its word in a cell. What this is
   * for is the **weight** of a row against its neighbours — measured, the
   * „only in Ludwig" line was indistinguishable from a posted one because
   * that difference had nowhere to go (acceptance of 0063).
   */
  rowClassName?: (row: T) => string | undefined;
  /** The state out of the URL; the active column carries the arrow, and the link says the state in words. */
  sort?: { key: string; dir: "asc" | "desc" };
  /**
   * The page builds the URL. Required as soon as `sort` or `pager` is set —
   * without it a sortable head stays a plain word and no pager is rendered.
   */
  href?: (patch: ListPatch) => string;
  /** Selection column, head box, bar in zone 1 (I5). */
  selection?: {
    actions: AnyBulkAction[];
    /** The text of the checkbox; without it the row key stands there. */
    label?: (row: T) => string;
    /**
     * The bar stays in view while the list scrolls (F202).
     *
     * For lists that are worked through in one go — whoever ticks twenty rows
     * is at the bottom when the last one is set, and the button that releases
     * them all is then out of sight. Off by default: above five rows a sticky
     * bar sticks to nothing.
     */
    sticky?: boolean;
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
/** Zone 5 — the four numbers are `PageResult` without its `items`. */
export interface TablePager {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  pageSizeOptions?: number[];
}

/**
 * One named section of a grouped table (0149).
 *
 * The caller hands over rows that are **already sorted** and figures that are
 * **already computed** — the table neither sorts nor counts (E2).
 */
export interface TableGroup<T> {
  /** Stable key — also the key of the section. */
  key: string;
  /** The word in the head. Normal case, like a column head (A2). */
  label: string;
  /** Beside the word: what the classification means (Z4). */
  labelAside?: ReactNode;
  rows: readonly T[];
  /** To the right in the head: a count, a sum — whatever the caller shows. */
  aside?: ReactNode;
  /**
   * What stands there when `rows` is empty.
   *
   * Without it an empty section **is not rendered at all**: a heading over
   * nothing is noise. With it the emptiness is the statement — a section that
   * says no line of its kind is in this batch is worth a line.
   */
  emptyHint?: string;
}

/**
 * The two shapes of one table, and with them the two exclusions that used to
 * live in a sentence.
 *
 * **`rows` and `groups` are the discriminant** — one of the two is always
 * there, and whichever it is decides the rest: a flat list may be paged, a
 * grouped one may not. A section that runs over two pages is not a section
 * any more, and an exclusion that only stands in a comment is broken by the
 * first caller who does not read it (the lesson from 0121/0122 and 0136).
 *
 * Measured while building 0149: the exclusion has to be carried by a
 * **required** prop. Written as an optional `groups?: never` in the flat
 * branch it becomes a discriminant that no caller sets, and TypeScript then
 * refuses the `{...(expand ? { expand } : {})}` spread that thirteen list
 * pages are built on — the branch it picks is always the wrong one.
 */
type DataTableShape<T> =
  | {
      /** The rows of **this page**, already sorted and filtered. */
      rows: T[];
      /** Zone 5 — the page split into pages. */
      pager?: TablePager;
      groups?: never;
    }
  | {
      /** Named sections instead of a flat list; each brings its own rows. */
      groups: readonly TableGroup<T>[];
      rows?: never;
      pager?: never;
    };

export type DataTableProps<T> = DataTableBase<T> &
  (
    | { rowHref?: (row: T) => string; expand?: never }
    | { expand: (row: T) => ReactNode; rowHref?: never }
  ) &
  DataTableShape<T>;

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
    groups,
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
    // `expand` is read here; `rowHref` is **not** — `bodyRow` takes that from
    // `props` itself, and here it stood twice and unused (0096 A3, found by
    // `noUnusedLocals`).
    expand,
  } = props as DataTableBase<T> & {
    expand?: (row: T) => ReactNode;
    rows?: T[];
    pager?: TablePager;
    groups?: readonly TableGroup<T>[];
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
  //
  // The actions track is fixed for the same reason. It was `max-content`, and
  // measured at 700 px the head resolved it to 54,2 px („Aktionen") while the
  // row resolved it to 176,4 px (two buttons) — 122 px apart. A caller whose
  // actions are wider raises `--v2-tbl-actions` on the table.
  const cols = [
    selection ? PICK : null,
    expand ? PICK : null,
    ...columns.map((c) => c.width ?? "minmax(0, 1fr)"),
    rowActions ? "var(--v2-tbl-actions)" : null,
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

  // Sections or a flat list — from here on the rest of the card does not care
  // which of the two it got. `all` is the page in **reading order**, and that
  // is what the selection has to be counted and shift-clicked in.
  const all = rows ?? groups?.flatMap((g) => [...g.rows]) ?? [];

  // The four states that stand **instead** of rows, in the one body that the
  // column head lives in — a state is not a section, and „lädt" split over
  // five headings would be five statements about one wait.
  const state = loading ? (
    <TableLoading
      rows={5}
      cols={columns.length}
      leadingCols={(selection ? 1 : 0) + (expand ? 1 : 0)}
      trailingCols={rowActions ? 1 : 0}
    />
  ) : error ? (
    <ErrorRow message={error.message} action={error.retry} />
  ) : all.length > 0 ? null : filtered ? (
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

  const body = state ?? (groups ? null : rows?.map((row) => bodyRow(row, props)));

  // A section without rows **is not rendered** — a heading over nothing is
  // noise. Unless the caller says what its emptiness means: that no line of
  // this kind is in the batch is a statement, and then the heading carries it.
  const sections =
    groups && !state
      ? groups
          .filter((g) => g.rows.length > 0 || g.emptyHint)
          .map((g) => ({ key: g.key, children: section(g, props) }))
      : undefined;

  // Zone 5 only stands under rows: a pager under „nothing here" would be a
  // second statement about the same emptiness.
  const showPager = !loading && !error && all.length > 0 && pager && href;

  const card = (
    <Card>
      <CardHead
        title={head.title}
        sub={head.sub}
        {...(selection?.sticky ? { sticky: true } : {})}
        icon={head.icon}
        meta={head.meta}
        actions={
          selection ? (
            <SelectionScopeBar
              actions={selection.actions}
              fallback={head.actions}
              {...(selection.sticky ? { sticky: true } : {})}
            />
          ) : (
            head.actions
          )
        }
      />
      <Table
        cols={cols}
        minWidth={minWidth ?? columnsMinWidth(columns)}
        density={density}
        {...(sections ? { sections } : {})}
      >
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
    <SelectionScope key={pager?.page ?? 0} order={all.map(rowKey)}>
      {card}
    </SelectionScope>
  );
}

/**
 * One section: its heading, then its rows (0149).
 *
 * The heading is a **row of its own over the full width**, not bold type in
 * column one — and it carries what belongs to the section as a whole: the
 * word, what the word means (`labelAside`, Z4), the figure the caller already
 * computed (`aside`, E2) and, where the table can be picked from, the box for
 * exactly these rows.
 */
function section<T>(group: TableGroup<T>, props: DataTableProps<T>): ReactNode {
  const { rowKey, selection } = props;
  return (
    <>
      <GroupRow
        {...(selection
          ? {
              select: (
                <SelectGroupCell
                  rowKeys={group.rows.map(rowKey)}
                  // The section names itself — „Alle auswählen" would be the
                  // head box, and there are five of these on one page (T3).
                  label={`${group.label} auswählen`}
                />
              ),
            }
          : {})}
      >
        <span className="v2tbl__grouplabel">
          {group.label}
          {group.labelAside ? (
            <span className="v2tbl__groupnote">{group.labelAside}</span>
          ) : null}
        </span>
        {group.aside ? <span className="v2tbl__groupaside">{group.aside}</span> : null}
      </GroupRow>
      {group.rows.length > 0 ? (
        group.rows.map((row) => bodyRow(row, props))
      ) : (
        <EmptyRow>
          <span className="v2muted">{group.emptyHint}</span>
        </EmptyRow>
      )}
    </>
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
  // **The gap belongs to the head, not to five column sets.** `headerAside` is
  // an (i) beside a word, and beside means 4 px. Rendered as bare siblings the
  // distance was measured **0,0 px** — in `BankTransactionRow`, `DataTable`
  // and `CaseRow` alike, five column sets in total (acceptance 0101). The
  // column sets that wrapped their head in `.v2sth` by hand had 4,0 px; the
  // rest looked like a typo. So the head carries the rule.
  const head = col.headerAside ? (
    <span className="v2sth">
      {col.header}
      {col.headerAside}
    </span>
  ) : (
    col.header
  );
  if (!col.sortable || !href) {
    return (
      <th key={col.key} scope="col" className={cls}>
        {head}
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
      {/* The same 4 px as above, and the link stays a link: `headerAside` is a
          sibling of the anchor, not inside it — a button inside an `<a>` is
          invalid HTML (0094 b). */}
      <span className="v2sth">
        <Link
          className="v2sortlink"
          href={href({ sort: col.key, dir: asc ? "desc" : "asc", page: 1 })}
          aria-label={`Nach ${name} sortieren — ${state}`}
        >
          {col.header}
          {active ? <ActionIcon action={asc ? "sort-asc" : "sort-desc"} size={12} /> : null}
        </Link>
        {col.headerAside}
      </span>
    </th>
  );
}

function bodyRow<T>(row: T, props: DataTableProps<T>): ReactNode {
  const { columns, rowKey, rowActions, selection, rowClassName } = props;
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
    <Row key={key} {...(rowClassName?.(row) ? { className: rowClassName(row) } : {})}>
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
function rowActionCells(list: AnyRowAction[]): ReactNode {
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

/**
 * The button of a row action. Its own component because `ask` and `confirm`
 * exclude each other in `ActionButton`'s type: a spread hides which of the two
 * a row carries, so the choice has to be two branches — and two branches in
 * two renderers would be two copies of the same decision.
 */
function RowActionButton({
  action: a,
  size,
  variant,
}: {
  action: AnyRowAction;
  size: "xs" | "sm";
  variant: ButtonVariant;
}) {
  const run = a.action ?? (async () => {});
  return a.ask ? (
    <ActionButton size={size} variant={variant} icon={a.icon} ask={a.ask} action={run}>
      {a.label}
    </ActionButton>
  ) : (
    <ActionButton
      size={size}
      variant={variant}
      icon={a.icon}
      confirm={a.confirm}
      action={() => run(undefined)}
    >
      {a.label}
    </ActionButton>
  );
}

function inlineAction(a: AnyRowAction): ReactNode {
  if (a.href !== undefined) {
    return (
      <Button key={a.label} href={a.href} size="xs" variant="tertiary" icon={a.icon}>
        {a.label}
      </Button>
    );
  }
  return (
    <RowActionButton
      key={a.label}
      action={a}
      size="xs"
      variant={a.tone === "danger" ? "danger" : "tertiary"}
    />
  );
}

function menuAction(a: AnyRowAction): ReactNode {
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
      <RowActionButton action={a} size="sm" variant="tertiary" />
    </span>
  );
}
