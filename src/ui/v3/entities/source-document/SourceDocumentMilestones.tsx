import type { ReactNode } from "react";

import type { EntryDatevStage } from "@/ludwig/modules/entries/domain/entry";
import type { Currency } from "@/ludwig/shared/money";

import { StateIcon, type StateKind } from "../../patterns/Review";
import { StatusBadge } from "../../patterns/StatusBadge";
import { formatCount } from "../../format";
import { Amount } from "../../primitives/Amount";
import { IbanCell } from "../../primitives/Cells";
import { Card, CardHead } from "../../primitives/Table";
import { Link } from "../../primitives/Link";
import { Skeleton } from "../../primitives/Skeleton";
import { TextButton } from "../../primitives/TextButton";
import { Time } from "../../primitives/Time";
import { CaseCell } from "../accounting-case/CaseCell";
import type { CaseLink } from "../accounting-case/case-title";
import { JournalEntryCell, type JournalLine } from "../journal-entry/JournalEntryCompact";

/**
 * What has happened to a document in the office's terms (0210): done, case,
 * entries, batch, handed to DATEV — and, where nothing has happened yet, the
 * stations its kind of document usually passes. The technical traces stay in
 * the tab „Verlauf".
 *
 * **Computes nothing** (E2): the app derives the milestones and their order
 * (`modules/source-docs/domain/`), the box draws each kind in its one form.
 */

export interface MilestoneEntry {
  key: string;
  /** Booking date, ISO. */
  date: string;
  lines: readonly JournalLine[];
  currency: Currency;
  stage: EntryDatevStage;
}

export type DocumentMilestone =
  | { kind: "done"; at: string; via: string; reason?: string | null }
  | { kind: "case"; at?: string; case: CaseLink; href: string }
  | { kind: "entries"; at?: string; entries: readonly MilestoneEntry[]; moreHref?: string }
  | {
      kind: "batch";
      at?: string;
      /** One batch for a document; a statement's transactions may land in several, each with its count. */
      batches: readonly { key: string; label: string; status: string; href?: string; count?: number }[];
    }
  | {
      /** A statement (payment documents, 0210 addendum): what the import read. */
      kind: "import";
      at: string;
      account: { name: string; iban?: string | null; href?: string };
      period: { from: string; to: string };
      balance: { opening: number; closing: number; currency: Currency };
      count: number;
      /** The check the import passed, in words from the app; `warning` where it was overridden. Absent for old imports. */
      verification?: { label: string; level?: "warning" } | null;
    }
  | {
      /** A statement's transactions and how many of them are booked. */
      kind: "transactions";
      at?: string;
      booked: number;
      total: number;
      /** The transactions of this statement, filtered to the open ones. */
      openHref?: string;
    }
  | {
      kind: "export";
      at: string;
      /** The DUO filing; without it nothing is said about filing. */
      filing?: { status: string; message?: string | null; path?: string | null };
    };

export interface UpcomingMilestone {
  key: string;
  /** The station still ahead, as a task: „Stapel zuordnen". */
  label: string;
  note?: { level: "info" | "warning"; text: string };
}

/** How many entries the box lists before it points at the tab. */
const ENTRIES_MAX = 3;

const WORD: Record<DocumentMilestone["kind"], string> = {
  done: "Erledigt",
  case: "Sachverhalt zugeordnet",
  entries: "Gebucht",
  batch: "Im Stapel",
  import: "Importiert",
  transactions: "Umsätze gebucht",
  export: "An DATEV übergeben",
};

/**
 * @when    The overview of a document: which stations it has reached and
 *          which are still ahead, with the way to the whole history.
 * @instead The technical history → Timeline in the tab „Verlauf". The state
 *          at a glance in the head → ProcessBox. What is wrong → SourceDocumentDefects.
 */
export function SourceDocumentMilestones({
  milestones,
  upcoming = [],
  pathLabel,
  href,
  accountHref,
  loading,
  error,
}: {
  milestones: readonly DocumentMilestone[];
  upcoming?: readonly UpcomingMilestone[];
  /** The app's name of the usual way — „Weg einer Rechnung". */
  pathLabel?: string;
  /** The tab „Verlauf". */
  href?: string;
  accountHref?: (accountNumber: string) => string;
  loading?: boolean;
  error?: { onRetry?: () => void };
}) {
  const head = (
    <CardHead
      title="Weg des Belegs"
      {...(href ? { actions: <TextButton href={href}>Ganzer Verlauf</TextButton> } : {})}
    />
  );
  let body: ReactNode;
  if (error) {
    body = (
      <p className="v3ms__error" role="alert">
        <strong>Der Weg des Belegs ließ sich nicht laden.</strong> Die Verbindung ist abgebrochen.{" "}
        {error.onRetry ? <TextButton onClick={error.onRetry}>Erneut laden</TextButton> : null}
      </p>
    );
  } else if (loading) {
    body = <Skeleton lines={3} />;
  } else if (milestones.length === 0 && upcoming.length === 0) {
    body = <p className="v3ms__empty">Zu diesem Beleg ist noch nichts geschehen.</p>;
  } else {
    body = (
      <>
        {milestones.length > 0 ? (
          <ol className="v3ms">
            {milestones.map((m) => (
              <Row key={m.kind} sign={signOf(m)} word={wordOf(m)} at={m.at}>
                <Facts m={m} accountHref={accountHref} />
              </Row>
            ))}
          </ol>
        ) : null}
        {upcoming.length > 0 ? (
          <>
            <p className="v3ms__then">{milestones.length > 0 ? "Danach" : (pathLabel ?? "Üblicher Weg")}</p>
            <ol className="v3ms v3ms--ahead">
              {upcoming.map((u) => (
                <Row key={u.key} sign={u.note?.level === "warning" ? "warning" : "open"} word={u.label}>
                  {u.note ? <span className={u.note.level === "warning" ? "v3ms__warn" : undefined}>{u.note.text}</span> : null}
                </Row>
              ))}
            </ol>
          </>
        ) : null}
      </>
    );
  }
  return (
    <Card>
      {head}
      <div className="v3boxbody">{body}</div>
    </Card>
  );
}

function signOf(m: DocumentMilestone): StateKind {
  if (m.kind === "export" && m.filing?.status === "failed") return "error";
  // Reached, but not all through: the station stands, the rest is still open.
  if (m.kind === "transactions" && m.booked < m.total) return "open";
  return "done";
}

function wordOf(m: DocumentMilestone): string {
  if (m.kind === "entries" && m.entries.length > 1) return `Gebucht · ${m.entries.length} Buchungen`;
  return WORD[m.kind];
}

function Row({ sign, word, at, children }: { sign: StateKind; word: string; at?: string | undefined; children?: ReactNode }) {
  return (
    <li className="v3ms__row">
      <StateIcon state={sign} />
      <span className="v3ms__word">{word}</span>
      {at ? (
        <span className="v3ms__at">
          <Time value={at} format="date" size="sm" />
        </span>
      ) : null}
      {children ? <div className="v3ms__facts">{children}</div> : null}
    </li>
  );
}

function Facts({ m, accountHref }: { m: DocumentMilestone; accountHref?: ((n: string) => string) | undefined }) {
  switch (m.kind) {
    case "done":
      return (
        <span className="v3ms__line">
          <StatusBadge axis="document_done_via" status={m.via} info={false} />
          {m.reason ? <span>{m.reason}</span> : null}
        </span>
      );
    case "case":
      return <CaseCell cases={[m.case]} href={() => m.href} layout="stacked" />;
    case "entries": {
      const shown = m.entries.slice(0, m.entries.length > ENTRIES_MAX + 1 ? ENTRIES_MAX : undefined);
      const rest = m.entries.length - shown.length;
      return (
        <ul className="v3ms__entries">
          {shown.map((e) => (
            <li key={e.key} className="v3ms__entry">
              <JournalEntryCell lines={e.lines} currency={e.currency} {...(accountHref ? { accountHref } : {})} />
              <span className="v3ms__line">
                <Time value={e.date} format="date" size="sm" />
                <StatusBadge axis="journal_entry_datev_stage" status={e.stage} info={false} />
              </span>
            </li>
          ))}
          {rest > 0 && m.moreHref ? (
            <li>
              <TextButton href={m.moreHref}>{`${rest} weitere Buchungen`}</TextButton>
            </li>
          ) : null}
        </ul>
      );
    }
    case "batch":
      return (
        <>
          {m.batches.map((b) => (
            <span key={b.key} className="v3ms__line">
              {b.href ? <Link href={b.href}>{b.label}</Link> : <span>{b.label}</span>}
              {b.count !== undefined ? <span className="v3ms__count">{formatCount(b.count, ["Umsatz", "Umsätze"])}</span> : null}
              <StatusBadge axis="export_batch" status={b.status} info={false} />
            </span>
          ))}
        </>
      );
    case "import":
      return (
        <>
          <span className="v3ms__line">
            {m.account.href ? <Link href={m.account.href}>{m.account.name}</Link> : <span>{m.account.name}</span>}
            {m.account.iban ? <IbanCell value={m.account.iban} /> : null}
          </span>
          <span className="v3ms__line">
            <span>
              <Time value={m.period.from} format="date" size="sm" /> – <Time value={m.period.to} format="date" size="sm" /> ·{" "}
              {formatCount(m.count, ["Umsatz", "Umsätze"])}
            </span>
          </span>
          <span className="v3ms__line">
            <span>
              Saldo <Amount value={m.balance.opening} currency={m.balance.currency} size="sm" /> →{" "}
              <Amount value={m.balance.closing} currency={m.balance.currency} size="sm" />
            </span>
          </span>
          {m.verification ? (
            m.verification.level === "warning" ? (
              <span className="v3ms__note">
                <StateIcon state="warning" />
                <span className="v3ms__warn">{m.verification.label}</span>
              </span>
            ) : (
              <span>{m.verification.label}</span>
            )
          ) : null}
        </>
      );
    case "transactions": {
      const open = m.total - m.booked;
      return (
        <span className="v3ms__line">
          <span>{`${formatCount(m.booked)} von ${formatCount(m.total)} gebucht`}</span>
          {open > 0 ? (
            <>
              <span>·</span>
              {m.openHref ? <Link href={m.openHref}>{`${formatCount(open)} offen`}</Link> : <span>{`${formatCount(open)} offen`}</span>}
            </>
          ) : null}
        </span>
      );
    }
    case "export":
      if (!m.filing) return null;
      return (
        <>
          <span className="v3ms__line">
            <StatusBadge axis="document_filing" status={m.filing.status} info={false} />
            {m.filing.message ? <span>{m.filing.message}</span> : null}
          </span>
          {m.filing.path ? <span className="v3ms__path">{m.filing.path}</span> : null}
        </>
      );
  }
}
