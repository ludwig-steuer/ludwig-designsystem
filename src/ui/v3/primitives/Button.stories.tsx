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

/** Vier Rollen. `danger` nur, wo etwas verloren geht — Storno, Löschen. */
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

/** `md` (40 px) trägt Header-Karte und Aktionsleiste, `sm` (32 px) die Zeile,
 *  `xs` (26 px) dichte Zellen und Editoren. */
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

/** Die Taste steht am Knopf, nicht nur im Legende-Overlay (V14). */
export const WithKey: Story = {
  render: () => (
    <Cluster>
      <Button variant="primary" hotkey="A">Freigeben</Button>
      <Button variant="secondary" hotkey="R">Ablehnen</Button>
      <Button variant="tertiary" hotkey="F">Frage stellen</Button>
    </Cluster>
  ),
};

/** Gesperrt heißt gesperrt — nicht unsichtbar. Der Grund steht daneben. */
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

/** Als Link gerendert — gleiche Optik, echtes Navigationsziel. */
export const AsLink: Story = {
  render: () => (
    <Cluster>
      <Button variant="primary" href="#">Weiter zu Schritt 4</Button>
      <Button variant="tertiary" href="#">Protokoll herunterladen</Button>
    </Cluster>
  ),
};

/** Icon rechts: der Weg nach vorn, der Chevron am Aufklapper — und einmal beides. */
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

/** Läuft gerade: gesperrt, Spinner — und immer ein Wort daneben (V7). */
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

/** Vollbreit statt größer — so löst Ludwig den Haupt-Knopf einer Anmeldung. */
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
 * Welche Größe in die Zeile gehört. `xs` und `sm` fügen sich ein — die Zeile
 * bleibt so hoch wie die ohne Knopf. `md` drückt sie auf und gehört deshalb in
 * Kopf-Karte und Aktionsleiste, nicht in die Liste (V1).
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
