import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Check, RotateCcw } from "lucide-react";
import { useState } from "react";
import { ActionBar } from "./ActionBar";
import { ActionButton } from "./ActionButton";
import { AmountCell } from "./Cells";
import { Field, Input, Select } from "./Form";
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

/** Fehler stehen neben dem Knopf, nicht nur rot. Mit `ask` stehen sie im Dialog — `AskFails`. */
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

/**
 * **Erst fragen, dann tun** (0121): der Dialog erfragt einen Wert, und die
 * Handlung bekommt ihn. Was im Dialog steht, gehört dem Aufrufer — hier ein
 * Auswahlfeld, in der Bankseite der `CasePicker`. Der Knopf bleibt aus,
 * solange nichts gewählt ist, und der zuletzt gewählte Wert steht danach im
 * Ergebnis.
 */
export const AskForTarget: Story = {
  render: function Render() {
    const [done, setDone] = useState<string | null>(null);
    return (
      <div style={{ display: "grid", gap: "var(--space-3)", justifyItems: "start" }}>
        <ActionButton<string>
          variant="primary"
          ask={{
            title: "Umsatz einem Sachverhalt zuordnen",
            confirmLabel: "Zuordnen",
            initial: "",
            valid: (v) => v !== "",
            render: ({ value, set }) => (
              <Field label="Sachverhalt" htmlFor="ask-case">
                <Select id="ask-case" value={value} onChange={(e) => set(e.target.value)}>
                  <option value="">Bitte wählen</option>
                  <option value="2026-0412">2026-0412 · Wartung der Klimaanlage</option>
                  <option value="2026-0413">2026-0413 · Beratung Q2 2026</option>
                </Select>
              </Field>
            ),
          }}
          action={async (caseNumber) => {
            await wait(400);
            setDone(caseNumber);
          }}
        >
          Zuordnen
        </ActionButton>
        {done ? <span className="v2muted">Zugeordnet an {done}.</span> : null}
      </div>
    );
  },
};

/**
 * `valid` sperrt: der Dialog steht offen, der Knopf ist aus, und es gibt
 * keinen Weg zur Handlung — auch nicht über Enter. Hier ist der Anfangswert
 * schon ungültig, damit der Fall ohne einen einzigen Klick sichtbar ist.
 */
export const AskInvalid: Story = {
  render: () => (
    <ActionButton<string>
      variant="primary"
      ask={{
        title: "Neuen Sachverhalt anlegen",
        confirmLabel: "Anlegen",
        initial: "",
        valid: (v) => v.trim().length >= 3,
        render: ({ value, set }) => (
          <Field label="Titel" htmlFor="ask-title" hint="Mindestens drei Zeichen.">
            <Input id="ask-title" value={value} onChange={(e) => set(e.target.value)} />
          </Field>
        ),
      }}
      action={async () => {
        await wait(400);
      }}
    >
      Sachverhalt anlegen
    </ActionButton>
  ),
};

/**
 * **Fehler im Dialog** (0159). Die Nummer 70001 ist vergeben — das weiß erst
 * der Server. Der Dialog bleibt offen, der Satz steht unter dem Feld, die
 * Eingabe bleibt; wer weitertippt, löscht den Satz. Jede andere Nummer geht
 * durch und schließt den Dialog.
 */
export const AskFails: Story = {
  render: function Render() {
    const [done, setDone] = useState<string | null>(null);
    return (
      <div style={{ display: "grid", gap: "var(--space-3)", justifyItems: "start" }}>
        <ActionButton<string>
          variant="primary"
          pendingLabel="Wird angelegt …"
          ask={{
            title: "Kreditor annehmen",
            confirmLabel: "Konto anlegen",
            initial: "70001",
            valid: (v) => /^\d{4,20}$/.test(v),
            render: ({ value, set }) => (
              <Field label="DATEV-Kontonummer" htmlFor="ask-number" hint="4 bis 20 Ziffern.">
                <Input
                  id="ask-number"
                  inputMode="numeric"
                  value={value}
                  onChange={(e) => set(e.target.value.trim())}
                />
              </Field>
            ),
          }}
          action={async (number) => {
            await wait(500);
            if (number === "70001") return { error: "Die Nummer 70001 ist inzwischen vergeben." };
            setDone(number);
          }}
        >
          Annehmen
        </ActionButton>
        {done ? <span className="v2muted">Konto {done} angelegt.</span> : null}
      </div>
    );
  },
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
