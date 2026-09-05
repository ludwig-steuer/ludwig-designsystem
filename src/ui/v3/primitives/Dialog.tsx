"use client";

import { ActionIcon } from "../Icons";
import { trapTab } from "./focus";
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
  // Starts at `false`, not at `open`: a dialog that is already open in its
  // first render — the caller hooks it in instead of switching it on — would
  // otherwise never see a change and never remember its opener (M2).
  const wasOpen = useRef(false);

  // Who opened it has to be read **while rendering** the opening frame. React
  // applies a child's `autoFocus` during the commit, before any effect of ours
  // runs — asked later, the answer is the field inside the panel, and the way
  // back leads into the dialog that has just closed (M1 of the acceptance of
  // 0092: `ReasonDialog` in `ClarificationCard`).
  if (open !== wasOpen.current) {
    if (open && typeof document !== "undefined") {
      opener.current = document.activeElement as HTMLElement | null;
    }
    wasOpen.current = open;
  }

  // Focus in, and back out again in the cleanup — **not** in an `else` branch
  // for `open === false`. A caller who unhooks the whole dialog instead of
  // setting `open` to false never renders that branch, and the focus was
  // silently lost (M2; `AccountDrawer.stories.tsx`, `ClarificationCard`).
  // Deliberately only keyed on `open`: `onClose`/`onConfirm` usually arrive as
  // fresh lambdas, and a cleanup on every parent render would pull the focus
  // out of a field while someone is typing in it.
  useEffect(() => {
    if (!open) return;
    const active = document.activeElement;
    // The focus goes into the dialog — but not over a child that asked for it.
    // Before 0092 this line ran after `autoFocus` had taken hold and pulled the
    // focus back onto the panel: after ⌘K the CommandPalette had its search
    // field for one tick and then lost it, so typing went nowhere.
    if (!active || !panel.current?.contains(active)) panel.current?.focus();
    return () => {
      // Back where it came from — otherwise the reader lands at the top of the
      // page after every confirmation (V10/V11). The marker is **not** cleared
      // here: under `reactStrictMode` React runs the mount effect twice, and a
      // cleanup that empties it would leave the second round without a way
      // back (B6 of the acceptance). It is overwritten at the next opening.
      const back = opener.current;
      if (back?.isConnected) back.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

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
