"use client";

import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { Button, type ButtonSize, type ButtonVariant } from "./Button";
import { Dialog } from "./Dialog";

/**
 * The button that runs the action (0004).
 *
 * 61 client components in the app rebuild pending, error and confirmation by
 * hand, 28 of them with `window.confirm` (an I2 violation). This is that job,
 * once: locked while running, error next to the button, an optional dialog in
 * front of it.
 *
 * It deliberately does not report success — a completed action shows in the
 * result (the row is gone, the status changed), not in a text that has to
 * disappear again. Where a passing note really is needed, the caller reaches
 * for `useToast` (0007).
 */

export type ActionResult = void | { error?: string };

export interface ConfirmSpec {
  title: string;
  body?: ReactNode;
  /** Names the consequence — „Stapel stornieren", never „OK" (T3). */
  confirmLabel: string;
  tone?: "danger";
}

/**
 * @when    Every action that runs, can take a moment and can fail — approve,
 *          reverse, export, delete.
 * @instead A jump → Button with `href`. A purely visual button whose caller
 *          holds the state → Button with `loading`. An action inside running
 *          text → TextButton.
 */
export function ActionButton({
  action,
  children,
  variant = "secondary",
  size = "md",
  icon,
  hotkey,
  pendingLabel,
  confirm,
  disabled,
}: {
  /** Throws or returns `{ error }` — Ludwig does both today. */
  action: () => Promise<ActionResult>;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  hotkey?: string;
  pendingLabel?: string;
  confirm?: ConfirmSpec;
  disabled?: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const trigger = useRef<HTMLSpanElement>(null);

  async function run() {
    if (pending) return; // two clicks, one action
    setPending(true);
    setError(null);
    try {
      const result = await action();
      if (result && typeof result === "object" && result.error) setError(result.error);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Die Handlung ist fehlgeschlagen.");
    } finally {
      setPending(false);
    }
  }

  function closeDialog() {
    setAsking(false);
    // Back to where the click came from — otherwise the keyboard restarts at
    // the top of the page (V10).
    trigger.current?.querySelector("button")?.focus();
  }

  return (
    <span className="v2act" ref={trigger}>
      <Button
        variant={variant}
        size={size}
        icon={icon}
        hotkey={hotkey}
        loading={pending}
        loadingLabel={pendingLabel}
        disabled={disabled}
        onClick={() => (confirm ? setAsking(true) : run())}
      >
        {children}
      </Button>
      {error ? <span className="v2act__err">{error}</span> : null}
      {confirm ? (
        <Dialog
          open={asking}
          onClose={closeDialog}
          title={confirm.title}
          footer={
            <>
              <Button size="sm" onClick={closeDialog}>
                Abbrechen
              </Button>
              <Button
                size="sm"
                variant={confirm.tone === "danger" ? "danger" : "primary"}
                onClick={() => {
                  closeDialog();
                  void run();
                }}
              >
                {confirm.confirmLabel}
              </Button>
            </>
          }
        >
          {confirm.body}
        </Dialog>
      ) : null}
    </span>
  );
}
