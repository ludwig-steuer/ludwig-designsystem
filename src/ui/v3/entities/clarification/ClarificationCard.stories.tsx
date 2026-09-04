import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Card, CardHead } from "../../primitives/Table";
import { ClarificationCard, type ClarificationDetailVM } from "./ClarificationCard";
import type { ClarificationVM } from "./Clarification";

const meta: Meta<typeof ClarificationCard> = {
  title: "v3/Entitäten/Klärung/ClarificationCard",
  component: ClarificationCard,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof ClarificationCard>;

const BASE: ClarificationVM = {
  id: "c1",
  title: "Bewirtung oder Reisekosten? Beleg nennt beides",
  state: "open",
  severity: "required",
  type: "question",
  audience: "accounting",
  raisedAt: "2026-08-26T09:12:00+02:00",
};

const AGENT_DETAIL: ClarificationDetailVM = {
  question: "Soll der Beleg als Bewirtung (4650) oder als Reisekosten (4670) gebucht werden?",
  context:
    "Der Beleg der Musterfirma GmbH nennt vier Personen und eine Übernachtung. Bewirtung " +
    "verlangt die Teilnehmerangabe, Reisekosten nicht — die Zuordnung ändert den Vorsteuerabzug.",
  text:
    "Der Beleg trägt sowohl Speisen (68,40 €) als auch eine Übernachtung (172,00 €). " +
    "Bei gemischten Belegen bucht Ludwig nach dem überwiegenden Anteil, sofern die " +
    "Kanzlei nichts anderes festlegt.",
  recommendation: "Reisekosten (4670)",
  facts: [
    { label: "Betrag", value: "240,40 €" },
    { label: "Belegdatum", value: "21.08.2026" },
    { label: "Gegenpart", value: "Musterfirma GmbH" },
    { label: "Teilnehmer laut Beleg", value: "4" },
  ],
  sources: [
    { kind: "source_doc", label: "Beleg RE-2026-4471", href: "#" },
    { kind: "ledger_account", label: "4670 Reisekosten Arbeitnehmer", href: "#" },
  ],
  questionTypeLabel: "Bewirtung oder Reisekosten",
  originLabel: "Buchungsvorschlag",
  answerKind: "single_choice",
  answerOptions: ["Bewirtung (4650)", "Reisekosten (4670)"],
  allowFreeText: true,
};

export const Gefuellt: Story = {
  render: () => (
    <Card>
      <CardHead title="Rückfrage" sub="gelesen, nicht beantwortet" />
      <div style={{ padding: "var(--space-4)" }}>
        <ClarificationCard clarification={{ ...BASE, ...AGENT_DETAIL }} />
      </div>
    </Card>
  ),
};

/** All three answer shapes side by side, each with a working round trip. */
export const Antworten: Story = {
  render: function Answering() {
    const [log, setLog] = useState<string[]>([]);
    const answer = async (what: string) =>
      setLog((prev) => [...prev, `${new Date().toLocaleTimeString("de-DE")} · ${what}`]);

    return (
      <div style={{ display: "grid", gap: "var(--space-6)" }}>
        <Card>
          <CardHead title="Auswahl" sub="single_choice mit Ergänzung" />
          <div style={{ padding: "var(--space-4)" }}>
            <ClarificationCard
              mode="answer"
              clarification={{ ...BASE, ...AGENT_DETAIL }}
              onAnswer={(a) => answer(`Auswahl: ${a.optionId ?? "—"}${a.text ? ` (${a.text})` : ""}`)}
              onResolve={(reason) => answer(`Aufgelöst: ${reason}`)}
            />
          </div>
        </Card>

        <Card>
          <CardHead title="Ja/Nein" sub="yes_no als zwei Optionen" />
          <div style={{ padding: "var(--space-4)" }}>
            <ClarificationCard
              mode="answer"
              clarification={{
                ...BASE,
                id: "c2",
                title: "Ist die Rechnung bereits bezahlt?",
                severity: "optional",
                question: null,
                context: null,
                text: "Auf dem Konto ist kein Abgang zu finden.",
                answerKind: "yes_no",
                answerOptions: ["Ja", "Nein"],
                questionTypeLabel: null,
                originLabel: "DATEV-Abgleich",
              }}
              onAnswer={(a) => answer(`Ja/Nein: ${a.optionId ?? "—"}`)}
            />
          </div>
        </Card>

        <Card>
          <CardHead title="Freitext" sub="free_text ohne Optionen" />
          <div style={{ padding: "var(--space-4)" }}>
            <ClarificationCard
              mode="answer"
              clarification={{
                ...BASE,
                id: "c3",
                title: "Wie soll der Zuschuss behandelt werden?",
                question: null,
                context: null,
                text: "Der Betrag von 1.800,00 € lässt sich keiner Rechnung zuordnen.",
                answerKind: "free_text",
                questionTypeLabel: null,
                originLabel: "Buchungsvorschlag",
              }}
              onAnswer={(a) => answer(`Freitext: ${a.text ?? "—"}`)}
            />
          </div>
        </Card>

        <Card>
          <CardHead title="Altlast" sub="document_upload — kein Upload mehr" />
          <div style={{ padding: "var(--space-4)" }}>
            <ClarificationCard
              mode="answer"
              clarification={{
                ...BASE,
                id: "c4",
                title: "Rechnung von o2 über 23,80 € fehlt",
                question: null,
                context: null,
                text: "Zu der Abbuchung liegt kein Beleg vor.",
                answerKind: "document_upload",
                questionTypeLabel: "Beleg fehlt",
                originLabel: "Buchungsvorschlag",
              }}
              onAnswer={() => answer("darf nicht passieren")}
            />
          </div>
        </Card>

        <Card>
          <CardHead title="Rundlauf" sub="was die Karte gemeldet hat" />
          <div style={{ padding: "var(--space-4)" }}>
            {log.length === 0 ? (
              <span className="v2muted">Noch nichts gesendet.</span>
            ) : (
              <ul style={{ margin: 0, paddingLeft: "var(--space-4)" }}>
                {log.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>
    );
  },
};

export const MitEmpfehlung: Story = {
  render: () => (
    <Card>
      <CardHead title="Empfehlung" sub="wird zur Vorauswahl und bleibt lesbar" />
      <div style={{ padding: "var(--space-4)" }}>
        <ClarificationCard
          mode="answer"
          clarification={{ ...BASE, ...AGENT_DETAIL }}
          onAnswer={async () => {}}
        />
      </div>
    </Card>
  ),
};

export const Verlauf: Story = {
  render: () => (
    <Card>
      <CardHead title="Verlauf" sub="gestellt · beantwortet · aufgelöst, je mit Person und Datum" />
      <div style={{ padding: "var(--space-4)" }}>
        <ClarificationCard
          clarification={{
            ...BASE,
            ...AGENT_DETAIL,
            state: "answered",
            answeredAt: "2026-08-26T15:04:00+02:00",
            history: [
              { kind: "raised", at: "2026-08-26T09:12:00+02:00", by: null },
              {
                kind: "answered",
                at: "2026-08-26T15:04:00+02:00",
                by: "S. Vogt",
                text: "Reisekosten (4670) — die Übernachtung überwiegt.",
              },
              {
                kind: "resolved",
                at: "2026-08-27T08:30:00+02:00",
                by: "S. Vogt",
                text: "Rest telefonisch mit dem Mandanten geklärt.",
              },
            ],
          }}
        />
      </div>
    </Card>
  ),
};

/** A question the firm raised itself: text only, no facts, no sources. */
export const VonHand: Story = {
  render: () => (
    <Card>
      <CardHead title="Von Hand gestellt" sub="Herkunft Kanzlei — keine leeren Blöcke" />
      <div style={{ padding: "var(--space-4)" }}>
        <ClarificationCard
          mode="answer"
          clarification={{
            ...BASE,
            id: "c5",
            title: "Gehört der Laptop ins Anlagevermögen?",
            audience: "client",
            text: "Bitte sagen Sie uns, ob das Gerät privat mitgenutzt wird.",
            answerKind: "free_text",
            originLabel: "Kanzlei",
          }}
          onAnswer={async () => {}}
        />
      </div>
    </Card>
  ),
};

export const ImPortal: Story = {
  render: () => (
    <Card>
      <CardHead title="Im Portal" sub="client_text, ohne Schwere und Herkunft" />
      <div style={{ padding: "var(--space-4)" }}>
        <ClarificationCard
          mode="answer"
          clarification={{
            ...BASE,
            id: "c6",
            title: "Wurde das Fahrrad weiterverkauft?",
            audience: "client",
            severity: "optional",
            text:
              "Wir haben eine Rechnung über ein Fahrrad gefunden. Damit wir richtig buchen: " +
              "Haben Sie es weiterverkauft oder nutzen Sie es selbst?",
            answerKind: "single_choice",
            answerOptions: ["Wird weiterverkauft", "Eigene Nutzung"],
          }}
          onAnswer={async () => {}}
        />
      </div>
    </Card>
  ),
};

export const Laedt: Story = {
  render: () => (
    <Card>
      <CardHead title="Sendet" sub="pending am Knopf" />
      <div style={{ padding: "var(--space-4)" }}>
        <ClarificationCard
          mode="answer"
          clarification={{ ...BASE, ...AGENT_DETAIL }}
          onAnswer={async () => {}}
          pending
        />
      </div>
    </Card>
  ),
};

export const Fehler: Story = {
  render: () => (
    <Card>
      <CardHead title="Fehlgeschlagen" sub="Fehler am Knopf, Eingabe bleibt" />
      <div style={{ padding: "var(--space-4)" }}>
        <ClarificationCard
          mode="answer"
          clarification={{ ...BASE, ...AGENT_DETAIL }}
          onAnswer={async () => {}}
          error="Die Frage ist bereits beantwortet."
        />
      </div>
    </Card>
  ),
};
