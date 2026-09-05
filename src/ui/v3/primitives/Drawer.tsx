"use client";

import { ActionIcon } from "../Icons";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { IconButton } from "./IconButton";

/**
 * Der Slide-over von rechts (0042) — die eine Drawer-Hülle des Sets.
 *
 * Sie ist für das **Nachschlagen neben der Arbeit** da: die Buchhalterin
 * steht in einer Liste und will zu einer Zeile etwas Bestehendes ansehen —
 * das Kontenblatt, die offenen Posten — ohne die Liste zu verlassen. Kommt
 * sie zurück, stehen Filter und Zeile noch.
 *
 * Übernommen aus der App (`ui/components/primitives/Drawer.tsx`, 29
 * Aufrufstellen) mit unverändertem Verhalten; neu sind Tokens statt Hex,
 * `IconButton` statt eigenem Kreuz und die Fokus-Führung.
 */

/** Breiten-Stufen statt ad-hoc-CSS je Aufrufer. Werte in `tokens.css`. */
export type DrawerSize = "sm" | "md" | "lg";

export interface DrawerProps {
  open: boolean;
  /** Escape, Klick aufs Scrim, Kreuz — alle drei Wege melden dasselbe. */
  onClose: () => void;
  title: ReactNode;
  /** Second line below the title — balance, period, origin. */
  meta?: ReactNode;
  children: ReactNode;
  /**
   * Action bar. When the actions need the same state as the body (editor
   * forms), the body renders `<DrawerFooter>` instead — it lands in the same
   * bar through a portal.
   */
  footer?: ReactNode;
  /** Width step, default `md`. */
  size?: DrawerSize;
  /** Only needed when `title` is not a string. */
  ariaLabel?: string;
}

const DrawerFooterSlot = createContext<HTMLElement | null>(null);

/** Wie lange der Knoten nach dem Schließen für die Ausblende-Bewegung steht. */
const EXIT_MS = 300;

/**
 * @when    Looking at something existing next to a list — an account sheet, open items — without leaving the list.
 * @instead Decision with consequences → Dialog. Page built around a list and its detail → MasterDetail. One sentence or a small field → Popover, HoverCard.
 */
export function Drawer({
  open,
  onClose,
  title,
  meta,
  children,
  footer,
  size = "md",
  ariaLabel,
}: DrawerProps) {
  const [render, setRender] = useState(open);
  const [shown, setShown] = useState(false);
  // Portal-Ziel für `<DrawerFooter>`; leer bleibt es per `:empty` unsichtbar.
  const [footerSlot, setFooterSlot] = useState<HTMLElement | null>(null);
  const panel = useRef<HTMLElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      // Der Fokus muss in den Drawer und beim Schließen zurück auf den
      // Auslöser, sonst tabbt die Tastatur hinter dem Scrim weiter (V10/V11).
      opener.current = document.activeElement as HTMLElement | null;
      setRender(true);
      const raf = requestAnimationFrame(() => {
        setShown(true);
        panel.current?.focus();
      });
      return () => cancelAnimationFrame(raf);
    }
    setShown(false);
    opener.current?.focus();
    opener.current = null;
    const t = setTimeout(() => setRender(false), EXIT_MS);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!render) return null;

  return (
    <>
      <div
        className={`v2drawer__scrim${shown ? " is-open" : ""}`}
        onClick={onClose}
        aria-hidden
      />
      <aside
        ref={panel}
        className={`v2drawer v2drawer--${size}${shown ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : ariaLabel}
        tabIndex={-1}
      >
        <div className="v2drawer__h">
          <div className="v2drawer__titl">
            <h3 className="v2drawer__title">{title}</h3>
            {meta ? <div className="v2drawer__meta">{meta}</div> : null}
          </div>
          <IconButton
            label="Schließen"
            icon={<ActionIcon action="close" size={16} />}
            onClick={onClose}
          />
        </div>
        <DrawerFooterSlot.Provider value={footer === undefined ? footerSlot : null}>
          <div className="v2drawer__b">{children}</div>
          {footer === undefined ? (
            <div className="v2drawer__foot" ref={setFooterSlot} />
          ) : (
            <div className="v2drawer__foot">{footer}</div>
          )}
        </DrawerFooterSlot.Provider>
      </aside>
    </>
  );
}

/**
 * @when    The footer actions need the same form state as the drawer body — render this inside the body.
 * @instead Actions that stand on their own → the `footer` prop of Drawer.
 */
export function DrawerFooter({ children }: { children: ReactNode }) {
  const slot = useContext(DrawerFooterSlot);
  return slot ? createPortal(children, slot) : null;
}
