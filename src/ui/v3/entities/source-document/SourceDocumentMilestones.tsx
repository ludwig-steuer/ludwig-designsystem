import type { ReactNode } from "react";

import type { EntryDatevStage } from "@/ludwig/modules/entries/domain/entry";
import type { Currency } from "@/ludwig/shared/money";

import { StateIcon, type StateKind } from "../../patterns/Review";
import { StatusBadge } from "../../patterns/StatusBadge";
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
  | { kind: "batch"; at?: string; label: string; status: string; href?: string }
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
              <Row key={m.kind} sign={m.kind === "export" && m.filing?.status === "failed" ? "error" : "done"} word={wordOf(m)} at={m.at}>
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
        <span className="v3ms__line">
          {m.href ? <Link href={m.href}>{m.label}</Link> : <span>{m.label}</span>}
          <StatusBadge axis="export_batch" status={m.status} info={false} />
        </span>
      );
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
