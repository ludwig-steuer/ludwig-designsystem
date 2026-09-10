"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "./Button";
import { Input } from "./Form";
import { TextButton } from "./TextButton";

/**
 * Click, field, save (0020).
 *
 * Six modules rebuild this three-step by hand, each with its own answer to
 * what Escape does. Here it is one answer: Enter saves, Escape discards, and
 * a failed save never throws away what was typed.
 */

export interface InlineEditInputProps {
  value: string;
  onChange: (value: string) => void;
  autoFocus: boolean;
  onKeyDown: (e: React.KeyboardEvent) => void;
  /**
   * The id the word is bound to — set it on **the** control, otherwise the
   * field has no name and the word no click target (0104).
   */
  id: string;
  /**
   * While saving, and while the caller says so. **Set it on the control**: the
   * built-in `Input` had it from the start, a custom one did not — so the
   * buttons locked and the field stayed open, and a real Enter saved past the
   * lock (acceptance 0083, M5).
   */
  disabled: boolean;
}

/**
 * @when    A single value that is read far more often than it is changed —
 *          a summary, a document kind, a name.
 * @instead A whole form → Field plus Button. A decision that needs its own
 *          surface → Dialog. An action rather than a value → ActionButton.
 */
export function InlineEdit({
  label,
  value,
  onSave,
  renderInput,
  renderValue,
  pending,
  error,
  disabled,
  multiline,
}: {
  label: string;
  value: string;
  /** Throws or rejects → the field stays open and shows the error. */
  onSave: (next: string) => Promise<void> | void;
  /** The input element; default is `Input`. */
  renderInput?: (props: InlineEditInputProps) => ReactNode;
  /** The display; default is the text, „—" when empty. */
  renderValue?: (value: string) => ReactNode;
  /** Saving is driven from outside (a server action of the caller). */
  pending?: boolean;
  /** An error from outside; otherwise it comes from `onSave`. */
  error?: string;
  disabled?: boolean;
  /** Multi-line: Ctrl+Enter saves, Enter makes a new line. */
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const fieldId = useId();
  const [draft, setDraft] = useState(value);
  const [busy, setBusy] = useState(false);
  const [ownError, setOwnError] = useState<string | null>(null);

  const running = pending || busy;
  const shownError = error ?? ownError;

  function open() {
    setDraft(value);
    setOwnError(null);
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
    setOwnError(null);
    setDraft(value);
  }

  async function save() {
    setBusy(true);
    setOwnError(null);
    try {
      await onSave(draft);
      setEditing(false);
    } catch (e) {
      // The typed text stays — losing it is worse than the failed save.
      setOwnError(e instanceof Error ? e.message : "Speichern ist fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      cancel();
      return;
    }
    if (e.key === "Enter" && (!multiline || e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      void save();
    }
  }

  if (!editing) {
    return (
      <div className="v2iedit">
        <div className="v2field__label">{label}</div>
        <div className="v2iedit__show">
          <span className={`v2iedit__value${value ? "" : " v2iedit__value--empty"}`}>
            {renderValue ? renderValue(value) : value || "—"}
          </span>
          {disabled ? null : <TextButton onClick={open}>Bearbeiten</TextButton>}
        </div>
        {shownError ? <div className="v2field__err">{shownError}</div> : null}
      </div>
    );
  }

  const inputProps: InlineEditInputProps = {
    value: draft,
    onChange: setDraft,
    autoFocus: true,
    id: fieldId,
    onKeyDown,
    disabled: running,
  };

  return (
    <div className="v2iedit">
      {/* While editing the word is a **label**, not a `div`: otherwise the input had
          neither a name nor a click target (acceptance 0104). At rest it stays a
          `div` — there is no field. */}
      <label className="v2field__label" htmlFor={fieldId}>
        {label}
      </label>
      {renderInput ? (
        renderInput(inputProps)
      ) : (
        <Input
          id={fieldId}
          value={draft}
          autoFocus
          disabled={running}
          invalid={Boolean(shownError)}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
        />
      )}
      {shownError ? <div className="v2field__err">{shownError}</div> : null}
      <div className="v2iedit__acts">
        <Button size="xs" variant="primary" loading={running} loadingLabel="Speichere …" onClick={() => void save()}>
          Speichern
        </Button>
        <Button size="xs" disabled={running} onClick={cancel}>
          Abbrechen
        </Button>
        <span className="v2iedit__keys">
          {multiline ? "Strg+Enter speichert" : "Enter speichert"} · Esc bricht ab
        </span>
      </div>
    </div>
  );
}
