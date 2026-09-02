import type { ReactNode } from "react";

/**
 * v2 cell building blocks (F123 T123.1, Baukasten §9) — the types a table
 * column is assembled from.
 *
 * Rule: numbers right with `tnum`, text left, nothing centered (UX guidelines V3).
 * Color only carries meaning where it means a state — and then the word
 * stands next to it (V6/V7).
 */

export type CellTone = "neutral" | "muted" | "success" | "warning" | "warning-strong" | "danger";

/**
 * Amount, right-aligned, digits at fixed width.
 *
 * Owner decision F123 §4/4: **no** automatic red for negative values.
 * Every credit note and every credit-side line is negative; if the column
 * colored those, red would be decoration instead of a signal. Where a number
 * really is an alarm (balance difference, open remainder), the caller sets
 * `tone` itself.
 *
 * @when    Every amount in a table cell.
 * @instead Amount in the page header → KpiTile.
 */
export function AmountCell({
  value,
  currency = "EUR",
  tone = "neutral",
  title,
}: {
  value: number | string;
  currency?: string | null;
  tone?: CellTone;
  title?: string;
}) {
  const text =
    typeof value === "number"
      ? new Intl.NumberFormat("de-DE", {
          style: currency ? "currency" : "decimal",
          currency: currency ?? undefined,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value)
      : value;
  return (
    <span className={`v2num${tone === "neutral" ? "" : ` v2num--${tone}`}`} title={title}>
      {text}
    </span>
  );
}

/** Progress as a bar plus a percentage — the bar alone is not readable. */
export function ProgressCell({
  share,
  tone = "accent",
  label,
}: {
  /** 0…1. Higher values are clamped so the bar does not break out. */
  share: number;
  tone?: "accent" | "warning" | "danger" | "success";
  label?: string;
}) {
  const pct = Math.max(0, Math.min(1, share));
  return (
    <span>
      <span className="v2bar">
        <span
          className={`v2bar__fill${tone === "accent" ? "" : ` v2bar__fill--${tone}`}`}
          style={{ width: `${pct * 100}%` }}
        />
      </span>
      <span className="v2bar__label">{label ?? `${Math.round(pct * 100)} %`}</span>
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
 */
const BERLIN: Intl.DateTimeFormatOptions = { timeZone: "Europe/Berlin" };
const SHORT = new Intl.DateTimeFormat("de-DE", {
  ...BERLIN,
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});
const FULL = new Intl.DateTimeFormat("de-DE", {
  ...BERLIN,
  dateStyle: "full",
  timeStyle: "short",
});

export function Timestamp({ iso, prefix }: { iso: string | Date | null; prefix?: string }) {
  if (!iso) return <span className="v2muted">—</span>;
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return <span className="v2muted">—</span>;
  return (
    <time dateTime={d.toISOString()} title={FULL.format(d)}>
      {prefix ? `${prefix} ` : ""}
      {SHORT.format(d)}
    </time>
  );
}

/**
 * Deviation against the previous months' average. The four steps (0–15 % ·
 * 15–50 % · 50–100 % · from 100 %) are computed by **one** domain function;
 * the cell only paints. The tooltip carries the calculation so the number is
 * not an oracle.
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
 * Loading state at row height — the table does not jump when the rows arrive.
 *
 * @when    Loading state inside the card, header rows stay in place.
 */
export function TableLoading({ rows = 3, cols = 3 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <div className="v2tbl__row" key={r} aria-hidden>
          {Array.from({ length: cols }, (_, c) => (
            <span className="v2skel" key={c} style={{ width: c === 0 ? "70%" : "45%" }} />
          ))}
        </div>
      ))}
      <span className="sr-only">Wird geladen …</span>
    </>
  );
}

/**
 * The fifth state (UX guidelines V9): loading failed, it is not empty.
 *
 * @when    Error while loading rows, with a way to retry.
 */
export function ErrorRow({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="v2tbl__error" role="alert">
      <span>{message}</span>
      {action}
    </div>
  );
}
