"use client";

import { useState, type ReactNode } from "react";

import { Button } from "./Button";
import { Dialog } from "./Dialog";
import { Textarea } from "./Form";

/**
 * Eine Handlung, die einen Grund braucht (F123 §2.6).
 *
 * Ersetzt `window.prompt`. Der Browser-Prompt war bequem und dreimal falsch:
 * er lässt sich nicht gestalten, trägt keinen Kontext (wofür ist der Grund?),
 * und auf keinem Screenshot ist nachvollziehbar, was dort stand.
 *
 * Der Grund ist per Voreinstellung **optional** — wo er Pflicht ist (Storno,
 * Ablehnung), setzt der Aufrufer `required`.
 */
export function GrundDialog({
  open,
  onClose,
  onConfirm,
  title,
  kicker,
  /** Wofür der Grund ist — steht über dem Feld. */
  children,
  label = "Grund (optional)",
  placeholder = "Steht später im Protokoll.",
  confirmLabel = "Bestätigen",
  confirmVariant = "primary",
  required = false,
  /** Vorschläge, die den Grund füllen — ein Klick statt Tippen. */
  chips,
  pending = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (grund: string) => void;
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
  const [grund, setGrund] = useState("");

  function schliessen() {
    setGrund("");
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
            disabled={pending || (required && grund.trim().length === 0)}
            onClick={() => {
              onConfirm(grund.trim());
              setGrund("");
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
              onClick={() => setGrund(grund ? `${grund} · ${c}` : c)}
            >
              {c}
            </button>
          ))}
        </div>
      ) : null}
      <label className="v2field">
        <span className="v2field__label">{required ? label.replace(" (optional)", "") : label}</span>
        <Textarea
          value={grund}
          onChange={(e) => setGrund(e.target.value)}
          placeholder={placeholder}
          autoFocus
        />
      </label>
    </Dialog>
  );
}
