"use client";

import { ActionIcon } from "../Icons";
import { IconButton } from "./IconButton";
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

/** Everything a keyboard can reach inside the panel, in document order. */
const TABBABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Keep Tab inside the dialog. Without it the focus walks on behind the scrim,
 * and a reader is suddenly operating a page they cannot see (V10/V11).
 */
function trapTab(panel: HTMLElement | null, e: KeyboardEvent) {
  if (!panel) return;
  const stops = [...panel.querySelectorAll<HTMLElement>(TABBABLE)].filter(
    (el) => el.offsetParent !== null,
  );
  if (stops.length === 0) return;
  const first = stops[0]!;
  const last = stops[stops.length - 1]!;
  const active = document.activeElement;
  if (e.shiftKey && (active === first || active === panel)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && active === last) {
    e.preventDefault();
    first.focus();
  }
}

/**
 * Enter confirms — but not where Enter already means something else: a line
 * break in a textarea, or the button the focus sits on.
 */
function confirmsOnEnter(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  const tag = el?.tagName;
  return tag !== "TEXTAREA" && tag !== "BUTTON" && tag !== "A";
}

export function Dialog({
  open,
  onClose,
  onConfirm,
  title,
  kicker,
  size = "md",
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  /**
   * The primary action. With it, Enter does what the footer's primary button
   * does — required by I2, and until 0092 the dialog had no way to know what
   * that was. Without it, Enter does nothing.
   */
  onConfirm?: () => void;
  title: string;
  kicker?: string;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  footer?: ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      // Back where it came from — otherwise the reader lands at the top of the
      // page after every confirmation (V10/V11).
      opener.current?.focus();
      opener.current = null;
      return;
    }
    opener.current = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        trapTab(panel.current, e);
        return;
      }
      if (e.key === "Enter" && onConfirm && confirmsOnEnter(e.target)) {
        e.preventDefault();
        onConfirm();
      }
    };
    document.addEventListener("keydown", onKey);

    // The focus goes into the dialog — but **not** over a child that asked for
    // it. Before 0092 this line ran after `autoFocus` had already taken hold
    // and pulled the focus back onto the panel: after ⌘K the CommandPalette
    // had its search field focused for one tick and then lost it, so typing
    // went nowhere and Enter closed the palette.
    const active = document.activeElement;
    if (!active || !panel.current?.contains(active)) panel.current?.focus();

    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, onConfirm]);

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
          <IconButton label="Schließen" icon={<ActionIcon action="close" size={16} />} onClick={onClose} />
        </div>
        <div className="v2dlg__body">{children}</div>
        {footer ? <div className="v2dlg__foot">{footer}</div> : null}
      </div>
    </div>
  );
}
