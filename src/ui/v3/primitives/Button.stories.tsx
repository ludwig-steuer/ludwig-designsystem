import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./Button";

const meta: Meta<typeof Button> = { title: "v3/Primitives/Aktion/Button", component: Button };
export default meta;
type Story = StoryObj<typeof Button>;

const Reihe = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>{children}</div>
);

/** Vier Rollen. `danger` nur, wo etwas verloren geht — Storno, Löschen. */
export const Varianten: Story = {
  render: () => (
    <Reihe>
      <Button variant="primary">Freigeben</Button>
      <Button variant="secondary">Zurück an Agenten</Button>
      <Button variant="tertiary">Kontenblatt öffnen</Button>
      <Button variant="danger">Stornieren</Button>
    </Reihe>
  ),
};

/** `md` (40 px) trägt Kopf-Karte und Aktionsleiste, `sm` (32 px) die Zeile. */
export const Groessen: Story = {
  render: () => (
    <Reihe>
      <Button variant="primary" size="md">Zur Abnahme</Button>
      <Button variant="primary" size="sm">Zur Abnahme</Button>
      <Button variant="secondary" size="md">Abbrechen</Button>
      <Button variant="secondary" size="sm">Abbrechen</Button>
    </Reihe>
  ),
};

/** Die Taste steht am Knopf, nicht nur im Legende-Overlay (V14). */
export const MitTaste: Story = {
  render: () => (
    <Reihe>
      <Button variant="primary" hotkey="A">Freigeben</Button>
      <Button variant="secondary" hotkey="R">Ablehnen</Button>
      <Button variant="tertiary" hotkey="F">Frage stellen</Button>
    </Reihe>
  ),
};

/** Gesperrt heißt gesperrt — nicht unsichtbar. Der Grund steht daneben. */
export const Gesperrt: Story = {
  render: () => (
    <Reihe>
      <Button variant="primary" disabled>Freigeben</Button>
      <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
        Erst wenn Schritt 8 abgehakt ist.
      </span>
    </Reihe>
  ),
};

/** Als Link gerendert — gleiche Optik, echtes Navigationsziel. */
export const AlsLink: Story = {
  render: () => (
    <Reihe>
      <Button variant="primary" href="#">Weiter zu Schritt 4</Button>
      <Button variant="tertiary" href="#">Protokoll herunterladen</Button>
    </Reihe>
  ),
};
