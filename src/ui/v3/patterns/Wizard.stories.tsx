import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Button } from "../primitives/Button";
import { FileDrop } from "../primitives/FileDrop";
import { Field, Input } from "../primitives/Form";
import { Card, CardHead, HeadRow, Row, Table } from "../primitives/Table";
import { Wizard, type WizardStep, type WizardStepState } from "./Wizard";

const meta: Meta<typeof Wizard> = { title: "v3/Patterns/Rahmen/Wizard", component: Wizard };
export default meta;
type Story = StoryObj<typeof Wizard>;

const THREE: WizardStep[] = [
  { label: "Datei wählen" },
  { label: "Vorschau prüfen" },
  { label: "Ergebnis" },
];

/**
 * Drei Schritte, der zweite ist dran: seine Nummer sitzt auf primary, sein
 * Wort trägt `aria-current="step"`. Ohne `footer` steht kein Fuß im DOM —
 * vergleiche `WithFooter`.
 */
export const Filled: Story = {
  render: () => (
    <Wizard steps={THREE} current={1} states={["done", "active", "pending"]}>
      <Field label="Trennzeichen" hint="Aus der ersten Zeile geraten." htmlFor="trennzeichen">
        <Input id="trennzeichen" defaultValue=";" />
      </Field>
    </Wizard>
  ),
};

/**
 * Alle vier Zustände in einer Leiste. Keiner steht auf Farbe allein (V7):
 * erledigt zeigt den Haken, gescheitert das Warnzeichen auf danger, dran die
 * Nummer auf primary, offen die Nummer gedämpft.
 */
export const States: Story = {
  render: () => (
    <Wizard
      steps={[
        { label: "Datei wählen" },
        { label: "Spalten zuordnen" },
        { label: "Vorschau prüfen" },
        { label: "Ergebnis" },
      ]}
      current={2}
      states={["done", "error", "active", "pending"]}
    >
      <p>
        Zwei von 340 Zeilen ohne Konto. Der Schritt „Spalten zuordnen" ist rot,
        bis beide zugeordnet sind.
      </p>
    </Wizard>
  ),
};

/**
 * Der Fuß: „Zurück" secondary, „Weiter" primary mit sichtbarer Taste (V14),
 * dazwischen der Fortschrittstext. Was im Fuß steht, entscheidet der Aufrufer
 * — die Hülle stellt nur den Platz.
 */
export const WithFooter: Story = {
  render: () => (
    <Wizard
      steps={[...THREE, { label: "Abschluss" }]}
      current={1}
      states={["done", "active", "pending", "pending"]}
      footer={
        <>
          <Button variant="secondary">Zurück</Button>
          <span style={{ flex: 1 }} />
          <span className="v2sub lw-numeric">Schritt 2 von 4</span>
          <Button variant="primary" hotkey="⏎">
            Weiter
          </Button>
        </>
      }
    >
      <Field label="Buchungskreis" htmlFor="buchungskreis">
        <Input id="buchungskreis" defaultValue="Musterfirma GmbH · 2026" />
      </Field>
    </Wizard>
  ),
};

/**
 * Rand: sieben Schritte mit langen Wörtern. Die Spalten bleiben gleich breit,
 * die Wörter brechen nicht um, sondern kürzen mit Ellipse.
 */
export const ManySteps: Story = {
  render: () => (
    <Wizard
      steps={[
        { label: "Datei wählen und Kodierung bestimmen" },
        { label: "Trennzeichen und Kopfzeile prüfen" },
        { label: "Spalten den Feldern zuordnen" },
        { label: "Gegenkonten auflösen" },
        { label: "Vorschau der ersten 50 Zeilen" },
        { label: "Buchungsstapel anlegen" },
        { label: "Ergebnis und Protokoll" },
      ]}
      current={3}
      states={["done", "done", "error", "active", "pending", "pending", "pending"]}
    >
      <p>Sieben Schritte sind viel. Ab hier gehört der Ablauf zerlegt.</p>
    </Wizard>
  ),
};

/* ── InUse: the CsvImportWizard flow, with working back/next ──────────────── */

function ImportRun() {
  const [step, setStep] = useState(0);
  const states: WizardStepState[] = THREE.map((_, i) =>
    i < step ? "done" : i === step ? "active" : "pending",
  );

  return (
    <Wizard
      steps={THREE}
      current={step}
      states={states}
      footer={
        <>
          <Button variant="secondary" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            Zurück
          </Button>
          <span style={{ flex: 1 }} />
          <span className="v2sub lw-numeric">
            Schritt {step + 1} von {THREE.length}
          </span>
          <Button
            variant="primary"
            hotkey="⏎"
            disabled={step === THREE.length - 1}
            onClick={() => setStep((s) => s + 1)}
          >
            Weiter
          </Button>
        </>
      }
    >
      {step === 0 ? (
        <FileDrop
          label="Kontoauszug als CSV"
          accept=".csv"
          multiple={false}
          hint="CSV aus dem Onlinebanking, bis 10 MB."
          onFiles={() => {}}
        />
      ) : null}
      {step === 1 ? (
        <Card>
          <CardHead title="Vorschau" sub="3 von 340 Zeilen" />
          <Table cols="110px 1fr 130px">
            <HeadRow>
              <span>Datum</span>
              <span>Verwendungszweck</span>
              <span className="v2num">Betrag</span>
            </HeadRow>
            <Row>
              <span>02.09.2026</span>
              <span>Miete September</span>
              <span className="v2num">−1.450,00 €</span>
            </Row>
            <Row>
              <span>03.09.2026</span>
              <span>Rechnung 2026-0412</span>
              <span className="v2num">−1.800,00 €</span>
            </Row>
            <Row>
              <span>04.09.2026</span>
              <span>Zahlungseingang Musterkunde</span>
              <span className="v2num">2.380,00 €</span>
            </Row>
          </Table>
        </Card>
      ) : null}
      {step === 2 ? <p>340 Zeilen übernommen, 2 ohne Gegenkonto.</p> : null}
    </Wizard>
  );
}

/**
 * Wie `CsvImportWizard` in der App: Datei wählen → Vorschau → Ergebnis, mit
 * `useState` im Story-Rahmen, damit Zurück und Weiter wirklich laufen. Der
 * Zustand liegt beim Aufrufer, nicht in der Hülle.
 */
export const InUse: Story = { render: () => <ImportRun /> };
