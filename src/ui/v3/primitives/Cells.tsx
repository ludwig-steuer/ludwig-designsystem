import type { ReactNode } from "react";
import { formatAmount, formatTime, formatTimeFull } from "../format";

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
}: {
  /** `null` means unknown — rendered as „—", never as zero. */
  value: number | string | null;
  currency?: string | null;
  tone?: CellTone;
  title?: string;
}) {
  // Explicitly against null, not falsy: 0 is an amount, and „0,00 €" is a
  // statement — „nothing was booked" is not the same as „we do not know".
  if (value === null) return <span className="v2muted">—</span>;
  // One formatter for the whole house (P24): the cell only adds its geometry.
  const text = typeof value === "number" ? formatAmount(value, currency as never) : value;
  return (
    <span className={`v2num${tone === "neutral" ? "" : ` v2num--${tone}`}`} title={title}>
      {text}
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
export function Timestamp({ iso, prefix }: { iso: string | Date | null; prefix?: string }) {
  if (!iso) return <span className="v2muted">—</span>;
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return <span className="v2muted">—</span>;
  // The short form of `Time` (P24) — this cell is its table-shaped variant.
  return (
    <time dateTime={d.toISOString()} title={formatTimeFull(iso)}>
      {prefix ? `${prefix} ` : ""}
      {formatTime(iso, "dateTime", "short")}
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
        <tr className="v2tbl__row" key={r} aria-hidden>
          {Array.from({ length: cols }, (_, c) => (
            <td key={c}>
              <span className="v2skel" style={{ width: c === 0 ? "70%" : "45%" }} />
            </td>
          ))}
        </tr>
      ))}
      <tr>
        <td colSpan={999}>
          <span className="sr-only">Wird geladen …</span>
        </td>
      </tr>
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
