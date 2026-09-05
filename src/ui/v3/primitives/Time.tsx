import { formatDuration, formatTime, formatTimeFull, type TimeFormat, type TimeLength } from "../format";

/**
 * One point in time, six ways to say it — and a duration (0033, P24).
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
 * @instead A span someone picks → DateRangeField. A time span that elapsed →
 *          Duration, below. A date someone types → DateField.
 */
export function Time({
  value,
  format = "dateTime",
  length = "medium",
  size = "md",
  prefix,
}: {
  value: string | Date | null;
  format?: TimeFormat;
  length?: TimeLength;
  size?: TimeSize;
  /** A word in front — „zuletzt", „seit". */
  prefix?: string;
}) {
  if (!value) return <span className="v2muted">—</span>;
  const d = value instanceof Date ? value : new Date(value);
  const text = formatTime(value, format, length);
  return (
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
