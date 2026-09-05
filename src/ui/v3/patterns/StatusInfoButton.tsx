"use client";

import { useState } from "react";

import { ActionIcon } from "../Icons";
import { AXIS_LABEL } from "./entity-icons";
import { StatusInfoDialog } from "./StatusInfoDialog";
import type { StatusAxis } from "./status-registry";

interface StatusInfoButtonProps {
  axis: StatusAxis;
  /** Aktueller DB-Wert — im Dialog hervorgehoben. */
  current?: string | null;
}

/**
 * Das (i) neben einem Status-Chip: öffnet den gemeinsamen `StatusInfoDialog`
 * mit allen Ausprägungen dieser Achse. Winziges Client-Island, damit
 * `StatusBadge` eine Server-Komponente bleiben kann.
 *
 * @when    „What can this status be?" right next to the status itself.
 * @instead The legend without a trigger → StatusInfoDialog. Help on a field
 *          → Field `hint`. A whole page of explanation → ProseCard.
 */
export function StatusInfoButton({ axis, current }: StatusInfoButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={`${AXIS_LABEL[axis]}: Zustände erklären`}
        title={`${AXIS_LABEL[axis]}: Zustände erklären`}
        onClick={(e) => {
          // Der Chip sitzt oft in einer klickbaren Zeile — die Info soll nur
          // den Dialog öffnen, nicht die Zeilennavigation auslösen.
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          margin: 0,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          color: "var(--color-text-muted)",
          opacity: 0.65,
        }}
      >
        <ActionIcon action="info" size={12} />
      </button>
      <StatusInfoDialog axis={axis} current={current} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
