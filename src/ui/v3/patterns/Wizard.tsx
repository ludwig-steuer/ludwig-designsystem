import { Check, CircleAlert } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

/** Where a step stands. Open, on it, through it, stuck. */
export type WizardStepState = "pending" | "active" | "done" | "error";

export interface WizardStep {
  /** The word in the head of the step. Long ones get an ellipsis. */
  label: string;
}

export interface WizardProps {
  steps: WizardStep[];
  /** 0-based index of the active step; it carries `aria-current="step"`. */
  current: number;
  /** State per step — exactly `steps.length` entries. */
  states: WizardStepState[];
  /** The content of the current step. */
  children: ReactNode;
  /** Back/next and a progress line. Without it there is no foot in the DOM. */
  footer?: ReactNode;
}

const STATE_ICON = {
  done: { Icon: Check, label: "erledigt" },
  error: { Icon: CircleAlert, label: "Fehler" },
} as const;

/**
 * The chrome of a run in numbered steps: the steps at the top, the content of
 * the current one below, back and next at the bottom.
 *
 * It is a shell and nothing else. Which step is current, what happens on next,
 * whether a step failed — the module knows that and passes it in. A summary is
 * a step like any other; its content is `children`.
 *
 * Never color alone (V7): `done` shows a check instead of the number, `error`
 * an alert on danger, `active` the number on primary, `pending` the number
 * muted. The error icon is Lucide `CircleAlert`, not `StateIcon` from
 * `Review.tsx` — `StateIcon` paints its own color, and inside a filled danger
 * pill that would be danger on danger.
 *
 * @when    A linear run of steps — import, export, onboarding.
 * @instead Every step reachable at any time → StepRail. Phases the system
 *          runs through → ProcessStepper. Two to four views → Tabs.
 */
export function Wizard({ steps, current, states, children, footer }: WizardProps) {
  return (
    <div className="v2wiz">
      <div
        className="v2wiz__steps"
        style={{ "--v2wiz-steps": steps.length } as CSSProperties}
      >
        {steps.map((step, i) => {
          const state = states[i] ?? "pending";
          const icon = state === "done" || state === "error" ? STATE_ICON[state] : null;
          return (
            <div
              key={step.label}
              className="v2wiz__step"
              data-state={state}
              aria-current={i === current ? "step" : undefined}
            >
              <span className="v2wiz__num">
                {icon ? (
                  <icon.Icon size={14} strokeWidth={1.5} role="img" aria-label={icon.label} />
                ) : (
                  i + 1
                )}
              </span>
              <span className="v2wiz__lbl">
                <span className="v2wiz__n">Schritt {i + 1}</span>
                <span className="v2wiz__name">{step.label}</span>
              </span>
            </div>
          );
        })}
      </div>
      <div className="v2wiz__body">{children}</div>
      {footer ? <div className="v2wiz__foot">{footer}</div> : null}
    </div>
  );
}
