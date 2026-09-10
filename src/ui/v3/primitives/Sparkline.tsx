/**
 * A run of four to twelve numbers, without axes and without a scale (0124).
 *
 * **The text alternative is the point of this component.** The markup it
 * replaces carried `aria-hidden` and nothing beside it, so for a screen reader
 * the run did not exist. The `aria-hidden` is right — twelve meaningless divs
 * read out would be worse — what was missing is the sentence next to it, and
 * it has to come from the same data as the bars or the two drift apart.
 *
 * @when    A run of a few values beside a number — the last months of an
 *          account, of a batch, of a supplier.
 * @instead Values that have to be read off → BarChart (0041). One value
 *          against a target → Progress (0045).
 */
export function Sparkline({
  values,
  labels,
  format = String,
  summary,
}: {
  /** Four to twelve values in time order. `null` is a **gap**, not a zero. */
  values: readonly (number | null)[];
  /** One per value; drawn are only the first and the last. */
  labels?: readonly string[];
  /** How a value reads in the text alternative — amounts through `formatAmount`. */
  format?: (value: number) => string;
  /** Replaces the derived sentence where the caller has a better one. */
  summary?: string;
}) {
  // Below four values it is not a run but a number, and a run of one bar says
  // less than the figure beside it. Nothing goes into the DOM, so the caller
  // keeps the space.
  if (values.length < 4 || values.length > 12) return null;

  const points = values.filter((v): v is number => v !== null).map(Math.abs);
  // All-null or all-zero: without a reference every bar would be full height.
  const max = points.length > 0 ? Math.max(...points) : 0;

  const alternative =
    summary ??
    [
      `${values.length} Werte`,
      labels && labels.length > 0 ? `${labels[0]} bis ${labels[labels.length - 1]}` : null,
      values.map((v) => (v === null ? "keine Angabe" : format(v))).join(", "),
    ]
      .filter(Boolean)
      .join(", ");

  return (
    <>
      <div className="v2spark" role="img" aria-label={alternative}>
        {values.map((v, i) => (
          <div
            key={i}
            aria-hidden
            className={`v2spark__b${i === values.length - 1 ? " is-now" : ""}`}
            // A gap keeps its track and shows no bar — `0` would claim a
            // measurement of nought where there was none.
            style={{
              height: v === null || max === 0 ? 0 : `${Math.round((Math.abs(v) / max) * 100)}%`,
            }}
          />
        ))}
      </div>
      {labels && labels.length > 0 ? (
        <div className="v2spark__ax" aria-hidden>
          <span>{labels[0]}</span>
          <span>{labels[labels.length - 1]}</span>
        </div>
      ) : null}
    </>
  );
}
