"use client";

import { useEffect, useState } from "react";
import { Badge } from "../primitives/Badge";
import { Dialog } from "../primitives/Dialog";
import { Disclosure } from "../primitives/Disclosure";
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
 * THE status dialog — one for every axis. Lists **all** values with badge and
 * meaning in plain words; the current one is highlighted. The DB value of each
 * state, the column it lives in and the developers' description of the
 * machine are technical and stay folded under „Technisch" (T4, owner
 * 2026-09-27). Every word comes from
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
        {machine ? (
          <div>
            <Segmented options={VIEWS} active={view} ariaLabel="Darstellung" onPick={setView} />
          </div>
        ) : null}

        {machine && view === "diagram" ? (
          // The machine's own description is written for developers (spec and rule
          // numbers, code names) — it goes under „Technisch", not above the picture
          // (owner 2026-09-27, T4). An empty string switches the lead off.
          <StateMachine axis={axis} current={current ?? null} description="" />
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

        {/* Everything technical in one place, folded: where the value is stored
            and how the machine is described for developers (T4, owner 2026-09-27). */}
        <Disclosure summary="Technisch">
          <div className="v3stlegend__techblock">
            <div>
              Woher der Wert kommt: <code>{AXIS_SOURCE[axis]}</code>
            </div>
            {machine?.description ? <p>{machine.description}</p> : null}
          </div>
        </Disclosure>
      </div>
    </Dialog>
  );
}
