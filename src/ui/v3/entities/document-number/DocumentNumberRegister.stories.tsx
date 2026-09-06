import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { DocumentNumberRegister } from "./DocumentNumberRegister";
import { REGISTER, SOURCE_LABEL, STATE_LABEL } from "./fixtures";
import { Card, CardHead } from "../../primitives/Table";

const meta: Meta<typeof DocumentNumberRegister> = {
  title: "v3/Entitäten/Belegnummer/DocumentNumberRegister",
  component: DocumentNumberRegister,
};
export default meta;
type Story = StoryObj<typeof DocumentNumberRegister>;

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: 900 }}>
      <Card>
        <CardHead
          title="Belegnummern-Register"
          sub="Musterbau GmbH · Wirtschaftsjahr 2026"
        />
        <div style={{ padding: "var(--space-5)" }}>{children}</div>
      </Card>
    </div>
  );
}

/**
 * Alle neun Quellen, **unsortiert übergeben** und in Dominanz-Reihenfolge
 * gezeigt: die Reihenfolge kommt aus `sortByDominance` der Domäne, nicht aus
 * einer Sortierung hier. Regel 1 steht dahinter — DATEV gewinnt.
 */
export const Filled: Story = {
  render: () => (
    <Frame>
      <DocumentNumberRegister
        entries={REGISTER}
        onPick={() => {}}
        sourceLabel={SOURCE_LABEL}
        stateLabel={STATE_LABEL}
      />
    </Frame>
  ),
};

/** Kein Eintrag — mit dem Grund, nicht nur der Feststellung. */
export const Empty: Story = {
  render: () => (
    <Frame>
      <DocumentNumberRegister
        entries={[]}
        onPick={() => {}}
        sourceLabel={SOURCE_LABEL}
        stateLabel={STATE_LABEL}
      />
    </Frame>
  ),
};

/** `query` ohne Treffer — und der Ausweg steht dabei. */
export const EmptyAfterFilter: Story = {
  render: () => (
    <Frame>
      <DocumentNumberRegister
        entries={REGISTER}
        query="AR-9999"
        onQueryChange={() => {}}
        onPick={() => {}}
        sourceLabel={SOURCE_LABEL}
        stateLabel={STATE_LABEL}
      />
    </Frame>
  ),
};

/** `loading`: fünf Zeilen in der Form der Tabelle. */
export const Loading: Story = {
  render: () => (
    <Frame>
      <DocumentNumberRegister
        entries={[]}
        loading
        onPick={() => {}}
        sourceLabel={SOURCE_LABEL}
        stateLabel={STATE_LABEL}
      />
    </Frame>
  ),
};

/** ↑/↓ durch die Liste, `Enter` übernimmt; die Suche filtert über drei Felder. */
export const Interactive: Story = {
  render: function Render() {
    const [q, setQ] = useState("");
    const [picked, setPicked] = useState<string | null>(null);
    return (
      <Frame>
        <DocumentNumberRegister
          entries={REGISTER}
          query={q}
          onQueryChange={setQ}
          onPick={(e) => setPicked(`${e.documentNumber} (${SOURCE_LABEL[e.source]})`)}
          sourceLabel={SOURCE_LABEL}
          stateLabel={STATE_LABEL}
        />
        <p className="v2sub" style={{ marginTop: "var(--space-4)" }}>
          {picked ? `Übernommen: ${picked}` : "Noch nichts übernommen."}
        </p>
      </Frame>
    );
  },
};
