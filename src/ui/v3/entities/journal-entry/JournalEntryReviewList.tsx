import type { ReactNode } from "react";

import type { Currency } from "@/ludwig/shared/money";

import { formatTime } from "../../format";
import type { ConfidenceLevel } from "../../patterns/Confidence";
import {
  DataTable,
  type AnyBulkAction,
  type AnyRowAction,
  type ColumnDef,
  type TableGroup,
} from "../../patterns/DataTable";
import { StatusHeader } from "../../patterns/StatusHeader";
import { Badge } from "../../primitives/Badge";
import { Link } from "../../primitives/Link";
import { AmountCell } from "../../primitives/Cells";
import { Time } from "../../primitives/Time";
import { SourceDocumentRefCell } from "../source-document/SourceDocumentRefCell";
import { AiBookingNotesCell, type JudgeVerdict } from "./AiBookingNotes";
import { JournalEntryCell, type JournalLine } from "./JournalEntryCompact";
import type { EntryAccount } from "./journal-entry-columns";
import { TaxKeyCell } from "./TaxKey";

/**
 * T3 · proposals to review — one case with its proposal per row (0164, brief
 * F334). The third of the booking tables next to T1 (entries of a stock) and
 * T2 (movements of an account): here the reader decides, so the row carries
 * the judge's verdict and the reasons it is in this tab, the fold-out the
 * proposal and its rationale, and the selection the bulk release.
 *
 * **Computes nothing** (E2): order, groups, reasons and actions come from the
 * app. Not built yet (0164 Ausbau): sorting by attention (L-295) and the diff
 * of an edited proposal (B3 `DiffView`).
 */

export interface ProposalRow {
  /** The case — also the selection key. */
  id: string;
  /** The stable number of the case in this batch („Nr."). */
  number: string;
  /** Booking date of the proposal. */
  date: string | null;
  /** The counterparty; the case title stands in where there is none. */
  counterparty: string | null;
  title: string;
  /** A counterparty never booked before — worth a second look. */
  firstTime?: boolean;
  /**
   * `null` = the case has no entry yet („kein Satz"). The first account of a
   * side is its **main account** — the one with the highest sum; the app
   * orders, the list shows the first and counts the rest (owner 2026-10-01).
   */
  accounts: { debit: readonly EntryAccount[]; credit: readonly EntryAccount[]; lineCount?: number } | null;
  amount: number | null;
  currency: Currency;
  taxKey?: string | null;
  /** Belegfeld 1 and the linked document (`source_doc_id`) — the document cell of 0211. */
  documentNumber?: string | null;
  documentId?: string | null;
  verdict?: JudgeVerdict | null;
  confidence?: ConfidenceLevel | null;
  /** The word of the entry kind — from the app's registry; only in the flat view. */
  kindLabel?: string | null;
  /** Why the case is in this tab (axis `review_tab`), the first two reasons. */
  reasons: readonly string[];
  /** Released or rejected already — the reasons give way to „entschieden". */
  decided?: boolean;
}

export type ProposalColumn =
  | "number"
  | "date"
  | "counterparty"
  | "accounts"
  | "debit"
  | "debitName"
  | "credit"
  | "creditName"
  | "amount"
  | "taxKey"
  | "document"
  | "review"
  | "kind"
  | "reasons";

/**
 * No document column by default (owner 2026-09-21, step 3): the list has to fit
 * a laptop with the sidebar open, and the document stands in the fold-out. No
 * „Nr." either (owner 2026-10-01: it tells the reader nothing, the date is
 * enough, and Soll and Haben need the room). Both exist for a frame that wants
 * them — pass them in `include`.
 */
const FULL: readonly ProposalColumn[] = ["number", "date", "counterparty", "debit", "debitName", "credit", "creditName", "amount", "taxKey", "document", "review", "kind", "reasons"];
const NAMES: readonly ProposalColumn[] = ["debitName", "creditName"];
const COMPACT: readonly ProposalColumn[] = ["date", "counterparty", "accounts", "amount", "document", "review"];
const OPTIONAL: readonly ProposalColumn[] = ["number", "document"];

export interface ProposalColumnOptions {
  variant?: "compact" | "full";
  /** Columns that say nothing in this frame — the kind inside a group by kind. */
  without?: readonly ProposalColumn[];
  /** Optional columns this frame has room for — `number` and `document`. */
  include?: readonly ProposalColumn[];
  /**
   * The account names in their own columns beside Soll and Haben — on by
   * default in `full` (hint ll-dev 2026-09-29, owner rule „drop no feature the
   * data carries"; own columns owner 2026-10-01). `false` for a frame that must
   * stay narrow: the numbers alone, the names in the title.
   */
  accountNames?: boolean;
  accountHref?: (accountNumber: string) => string;
  documentHref?: (documentId: string) => string;
  taxKeyHref?: (taxKey: string) => string;
}

/** Every account of a side, for the title — the cell shows the main one. */
const sideTitle = (accounts: readonly EntryAccount[]) => accounts.map((a) => `${a.number} ${a.name ?? ""}`.trim()).join(", ");

/** „+2 weitere" — the accounts after the main one; nothing when there are none. */
function More({ accounts }: { accounts: readonly EntryAccount[] }) {
  return accounts.length > 1 ? <span className="v2sub">+{accounts.length - 1} weitere</span> : null;
}

/**
 * The main account's number (owner 2026-10-01): one account per side, mono in a
 * narrow column of its own, so the numbers stand under each other and never
 * wrap with the name. Without the name columns the rest is counted here.
 */
function SideNumber({
  accounts,
  accountHref,
  withMore,
}: {
  accounts: readonly EntryAccount[];
  accountHref?: ((n: string) => string) | undefined;
  withMore: boolean;
}) {
  const main = accounts[0];
  if (!main) return <span className="v2muted">—</span>;
  const number = accountHref ? (
    <Link className="v3cell-link v2mono" href={accountHref(main.number)}>
      {main.number}
    </Link>
  ) : (
    <span className="v2mono">{main.number}</span>
  );
  return (
    <span className="v3prop__who" title={sideTitle(accounts)}>
      {number}
      {withMore ? <More accounts={accounts} /> : null}
    </span>
  );
}

/** The main account's name — it wraps; the rest is counted below it. */
function SideName({ accounts, note }: { accounts: readonly EntryAccount[]; note?: ReactNode }) {
  const main = accounts[0];
  if (!main) return null;
  return (
    <span className="v3prop__who" title={sideTitle(accounts)}>
      <span className="v3prop__acc">{main.name ?? "—"}</span>
      <More accounts={accounts} />
      {note}
    </span>
  );
}

/**
 * „3 Zeilen" only where the accounts do not already say it — a side can carry
 * one account on several lines. Where „+n weitere" stands, it would say the
 * same twice.
 */
function hiddenLines(a: NonNullable<ProposalRow["accounts"]>): ReactNode {
  return a.lineCount && a.lineCount > a.debit.length + a.credit.length ? <span className="v2sub">{a.lineCount} Zeilen</span> : null;
}

/**
 * @when    The proposals of a batch or a period are reviewed — verdict,
 *          reasons, bulk release; as columns for a `DataTable` of one's own.
 * @instead The ready list with fold-out and selection → JournalEntryReviewList.
 *          The entries of a stock without a decision → journalEntryColumns.
 */
export function proposalReviewColumns(options: ProposalColumnOptions = {}): ColumnDef<ProposalRow>[] {
  const { variant = "full", without = [], include = [], accountNames = variant === "full", accountHref, documentHref, taxKeyHref } = options;
  const all: Record<ProposalColumn, ColumnDef<ProposalRow>> = {
    number: { key: "number", header: "Nr.", width: "44px", align: "end", cell: (p) => p.number },
    date: {
      key: "date",
      header: "Datum",
      // The date at `size="sm"` measures 72 px (owner 2026-10-01: room for Soll and Haben apart).
      width: "76px",
      cell: (p) => (p.date ? <Time value={p.date} format="date" size="sm" /> : <span className="v2muted">—</span>),
    },
    counterparty: {
      key: "counterparty",
      header: "Gegenpartei",
      // 120 + up to three lines: „Deutsche Telekom Geschäftskunden GmbH" stands
      // whole, as in step 3 before (review F340); Soll/Haben give way — their
      // names wrap anyway.
      width: "minmax(120px, 1.4fr)",
      cell: (p) => (
        <span className="v3prop__who">
          {/* Three lines before the cut — the list step 3 showed up to 40 characters
              and wrapped (review F340, owner rule „drop nothing"). */}
          <span className="v3prop__name" title={p.counterparty ?? p.title}>
            {p.counterparty ?? p.title}
          </span>
          {p.firstTime ? <span className="v2sub">erstmals</span> : null}
        </span>
      ),
    },
    accounts: {
      key: "accounts",
      header: "Konten",
      width: "minmax(120px, 1fr)",
      cell: (p) => {
        if (!p.accounts) return <span className="v2muted">kein Satz</span>;
        const lines: JournalLine[] = [
          ...p.accounts.debit.map((a) => ({ side: "debit" as const, accountNumber: a.number, accountName: a.name ?? null, amount: p.amount ?? 0 })),
          ...p.accounts.credit.map((a) => ({ side: "credit" as const, accountNumber: a.number, accountName: a.name ?? null, amount: p.amount ?? 0 })),
        ];
        return <JournalEntryCell lines={lines} currency={p.currency} showNames={false} showAmount={false} {...(accountHref ? { accountHref } : {})} />;
      },
    },
    // Number and name in columns of their own (owner 2026-10-01): the number
    // mono and fixed — five digits are 37.5 px —, the name beside it wraps.
    // The name heads say nothing to the eye, the „Soll" before them does.
    debit: {
      key: "debit",
      header: "Soll",
      width: accountNames ? "44px" : "minmax(68px, 1fr)",
      cell: (p) =>
        p.accounts ? (
          <span className="v3prop__who">
            <SideNumber accounts={p.accounts.debit} accountHref={accountHref} withMore={!accountNames} />
            {accountNames ? null : hiddenLines(p.accounts)}
          </span>
        ) : accountNames ? null : (
          <span className="v2muted">kein Satz</span>
        ),
    },
    debitName: {
      key: "debitName",
      header: <span className="v2vh">Kontoname Soll</span>,
      width: "minmax(72px, 1fr)",
      cell: (p) =>
        p.accounts ? <SideName accounts={p.accounts.debit} note={hiddenLines(p.accounts)} /> : <span className="v2muted">kein Satz</span>,
    },
    credit: {
      key: "credit",
      header: "Haben",
      width: accountNames ? "44px" : "minmax(68px, 1fr)",
      cell: (p) => (p.accounts ? <SideNumber accounts={p.accounts.credit} accountHref={accountHref} withMore={!accountNames} /> : null),
    },
    creditName: {
      key: "creditName",
      header: <span className="v2vh">Kontoname Haben</span>,
      width: "minmax(72px, 1fr)",
      cell: (p) => (p.accounts ? <SideName accounts={p.accounts.credit} /> : null),
    },
    amount: {
      key: "amount",
      header: "Betrag",
      width: "100px",
      align: "end",
      cell: (p) => <AmountCell value={p.amount} currency={p.currency} />,
    },
    taxKey: {
      key: "taxKey",
      header: "BU",
      // Three digits in mono are 23 px.
      width: "32px",
      cell: (p) => (p.taxKey ? <TaxKeyCell taxKey={p.taxKey} {...(taxKeyHref ? { taxKeyHref } : {})} /> : null),
    },
    document: {
      key: "document",
      header: "Beleg",
      width: variant === "compact" ? "88px" : "104px",
      cell: (p) => (
        <SourceDocumentRefCell
          number={p.documentNumber ?? null}
          documentId={p.documentId ?? null}
          variant={variant}
          {...(documentHref ? { documentHref } : {})}
        />
      ),
    },
    review: {
      key: "review",
      header: "Prüfung durch Ludwig",
      // Dot + longest word („Plausibel") + the verdict's sign — 90 px measured.
      width: "96px",
      cell: (p) => <AiBookingNotesCell verdict={p.verdict ?? null} confidence={p.confidence ?? null} />,
    },
    kind: {
      key: "kind",
      header: "Satzart",
      // The longest word of the registry, „Dauerbuchung", measures 99.7 px as a badge.
      width: "100px",
      cell: (p) => (p.kindLabel ? <Badge tone="neutral">{p.kindLabel}</Badge> : <span className="v2muted">—</span>),
    },
    reasons: {
      key: "reasons",
      header: <StatusHeader axis="review_tab" label="Prüfbedarf" />,
      width: "124px",
      // One line per reason; what does not fit is cut, the title carries it.
      cell: (p) =>
        p.decided ? (
          <span>entschieden</span>
        ) : (
          <span className="v3prop__reasons">
            {p.reasons.slice(0, 2).map((r) => (
              <span key={r} className="v2trunc" title={r}>
                {r}
              </span>
            ))}
          </span>
        ),
    },
  };
  return (variant === "compact" ? COMPACT : FULL)
    .filter((k) => !without.includes(k))
    .filter((k) => accountNames || !NAMES.includes(k))
    .filter((k) => !OPTIONAL.includes(k) || include.includes(k))
    .map((k) => all[k]);
}

type Shape =
  | { rows: readonly ProposalRow[]; groups?: never }
  | { groups: readonly TableGroup<ProposalRow>[]; rows?: never };

/**
 * @when    Reviewing the proposals of a batch: verdict and reasons per row,
 *          the proposal in the fold-out, release one or many.
 * @instead The entries of a stock, nothing to decide → JournalEntryList. One
 *          proposal read whole → the case page.
 */
export function JournalEntryReviewList(
  props: Shape &
    ProposalColumnOptions & {
      head: { title: ReactNode; sub?: ReactNode; actions?: ReactNode };
      /** The fold-out: the proposal, its rationale, the actions — composed by the app. */
      expand?: (row: ProposalRow) => ReactNode;
      rowActions?: (row: ProposalRow) => AnyRowAction[];
      /** Without it there is no selection — a bulk action that cannot act is not offered. */
      bulkActions?: AnyBulkAction[];
      filtered?: { summary: string; resetHref: string };
      /** Empty is a success: „Alles abgenommen." — not the same as empty after a filter. */
      empty?: { title: string; description?: ReactNode; done?: boolean };
      loading?: boolean;
      error?: { message: string; retry?: ReactNode };
    },
): ReactNode {
  const { head, expand, rowActions, bulkActions, filtered, empty, loading, error, ...options } = props;
  const shared = {
    columns: proposalReviewColumns({
      ...(options.variant ? { variant: options.variant } : {}),
      ...(options.include ? { include: options.include } : {}),
      ...(options.accountNames !== undefined ? { accountNames: options.accountNames } : {}),
      // The caller takes the kind out when its groups are by kind — a
      // grouping by anything else keeps it (acceptance 0164, M3).
      ...(options.without ? { without: options.without } : {}),
      ...(options.accountHref ? { accountHref: options.accountHref } : {}),
      ...(options.documentHref ? { documentHref: options.documentHref } : {}),
      ...(options.taxKeyHref ? { taxKeyHref: options.taxKeyHref } : {}),
    }),
    rowKey: (p: ProposalRow) => p.id,
    head,
    density: options.variant === "compact" ? ("compact" as const) : ("default" as const),
    ...(options.variant === "compact" ? { minWidth: 0 } : {}),
    ...(rowActions ? { rowActions } : {}),
    ...(bulkActions && bulkActions.length > 0
      ? {
          selection: {
            actions: bulkActions,
            // What the row shows — the number is no longer a column by default.
            label: (p: ProposalRow) => `${formatTime(p.date, "date")} · ${p.counterparty ?? p.title}`,
            sticky: true,
          },
        }
      : {}),
    ...(filtered ? { filtered } : {}),
    ...(empty ? { empty } : {}),
    ...(loading ? { loading } : {}),
    ...(error ? { error } : {}),
  };
  const table = expand
    ? props.groups
      ? <DataTable<ProposalRow> {...shared} expand={expand} groups={props.groups} />
      : <DataTable<ProposalRow> {...shared} expand={expand} rows={[...props.rows!]} />
    : props.groups
      ? <DataTable<ProposalRow> {...shared} groups={props.groups} />
      : <DataTable<ProposalRow> {...shared} rows={[...props.rows!]} />;
  return table;
}
