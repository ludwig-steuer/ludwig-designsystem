/**
 * Bars per period, one or two series (0041, second series 0110).
 *
 * Inline SVG, server component, no `recharts`: the whole form is the geometry
 * below. The moment a chart needs ticked axes, a legend or a tooltip across
 * several series, that is the border where a charting library comes in — not
 * a second hand-rolled one. **Two series are that border**: a third would
 * need a legend, and a legend is the library.
 *
 * Colour follows the `dataviz` skill: a value carries no criticality (V6,
 * A7 — the sign does not colour either), so both series are grey, the second
 * a lighter one of the same family. The highlighted bar carries
 * `--color-primary` and, next to the colour, a stronger label (V7). The
 * reference line is the one thing that may differ: it is not a series but a
 * relation, and it carries `--color-accent`.
 */

/** The drawing grid. Not pixels: the SVG scales, the CSS sets the height. */
const W = 100;
const H = 46;
const GAP = 0.22;
/** Between the two bars of a group — enough to read as two, not as a pause. */
const INNER = 0.08;

export interface Bar {
  label: string;
  value: number;
  /** The second value of the same period. Without it the chart is as before. */
  secondary?: number;
}

/**
 * Two values of a period: shares of one sum, or two sizes of their own.
 *
 * `stacked` puts the second **on** the first — it is a part of the whole.
 * `grouped` puts them side by side. Debit and credit are not shares of each
 * other, so the account sheet groups them.
 */
export type BarLayout = "stacked" | "grouped";

/**
 * @when    One or two series over time — expense per month, debit against
 *          credit — with at most one period highlighted and, if useful, a
 *          running reference line.
 * @instead A single share of a whole → Progress. One number with a
 *          caption → KpiTile. Two states next to each other →
 *          ComparisonTable. A third series, real axes or a tooltip → the
 *          border where a charting library starts.
 */
export function BarChart({
  bars,
  format,
  highlight,
  max,
  layout = "stacked",
  line,
  primaryLabel,
  secondaryLabel,
  lineLabel,
  ariaLabel = "Werte je Zeitabschnitt",
}: {
  bars: Bar[];
  /** Values come formatted from the formatter (T7), never formatted here. */
  format: (value: number) => string;
  /** Label of the highlighted bar — the current period. */
  highlight?: string;
  /** Fixed upper bound; without it the largest value of the series. */
  max?: number;
  layout?: BarLayout;
  /**
   * A reference line on the **same** scale, one value per bar (a running
   * balance). Deliberately not a second Y axis: two scales in one picture do
   * not compare honestly.
   */
  line?: readonly number[];
  /** The words of the three sizes — they stand in the `title` and the table. */
  primaryLabel?: string;
  secondaryLabel?: string;
  lineLabel?: string;
  ariaLabel?: string;
}) {
  const hasSecond = bars.some((b) => b.secondary !== undefined);
  const grouped = layout === "grouped";

  // Everything that has to fit inside the frame. With neither a second series
  // nor a line this is the plain list of values — the drawing is unchanged.
  const reach = bars.flatMap((b) => {
    const second = b.secondary ?? 0;
    if (grouped || second === 0) return [b.value, second];
    // Stacked: each part grows from zero on the side its own sign points to,
    // so a mixed pair does not swallow itself.
    return [
      (b.value > 0 ? b.value : 0) + (second > 0 ? second : 0),
      (b.value < 0 ? b.value : 0) + (second < 0 ? second : 0),
    ];
  });
  const all = [...reach, ...(line ?? [])];
  const top = Math.max(max ?? 0, ...all.map(Math.abs), 0);
  if (bars.length === 0 || top === 0) {
    return <p className="v2chart__empty">Keine Werte im Zeitraum.</p>;
  }

  // The zero line sits where zero is: with negative values inside the frame,
  // above the bottom edge, otherwise on it.
  const low = Math.min(0, ...all);
  const span = top - Math.min(0, low);
  const zero = (top / span) * H;
  const slot = W / bars.length;
  const width = slot * (1 - GAP);
  const sub = grouped ? (width - INNER) / 2 : width;
  const y = (value: number) => zero - (value / span) * H;
  // The second series carries a 1-px hairline on every edge; at a minimum
  // height of 0.4 px that line covers the bar completely and the value
  // disappears (acceptance 0110, M2). It needs at least as much height as the
  // line takes away above and below.
  const MIN = 0.4;
  const MIN_SECOND = 2.4;
  const seg = (value: number, base: number, second = false) => ({
    y: value < 0 ? y(base) : y(base + value),
    height: Math.max((Math.abs(value) / span) * H, second ? MIN_SECOND : MIN),
  });

  const linePoints = (line ?? [])
    .slice(0, bars.length)
    .map((v, i) => `${i * slot + slot / 2},${y(v)}`)
    .join(" ");

  const title = (bar: Bar) => {
    const parts = [`${primaryLabel ? `${primaryLabel} ` : ""}${format(bar.value)}`];
    if (bar.secondary !== undefined) {
      parts.push(`${secondaryLabel ? `${secondaryLabel} ` : ""}${format(bar.secondary)}`);
    }
    return `${bar.label}: ${parts.join(" · ")}`;
  };

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
          const left = i * slot + (slot - width) / 2;
          const now = bar.label === highlight ? " is-now" : "";
          const second = bar.secondary;
          // Stacked grows from the end of the first part, grouped from zero.
          const base = grouped || second === undefined || second * bar.value < 0 ? 0 : bar.value;
          return (
            <g key={`${bar.label}-${i}`}>
              <rect
                x={left}
                width={sub}
                {...seg(bar.value, 0)}
                className={`v2chart__bar${now}`}
              >
                <title>{title(bar)}</title>
              </rect>
              {second === undefined ? null : (
                <rect
                  x={grouped ? left + sub + INNER : left}
                  width={sub}
                  {...seg(second, base, true)}
                  // The hairline that separates the two series is a stroke in
                  // the surface colour; `preserveAspectRatio="none"` would
                  // stretch it, hence non-scaling.
                  vectorEffect="non-scaling-stroke"
                  className={`v2chart__bar v2chart__bar--second${now}`}
                >
                  {/* The title hangs on the `rect`, not on the `g`: a
                      `<title>` on the group element does not reach the mouse
                      over the second bar (acceptance 0110, M3). */}
                  <title>{title(bar)}</title>
                </rect>
              )}
            </g>
          );
        })}
        {line ? (
          <>
            {/* Two lines on top of each other: the lower one in the surface
                colour, so the upper one stays visible **on a bar** too.
                Against white the accent measures 3.55:1 — over the bars it was
                1.03:1 (`border-control`) and 1.37:1 (`text-subtle`), and three
                quarters of the line lie there (acceptance 0110, M1). The same
                hairline trick that already separates the two series. */}
            <polyline
              className="v2chart__linehalo"
              vectorEffect="non-scaling-stroke"
              fill="none"
              points={linePoints}
              aria-hidden="true"
            />
            <polyline
              className="v2chart__line"
              // `non-scaling-stroke`, because `preserveAspectRatio="none"`
              // stretches the drawing — a plain stroke would come out wider
              // than tall.
              vectorEffect="non-scaling-stroke"
              fill="none"
              points={linePoints}
            >
              <title>
                {`${lineLabel ?? "Bezugslinie"}: ${line
                  .slice(0, bars.length)
                  .map((v, i) => `${bars[i]?.label ?? ""} ${format(v)}`)
                  .join(" · ")}`}
              </title>
            </polyline>
          </>
        ) : null}
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
        One column per size, headed by its word.
      */}
      <div className="v2vh">
        <table>
          <caption>{ariaLabel}</caption>
          {hasSecond || line ? (
            <thead>
              <tr>
                <th scope="col">Zeitabschnitt</th>
                <th scope="col">{primaryLabel ?? "Wert"}</th>
                {hasSecond ? <th scope="col">{secondaryLabel ?? "Zweiter Wert"}</th> : null}
                {line ? <th scope="col">{lineLabel ?? "Bezugslinie"}</th> : null}
              </tr>
            </thead>
          ) : null}
          <tbody>
            {bars.map((bar, i) => (
              <tr key={`${bar.label}-${i}`}>
                <th scope="row">{bar.label}</th>
                <td>{format(bar.value)}</td>
                {hasSecond ? (
                  <td>{bar.secondary === undefined ? "" : format(bar.secondary)}</td>
                ) : null}
                {line ? <td>{line[i] === undefined ? "" : format(line[i])}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
