import {
  formatDuration,
  formatTime,
  formatTimeFull,
  formatTimeRange,
  type TimeFormat,
  type TimeLength,
  type TimeRangeFormat,
} from "../format";
import { ValueHint, type CellHint } from "./Cells";

/**
 * One point in time, six ways to say it — a duration, and a span (0033, 0189).
 *
 * Nine formatters and 83 `toLocale*` calls said „when" in nine ways, most of
 * them without a time zone: two hours off, and before 02:00 a day off.
 * Everything here is Europe/Berlin (R3).
 */

export type TimeSize = "sm" | "md";

/**
 * @when    Every point in time that is shown: document date, timestamp, the
 *          written-out day (`date` with `long`), the clock alone where the day
 *          already stands above it (`time`, a strand grouped by day), „how
 *          long ago" (`relative`, a date beyond a week), the age of something
 *          still waiting (`age`, always in days), a month on an axis.
 * @instead A span to read → DateRange, below. A span someone picks →
 *          DateRangeField. A time span that elapsed → Duration, below. A date
 *          someone types → DateField.
 */
export function Time({
  value,
  format = "dateTime",
  length = "medium",
  size = "md",
  prefix,
  hint,
}: {
  value: string | Date | null;
  format?: TimeFormat;
  length?: TimeLength;
  size?: TimeSize;
  /** A word in front — „zuletzt", „seit". */
  prefix?: string;
  /** A note on the point in time — the same sign as in a table cell (0197). */
  hint?: CellHint;
}) {
  const mark = hint ? <ValueHint hint={hint} side="after" /> : null;
  if (!value) {
    return (
      <span className="v2muted">
        —{mark}
      </span>
    );
  }
  const d = value instanceof Date ? value : new Date(value);
  const text = formatTime(value, format, length);
  const out = (
    <time
      className={`v2time v2time--${size}`}
      dateTime={Number.isNaN(d.getTime()) ? undefined : d.toISOString()}
      // The full form is always reachable: a relative time alone („vor 3
      // Tagen") is no answer when someone checks a period (T7).
      title={formatTimeFull(value)}
    >
      {prefix ? `${prefix} ` : ""}
      {text}
    </time>
  );
  return mark ? (
    <span>
      {out}
      {mark}
    </span>
  ) : (
    out
  );
}

/**
 * @when    How long something took or has been running — a run, a step, a job.
 * @instead A point in time → Time. A share of something → Progress.
 */
export function Duration({
  seconds,
  size = "md",
}: {
  seconds: number | null;
  size?: TimeSize;
}) {
  return (
    <span className={`v2time v2time--${size}${seconds === null ? " v2muted" : ""}`}>
      {formatDuration(seconds)}
    </span>
  );
}

/**
 * @when    A span between two points, read not picked — the period of a
 *          batch, the coverage of a statement, first and last movement of an
 *          account. The shared part is said once: `01.–31.03.2026`.
 * @instead A span someone picks → DateRangeField. One point → Time. Elapsed
 *          seconds → Duration. An open end with a word („seit") → Time with
 *          `prefix`.
 */
export function DateRange({
  from,
  to,
  format = "date",
  length = "medium",
  size = "md",
}: {
  from: string | Date | null;
  to: string | Date | null;
  format?: TimeRangeFormat;
  length?: TimeLength;
  size?: TimeSize;
}) {
  const text = formatTimeRange(from, to, format, length);
  const both = from && to && text !== "—";
  // The title follows the swap: a span has no direction, its tooltip neither.
  const [a, b] = both && new Date(from) > new Date(to) ? [to, from] : [from, to];
  // ponytail: one <span>, not two <time> — a folded span has no seam to cut at; formatRangeToParts if a parser ever asks.
  return (
    <span
      className={`v2time v2time--${size}${text === "—" ? " v2muted" : ""}`}
      title={both ? `${formatTimeFull(a)} – ${formatTimeFull(b)}` : undefined}
    >
      {text}
    </span>
  );
}
