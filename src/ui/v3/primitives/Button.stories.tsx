import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { Button } from "./Button";
import { Card, HeadRow, Row, Table } from "./Table";

const meta: Meta<typeof Button> = { title: "v3/Primitives/Aktion/Button", component: Button };
export default meta;
type Story = StoryObj<typeof Button>;

const Cluster = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>{children}</div>
);

/** Four roles. `danger` only where something is lost — reversal, deletion. */
export const Variants: Story = {
  render: () => (
    <Cluster>
      <Button variant="primary">Freigeben</Button>
      <Button variant="secondary">Zurück an Agenten</Button>
      <Button variant="tertiary">Kontenblatt öffnen</Button>
      <Button variant="danger">Stornieren</Button>
    </Cluster>
  ),
};

/** `md` (35 px) carries the head card and the action bar, `sm` (30 px) card
 *  actions, `xs` (25 px) dense cells and editors. In a table row the last two
 *  shrink to the height of the line — see `SizesInRow`. */
export const Sizes: Story = {
  render: () => (
    <Cluster>
      <Button variant="primary" size="md">Zur Abnahme</Button>
      <Button variant="primary" size="sm">Zur Abnahme</Button>
      <Button variant="primary" size="xs">Zur Abnahme</Button>
      <Button variant="secondary" size="md">Abbrechen</Button>
      <Button variant="secondary" size="sm">Abbrechen</Button>
    </Cluster>
  ),
};

/** The key stands on the button, not only in the legend overlay (V14). */
export const WithKey: Story = {
  render: () => (
    <Cluster>
      <Button variant="primary" hotkey="A">Freigeben</Button>
      <Button variant="secondary" hotkey="R">Ablehnen</Button>
      <Button variant="tertiary" hotkey="F">Frage stellen</Button>
    </Cluster>
  ),
};

/** Locked means locked — not invisible. The reason stands next to it. */
export const Disabled: Story = {
  render: () => (
    <Cluster>
      <Button variant="primary" disabled>Freigeben</Button>
      <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
        Erst wenn Schritt 8 abgehakt ist.
      </span>
    </Cluster>
  ),
};

/** Rendered as a link — same look, a real navigation target. */
export const AsLink: Story = {
  render: () => (
    <Cluster>
      <Button variant="primary" href="#">Weiter zu Schritt 4</Button>
      <Button variant="tertiary" href="#">Protokoll herunterladen</Button>
    </Cluster>
  ),
};

/** Icon on the right: the way forward, the chevron on a toggle — and once both. */
export const IconEnd: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", flexWrap: "wrap" }}>
      <Button variant="primary" iconEnd={<ArrowRight size={14} strokeWidth={1.5} />}>
        Weiter zu Schritt 5
      </Button>
      <Button iconEnd={<ChevronDown size={14} strokeWidth={1.5} />}>Zeitraum</Button>
      <Button
        icon={<Check size={14} strokeWidth={1.5} />}
        iconEnd={<ChevronDown size={14} strokeWidth={1.5} />}
      >
        Saldo stimmt
      </Button>
      <Button variant="tertiary" iconEnd={<ArrowRight size={14} strokeWidth={1.5} />} hotkey="W">
        Volles Konto öffnen
      </Button>
    </div>
  ),
};

/** Running: locked, spinner — and always a word next to it (V7). */
export const Loading: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", flexWrap: "wrap" }}>
      <Button variant="primary" loading loadingLabel="Speichere …">
        Buchung speichern
      </Button>
      <Button loading>Stapel prüfen</Button>
      <Button variant="primary">Buchung speichern</Button>
    </div>
  ),
};

/** Full width instead of bigger — how Ludwig solves the main button of a sign-in. */
export const FullWidth: Story = {
  render: () => (
    <div style={{ maxWidth: 320, display: "grid", gap: "var(--space-2)" }}>
      <Button variant="primary" fullWidth>
        Anmelden
      </Button>
      <Button fullWidth>Zugang anfordern</Button>
    </div>
  ),
};

/**
 * Which size belongs in a row. `xs` and `sm` fit in: measured at 1440 × 900
 * all three rows below stand 47.25 px high — the one with the button and the
 * one without. `md` pushes the row to 60.8 px and therefore belongs in the
 * head card and the action bar, not in a list (V1).
 */
export const SizesInRow: Story = {
  render: () => (
    <Card>
      <Table cols="120px 1fr 220px">
        <HeadRow>
          <th>Beleg</th>
          <th>Kreditor</th>
          <th>Aktion</th>
        </HeadRow>
        <Row>
          <td>RE-4471</td>
          <td>Bürobedarf Meier GmbH</td>
          <td>
            <Button size="xs">Prüfen</Button>
          </td>
        </Row>
        <Row>
          <td>RE-4472</td>
          <td>Stadtwerke Musterstadt</td>
          <td>
            <Button size="sm">Prüfen</Button>
          </td>
        </Row>
        <Row>
          <td>RE-4473</td>
          <td>Ohne Knopf — die Referenzhöhe</td>
          <td />
        </Row>
        <Row>
          <td>RE-4474</td>
          <td>Deutsche Telekom AG — `md` drückt auf, gehört nicht hierher</td>
          <td>
            <Button size="md">Prüfen</Button>
          </td>
        </Row>
      </Table>
    </Card>
  ),
};
