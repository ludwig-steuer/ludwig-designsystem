import { deriveEntryDatevStage } from "@/ludwig/modules/entries/domain/entry";
import { confidenceLevel } from "@/ludwig/shared/confidence";
import type { Currency } from "@/ludwig/shared/money";

import type { ColumnDef } from "../../patterns/DataTable";
import { ProvenanceMark } from "../../patterns/Provenance";
import { StatusBadge } from "../../patterns/StatusBadge";
import { StatusInfoButton } from "../../patterns/StatusInfoButton";
import { AmountCell, MonoCell } from "../../primitives/Cells";
import { Time } from "../../primitives/Time";
import { CaseCell } from "../accounting-case/CaseCell";
import { JournalEntryCell, type JournalLine } from "./JournalEntryCompact";
import type { JournalEntryRowData } from "./journal-entry";

/**
 * The seven points of an entry as cells — **once**, for the short list and for
 * `DataTable` (0175).
 *
 * A row component and a column set are two ways of arranging the same cells,
 * not two components (0101). Everything a cell decides is decided here.
 *
 * **The way to DATEV is derived, never read off `status`**:
 * `deriveEntryDatevStage()` in the domain is the one rule for every reader —
 * a second comparison on `exportedAt` here would be the second truth.
 */

/** Above this the booking text is cut: the EXTF field ends at 60 characters. */
const TEXT_MAX = 60;

export type JournalEntryColumn =
  | "bookingDate"
  | "belegfeld1"
  | "bookingText"
  | "accounts"
  | "taxKey"
  | "amount"
  | "datevStage"
  | "origin"
  | "case";

export interface JournalEntryColumnOptions {
  /** Which columns and in what order; without it everything but the case. */
  columns?: readonly JournalEntryColumn[];
  /** The way to the account drawer, per account number (0155). */
  accountHref?: (accountNumber: string) => string;
  /** The way to the case. Without it the number stays text. */
  caseHref?: (caseId: string) => string;
}

/** Everything the batch list shows; the case belongs to lists outside a case. */
export const DEFAULT_JOURNAL_ENTRY_COLUMNS: readonly JournalEntryColumn[] = [
  "bookingDate",
  "belegfeld1",
  "bookingText",
  "accounts",
  "taxKey",
  "amount",
  "datevStage",
  "origin",
];

/**
 * The two lines the list item carries — one account per side.
 *
 * It knows no more: an entry with more than two lines (10 % of the stock) is
 * shown by its line count instead, because „A an B" would be wrong there
 * (L-335).
 */
function entryLines(entry: JournalEntryRowData): JournalLine[] {
  const lines: JournalLine[] = [];
  if (entry.debitAccountNumber !== null) {
    lines.push({
      side: "debit",
      accountNumber: entry.debitAccountNumber,
      accountName: entry.debitAccountName,
      amount: entry.amount,
    });
  }
  if (entry.creditAccountNumber !== null) {
    lines.push({
      side: "credit",
      accountNumber: entry.creditAccountNumber,
      accountName: entry.creditAccountName,
      amount: entry.amount,
    });
  }
  return lines;
}

function clip(text: string): { shown: string; title?: string } {
  if (text.length <= TEXT_MAX) return { shown: text };
  return { shown: `${text.slice(0, TEXT_MAX - 1).trimEnd()}…`, title: text };
}

/**
 * @when    Entries in a `DataTable` — the batch, the case, the export bucket.
 * @instead A handful of entries in a card → JournalEntryRow. One entry named
 *          in a foreign row → JournalEntryCell.
 */
export function journalEntryColumns(
  options: JournalEntryColumnOptions = {},
): ColumnDef<JournalEntryRowData>[] {
  const { columns = DEFAULT_JOURNAL_ENTRY_COLUMNS, accountHref, caseHref } = options;
  const all: Record<JournalEntryColumn, ColumnDef<JournalEntryRowData>> = {
    bookingDate: {
      key: "bookingDate",
      header: "Datum",
      width: "96px",
      sortable: true,
      cell: (e) => <Time value={e.bookingDate} format="date" length="short" size="sm" />,
    },
    belegfeld1: {
      key: "belegfeld1",
      header: "Belegfeld 1",
      width: "112px",
      cell: (e) => <MonoCell value={e.belegfeld1} />,
    },
    bookingText: {
      key: "bookingText",
      header: "Buchungstext",
      width: "minmax(0, 1.4fr)",
      cell: (e) => {
        if (e.buchungstext === null) return <span className="v2muted">—</span>;
        const { shown, title } = clip(e.buchungstext);
        return (
          <span className="v2trunc" title={title}>
            {shown}
          </span>
        );
      },
    },
    accounts: {
      key: "accounts",
      header: "Konten",
      width: "minmax(0, 1fr)",
      cell: (e) => {
        const lines = entryLines(e);
        const count = e.lineCount ?? lines.length;
        const currency = e.currency as Currency;
        // No amount here: the row has its own column for it, and a number
        // that stands twice in one row is what D24 forbids (0044, nachtrag).
        if (count > 2) return <span className="v2je__cell">{count} Zeilen</span>;
        return (
          <JournalEntryCell
            lines={lines}
            currency={currency}
            showNames={false}
            showAmount={false}
            {...(accountHref ? { accountHref } : {})}
          />
        );
      },
    },
    taxKey: {
      key: "taxKey",
      header: "USt",
      width: "72px",
      cell: (e) => (
        <MonoCell
          value={e.vatKey}
          tone="muted"
          {...(e.vatRatePercent !== null ? { title: `${e.vatRatePercent} %` } : {})}
        />
      ),
    },
    amount: {
      key: "amount",
      header: "Betrag",
      width: "128px",
      align: "end",
      sortable: true,
      cell: (e) => <AmountCell value={e.amount} currency={e.currency as Currency} />,
    },
    datevStage: {
      key: "datevStage",
      header: "Weg nach DATEV",
      // The (i) belongs to the head, not to every row (Z4, 0029 M3).
      headerAside: <StatusInfoButton axis="journal_entry_datev_stage" />,
      width: "150px",
      cell: (e) => (
        <StatusBadge
          axis="journal_entry_datev_stage"
          status={deriveEntryDatevStage(e)}
          info={false}
        />
      ),
    },
    origin: {
      key: "origin",
      header: "Herkunft",
      headerAside: <StatusInfoButton axis="journal_entry_origin" />,
      width: "136px",
      cell: (e) => (
        <ProvenanceMark
          provenance={{
            origin: <StatusBadge axis="journal_entry_origin" status={e.origin} info={false} />,
            ...(e.confidence != null
              ? { confidence: { level: confidenceLevel(e.confidence), value: e.confidence } }
              : {}),
          }}
        />
      ),
    },
    case: {
      key: "case",
      header: "Sachverhalt",
      width: "128px",
      cell: (e) => {
        if (e.caseId === null) return <span className="v2muted">—</span>;
        if (!caseHref) return <span>{e.caseNumber ?? "—"}</span>;
        return (
          <CaseCell
            cases={[
              {
                caseId: e.caseId,
                caseNumber: e.caseNumber,
                fiscalYear: e.caseFiscalYear,
                title: e.caseTitle ?? null,
                kind: null,
                counterpartyName: null,
                lifecycleStatus: null,
              },
            ]}
            href={caseHref}
            showState={false}
          />
        );
      },
    },
  };
  return columns.map((key) => all[key]);
}

/**
 * The grid tracks of a column set — the same widths in `Table` as in
 * `DataTable`, so a short list and a long one line up.
 *
 * @when    A short list of entries in `Table`, which needs its tracks as a
 *          string.
 * @instead The columns themselves → journalEntryColumns.
 */
export function journalEntryTracks(columns?: readonly JournalEntryColumn[]): string {
  return journalEntryColumns(columns ? { columns } : {})
    .map((c) => c.width ?? "minmax(0, 1fr)")
    .join(" ");
}
