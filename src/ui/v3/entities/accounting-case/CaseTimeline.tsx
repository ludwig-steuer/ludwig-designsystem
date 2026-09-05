"use client";

import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  BanknoteArrowDown,
  FileQuestionMark,
  FileText,
  History,
  MessageCircleQuestionMark,
  Repeat,
  SlidersHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  clarificationState,
  expectationMaturity,
  type CaseDisposition,
  type ClarificationType,
  type ExpectationKind,
} from "@/ludwig/modules/accounting-cases/domain/case";
import type { Currency } from "@/ludwig/shared/money";
import { resolveStatus } from "@/ludwig/ui/status/status-registry";
import { Amount } from "../../primitives/Amount";
import { StatusBadge } from "../../patterns/StatusBadge";
import { Timeline, type TimelineItem } from "../../patterns/Timeline";

/**
 * The history of a case, in one strand (0040).
 *
 * Three tables answer one question — „what happened, what is still missing?":
 * events, clarification **questions** and the expectations that are still
 * open. Comments (`type = "comment"`) are skipped — they are context at the
 * case, not something that happened, and 13 of 166 rows in the data are
 * comments: in the strand they would flood the story (Owner 2026-09-04).
 * They stay visible where they belong, in `ClarificationList` (0059).
 *
 * Today those three sources stand in three places and every card carries five
 * lines; here every entry is **one** line: day · kind · title · amount · state.
 * Everything else — file, summary, journal entry, answer — belongs into the
 * detail next to the strand.
 *
 * The component owns the **mapping**, not the truth: which column carries the
 * line, which axis carries the state. It derives no state itself —
 * `clarificationState` and `expectationMaturity` come from `src/ludwig/`, the
 * booking state comes ready from the app.
 */

/** One row of `ludwig.client_accounting_event`; the app merges bookings first. */
export interface CaseTimelineEvent {
  id: string;
  /**
   * `kind` — CHECK: document_received · payment_in · payment_out ·
   * internal_transfer · adjustment · accrual · open_item_carryover. Stays a
   * `string` until the mirror carries the type (finding 1 of 0040).
   */
  kind: string;
  /** `event_date`, calendar day `YYYY-MM-DD`. */
  date: string;
  /** `title`, or the default the app derives — this component derives none. */
  title: string;
  /** `amount`; `null` or 0 means „not set" — then no amount. */
  amount: number | null;
  currency: Currency;
  /** Value of axis `ereignis`: open · proposed · accepted · posted · … */
  state: string;
  /** `superseded_by_event_id` is set. */
  superseded?: boolean;
  /** `no_booking_required_reason` — the tooltip of the badge. */
  stateNote?: string | null;
}

/** One row of `ludwig.client_accounting_case_clarification`. */
export interface CaseTimelineClarification {
  id: string;
  type: ClarificationType;
  title: string;
  /** `created_at` — the strand shows the day, the detail the time. */
  raisedAt: string;
  answeredAt?: string | null;
  deferredUntil?: string | null;
  severity: "required" | "optional";
  /** Detail only. */
  audience?: CaseDisposition;
}

/** One row of `ludwig.client_accounting_case_expectation`. */
export interface CaseTimelineExpectation {
  id: string;
  kind: ExpectationKind;
  /** `due_date`, calendar day — the only entry that lies in the future. */
  dueDate: string;
  escalationLevel: number;
  /** `resolved_at` — set means: not rendered, the resolving event is in the strand. */
  resolvedAt?: string | null;
  counterpartyName?: string | null;
  amount?: number | null;
  /** The table has no currency column — the caller passes the case's (finding 4). */
  currency: Currency;
}

/** What `onSelect` returns and what `selectedId` matches. */
export type CaseTimelineEntry =
  | { type: "event"; event: CaseTimelineEvent }
  | { type: "clarification"; clarification: CaseTimelineClarification }
  | { type: "expectation"; expectation: CaseTimelineExpectation };

/** One icon per kind. The word comes from the registry or from `kindLabels`. */
const EVENT_ICON: Record<string, LucideIcon> = {
  document_received: FileText,
  payment_in: ArrowDownLeft,
  payment_out: ArrowUpRight,
  internal_transfer: ArrowLeftRight,
  adjustment: SlidersHorizontal,
  accrual: Repeat,
  open_item_carryover: History,
};

/** No icon without a word (T8, V7) — it sits on the wrapper, where it is read. */
function KindIcon({ of: Glyph, label }: { of: LucideIcon; label: string }) {
  return (
    <span className="v2tl__kind" role="img" aria-label={label} title={label}>
      <Glyph size={14} strokeWidth={1.5} aria-hidden="true" />
    </span>
  );
}

/** The strand is day-exact: a timestamp is cut to its day (finding 5 of 0040). */
function day(iso: string): string {
  return iso.slice(0, 10);
}

function amountCell(value: number | null | undefined, currency: Currency, negative = false) {
  if (value === null || value === undefined || value === 0) return null;
  return <Amount value={negative ? -Math.abs(value) : value} currency={currency} size="sm" />;
}

/**
 * @when    The history of one accounting case: events, clarifications and open
 *          expectations in one strand, next to the detail of the selected entry.
 * @instead A history that is not a case → Timeline. What is to be done →
 *          TodoList. Two states compared → ComparisonTable. The technical
 *          trail (actor, action, outcome) → the „Historie" tab.
 */
export function CaseTimeline({
  events,
  clarifications = [],
  expectations = [],
  selectedId,
  onSelect,
  kindLabels,
  today,
  loading,
}: {
  events: CaseTimelineEvent[];
  clarifications?: CaseTimelineClarification[];
  expectations?: CaseTimelineExpectation[];
  selectedId?: string | null;
  /** Without it the strand is text, not a control. */
  onSelect?: (entry: CaseTimelineEntry) => void;
  /**
   * German word per event kind — a transition until the registry carries the
   * axis `ereignis_art` (finding 1 of 0040).
   */
  kindLabels?: Record<string, string>;
  /** Reference day `YYYY-MM-DD` for maturity and clarification state. */
  today?: string;
  loading?: boolean;
}) {
  const byId = new Map<string, CaseTimelineEntry>();
  const items: TimelineItem[] = [];

  // Same day: expectation before clarification before event — the strand is
  // sorted stably, so this order survives (0040).
  for (const e of expectations) {
    if (e.resolvedAt) continue;
    const maturity = expectationMaturity({
      dueDate: e.dueDate,
      escalationLevel: e.escalationLevel,
      resolvedAt: e.resolvedAt,
      today,
    });
    const word = resolveStatus("erwartung_art", e.kind).label;
    byId.set(e.id, { type: "expectation", expectation: e });
    items.push({
      id: e.id,
      at: e.dueDate,
      title: e.counterpartyName ? `${word}: ${e.counterpartyName}` : word,
      icon: (
        <KindIcon of={e.kind === "payment" ? BanknoteArrowDown : FileQuestionMark} label={word} />
      ),
      right: (
        <>
          {amountCell(e.amount, e.currency)}
          <StatusBadge axis="erwartung" status={maturity} info={false} />
        </>
      ),
    });
  }

  for (const c of clarifications) {
    // A comment is not an event — see the note at the top of this file.
    if (c.type === "comment") continue;
    const state = clarificationState({
      answeredAt: c.answeredAt,
      deferredUntil: c.deferredUntil,
      today,
    });
    const word = resolveStatus("klaerung_typ", c.type).label;
    byId.set(c.id, { type: "clarification", clarification: c });
    items.push({
      id: c.id,
      at: day(c.raisedAt),
      title: c.title,
      icon: <KindIcon of={MessageCircleQuestionMark} label={word} />,
      right: (
        <>
          <StatusBadge axis="klaerung_status" status={state} info={false} />
          {/* Blocking is a second axis, and only while the question is open. */}
          {state !== "answered" && c.severity === "required" ? (
            <StatusBadge axis="klaerung" status="required" info={false} />
          ) : null}
        </>
      ),
    });
  }

  for (const ev of events) {
    const label = kindLabels?.[ev.kind] ?? ev.kind;
    const Glyph = EVENT_ICON[ev.kind] ?? FileText;
    byId.set(ev.id, { type: "event", event: ev });
    items.push({
      id: ev.id,
      at: ev.date,
      title: ev.title,
      icon: <KindIcon of={Glyph} label={label} />,
      right: (
        <>
          {amountCell(ev.amount, ev.currency, ev.kind === "payment_out")}
          {/*
            A superseded event is not worked on any more: it carries that state
            instead of its booking state; the entry itself stays selectable.
            `stateNote` („keine Buchung nötig, weil …") hangs on the badge as a
            tooltip — in the line it would be a fifth column.
          */}
          <span title={ev.stateNote ?? undefined}>
            <StatusBadge
              axis="ereignis"
              status={ev.superseded ? "superseded" : ev.state}
              info={false}
            />
          </span>
        </>
      ),
      dim: ev.superseded,
    });
  }

  return (
    <Timeline
      entries={items}
      loading={loading}
      selectedId={selectedId}
      emptyText="Noch nichts geschehen."
      onOpen={
        onSelect
          ? (id) => {
              const entry = byId.get(id);
              if (entry) onSelect(entry);
            }
          : undefined
      }
    />
  );
}
