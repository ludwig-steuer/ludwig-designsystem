/**
 * Bars per period, one series (0041).
 *
 * Inline SVG, server component, no `recharts`: the whole form is the geometry
 * below. The moment a chart needs ticked axes, a legend or a tooltip across
 * several series, that is the border where a charting library comes in — not
 * a second hand-rolled one.
 *
 * Colour follows the `dataviz` skill: one series needs no categorical palette.
 * The bars are grey because a value carries no criticality (V6, A7 — the sign
 * does not colour either); the highlighted one carries `--color-primary` and,
 * next to the colour, a stronger label (V7).
 */

/** The drawing grid. Not pixels: the SVG scales, the CSS sets the height. */
const W = 100;
const H = 46;
const GAP = 0.22;

export interface Bar {
  label: string;
  value: number;
}

/**
 * @when    One series over time — expense per month, entries per week — with
 *          at most one period highlighted.
 * @instead A single share of a whole → Progress. One number with a
 *          caption → KpiTile. Two states next to each other →
 *          ComparisonTable. Several series, axes or a tooltip → the border
 *          where a charting library starts.
 */
export function BarChart({
  bars,
  format,
  highlight,
  max,
  ariaLabel = "Werte je Zeitabschnitt",
}: {
  bars: Bar[];
  /** Values come formatted from the formatter (T7), never formatted here. */
  format: (value: number) => string;
  /** Label of the highlighted bar — the current period. */
  highlight?: string;
  /** Fixed upper bound; without it the largest value of the series. */
  max?: number;
  ariaLabel?: string;
}) {
  const values = bars.map((b) => b.value);
  const top = Math.max(max ?? 0, ...values.map(Math.abs), 0);
  if (bars.length === 0 || top === 0) {
    return <p className="v2chart__empty">Keine Werte im Zeitraum.</p>;
  }

  // The zero line sits where zero is: with negative values inside the frame,
  // above the bottom edge, otherwise on it.
  const low = Math.min(0, ...values);
  const span = top - Math.min(0, low);
  const zero = (top / span) * H;
  const slot = W / bars.length;
  const width = slot * (1 - GAP);

  return (
    <div className="v2chart">
      <svg
        className="v2chart__svg"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={ariaLabel}
      >
        {bars.map((bar, i) => {
          const h = (Math.abs(bar.value) / span) * H;
          const x = i * slot + (slot - width) / 2;
          const y = bar.value < 0 ? zero : zero - h;
          return (
            <rect
              key={`${bar.label}-${i}`}
              x={x}
              y={y}
              width={width}
              height={Math.max(h, 0.4)}
              className={`v2chart__bar${bar.label === highlight ? " is-now" : ""}`}
            >
              <title>{`${bar.label}: ${format(bar.value)}`}</title>
            </rect>
          );
        })}
        <line x1="0" x2={W} y1={zero} y2={zero} className="v2chart__zero" />
      </svg>
      <div className="v2chart__ax" aria-hidden="true">
        {bars.map((bar, i) => (
          <span
            key={`${bar.label}-${i}`}
            className={`v2chart__tick${bar.label === highlight ? " is-now" : ""}`}
          >
            {/* Every second label from a dozen bars on: the font does not
                shrink, the rest stays in the `title` of the bar. */}
            {bars.length > 12 && i % 2 === 1 ? "" : bar.label}
          </span>
        ))}
      </div>
      {/*
        The same numbers as a table: a screen reader reads the series, and
        whoever wants the exact value finds it without hovering (V7, V10).
      */}
      <div className="v2vh">
        <table>
          <caption>{ariaLabel}</caption>
          <tbody>
            {bars.map((bar, i) => (
              <tr key={`${bar.label}-${i}`}>
                <th scope="row">{bar.label}</th>
                <td>{format(bar.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
