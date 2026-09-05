import type { ReactNode } from "react";

import type { Currency } from "@/ludwig/shared/money";

import { AmountCell, ErrorRow, MonoCell, TableLoading } from "../../primitives/Cells";
import { EmptyState } from "../../primitives/EmptyState";
import { HeadRow, Row, Table } from "../../primitives/Table";
import { Time } from "../../primitives/Time";
import { EntityIcon } from "../../Icons";
import { StatusBadge } from "../../patterns/StatusBadge";
import type { ColumnDef } from "../../patterns/DataTable";
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
}: {
  entry: AccountEntry;
  accountHref?: (number: string) => string;
}) {
  const [first, ...rest] = entry.contraAccounts;
  if (!first) return <span className="v2muted">—</span>;
  return (
    <span className="v2ae__contra">
      <AccountCell
        number={first.number}
        name={first.name}
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

export interface AccountEntryColumnOptions {
  currency: Currency;
  /**
   * `compact` = ranks 1–6, the seven columns the drawer shows.
   * `full` = plus batch, booking state and mark of origin, for the page.
   */
  variant?: "compact" | "full";
  /** Makes the contra accounts clickable — switching accounts in the drawer. */
  accountHref?: (number: string) => string;
}

/**
 * @when    The columns of an account statement — handed to DataTable on the page, rendered by AccountEntryList in the drawer.
 * @instead The lines of a single booking entry → JournalEntryCard. The account itself → AccountFacts. A list of accounts → the chart of accounts columns (0062).
 */
export function accountEntryColumns({
  currency,
  variant = "compact",
  accountHref,
}: AccountEntryColumnOptions): ColumnDef<AccountEntry>[] {
  const columns: ColumnDef<AccountEntry>[] = [
    {
      key: "postingDate",
      header: "Datum",
      width: "84px",
      sortable: true,
      cell: (e) => <Time value={e.postingDate} format="date" />,
    },
    {
      // No header: the mark is a sign, and a column head above it would
      // promise a value the 98 % normal case does not have.
      key: "origin",
      header: "",
      width: "24px",
      cell: (e) => <OriginMark origin={e.origin} />,
    },
    {
      key: "documentNumber",
      header: "Beleg",
      width: "96px",
      cell: (e) => (
        <MonoCell
          value={e.documentNumber}
          title={e.caseNumber ? `Sachverhalt ${e.caseNumber}` : undefined}
        />
      ),
    },
    {
      key: "text",
      header: "Buchungstext",
      width: "minmax(0, 1.6fr)",
      cell: (e) => (
        <span className="v2ae__text" title={e.text ?? undefined}>
          <span className="v2ae__textline">{e.text ?? <span className="v2muted">—</span>}</span>
          {/* In `compact` there is no state column, and 111 of 42.153 entries
              do not earn one for everybody — the chip rides along here. */}
          {variant === "compact" && e.origin === "exported" ? (
            <>
              {" "}
              <StatusBadge axis="buchung_datev" status="exported" info={false} />
            </>
          ) : null}
        </span>
      ),
    },
    {
      key: "contraAccounts",
      header: "Gegenkonto",
      width: "minmax(0, 1.1fr)",
      cell: (e) => <ContraAccounts entry={e} accountHref={accountHref} />,
    },
    {
      key: "debit",
      header: "Soll",
      width: "104px",
      align: "end",
      sortable: true,
      // Empty stays empty: which side a movement is on is told by *which*
      // column carries the number. An em dash in the other one would claim
      // the value is unknown (`AmountCell`'s meaning for `null`).
      cell: (e) => (e.debit === null ? null : <AmountCell value={e.debit} currency={currency} />),
    },
    {
      key: "credit",
      header: "Haben",
      width: "104px",
      align: "end",
      sortable: true,
      cell: (e) => (e.credit === null ? null : <AmountCell value={e.credit} currency={currency} />),
    },
  ];

  if (variant === "compact") return columns;

  return [
    ...columns,
    {
      key: "batchId",
      header: "Stapel",
      width: "88px",
      cell: (e) => <MonoCell value={e.batchId ?? null} />,
    },
    {
      key: "status",
      header: "Buchungszustand",
      width: "132px",
      cell: (e) =>
        e.origin === "exported" ? (
          <StatusBadge axis="buchung_datev" status="exported" info={false} />
        ) : e.status ? (
          <StatusBadge axis="buchung" status={e.status} info={false} />
        ) : (
          <span className="v2muted">—</span>
        ),
    },
    {
      key: "markOfOrigin",
      header: "DATEV",
      width: "64px",
      cell: (e) => <MonoCell value={e.markOfOrigin ?? null} tone="muted" />,
    },
  ];
}

/** Grid track list out of the column definitions — same order, same widths. */
function trackList(columns: ColumnDef<AccountEntry>[]): string {
  return columns.map((c) => c.width ?? "1fr").join(" ");
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
  loading?: boolean;
  error?: { message: string; retry?: ReactNode };
  /**
   * Empty text. The default stays year-free („Keine Bewegungen.") because the
   * list is not told the year; whoever knows it names it — the drawer does.
   */
  empty?: { title: string; description?: ReactNode };
}) {
  const columns = accountEntryColumns({ currency, variant: "compact", accountHref });
  const cols = trackList(columns);
  const stock = total ?? entries.length;

  return (
    <div className="v2ae">
      <Table cols={cols} minWidth={620} density="compact">
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
          <EmptyState
            inline
            // The list does not know the year, so the default must not claim
            // „never" — the caller who knows it says so (the drawer does).
            title={empty?.title ?? "Keine Bewegungen."}
            description={empty?.description}
          />
        ) : (
          entries.map((entry) => (
            <Row
              key={entry.id}
              // Only „nur in Ludwig" is dimmed: it has not reached DATEV yet,
              // so it ranks below what has. Hierarchy, not criticality (A7).
              className={entry.origin === "ludwig" ? "v2ae__row--draft" : undefined}
            >
              {columns.map((c) => (
                <span key={c.key} className={c.align === "end" ? "v2num" : undefined}>
                  {c.cell(entry)}
                </span>
              ))}
            </Row>
          ))
        )}
      </Table>
      {!loading && !error && entries.length > 0 && stock > entries.length ? (
        <div className="v2ae__more">
          {more}
          <span className="v2sub">
            {entries.length.toLocaleString("de-DE")} von {stock.toLocaleString("de-DE")} Bewegungen
          </span>
        </div>
      ) : null}
    </div>
  );
}
