/**
 * The loading surface outside a table (0016).
 *
 * Same pulse as `TableLoading` — both use `.v2skel`, so „loading" looks like
 * one thing in the whole house. The widths of the lines are fixed, not random:
 * a server component must render the same markup twice.
 */

export type SkeletonVariant = "lines" | "card" | "field";

/** Uneven on purpose — three equal bars read as a table, not as text. */
const LINE_WIDTHS = ["100%", "84%", "62%", "91%", "70%"];

/**
 * @when    A card, a detail pane or a form field is still loading.
 * @instead Rows inside a table → TableLoading. Nothing there at all →
 *          EmptyState. Loading failed → ErrorRow.
 */
export function Skeleton({
  variant = "lines",
  lines = 3,
  label = "Wird geladen …",
}: {
  variant?: SkeletonVariant;
  /** Only for `variant="lines"`. */
  lines?: number;
  /** Screen-reader sentence; the surfaces themselves are hidden. */
  label?: string;
}) {
  return (
    <div className="v2skelgroup">
      <span className="v2vh">{label}</span>
      {variant === "lines" ? (
        Array.from({ length: lines }, (_, i) => (
          <span
            className="v2skel"
            key={i}
            aria-hidden="true"
            style={{ width: LINE_WIDTHS[i % LINE_WIDTHS.length] }}
          />
        ))
      ) : (
        <span className={`v2skel v2skel--${variant}`} aria-hidden="true" />
      )}
    </div>
  );
}
