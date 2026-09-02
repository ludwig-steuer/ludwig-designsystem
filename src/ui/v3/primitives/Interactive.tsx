"use client";

import type { ReactNode } from "react";
import { useId, useState } from "react";

/**
 * Die Client-Zwillinge des v2-Tabellen-Baukastens (F123 T123.1).
 *
 * `Row` und `Table` aus `./Table` sind Server-Components ohne `onClick` —
 * bewusst. Wo eine Zeile wirklich interaktiv ist (Auswahl, Ausklappen,
 * Master-Detail-Klick), steht sie hier.
 *
 * Die Arbeitsfläche `MasterDetail` wohnt seit F128 eine Stufe höher
 * (`../patterns/MasterDetail`): sie ist ein Muster, keine Primitive.
 */

/** Zeile mit `onClick` statt `href`. Ansonsten identisch zu `Row`. */
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

/**
 * Auswahl-Leiste über dem Spaltenkopf — innerhalb der Karte, nicht im
 * Seitenkopf (Baukasten §4). Erscheint erst, wenn etwas ausgewählt ist.
 */
export function SelectionBar({
  count,
  actions,
  onClear,
}: {
  count: number;
  actions: ReactNode;
  onClear: () => void;
}) {
  if (count === 0) return null;
  return (
    <div className="v2selbar">
      <span className="v2selbar__count">{count} ausgewählt</span>
      <span className="v2selbar__actions">
        {actions}
        <button type="button" className="v2link v2link--quiet" onClick={onClear}>
          Auswahl aufheben
        </button>
      </span>
    </div>
  );
}

/** Auswahl-Kästchen als erste Zelle einer Zeile. */
export function SelectCell({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <input
      type="checkbox"
      className="v2check"
      checked={checked}
      aria-label={label}
      onChange={(e) => onChange(e.target.checked)}
      onClick={(e) => e.stopPropagation()}
    />
  );
}
