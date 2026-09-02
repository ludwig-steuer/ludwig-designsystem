"use client";

import type { ReactNode } from "react";
import { useId, useState } from "react";

/**
 * Die Client-Zwillinge von `Row` (F123 T123.1).
 *
 * `Row` und `Table` aus `./Table` sind Server-Components ohne `onClick` —
 * bewusst. Wo eine Zeile wirklich interaktiv ist (Ausklappen, Master-Detail-
 * Klick), steht sie hier; die Mehrfachauswahl steht in `./Selection`.
 */

/**
 * Zeile mit `onClick` statt `href`. Ansonsten identisch zu `Row`.
 *
 * @when    Der Klick tut etwas im Client, etwa die Auswahl im MasterDetail.
 * @instead Das Ziel ist eine URL → Row mit `href`.
 */
export function ClickRow({
  onClick,
  active,
  children,
  className,
}: {
  onClick: () => void;
  active?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={`v2tbl__row is-clickable${active ? " is-active" : ""}${className ? ` ${className}` : ""}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {children}
    </div>
  );
}

/**
 * Zeile, die sich in die Tabelle hinein aufklappt — kein Modal, kein Drawer
 * für kleine Zusatzinfos (Baukasten §7).
 *
 * @when    Eine kleine Zusatzinfo zu einer Zeile, die gelesen und wieder zugeklappt wird.
 * @instead Arbeit am Element → MasterDetail. Bestätigung mit Folgen → Dialog.
 */
export function ExpandableRow({
  summary,
  children,
  defaultOpen = false,
}: {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-controls={id}
        className="v2tbl__row is-clickable"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
      >
        <span className={`v2chev${open ? " is-open" : ""}`} />
        {summary}
      </div>
      {open ? (
        <div className="v2tbl__detail" id={id}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
