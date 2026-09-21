import type { ReactNode } from "react";

import { Disclosure } from "./Disclosure";

/**
 * Header card that carries its state in the frame: kicker, title, sub line,
 * actions on the right. The tone colours frame, kicker and sub line; the
 * kicker's word says it again (V7).
 *
 * With `details` the proof folds open **inside the same frame**: the head is
 * the answer, the table below it the evidence. One box, not a header card and
 * a separate fold-out under it (owner 2026-09-21, step 0 of the batch review).
 * It stays a server component — the fold is native `<details>`, and the
 * actions sit in the head, never in the `<summary>`, so a click on them
 * cannot toggle the fold.
 *
 * @when    The header of an item whose state defines the page (batch, period),
 *          optionally with its evidence folded underneath.
 * @instead Note in the flow → Callout. Page-wide message → Banner. A fold-out
 *          that belongs to nothing above it → Disclosure.
 */
export function StatusCallout({
  tone = "neutral",
  icon,
  kicker,
  title,
  sub,
  actions,
  details,
}: {
  tone?: "neutral" | "success" | "warning" | "danger";
  /**
   * Left of the kicker, in the colour of the tone (0049) — part of the tone,
   * not of the text. The word in the kicker stays either way (V7).
   */
  icon?: ReactNode;
  kicker: string;
  title: ReactNode;
  sub?: ReactNode;
  actions?: ReactNode;
  /**
   * The evidence under the head, folded. `summary` says what is inside in half
   * a sentence („5 von 7 Aufgaben erledigt" — never „Details", T2); closed by
   * default, because the head already carries the answer.
   */
  details?: { summary: ReactNode; children: ReactNode; defaultOpen?: boolean };
}) {
  const frame = `v2callout${tone === "neutral" ? "" : ` v2callout--${tone}`}`;
  const head = (
    <>
      {icon ? <span className="v2callout__ico">{icon}</span> : null}
      <div>
        <div className="v2callout__kicker">{kicker}</div>
        <div className="v2callout__title">{title}</div>
        {sub ? <div className="v2callout__sub">{sub}</div> : null}
      </div>
      {actions ? <div className="v2callout__actions">{actions}</div> : null}
    </>
  );
  if (!details) return <div className={frame}>{head}</div>;
  return (
    <div className={`${frame} v2callout--folds`}>
      <div className="v2callout__head">{head}</div>
      <Disclosure summary={details.summary} {...(details.defaultOpen ? { defaultOpen: true } : {})}>
        {details.children}
      </Disclosure>
    </div>
  );
}
