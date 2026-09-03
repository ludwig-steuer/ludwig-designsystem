import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./Button";
import { AmountCell } from "./Cells";
import { PageHeader } from "./PageHeader";
import { Card, CardHead, HeadRow, Row, Table } from "./Table";
import { ToastHost, useToast } from "./Toast";

const meta: Meta<typeof ToastHost> = { title: "v3/Primitives/Fläche/Toast", component: ToastHost };
export default meta;
type Story = StoryObj<typeof ToastHost>;

/** Ein Toast, ausgelöst wie in der App: Handlung fertig, Meldung im Perfekt. */
export const Filled: Story = {
  render: () => (
    <ToastHost>
      <Trigger />
    </ToastHost>
  ),
};

function Trigger() {
  const { show } = useToast();
  return (
    <Button
      variant="primary"
      size="sm"
      onClick={() => show({ text: "Der Export wurde gestartet." })}
    >
      Export starten
    </Button>
  );
}

/** Drei Töne. `danger` nur für Fehler, nie für „Achtung, gleich passiert was". */
export const Variants: Story = {
  render: () => (
    <ToastHost>
      <VariantTriggers />
    </ToastHost>
  ),
};

function VariantTriggers() {
  const { show } = useToast();
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <Button size="sm" onClick={() => show({ text: "Der Stapel wurde abgenommen." })}>
        success
      </Button>
      <Button
        size="sm"
        onClick={() =>
          show({ text: "Drei Sätze wurden übersprungen — ihnen fehlt ein Beleg.", tone: "warning" })
        }
      >
        warning
      </Button>
      <Button
        size="sm"
        onClick={() => show({ text: "Die Verbindung zu DATEV ist abgebrochen.", tone: "danger" })}
      >
        danger
      </Button>
    </div>
  );
}

/** Mit Handlung bleibt er stehen — sonst wäre der Weg weiter nicht erreichbar. */
export const WithAction: Story = {
  render: () => (
    <ToastHost>
      <ActionTrigger />
    </ToastHost>
  ),
};

function ActionTrigger() {
  const { show } = useToast();
  return (
    <Button
      variant="primary"
      size="sm"
      onClick={() =>
        show({
          text: "Der Stapel 2026-08 wurde angelegt.",
          action: { label: "Stapel öffnen", onClick: () => {} },
        })
      }
    >
      Stapel anlegen
    </Button>
  );
}

/** Höchstens drei gleichzeitig — der vierte schiebt den ältesten hinaus. */
export const Stacked: Story = {
  render: () => (
    <ToastHost>
      <StackTrigger />
    </ToastHost>
  ),
};

function StackTrigger() {
  const { show } = useToast();
  return (
    <Button
      size="sm"
      onClick={() => {
        show({ text: "Beleg RE-4471 wurde zugeordnet." });
        show({ text: "Beleg RE-4472 wurde zugeordnet." });
        show({ text: "Beleg RE-4473 wurde zugeordnet." });
        show({ text: "Beleg RE-4474 wurde zugeordnet." });
      }}
    >
      Vier auf einmal auslösen
    </Button>
  );
}

/** Im Einsatz: über einer Seite mit Kopf und Karte, unten rechts. */
export const InUse: Story = {
  render: () => (
    <ToastHost>
      <div style={{ maxWidth: 720 }}>
        <PageHeader
          overline="Musterbau GmbH · Wirtschaftsjahr 2026"
          title="Stapel 2026-08 · Bürobedarf"
          description="142 Sätze, davon 38 ungeprüft."
          actions={<PageAction />}
        />
        <Card>
          <CardHead title="Ungeprüfte Sätze" sub="38 von 142" />
          <Table cols="120px 1fr 140px">
            <HeadRow>
              <th>Beleg</th>
              <th>Kreditor</th>
              <th style={{ textAlign: "right" }}>Betrag</th>
            </HeadRow>
            <Row>
              <td>RE-4471</td>
              <td>Bürobedarf Meier GmbH</td>
              <AmountCell value={1249.9} />
            </Row>
            <Row>
              <td>RE-4472</td>
              <td>Stadtwerke Musterstadt</td>
              <AmountCell value={412} />
            </Row>
          </Table>
        </Card>
      </div>
    </ToastHost>
  ),
};

function PageAction() {
  const { show } = useToast();
  return (
    <Button
      variant="primary"
      size="sm"
      onClick={() =>
        show({
          text: "Der Stapel wurde abgenommen.",
          action: { label: "Zum DATEV-Export", onClick: () => {} },
        })
      }
    >
      Stapel abnehmen
    </Button>
  );
}

/**
 * Ohne Handlung verschwindet ein Toast nach fünf Sekunden; **mit** Handlung
 * bleibt er, bis er geschlossen wird. Hier beides nebeneinander: der linke
 * geht von selbst, der rechte wartet.
 */
export const Persistent: Story = {
  render: () => (
    <ToastHost>
      <PersistentTriggers />
    </ToastHost>
  ),
};

function PersistentTriggers() {
  const { show } = useToast();
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <Button size="sm" onClick={() => show({ text: "Die Ansicht wurde aktualisiert." })}>
        Geht von selbst
      </Button>
      <Button
        size="sm"
        onClick={() =>
          show({
            text: "Der Export liegt bereit.",
            action: { label: "Datei herunterladen", onClick: () => {} },
          })
        }
      >
        Bleibt stehen
      </Button>
    </div>
  );
}
