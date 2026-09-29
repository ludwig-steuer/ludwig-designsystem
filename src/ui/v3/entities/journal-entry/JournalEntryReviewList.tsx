import type { ReactNode } from "react";

import type { Currency } from "@/ludwig/shared/money";

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
  /** `null` = the case has no entry yet („kein Satz"). */
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
  | "credit"
  | "amount"
  | "taxKey"
  | "document"
  | "review"
  | "kind"
  | "reasons";

/**
 * No document column by default (owner 2026-09-21, step 3): the list has to fit
 * a laptop with the sidebar open, and the document stands in the fold-out. The
 * column exists for a frame with room — pass it in `include`.
 */
const FULL: readonly ProposalColumn[] = ["number", "date", "counterparty", "debit", "credit", "amount", "taxKey", "document", "review", "kind", "reasons"];
const COMPACT: readonly ProposalColumn[] = ["date", "counterparty", "accounts", "amount", "document", "review"];
const OPTIONAL: readonly ProposalColumn[] = ["document"];

export interface ProposalColumnOptions {
  variant?: "compact" | "full";
  /** Columns that say nothing in this frame — the kind inside a group by kind. */
  without?: readonly ProposalColumn[];
  /** Optional columns this frame has room for — today only `document`. */
  include?: readonly ProposalColumn[];
  accountHref?: (accountNumber: string) => string;
  documentHref?: (documentId: string) => string;
  taxKeyHref?: (taxKey: string) => string;
}

function Side({ accounts, accountHref }: { accounts: readonly EntryAccount[]; accountHref?: ((n: string) => string) | undefined }) {
  // Numbers only, one per account — the column is read down the accounts (owner 2026-09-10).
  return (
    <span className="v3prop__accs" title={accounts.map((a) => `${a.number} ${a.name ?? ""}`.trim()).join(", ")}>
      {accounts.map((a, i) => (
        <span key={a.number}>
          {i > 0 ? " / " : null}
          {accountHref ? (
            <a className="v3cell-link v2mono" href={accountHref(a.number)}>
              {a.number}
            </a>
          ) : (
            <span className="v2mono">{a.number}</span>
          )}
        </span>
      ))}
    </span>
  );
}

/**
 * @when    The proposals of a batch or a period are reviewed — verdict,
 *          reasons, bulk release; as columns for a `DataTable` of one's own.
 * @instead The ready list with fold-out and selection → JournalEntryReviewList.
 *          The entries of a stock without a decision → journalEntryColumns.
 */
export function proposalReviewColumns(options: ProposalColumnOptions = {}): ColumnDef<ProposalRow>[] {
  const { variant = "full", without = [], include = [], accountHref, documentHref, taxKeyHref } = options;
  const all: Record<ProposalColumn, ColumnDef<ProposalRow>> = {
    number: { key: "number", header: "Nr.", width: "44px", align: "end", cell: (p) => p.number },
    date: {
      key: "date",
      header: "Datum",
      width: "88px",
      cell: (p) => (p.date ? <Time value={p.date} format="date" size="sm" /> : <span className="v2muted">—</span>),
    },
    counterparty: {
      key: "counterparty",
      header: "Gegenpartei",
      width: "minmax(120px, 1.2fr)",
      cell: (p) => (
        <span className="v3prop__who">
          <span className="v2trunc" title={p.counterparty ?? p.title}>
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
    debit: {
      key: "debit",
      header: "Soll",
      width: "minmax(88px, 1fr)",
      cell: (p) =>
        p.accounts ? (
          <span className="v3prop__who">
            <Side accounts={p.accounts.debit} accountHref={accountHref} />
            {p.accounts.lineCount && p.accounts.lineCount > 2 ? <span className="v2sub">{p.accounts.lineCount} Zeilen</span> : null}
          </span>
        ) : (
          <span className="v2muted">kein Satz</span>
        ),
    },
    credit: {
      key: "credit",
      header: "Haben",
      width: "minmax(88px, 1fr)",
      cell: (p) => (p.accounts ? <Side accounts={p.accounts.credit} accountHref={accountHref} /> : null),
    },
    amount: {
      key: "amount",
      header: "Betrag",
      width: "108px",
      align: "end",
      cell: (p) => <AmountCell value={p.amount} currency={p.currency} />,
    },
    taxKey: {
      key: "taxKey",
      header: "BU",
      width: "44px",
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
      // Dot + longest word („Plausibel") + the verdict's sign — never more.
      width: "112px",
      cell: (p) => <AiBookingNotesCell verdict={p.verdict ?? null} confidence={p.confidence ?? null} />,
    },
    kind: {
      key: "kind",
      header: "Satzart",
      width: "96px",
      cell: (p) => (p.kindLabel ? <Badge tone="neutral">{p.kindLabel}</Badge> : <span className="v2muted">—</span>),
    },
    reasons: {
      key: "reasons",
      header: <StatusHeader axis="review_tab" label="Prüfbedarf" />,
      width: "160px",
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
      // Inside groups by kind the kind column repeats the group head.
      without: [...(options.without ?? []), ...(props.groups ? (["kind"] as const) : [])],
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
      ? { selection: { actions: bulkActions, label: (p: ProposalRow) => `${p.number} · ${p.counterparty ?? p.title}`, sticky: true } }
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
