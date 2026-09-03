import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  ProcessMini,
  ProcessStepper,
  BatonBar,
  Baton,
  type ProcessPhase,
  type BatonMeta,
} from "./Process";

const meta: Meta<typeof ProcessStepper> = { title: "v3/Patterns/Prozess/Process", component: ProcessStepper };
export default meta;
type Story = StoryObj<typeof ProcessStepper>;

const AGENT: BatonMeta = { key: "agent", label: "Agent", color: "var(--color-accent)" };
const MANDANT: BatonMeta = { key: "mandant", label: "Mandant", color: "var(--color-warning)" };
const KANZLEI: BatonMeta = { key: "kanzlei", label: "Kanzlei", color: "var(--color-primary)" };
const BRIDGE: BatonMeta = { key: "bridge", label: "Übertragung", color: "var(--color-info)" };
const DATEV: BatonMeta = { key: "datev", label: "DATEV", color: "var(--color-success)" };
const NIEMAND: BatonMeta = { key: "niemand", label: "Niemand", color: "var(--color-text-subtle)" };

const PHASES: ProcessPhase[] = [
  { key: "buchen", label: "Buchen", sub: "Agent", states: ["queued", "running", "proposed"], status: "done" },
  { key: "pruefen", label: "Prüfen", sub: "Kanzlei", states: ["review", "returned", "approved"], status: "active" },
  { key: "uebergeben", label: "Übergeben", sub: "Übertragung", states: ["exporting", "exported"], status: "pending" },
  { key: "nachlesen", label: "Nachlesen", sub: "DATEV", states: ["mirrored", "reconciled"], status: "pending" },
];

const withStatus = (status: Record<string, ProcessPhase["status"]>) =>
  PHASES.map((p) => ({ ...p, status: status[p.key] ?? p.status }));

/** Im Detail-Header: vier Phasen, Rohzustände darunter, der Baton in der aktiven. */
export const InHeader: Story = {
  render: () => (
    <ProcessStepper
      phases={PHASES}
      owner={KANZLEI}
      loops={{ returned: 2, reopened: 1 }}
      logHref="#"
      phaseSince={{ buchen: "26.08." }}
    />
  ),
};

/** Rot nur hier: die Übergabe ist gescheitert, der Baton alarmiert. */
export const Failed: Story = {
  render: () => (
    <ProcessStepper
      phases={withStatus({ pruefen: "done", uebergeben: "failed" })}
      owner={BRIDGE}
      alarm
      phaseSince={{ buchen: "26.08.", pruefen: "29.08." }}
    />
  ),
};

/** In der Listenzeile: vier Segmente und das Wort dazu — Icon und Wort, nie nur Farbe. */
export const InRow: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: "var(--space-4)", alignItems: "center" }}>
      <ProcessMini phases={PHASES} />
      <Baton owner={KANZLEI} detail="seit 3 Tagen" />
      <ProcessMini phases={withStatus({ pruefen: "done", uebergeben: "done", nachlesen: "active" })} />
      <Baton owner={DATEV} />
      <ProcessMini phases={withStatus({ pruefen: "done", uebergeben: "failed" })} />
      <Baton owner={BRIDGE} alarm detail="seit 09:40" />
      <ProcessMini phases={withStatus({ buchen: "pending", pruefen: "pending" })} />
      <Baton owner={NIEMAND} />
    </div>
  ),
};

/** Über dem Log: warum hat der August drei Wochen gedauert? */
export const InLog: Story = {
  render: () => (
    <BatonBar
      segments={[
        { owner: AGENT, share: 0.1, title: "Agent · 26.08.–27.08. · 2 Tage" },
        { owner: MANDANT, share: 0.55, title: "Mandant · 27.08.–05.09. · 9 Tage" },
        { owner: AGENT, share: 0.05, title: "Agent · 05.09. · 4 Stunden" },
        { owner: KANZLEI, share: 0.3, title: "Kanzlei · 05.09.–10.09. · 5 Tage" },
      ]}
    />
  ),
};

/** Frisch angelegt: keine Phase begonnen, niemand hat den Stab. */
export const Empty: Story = {
  render: () => <ProcessStepper phases={withStatus({ buchen: "pending", pruefen: "pending" })} owner={NIEMAND} />,
};
