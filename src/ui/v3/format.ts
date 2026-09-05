import type { Currency, Money } from "@/ludwig/shared/money";

/**
 * The one formatter (P24, tasks 0032 and 0033).
 *
 * Seven money formatters, nine date formatters and 83 `toLocale*` calls in 64
 * files formatted the same values differently — and most of them without a
 * time zone, which is two hours off and, before 02:00, a day off.
 *
 * These are plain functions on purpose: a mail text, a CSV export and a file
 * name need the same rules and have no React around them. The components
 * `Amount` and `Time` render what these return.
 */

/** Everything here is Europe/Berlin. Ludwig has no second time zone (R3). */
const TZ = "Europe/Berlin";
const LOCALE = "de-DE";

/* ── Beträge ────────────────────────────────────────────────────────────── */

const MONEY = new Map<string, Intl.NumberFormat>();
const DECIMAL = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function moneyFormat(currency: Currency) {
  let f = MONEY.get(currency);
  if (!f) {
    f = new Intl.NumberFormat(LOCALE, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    MONEY.set(currency, f);
  }
  return f;
}

/**
 * `1.249,90 €` — always two decimals, always the currency of the value.
 *
 * `signed` also puts a `+` in front of positive numbers; that is for
 * deviations, where the direction is the message. The sign never carries
 * colour (A7) — that is the caller's `tone`, and it is about the number.
 */
export function formatAmount(
  value: number | Money | null,
  /** `null` is a decimal without a currency — a count, a quantity. */
  currency?: Currency | null,
  signed = false,
): string {
  if (value === null) return "—";
  const isMoney = typeof value === "object";
  const n = isMoney ? value.amount.toNumber() : value;
  const c = isMoney ? value.currency : currency;
  if (c === undefined) throw new Error("formatAmount: eine nackte Zahl braucht eine Währung.");
  const text = c === null ? DECIMAL.format(n) : moneyFormat(c).format(n);
  return signed && n > 0 ? `+${text}` : text;
}

/* ── Zeitpunkte ─────────────────────────────────────────────────────────── */

export type TimeFormat = "date" | "dateTime" | "time" | "relative" | "age" | "month";
export type TimeLength = "short" | "medium" | "long";

const DATE = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TZ,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
const MONTH = new Intl.DateTimeFormat(LOCALE, { timeZone: TZ, month: "long", year: "numeric" });
/** The written-out day — a group header over a strand of events. */
const DATE_LONG = new Intl.DateTimeFormat(LOCALE, { timeZone: TZ, dateStyle: "full" });
/** The clock alone, for a place where the day already stands above it. */
const CLOCK = new Intl.DateTimeFormat(LOCALE, { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
const DT_SHORT = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TZ,
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});
const DT_MEDIUM = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TZ,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const DT_LONG = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TZ,
  dateStyle: "full",
  timeStyle: "short",
});
const RELATIVE = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto" });

/** `2026-08-26` — a calendar day, ten characters, no time, no zone. */
const CALENDAR_DAY = /^\d{4}-\d{2}-\d{2}$/;
/** The parts of a calendar day in Berlin — for `calendarDay` below. */
const ISO_DAY = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * A calendar day must not travel. `new Date("2026-08-26")` is UTC midnight,
 * and formatting that in Europe/Berlin hands back the 25th — which is how a
 * Belegdatum turns into the day before.
 *
 * Building it in **local** time has the same fault from the other side: on a
 * machine east of Berlin, local midnight is still the previous day there, so
 * Tokyo showed the 25th and a new year's day showed 31 December. The day is
 * therefore anchored at **12:00 UTC** — far enough from both edges that every
 * offset between −11 and +12 lands on the same calendar day in Berlin.
 */
function toDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  if (CALENDAR_DAY.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(Date.UTC(y!, m! - 1, d!, 12));
  }
  return new Date(value);
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
/** Beyond a week „vor 43 Tagen" is no answer — the date is. */
const RELATIVE_LIMIT = 7 * DAY;

/**
 * Whole days between two points in time — what a strand needs to say „20 Tage
 * ohne Ereignis".
 *
 * It lives here and not in the caller because of `toDate`: a calendar day has
 * to be anchored at 12:00 UTC, otherwise the count tips by one as soon as a
 * `YYYY-MM-DD` and a timestamp are compared (found in the acceptance of 0023).
 *
 * @when    The distance between two points in days — a gap, an age in a list.
 * @instead How long ago something was, in words → formatTime with `age`.
 */
/**
 * The calendar day a point in time falls on **in Berlin**, as `YYYY-MM-DD`.
 *
 * The tempting one-liner is `iso.slice(0, 10)`, and it is wrong for the two
 * hours every night in which Berlin is already on the next day:
 * `2026-08-25T22:30:00Z` is the 26th at 00:30 here, and the cut makes the 25th
 * of it — a question raised at night would stand a day too early in a strand
 * (R3, found in the acceptance of 0040).
 *
 * @when    A timestamp has to become the day it belongs to — grouping, a
 *          strand that is day-exact, a key.
 * @instead The day for a **reader** → formatTime with `date`.
 */
export function calendarDay(value: string | Date): string {
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) return "";
  const parts = ISO_DAY.formatToParts(d);
  const at = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${at("year")}-${at("month")}-${at("day")}`;
}

export function daysBetween(a: string | Date, b: string | Date): number {
  const from = toDate(a);
  const to = toDate(b);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 0;
  return Math.floor(Math.abs(to.getTime() - from.getTime()) / DAY);
}

function formatRelative(d: Date, now: Date): string {
  const diff = d.getTime() - now.getTime();
  const abs = Math.abs(diff);
  if (abs >= RELATIVE_LIMIT) return DATE.format(d);
  if (abs < HOUR) return RELATIVE.format(Math.round(diff / MINUTE), "minute");
  if (abs < DAY) return RELATIVE.format(Math.round(diff / HOUR), "hour");
  return RELATIVE.format(Math.round(diff / DAY), "day");
}

/**
 * The six ways Ludwig says „when": the day (`long` writes it out — „Montag,
 * 31. August 2026"), the day with a clock in three lengths, the clock alone
 * where the day already stands above it, how long ago it was, and the month
 * for axes and group headers.
 */
export function formatTime(
  value: string | Date | null,
  format: TimeFormat = "dateTime",
  length: TimeLength = "medium",
  now: Date = new Date(),
): string {
  if (!value) return "—";
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) return "—";
  if (format === "date") return length === "long" ? DATE_LONG.format(d) : DATE.format(d);
  if (format === "time") return CLOCK.format(d);
  if (format === "month") return MONTH.format(d);
  if (format === "relative") return formatRelative(d, now);
  if (format === "age") return formatAge(d, now);
  if (length === "short") return DT_SHORT.format(d);
  if (length === "long") return DT_LONG.format(d);
  return DT_MEDIUM.format(d);
}

/**
 * How long ago, **without** falling back to a date — for things whose age is
 * the point: an open clarification, an overdue item, a waiting expectation.
 * `relative` gives up after a week (T7: a relative time alone is no answer
 * when someone checks a period), but a question that has been open for
 * thirteen days must say so; the exact time stays in the `title` of `Time`.
 */
function formatAge(d: Date, now: Date): string {
  const diff = d.getTime() - now.getTime();
  const abs = Math.abs(diff);
  if (abs < HOUR) return RELATIVE.format(Math.round(diff / MINUTE), "minute");
  if (abs < DAY) return RELATIVE.format(Math.round(diff / HOUR), "hour");
  return RELATIVE.format(Math.round(diff / DAY), "day");
}

/** The full, unambiguous form — what stands in the `title` of a `Time`. */
export function formatTimeFull(value: string | Date | null): string {
  if (!value) return "—";
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) return "—";
  return CALENDAR_DAY.test(String(value)) ? DATE.format(d) : DT_LONG.format(d);
}

/* ── Dauer ──────────────────────────────────────────────────────────────── */

const SECONDS = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/**
 * `4,2 s` · `14 Min` · `2 Std 5 Min`.
 *
 * Below a minute one decimal, because that is where the difference between a
 * fast and a slow run shows. Above it, whole units: nobody reads „2 Std
 * 5 Min 13,4 s".
 */
export function formatDuration(seconds: number | null): string {
  if (seconds === null || Number.isNaN(seconds)) return "—";
  if (seconds < 0) return "—";
  if (seconds < 60) return `${SECONDS.format(seconds)} s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} Min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} Std` : `${hours} Std ${rest} Min`;
}
