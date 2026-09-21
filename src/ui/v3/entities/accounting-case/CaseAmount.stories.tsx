import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";

import { EntityHeader } from "../../patterns/EntityHeader";
import { CaseAmount } from "./CaseAmount";

const meta: Meta<typeof CaseAmount> = {
  title: "v3/Entitäten/Sachverhalt/CaseAmount",
  component: CaseAmount,
};
export default meta;
type Story = StoryObj<typeof CaseAmount>;

function Case({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px auto", gap: "var(--space-4)", alignItems: "start" }}>
      <span className="v2sub">{label}</span>
      <div style={{ textAlign: "right", width: 160 }}>{children}</div>
    </div>
  );
}

/**
 * Die Regel (D24) an ihrer einen Stelle: der Rest steht nur, wo er etwas sagt,
 * das der Betrag nicht sagt. Teilweise bezahlt → „offen …", ganz bezahlt →
 * „gedeckt". Nichts gezahlt → **nichts**, denn der Rest wäre der Betrag ein
 * zweites Mal. Ohne Beleg (`openAmount: null`) → nichts. Ohne Betrag rendert
 * die Komponente gar nichts — kein „— €" (D7).
 */
export const States: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      <Case label="teilweise bezahlt">
        <CaseAmount amount={1190} openAmount={690} currency="EUR" />
      </Case>
      <Case label="ganz bezahlt">
        <CaseAmount amount={2380} openAmount={0} currency="EUR" />
      </Case>
      <Case label="nichts bezahlt">
        <CaseAmount amount={595} openAmount={595} currency="EUR" />
      </Case>
      <Case label="kein Beleg (OPOS-Vortrag)">
        <CaseAmount amount={2975} openAmount={null} currency="EUR" />
      </Case>
      <Case label="ohne Betrag">
        <CaseAmount amount={null} openAmount={null} currency="EUR" />
      </Case>
    </div>
  ),
};

/** Im Einsatz: das Metrum im Kopf des Sachverhalts. */
export const InHeader: Story = {
  render: () => (
    <div style={{ maxWidth: 1000 }}>
      <EntityHeader
        overline="Sachverhalt · 2026-0142"
        title="Eingangsrechnung: Müller Bürotechnik GmbH"
        metric={{ label: "Betrag", value: <CaseAmount amount={1190} openAmount={690} currency="EUR" /> }}
      />
    </div>
  ),
};

/**
 * Der Rand: ein großer Betrag mit einem Rest in Cent; ein Rest mit umgekehrtem
 * Vorzeichen, aber gleichem Betrag (zählt als „nichts bezahlt"); ein negativer
 * Rest — überzahlt. Für ihn gibt es kein eigenes Wort, bis die App eines führt:
 * er steht als „offen" mit Vorzeichen (0192, offene Frage 1).
 */
export const Edge: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      <Case label="großer Betrag, Rest in Cent">
        <CaseAmount amount={184560.75} openAmount={0.01} currency="EUR" />
      </Case>
      <Case label="gleicher Betrag, anderes Vorzeichen">
        <CaseAmount amount={-734.8} openAmount={734.8} currency="EUR" />
      </Case>
      <Case label="überzahlt">
        <CaseAmount amount={1190} openAmount={-50} currency="EUR" />
      </Case>
    </div>
  ),
};
