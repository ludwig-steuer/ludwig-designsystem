import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Card, CardHead } from "../primitives/Table";
import { ProcessStepper } from "./Process";
import { STATE_MACHINES } from "@/ludwig/ui/status/status-registry";
import { StateMachine } from "./StateMachine";

const meta: Meta<typeof StateMachine> = {
  title: "v3/Patterns/Prozess/StateMachine",
  component: StateMachine,
};
export default meta;
type Story = StoryObj<typeof StateMachine>;

/*
  **Nothing by hand any more.** Since the mirror run of 2026-09-07
  `STATE_MACHINES` carries twelve machines with English `trigger` and German
  `label` — these two included. A copy here would be a hand-written list next
  to a maintained one again.
*/
const CYCLE = STATE_MACHINES.export_batch!.transitions;
const INBOX = STATE_MACHINES.document_processing!.transitions;

/* The **column order** stays the story's: it is a statement about the picture
   ("`review` stands next to `agent` because it draws its rank from that
   transition"), not a copy of data. Everything else comes from the registry. */
const CYCLE_STATES = [
  "prepared",
  "agent",
  "review",
  "ready",
  "exporting",
  "inspection",
  "failed",
  "confirmed",
  "mirrored",
  "closed",
  "cancelled",
];

/**
 * Der Buchungszyklus: acht Spalten, sechzehn Übergänge, „Kanzlei prüft" als
 * aktueller Zustand in seinem Warnton. Fünf Bögen unten (die Rückwege), zwei
 * oben (`exporting → confirmed`, `confirmed → closed`) — `prepared → review`
 * läuft durch die Mitte, weil `review` seinen Rang aus genau diesem Übergang
 * zieht und damit neben `agent` steht.
 *
 * Ohne `transitions` und ohne `description`: beides holt sich die Komponente
 * aus `STATE_MACHINES` (Maschine `export_batch`, Achse `zyklus_stapel`) — und
 * genau das ist der Beweis, dass der Weg über die Registry trägt.
 */
export const Filled: Story = {
  render: () => <StateMachine axis="export_batch" states={CYCLE_STATES} current="review" />,
};

/**
 * Der Beleg: eine Verzweigung und ein Paar in beide Richtungen
 * (`processed ⇄ review_needed`) — die zwei Wege decken sich nicht, einer geht
 * durch die Mitte, einer unten herum. Ohne `current`: keine Box ist farbig.
 */
export const Branching: Story = {
  render: () => <StateMachine axis="document_processing" />,
};

/**
 * Ohne Übergänge — der Normalfall bei fast allen 72 Achsen. Die Zustände
 * stehen in einer Reihe, und die Zeile darunter sagt, dass die Übergänge nicht
 * hinterlegt sind. Das Bild behauptet nichts, was die Daten nicht hergeben.
 */
export const Sequence: Story = {
  render: () => (
    <StateMachine
      axis="accounting_case"
      states={[
        "open",
        "needs_clarification",
        "waiting_for_documents",
        "closed_accepted",
        "closed_rejected",
        "closed_superseded",
      ]}
      current="needs_clarification"
    />
  ),
};

/**
 * Der Klick ist der Beweis: „Prüfung nötig" öffnet ein Popover mit Badge,
 * DB-Wert, Bedeutung, **Hinein durch** („In Bearbeitung · Pipeline durch,
 * reparierbare Findings" und „Prozessiert · Revalidierung") und **Hinaus
 * durch** („Revalidierung … · Prozessiert"), zuletzt der Ort des Werts.
 * Escape schließt, Tab läuft die Boxen in Spaltenordnung ab.
 */
export const Explain: Story = {
  render: () => <StateMachine axis="document_processing" current="review_needed" />,
};

/**
 * Drei Ränder auf einmal: ein Ziel `quarantined`, das die Registry nicht kennt
 * (Rohwert-Box hinten, das Wort in `code`), ein Selbst-Übergang, der nicht
 * gezeichnet wird und nur im Popover steht, und ein `current`, das nirgends
 * vorkommt. Dazu die schmale Karte — der Container scrollt, die Seite nicht.
 */
export const Edge: Story = {
  render: () => (
    <div style={{ maxWidth: 360, border: "var(--border-1)", borderRadius: "var(--radius-lg)", padding: "var(--space-4)" }}>
      <StateMachine
        axis="document_inbox"
        transitions={[
          ...INBOX,
          // Two transitions the registry does **not** have — exactly the edge this
          // story shows: a target outside the axis and a self-loop. They carry
          // `trigger` and `label` like every other transition.
          { from: "classification_failed", to: "quarantined", trigger: "quarantined", label: "Aussortiert" },
          { from: "pending_classification", to: "pending_classification", trigger: "reprocess", label: "Erneut anstoßen" },
        ]}
        current="on_hold"
      />
    </div>
  ),
};

/**
 * Im Einsatz am Stapel-Detail: oben die Positionsanzeige (wo dieser Zyklus
 * steht), darunter die Landkarte (welche Wege es gibt). Z7 hält beides
 * auseinander, und hier sieht man, warum das zwei Bilder sind.
 */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 1180 }}>
      <Card>
        <CardHead title="Buchungszyklus August 2026" sub="Stapel 2026-0042 · Musterfirma GmbH" />
        <div style={{ padding: "var(--space-5)", display: "grid", gap: "var(--space-6)" }}>
          <ProcessStepper
            owner={{ key: "kanzlei", label: "Kanzlei", color: "var(--color-primary)" }}
            phases={[
              { key: "sammeln", label: "Sammeln", sub: "Mandant", states: ["prepared"], status: "done" },
              { key: "buchen", label: "Buchen", sub: "Agent", states: ["agent"], status: "done" },
              { key: "pruefen", label: "Prüfen", sub: "Kanzlei", states: ["review"], status: "active" },
              {
                key: "exportieren",
                label: "Exportieren",
                sub: "Bridge",
                states: ["ready", "exporting", "confirmed"],
                status: "pending",
              },
            ]}
          />
          {/* `minWidth: 0`: a grid child is as wide as its content, and then the
              diagram's minimum width pushes through — the card clipped the last
              state by 55 px instead of the container scrolling (0069). */}
          <div style={{ minWidth: 0 }}>
            <div className="v2fields__h">Ablauf</div>
            <StateMachine
              axis="export_batch"
              states={CYCLE_STATES}
              transitions={CYCLE}
              current="review"
            />
          </div>
        </div>
      </Card>
    </div>
  ),
};
