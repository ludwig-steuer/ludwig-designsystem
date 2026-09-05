import { StatusInfoButton } from "./StatusInfoButton";
import type { StatusAxis } from "./status-registry";

export interface StatusHeaderProps {
  /** The axis whose values the column shows — feeds the (i) and the legend. */
  axis: StatusAxis;
  /**
   * The specific word in the head („Abgleich", „Verarbeitung"). No default:
   * a missing label is a type error, not „Status" (Z4/R2).
   */
  label: string;
}

/**
 * The head of a status column: the specific word plus the (i) that opens the
 * legend of the axis. Rule Z4 in one place — 36 call sites in the app write
 * the same markup today.
 *
 * Three things it deliberately does not take, and why:
 *  - no `legend`: the legend comes from the registry, never by hand (Z2). The
 *    eight app files that write one today are eight axes missing from the
 *    registry (finding L-51).
 *  - no `hint`: what kind of status this is, `AXIS_LABEL`/`AXIS_SOURCE` say in
 *    the dialog. Anything beyond belongs in the axis, not in the caller.
 *  - no `only`: no caller filters an axis to a subset yet (0 uses of
 *    `axisLegend(axis, only)`). It arrives with the first column set that does.
 *
 * The explanation opens on click, not on hover — one mechanic for „what does
 * this state mean" across the set, reachable by keyboard and screen reader
 * (owner decision 2026-09-04).
 *
 * @when    The head of a column that shows the values of one status axis.
 * @instead A status value itself → StatusBadge. The (i) next to a single chip
 *          → StatusInfoButton. A plain column head without an axis → a `span`.
 */
export function StatusHeader({ axis, label }: StatusHeaderProps) {
  return (
    <span className="v2sth">
      {label}
      <StatusInfoButton axis={axis} />
    </span>
  );
}
