import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { AmountCell } from "../primitives/Cells";
import { FieldList } from "../primitives/FieldList";
import { Card, CardHead } from "../primitives/Table";
import { ChoicePrompt, type ChoiceAnswer } from "./ChoicePrompt";

const meta: Meta<typeof ChoicePrompt> = {
  title: "v3/Patterns/Prüfen/ChoicePrompt",
  component: ChoicePrompt,
};
export default meta;
type Story = StoryObj<typeof ChoicePrompt>;

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const OPTIONS = [
  { id: "bewirtung", label: "Bewirtung", hint: "70 % abziehbar, Bewirtungsbeleg nötig" },
  { id: "reise", label: "Reisekosten", hint: "voll abziehbar" },
  { id: "buero", label: "Bürobedarf", hint: "Sammelkonto 6815" },
];

/**
 * Drei Antworten, eine schon gewählt: `defaultOptionId` trägt den Vorschlag
 * des Agenten hinein, damit die häufigste Antwort ein Klick weniger ist.
 */
export const Filled: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <ChoicePrompt
        question="Wie ist die Rechnung vom Restaurant Adler einzuordnen?"
        context="RE-4483 · 128,40 € · 26.08.2026"
        options={OPTIONS}
        defaultOptionId="bewirtung"
        onSubmit={async () => wait(400)}
      />
    </div>
  ),
};

/** Nichts gewählt: der Knopf ist gesperrt — und daneben steht warum. */
export const Blocked: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <ChoicePrompt
        question="Wie ist die Rechnung vom Restaurant Adler einzuordnen?"
        options={OPTIONS}
        onSubmit={async () => wait(400)}
      />
    </div>
  ),
};

/** Mit Freitext: die Option ist die Antwort, der Text die Begründung. */
export const WithFreeText: Story = {
  render: function Render() {
    const [last, setLast] = useState<ChoiceAnswer | null>(null);
    return (
      <div style={{ maxWidth: 480, display: "grid", gap: "var(--space-4)" }}>
        <ChoicePrompt
          question="Wie ist die Rechnung vom Restaurant Adler einzuordnen?"
          context="RE-4483 · 128,40 € · 26.08.2026"
          options={[...OPTIONS, { id: "anderes", label: "Etwas anderes" }]}
          freeText={{ label: "Anmerkung", placeholder: "Was Ludwig wissen sollte" }}
          onSubmit={async (a) => {
            await wait(300);
            setLast(a);
          }}
        />
        <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
          Gesendet: {last ? `${last.optionId ?? "—"} · ${last.text ?? "ohne Text"}` : "nichts"}
        </div>
      </div>
    );
  },
};

/** Während des Sendens ist alles gesperrt, der Knopf trägt ein Wort. */
export const Pending: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <ChoicePrompt
        question="Wie ist die Rechnung vom Restaurant Adler einzuordnen?"
        options={OPTIONS}
        pending
        onSubmit={async () => wait(4000)}
      />
    </div>
  ),
};

/** Nach einem Fehler steht die Eingabe noch da. */
export const Error: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <ChoicePrompt
        question="Wie ist die Rechnung vom Restaurant Adler einzuordnen?"
        options={OPTIONS}
        freeText={{ label: "Anmerkung" }}
        error="Die Rückfrage konnte nicht gesendet werden — der Sachverhalt ist gesperrt."
        onSubmit={async () => wait(300)}
      />
    </div>
  ),
};

/** Im Einsatz: in der Karte des Sachverhalts, mit dem Kontext daneben. */
export const InCase: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <Card>
        <CardHead title="Sachverhalt 2026-0148" sub="Restaurant Adler · offen" />
        <div style={{ padding: "var(--space-5)", display: "grid", gap: "var(--space-5)" }}>
          <FieldList
            tone="bare"
            rows={[
              ["Beleg", "RE-4483"],
              ["Betrag", <AmountCell key="a" value={128.4} />],
              ["Belegdatum", "26.08.2026"],
            ]}
          />
          <ChoicePrompt
            question="Wie ist die Rechnung einzuordnen?"
            options={OPTIONS}
            freeText={{ label: "Anmerkung", placeholder: "Wer war dabei, welcher Anlass?" }}
            submitLabel="Antwort an Ludwig senden"
            onSubmit={async () => wait(400)}
          />
        </div>
      </Card>
    </div>
  ),
};
