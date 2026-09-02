"use client";

import { useState, type ReactNode } from "react";

import { Button } from "./Button";
import { Dialog } from "./Dialog";
import { Textarea } from "./Form";

/**
 * An action that needs a reason (F123 §2.6).
 *
 * Ersetzt `window.prompt`. Der Browser-Prompt war bequem und dreimal falsch:
 * it cannot be styled, carries no context (a reason for what?),
 * und auf keinem Screenshot ist nachvollziehbar, was dort stand.
 *
 * The reason is **optional** by default — where it is required (reversal,
 * Ablehnung), setzt der Aufrufer `required`.
 *
 * @when    Action whose reason belongs in the audit log (return, cancel, reject).
 * @instead Confirmation without a reason → Dialog.
 */
export function ReasonDialog({
  open,
  onClose,
  onConfirm,
  title,
  kicker,
  /** What the reason is for — sits above the field. */
  children,
  label = "Grund (optional)",
  placeholder = "Steht später im Protokoll.",
  confirmLabel = "Bestätigen",
  confirmVariant = "primary",
  required = false,
  /** Suggestions that fill the reason — one click instead of typing. */
  chips,
  pending = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  kicker?: string;
  children?: ReactNode;
  label?: string;
  placeholder?: string;
  confirmLabel?: string;
  confirmVariant?: "primary" | "danger";
  required?: boolean;
  chips?: string[];
  pending?: boolean;
}) {
  const [reason, setReason] = useState("");

  function schliessen() {
    setReason("");
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={schliessen}
      title={title}
      kicker={kicker}
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={schliessen}>
            Abbrechen
          </Button>
          <Button
            variant={confirmVariant}
            size="sm"
            disabled={pending || (required && reason.trim().length === 0)}
            onClick={() => {
              onConfirm(reason.trim());
              setReason("");
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
      {chips && chips.length > 0 ? (
        <div className="v2chips" style={{ marginBottom: 10 }}>
          {chips.map((c) => (
            <button
              type="button"
              className="v2chip"
              key={c}
              onClick={() => setReason(reason ? `${reason} · ${c}` : c)}
            >
              {c}
            </button>
          ))}
        </div>
      ) : null}
      <label className="v2field">
        <span className="v2field__label">{required ? label.replace(" (optional)", "") : label}</span>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={placeholder}
          autoFocus
        />
      </label>
    </Dialog>
  );
}
