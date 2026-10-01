import type { CSSProperties, ReactNode } from "react";

import { ActionIcon, type ActionKey } from "../Icons";

/** Where a step stands. Open, on it, through it, stuck. */
export type WizardStepState = "pending" | "active" | "done" | "error";

export interface WizardStep {
  /** The word in the head of the step. Long ones get an ellipsis. */
  label: string;
  /**
   * Title above the step's content (`h2`, surface title, 0220): names the
   * task — „Stammdaten erfassen" — while `label` stays the noun. Without it
   * the step has no head.
   */
  title?: string;
  /** Lead under the title (`lw-ui-lead`): two sentences at most. */
  intro?: ReactNode;
}

export interface WizardProps {
  steps: WizardStep[];
  /** 0-based index of the active step; it carries `aria-current="step"`. */
  current: number;
  /** State per step — exactly `steps.length` entries. */
  states: WizardStepState[];
  /** The content of the current step. */
  children: ReactNode;
  /** Back and next, right in the foot. Without it and `progress` there is no foot. */
  footer?: ReactNode;
  /**
   * Progress line, left in the foot and announced on change — the step count,
   * or a closing note on the last step. The caller words it.
   */
  progress?: ReactNode;
}

/**
 * Sign and word per state, both from the icon registry (0087). The word is the
 * badge's `aria-label` — a column head has no room for a second word, and
 * without it the state would be colour and shape only (V7).
 */
const STATE_ICON: Partial<Record<WizardStepState, ActionKey>> = {
  done: "confirm",
  error: "alert",
};

const STATE_WORD: Record<string, string> = { done: "erledigt", error: "Fehler" };

/**
 * The chrome of a run in numbered steps: the steps at the top, the content of
 * the current one below, back and next at the bottom.
 *
 * It is a shell and nothing else. Which step is current, what happens on next,
 * whether a step failed — the module knows that and passes it in. A summary is
 * a step like any other; its content is `children`.
 *
 * The head of the current step (`title`, `intro`) comes from the step itself,
 * so the words travel with the step. The foot holds the progress left and the
 * caller's buttons right — back and next side by side, as in a dialog (0220).
 *
 * Never color alone (V7): `done` shows a check instead of the number, `error`
 * an alert on danger, `active` the number on primary, `pending` the number
 * muted. Both signs come from the icon registry (`confirm`, `alert`, 0087) —
 * not from `StateIcon` in `Review.tsx`, which paints its own color and would
 * be danger on danger inside a filled danger pill.
 *
 * @when    A linear run of steps — import, export, onboarding.
 * @instead Every step reachable at any time → StepRail. Phases the system
 *          runs through → ProcessStepper. Two to four views → Tabs.
 */
export function Wizard({ steps, current, states, children, footer, progress }: WizardProps) {
  const head = steps[current];
  return (
    <div className="v2wiz">
      <div
        className="v2wiz__steps"
        style={{ "--v2wiz-steps": steps.length } as CSSProperties}
      >
        {steps.map((step, i) => {
          const state = states[i] ?? "pending";
          const action = STATE_ICON[state];
          return (
            <div
              key={step.label}
              className="v2wiz__step"
              data-state={state}
              aria-current={i === current ? "step" : undefined}
            >
              <span
                className="v2wiz__num"
                role={action ? "img" : undefined}
                aria-label={action ? STATE_WORD[state] : undefined}
              >
                {action ? <ActionIcon action={action} size={14} /> : i + 1}
              </span>
              <span className="v2wiz__lbl">
                <span className="v2wiz__n">Schritt {i + 1}</span>
                <span className="v2wiz__name">{step.label}</span>
              </span>
            </div>
          );
        })}
      </div>
      <div className="v2wiz__body">
        {head?.title ? (
          <div className="v2wiz__head">
            <h2 className="lw-ui-section">{head.title}</h2>
            {head.intro ? <p className="lw-ui-lead">{head.intro}</p> : null}
          </div>
        ) : null}
        {children}
      </div>
      {footer || progress ? (
        <div className="v2wiz__foot">
          <span className="v2wiz__progress" aria-live="polite">
            {progress}
          </span>
          {footer}
        </div>
      ) : null}
    </div>
  );
}
