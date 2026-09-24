import type { ReactNode } from "react";
import type { Currency } from "@/ludwig/shared/money";
import { LEVEL_ICON, type HintLevel } from "../Icons";
import {
  formatAmount,
  formatBoolean,
  formatCount,
  formatIban,
  formatPercent,
  formatTime,
  formatTimeFull,
  formatTimeRange,
  type TimeLength,
  type TimeRangeFormat,
} from "../format";
import { Tooltip } from "./Popover";

/**
 * v2 cell building blocks (F123 T123.1, Baukasten §9) — the types a table
 * column is assembled from.
 *
 * Rule: numbers right with `tnum`, text left, nothing centered (UX guidelines V3).
 * Color only carries meaning where it means a state — and then the word
 * stands next to it (V6/V7).
 */

export type CellTone =
  | "neutral"
  | "muted"
  | "success"
  | "warning"
  /**
   * @deprecated A second colour for one step breaks A7 (A9). It now looks
   * exactly like `warning`; it stays until `deviationTone()` in the app
   * returns the four steps (0197).
   */
  | "warning-strong"
  | "danger";

/**
 * A note on one value — „Saldensprung", „Kurs vom Vortag" (0197).
 *
 * `level` is the step of the scale (A7), not a colour of the value: the value
 * stays as it is, the sign beside it carries the step.
 */
export interface CellHint {
  level: HintLevel;
  /** One sentence; shown on hover **and** focus. */
  text: string;
}

/**
 * The sign of a hint beside a value: a button without a frame, named by its
 * step („Warnung"), the sentence in a `Tooltip`. Not `title` — that reaches
 * neither the keyboard nor a finger.
 *
 * `side` is where it stands: away from the edge the value aligns to, so a
 * column of numbers keeps its units edge and a column of dates its left one.
 *
 * @when    A value in a cell, a header or a sentence carries a note — through
 *          the `hint` prop of the value, not by hand.
 * @instead The state of a whole row → StatusBadge / DotStatus. A result in a
 *          review list → StateIcon.
 */
export function ValueHint({ hint, side = "before" }: { hint: CellHint; side?: "before" | "after" }) {
  const { icon: Icon, color, label } = LEVEL_ICON[hint.level];
  return (
    <Tooltip label={hint.text}>
      <button type="button" className={`v3hint v3hint--${side}`} aria-label={label} style={{ color }}>
        <Icon size={14} strokeWidth={1.5} aria-hidden="true" />
      </button>
    </Tooltip>
  );
}

/**
 * Amount, right-aligned, digits at fixed width.
 *
 * Owner decision F123 §4/4: **no** automatic red for negative values.
 * Every credit note and every credit-side line is negative; if the column
 * colored those, red would be decoration instead of a signal. Where a number
 * really is an alarm (balance difference, open remainder), the caller sets
 * `tone` itself.
 *
 * `null` is a value the column has to carry: plenty of amounts in the data
 * model are `number | null` (an open case has no total yet). It renders the
 * same em dash `Timestamp` uses for a missing date — otherwise every caller
 * writes the same local conditional, and `0,00 €` starts standing in for
 * „not known yet".
 *
 * @when    Every amount in a table cell, known or not.
 * @instead Amount in the page header → KpiTile.
 */
export function AmountCell({
  value,
  currency = "EUR",
  tone = "neutral",
  title,
  signed,
  hint,
}: {
  /** `null` means unknown — rendered as „—", never as zero. */
  value: number | string | null;
  /**
   * `null` is a decimal without a currency. Narrowed from `string` in 0197:
   * the app narrows its raw value with `asCurrency` at the call site.
   */
  currency?: Currency | null;
  tone?: CellTone;
  title?: string;
  /** `+` in front of positive values — without colour (A7). */
  signed?: boolean;
  hint?: CellHint;
}) {
  // Explicitly against null, not falsy: 0 is an amount, and „0,00 €" is a
  // statement — „nothing was booked" is not the same as „we do not know".
  // The em dash keeps the column's geometry: `v2num` first, `v2muted` after.
  // Without it the unknown value stands left in a right-aligned column — found
  // in the acceptance of 0072, and it hits every table with unknown amounts.
  const mark = hint ? <ValueHint hint={hint} /> : null;
  if (value === null) {
    return (
      <span className="v2num v2muted">
        {mark}—
      </span>
    );
  }
  // One formatter for the whole house (P24): the cell only adds its geometry.
  const text = typeof value === "number" ? formatAmount(value, currency, signed) : value;
  return (
    <span className={`v2num${tone === "neutral" ? "" : ` v2num--${tone}`}`} title={title}>
      {mark}
      {text}
    </span>
  );
}

/**
 * A whole number, right-aligned — „3.400", not „3.400,00" (0197).
 *
 * `AmountCell` with `currency: null` is a decimal with two places; a count of
 * transactions has none.
 *
 * @when    A count in a table cell — transactions, pages, lines; with `unit`
 *          when the word belongs beside the number.
 * @instead Money → AmountCell. A share → PercentCell. A deviation → DeviationCell.
 */
export function CountCell({
  value,
  unit,
  hint,
}: {
  /** `null` means unknown — „—", never zero. */
  value: number | null;
  /** „Seite", „Seiten" — singular only for exactly one. */
  unit?: readonly [one: string, other: string];
  hint?: CellHint;
}) {
  const mark = hint ? <ValueHint hint={hint} /> : null;
  return (
    <span className={value === null ? "v2num v2muted" : "v2num"}>
      {mark}
      {value === null ? "—" : formatCount(value, unit)}
    </span>
  );
}

/**
 * Yes or no as a word, left — no tick (0199).
 *
 * @when    A yes/no property in a table column.
 * @instead Done or failed as a sign → an icon cell with a word. A state with
 *          more than two values → StatusBadge.
 */
export function BooleanCell({ value }: { value: boolean | null }) {
  return <span className={value === null ? "v2muted" : undefined}>{formatBoolean(value)}</span>;
}

/**
 * A share or a rate, right-aligned — „19 %" (0199). `value` in percentage points.
 *
 * @when    A tax rate, a share, a quota in a table column.
 * @instead A deviation with sign and step → DeviationCell. How sure a machine
 *          is → Confidence.
 */
export function PercentCell({
  value,
  digits = 0,
  hint,
}: {
  value: number | null;
  /** Decimal places, default none. */
  digits?: number;
  hint?: CellHint;
}) {
  return (
    <span className={value === null ? "v2num v2muted" : "v2num"}>
      {hint ? <ValueHint hint={hint} /> : null}
      {formatPercent(value, digits)}
    </span>
  );
}

/**
 * An IBAN in groups of four, mono, left; the `title` carries it ungrouped
 * for copying (0199).
 *
 * @when    An IBAN in a table cell or a fact row.
 * @instead Another key of digits → MonoCell. The account behind it →
 *          PaymentAccountCell.
 */
export function IbanCell({ value }: { value: string | null }) {
  if (!value) return <span className="v2muted">—</span>;
  return (
    <span className="v2mono" title={value.replace(/\s+/g, "").toUpperCase()}>
      {formatIban(value)}
    </span>
  );
}

/**
 * Dot plus word. No pill — that is `StatusBadge` and belongs to the registry.
 *
 * @when    State in a cell, color plus word.
 * @instead Entity status from the registry → StatusBadge.
 */
export function DotStatus({
  tone,
  label,
}: {
  tone: "neutral" | "info" | "success" | "warning" | "danger";
  label: string;
}) {
  return (
    <span className={`v2dot v2dot--${tone}`}>
      <i />
      {label}
    </span>
  );
}

/**
 * Point in time. The default is **absolute** in Europe/Berlin — „vor 3 Tagen"
 * is worthless when reviewing a period, the date is not (R3, design
 * `StapelSeite.dc.html` line 99).
 *
 * @when    A point in time inside a table cell.
 * @instead A date outside a table → Time. A span of seconds → formatDuration.
 */
export function Timestamp({
  iso,
  prefix,
  format = "dateTime",
  length = "short",
  hint,
}: {
  iso: string | Date | null;
  prefix?: string;
  /** Day only, day and time (default), or the month — 0197. */
  format?: "date" | "dateTime" | "month";
  length?: TimeLength;
  hint?: CellHint;
}) {
  const mark = hint ? <ValueHint hint={hint} side="after" /> : null;
  const d = !iso ? null : typeof iso === "string" ? new Date(iso) : iso;
  if (!d || Number.isNaN(d.getTime())) {
    return (
      <span className="v2muted">
        —{mark}
      </span>
    );
  }
  // The short form of `Time` (P24) — this cell is its table-shaped variant.
  return (
    <span>
      <time dateTime={d.toISOString()} title={formatTimeFull(d)}>
        {prefix ? `${prefix} ` : ""}
        {formatTime(d, format, length)}
      </time>
      {mark}
    </span>
  );
}

/**
 * A span in a cell — „01.–31.03.2026", the shared part said once (0197).
 *
 * @when    Coverage, period or run time of a row — an import, a statement, a batch.
 * @instead Outside a table → DateRange. One point → Timestamp. Elapsed seconds →
 *          formatDuration.
 */
export function DateRangeCell({
  from,
  to,
  format = "date",
  hint,
}: {
  from: string | Date | null;
  to: string | Date | null;
  format?: TimeRangeFormat;
  hint?: CellHint;
}) {
  const mark = hint ? <ValueHint hint={hint} side="after" /> : null;
  if (!from && !to) {
    return (
      <span className="v2muted">
        —{mark}
      </span>
    );
  }
  return (
    <span>
      <span title={formatTimeRange(from, to, format, "long")}>{formatTimeRange(from, to, format)}</span>
      {mark}
    </span>
  );
}

/**
 * Deviation against the previous months' average. The four steps (0–15 % ·
 * 15–50 % · 50–100 % · from 100 %) are computed by **one** domain function;
 * the cell only paints. The tooltip carries the calculation so the number is
 * not an oracle.
 *
 * @when    A difference between two numbers, where the sign is the message.
 * @instead A plain amount → AmountCell. A share of a whole → Progress.
 */
export function DeviationCell({
  pct,
  tone,
  explanation,
}: {
  /** Deviation in percent; `null` = too recent to compare. */
  pct: number | null;
  tone: CellTone;
  explanation: string;
}) {
  if (pct === null) {
    return (
      <span className="v2num v2num--muted" title={explanation}>
        —
      </span>
    );
  }
  const sign = pct > 0 ? "+" : "";
  return (
    <span className={`v2num${tone === "neutral" ? "" : ` v2num--${tone}`}`} title={explanation}>
      {sign}
      {new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(pct)} %
    </span>
  );
}

/**
 * Loading rows inside a table.
 *
 * `cols` are the tracks **with content**. A table often has more: the select
 * box, the expand handle, the actions column. Those carry no data and get no
 * bar — but they need their cell, or the whole row slides one track to the
 * left and the first bar lands inside the 32-px checkbox (acceptance 0086:
 * head six cells, loading row five, the last track 140 px empty).
 *
 * @when    A table is loading and the number of rows is roughly known.
 * @instead A surface outside a table → Skeleton. Nothing to show at all →
 *          EmptyState. The loading failed → ErrorRow.
 */
export function TableLoading({
  rows = 3,
  cols = 3,
  leadingCols = 0,
  trailingCols = 0,
}: {
  rows?: number;
  cols?: number;
  /** Tracks before the data with no content of their own: select, expand. */
  leadingCols?: number;
  /** Tracks behind them with no content of their own: the actions column. */
  trailingCols?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <tr className="v2tbl__row" key={r} aria-hidden>
          {Array.from({ length: leadingCols }, (_, c) => <td key={`l${c}`} />)}
          {Array.from({ length: cols }, (_, c) => (
            <td key={c}>
              <span className="v2skel" style={{ width: c === 0 ? "70%" : "45%" }} />
            </td>
          ))}
          {Array.from({ length: trailingCols }, (_, c) => <td key={`t${c}`} />)}
        </tr>
      ))}
      <tr>
        <td colSpan={999}>
          <span className="v2vh">Wird geladen …</span>
        </td>
      </tr>
    </>
  );
}

/**
 * The fifth state (UX guidelines V9): loading failed, it is not empty.
 *
 * @when    Error while loading rows, with a way to retry.
 * @instead Nothing there at all → EmptyRow. Still loading → TableLoading.
 */
export function ErrorRow({ message, action }: { message: string; action?: ReactNode }) {
  return (
    // A row over all columns, like `EmptyRow` (0106): a `<div>` in a `<tbody>`
    // is neither valid nor a row.
    <tr>
      <td className="v2tbl__error" role="alert" colSpan={999}>
        <span>{message}</span>
        {action}
      </td>
    </tr>
  );
}

/**
 * Account number, tax key, DATEV code — read digit by digit and compared with
 * the document. Monospaced and left-aligned, which is what tells it apart from
 * `AmountCell`: an amount is right-aligned and never monospaced.
 *
 * @when    A key made of digits or codes in a cell.
 * @instead An amount → AmountCell. A state → DotStatus or StatusBadge.
 */
export function MonoCell({
  value,
  tone = "neutral",
  title,
}: {
  /** `null` renders the em dash, never an empty cell. */
  value: string | number | null;
  tone?: "neutral" | "muted";
  title?: string;
}) {
  if (value === null || value === "") return <span className="v2muted">—</span>;
  return (
    <span className={`v2mono${tone === "muted" ? " v2mono--muted" : ""}`} title={title}>
      {value}
    </span>
  );
}
