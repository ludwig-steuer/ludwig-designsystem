"use client";

import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { Button, type ButtonSize, type ButtonVariant } from "./Button";
import { Dialog } from "./Dialog";
import { useHotkey } from "./hotkey";

/**
 * The button that runs the action (0004).
 *
 * 61 client components in the app rebuild pending, error and confirmation by
 * hand, 28 of them with `window.confirm` (an I2 violation). This is that job,
 * once: locked while running, error next to the button, an optional dialog in
 * front of it. With `ask` the error stands in the dialog instead, beside what
 * was typed (0159).
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
 * A dialog that **asks something** before the action runs (0121).
 *
 * The confirmation was always there; what it could not do was hand anything
 * back. This is that one direction: the caller renders the content, this
 * component holds the state, locks the confirm button while the state is not
 * valid, and passes it to `action`.
 *
 * It carries `title`, `confirmLabel` and `tone` itself because it **is** the
 * confirmation dialog — `ask` and `confirm` are mutually exclusive in the type
 * for that reason. Two dialogs for one act do not exist.
 *
 * **The dialog stays open until the action has answered** (0159). An error
 * keeps what was typed and stands right under the content; a new input clears
 * it; success closes as before. Not every error can be checked before sending
 * — a number can be taken between the check and the send — and a dialog that
 * closes on the error loses the one thing needed to try again.
 */
export interface AskSpec<Input> {
  title: string;
  /** Names the consequence, never „OK" (T3). */
  confirmLabel: string;
  tone?: "danger";
  /** The state the dialog opens with; it returns here after every close. */
  initial: Input;
  /**
   * The content. `set` reports the new state — controlled, so the confirm
   * button knows whether it may. Nothing of the caller's domain is known here:
   * a picker, a form, a list of options are all just this node.
   */
  render: (state: { value: Input; set: (next: Input) => void }) => ReactNode;
  /** While `false`, the confirm button stays off. Without it every state goes. */
  valid?: (value: Input) => boolean;
}

interface CommonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  hotkey?: string;
  pendingLabel?: string;
  disabled?: boolean;
}

interface PlainProps extends CommonProps {
  /** Throws or returns `{ error }` — Ludwig does both today. */
  action: () => Promise<ActionResult>;
  confirm?: ConfirmSpec;
  ask?: never;
}

interface AskProps<Input> extends CommonProps {
  /** Gets what the dialog last held. */
  action: (input: Input) => Promise<ActionResult>;
  ask: AskSpec<Input>;
  confirm?: never;
}

/**
 * @when    Every action that runs, can take a moment and can fail — approve,
 *          reverse, export, delete.
 * @instead A jump → Button with `href`. A purely visual button whose caller
 *          holds the state → Button with `loading`. An action inside running
 *          text → TextButton.
 */
export function ActionButton<Input = void>(props: PlainProps | AskProps<Input>) {
  const {
    children,
    variant = "secondary",
    size = "md",
    icon,
    hotkey,
    pendingLabel,
    disabled,
  } = props;
  // One of the two, never both — the type says so, so a single truth is enough
  // to tell them apart everywhere below.
  const ask = props.ask;
  const dialog: ConfirmSpec | AskSpec<Input> | undefined = ask ?? props.confirm;

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  // Held even without `ask` — a hook may not be conditional. The one assertion
  // in this file: without `ask` there is no initial state, and `Input` is then
  // `void`, which `undefined` satisfies — but the compiler cannot see that
  // correlation across the union. Nobody reads the value in that branch.
  const [value, setValue] = useState<Input>(() => ask?.initial as Input);
  const trigger = useRef<HTMLSpanElement>(null);

  /**
   * The key on the button does what the click does — a visible key without
   * effect is exactly what V14 forbids, and until 0004 was reviewed this one
   * had none: `hotkey` only reached `Button`, which draws a `Kbd` and
   * listens to nothing.
   *
   * With `confirm` the key opens the dialog, it does not skip it. A key that
   * carries out an irreversible action without asking would be the opposite
   * of what the confirmation is for.
   */
  useHotkey(hotkey, () => {
    if (pending || disabled) return;
    if (dialog) open();
    else void run();
  }, !asking);

  /** Every opening starts from `initial` — a half-filled form does not survive
   *  a cancel, and there is no case that wants it to. */
  function open() {
    if (ask) {
      setValue(ask.initial);
      setError(null);
    }
    setAsking(true);
  }

  /** `true` when the action went through — the dialog of `ask` closes only then. */
  async function run(): Promise<boolean> {
    if (pending) return false; // two clicks, one action
    setPending(true);
    setError(null);
    try {
      const result = props.ask ? await props.action(value) : await props.action();
      if (result && typeof result === "object" && result.error) {
        setError(result.error);
        return false;
      }
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Die Handlung ist fehlgeschlagen.");
      return false;
    } finally {
      setPending(false);
    }
  }

  /** Without `ask` nothing can be invalid, so the button behaves as before. */
  const allowed = !ask || !ask.valid || ask.valid(value);

  function close() {
    setAsking(false);
    // Back to where the click came from — otherwise the keyboard restarts at
    // the top of the page (V10).
    trigger.current?.querySelector("button")?.focus();
  }

  /** Cancel, Escape, the cross. Not while the action runs — its answer belongs in the dialog. */
  function cancel() {
    if (pending) return;
    // An error about an input that is gone would stand at the button without its cause.
    if (ask) setError(null);
    close();
  }

  async function confirmDialog() {
    if (!allowed || pending) return;
    if (!ask) {
      close();
      void run();
      return;
    }
    if (await run()) close();
  }

  /** Typing again answers the error, so it goes. */
  const edit = (next: Input) => {
    setValue(next);
    setError(null);
  };

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
        onClick={() => (dialog ? open() : run())}
      >
        {children}
      </Button>
      {error && !asking ? <span className="v2act__err">{error}</span> : null}
      {dialog ? (
        <Dialog
          open={asking}
          onClose={cancel}
          onConfirm={() => void confirmDialog()}
          title={dialog.title}
          footer={
            <>
              <Button size="sm" onClick={cancel} disabled={pending}>
                Abbrechen
              </Button>
              <Button
                size="sm"
                variant={dialog.tone === "danger" ? "danger" : "primary"}
                disabled={!allowed}
                loading={pending && Boolean(ask)}
                loadingLabel={pendingLabel}
                onClick={() => void confirmDialog()}
              >
                {dialog.confirmLabel}
              </Button>
            </>
          }
        >
          {ask ? (
            <>
              {ask.render({ value, set: edit })}
              {error ? (
                <p className="v2act__err" role="alert">
                  {error}
                </p>
              ) : null}
            </>
          ) : (
            props.confirm?.body
          )}
        </Dialog>
      ) : null}
    </span>
  );
}
