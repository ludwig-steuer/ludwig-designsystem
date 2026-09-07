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
  // The em dash keeps the column's geometry: `v2num` first, `v2muted` after.
  // Without it the unknown value stands left in a right-aligned column — found
  // in the acceptance of 0072, and it hits every table with unknown amounts.
  if (value === null) return <span className="v2num v2muted">—</span>;
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
 *
 * @when    A point in time inside a table cell.
 * @instead A date outside a table → Time. A span of seconds → formatDuration.
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
 * Ladende Zeilen in einer Tabelle.
 *
 * `cols` sind die Spuren **mit Inhalt**. Eine Tabelle hat oft mehr: das
 * Auswahlkästchen, den Aufklapp-Griff, die Aktionsspalte. Die tragen keine
 * Daten und bekommen deshalb keinen Balken — aber sie brauchen ihre Zelle,
 * sonst rutscht die ganze Zeile um eine Spur nach links und der erste Balken
 * landet im 32-px-Kästchen (Abnahme 0086: Kopf sechs Zellen, Ladezeile fünf,
 * die letzte Spur blieb 140 px leer).
 *
 * @when    Eine Tabelle lädt und die Zahl der Zeilen ist ungefähr bekannt.
 * @instead Eine Fläche außerhalb einer Tabelle → Skeleton. Es gibt nichts zu
 *          zeigen → EmptyState. Das Laden ist gescheitert → ErrorRow.
 */
export function TableLoading({
  rows = 3,
  cols = 3,
  leadingCols = 0,
  trailingCols = 0,
}: {
  rows?: number;
  cols?: number;
  /** Spuren vor den Daten ohne eigenen Inhalt: Auswahl, Aufklapp-Griff. */
  leadingCols?: number;
  /** Spuren dahinter ohne eigenen Inhalt: die Aktionsspalte. */
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
