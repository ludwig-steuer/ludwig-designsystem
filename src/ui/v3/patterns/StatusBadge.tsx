import { ChevronDown } from "lucide-react";

import { Badge } from "../primitives/Badge";
import { AXIS_LABEL, ENTITY_ICON } from "./entity-icons";
import { StatusInfoButton } from "./StatusInfoButton";
import { resolveStage, resolveStatus, type StatusAxis } from "./status-registry";

export interface StatusBadgeProps {
  /** Welche Status-Achse — bestimmt Label, Farbe und Erklärung. */
  axis: StatusAxis;
  status: string | null | undefined;
  /** Nur `beleg`: erreichte Pipeline-Stufe (`processing_stage`) als Detail. */
  stage?: string | null;
  /** Icon zeigen, sofern die Achse eines hat (Default true). */
  showIcon?: boolean;
  /**
   * (i) neben dem Chip: öffnet den gemeinsamen `StatusInfoDialog` mit ALLEN
   * Ausprägungen der Achse. Default an. Abschalten, wo der Chip selbst schon
   * klickbar ist (z.B. `EntityStatusBadgeButton`).
   */
  info?: boolean;
  /**
   * A chevron behind the label, for a chip that opens a menu of follow-up
   * states (0049). Markup only — the `aria-haspopup`/`aria-expanded`
   * relation belongs on the trigger, and `Popover` already sets it there.
   */
  chevron?: boolean;
  /**
   * Freitext dieses einen Objekts, an den Tooltip angehängt — der Grund einer
   * Erledigung (`completed_reason`), die Notiz einer Ersetzung. Die Achse
   * kennt ihn nicht: er gehört dem Datensatz, nicht dem Zustand. Er ersetzt
   * nie das Wort auf der Marke (V7).
   */
  note?: string | null;
  className?: string;
}

/**
 * Der Status-Chip der App. Holt Label, Farbe und Erklärung aus der zentralen
 * Registry (`status-registry.ts`) — deshalb sieht derselbe Zustand überall
 * gleich aus, egal in welcher Ansicht er steht.
 *
 * Drei Ebenen Erklärung, aufsteigend nach Tiefe:
 *  1. das Label selbst (deutsch),
 *  2. der Hover (`title`): Achse, Zustand, Bedeutung — ohne Client-JS,
 *  3. das (i): der gemeinsame `StatusInfoDialog` mit allen Ausprägungen der
 *     Achse, ihren DB-Werten und der technischen Herkunft.
 *
 * Der Chip bleibt server-tauglich; nur das (i) ist ein Client-Island. Für die
 * klickbare Variante mit Flow-Modal gibt es `EntityStatusBadgeButton`.
 *
 * @when    Ein Zustand aus einer Status-Achse (beleg, sachverhalt, buchung,
 *          job …). Die einzige erlaubte Status-Darstellung (R1).
 * @instead Eine Eigenschaft ohne Achse — Art, Rolle, Zähler → Badge.
 *          Ein Zustand mit Erklärsatz und Handlung → StatusCallout.
 */
export function StatusBadge({
  axis,
  status,
  stage,
  showIcon = true,
  info = true,
  chevron = false,
  note,
  className,
}: StatusBadgeProps) {
  const desc = resolveStatus(axis, status);
  const stageDesc = axis === "beleg" ? resolveStage(stage) : null;
  const Icon = ENTITY_ICON[axis];
  const raw = typeof status === "string" ? status.trim() : "";
  const title = [
    `${AXIS_LABEL[axis]}: ${desc.label}`,
    stageDesc ? `Stufe: ${stageDesc.label}` : null,
    desc.description ?? null,
    note ?? null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <span
      title={title}
      className={className}
      style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
    >
      <Badge tone={desc.kind}>
        {showIcon && Icon ? (
          <Icon
            size={12.5}
            strokeWidth={1.75}
            style={{ marginRight: 4, verticalAlign: "-2px" }}
          />
        ) : null}
        {desc.label}
        {chevron ? (
          <ChevronDown
            size={12}
            strokeWidth={1.5}
            style={{ marginLeft: 3, verticalAlign: "-2px", opacity: 0.7 }}
            aria-hidden="true"
          />
        ) : null}
      </Badge>
      {stageDesc ? (
        <span style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
          · {stageDesc.label}
        </span>
      ) : null}
      {info ? <StatusInfoButton axis={axis} current={raw || null} /> : null}
    </span>
  );
}
