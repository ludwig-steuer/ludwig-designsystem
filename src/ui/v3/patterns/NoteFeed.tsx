"use client";

import { useState, type ReactNode } from "react";

import { Button } from "../primitives/Button";
import { TextButton } from "../primitives/TextButton";
import { formatTime } from "../format";

/**
 * Notes on a record: what somebody said about it, newest first, and a field to
 * write another (0158).
 *
 * **Two lines per note, not three columns.** The caption — „vor 3 Tagen ·
 * Mandant" — sits above the text and carries both; the text below runs the
 * full width. In a 320 px side column that is the difference between four
 * readable lines and twelve broken ones: a date column would take a third of
 * the width for six characters (owner, 2026-09-10).
 *
 * **The time is relative within the week.** „vor 3 Tagen" answers the
 * question one asks of a note („is this still current?"); beyond a week
 * `formatTime` prints the date, because „vor 40 Tagen" makes the reader count.
 * Date and hour sit in the `title` either way.
 *
 * **The field unfolds.** A permanently open input in a side column demands
 * something nobody intended — the button asks first, then the field comes.
 *
 * **Nothing typed is lost.** The field is cleared only once the caller says
 * the note is stored: when `onAdd` returns a promise, the text stays until it
 * resolves, and a rejection leaves it where it was typed.
 */

export interface Note {
  id: string;
  /** ISO timestamp. Shown as „vor 3 Tagen"; the date sits in the `title`. */
  at: string;
  /** Who wrote it — „Mandant", „Kanzlei", „Agent". */
  author?: string | null;
  text: string;
}

/**
 * @when    Notes and comments on one record, with a way to add another.
 * @instead The domain history of a case → Timeline. The audit trail with actor
 *          and action → LogList. A question that expects an answer →
 *          ClarificationCard. What is still open → OpenPoints.
 */
export function NoteFeed({
  notes,
  onAdd,
  addLabel = "Notiz hinzufügen",
  placeholder = "Was soll hier festgehalten werden?",
  empty = "Noch keine Notiz.",
}: {
  /** Newest first — the order belongs to the caller (E2). */
  notes: readonly Note[];
  /**
   * Without a callback there is **no button**: „does not exist yet" and „not
   * allowed here" are the same state, and a field without a target is a
   * promise without cover (A12). Return a promise to keep the text until the
   * note is stored.
   */
  onAdd?: (text: string) => void | Promise<void>;
  addLabel?: string;
  placeholder?: string;
  empty?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  const submit = async () => {
    const value = text.trim();
    if (!value || !onAdd) return;
    setSaving(true);
    setFailed(false);
    try {
      await onAdd(value);
      setText("");
      setOpen(false);
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    setText("");
    setFailed(false);
    setOpen(false);
  };

  return (
    <div className="v3notes">
      {notes.length === 0 ? <p className="v3notes__empty">{empty}</p> : null}
      {notes.map((note) => (
        <div className="v3notes__item" key={note.id}>
          <div className="v3notes__meta">
            <time dateTime={note.at} title={formatTime(note.at, "dateTime")}>
              {formatTime(note.at, "relative")}
            </time>
            {note.author ? <span>· {note.author}</span> : null}
          </div>
          <p className="v3notes__text">{note.text}</p>
        </div>
      ))}

      {onAdd ? (
        open ? (
          <div className="v3notes__form">
            <textarea
              className="v2in v3notes__field"
              rows={3}
              value={text}
              placeholder={placeholder}
              onChange={(e) => setText(e.target.value)}
              aria-invalid={failed || undefined}
              autoFocus
            />
            {failed ? (
              <p className="v3notes__error" role="alert">
                Die Notiz wurde nicht gespeichert. Ihr Text steht noch im Feld.
              </p>
            ) : null}
            <div className="v3notes__acts">
              <Button
                variant="primary"
                size="sm"
                loading={saving}
                disabled={text.trim() === ""}
                onClick={submit}
              >
                Speichern
              </Button>
              <TextButton tone="quiet" disabled={saving} onClick={cancel}>
                Abbrechen
              </TextButton>
            </div>
          </div>
        ) : (
          <TextButton onClick={() => setOpen(true)}>{addLabel}</TextButton>
        )
      ) : null}
    </div>
  );
}
