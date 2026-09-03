"use client";

import type { ReactNode } from "react";
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
  /** ISO point in time. An event without a time does not belong in a strand. */
  at: string;
  /** What happened — one sentence, not a paragraph. */
  title: string;
  /** Kind of event, in the caller's words: „Beleg", „Zahlung", „Rückfrage". */
  kind: string;
  /** Who caused it: „Agent", „Kanzlei", „System". */
  actor?: string;
  /** Longer text, folded away. */
  detail?: ReactNode;
  /** Amount, number, account — what hangs on this event. */
  right?: ReactNode;
  state?: StateKind;
}

const DAY = new Intl.DateTimeFormat("de-DE", {
  timeZone: "Europe/Berlin",
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});
const MONTH = new Intl.DateTimeFormat("de-DE", {
  timeZone: "Europe/Berlin",
  month: "long",
  year: "numeric",
});
const TIME = new Intl.DateTimeFormat("de-DE", {
  timeZone: "Europe/Berlin",
  hour: "2-digit",
  minute: "2-digit",
});

const DAY_MS = 24 * 60 * 60 * 1000;
/** Below this a gap is normal work; above it, it is worth saying. */
const GAP_DAYS = 7;

function groupKey(iso: string, by: "day" | "month" | "none") {
  if (by === "none") return "";
  const d = new Date(iso);
  return by === "month" ? MONTH.format(d) : DAY.format(d);
}

/**
 * @when    „Why does this stand the way it stands?" — the history of a case, a
 *          document, a run, an audit trail.
 * @instead Known steps in a fixed order → ProcessStepper or StepRail. Two
 *          states compared → ComparisonTable. Work to be done → TodoList.
 */
export function Timeline({
  entries,
  order = "newest",
  groupBy = "day",
  emptyText = "Noch nichts geschehen.",
  loading,
  onOpen,
}: {
  /** Unsorted is fine — the component sorts by `at`. */
  entries: TimelineItem[];
  order?: "newest" | "oldest";
  groupBy?: "day" | "month" | "none";
  emptyText?: string;
  loading?: boolean;
  /** Without it an entry is text, not a control. */
  onOpen?: (id: string) => void;
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
    const key = groupKey(e.at, groupBy);
    if (key && key !== lastGroup) {
      if (lastAt) {
        const days = Math.floor(Math.abs(new Date(e.at).getTime() - new Date(lastAt).getTime()) / DAY_MS);
        if (days >= GAP_DAYS) {
          rows.push(
            <div className="v2tl__gap" key={`gap-${e.id}`}>
              {days} Tage ohne Ereignis
            </div>,
          );
        }
      }
      rows.push(
        <div className="v2tl__day" key={`grp-${key}`}>
          {key}
        </div>,
      );
      lastGroup = key;
    }
    lastAt = e.at;
    rows.push(<Entry key={e.id} item={e} onOpen={onOpen} showDate={groupBy === "none"} />);
  }

  return <div className="v2tl">{rows}</div>;
}

function Entry({
  item,
  onOpen,
  showDate,
}: {
  item: TimelineItem;
  onOpen?: (id: string) => void;
  showDate: boolean;
}) {
  const when = new Date(item.at);
  const head = (
    <>
      <span className="v2tl__title">{item.title}</span>
      {item.right}
    </>
  );
  return (
    <div className="v2tl__item">
      <span className="v2tl__when" title={DAY.format(when)}>
        {showDate ? `${when.toLocaleDateString("de-DE")} ` : ""}
        {TIME.format(when)}
      </span>
      <div>
        <div className="v2tl__head">
          {item.state ? <StateIcon state={item.state} /> : null}
          {onOpen ? (
            <TextButton onClick={() => onOpen(item.id)}>{head}</TextButton>
          ) : (
            head
          )}
        </div>
        <div className="v2tl__who">
          {item.kind}
          {item.actor ? ` · ${item.actor}` : ""}
        </div>
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
