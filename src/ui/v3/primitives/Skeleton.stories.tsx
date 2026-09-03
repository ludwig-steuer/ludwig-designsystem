import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Skeleton } from "./Skeleton";
import { Card, CardHead } from "./Table";

const meta: Meta<typeof Skeleton> = { title: "v3/Primitives/Fläche/Skeleton", component: Skeleton };
export default meta;
type Story = StoryObj<typeof Skeleton>;

/** Drei Zeilen, ungleich breit — gleich breite Balken lesen sich als Tabelle. */
export const Lines: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <Skeleton lines={4} label="Sachverhalt wird geladen …" />
    </div>
  ),
};

/** Was Platz hält: Textzeilen, eine Kartenfläche, ein Formularfeld. */
export const Variants: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-6)", maxWidth: 420 }}>
      <div>
        <Legend>lines</Legend>
        <Skeleton />
      </div>
      <div>
        <Legend>card</Legend>
        <Skeleton variant="card" />
      </div>
      <div>
        <Legend>field</Legend>
        <Skeleton variant="field" />
      </div>
    </div>
  ),
};

/** In der Karte: der Kopf steht schon, der Inhalt lädt noch — nichts springt. */
export const InCard: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-4)", maxWidth: 520 }}>
      <Card>
        <CardHead title="Offene Posten" />
        <div style={{ padding: "var(--space-5)" }}>
          <Skeleton lines={3} label="Offene Posten werden geladen …" />
        </div>
      </Card>
      <Card>
        <CardHead title="Kennzahlen" />
        <div style={{ padding: "var(--space-5)" }}>
          <Skeleton variant="card" />
        </div>
      </Card>
    </div>
  ),
};

function Legend({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 6 }}>{children}</div>
  );
}
