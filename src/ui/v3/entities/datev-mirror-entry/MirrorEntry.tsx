import type { Currency } from "@/ludwig/shared/money";

import { EntityIcon } from "../../Icons";
import { StatusBadge } from "../../patterns/StatusBadge";
import { AmountCell, MonoCell } from "../../primitives/Cells";
import { EmptyState } from "../../primitives/EmptyState";
import { Link } from "../../primitives/Link";
import { Time } from "../../primitives/Time";
import { AccountCell } from "../account/Account";

/**
 * The reading family of a DATEV mirror entry (0191): preview, row, list.
 *
 * A mirror entry is a record **as it stands in DATEV** — read, never written.
 * At a case it answers the one question nobody else answers: what did the firm
 * make of our export, and what did it book without us?
 *
 * **It has no way to write.** The mirror is imported; unclear matches are put
 * to the agent, who confirms them over MCP — not to a picker in the interface
 * (owner rule „put the heuristic up, do not rubber-stamp it", profile
 * `datev-mirror-entry`). So there is no callback in this file, and that is a
 * property of the entity, not an omission.
 *
 * The ranks are the ones of `journal-entry`: the reconciliation puts both side
 * by side, and two forms for one question only read alike when their points
 * stand in the same order.
 */

/** One line of the record — structurally the same shape as `JournalLine`. */
export interface MirrorEntryLine {
  side: "debit" | "credit";
  /** The logical DATEV number, exactly as stored (leading zeros stay). */
  accountNumber: string;
  accountName?: string | null;
  /** Always positive; the side carries the direction. */
  amount: number;
  /**
   * DATEV books against a contra account on the line. 41 % of the records
   * carry more than one leg per side, so the accounts of a record are the
   * legs **and** their contra accounts, without duplicates.
   */
  contraAccountNumber?: string | null;
  taxKey?: string | null;
  taxRatePercent?: number | null;
}

/**
 * One record of `ludwig.client_datev_mirror_entries`, as the reading forms
 * show it (ranks 1–9 and 14 of the entity profile).
 *
 * The app's own shapes (`TruthEntryRow`, `TruthEntryDetail`) live in its
 * infrastructure and are therefore not mirrored — finding L-302. Until that
 * moves, this view is the set's own, with the names of the columns.
 */
export interface MirrorEntryVM {
  id: string;
  /** Rank 1 — `description`, at most 60 characters; DATEV cuts it itself. */
  description: string;
  /** Rank 2 — the sum of the debit side. */
  amount: number;
  currency: Currency;
  /** Rank 3 — p50 2 · p90 3 · max 5. */
  lines: readonly MirrorEntryLine[];
  /** Rank 4 — `posting_date`, a calendar day. */
  postingDate: string;
  /**
   * Rank 5 — value of the axis `mirror_match`. A `string` until the mirror
   * carries the type (L-302); the word comes from the registry.
   */
  matchState: string;
  /** Rank 6 — `external_document_number`, never shortened. */
  externalDocumentNumber?: string | null;
  /** Rank 7 — the DATEV sequence this record was booked in. */
  sequenceId?: string | null;
  /** Rank 7 — a committed sequence cannot change any more. */
  sequenceCommitted?: boolean;
  /** Rank 8 — `ludwig_case_number`, filled in 2 % of the stock. */
  caseNumber?: string | null;
  /**
   * Rank 9 — `mark_of_origin`, **as the raw code**: the word list is
   * incomplete and lives in the app's infrastructure (L-304). A code that
   * shows is better than a word that is wrong.
   */
  markOfOrigin?: string | null;
  /** Rank 14 — the LudwigAI reference the export carried over. */
  exportRef?: string | null;
  /** Without it the preview is text, not a way. */
  href?: string | null;
}

/** Unique, in order, without the empty ones. */
function uniq(values: readonly (string | null | undefined)[]): string[] {
  return [...new Set(values.filter((v): v is string => Boolean(v)))];
}

/**
 * Which accounts stand in the debit and which in the credit of a record —
 * the legs **and** their contra accounts, each once.
 *
 * @when    Summing up a mirror record's accounts for a preview, a row or the
 *          reconciliation.
 * @instead The lines themselves, one per row → the grid of the record (second
 *          wave). One account with its name → AccountCell.
 */
export function mirrorEntryAccounts(lines: readonly MirrorEntryLine[]): {
  debit: string[];
  credit: string[];
} {
  const debit = lines.filter((l) => l.side === "debit");
  const credit = lines.filter((l) => l.side === "credit");
  return {
    debit: uniq([...debit.map((l) => l.accountNumber), ...credit.map((l) => l.contraAccountNumber)]),
    credit: uniq([...credit.map((l) => l.accountNumber), ...debit.map((l) => l.contraAccountNumber)]),
  };
}

/** The accounts of one side, each as a cell — „6815 · 0650" reads as two. */
function Accounts({ numbers, lines }: { numbers: string[]; lines: readonly MirrorEntryLine[] }) {
  if (numbers.length === 0) return <span className="v2sub">—</span>;
  return (
    <span className="v3mir__accs">
      {numbers.map((number) => (
        <AccountCell
          key={number}
          number={number}
          name={lines.find((l) => l.accountNumber === number)?.accountName ?? null}
        />
      ))}
    </span>
  );
}

/**
 * @when    A mirror record named inside something else — the entry it was
 *          matched to, a bank line's hit, the right-hand side of the
 *          reconciliation.
 * @instead The record in a list of its own → MirrorEntryRow. Everything about
 *          it → MirrorEntryFacts (second wave). Our own booking rather than
 *          DATEV's → JournalEntryCell.
 */
export function MirrorEntryCell({ entry, href }: { entry: MirrorEntryVM; href?: string }) {
  const accounts = mirrorEntryAccounts(entry.lines);
  const target = href ?? entry.href ?? undefined;
  // No badge here: in a foreign row the record is the statement, not the state
  // of its match. The sign plus the word says where this comes from (T8).
  const body = (
    <>
      <span className="v3mir__from" title="DATEV-Spiegel">
        <EntityIcon entity="datev-mirror" size={14} />
        DATEV
      </span>
      <span className="v3mir__accpair">
        <Accounts numbers={accounts.debit} lines={entry.lines} />
        <span className="v2sub" aria-label="an">
          an
        </span>
        <Accounts numbers={accounts.credit} lines={entry.lines} />
      </span>
      <AmountCell value={entry.amount} currency={entry.currency} />
    </>
  );
  return (
    <span className="v3mir__cell" title={entry.externalDocumentNumber ?? undefined}>
      {target ? <Link href={target}>{body}</Link> : body}
    </span>
  );
}

/**
 * @when    A mirror record in a list — at a case, in a sequence, in the
 *          records tab.
 * @instead Mentioned inside something else → MirrorEntryCell. Ludwig's own
 *          entry → JournalEntryRow. The pair of both → ReconciliationTable.
 */
export function MirrorEntryRow({
  entry,
  showCase,
  href,
}: {
  entry: MirrorEntryVM;
  /** Puts the case number in front — only in lists outside one case (rank 8). */
  showCase?: boolean;
  href?: string;
}) {
  const accounts = mirrorEntryAccounts(entry.lines);
  const target = href ?? entry.href ?? undefined;
  const title = <span className="v2main">{entry.description}</span>;
  return (
    <div className="v3mir__row">
      <div className="v3mir__head">
        {showCase && entry.caseNumber ? <span className="v2sub">{entry.caseNumber}</span> : null}
        {target ? <Link href={target}>{title}</Link> : title}
        {/* Right-aligned as a group: the state must not move with the length
            of the text, and down a list it becomes a column one can scan. */}
        <span className="v3mir__state">
          <span className="v3mir__amt">
            <AmountCell value={entry.amount} currency={entry.currency} />
          </span>
          <span className="v3mir__badge">
            <StatusBadge axis="mirror_match" status={entry.matchState} info={false} />
          </span>
        </span>
      </div>
      <div className="v3mir__accpair">
        <Accounts numbers={accounts.debit} lines={entry.lines} />
        <span className="v2sub" aria-label="an">
          an
        </span>
        <Accounts numbers={accounts.credit} lines={entry.lines} />
      </div>
      <div className="v3mir__meta">
        <Time value={entry.postingDate} format="date" size="sm" />
        {entry.externalDocumentNumber ? (
          <>
            <span aria-hidden="true">·</span>
            {/* Never shortened: a document number that is cut is a different one. */}
            <MonoCell value={entry.externalDocumentNumber} tone="muted" />
          </>
        ) : null}
        {entry.sequenceId ? (
          <>
            <span aria-hidden="true">·</span>
            <span>
              Stapel {entry.sequenceId}
              {entry.sequenceCommitted ? " · festgeschrieben" : ""}
            </span>
          </>
        ) : null}
        {/* The raw code, until the word list is complete in the domain (L-304). */}
        {entry.markOfOrigin ? (
          <>
            <span aria-hidden="true">·</span>
            <span title="DATEV-Herkunft (Code)">{entry.markOfOrigin}</span>
          </>
        ) : null}
      </div>
    </div>
  );
}

/**
 * @when    The mirror records of **one** case or one sequence — a handful of
 *          rows, read side by side with Ludwig's own history.
 * @instead Thousands of records with filter, sorting and paging → the records
 *          page (second wave, `DataTable`). Ludwig's export against DATEV,
 *          pair by pair → ReconciliationTable (0165). One record named
 *          elsewhere → MirrorEntryCell.
 */
export function MirrorEntryList({
  entries,
  showCase,
  href,
  empty,
}: {
  /** The list does **not** reorder — the caller owns the order. */
  entries: readonly MirrorEntryVM[];
  showCase?: boolean;
  href?: (entry: MirrorEntryVM) => string;
  /** „Nothing in DATEV" is a **result**, not an empty box (L6). */
  empty?: { title: string; hint?: string };
}) {
  if (entries.length === 0) {
    return (
      <EmptyState
        inline
        title={empty?.title ?? "Nichts in DATEV."}
        description={
          empty?.hint ??
          "Zu diesem Sachverhalt steht drüben noch kein Satz — weder von uns exportiert noch von der Kanzlei gebucht."
        }
      />
    );
  }
  return (
    <div className="v3mir">
      {entries.map((entry) => (
        <div className="v3mir__item" key={entry.id}>
          <MirrorEntryRow
            entry={entry}
            {...(showCase ? { showCase } : {})}
            {...(href ? { href: href(entry) } : {})}
          />
        </div>
      ))}
    </div>
  );
}
