"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import type { ActionResult } from "./ActionButton";
import { Spinner } from "./Spinner";

/** Props of `Switch` (0266). */
export interface SwitchProps {
  /** Name of the setting — row title, accessible name and part of the announcement. */
  label: string;
  /** One to three sentences under the title, linked with `aria-describedby`. */
  hint?: ReactNode;
  /** The stored value. The caller holds it and sets it anew once stored. */
  checked: boolean;
  /**
   * Called with the new value. `void`: holds at once, nothing to wait for. A
   * promise: the switch stands on the new value and is locked until it
   * answers; `{ error }` or a throw → back, with the error underneath.
   */
  onChange: (checked: boolean) => void | Promise<ActionResult>;
  /** Set means locked. The sentence stands under the explanation — locked without a reason does not exist. */
  disabledReason?: string;
}

/** After this long the spinner appears — a quick store does not flash. */
const SLOW_MS = 300;

const FALLBACK_ERROR = "Die Einstellung ist unverändert. Bitte versuchen Sie es noch einmal.";

function isPromise(value: unknown): value is Promise<ActionResult> {
  return typeof value === "object" && value !== null && typeof (value as Promise<unknown>).then === "function";
}

/**
 * The switch for a setting that takes effect at once (0266).
 *
 * 0018 turned the switch down on 2026-09-04 — a toggle without a word, one
 * that is brushed by accident. The owner lifted that on 2026-11-27 for lasting
 * on/off settings that act at once and can be switched back. The fear of 0018
 * is answered inside the brick, not with a no: the word „An"/„Aus" stands next
 * to the knob in every position, name and explanation share the row, every
 * stored change is announced, and the way back is the same click.
 *
 * A native `input type="checkbox" role="switch"`: `aria-checked` follows the
 * native `checked`, Space toggles, Enter does not (0266, open question 2). An
 * own `aria-checked` would be a second truth.
 *
 * While a returned promise runs, the switch stands on the new value and is
 * `aria-disabled` — not `disabled`, or the focus would be lost. After 300 ms
 * the spinner with „wird gespeichert …" stands in the place of the
 * explanation (same grid cell, the explanation hidden but still the
 * description — nothing below moves), and the status region says the
 * saving words once, with the label in front. Storing in `chrome.storage`
 * takes milliseconds, and then nothing flashes or speaks. An error (`{ error }` or a throw)
 * springs it back and stands underneath, announced; success is announced in a
 * status region that is in the DOM from the start.
 *
 * @when    A lasting on/off setting that takes effect at once and can be switched back.
 * @instead A yes/no saved with a form → Checkbox. A one-off action → Button / ActionButton.
 *          Choosing between views → Segmented. One of several values → RadioGroup.
 */
export function Switch({ label, hint, checked, onChange, disabledReason }: SwitchProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const hintId = `${id}-hint`;
  const reasonId = `${id}-reason`;
  const errorId = `${id}-error`;

  /** The value shown while a promise runs; `null` → the stored `checked`. */
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const [pending, setPending] = useState(false);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  // A switch that is gone before its promise answers must not call back into
  // a state that no longer exists.
  const alive = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    // Set on every mount, not only in `useRef`: StrictMode mounts, cleans up
    // and mounts again — without this line the switch stayed locked after the
    // first store (0266, finding M from the review).
    alive.current = true;
    return () => {
      alive.current = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const shown = optimistic ?? checked;
  const locked = Boolean(disabledReason);

  async function handle(event: ChangeEvent<HTMLInputElement>) {
    // Locked while saving: the native box would flip, the controlled value
    // puts it straight back.
    if (pending || locked) return;
    const next = event.target.checked;
    setError(null);
    setAnnouncement("");

    let result: void | Promise<ActionResult>;
    try {
      result = onChange(next);
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : FALLBACK_ERROR);
      return;
    }
    // `void`: the caller sets `checked` at once; the change of the focused
    // switch is read out already, an announcement would say it twice.
    if (!isPromise(result)) return;

    setOptimistic(next);
    setPending(true);
    timer.current = setTimeout(() => {
      if (!alive.current) return;
      setSlow(true);
      // Heard as well as seen: the polite region says it once (0266 addendum).
      setAnnouncement(`${label} wird gespeichert …`);
    }, SLOW_MS);

    let failure: string | null = null;
    try {
      const answer = await result;
      if (answer && typeof answer === "object" && answer.error) failure = answer.error;
    } catch (e) {
      failure = e instanceof Error && e.message ? e.message : FALLBACK_ERROR;
    }

    if (timer.current) clearTimeout(timer.current);
    if (!alive.current) return;
    setSlow(false);
    setPending(false);
    setOptimistic(null);
    if (failure) {
      // The error speaks through `role="alert"`; the region falls silent.
      setAnnouncement("");
      setError(failure);
    } else {
      setAnnouncement(`${label} ${next ? "eingeschaltet" : "ausgeschaltet"}.`);
    }
  }

  const describedBy =
    [hint ? hintId : null, disabledReason ? reasonId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  const cls = `v2switch${locked ? " is-disabled" : ""}${pending ? " is-pending" : ""}`;

  return (
    <div className={cls}>
      <label className="v2switch__row">
        <span className="v2switch__text">
          <span id={labelId} className="v2switch__label">
            {label}
          </span>
          {/* Explanation and saving line share one grid cell: while the store
              takes long the explanation is hidden (not removed — it stays the
              description) and the spinner stands in its place, so the row keeps
              the explanation's height and nothing below moves. */}
          {hint || slow ? (
            <span className="v2switch__sub">
              {hint ? (
                <span id={hintId} className={`v2switch__hint${slow ? " is-hidden" : ""}`}>
                  {hint}
                </span>
              ) : null}
              {slow ? (
                <span className="v2switch__saving">
                  <Spinner size="sm" label="wird gespeichert …" />
                </span>
              ) : null}
            </span>
          ) : null}
          {disabledReason ? (
            <span id={reasonId} className="v2switch__reason">
              {disabledReason}
            </span>
          ) : null}
        </span>
        {/* Both words in one cell: the cell is as wide as „Aus", so the knob
            never moves when the word changes. The state is read out from
            `checked` — the word is for the eye. */}
        <span className="v2switch__state" aria-hidden="true">
          <span className={shown ? undefined : "is-hidden"}>An</span>
          <span className={shown ? "is-hidden" : undefined}>Aus</span>
        </span>
        <input
          type="checkbox"
          role="switch"
          className="v2switch__knob"
          checked={shown}
          onChange={(e) => void handle(e)}
          aria-labelledby={labelId}
          aria-describedby={describedBy}
          aria-disabled={pending || undefined}
          disabled={locked}
        />
      </label>
      <div className="v2switch__msg">
        <span id={errorId} role="alert" className="v2switch__err">
          {error ? (
            <>
              <strong>Nicht gespeichert.</strong> {error}
            </>
          ) : null}
        </span>
      </div>
      <span className="v2vh" role="status">
        {announcement}
      </span>
    </div>
  );
}
