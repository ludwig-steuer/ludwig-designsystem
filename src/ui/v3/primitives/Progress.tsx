import { formatCount } from "../format";
import type { BadgeTone } from "./Badge";

/**
 * One share of a whole as a bar (0045). Lives on its own because a progress
 * is not a table thing: it appears in a cell, in an upload row, in a step
 * header and in a group header — the bar is the same in all four.
 *
 * Rule: the bar never stands alone. Either it carries its own label, or the
 * caller puts the number right next to it (`label={null}`); a bare bar is a
 * decoration nobody can read a state off.
 */

/** One part of the whole in a stacked bar (0227). */
export type ProgressPart = {
  /** The caller's name of the part — it reads „label: count" in the sentence. */
  label: string;
  /** The count; ≤ 0 or not a number counts as 0. */
  value: number;
  /** The same word, and tone, as the StatusBadge of that step. */
  tone: BadgeTone;
};

type BarProps = {
  /** Height of the bar: 4px, 6px, 10px. The label stays the same size. */
  size?: "sm" | "md" | "lg";
  /** `null` hides the label — only where the number stands next to the bar. */
  label?: string | null;
  /** Label before the bar in one line instead of above it (0046) — for a
   * header or a wide surface, where there is room sideways. */
  inline?: boolean;
};

type ShareProps = BarProps & {
  /** 0…1. Higher values are clamped so the bar does not break out. */
  share?: number;
  /** „41 von 118" — alternative to `share`, and the default label; a count, a fraction is rounded. */
  done?: number;
  total?: number;
  tone?: "accent" | "warning" | "danger" | "success";
  parts?: never;
  legend?: never;
};

type PartsProps = BarProps & {
  /** The parts of one whole, left to right; the whole is their sum (0227). */
  parts: ProgressPart[];
  /**
   * A line naming the drawn parts — a mark in the part's tone and its label;
   * the count only in the `title` (llcto for the owner, 2026-10-27).
   */
  legend?: boolean;
  share?: never;
  done?: never;
  total?: never;
  tone?: never;
};

/**
 * Bar plus label — „72 %", „41 von 118", or the parts of one whole stacked.
 *
 * @when    A share of a whole: `share` (0…1) or `done`/`total` — or the parts
 *          of one whole, stacked (`parts`): done · waiting · to decide.
 * @instead Several series over time → BarChart. One number without a whole →
 *          KpiTile.
 */
export function Progress(props: ShareProps | PartsProps) {
  const { size = "md", inline = false } = props;
  const sizeClass = size === "md" ? "" : ` v2bar--${size}`;
  let bar;
  let legend = null;
  let text: string | null;
  if (props.parts) {
    const parts = props.parts.map((p) => ({ ...p, value: p.value > 0 ? p.value : 0 }));
    const drawn = parts.filter((p) => p.value > 0);
    const sentence = parts.map((p) => `${p.label}: ${formatCount(p.value)}`).join(", ");
    text = props.label !== undefined ? props.label : sentence;
    // The default label already says every part, the bar would say it twice;
    // without parts there is nothing to name.
    const named = text === sentence || !sentence ? { "aria-hidden": true } : { role: "img", "aria-label": sentence };
    bar = (
      <span className={`v2bar v2bar--parts${sizeClass}`} {...named}>
        {drawn.map((p, i) => (
          <span
            key={i}
            className={`v2bar__part v2bar__part--${p.tone}`}
            style={{ flexGrow: p.value }}
            title={`${p.label}: ${formatCount(p.value)}`}
          />
        ))}
      </span>
    );
    // Silent for the reader: the bar's name or the default label already says
    // every part with its count.
    legend =
      props.legend && drawn.length > 0 ? (
        <span className="v2bar__legend" aria-hidden="true">
          {drawn.map((p, i) => (
            <span key={i} className="v2bar__key" title={`${p.label}: ${formatCount(p.value)}`}>
              <span className={`v2bar__swatch v2bar__part--${p.tone}`} />
              {p.label}
            </span>
          ))}
        </span>
      ) : null;
  } else {
    const { share, done, total, tone = "accent", label } = props;
    const pct = Math.max(0, Math.min(1, share ?? (total ? (done ?? 0) / total : 0)));
    text =
      label !== undefined
        ? label
        : total != null
          ? `${formatCount(done ?? 0)} von ${formatCount(total)}`
          : `${Math.round(pct * 100)} %`;
    bar = (
      <span className={`v2bar${sizeClass}`}>
        <span
          className={`v2bar__fill${tone === "accent" ? "" : ` v2bar__fill--${tone}`}`}
          style={{ width: `${pct * 100}%` }}
        />
      </span>
    );
  }
  const labelNode = text === null ? null : <span className="v2bar__label">{text}</span>;
  // Inline reverses the order: the number is read first, the bar answers it.
  // The legend stands under the bar it explains, before the sentence.
  if (!inline) {
    return (
      <span>
        {bar}
        {legend}
        {labelNode}
      </span>
    );
  }
  const row = (
    <span className="v2prog--inline">
      {labelNode}
      {bar}
    </span>
  );
  return legend ? (
    <span className="v2prog--legend">
      {row}
      {legend}
    </span>
  ) : (
    row
  );
}
