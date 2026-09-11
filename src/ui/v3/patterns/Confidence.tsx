import { DotStatus } from "../primitives/Cells";
import { AXIS_LABEL } from "./entity-icons";
import { resolveStatus } from "@/ludwig/ui/status/status-registry";

/**
 * The banded steps of the axis `konfidenz`. What the old type in
 * `AiBookingNotes` called `"none"` is `null` here — an absent value is not a
 * fifth step.
 *
 * Identical today to `ConfidenceLevel` in
 * `src/ludwig/modules/accounting-cases/domain/acceptance-triage.ts`, and
 * deliberately not imported from there: this one is the value set of the
 * **axis**, and the axis is what the component draws. The two part ways the
 * day L-50 puts the five band words of the GLOSSARY on the axis.
 */
export type ConfidenceLevel = "green" | "yellow" | "orange" | "red";

export interface ConfidenceProps {
  /** The banded step; `null` means no signal → „—" with title „keine Angabe". */
  level: ConfidenceLevel | null;
  /** Raw value 0…1, shown as a whole percent behind the word. */
  value?: number;
  /** Dot only, word in `title` and `aria-label` — for a booking line or a cell. */
  compact?: boolean;
}

/**
 * How sure the agent was, in one form: a dot in the color of the step, the
 * word next to it, and where there is a raw value, the percent.
 *
 * It shows, it does not band. Ludwig has three threshold sets for this one
 * quantity today (85/70/50 · 80/50 · 85/60) plus the five-step band of the
 * GLOSSARY; whoever passes `value` passes `level` too, so this component does
 * not become the fourth. The derivation belongs in the domain (finding L-50),
 * as does the rule „booked by hand counts as green" (`entryConfLevel`).
 *
 * No meter and no band: three bars carry no information the dot does not
 * (V7). A share as a bar is `Progress` with a `tone`.
 *
 * @when    How confident a machine-made proposal is.
 * @instead A state of the thing itself → StatusBadge. A share of a whole →
 *          Progress. A state in a cell with a free tone → DotStatus.
 */
export function Confidence({ level, value, compact = false }: ConfidenceProps) {
  if (!level) {
    return (
      <span className="v2muted" title="keine Angabe">
        —
      </span>
    );
  }

  const { label, kind } = resolveStatus("confidence", level);
  const text = value == null ? label : `${label} · ${Math.round(value * 100)} %`;

  if (compact) {
    return (
      <span
        className={`v2dot v2dot--${kind}`}
        role="img"
        aria-label={`${AXIS_LABEL.confidence}: ${text}`}
        title={`${AXIS_LABEL.confidence}: ${text}`}
      >
        <i />
      </span>
    );
  }

  // `lw-numeric` on the wrapper: the percent behind the word carries tabular
  // figures, so a column of them lines up (V3).
  return (
    <span className="lw-numeric">
      <DotStatus tone={kind} label={text} />
    </span>
  );
}
