import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AXIS_LABEL } from "@/ui/legacy/status/entity-icons";
import { StatusBadge } from "./StatusBadge";
import { STATUS_REGISTRY, type StatusAxis } from "@/ui/legacy/status/status-registry";

const meta: Meta<typeof StatusBadge> = {
  title: "v3/Patterns/Prüfen/StatusBadge",
  component: StatusBadge,
  args: { axis: "sachverhalt", status: "open" },
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
 * **Alle** Achsen withItems **allen** Ausprägungen — direkt aus der
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
      <AxisBlock axis="beleg" />
      <AxisBlock axis="sachverhalt" />
      <AxisBlock axis="buchung" />
    </div>
  ),
};

/** Einzelner Chip withItems (i) — öffnet die Legende der ganzen Achse. */
export const WithInfoDialog: Story = { args: { axis: "buchung", status: "proposed", info: true } };

/** Nur beim Beleg: die erreichte Pipeline-Stufe als Detail am Chip. */
export const DocumentWithStage: Story = {
  args: { axis: "beleg", status: "processing", stage: "preprocessed", info: false },
};

/** Unbekannter DB-Wert — die Registry fällt sichtbar zurück, statt zu lügen. */
export const UnknownValue: Story = {
  args: { axis: "sachverhalt", status: "gibt_es_nicht", info: false },
};
/** `null` (Spalte noch nicht gesetzt). */
export const WithoutValue: Story = { args: { axis: "buchung", status: null, info: false } };
