import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Check, RotateCcw } from "lucide-react";
import { useState } from "react";
import { ActionBar } from "./ActionBar";
import { ActionButton } from "./ActionButton";
import { AmountCell } from "./Cells";
import { Card, CardHead, HeadRow, Row, Table } from "./Table";

const meta: Meta<typeof ActionButton> = {
  title: "v3/Primitives/Aktion/ActionButton",
  component: ActionButton,
};
export default meta;
type Story = StoryObj<typeof ActionButton>;

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Rundlauf: klicken, warten, das Ergebnis steht daneben. Kein Erfolgstext. */
export const Filled: Story = {
  render: function Render() {
    const [done, setDone] = useState(0);
    return (
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <ActionButton
          variant="primary"
          action={async () => {
            await wait(700);
            setDone((n) => n + 1);
          }}
        >
          Stapel abnehmen
        </ActionButton>
        <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
          {done === 0 ? "noch nicht abgenommen" : `${done}× abgenommen`}
        </span>
      </div>
    );
  },
};

/** Während der Ausführung gesperrt, mit Wort statt nur Spinner (V7). */
export const Pending: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
      <ActionButton
        variant="primary"
        pendingLabel="Nehme ab …"
        action={async () => {
          await wait(4000);
        }}
      >
        Stapel abnehmen
      </ActionButton>
      <ActionButton
        action={async () => {
          await wait(4000);
        }}
      >
        Ohne pendingLabel
      </ActionButton>
    </div>
  ),
};

/** Fehler stehen neben dem Knopf — nicht im Dialog, nicht nur rot. */
export const Failed: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      <ActionButton
        variant="primary"
        action={async () => {
          await wait(500);
          return { error: "DATEV hat den Stapel abgelehnt: Belegfeld 1 fehlt in 3 Sätzen." };
        }}
      >
        An DATEV senden
      </ActionButton>
      <ActionButton
        action={async () => {
          await wait(500);
          throw new Error("Die Verbindung zur Bridge ist abgebrochen.");
        }}
      >
        Wirft statt zu melden
      </ActionButton>
    </div>
  ),
};

/** Der Primärknopf im Dialog nennt die Folge, nie „OK" (T3). */
export const WithConfirm: Story = {
  render: () => (
    <ActionButton
      variant="primary"
      confirm={{
        title: "Stapel abnehmen?",
        body: "142 Sätze werden freigegeben und für den DATEV-Export vorgemerkt. Das lässt sich einzeln zurücknehmen.",
        confirmLabel: "Stapel abnehmen",
      }}
      action={async () => {
        await wait(600);
      }}
    >
      Stapel abnehmen
    </ActionButton>
  ),
};

/** Rot nur für die Folge, nicht für den Weg dorthin. */
export const WithConfirmDanger: Story = {
  render: () => (
    <ActionButton
      variant="danger"
      icon={<RotateCcw size={14} strokeWidth={1.5} />}
      confirm={{
        title: "Buchung stornieren?",
        body: "Die Buchung wird mit einem Storno-Satz aufgehoben. Der ursprüngliche Satz bleibt sichtbar.",
        confirmLabel: "Buchung stornieren",
        tone: "danger",
      }}
      action={async () => {
        await wait(600);
      }}
    >
      Stornieren
    </ActionButton>
  ),
};

/** Alles, was `Button` kann, kann er auch — Variante, Größe, Icon, Taste. */
export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
      <ActionButton variant="primary" action={async () => wait(400)}>
        Freigeben
      </ActionButton>
      <ActionButton action={async () => wait(400)}>Zurück an Agenten</ActionButton>
      <ActionButton variant="tertiary" size="sm" action={async () => wait(400)}>
        Kontenblatt öffnen
      </ActionButton>
      <ActionButton variant="danger" size="sm" action={async () => wait(400)}>
        Stornieren
      </ActionButton>
      <ActionButton
        variant="primary"
        size="sm"
        hotkey="A"
        icon={<Check size={14} strokeWidth={1.5} />}
        action={async () => wait(400)}
      >
        Abnehmen
      </ActionButton>
      <ActionButton disabled action={async () => wait(400)}>
        Gesperrt
      </ActionButton>
    </div>
  ),
};

/** In der Aktionsleiste unter der Karte: genau ein primärer Weg. */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <Card>
        <CardHead title="Stapel 2026-08 · Bürobedarf" sub="142 Sätze, 38 ungeprüft" />
        <Table cols="120px 1fr 140px">
          <HeadRow>
            <span>Beleg</span>
            <span>Kreditor</span>
            <span className="v2num">Betrag</span>
          </HeadRow>
          <Row>
            <span>RE-4471</span>
            <span>Bürobedarf Meier GmbH</span>
            <AmountCell value={1249.9} />
          </Row>
        </Table>
      </Card>
      <ActionBar
        secondary={
          <ActionButton size="sm" action={async () => wait(500)}>
            Zurück an Agenten
          </ActionButton>
        }
        primary={
          <ActionButton
            size="sm"
            variant="primary"
            hotkey="A"
            pendingLabel="Nehme ab …"
            confirm={{
              title: "Stapel abnehmen?",
              body: "142 Sätze werden freigegeben.",
              confirmLabel: "Stapel abnehmen",
            }}
            action={async () => wait(800)}
          >
            Stapel abnehmen
          </ActionButton>
        }
      />
    </div>
  ),
};
