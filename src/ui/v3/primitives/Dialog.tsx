"use client";

import { ActionIcon } from "../Icons";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * v2-Dialog (F123 T123.1) — Anatomie des Design-System-Drawers (`.dr__h` /
 * `.dr__body` / `.dr__foot`), nur zentriert statt seitlich.
 *
 * **Nur für Bestätigungen mit Folgen** (Storno, Löschen, Freigabe) und für
 * kurze Formulare, die eine Handlung begleiten — Gründe, Notizen. Details
 * gehören ins Master-Detail, Bestehendes in den Drawer (UX-Guidelines L2/L3).
 *
 * Ersetzt `Dialog` aus `@/ui/components` (12-px-Radius, dunkler Backdrop
 * ohne Blur).
 *
 * @when    Confirmation with consequences (cancel, delete, approve) or a short form that accompanies an action.
 * @instead Details of an item → MasterDetail. Action that needs a reason → ReasonDialog.
 */
export function Dialog({
  open,
  onClose,
  title,
  kicker,
  size = "md",
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  kicker?: string;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  footer?: ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // Der Fokus muss in den Dialog, sonst tabbt die Tastatur hinter dem Scrim
    // weiter (UX-Guidelines V10/V11).
    panel.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="v2scrim"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panel}
        className={`v2dlg v2dlg--${size}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <div className="v2dlg__h">
          <div>
            {kicker ? <div className="v2dlg__kicker">{kicker}</div> : null}
            <div className="v2dlg__title">{title}</div>
          </div>
          <button type="button" className="v2dlg__close" onClick={onClose} aria-label="Schließen">
            <ActionIcon action="close" size={16} />
          </button>
        </div>
        <div className="v2dlg__body">{children}</div>
        {footer ? <div className="v2dlg__foot">{footer}</div> : null}
      </div>
    </div>
  );
}
