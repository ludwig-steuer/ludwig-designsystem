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
  **Nichts mehr von Hand.** Bis zum Spiegel-Zug vom 2026-09-07 standen hier
  zwei Sätze als Konstanten, weil ihre Achsen in der Registry keine Maschine
  hatten (Register L-75). Seither führt `STATE_MACHINES` zwölf Maschinen mit
  englischem `trigger` und deutschem `label` — darunter genau diese zwei. Eine
  Kopie daneben wäre wieder das Muster, das dieses Repo dreimal gerissen hat:
  eine handgeschriebene Liste neben einer gepflegten.
*/
const CYCLE = STATE_MACHINES.export_batch!.transitions;
const INBOX = STATE_MACHINES.document_processing!.transitions;

/* Die **Spaltenordnung** bleibt Sache der Story: sie ist eine Aussage über das
   Bild („`review` steht neben `agent`, weil es seinen Rang aus genau diesem
   Übergang zieht"), keine Kopie von Daten. Alles andere — Übergänge, Wörter,
   Beschreibung — kommt aus der Registry. */
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
  render: () => <StateMachine axis="zyklus_stapel" states={CYCLE_STATES} current="review" />,
};

/**
 * Der Beleg: eine Verzweigung und ein Paar in beide Richtungen
 * (`processed ⇄ review_needed`) — die zwei Wege decken sich nicht, einer geht
 * durch die Mitte, einer unten herum. Ohne `current`: keine Box ist farbig.
 */
export const Branching: Story = {
  render: () => <StateMachine axis="beleg" />,
};

/**
 * Ohne Übergänge — der Normalfall bei fast allen 72 Achsen. Die Zustände
 * stehen in einer Reihe, und die Zeile darunter sagt, dass die Übergänge nicht
 * hinterlegt sind. Das Bild behauptet nichts, was die Daten nicht hergeben.
 */
export const Sequence: Story = {
  render: () => (
    <StateMachine
      axis="sachverhalt"
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
  render: () => <StateMachine axis="beleg" current="review_needed" />,
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
        axis="beleg_inbox"
        transitions={[
          ...INBOX,
          // Zwei Übergänge, die die Registry **nicht** führt — genau der Rand,
          // den diese Story zeigt: ein Ziel außerhalb der Achse und eine
          // Schlinge auf sich selbst. Sie tragen `trigger` und `label` wie
          // jeder andere Übergang seit dem Spiegel-Zug.
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
          {/* `minWidth: 0`: ein Rasterkind ist so breit wie sein Inhalt, und
              dann reicht die Mindestbreite des Diagramms durch — die Karte
              schnitt den letzten Zustand um 55 px ab, statt dass der Behälter
              in sich scrollt (Abnahme 0069, vierte Runde). Ein `overflow-x`
              im Inneren schützt sich nicht selbst. */}
          <div style={{ minWidth: 0 }}>
            <div className="v2fields__h">Ablauf</div>
            <StateMachine
              axis="zyklus_stapel"
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
