import { useState, type ComponentProps, type ReactNode } from "react";

import type { OpenItemLink } from "@/ludwig/modules/datev-truth/domain/open-item";
import type { CaseFactsVM } from "@/ui/v3/entities/accounting-case/CaseFacts";
import {
  CaseTimeline,
  type CaseTimelineClarification,
  type CaseTimelineEntry,
  type CaseTimelineEvent,
  type CaseTimelineExpectation,
} from "@/ui/v3/entities/accounting-case/CaseTimeline";
import {
  ClarificationList,
  sortForCase,
  type ClarificationVM,
} from "@/ui/v3/entities/clarification/Clarification";
import {
  ClarificationCard,
  type ClarificationDetailVM,
} from "@/ui/v3/entities/clarification/ClarificationCard";
import {
  ClarificationEditor,
  type ClarificationDraft,
} from "@/ui/v3/entities/clarification/ClarificationEditor";
import { AiBookingNotes } from "@/ui/v3/entities/journal-entry/AiBookingNotes";
import { JournalEntryCard, type JournalLine } from "@/ui/v3/entities/journal-entry/JournalEntryCompact";
import {
  OpenItemLinkRow,
  openItemLinkTracks,
  type OpenItemSide,
} from "@/ui/v3/entities/open-item-link/OpenItemLinkRow";
import { OpenPoints, type OpenPoint } from "@/ui/v3/patterns/OpenPoints";
import { StatusBadge } from "@/ui/v3/patterns/StatusBadge";
import { Button } from "@/ui/v3/primitives/Button";
import { FieldList } from "@/ui/v3/primitives/FieldList";
import { StatusCallout } from "@/ui/v3/primitives/StatusCallout";
import { Card, CardHead, HeadRow, Table } from "@/ui/v3/primitives/Table";
import { TextButton } from "@/ui/v3/primitives/TextButton";

import { CasePage } from "./CasePage";
import { accountHref, tabHref } from "./fixtures";
import { ExpectationRow, type ExpectationVM } from "@/ui/v3/entities/expectation/Expectation";
import { EmptyState } from "@/ui/v3/primitives/EmptyState";

/**
 * A case page as **data**: every scenario of 0152 is one `CaseScenario`, and
 * `ScenarioPage` draws the whole page from it.
 *
 * That is the rule from 0144 made structural: two scenarios differ in the case,
 * never in how someone assembled the page. A story that needs something the
 * scenario cannot say is a gap in this type, not a reason for markup in the story.
 */

/** A point in column 2's "open" box. The ways out are labels, drawn as text buttons. */
export interface ScenarioPoint {
  key: string;
  title: string;
  hint?: string;
  state?: OpenPoint["state"];
  ways?: string[];
}

/** One clearing bracket: invoice side, payment side, and the link between them. */
export interface ScenarioBracket {
  link: OpenItemLink;
  invoice: OpenItemSide;
  payment: OpenItemSide;
}

/** Column 2 when an event is selected. */
export interface EventDetail {
  title: string;
  sub: string;
  lines?: JournalLine[];
  /** Who produced the entry — decides what explains it (0152: a rule booking has no judge). */
  origin: "agent" | "rule" | "datev" | "client_import" | "none";
  ai?: Pick<
    ComponentProps<typeof AiBookingNotes>,
    "verdict" | "confidence" | "rationale" | "judgeReasoning" | "sources"
  >;
  rule?: { sentence: string; period: string; needsReview: boolean };
  /** A sentence where an entry would be — why there is none, or why it no longer counts. */
  note?: string;
  brackets?: ScenarioBracket[];
  /** Ways out in column 2; without them the event is read-only. */
  actions?: string[];
}

export interface CaseScenario {
  accountingCase: CaseFactsVM;
  /** Reference day: expectation maturity and clarification state depend on it. */
  today: string;
  /** **One** next step or none — omitted when the case waits on someone else. */
  signal?: Pick<ComponentProps<typeof StatusCallout>, "kicker" | "title" | "tone"> & { action?: string };
  headerAction?: string;
  timelineSub: string;
  events: CaseTimelineEvent[];
  clarifications?: CaseTimelineClarification[];
  expectations?: CaseTimelineExpectation[];
  /** Show only the newest n entries; the rest is one click away in the events tab. */
  timelineLimit?: number;
  todo: {
    sub: string;
    points: ScenarioPoint[];
    emptyText?: string;
    approval?: { caption: string; lines: JournalLine[]; hint?: string };
    facts?: { title: string; rows: [ReactNode, ReactNode][] };
  };
  details: Record<string, EventDetail>;
  /**
   * Questions **and** notes of the case — one table, one list (owner
   * 2026-09-18). With `text` an entry carries its card and folds open.
   */
  clarificationList: ScenarioClarification[];
  initialSelection?: string;
}

/** A question or a note; the detail fields make it a card (0060). */
export type ScenarioClarification = ClarificationVM & Partial<ClarificationDetailVM>;

/** The card of an entry that has one. `answerKind` is a filler for a note — as in the table. */
export const cardOf = (c: ScenarioClarification): (ClarificationVM & ClarificationDetailVM) | null =>
  c.text == null ? null : { ...c, text: c.text, answerKind: c.answerKind ?? "free_text" };

/**
 * Answerable where the firm is the one asked — the page is the firm's
 * (profile: `answer` when `audience` matches the viewer's role).
 */
export const cardMode = (c: ClarificationVM) =>
  c.type === "question" && c.state === "open" && c.audience === "accounting" ? "answer" : "read";

/** What a row folds open to: its card, without the title the row already shows. */
export function renderCard(list: readonly ScenarioClarification[]) {
  return function CardOf(row: ClarificationVM) {
    const found = list.find((c) => c.id === row.id);
    const card = found ? cardOf(found) : null;
    return card ? (
      <ClarificationCard clarification={card} showTitle={false} mode={cardMode(card)} onAnswer={async () => {}} />
    ) : undefined;
  };
}

/** A draft from the editor as the entry the list shows until the page reloads. */
export const fromDraft = (d: ClarificationDraft): ScenarioClarification => ({
  id: `new-${Date.now()}`,
  type: d.type,
  title: d.title,
  text: d.text,
  state: "open",
  severity: d.severity ?? "optional",
  audience: d.audience ?? "accounting",
  raisedAt: new Date().toISOString(),
  sourceModule: "web",
});

/** The key of the todo row. It stands for no record, so it has no id. */
export const TODO_ID = "__todo";

export const entryId = (entry: CaseTimelineEntry) =>
  entry.type === "event"
    ? entry.event.id
    : entry.type === "clarification"
      ? entry.clarification.id
      : entry.expectation.id;

/**
 * The newest `limit` events and clarifications. Expectations stay: they are the
 * future, and there are few.
 */
function newest(
  events: CaseTimelineEvent[],
  clarifications: CaseTimelineClarification[],
  limit: number,
) {
  const dated = [
    ...events.map((e) => ({ id: e.id, at: e.date })),
    ...clarifications.map((c) => ({ id: c.id, at: c.raisedAt })),
  ].sort((a, b) => b.at.localeCompare(a.at));
  const keep = new Set(dated.slice(0, limit).map((d) => d.id));
  return {
    events: events.filter((e) => keep.has(e.id)),
    clarifications: clarifications.filter((c) => keep.has(c.id)),
    hidden: Math.max(0, dated.length - limit),
  };
}

/**
 * "Zu tun" above the strand: the page's default state, not an event. It has no
 * date but behaves like an entry — same selection, same surface on the right.
 */
function TodoRow({ active, sub, onClick }: { active: boolean; sub: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className={active ? "v3todo is-active" : "v3todo"}
      onClick={onClick}
      aria-current={active ? "true" : undefined}
    >
      <span className="v3todo__title">Zu tun</span>
      <span className="v3todo__sub">{sub}</span>
    </button>
  );
}

function StrandCard({
  scenario: s,
  selected,
  onSelect,
}: {
  scenario: CaseScenario;
  selected: string;
  onSelect: (id: string) => void;
}) {
  const all = s.clarifications ?? [];
  const shown = s.timelineLimit
    ? newest(s.events, all, s.timelineLimit)
    : { events: s.events, clarifications: all, hidden: 0 };
  return (
    <Card>
      <CardHead
        title="Ereignisse"
        sub={s.timelineSub}
        actions={
          <TextButton tone="quiet" href={tabHref("events")}>
            vergrößern
          </TextButton>
        }
      />
      <div className="v3boxbody">
        <TodoRow active={selected === TODO_ID} sub={s.todo.sub} onClick={() => onSelect(TODO_ID)} />
        <CaseTimeline
          events={shown.events}
          clarifications={shown.clarifications}
          expectations={s.expectations ?? []}
          today={s.today}
          selectedId={selected}
          onSelect={(entry) => onSelect(entryId(entry))}
        />
        {shown.hidden > 0 ? (
          // The overview shows the newest entries; paging lives in the events tab,
          // where the list has sorting and a pager (0152 W3).
          <TextButton href={tabHref("events")}>
            {`${shown.hidden} ältere Einträge im Reiter Ereignisse`}
          </TextButton>
        ) : null}
      </div>
    </Card>
  );
}

/**
 * „Zu tun": the defects, and every question open for the firm as a row of its
 * own that folds open to its card — answered right here (owner 2026-09-18). A
 * blocking one is open from the start.
 */
function TodoPane({ todo, clarifications }: { todo: CaseScenario["todo"]; clarifications: ScenarioClarification[] }) {
  // What the firm has to answer — a question to the client waits on the
  // client and stands first in the side column, not here.
  const open = sortForCase(clarifications.filter((c) => cardMode(c) === "answer"));
  const points: OpenPoint[] = todo.points.map((p) => ({
    key: p.key,
    title: p.title,
    ...(p.hint ? { hint: p.hint } : {}),
    ...(p.state ? { state: p.state } : {}),
    ...(p.ways?.length
      ? {
          action: (
            <span style={{ display: "inline-flex", gap: 12 }}>
              {p.ways.map((w) => (
                <TextButton key={w} onClick={() => {}}>
                  {w}
                </TextButton>
              ))}
            </span>
          ),
        }
      : {}),
  }));
  return (
    <div className="v2stack">
      <OpenPoints
        points={points}
        emptyText={todo.emptyText ?? "An diesem Sachverhalt ist nichts offen."}
        extra={
          open.length ? <ClarificationList clarifications={open} renderDetail={renderCard(clarifications)} /> : undefined
        }
        extraCount={open.length}
      />
      {todo.approval ? (
        <Card>
          <CardHead title="Fehlende Freigaben" sub="1 Vorschlag" />
          <div className="v3boxbody">
            {todo.approval.hint ? (
              <p className="v2muted" style={{ margin: 0 }}>
                {todo.approval.hint}
              </p>
            ) : null}
            <JournalEntryCard
              lines={todo.approval.lines}
              currency="EUR"
              caption={todo.approval.caption}
              accountHref={accountHref}
              totals={false}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="primary" size="sm">Freigeben</Button>
              <Button variant="secondary" size="sm">Ändern</Button>
            </div>
          </div>
        </Card>
      ) : null}
      {todo.facts ? (
        <Card>
          <CardHead title={todo.facts.title} />
          <div className="v3boxbody">
            <FieldList rows={todo.facts.rows} tone="bare" />
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function BracketCard({ brackets }: { brackets: ScenarioBracket[] }) {
  return (
    <Card>
      <CardHead
        title="Ausgleich"
        sub={brackets.length === 1 ? "1 Klammer" : `${brackets.length} Klammern`}
      />
      <Table cols={openItemLinkTracks} minWidth={980}>
        <HeadRow>
          <span>Klammer</span>
          <span>Belegfeld</span>
          <span className="v2num">Rechnung</span>
          <span className="v2num">Zahlung</span>
          <span className="v2num">zugeordnet</span>
          <span>Herkunft</span>
          <span>Zustand</span>
        </HeadRow>
        {brackets.map((b) => (
          <OpenItemLinkRow key={b.link.id} link={b.link} invoice={b.invoice} payment={b.payment} />
        ))}
      </Table>
    </Card>
  );
}

function EventPane({ detail: d }: { detail: EventDetail }) {
  const ruleRows: [ReactNode, ReactNode][] = d.rule
    ? [
        ["Herkunft", <StatusBadge key="o" axis="journal_entry_origin" status="recurring_rule" info={false} />],
        ["Regel", d.rule.sentence],
        ["Periode", d.rule.period],
        ...(d.rule.needsReview
          ? ([["Prüfen", "Das Regelwerk bittet um einen Blick, bevor die Buchung freigegeben wird."]] as [
              ReactNode,
              ReactNode,
            ][])
          : []),
      ]
    : [];
  return (
    <div className="v2stack">
      <Card>
        <CardHead title={d.title} sub={d.sub} />
        <div className="v3boxbody">
          {d.lines ? <JournalEntryCard lines={d.lines} currency="EUR" accountHref={accountHref} /> : null}
          {d.note ? (
            <p className="v2muted" style={{ margin: 0 }}>
              {d.note}
            </p>
          ) : null}
          {d.origin === "agent" && d.ai ? <AiBookingNotes {...d.ai} /> : null}
          {/* A rule booking carries no rationale, no sources and no judge — its
              explanation is the rule itself and the period (0152). */}
          {d.origin === "rule" ? <FieldList rows={ruleRows} tone="bare" /> : null}
          {d.origin === "client_import" ? (
            <FieldList
              tone="bare"
              rows={[
                ["Herkunft", <StatusBadge key="o" axis="journal_entry_origin" status="client_import" info={false} />],
                ["Urteil", "Keins — der Mandant hat selbst gebucht, die Kanzlei nimmt ab."],
              ]}
            />
          ) : null}
          {d.origin === "datev" ? (
            <p className="v2muted" style={{ margin: 0 }}>
              Diese Buchung steht in DATEV. Ludwig zeigt sie, ändert sie nicht.
            </p>
          ) : null}
          {d.actions?.length ? (
            <div style={{ display: "flex", gap: 8 }}>
              {d.actions.map((a, i) => (
                <Button key={a} variant={i === 0 ? "primary" : "secondary"} size="sm">
                  {a}
                </Button>
              ))}
            </div>
          ) : null}
        </div>
      </Card>
      {d.brackets?.length ? <BracketCard brackets={d.brackets} /> : null}
    </div>
  );
}

/** Column 2 when an expectation is selected: what is awaited, and what settles it. */
function ExpectationPane({ expectation: e, today }: { expectation: CaseTimelineExpectation; today: string }) {
  return (
    <Card>
      <CardHead
        title={e.kind === "document" ? "Erwarteter Beleg" : "Erwartete Zahlung"}
        sub={`fällig am ${e.dueDate.split("-").reverse().join(".")}`}
      />
      <div className="v3boxbody">
        <ExpectationRow expectation={toExpectation(e)} today={today} currency={e.currency} />
        <p className="v2muted" style={{ margin: 0 }}>
          {e.kind === "document"
            ? "Erledigt sich, sobald der Beleg eingeht — nicht durch eine Antwort."
            : "Erledigt sich, sobald die Zahlung eingeht oder der Saldo auf der Belegnummer aufgeht."}
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="secondary" size="sm">
            Erledigt
          </Button>
          <Button variant="secondary" size="sm">
            Aufheben
          </Button>
        </div>
      </div>
    </Card>
  );
}

/** A clarification known only from the strand, as the list row needs it. */
const fromStrand = (c: CaseTimelineClarification): ClarificationVM => ({
  id: c.id,
  title: c.title,
  type: c.type,
  severity: c.severity,
  audience: c.audience ?? "accounting",
  raisedAt: c.raisedAt,
  answeredAt: c.answeredAt ?? null,
  state: c.answeredAt ? "answered" : "open",
  href: `?tab=rueckfragen&klaerung=${c.id}`,
});

/**
 * Column 2 when a clarification is selected in the strand: the strand is the
 * preview, this is the large view — answered right here (owner 2026-09-18).
 */
function ClarificationPane({
  clarification: c,
  card,
}: {
  clarification: ClarificationVM;
  card: (ClarificationVM & ClarificationDetailVM) | null;
}) {
  return (
    <Card>
      <CardHead
        title="Rückfrage"
        sub={c.state === "open" ? "offen" : c.state === "answered" ? "beantwortet" : ""}
        actions={
          <TextButton tone="quiet" href={c.href ?? tabHref("clarifications")}>
            Im Reiter öffnen
          </TextButton>
        }
      />
      <div className="v3boxbody">
        {card ? (
          <ClarificationCard clarification={card} mode={cardMode(card)} onAnswer={async () => {}} />
        ) : (
          <ClarificationList clarifications={[c]} empty={{ title: "Keine Rückfragen." }} />
        )}
      </div>
    </Card>
  );
}

export function clarificationSub(list: readonly ClarificationVM[]) {
  const questions = list.filter((c) => c.type === "question");
  const open = questions.filter((c) => c.state === "open").length;
  const answered = questions.filter((c) => c.state === "answered").length;
  const notes = list.length - questions.length;
  if (list.length === 0) return "keine";
  return [
    open ? `${open} offen` : null,
    answered ? `${answered} beantwortet` : null,
    notes ? (notes === 1 ? "1 Notiz" : `${notes} Notizen`) : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

/** Column 3 — notes and clarifications. An answerable question stands on top. */
/**
 * Who fetches it (F125). The office in 121 of 135 in stock (survey 2026-09-11),
 * so that is what the showcase assumes; the strand carries no audience.
 */
const toExpectation = (e: CaseTimelineExpectation): ExpectationVM => ({
  id: e.id,
  kind: e.kind,
  dueDate: e.dueDate,
  escalationLevel: e.escalationLevel,
  audience: "accounting",
  expectedCounterpartyName: e.counterpartyName ?? null,
  expectedAmount: e.amount ?? null,
  resolvedAt: e.resolvedAt ?? null,
});

/** What the case still waits for — read along, beside notes and questions (owner 2026-09-11). */
function ExpectationsCard({ scenario: s }: { scenario: CaseScenario }) {
  const open = (s.expectations ?? []).filter((e) => !e.resolvedAt);
  return (
    <Card>
      <CardHead title="Erwartungen" sub={open.length ? `${open.length} offen` : "keine"} />
      <div className="v3boxbody">
        {open.length ? (
          open.map((e) => (
            <ExpectationRow key={e.id} expectation={toExpectation(e)} today={s.today} currency={e.currency} />
          ))
        ) : (
          <EmptyState inline title="Keine Erwartungen offen." description="Ludwig wartet bei diesem Fall auf keinen Beleg und keine Zahlung." />
        )}
      </div>
    </Card>
  );
}

/**
 * Questions and notes in **one** card: they share a table and a timeline in
 * the data, and apart they looked like two things (owner 2026-09-18). Open and
 * blocking first; every row folds open to its card, the form sits below it,
 * folded.
 */
export function ClarificationsCard({
  list,
  onAdd,
}: {
  list: readonly ScenarioClarification[];
  onAdd?: (entry: ScenarioClarification) => void;
}) {
  return (
    <Card>
      <CardHead
        title="Rückfragen und Notizen"
        sub={clarificationSub(list)}
        actions={
          <TextButton tone="quiet" href={tabHref("clarifications")}>
            Alle
          </TextButton>
        }
      />
      <div className="v3boxbody">
        <ClarificationList
          clarifications={sortForCase(list)}
          renderDetail={renderCard(list)}
          // Open blocking questions stand open in „Zu tun" already.
          openBlocking={false}
          empty={{ title: "Keine Rückfragen und keine Notizen." }}
        />
        {onAdd ? (
          <ClarificationEditor
            defaultType="comment"
            unfoldLabel="Notiz oder Rückfrage hinzufügen"
            onSubmit={async (d) => onAdd(fromDraft(d))}
          />
        ) : null}
      </div>
    </Card>
  );
}

/** Column 3 — questions and notes, then what the case still waits for. */
function NotesColumn({ scenario: s }: { scenario: CaseScenario }) {
  const [list, setList] = useState(s.clarificationList);
  return (
    <div className="v2stack">
      <ClarificationsCard list={list} onAdd={(entry) => setList((l) => [entry, ...l])} />
      <ExpectationsCard scenario={s} />
    </div>
  );
}

/**
 * Column 2 for the selected entry — an event, an expectation or a
 * clarification; nothing selected is „Zu tun". Every selectable entry changes
 * this pane (acceptance 0152), and the overview and the events tab show the
 * same one.
 */
export function EntryPane({ scenario: s, selected }: { scenario: CaseScenario; selected: string }) {
  const detail = s.details[selected];
  const expectation = s.expectations?.find((e) => e.id === selected);
  const strand = s.clarifications?.find((c) => c.id === selected);
  const listed = s.clarificationList.find((c) => c.id === selected);
  const clarification = listed ?? (strand ? fromStrand(strand) : undefined);
  if (detail) return <EventPane detail={detail} />;
  if (expectation) return <ExpectationPane expectation={expectation} today={s.today} />;
  if (clarification) {
    return (
      <ClarificationPane clarification={clarification} card={listed ? cardOf(listed) : null} />
    );
  }
  return <TodoPane todo={s.todo} clarifications={s.clarificationList} />;
}

/**
 * The overview tab of one scenario: strand left, workspace in the middle, notes
 * right. Selecting an entry changes **only** column 2.
 */
export function ScenarioPage({ scenario: s }: { scenario: CaseScenario }) {
  const [selected, setSelected] = useState<string>(s.initialSelection ?? TODO_ID);
  const { action, ...callout } = s.signal ?? { kicker: "", title: "" };
  return (
    <CasePage
      accountingCase={s.accountingCase}
      signal={
        s.signal ? (
          <StatusCallout
            {...callout}
            actions={action ? <Button variant="primary" size="sm">{action}</Button> : undefined}
          />
        ) : undefined
      }
      actions={s.headerAction ? <Button variant="secondary" size="sm">{s.headerAction}</Button> : undefined}
      timeline={<StrandCard scenario={s} selected={selected} onSelect={setSelected} />}
      notes={<NotesColumn scenario={s} />}
    >
      <EntryPane scenario={s} selected={selected} />
    </CasePage>
  );
}
