import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Popover } from "../primitives/Popover";
import { AXIS_LABEL } from "./entity-icons";
import { StatusBadge } from "./StatusBadge";
import { STATUS_REGISTRY, axisLegend, type StatusAxis } from "@/ludwig/ui/status/status-registry";

const meta: Meta<typeof StatusBadge> = {
  title: "v3/Patterns/Prüfen/StatusBadge",
  component: StatusBadge,
  args: { axis: "accounting_case", status: "open" },
};
export default meta;
type Story = StoryObj<typeof StatusBadge>;

const AXES = Object.keys(STATUS_REGISTRY) as StatusAxis[];

function AxisBlock({ axis, info }: { axis: StatusAxis; info?: boolean }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 13, color: "var(--color-text-subtle)", marginBottom: 6 }}>
        <code>{axis}</code> — {AXIS_LABEL[axis]}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {Object.keys(STATUS_REGISTRY[axis]).map((value) => (
          <StatusBadge key={value} axis={axis} status={value} info={info ?? false} />
        ))}
      </div>
    </div>
  );
}

/**
 * **Alle** Achsen mit **allen** Ausprägungen — direkt aus der
 * `STATUS_REGISTRY` erzeugt, nicht von Hand gelistet. Kommt eine Achse oder
 * ein Zustand dazu, steht er beim nächsten Öffnen hier drin; eine
 * handgepflegte Liste wäre am Tag ihrer Erstellung veraltet.
 */
export const AllAxes: Story = {
  render: () => (
    <div>
      {AXES.map((axis) => (
        <AxisBlock key={axis} axis={axis} />
      ))}
    </div>
  ),
};

/** Die drei Haupt-Entitäten, die einen echten Flow haben. */
export const CoreAxes: Story = {
  render: () => (
    <div>
      <AxisBlock axis="document_processing" />
      <AxisBlock axis="accounting_case" />
      <AxisBlock axis="journal_entry" />
    </div>
  ),
};

/** Einzelner Chip mit (i) — öffnet die Legende der ganzen Achse. */
export const WithInfoDialog: Story = { args: { axis: "journal_entry", status: "proposed", info: true } };

/** Nur beim Beleg: die erreichte Pipeline-Stufe als Detail am Chip. */
export const DocumentWithStage: Story = {
  args: { axis: "document_processing", status: "processing", stage: "preprocessed", info: false },
};

/** Unbekannter DB-Wert — die Registry fällt sichtbar zurück, statt zu lügen. */
export const UnknownValue: Story = {
  args: { axis: "accounting_case", status: "gibt_es_nicht", info: false },
};
/** `null` (Spalte noch nicht gesetzt). */
export const WithoutValue: Story = { args: { axis: "journal_entry", status: null, info: false } };

/**
 * `chevron` (0049): der Chip als Auslöser eines Menüs. Die Folgezustände
 * kommen aus `axisLegend(axis, only)` — die Registry beschreibt Zustände,
 * **keine Übergänge**, also nennt der Aufrufer die erlaubten. Das
 * `aria-haspopup` sitzt am Auslöser, nicht am Chip: `Popover` setzt es dort
 * selbst, und ein zweites am Chip wäre eine falsche Behauptung.
 */
export const StatusMenu: Story = {
  render: function Render() {
    const [status, setStatus] = useState("open");
    const [open, setOpen] = useState(false);
    // What is reachable from here — the caller's decision.
    const next = axisLegend("accounting_case", [
      "needs_clarification",
      "waiting_for_documents",
      "closed_accepted",
      "closed_rejected",
    ]);
    return (
      <div style={{ display: "grid", gap: 16, justifyItems: "start" }}>
        <Popover
          open={open}
          onOpenChange={setOpen}
          trigger={
            <button type="button" className="v2btn v2btn--tertiary v2btn--sm">
              <StatusBadge axis="accounting_case" status={status} info={false} chevron />
            </button>
          }
        >
          <div style={{ display: "grid", gap: 2, minWidth: 260 }}>
            {next.map((it) => (
              <button
                key={it.value}
                type="button"
                className="v2menu__item"
                onClick={() => {
                  setStatus(it.value);
                  setOpen(false);
                }}
              >
                <StatusBadge axis="accounting_case" status={it.value} info={false} />
              </button>
            ))}
          </div>
        </Popover>
        <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", margin: 0 }}>
          Gewählt: <code>{status}</code>
        </p>
      </div>
    );
  },
};
