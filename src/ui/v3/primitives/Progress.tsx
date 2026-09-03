/**
 * One share of a whole as a bar (0045). Lives on its own because a progress
 * is not a table thing: it appears in a cell, in an upload row, in a step
 * header and in a group header — the bar is the same in all four.
 *
 * Rule: the bar never stands alone. Either it carries its own label, or the
 * caller puts the number right next to it (`label={null}`); a bare bar is a
 * decoration nobody can read a state off.
 */

/**
 * Bar plus label — „72 %" or „41 von 118".
 *
 * @when    A share of a whole: `share` (0…1) or `done`/`total`.
 * @instead Several shares next to each other → BarChart. One number without
 *          a whole → KpiTile.
 */
export function Progress({
  share,
  done,
  total,
  size = "md",
  tone = "accent",
  label,
}: {
  /** 0…1. Higher values are clamped so the bar does not break out. */
  share?: number;
  /** „41 von 118" — alternative to `share`, and the default label. */
  done?: number;
  total?: number;
  /** Height of the bar: 4px, 6px, 10px. The label stays the same size. */
  size?: "sm" | "md" | "lg";
  tone?: "accent" | "warning" | "danger" | "success";
  /** `null` hides the label — only where the number stands next to the bar. */
  label?: string | null;
}) {
  const pct = Math.max(0, Math.min(1, share ?? (total ? (done ?? 0) / total : 0)));
  const text =
    label !== undefined
      ? label
      : total != null
        ? `${done ?? 0} von ${total}`
        : `${Math.round(pct * 100)} %`;
  return (
    <span>
      <span className={`v2bar${size === "md" ? "" : ` v2bar--${size}`}`}>
        <span
          className={`v2bar__fill${tone === "accent" ? "" : ` v2bar__fill--${tone}`}`}
          style={{ width: `${pct * 100}%` }}
        />
      </span>
      {text === null ? null : <span className="v2bar__label">{text}</span>}
    </span>
  );
}
