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
 *
 * @when    A number has to become a string outside a component — a `title`, an
 *          `aria-label`, a sentence.
 * @instead Drawing the amount → Amount. In a table cell → AmountCell.
 *          Entering one → AmountInput.
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

const COUNT = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });

/**
 * `3.400` — a whole number, the way this country reads it.
 *
 * It stands here and not as a `toLocaleString` call in twenty places: the
 * pagers wrote „1–50 von 3400" and „Konto 412 von 6212" while every number
 * beside them carried its separators (finding L-97, found in the acceptance
 * of 0063). A number that looks different twice in one line is not a detail —
 * it makes the reader work out whether it is the same size.
 *
 * `unit` puts the word behind it, singular only for exactly one:
 * `formatCount(3, ["Seite", "Seiten"])` → „3 Seiten".
 *
 * @when    A count becomes text — pager, counter, stock figure.
 * @instead An amount of money → formatAmount. A file size → formatBytes. A
 *          share of something → Progress.
 */
export function formatCount(value: number, unit?: readonly [one: string, other: string]): string {
  const n = COUNT.format(value);
  // Singular only for exactly one — „0 Seiten", like the language says it.
  return unit ? `${n} ${value === 1 ? unit[0] : unit[1]}` : n;
}

/* ── Ja/Nein, Prozent, IBAN (0199) ─────────────────────────────────────── */

/**
 * `Ja` · `Nein` · `—` — the word, not a tick: a word reads without a legend (V7).
 *
 * @when    A yes/no becomes text — a sentence, a `title`, an export.
 * @instead In a table cell → BooleanCell. A state with more than two values →
 *          StatusBadge.
 */
export function formatBoolean(value: boolean | null): string {
  return value === null ? "—" : value ? "Ja" : "Nein";
}

const PERCENT = new Map<number, Intl.NumberFormat>();

/**
 * `19 %` · `7,5 %` — `value` in **percentage points** (19, not 0,19), like
 * the tax rates and shares the data model carries. The space before `%` does
 * not break.
 *
 * @when    A share or a rate becomes text.
 * @instead In a cell → PercentCell. A deviation with a sign and a step →
 *          DeviationCell. How sure a machine is → Confidence.
 */
export function formatPercent(value: number | null, digits = 0): string {
  if (value === null) return "—";
  let f = PERCENT.get(digits);
  if (!f) {
    f = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: digits, maximumFractionDigits: digits });
    PERCENT.set(digits, f);
  }
  return `${f.format(value)}\u00a0%`;
}

/**
 * `DE12 2505 0000 0123 4567 89` — spaces out, upper case, groups of four.
 * It formats, it does not check (`validateIban` does).
 *
 * @when    An IBAN becomes text.
 * @instead In a cell → IbanCell.
 */
export function formatIban(raw: string | null): string {
  if (!raw) return "—";
  return raw
    .replace(/\s+/g, "")
    .toUpperCase()
    .replace(/(.{4})(?=.)/g, "$1 ");
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
export function daysBetween(a: string | Date, b: string | Date): number {
  const from = toDate(a);
  const to = toDate(b);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 0;
  return Math.floor(Math.abs(to.getTime() - from.getTime()) / DAY);
}

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
 *
 * @when    A date or a time has to become a string outside a component.
 * @instead Drawing it → Time. The full timestamp for an audit line →
 *          formatTimeFull. A span of seconds → formatDuration.
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
  if (format === "relative") return formatRelative(d, now);
  if (format === "age") return formatAge(d, now);
  return formatterFor(format, length).format(d);
}

/** The `Intl` instance behind a format and a length — one table for the point and the span. */
function formatterFor(format: TimeRangeFormat | "time", length: TimeLength): Intl.DateTimeFormat {
  if (format === "date") return length === "long" ? DATE_LONG : DATE;
  if (format === "time") return CLOCK;
  if (format === "month") return MONTH;
  if (length === "short") return DT_SHORT;
  if (length === "long") return DT_LONG;
  return DT_MEDIUM;
}

/** A span reads like a point: no `relative`, no `age`, no clock without its day. */
export type TimeRangeFormat = "date" | "dateTime" | "month";

/**
 * `01.–31.03.2026` · `28.12.2026 – 04.01.2027` · `26.08.2026, 09:12–17:30` ·
 * `März–Mai 2026` — the shared part said once. Where the span folds is the
 * locale's decision (`formatRange`), not ours. One end alone is that end
 * alone; no end is the dash; a reversed pair is swapped, a span has no
 * direction.
 *
 * @when    A span between two points in time becomes a string outside a
 *          component — the period of a batch, the coverage of a statement.
 * @instead Drawing it → DateRange. Elapsed seconds → formatDuration. Whole
 *          days between the ends → daysBetween.
 */
export function formatTimeRange(
  from: string | Date | null,
  to: string | Date | null,
  format: TimeRangeFormat = "date",
  length: TimeLength = "medium",
): string {
  if (!from || !to) return formatTime(from ?? to, format, length);
  const a = toDate(from);
  const b = toDate(to);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return "—";
  const f = formatterFor(format, length);
  // ICU appends „Uhr" to a folded clock range and to nothing else; the
  // points never say it, so the span does not either.
  return (a <= b ? f.formatRange(a, b) : f.formatRange(b, a)).replace(/ Uhr$/, "");
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

/**
 * The full, unambiguous form — what stands in the `title` of a `Time`.
 *
 * @when    An audit line or a tooltip needs the timestamp to the second.
 * @instead Everything a person reads in the interface → formatTime / Time.
 */
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
 *
 * @when    A span of seconds becomes a readable duration.
 * @instead A point in time → formatTime. How long ago it was → formatTime
 *          with the relative format.
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

/**
 * `412 kB` · `2,4 MB` — the size of a file, on the **binary** base.
 *
 * The base is not cosmetic: every upload limit in this set is checked as
 * `mb * 1024 * 1024` (`FileDrop`), so a decimal MB would put a number next to
 * the limit that the limit does not use. Measured: 26 000 000 bytes read
 * „26,0 MB" beside a 25-MB rule that accepted the file — 24,8 MiB. One base,
 * one number.
 *
 * @when    A byte count is shown to someone — list column, drop zone, facts.
 * @instead A share of something → Progress. An amount of money → Amount.
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}
