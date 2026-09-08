import type { CSSProperties, ReactNode } from "react";
import { Link } from "./Link";

/**
 * Kennzahl-Kachel der Detailseite (F123 T123.1): 19 px Sans, Rand statt Schatten.
 *
 * Abgrenzung zu `Stat`/`StatGrid` der App: das ist die Dashboard-Kachel
 * (32 px Serif, Schatten). Auf Detailseiten steht diese hier.
 *
 * **With `href` the whole tile leads there** — the same rule as `Row` (I11):
 * a figure that answers „how much" and not „and now?" is a dead end with
 * digits. Without it the tile stays a plain block; not every number has a
 * page behind it.
 *
 * @when    A number with a label in the header of a detail page; several in a `KpiGrid`.
 * @instead Number in a table column → AmountCell. Label/value pairs as text → FieldList.
 */
export function KpiTile({
  label,
  value,
  sub,
  href,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  /** Where the figure leads — the list it counts, the page it summarises. */
  href?: string;
}) {
  const inner = (
    <>
      <div className="v2kpi__label">{label}</div>
      <div className="v2kpi__val">{value}</div>
      {sub ? <div className="v2kpi__sub">{sub}</div> : null}
    </>
  );
  // The link wraps the tile instead of sitting inside it: one focus stop for
  // one target, with its own text and without `aria-label` (I11). The app put
  // it in the subtitle for want of this prop, which made a second stop out of
  // a corner of the tile.
  return href ? (
    <Link href={href} className="v2kpi v2kpi--link">
      {inner}
    </Link>
  ) : (
    <div className="v2kpi">{inner}</div>
  );
}

/**
 * A grid of key-figure tiles; `columns` is the column count at full width.
 *
 * @when    Several key figures side by side, sharing one measure.
 * @instead One figure → KpiTile. A table of numbers → DataTable.
 */
export function KpiGrid({ columns = 6, children }: { columns?: number; children: ReactNode }) {
  return (
    <div className="v2kpigrid" style={{ "--v2-kpi-cols": columns } as CSSProperties}>
      {children}
    </div>
  );
}
