import type { ReactNode } from "react";

import type { Currency } from "@/ludwig/shared/money";

import { formatCount } from "../../format";

import { AmountCell, ErrorRow, MonoCell, TableLoading } from "../../primitives/Cells";
import { EmptyState } from "../../primitives/EmptyState";
import { HeadRow, Row, Table, EmptyRow } from "../../primitives/Table";
import { Time } from "../../primitives/Time";
import { EntityIcon } from "../../Icons";
import { StatusBadge } from "../../patterns/StatusBadge";
import { StatusInfoButton } from "../../patterns/StatusInfoButton";
import { columnsMinWidth, type ColumnDef } from "../../patterns/DataTable";
import { Link } from "../../primitives/Link";
import { SourceDocumentRefCell } from "../source-document/SourceDocumentRefCell";
import { TaxKeyCell } from "../journal-entry/TaxKey";
import { AccountCell } from "./Account";

/**
 * The movements of one account in one fiscal year (0067) — one list, DATEV
 * leading.
 *
 * Two exports, and the split is the point (A11): `accountEntryColumns()` is a
 * **function** that returns column definitions, not a wrapper around
 * `DataTable`. The page hands them to `DataTable` (0057) and gets sorting,
 * paging and selection; the drawer renders the same columns in a bare
 * `Table`, because `DataTable` carries its state in the URL and a drawer does
 * not know the routing (0052, A11a).
 *
 * Neither export unions the two sources: the caller delivers the finished,
 * sorted set — all mirror entries except tombstones, plus the Ludwig entries
 * without a `datev_mirror_entry_id`.
 */

/**
 * One movement on an account. Structurally the union of
 * `TruthAccountEntryRow` (DATEV mirror) and `AccountLedgerRow` (Ludwig) in
 * the app; neither of the two carries `origin` today, which is why a
 * canonical `AccountEntry` in `src/ludwig/` is a finding for `ludwig/app`.
 */
export interface AccountEntry {
  id: string;
  /** `posting_date` / `booking_date` — filled in both sources. */
  postingDate: string;
  /** Belegfeld 1 — filled on 100 % of the mirror entries. */
  documentNumber: string | null;
  /** Posting text, p90 31 characters, EXTF limit 60. */
  text: string | null;
  /** The other accounts of the entry. p50 1, p90 2, max 4. */
  contraAccounts: readonly { number: string; name?: string | null }[];
  /** Amount on **this** account. Exactly one of the two is set. */
  debit: number | null;
  credit: number | null;
  origin: AccountEntryOrigin;
  /* — `full` only; unused in the drawer — */
  /** `accounting_sequence_id` — the DATEV batch. */
  batchId?: string | null;
  /** Axis `buchung`, only on Ludwig entries. */
  status?: string | null;
  /** DATEV mark of origin: RE, WK, SV, JA, AN, KS (filled on 47 %). */
  markOfOrigin?: string | null;
  /** Only 2 % of the mirror entries carry one — it lives in the `title`, not in a column. */
  caseNumber?: string | null;
  /** Balance after this movement, within its own source — shown only with `balance`. */
  runningBalance?: number | null;
  /** The counterparty as a second line under the text (hint ll-dev 11). */
  counterparty?: string | null;
  /** Axis `journal_entry_origin` of a Ludwig entry — tells the client's batch from a proposal. */
  entryOrigin?: string | null;
  /** Axis `mirror_match` of a mirror entry — more than „found again or not". */
  mirrorMatch?: string | null;
  /** The linked document (`source_doc_id`, F331) — the column „Beleg" (0211). */
  documentId?: string | null;
  /** The case behind the movement, for `caseHref`; `caseNumber` is its text. */
  caseId?: string | null;
  /** DATEV tax key (BU) as stored — `full` only. */
  taxKey?: string | null;
}

/**
 * Where a movement comes from. The caller derives it, the row shows it.
 *
 * The four classes are exhaustive for what the list may show; tombstones
 * (`match_state LIKE 'disappeared%'`) belong to none of them and are excluded
 * upstream — a re-import can put the same transaction next to its own
 * tombstone, and showing both would be a duplicate.
 */
export type AccountEntryOrigin =
  /** Mirror entry, `match_state ∈ {new_unprocessed, unclear, NULL}` — 98 %. */
  | "datev"
  /** Mirror entry, `match_state LIKE 'matched_%'`. */
  | "mirrored"
  /** Ludwig entry, exported, not found in DATEV — 111 entries on staging. */
  | "exported"
  /** Ludwig entry, neither exported nor mirrored. */
  | "ludwig";

/** What the mark says on hover and to a screen reader. */
const ORIGIN_TITLE: Record<AccountEntryOrigin, string | null> = {
  datev: null,
  mirrored: "Von Ludwig gebucht, in DATEV bestätigt",
  exported: "Von Ludwig exportiert, in DATEV noch nicht wiedergefunden",
  ludwig: "Nur in Ludwig — noch nicht an DATEV übergeben",
};

/**
 * The mark is **not** a status display, so it does not break R1: it says one
 * binary thing — there is a Ludwig entry behind this movement. The set
 * already has a sign for that, `EntityIcon entity="journal-entry"`; nothing new is invented
 * here. The one real chip stands where something actually went wrong, on the
 * exported entries that never arrived.
 */
function OriginMark({ origin }: { origin: AccountEntryOrigin }) {
  const title = ORIGIN_TITLE[origin];
  if (!title) return <span />;
  return (
    <span className="v2ae__mark" title={title} aria-label={title} role="img">
      <EntityIcon entity="journal-entry" size={14} />
    </span>
  );
}

/** Contra accounts: the first one is named, the rest counted. */
function ContraAccounts({
  entry,
  accountHref,
  showName = true,
}: {
  entry: AccountEntry;
  accountHref?: (number: string) => string;
  /** `false` in `compact`: the number alone, the name in the title (0211, measured at 640 px). */
  showName?: boolean;
}) {
  const [first, ...rest] = entry.contraAccounts;
  if (!first) return <span className="v2muted">—</span>;
  // The whole box is clipped by CSS once the track gets narrow (measured 169,5
  // px against 229 px of need at 1280 in the full set), and a clipped value
  // without a way to read it is no value. `AccountCell` only titles the *name*
  // it shortened itself, so the full list belongs on the box.
  const all = entry.contraAccounts.map((a) => `${a.number} ${a.name ?? ""}`.trim()).join(", ");
  return (
    <span className="v2ae__contra" title={all}>
      <AccountCell
        number={first.number}
        name={showName ? first.name : null}
        href={accountHref?.(first.number)}
      />
      {rest.length > 0 ? (
        <span
          className="v2muted"
          title={rest.map((a) => `${a.number} ${a.name ?? ""}`.trim()).join(", ")}
        >
          {" "}
          +{rest.length}
        </span>
      ) : null}
    </span>
  );
}

/** Every column of T2 by key — `include` switches the optional ones on (0211). */
export type AccountEntryColumn =
  | "postingDate"
  | "origin"
  | "status"
  | "mirrorMatch"
  | "documentNumber"
  | "text"
  | "contraAccounts"
  | "debit"
  | "credit"
  | "runningBalance"
  | "taxKey"
  | "case"
  | "batchId"
  | "markOfOrigin";

/**
 * The one order of T2. The state comes early, not last (acceptance 0063): it
 * answers the same question as the origin mark beside it — „do Ludwig and
 * DATEV agree?" — and at the right edge it sat behind the horizontal scroll.
 */
const ORDER: readonly AccountEntryColumn[] = [
  "postingDate",
  "origin",
  "status",
  "mirrorMatch",
  "documentNumber",
  "text",
  "contraAccounts",
  "debit",
  "credit",
  "runningBalance",
  "taxKey",
  "case",
  "batchId",
  "markOfOrigin",
];
const COMPACT: readonly AccountEntryColumn[] = ["postingDate", "origin", "documentNumber", "text", "contraAccounts", "debit", "credit"];
const FULL: readonly AccountEntryColumn[] = [...COMPACT, "status", "taxKey", "case", "batchId", "markOfOrigin"];

export interface AccountEntryColumnOptions {
  currency: Currency;
  /**
   * `compact` = the seven columns the drawer and the fold-outs show.
   * `full` = plus booking state, BU, case, batch and mark of origin, for the page.
   */
  variant?: "compact" | "full";
  /**
   * Columns beyond the form's defaults (owner rule 2026-09-29 via ll-cto: drop
   * no feature the data carries): `case`, `status`,
   * `batchId`, `mirrorMatch` in a drawer or a fold-out that shows them today.
   */
  include?: readonly AccountEntryColumn[];
  /**
   * The contra account's name visible beside its number even in `compact` —
   * where a bare number does not tell the reader what to look at (F255,
   * clearing accounts).
   */
  contraNames?: boolean;
  /** Makes the contra accounts clickable — switching accounts in the drawer. */
  accountHref?: (number: string) => string;
  /**
   * The running balance as the last amount column. Only for **one** source:
   * over both it would mix what is booked with what has not arrived yet
   * (owner 2026-09-04). The page turns it on when its origin filter picks the
   * DATEV side or the Ludwig side alone (0157).
   */
  balance?: boolean;
  /** The way into the document drawer (`?document=`, 0211). */
  documentHref?: (documentId: string) => string;
  /** The way to the case. */
  caseHref?: (caseId: string) => string;
  /** The way to the reference work of the tax keys. */
  taxKeyHref?: (taxKey: string) => string;
}

/**
 * @when    The columns of an account statement — handed to DataTable on the page, rendered by AccountEntryList in the drawer.
 * @instead The lines of a single booking entry → JournalEntryCard. The account itself → AccountFacts. A list of accounts → the chart of accounts columns (0062).
 */
export function accountEntryColumns({
  currency,
  variant = "compact",
  include = [],
  contraNames = false,
  accountHref,
  balance = false,
  documentHref,
  caseHref,
  taxKeyHref,
}: AccountEntryColumnOptions): ColumnDef<AccountEntry>[] {
  const showStatus = variant === "full" || include.includes("status");
  const all: Record<AccountEntryColumn, ColumnDef<AccountEntry>> = {
    postingDate: {
      key: "postingDate",
      header: "Datum",
      width: "84px",
      sortable: true,
      cell: (e) => <Time value={e.postingDate} format="date" />,
    },
    origin: {
      // No header: the mark is a sign, and a column head above it would
      // promise a value the 98 % normal case does not have.
      key: "origin",
      header: "",
      width: "24px",
      cell: (e) => <OriginMark origin={e.origin} />,
    },
    status: {
      key: "status",
      header: "Buchungszustand",
      // 148, not 132: the widest chip of the axis needs 144,3 px in the cell,
      // measured with an unbound clone — at 132 it was clipped at every width.
      width: "148px",
      // What the origin mark cannot tell apart: a proposal, a released entry,
      // the client's own batch (hint ll-dev 2026-09-29).
      cell: (e) =>
        e.origin === "exported" ? (
          <StatusBadge axis="journal_entry_datev_stage" status="exported" info={false} />
        ) : e.entryOrigin === "client_import" ? (
          <StatusBadge axis="journal_entry_origin" status="client_import" info={false} />
        ) : e.status ? (
          <StatusBadge axis="journal_entry" status={e.status} info={false} />
        ) : (
          <span className="v2muted">—</span>
        ),
    },
    mirrorMatch: {
      key: "mirrorMatch",
      header: "DATEV-Abgleich",
      headerAside: <StatusInfoButton axis="mirror_match" />,
      width: "150px",
      cell: (e) => (e.mirrorMatch ? <StatusBadge axis="mirror_match" status={e.mirrorMatch} info={false} /> : <span className="v2muted">—</span>),
    },
    documentNumber: {
      key: "documentNumber",
      header: "Beleg",
      width: variant === "compact" ? "88px" : "112px",
      // The one document cell of every booking table (0211): number, and
      // whether a document hangs behind it.
      cell: (e) => (
        <SourceDocumentRefCell
          number={e.documentNumber}
          documentId={e.documentId ?? null}
          variant={variant}
          {...(documentHref ? { documentHref } : {})}
        />
      ),
    },
    text: {
      key: "text",
      header: "Buchungstext",
      width: "minmax(100px, 1.6fr)",
      cell: (e) => (
        <span className="v2ae__text" title={e.text ?? undefined}>
          <span className="v2ae__textline">{e.text ?? <span className="v2muted">—</span>}</span>
          {/* Without a state column, 111 of 42.153 entries do not earn one for
              everybody — the chip rides along here. */}
          {!showStatus && e.origin === "exported" ? (
            <>
              {" "}
              <StatusBadge axis="journal_entry_datev_stage" status="exported" info={false} />
            </>
          ) : null}
          {e.counterparty ? <span className="v2sub v2ae__who">{e.counterparty}</span> : null}
        </span>
      ),
    },
    contraAccounts: {
      key: "contraAccounts",
      header: "Gegenkonto",
      // Compact: the number alone in a fixed track — at 640 px the text kept 83 px
      // next to a name nobody could read (0211). `contraNames` brings it back.
      width: variant === "compact" && !contraNames ? "minmax(56px, 0.6fr)" : "minmax(120px, 1.1fr)",
      cell: (e) => <ContraAccounts entry={e} accountHref={accountHref} showName={variant !== "compact" || contraNames} />,
    },
    debit: {
      key: "debit",
      header: "Soll",
      width: "96px",
      align: "end",
      sortable: true,
      // Empty stays empty: which side a movement is on is told by *which*
      // column carries the number. An em dash in the other one would claim
      // the value is unknown (`AmountCell`'s meaning for `null`).
      cell: (e) => (e.debit === null ? null : <AmountCell value={e.debit} currency={currency} />),
    },
    credit: {
      key: "credit",
      header: "Haben",
      width: "96px",
      align: "end",
      sortable: true,
      cell: (e) => (e.credit === null ? null : <AmountCell value={e.credit} currency={currency} />),
    },
    runningBalance: {
      key: "runningBalance",
      header: "Saldo",
      width: "112px",
      align: "end",
      cell: (e) => (e.runningBalance == null ? null : <AmountCell value={e.runningBalance} currency={currency} />),
    },
    taxKey: {
      key: "taxKey",
      header: "BU",
      width: "56px",
      cell: (e) => <TaxKeyCell taxKey={e.taxKey ?? null} {...(taxKeyHref ? { taxKeyHref } : {})} />,
    },
    case: {
      key: "case",
      header: "Sachverhalt",
      width: "112px",
      cell: (e) =>
        !e.caseNumber ? (
          <span className="v2muted">—</span>
        ) : caseHref && e.caseId ? (
          <Link href={caseHref(e.caseId)} className="v3cell-link v2mono">
            {e.caseNumber}
          </Link>
        ) : (
          <MonoCell value={e.caseNumber} />
        ),
    },
    batchId: {
      key: "batchId",
      header: "Stapel",
      width: "88px",
      cell: (e) => <MonoCell value={e.batchId ?? null} />,
    },
    markOfOrigin: {
      key: "markOfOrigin",
      header: "DATEV",
      width: "64px",
      cell: (e) => <MonoCell value={e.markOfOrigin ?? null} tone="muted" />,
    },
  };
  const picked = new Set<AccountEntryColumn>([...(variant === "compact" ? COMPACT : FULL), ...include]);
  if (balance) picked.add("runningBalance");
  return ORDER.filter((k) => picked.has(k)).map((k) => all[k]);
}

/**
 * Grid track list out of the column definitions — same order, same widths.
 *
 * `minmax(0, 1fr)`, not `1fr`: a bare `1fr` is `minmax(auto, 1fr)`, and `auto`
 * is the min-content width of the cell — head and rows are separate grids, so
 * each would size the track itself and the columns drift apart (found in 0101).
 */
function trackList(columns: ColumnDef<AccountEntry>[]): string {
  return columns.map((c) => c.width ?? "minmax(0, 1fr)").join(" ");
}

/**
 * @when    The movements of one account in a drawer or a card — one list, newest first, loaded in pages.
 * @instead A list page with sorting, selection and a URL pager → DataTable with accountEntryColumns(). The lines of one entry → JournalEntryCard.
 */
export function AccountEntryList({
  entries,
  currency,
  total,
  more,
  accountHref,
  documentHref,
  caseHref,
  entryHref,
  include,
  contraNames,
  balance,
  totals,
  loading,
  error,
  empty,
}: {
  /** The movements of **one** year, newest first — the list does not sort. */
  entries: readonly AccountEntry[];
  currency: Currency;
  /** Stock counter: „25 von 2.937". Without it `entries.length` stands. */
  total?: number;
  /**
   * „Mehr laden" — the caller's element, because the button carries a click
   * handler and this list stays a server component. The stock counter next to
   * it is written here, so every caller words it the same way.
   */
  more?: ReactNode;
  accountHref?: (number: string) => string;
  documentHref?: (documentId: string) => string;
  caseHref?: (caseId: string) => string;
  /** Columns beyond the compact defaults — `case`, `status`, `batchId`, `mirrorMatch`. */
  include?: AccountEntryColumnOptions["include"];
  /** The contra account's name visible, not only in the title (F255). */
  contraNames?: boolean;
  /** The running balance column — for one source only (0157). */
  balance?: boolean;
  /** The whole row leads into the entry — its drawer (`?entry=`). */
  entryHref?: (entry: AccountEntry) => string | undefined;
  /**
   * The totals row: debit and credit (and the closing balance where the list
   * shows `balance`). The caller sums over the **whole** stock, not over the
   * rows loaded so far (E2) — a fold-out of twelve rows and a drawer of 2.937
   * say the same thing.
   */
  totals?: { debit: number; credit: number; balance?: number | null };
  loading?: boolean;
  error?: { message: string; retry?: ReactNode };
  /**
   * Empty text. The default stays year-free („Keine Bewegungen.") because the
   * list is not told the year; whoever knows it names it — the drawer does.
   */
  empty?: { title: string; description?: ReactNode };
}) {
  const columns = accountEntryColumns({
    currency,
    variant: "compact",
    ...(accountHref ? { accountHref } : {}),
    ...(documentHref ? { documentHref } : {}),
    ...(caseHref ? { caseHref } : {}),
    ...(include ? { include } : {}),
    ...(contraNames ? { contraNames } : {}),
    ...(balance ? { balance } : {}),
  });
  const cols = trackList(columns);
  const stock = total ?? entries.length;

  return (
    <div className="v2ae">
      {/* The floor from the tracks — a fixed 620 left text and contra 0 px once
          `include` added columns (acceptance 0211, M2). */}
      <Table cols={cols} minWidth={columnsMinWidth(columns)} density="compact">
        <HeadRow>
          {columns.map((c) => (
            <span key={c.key} className={c.align === "end" ? "v2num" : undefined}>
              {c.header}
            </span>
          ))}
        </HeadRow>
        {loading ? (
          <TableLoading rows={6} cols={columns.length} />
        ) : error ? (
          <ErrorRow message={error.message} action={error.retry} />
        ) : entries.length === 0 ? (
          <EmptyRow>
            <EmptyState
              inline
            // The list does not know the year, so the default must not claim
            // „never" — the caller who knows it says so (the drawer does).
              title={empty?.title ?? "Keine Bewegungen."}
              description={empty?.description}
            />
          </EmptyRow>
        ) : (
          entries.map((entry) => (
            <Row
              key={entry.id}
              // Only „nur in Ludwig" is dimmed: it has not reached DATEV yet,
              // so it ranks below what has. Hierarchy, not criticality (A7).
              className={entry.origin === "ludwig" ? "v2ae__row--draft" : undefined}
              {...(entryHref?.(entry) ? { href: entryHref(entry)! } : {})}
            >
              {columns.map((c) => (
                <span key={c.key} className={c.align === "end" ? "v2num" : undefined}>
                  {c.cell(entry)}
                </span>
              ))}
            </Row>
          ))
        )}
        {totals && !loading && !error && entries.length > 0 ? (
          <Row className="v2tbl__totals">
            {columns.map((c, i) => (
              <span key={c.key} className={c.align === "end" ? "v2num" : undefined}>
                {c.key === "debit" ? (
                  <AmountCell value={totals.debit} currency={currency} />
                ) : c.key === "credit" ? (
                  <AmountCell value={totals.credit} currency={currency} />
                ) : c.key === "runningBalance" && totals.balance != null ? (
                  <AmountCell value={totals.balance} currency={currency} />
                ) : i === 0 ? (
                  "Summe"
                ) : null}
              </span>
            ))}
          </Row>
        ) : null}
      </Table>
      {!loading && !error && entries.length > 0 && stock > entries.length ? (
        <div className="v2ae__more">
          {more}
          <span className="v2sub">
            {formatCount(entries.length)} von {formatCount(stock)} Bewegungen
          </span>
        </div>
      ) : null}
    </div>
  );
}
