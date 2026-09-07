import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Card, CardHead } from "../primitives/Table";
import { ProcessStepper } from "./Process";
import { StateMachine, type StateTransition } from "./StateMachine";

const meta: Meta<typeof StateMachine> = {
  title: "v3/Patterns/Prozess/StateMachine",
  component: StateMachine,
};
export default meta;
type Story = StoryObj<typeof StateMachine>;

/*
  Die Übergänge stehen hier als Konstanten, weil es sie **als Daten nirgends
  gibt** (Register L-74). Quelle je Satz steht darüber; der Anhang der Spec
  0069 führt dieselben Tabellen mit ihrem Fundort in `ludwig/app`.
*/

/** `ludwig/app/docs/topics/datev.md`, Abschnitt R19 — Spalte „Hinaus durch". */
const ZYKLUS: StateTransition[] = [
  { from: "prepared", to: "agent", label: "Aufgreifen (start_agent_run)" },
  { from: "prepared", to: "review", label: "Prüfung übernehmen" },
  { from: "agent", to: "prepared", label: "Durchgang beendet (finish_agent_run)" },
  { from: "review", to: "ready", label: "Freigabe" },
  { from: "review", to: "agent", label: "Zurück an den Agenten" },
  { from: "ready", to: "exporting", label: "Push" },
  { from: "ready", to: "review", label: "Abbruch" },
  { from: "exporting", to: "confirmed", label: "Quittung" },
  { from: "exporting", to: "inspection", label: "Quittung mit Prüfung" },
  { from: "exporting", to: "failed", label: "Fehler" },
  { from: "inspection", to: "confirmed", label: "Quittung" },
  { from: "confirmed", to: "mirrored", label: "Spiegel-Import eines festgeschriebenen Stapels" },
  { from: "confirmed", to: "closed", label: "leerer Diff" },
  { from: "mirrored", to: "closed", label: "Nachlese" },
  { from: "failed", to: "ready", label: "Retry" },
  { from: "failed", to: "review", label: "Abbruch" },
];

const ZYKLUS_STATES = [
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

const ZYKLUS_LEAD =
  "Der Stapel ist die Klammer um die Bearbeitung eines Zeitraums, nicht die " +
  "Hülle um einen Export. Nummer und Beschreibung fallen bei der Eröffnung — " +
  "der Zyklus hat von Anfang an eine Identität. Wer dran ist, ist der Zustand.";

/** Der „Übergänge:"-Block im Kopfkommentar von `BELEG` in der Registry. */
const BELEG: StateTransition[] = [
  { from: "pending", to: "in_progress", label: "Pipeline startet" },
  { from: "in_progress", to: "processed", label: "Pipeline durch" },
  { from: "in_progress", to: "review_needed", label: "Pipeline durch, reparierbare Findings" },
  { from: "in_progress", to: "failed", label: "Abbruch" },
  { from: "processed", to: "review_needed", label: "Revalidierung" },
  { from: "review_needed", to: "processed", label: "Revalidierung (update_invoice_extraction)" },
  { from: "failed", to: "in_progress", label: "Retry / force-Reprocess" },
];

/** Der Schreiber-Absatz im Kopfkommentar von `BELEG_INBOX`. */
const INBOX: StateTransition[] = [
  { from: "pending_classification", to: "classified", label: "Classifier" },
  { from: "pending_classification", to: "classification_failed", label: "Classifier" },
  { from: "classified", to: "pending_classification", label: "Reprocess" },
  { from: "classification_failed", to: "pending_classification", label: "Reprocess" },
  { from: "pending_classification", to: "deleted", label: "Soft-Delete" },
  { from: "classified", to: "deleted", label: "Soft-Delete" },
  { from: "classification_failed", to: "deleted", label: "Soft-Delete" },
];

/**
 * Der Buchungszyklus: acht Spalten, sechzehn Übergänge, „Kanzlei prüft" als
 * aktueller Zustand in seinem Warnton. Fünf Bögen unten (die Rückwege), zwei
 * oben (`exporting → confirmed`, `confirmed → closed`) — `prepared → review`
 * läuft durch die Mitte, weil `review` seinen Rang aus genau diesem Übergang
 * zieht und damit neben `agent` steht.
 */
export const Filled: Story = {
  render: () => (
    <StateMachine
      axis="zyklus_stapel"
      states={ZYKLUS_STATES}
      transitions={ZYKLUS}
      current="review"
      description={ZYKLUS_LEAD}
    />
  ),
};

/**
 * Der Beleg: eine Verzweigung und ein Paar in beide Richtungen
 * (`processed ⇄ review_needed`) — die zwei Wege decken sich nicht, einer geht
 * durch die Mitte, einer unten herum. Ohne `current`: keine Box ist farbig.
 */
export const Branching: Story = {
  render: () => <StateMachine axis="beleg" transitions={BELEG} />,
};

/**
 * Ohne Übergänge — der Normalfall bei fast allen 70 Achsen. Die Zustände
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
  render: () => <StateMachine axis="beleg" transitions={BELEG} current="review_needed" />,
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
          { from: "classification_failed", to: "quarantined", label: "Aussortiert" },
          { from: "pending_classification", to: "pending_classification", label: "Erneut anstoßen" },
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
              states={ZYKLUS_STATES}
              transitions={ZYKLUS}
              current="review"
            />
          </div>
        </div>
      </Card>
    </div>
  ),
};
