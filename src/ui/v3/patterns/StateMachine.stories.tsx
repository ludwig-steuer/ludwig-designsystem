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
  Zwei Sätze stehen hier noch als Konstanten: ihre Achsen haben in der
  Registry keine Maschine (`STATE_MACHINES` führt bisher `beleg`, `job`,
  `upload`, `dispatch` — Register L-75, rund fünfzig offen). Quelle je Satz
  steht darüber; der Anhang der Spec 0069 führt dieselben Tabellen mit ihrem
  Fundort in `ludwig/app`. Die Achse `beleg` braucht keine mehr: sie kommt aus
  der Registry, und genau das zeigen `Branching` und `Explain`.
*/

/** `ludwig/app/docs/topics/datev.md`, Abschnitt R19 — Spalte „Hinaus durch". */
const ZYKLUS: StateTransition[] = [
  { from: "prepared", to: "agent", trigger: "Aufgreifen (start_agent_run)" },
  { from: "prepared", to: "review", trigger: "Prüfung übernehmen" },
  { from: "agent", to: "prepared", trigger: "Durchgang beendet (finish_agent_run)" },
  { from: "review", to: "ready", trigger: "Freigabe" },
  { from: "review", to: "agent", trigger: "Zurück an den Agenten" },
  { from: "ready", to: "exporting", trigger: "Push" },
  { from: "ready", to: "review", trigger: "Abbruch" },
  { from: "exporting", to: "confirmed", trigger: "Quittung" },
  { from: "exporting", to: "inspection", trigger: "Quittung mit Prüfung" },
  { from: "exporting", to: "failed", trigger: "Fehler" },
  { from: "inspection", to: "confirmed", trigger: "Quittung" },
  { from: "confirmed", to: "mirrored", trigger: "Spiegel-Import eines festgeschriebenen Stapels" },
  { from: "confirmed", to: "closed", trigger: "leerer Diff" },
  { from: "mirrored", to: "closed", trigger: "Nachlese" },
  { from: "failed", to: "ready", trigger: "Retry" },
  { from: "failed", to: "review", trigger: "Abbruch" },
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

/** Der Schreiber-Absatz im Kopfkommentar von `BELEG_INBOX`. */
const INBOX: StateTransition[] = [
  { from: "pending_classification", to: "classified", trigger: "Classifier" },
  { from: "pending_classification", to: "classification_failed", trigger: "Classifier" },
  { from: "classified", to: "pending_classification", trigger: "Reprocess" },
  { from: "classification_failed", to: "pending_classification", trigger: "Reprocess" },
  { from: "pending_classification", to: "deleted", trigger: "Soft-Delete" },
  { from: "classified", to: "deleted", trigger: "Soft-Delete" },
  { from: "classification_failed", to: "deleted", trigger: "Soft-Delete" },
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
          { from: "classification_failed", to: "quarantined", trigger: "Aussortiert" },
          { from: "pending_classification", to: "pending_classification", trigger: "Erneut anstoßen" },
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
