"use client";

import type { ReactNode } from "react";

import { daysBetween, formatTime, formatTimeFull } from "../format";
import { Disclosure } from "../primitives/Disclosure";
import { Skeleton } from "../primitives/Skeleton";
import { TextButton } from "../primitives/TextButton";
import { StateIcon, type StateKind } from "./Review";

/**
 * What happened, and when (0023).
 *
 * Seven places in the app build their own strand today. The strand instead of
 * a list exists for one reason: a gap is a statement. Two weeks without an
 * event say something a table cannot.
 *
 * The entries come unsorted — sorting is the component's job, so no caller
 * has to remember the direction.
 */

export interface TimelineItem {
  id: string;
  /**
   * When it happened: an ISO timestamp, or a calendar day `YYYY-MM-DD` where
   * the source column is a date. „26.08.2026 00:00" would be a lie — a day
   * shows no time (0040).
   */
  at: string;
  /** What happened — one sentence, not a paragraph. */
  title: string;
  /**
   * Kind of event, in the caller's words: „Beleg", „Zahlung", „Rückfrage".
   * Without it — and without `actor` — the entry has no second line.
   */
  kind?: string;
  /** Who caused it: „Agent", „Kanzlei", „System". */
  actor?: string;
  /** Icon of the kind, in front of the title; carries its word as `title`. */
  icon?: ReactNode;
  /** Superseded, withdrawn, historic: the entry steps back but stays readable. */
  dim?: boolean;
  /** Longer text, folded away. */
  detail?: ReactNode;
  /** Amount, number, account — what hangs on this event. */
  right?: ReactNode;
  state?: StateKind;
}

/** A date column, not a timestamp: `2026-08-26`. */
const DAY_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Below this a gap is normal work; above it, it is worth saying. */
const GAP_DAYS = 7;

function groupKey(iso: string, by: "day" | "month" | "none") {
  if (by === "none") return "";
  return by === "month" ? formatTime(iso, "month") : formatTime(iso, "date", "long");
}

/**
 * @when    „Why does this stand the way it stands?" — the history of a case, a
 *          document, a run.
 * @instead Many rows, severity, payload, filtering → LogList; the Timeline
 *          tells the story, the Log proves it. Known steps in a fixed order →
 *          ProcessStepper or StepRail. Two states compared → ComparisonTable.
 *          Work to be done → TodoList.
 */
export function Timeline({
  entries,
  order = "newest",
  groupBy = "day",
  emptyText = "Noch nichts geschehen.",
  kindLabels,
  gapDays = GAP_DAYS,
  loading,
  onOpen,
  selectedId,
}: {
  /** Unsorted is fine — the component sorts by `at`. */
  entries: TimelineItem[];
  order?: "newest" | "oldest";
  groupBy?: "day" | "month" | "none";
  emptyText?: string;
  /**
   * German word per `kind`. Stays a prop until `src/ludwig/` carries an event
   * type — the component invents no vocabulary (spec 0023, „Befund").
   */
  kindLabels?: Record<string, string>;
  /**
   * From how many days without an event the gap is worth a line. Seven is the
   * working week: what falls inside it is normal, what stands above it is a
   * statement. A strand of years sets it higher, a strand of one day lower.
   */
  gapDays?: number;
  loading?: boolean;
  /** Without it an entry is text, not a control. */
  onOpen?: (id: string) => void;
  /** The entry that is open next to the strand — marked, `aria-current`. */
  selectedId?: string | null;
}) {
  if (loading) return <Skeleton lines={4} label="Verlauf wird geladen …" />;
  if (entries.length === 0) {
    return <div className="v2tl__empty v2fields__empty">{emptyText}</div>;
  }

  const sorted = [...entries].sort((a, b) =>
    order === "newest" ? b.at.localeCompare(a.at) : a.at.localeCompare(b.at),
  );

  const rows: ReactNode[] = [];
  let lastGroup: string | null = null;
  let lastAt: string | null = null;

  for (const e of sorted) {
    // The gap hangs on the distance between two events, not on the grouping.
    // It used to sit inside the group branch, so `groupBy="none"` never showed
    // one — and that is the mode in which the strand has the least else to
    // say (found in the acceptance of 0107).
    if (lastAt) {
      const days = daysBetween(lastAt, e.at);
      if (days >= gapDays) {
        rows.push(
          <div className="v2tl__gap" key={`gap-${e.id}`}>
            {days} Tage ohne Ereignis
          </div>,
        );
      }
    }
    const key = groupKey(e.at, groupBy);
    if (key && key !== lastGroup) {
      rows.push(
        <div className="v2tl__day" key={`grp-${key}`}>
          {key}
        </div>,
      );
      lastGroup = key;
    }
    lastAt = e.at;
    rows.push(
      <Entry
        key={e.id}
        item={e}
        onOpen={onOpen}
        showDate={groupBy === "none"}
        kindLabels={kindLabels}
        selected={selectedId != null && e.id === selectedId}
      />,
    );
  }

  return <div className="v2tl">{rows}</div>;
}

function Entry({
  item,
  onOpen,
  showDate,
  kindLabels,
  selected,
}: {
  item: TimelineItem;
  onOpen?: (id: string) => void;
  showDate: boolean;
  kindLabels?: Record<string, string>;
  selected: boolean;
}) {
  const dayOnly = DAY_ONLY.test(item.at);
  // Only the title is the target: an amount and a badge are statements, not
  // ways — and inside the button they would stand without a gap.
  const title = <span className="v2tl__title">{item.title}</span>;
  // A kind without a word, and no actor: then the second line would repeat the
  // icon in text — the entry stays one line (0040).
  const second = item.kind ? `${kindLabels?.[item.kind] ?? item.kind}${item.actor ? ` · ${item.actor}` : ""}` : item.actor;
  return (
    <div
      className={`v2tl__item${selected ? " is-current" : ""}${item.dim ? " v2muted" : ""}`}
      aria-current={selected ? "true" : undefined}
    >
      <time
        className="v2tl__when"
        dateTime={dayOnly ? item.at : new Date(item.at).toISOString()}
        title={formatTimeFull(item.at)}
      >
        {dayOnly
          ? showDate
            ? formatTime(item.at, "date")
            : ""
          : `${showDate ? `${formatTime(item.at, "date")} ` : ""}${formatTime(item.at, "time")}`}
      </time>
      <div>
        <div className="v2tl__head">
          {item.icon}
          {item.state ? <StateIcon state={item.state} /> : null}
          {onOpen ? <TextButton onClick={() => onOpen(item.id)}>{title}</TextButton> : title}
          {/* The right-hand end is **one** slot, pushed to the edge as a group.
              Before, only an `Amount` was pushed (`.v2amount { margin-left:
              auto }`), so an entry without one set its badge straight behind
              the title — no column at all (found in the acceptance of 0040).
              What the columns inside the slot are is the entity's business;
              the strand only guarantees the edge. */}
          {item.right ? <span className="v2tl__right">{item.right}</span> : null}
        </div>
        {second ? <div className="v2tl__who">{second}</div> : null}
        {item.detail ? (
          <div className="v2tl__detail">
            <Disclosure summary="Einzelheiten" tone="quiet">
              {item.detail}
            </Disclosure>
          </div>
        ) : null}
      </div>
    </div>
  );
}
