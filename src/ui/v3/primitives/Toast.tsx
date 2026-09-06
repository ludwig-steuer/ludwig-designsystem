"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { TextButton } from "./TextButton";

/**
 * The passing confirmation (0007).
 *
 * It says that something has happened — never that something went wrong with
 * an action someone just triggered. That belongs at the button, where the eye
 * already is (`ActionButton`). A toast is read in passing or not at all.
 */

export type ToastTone = "success" | "warning" | "danger";

export interface Toast {
  /** What happened, in the perfect tense: „Der Export wurde gestartet." */
  text: string;
  tone?: ToastTone;
  /** One way onward. Never „Rückgängig" unless it really undoes. */
  action?: { label: string; onClick: () => void };
}

type Shown = Toast & { id: number };

const ToastContext = createContext<{ show: (toast: Toast) => void } | null>(null);

/** At most three at a time — a fourth one pushes the oldest out. */
const MAX = 3;
const DURATION_MS = 5000;

/**
 * @when    Around a page whose actions confirm themselves — one host per page.
 * @instead A standing notice → Callout. A decision → Dialog. The error of an
 *          action → ActionButton, which shows it at the button.
 */
export function ToastHost({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Shown[]>([]);
  const next = useRef(0);

  const show = useCallback((toast: Toast) => {
    next.current += 1;
    const shown = { ...toast, id: next.current };
    setItems((prev) => [...prev, shown].slice(-MAX));
  }, []);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {items.length > 0 ? (
        <div className="v2toasts" aria-live="polite">
          {items.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
          ))}
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

/**
 * @when    Showing a toast from a client component inside `ToastHost`.
 * @instead A message that stays on the page → Callout. A decision → Dialog.
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast braucht einen ToastHost über sich.");
  return ctx;
}

function ToastItem({ toast, onDismiss }: { toast: Shown; onDismiss: () => void }) {
  // With an action it stays: otherwise the way onward disappears while it is
  // being read. Hover and focus stop the clock — whoever looks at it should
  // not lose what they are reading.
  const [paused, setPaused] = useState(false);
  const permanent = Boolean(toast.action);

  useEffect(() => {
    if (permanent || paused) return;
    const id = setTimeout(onDismiss, DURATION_MS);
    return () => clearTimeout(id);
  }, [permanent, paused, onDismiss]);

  const tone = toast.tone ?? "success";
  return (
    <div
      className={`v2toast${tone === "success" ? "" : ` v2toast--${tone}`}`}
      role={tone === "danger" ? "alert" : "status"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span className="v2toast__text">{toast.text}</span>
      <span className="v2toast__acts">
        {toast.action ? (
          <TextButton
            onClick={() => {
              toast.action?.onClick();
              onDismiss();
            }}
          >
            {toast.action.label}
          </TextButton>
        ) : null}
        <TextButton tone="quiet" onClick={onDismiss}>
          Schließen
        </TextButton>
      </span>
    </div>
  );
}
