import type { ReactNode } from "react";

import { LEVEL_ICON } from "../Icons";
import { CopyTextButton } from "./CopyTextButton";
import { Disclosure } from "./Disclosure";

/** Who solves the problem — sets the fixed sentence after the cause (0264). */
export type ProblemResolution = "user" | "retry" | "support";

/** Criticality of a problem: frame, sign and word in the head. */
export type ProblemLevel = "error" | "warning";

/**
 * The one sentence that says who solves it. `user` has none: the next step
 * already says what to do. One place for the words, so no caller keeps its
 * own list (0264, Offene Frage 1).
 */
const RESOLUTION_SENTENCE: Record<ProblemResolution, string | null> = {
  user: null,
  retry: "Das ist meist vorübergehend.",
  support: "Das liegt nicht an Ihnen.",
};

/**
 * Lines the technical block shows before it scrolls by itself. Above that it
 * becomes a tab stop so a keyboard can scroll it.
 */
const TECH_LINES = 16;
/**
 * Characters per visual line in the narrowest block: at 320 px the monospace
 * block holds about 33 — counting 30 errs towards a tab stop, never against.
 */
const TECH_LINE_CHARS = 24; // ~230 px block (card in a card at 320 px) holds ~29 chars; 24 keeps „never a tab stop too few“ (0264 recheck)

/**
 * Will the technical text overflow its block? Counted on the server, without
 * a hook: each line takes ceil(length / 30) visual lines.
 *
 * ponytail: an estimate — a block wider than a phone wraps less, so a wide
 * block may be a tab stop that does not scroll. Harmless (one extra stop, never
 * one missing); measure with a ResizeObserver if it ever matters.
 */
function overflows(text: string): boolean {
  let lines = 0;
  for (const line of text.split("\n")) {
    lines += Math.max(1, Math.ceil(line.length / TECH_LINE_CHARS));
    if (lines > TECH_LINES) return true;
  }
  return false;
}

/**
 * One problem after a process — what happened, why, what to do now — with
 * one button for the next step and the technical text folded underneath for
 * the support (0264). The head carries the level as sign, word and frame
 * colour (V7); the text stays in the text colour, because three sentences in
 * red read badly. Nothing technical stands outside the fold (T4 b).
 *
 * The button stands in its own row under the next step, on every width: in
 * the head's right column it squeezed the text to a third of the card
 * (Seitenprofil `duo-connect.md`, Nachtrag 1, approved by the owner).
 *
 * A list of problems is markup at the call site: cards one under the other
 * with `--space-3` between them. The card counts nothing and announces
 * nothing — the sentence above it does.
 *
 * @when    A problem after a process: what happened, the cause, the next step
 *          with one button, and the technical text for the support.
 * @instead The result sentence above the problems → StatusCallout
 *          `layout="sentence"`. The failure of a single click → ActionButton.
 *          An error that blocks saving a record → Messages. A sentence without
 *          an action → Callout.
 */
export function ProblemCard({
  title,
  cause,
  step,
  action,
  resolution,
  level = "error",
  context,
  technical,
}: {
  /** **What** happened, one sentence, bold (T5). */
  title: string;
  /** The cause in one or two sentences. */
  cause?: ReactNode;
  /** The next step as a sentence in the Sie form; may hold a `Link`. */
  step: ReactNode;
  /** Exactly one button for the next step: Button, ActionButton or CopyTextButton. */
  action?: ReactNode;
  /** Who solves it; sets the fixed sentence after the cause. */
  resolution: ProblemResolution;
  /** Criticality: frame, sign and word in the head. */
  level?: ProblemLevel;
  /** Where it happened — a step or a client: „Belegabruf“, „Kontoabruf · Konto 2 von 3“. */
  context?: string;
  /** The technical text, unchanged with its line breaks; behind „Technisch“, copyable. */
  technical?: string;
}) {
  const { icon: Icon, label } = LEVEL_ICON[level];
  const fixed = RESOLUTION_SENTENCE[resolution];
  const reason =
    cause !== undefined && fixed ? (
      <>
        {cause} {fixed}
      </>
    ) : (
      (cause ?? fixed)
    );
  const scrolls = technical !== undefined && overflows(technical);

  return (
    <div className={`v3prob v3prob--${level}`}>
      <div className="v3prob__kicker">
        <Icon size={12} strokeWidth={1.5} aria-hidden="true" className="v3prob__ico" />
        <span>
          {label}
          {context ? ` · ${context}` : null}
        </span>
      </div>
      <p className="v3prob__title">{title}</p>
      {reason ? <p className="v3prob__text">{reason}</p> : null}
      <p className="v3prob__text">{step}</p>
      {action ? <div className="v3prob__action">{action}</div> : null}
      {technical !== undefined ? (
        <Disclosure summary="Technisch" tone="quiet">
          <div className="v3prob__tech">
            <pre
              className="v3prob__pre"
              {...(scrolls ? { tabIndex: 0, role: "region", "aria-label": "Technischer Text" } : {})}
            >
              {technical}
            </pre>
            <CopyTextButton text={technical} label="Technischen Text kopieren" size="sm" />
          </div>
        </Disclosure>
      ) : null}
    </div>
  );
}
