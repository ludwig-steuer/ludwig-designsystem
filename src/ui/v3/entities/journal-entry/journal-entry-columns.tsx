import { deriveEntryDatevStage } from "@/ludwig/modules/entries/domain/entry";
import { confidenceLevel } from "@/ludwig/shared/confidence";
import type { Currency } from "@/ludwig/shared/money";

import type { ColumnDef } from "../../patterns/DataTable";
import { ProvenanceMark } from "../../patterns/Provenance";
import { StatusBadge } from "../../patterns/StatusBadge";
import { StatusInfoButton } from "../../patterns/StatusInfoButton";
import { AmountCell, MonoCell } from "../../primitives/Cells";
import { Link } from "../../primitives/Link";
import { Time } from "../../primitives/Time";
import { CaseCell } from "../accounting-case/CaseCell";
import { AccountCell } from "../account/Account";
import type { MirrorEntryVM } from "../datev-mirror-entry/MirrorEntry";
import { mirrorEntryAccounts } from "../datev-mirror-entry/MirrorEntry";
import { SourceDocumentRefCell } from "../source-document/SourceDocumentRefCell";
import { JournalEntryCell, type JournalLine } from "./JournalEntryCompact";
import { TaxKeyCell } from "./TaxKey";
import type { JournalEntryRowData } from "./journal-entry";

/**
 * T1 · the entries of a stock — a batch, the mirror, an account card, a case
 * (0211, brief F334). One table for Ludwig's entries **and** DATEV's records:
 * the question is the same („what is in here"), and so are the columns. A
 * stock has one source, so the table says it once (`source`): the state
 * column is „Weg nach DATEV" or „DATEV-Abgleich", and the origin column exists
 * only for Ludwig.
 *
 * Two fixed forms (decision 3): `compact` for a drawer, a fold-out, a side
 * card; `full` for a page. What `compact` leaves out stands in the entry
 * drawer — the whole row leads there.
 */

/** Above this the booking text is cut: the EXTF field ends at 60 characters. */
const TEXT_MAX = 60;

export type EntrySource = "ludwig" | "datev";

export interface EntryAccount {
  number: string;
  name?: string | null;
}

/**
 * One row of T1 — neutral over the two sources. The two converters below
 * bring the app's types in; they change the shape, they derive nothing but
 * the way to DATEV, which is the domain's own rule.
 */
export interface EntryRow {
  id: string;
  /** Booking date, ISO. */
  date: string;
  /** Belegfeld 1 as stored. */
  documentNumber: string | null;
  /** The linked document (`source_doc_id`, F331); `null` = none. */
  documentId?: string | null;
  /** Its file name or form — readable on hover at the document cell. */
  documentName?: string | null;
  text: string | null;
  debit: readonly EntryAccount[];
  credit: readonly EntryAccount[];
  amount: number;
  currency: Currency;
  taxKey?: string | null;
  /** The value of the table's state axis — `journal_entry_datev_stage` or `mirror_match`. */
  state: string;
  /** Axis `journal_entry_origin`; Ludwig only. */
  origin?: string | null;
  confidence?: number | null;
  /** `id` is `null` where only the number is known (DATEV's records) — then the number stays text, never a route built on it. */
  case?: { id: string | null; number: string | null; fiscalYear?: number | null; title?: string | null } | null;
  batch?: { id: string; label: string } | null;
  /** The document group the batch list sections by (0149). */
  documentGroup?: string | null;
  /** The agent run that wrote the entry — „D2" answers „that was different last week". Optional column `run`. */
  run?: number | null;
  /** The DATEV-ID (`export_ref`, „LW-…") — the key to find the entry in DATEV. Optional column `exportRef`. */
  exportRef?: string | null;
}

/**
 * @when    Showing Ludwig's list items in T1.
 * @instead DATEV's records → entryRowFromMirror.
 */
export function entryRowFromJournalEntry(
  e: JournalEntryRowData & { sourceDocId?: string | null; batch?: EntryRow["batch"] },
): EntryRow {
  return {
    id: e.entryId,
    date: e.bookingDate,
    documentNumber: e.belegfeld1,
    documentId: e.sourceDocId ?? null,
    text: e.buchungstext,
    debit: e.debitAccountNumber ? [{ number: e.debitAccountNumber, name: e.debitAccountName }] : [],
    credit: e.creditAccountNumber ? [{ number: e.creditAccountNumber, name: e.creditAccountName }] : [],
    amount: e.amount,
    currency: e.currency as Currency,
    taxKey: e.vatKey,
    state: deriveEntryDatevStage({ status: e.status, exportedAt: e.exportedAt, mirrored: e.datevMirrorEntryId !== null }),
    origin: e.origin,
    confidence: e.confidence ?? null,
    case: e.caseId ? { id: e.caseId, number: e.caseNumber, fiscalYear: e.caseFiscalYear, title: e.caseTitle ?? null } : null,
    batch: e.batch ?? null,
    documentGroup: e.documentGroup ?? null,
  };
}

/**
 * @when    Showing DATEV's records in T1.
 * @instead Ludwig's entries → entryRowFromJournalEntry.
 */
export function entryRowFromMirror(m: MirrorEntryVM & { sourceDocId?: string | null; taxKey?: string | null }): EntryRow {
  const accounts = mirrorEntryAccounts(m.lines);
  const name = (n: string) => m.lines.find((l) => l.accountNumber === n)?.accountName ?? null;
  return {
    id: m.id,
    date: m.postingDate,
    documentNumber: m.externalDocumentNumber ?? null,
    documentId: m.sourceDocId ?? null,
    text: m.description,
    debit: accounts.debit.map((n) => ({ number: n, name: name(n) })),
    credit: accounts.credit.map((n) => ({ number: n, name: name(n) })),
    amount: m.amount,
    currency: m.currency,
    taxKey: m.taxKey ?? null,
    state: m.matchState,
    // The mirror knows the case number, not its id — a route built on the
    // number would lead into the void (hint ll-dev 2026-09-29).
    case: m.caseNumber ? { id: null, number: m.caseNumber } : null,
    batch: m.sequenceId ? { id: m.sequenceId, label: m.sequenceId } : null,
  };
}

export type JournalEntryColumn =
  | "date"
  | "document"
  | "booking"
  | "text"
  | "accounts"
  | "debit"
  | "credit"
  | "taxKey"
  | "amount"
  | "state"
  | "origin"
  | "case"
  | "batch"
  | "run"
  | "exportRef";

/** The reading order — `without` takes columns out, nothing reorders. */
/**
 * Compact stacks text and accounts in one column „Buchung" — measured at
 * 600 px, six single-line columns left the text 25 px (0211). The rest stays
 * one line each.
 */
const COMPACT: readonly JournalEntryColumn[] = ["date", "document", "booking", "amount", "state"];
/**
 * Every column in its one place — the defaults of both forms and what a caller
 * switches on with `include` (owner rule 2026-09-29 via ll-cto: drop no
 * feature the data carries). Nothing reorders.
 */
const ALL_ORDER: readonly JournalEntryColumn[] = [
  "date",
  "document",
  "text",
  "booking",
  "accounts",
  "debit",
  "credit",
  "taxKey",
  "amount",
  "state",
  "origin",
  "run",
  "case",
  "batch",
  "exportRef",
];
const FULL: readonly JournalEntryColumn[] = [
  "date",
  "document",
  "text",
  "debit",
  "credit",
  "taxKey",
  "amount",
  "state",
  "origin",
  "case",
  "batch",
];

export interface JournalEntryColumnOptions {
  source?: EntrySource;
  variant?: "compact" | "full";
  /** Columns that would be empty in this frame — the case inside a case, the batch inside a batch. */
  without?: readonly JournalEntryColumn[];
  /** Columns switched on beyond the form's defaults — `run` and `exportRef` above all, any other in `compact`. */
  include?: readonly JournalEntryColumn[];
  accountHref?: (accountNumber: string) => string;
  documentHref?: (documentId: string) => string;
  caseHref?: (caseId: string) => string;
  taxKeyHref?: (taxKey: string) => string;
  batchHref?: (batchId: string) => string;
}

function clip(text: string): { shown: string; title?: string } {
  if (text.length <= TEXT_MAX) return { shown: text };
  return { shown: `${text.slice(0, TEXT_MAX - 1).trimEnd()}…`, title: text };
}

/** One side's accounts: the first named, the rest counted — every number its own way. */
function SideAccounts({ accounts, accountHref }: { accounts: readonly EntryAccount[]; accountHref?: ((n: string) => string) | undefined }) {
  const [first, ...rest] = accounts;
  if (!first) return <span className="v2muted">—</span>;
  return (
    <span className="v2ae__contra" title={accounts.map((a) => `${a.number} ${a.name ?? ""}`.trim()).join(", ")}>
      <AccountCell number={first.number} name={first.name ?? null} href={accountHref?.(first.number)} />
      {rest.length > 0 ? <span className="v2muted"> +{rest.length}</span> : null}
    </span>
  );
}

/**
 * @when    Entries in a `DataTable` — the batch, the mirror, the case, the
 *          account card; compact or full.
 * @instead A handful of entries in a card → JournalEntryRow. One entry named
 *          in a foreign row → JournalEntryCell. The movements of one account
 *          with debit and credit apart → accountEntryColumns.
 */
export function journalEntryColumns(options: JournalEntryColumnOptions = {}): ColumnDef<EntryRow>[] {
  const { source = "ludwig", variant = "full", without = [], include = [], accountHref, documentHref, caseHref, taxKeyHref, batchHref } = options;
  const axis = source === "ludwig" ? "journal_entry_datev_stage" : "mirror_match";
  const all: Record<JournalEntryColumn, ColumnDef<EntryRow>> = {
    date: {
      key: "date",
      header: "Datum",
      width: "88px",
      sortable: true,
      cell: (e) => <Time value={e.date} format="date" length="short" size="sm" />,
    },
    document: {
      key: "document",
      header: "Beleg",
      width: variant === "compact" ? "88px" : "112px",
      cell: (e) => (
        <SourceDocumentRefCell
          number={e.documentNumber}
          documentId={e.documentId ?? null}
          name={e.documentName ?? null}
          variant={variant}
          {...(documentHref ? { documentHref } : {})}
        />
      ),
    },
    booking: {
      key: "booking",
      header: "Buchung",
      width: "minmax(0, 1fr)",
      cell: (e) => {
        const lines: JournalLine[] = [
          ...e.debit.map((a) => ({ side: "debit" as const, accountNumber: a.number, accountName: a.name ?? null, amount: e.amount })),
          ...e.credit.map((a) => ({ side: "credit" as const, accountNumber: a.number, accountName: a.name ?? null, amount: e.amount })),
        ];
        const text = e.text === null ? null : clip(e.text);
        return (
          <span className="v3entry__booking">
            <span className="v2trunc" title={text?.title}>
              {text ? text.shown : <span className="v2muted">—</span>}
            </span>
            <span className="v2sub">
              <JournalEntryCell
                lines={lines}
                currency={e.currency}
                showNames={false}
                showAmount={false}
                {...(accountHref ? { accountHref } : {})}
              />
            </span>
          </span>
        );
      },
    },
    text: {
      key: "text",
      header: "Buchungstext",
      // The text leads the free width: at 1280 it had 130 px next to two
      // account names cut to three letters (0211, measured).
      width: "minmax(0, 2fr)",
      cell: (e) => {
        if (e.text === null) return <span className="v2muted">—</span>;
        const { shown, title } = clip(e.text);
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
        const lines: JournalLine[] = [
          ...e.debit.map((a) => ({ side: "debit" as const, accountNumber: a.number, accountName: a.name ?? null, amount: e.amount })),
          ...e.credit.map((a) => ({ side: "credit" as const, accountNumber: a.number, accountName: a.name ?? null, amount: e.amount })),
        ];
        return (
          <JournalEntryCell
            lines={lines}
            currency={e.currency}
            showNames={false}
            showAmount={false}
            {...(accountHref ? { accountHref } : {})}
          />
        );
      },
    },
    debit: {
      key: "debit",
      header: "Soll",
      width: "minmax(0, 1fr)",
      cell: (e) => <SideAccounts accounts={e.debit} accountHref={accountHref} />,
    },
    credit: {
      key: "credit",
      header: "Haben",
      width: "minmax(0, 1fr)",
      cell: (e) => <SideAccounts accounts={e.credit} accountHref={accountHref} />,
    },
    taxKey: {
      key: "taxKey",
      header: "USt",
      width: "48px",
      cell: (e) => <TaxKeyCell taxKey={e.taxKey ?? null} {...(taxKeyHref ? { taxKeyHref } : {})} />,
    },
    amount: {
      key: "amount",
      header: "Betrag",
      width: variant === "compact" ? "104px" : "120px",
      align: "end",
      sortable: true,
      cell: (e) => <AmountCell value={e.amount} currency={e.currency} />,
    },
    state: {
      key: "state",
      header: source === "ludwig" ? "Weg nach DATEV" : "DATEV-Abgleich",
      // The (i) belongs to the head, not to every row (Z4, 0029 M3).
      headerAside: <StatusInfoButton axis={axis} />,
      width: variant === "compact" ? "120px" : "140px",
      cell: (e) => <StatusBadge axis={axis} status={e.state} info={false} showIcon={variant !== "compact"} />,
    },
    origin: {
      key: "origin",
      header: "Herkunft",
      headerAside: <StatusInfoButton axis="journal_entry_origin" />,
      // 168: the widest chip („Vorschlag von Ludwig") plus the confidence dot —
      // at 136 the dot sat on the case column (0211, measured).
      width: "168px",
      cell: (e) =>
        e.origin ? (
          <ProvenanceMark
            provenance={{
              origin: <StatusBadge axis="journal_entry_origin" status={e.origin} info={false} />,
              ...(e.confidence != null ? { confidence: { level: confidenceLevel(e.confidence), value: e.confidence } } : {}),
            }}
          />
        ) : (
          <span className="v2muted">—</span>
        ),
    },
    case: {
      key: "case",
      header: "Sachverhalt",
      width: "104px",
      cell: (e) => {
        if (!e.case) return <span className="v2muted">—</span>;
        if (!caseHref || !e.case.id) return <span className="v2mono">{e.case.number ?? "—"}</span>;
        return (
          <CaseCell
            cases={[
              {
                caseId: e.case.id,
                caseNumber: e.case.number,
                fiscalYear: e.case.fiscalYear ?? null,
                title: e.case.title ?? null,
                kind: null,
                counterpartyName: null,
                lifecycleStatus: null,
              },
            ]}
            href={caseHref}
            showState={false}
            layout="number"
          />
        );
      },
    },
    batch: {
      key: "batch",
      header: "Stapel",
      width: "120px",
      cell: (e) =>
        !e.batch ? (
          <span className="v2muted">—</span>
        ) : batchHref ? (
          <Link href={batchHref(e.batch.id)} className="v3cell-link v2trunc">
            {e.batch.label}
          </Link>
        ) : (
          <span className="v2trunc">{e.batch.label}</span>
        ),
    },
    run: {
      key: "run",
      header: "Durchgang",
      width: "88px",
      cell: (e) => (e.run == null ? <span className="v2muted">—</span> : <span>{`D${e.run}`}</span>),
    },
    exportRef: {
      key: "exportRef",
      header: "DATEV-ID",
      width: "128px",
      cell: (e) => <MonoCell value={e.exportRef ?? null} />,
    },
  };
  const picked = new Set([...(variant === "compact" ? COMPACT : FULL), ...include]);
  return ALL_ORDER.filter((key) => picked.has(key))
    .filter((key) => !without.includes(key))
    .filter((key) => !(key === "origin" && source === "datev"))
    .map((key) => all[key]);
}

/**
 * The grid tracks of a column set — the same widths in `Table` as in
 * `DataTable`, so a short list and a long one line up.
 *
 * @when    A short list of entries in `Table`, which needs its tracks as a
 *          string.
 * @instead The columns themselves → journalEntryColumns.
 */
export function journalEntryTracks(options: JournalEntryColumnOptions = {}): string {
  return journalEntryColumns(options)
    .map((c) => c.width ?? "minmax(0, 1fr)")
    .join(" ");
}
