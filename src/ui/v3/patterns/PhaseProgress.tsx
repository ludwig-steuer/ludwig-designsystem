import { formatCount } from "../format";
import { Progress } from "../primitives/Progress";
import { STEP_ACTIVE_WORD, STEP_STATE, type ProcessPhaseStatus } from "./Process";
import { StateIcon, stateLabel, type StateKind } from "./Review";

/**
 * The steps of one run as rows (0265, owner 2026-11-27, page profile
 * `duo-connect.md` U5): sign, the user's words of the step, and on the right
 * the count or a note. Only the current step carries a track — filled to its
 * share when the quantity is known, a gliding piece while it is not. When the
 * run is over, the same rows stay as the result list: nothing jumps, nothing
 * is said any more.
 *
 * The vocabulary is the process picture's: `ProcessPhaseStatus` for the state,
 * `STEP_STATE` for the sign, `.pz-steps` for the rows, `.pz-mini` for the
 * short form, the `v3runmark` keyframes for work without a quantity.
 */

/** A known quantity of a step: „Beleg 37 von 120". */
export interface PhaseCount {
  done: number;
  total: number;
  /** The word before the numbers, singular: „Beleg", „Konto", „Ablageort". */
  unit: string;
}

export interface PhaseProgressItem {
  /** Stable key — the plugin's id of the step (`ablage`, `belege`, …). */
  key: string;
  /** The user's words of the step: „Neue Belege aus DATEV holen". */
  label: string;
  status: ProcessPhaseStatus;
  /**
   * The known quantity. Counts while `active`; at `held` and `failed` the
   * track stands at the share; not shown at `pending` and `done`. `total ≤ 0`
   * counts as no quantity, `done > total` is capped at `total`.
   */
  count?: PhaseCount | null;
  /**
   * The right column when there is no number, or the number does not hold:
   * what happens (`active` without count), the reason (`held`), the cause
   * (`failed`), the result in a few words (`done`), or that the step never
   * ran (`pending` after a cancellation).
   */
  note?: string;
  /** Only at `done`: the step is through but not everything went („9 übertragen, 3 nicht übertragen"). Warning sign, this sentence on the right. */
  issue?: string;
}

export type PhaseProgressDensity = "regular" | "compact";

export interface PhaseProgressProps {
  /** The steps, top to bottom, in run order — **only what runs** (U6): a step switched off is not passed. `[]` renders nothing. */
  phases: readonly PhaseProgressItem[];
  /** The accessible name of the whole and the start of every announcement: „Fortschritt des Abgleichs Musterfirma GmbH". */
  label: string;
  /** `regular`: every step a row (default). `compact`: one line — the `.pz-mini` strip and the current step. */
  density?: PhaseProgressDensity;
}

/** The count as numbers, or null when there is none to show (total ≤ 0). */
function counted(count: PhaseCount | null | undefined): { done: number; total: number; unit: string } | null {
  if (!count || !(count.total > 0)) return null;
  return { done: Math.max(0, Math.min(count.done, count.total)), total: count.total, unit: count.unit };
}

function countText(c: { done: number; total: number; unit: string }): string {
  return `${c.unit} ${formatCount(c.done)} von ${formatCount(c.total)}`;
}

/** The sign: `STEP_STATE`, and the warning for a step that is through with an issue. */
function sign(p: PhaseProgressItem): StateKind {
  return p.status === "done" && p.issue ? "warning" : STEP_STATE[p.status];
}

/** The word the sign says — `STEP_ACTIVE_WORD.run` for the step at work, otherwise the sign's own word. */
function signWord(p: PhaseProgressItem): string {
  return p.status === "active" ? STEP_ACTIVE_WORD.run : stateLabel(sign(p));
}

/** The right column: count, note, issue — as the mapping table of 0265 says. */
function aside(p: PhaseProgressItem): { text: string; numeric: boolean } {
  const c = counted(p.count);
  switch (p.status) {
    case "active":
      return c ? { text: countText(c), numeric: true } : { text: p.note ?? STEP_ACTIVE_WORD.run, numeric: false };
    case "held":
    case "failed":
      return p.note ? { text: p.note, numeric: false } : c ? { text: countText(c), numeric: true } : { text: signWord(p), numeric: false };
    case "done":
      return { text: p.issue ?? p.note ?? "", numeric: false };
    case "pending":
      return { text: p.note ?? "", numeric: false };
  }
}

/** The current step: the first that is active, held or failed. */
function currentIndex(phases: readonly PhaseProgressItem[]): number {
  return phases.findIndex((p) => p.status === "active" || p.status === "held" || p.status === "failed");
}

/** The sentence of the step at work, without a number (C2) — empty when nothing runs. */
function announcement(label: string, phases: readonly PhaseProgressItem[]): string {
  const running = phases.find((p) => p.status === "active");
  if (!running) return "";
  return running.note ? `${label}: ${running.label} · ${running.note}` : `${label}: ${running.label} ${STEP_ACTIVE_WORD.run}`;
}

/** Under the current row: the bar at its share, the gliding piece, or an empty track that stands. */
function Track({ phase }: { phase: PhaseProgressItem }) {
  const c = counted(phase.count);
  if (phase.status === "active" && !c) return <span className="v3runmark" aria-hidden="true" />;
  if (!c) return <span className="v2bar v2bar--sm" aria-hidden="true" />;
  const tone = phase.status === "failed" ? "danger" : phase.status === "held" ? "warning" : "accent";
  return (
    <span aria-hidden="true">
      <Progress done={c.done} total={c.total} label={null} size="sm" tone={tone} />
    </span>
  );
}

/** One segment of the short form's strip. */
function Segment({ phase }: { phase: PhaseProgressItem }) {
  const c = counted(phase.count);
  if (phase.status === "active" && !c) return <span className="v3runmark" title={phase.label} />;
  if (phase.status === "active" && c) {
    return (
      <span className="v3phase__seg" title={phase.label}>
        <span className="v3phase__fill" style={{ width: `${(c.done / c.total) * 100}%` }} />
      </span>
    );
  }
  const cls = phase.status === "done" && phase.issue ? "is-held" : phase.status === "pending" ? undefined : `is-${phase.status}`;
  return <span className={cls} title={phase.label} />;
}

/**
 * @when    The steps of a run in progress — each with its count or note, the
 *          current one with a track, announced only when the step changes; the
 *          same rows stay as the result list when the run is over.
 * @instead Where a record stands and who holds it → ProcessStepper. A gate's
 *          checklist to pick from → Checklist. One share of one whole →
 *          Progress. Steps to jump between → StepRail.
 */
export function PhaseProgress({ phases, label, density = "regular" }: PhaseProgressProps) {
  if (phases.length === 0) return null;
  const current = currentIndex(phases);
  const said = announcement(label, phases);
  const region = (
    <span className="v2vh" role="status">
      {said}
    </span>
  );

  if (density === "compact") {
    const now = current >= 0 ? phases[current] : null;
    const complete = phases.every((p) => p.status === "done" && !p.issue);
    const steps = phases.map((p) => `${p.label}: ${signWord(p)}${aside(p).text ? `, ${aside(p).text}` : ""}`).join("; ");
    return (
      <div className="v3phase v3phase--compact" role="group" aria-label={label}>
        <span
          className={complete ? "pz-mini is-complete" : "pz-mini"}
          role="img"
          aria-label={steps}
          title={phases.map((p) => p.label).join(" → ")}
        >
          {phases.map((p) => (
            <Segment key={p.key} phase={p} />
          ))}
        </span>
        {now ? (
          <span className="v3phase__now">
            {now.status === "held" || now.status === "failed" ? <StateIcon state={sign(now)} /> : null}
            <span>
              {now.label} · <span className={aside(now).numeric ? "v3phase__num" : undefined}>{aside(now).text}</span>
            </span>
          </span>
        ) : null}
        {region}
      </div>
    );
  }

  return (
    <div className="v3phase" role="group" aria-label={label}>
      <ol className="pz-steps v3phase__steps">
        {phases.map((p, i) => {
          const right = aside(p);
          return (
            <li key={p.key} className={`is-${p.status}${i === current ? " is-current" : ""}`}>
              <span className="pz-steps__sign">
                <StateIcon state={sign(p)} title={signWord(p)} />
              </span>
              <span className="pz-steps__label">{p.label}</span>
              <span className={right.numeric ? "v3phase__aside v3phase__num" : "v3phase__aside"}>{right.text}</span>
              {i === current ? (
                <span className="v3phase__track">
                  <Track phase={p} />
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
      {region}
    </div>
  );
}
