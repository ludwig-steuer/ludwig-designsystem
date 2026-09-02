import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "./Badge";

const meta = {
  title: "v3/Primitives/Fläche/Badge",
  component: Badge,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

const Reihe = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", flexWrap: "wrap" }}>
    {children}
  </div>
);

/** Die fünf Tonstufen. Die Farbe sagt Dringlichkeit, das Wort sagt was (V6, V7). */
export const Toene: Story = {
  args: { children: "Neutral" },
  render: () => (
    <Reihe>
      <Badge>Interner Beleg</Badge>
      <Badge tone="info">Eingangsrechnung</Badge>
      <Badge tone="success">Vollständig</Badge>
      <Badge tone="warning">Beleg fehlt</Badge>
      <Badge tone="danger">Abgelehnt</Badge>
    </Reihe>
  ),
};

/** Mit Punkt — wenn Zustände in einer langen Liste zählbar bleiben sollen. */
export const MitPunkt: Story = {
  args: { children: "Neutral" },
  render: () => (
    <Reihe>
      <Badge dot>Kein Befund</Badge>
      <Badge dot tone="info">Prüfung läuft</Badge>
      <Badge dot tone="success">Freigegeben</Badge>
      <Badge dot tone="warning">Rückfrage offen</Badge>
      <Badge dot tone="danger">Fehlgeschlagen</Badge>
    </Reihe>
  ),
};

/** Wofür sie NICHT da ist: ein Zustand aus einer Achse gehört an StatusBadge. */
export const NebenDerZeile: Story = {
  args: { children: "Neutral" },
  render: () => (
    <Reihe>
      <span style={{ fontSize: "var(--fs-body-sm)" }}>RE-4471 · Bürobedarf Meier GmbH</span>
      <Badge tone="info">Kreditor</Badge>
      <Badge>3 Anlagen</Badge>
    </Reihe>
  ),
};

/** Langer Text bricht nicht um — die Plakette bleibt eine Zeile. */
export const LangerText: Story = {
  args: { children: "Neutral" },
  render: () => (
    <div style={{ maxWidth: 240 }}>
      <Badge tone="warning">Auszahlung Zahlungsdienstleister</Badge>
    </div>
  ),
};
