"use client";

import { useEffect, useRef, useState } from "react";
import { ActionIcon } from "../Icons";
import { Button, type ButtonSize, type ButtonVariant } from "./Button";

/**
 * The button that puts a text into the clipboard (0123).
 *
 * **Why it is not an `ActionButton`.** That one says in its own doc that it
 * deliberately does not report success: a finished action shows in the result,
 * not in a text that has to disappear again. Copying is the exception the rule
 * needs — its result is **invisible**. The clipboard shows nothing, the page
 * does not change, and without a word nobody knows whether the click arrived.
 *
 * @when    A ready-made text goes into the clipboard — a booking record, a
 *          token, a prepared mail.
 * @instead Any other action that runs and can fail → ActionButton. A jump →
 *          Button with `href`.
 */
export function CopyTextButton({
  text,
  label,
  title,
  size = "sm",
  variant = "secondary",
}: {
  /** What goes into the clipboard, built by the caller. */
  text: string;
  /** The word at rest, an imperative (T3) — „Buchungssatz kopieren". */
  label: string;
  title?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
}) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A button that is gone before its two seconds are up must not call back
  // into a state that no longer exists.
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setError(null);
      setDone(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setDone(false), 2000);
    } catch {
      // The clipboard throws without a secure context and without permission.
      // The app's version awaited without a catch, so a failure looked exactly
      // like a success that never came.
      setDone(false);
      setError("Die Zwischenablage ist nicht erreichbar. Text von Hand markieren und kopieren.");
    }
  }

  return (
    <span className="v2act">
      <Button
        variant={variant}
        size={size}
        title={title}
        icon={<ActionIcon action={done ? "confirm" : "copy"} size={14} />}
        onClick={() => void copy()}
      >
        {done ? "Kopiert" : label}
      </Button>
      {error ? <span className="v2act__err">{error}</span> : null}
    </span>
  );
}
