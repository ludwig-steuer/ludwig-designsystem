"use client";

import { useEffect, useState } from "react";
import { Badge } from "../primitives/Badge";
import { Dialog } from "../primitives/Dialog";
import { Segmented } from "../primitives/Nav";
import { AXIS_LABEL, AXIS_SOURCE } from "./entity-icons";
import { StateMachine, machineForAxis } from "./StateMachine";
import { axisLegend, type StatusAxis } from "@/ludwig/ui/status/status-registry";

interface StatusInfoDialogProps {
  axis: StatusAxis;
  /**
   * Current DB value — highlighted in the list. `undefined` is allowed
   * explicitly: under `exactOptionalPropertyTypes` a missing prop and an
   * undefined one differ, and the caller passes on what it has.
   */
  current?: string | null | undefined;
  open: boolean;
  onClose: () => void;
}

const VIEWS = [
  { key: "diagram", label: "Diagramm" },
  { key: "list", label: "Liste" },
];

/**
 * THE status dialog — one for every axis. Explains what kind of status it is
 * (axis + technical origin) and lists **all** values with badge, text, DB
 * value and meaning; the current one is highlighted. Every word comes from
 * `status-registry.ts`, so a new value appears without touching this file.
 *
 * An axis with an entry in `STATE_MACHINES` opens as the picture of its
 * transitions, the list one click away (F293). Without one — a class, or a
 * machine not yet written down (F151, L-75) — only the list: a line „no
 * transitions" would be wrong for a class.
 *
 * @when    All values of one status axis explained, with badge and DB value,
 *          with the map of its transitions when the axis has a machine.
 * @instead One status as a chip → StatusBadge. The (i) that opens this →
 *          StatusInfoButton. Any other confirmation → Dialog.
 */
export function StatusInfoDialog({ axis, current, open, onClose }: StatusInfoDialogProps) {
  const machine = machineForAxis(axis);
  const items = axisLegend(axis);
  const [view, setView] = useState("diagram");
  // Every opening starts with the picture again.
  useEffect(() => {
    if (open) setView("diagram");
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} title={AXIS_LABEL[axis]} size={machine ? "lg" : "md"}>
      {/* minmax(0, …): without it the grid cell grows to the diagram's width
          and the dialog clips it instead of the diagram scrolling. */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 14 }}>
        <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", lineHeight: 1.45 }}>
          Woher der Wert kommt:{" "}
          <code style={{ fontSize: 11.5, opacity: 0.9 }}>{AXIS_SOURCE[axis]}</code>
        </div>

        {machine ? (
          <div>
            <Segmented options={VIEWS} active={view} ariaLabel="Darstellung" onPick={setView} />
          </div>
        ) : null}

        {machine && view === "diagram" ? (
          <StateMachine axis={axis} current={current ?? null} />
        ) : (
          // One table: the states in the first column, their meaning in the
          // second — every description starts at the same edge, whatever the
          // badge's width (owner 2026-09-27). The database value is not a column
          // to scan; it sits under the meaning, marked as technical.
          <div className="v3stlegend">
            {items.map((it) => {
              const active = current != null && it.value === current;
              return (
                <div key={it.value} className={`v3stlegend__row${active ? " is-active" : ""}`}>
                  <div>
                    <Badge tone={it.kind}>{it.label}</Badge>
                  </div>
                  <div className="v3stlegend__text">
                    {it.meaning || <span className="v3stlegend__muted">—</span>}
                    {active ? <span className="v3stlegend__muted"> · aktuell</span> : null}
                    <div className="v3stlegend__tech">
                      Technisch: <code>{it.value}</code>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Dialog>
  );
}
