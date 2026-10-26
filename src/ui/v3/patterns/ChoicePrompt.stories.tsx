import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { AmountCell } from "../primitives/Cells";
import { FieldList } from "../primitives/FieldList";
import { Card, CardHead } from "../primitives/Table";
import { Callout } from "../primitives/Callout";
import { TextButton } from "../primitives/TextButton";
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
 * Three answers, one already picked: `defaultOptionId` carries Ludwig's
 * suggestion in, so the most common answer is one click less.
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
        <div style={{ fontSize: "var(--fs-ui)", color: "var(--color-text-muted)" }}>
          Gesendet: {last ? `${last.optionId ?? "—"} · ${last.text ?? "ohne Text"}` : "nichts"}
        </div>
      </div>
    );
  },
};

/**
 * Reine Freitext-Frage — 60 % des Bestands. Keine `RadioGroup`, keine zweite
 * Beschriftung „Antwort", und der Grund neben dem gesperrten Knopf schickt
 * niemanden nach einer Auswahl suchen, die es nicht gibt.
 */
export const FreeTextOnly: Story = {
  render: function Render() {
    const [last, setLast] = useState<ChoiceAnswer | null>(null);
    return (
      <div style={{ maxWidth: 480, display: "grid", gap: "var(--space-4)" }}>
        <ChoicePrompt
          question="Wofür war die Bewirtung am 26.08.?"
          context="RE-4483 · 128,40 € · Restaurant Adler"
          options={[]}
          freeText={{ label: "Antwort", placeholder: "Anlass und Teilnehmer", required: true }}
          onSubmit={async (a) => {
            await wait(300);
            setLast(a);
          }}
        />
        <div style={{ fontSize: "var(--fs-ui)", color: "var(--color-text-muted)" }}>
          Gesendet: {last ? (last.text ?? "ohne Text") : "nichts"}
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

/** A clarification's answer (0214): „Antwortoptionen" as whole rows, the question above it in the card (`hideQuestion`), the free text beside the options. The recommended option is marked and preselected without `defaultOptionId`. */
export const OptionRows: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <ChoicePrompt
        question="Soll der Beleg als Bewirtung oder als Reisekosten gebucht werden?"
        hideQuestion
        optionsLabel="Antwortoptionen"
        optionStyle="rows"
        options={[
          { id: "a", label: "Bewirtung (4650)" },
          { id: "b", label: "Reisekosten (4670)", recommended: true },
        ]}
        freeText={{ label: "Oder selbst formulieren" }}
        submitLabel="Antwort speichern"
        onSubmit={async () => wait(600)}
      />
    </div>
  ),
};

/** The free text behind a text button, the other ways in the same row (0222). */
export const OptionRowsWithLinks: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <ChoicePrompt
        question="Welche Gegenpartei gilt für diesen Sachverhalt?"
        hideQuestion
        optionsLabel="Antwortoptionen"
        optionStyle="rows"
        options={[
          { id: "keep", label: "Zuordnung des Sachverhalts behalten", recommended: true },
          { id: "switch", label: "Auf „Brightline Technology GmbH“ ändern" },
        ]}
        optionsNote={
          <Callout tone="soft">
            <strong>Warum empfohlen:</strong> Der Beleg nennt Serverhaus Nord als Leistenden, Brightline Technology nur als Rechnungsadresse.
          </Callout>
        }
        freeText={{ label: "Eigene Antwort", toggle: "Eigene Antwort schreiben" }}
        links={
          <>
            <TextButton onClick={() => {}}>Beim Mandanten klären</TextButton>
            <TextButton onClick={() => {}}>Anderweitig geklärt</TextButton>
          </>
        }
        submitLabel="Speichern und weiter"
        onSubmit={async () => wait(400)}
      />
    </div>
  ),
};

/** An option that needs a sentence (0223): its field appears when it is chosen; switching keeps the text. */
export const OptionNote: Story = {
  render: () => {
    const [last, setLast] = useState<ChoiceAnswer | null>(null);
    return (
      <div style={{ maxWidth: 640 }}>
        <ChoicePrompt
          question="Wohin gehört dieser Beleg?"
          hideQuestion
          optionsLabel="Entscheidung"
          optionStyle="rows"
          options={[
            {
              id: "process",
              label: "Mit Kommentar noch verarbeiten",
              hint: "Geht an Ludwig zurück, er bucht ihn im nächsten Durchgang.",
              note: { label: "Kommentar an Ludwig", placeholder: "Was soll mit dem Beleg passieren?", required: true },
            },
            { id: "archive", label: "Archivieren", hint: "Kein Buchungsbeleg; bleibt beim Mandanten abgelegt (z. B. Kontoauszug, Vertrag)." },
            {
              id: "client",
              label: "Beim Mandanten klären",
              hint: "Kommt mit Ihrer Notiz in die Liste für den Mandanten.",
              note: { label: "Notiz für den Mandanten", required: true },
            },
          ]}
          submitLabel="Entscheiden und weiter"
          onSubmit={async (a) => {
            await wait(400);
            setLast(a);
          }}
        />
        <p className="lw-ui-hint">{last ? `Entschieden: ${last.optionId} · ${last.text ?? "ohne Text"}` : "Noch nichts entschieden."}</p>
      </div>
    );
  },
};

