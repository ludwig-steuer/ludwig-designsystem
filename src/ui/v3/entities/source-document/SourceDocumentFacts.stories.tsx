import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Card, CardHead } from "../../primitives/Table";
import { SourceDocumentFacts } from "./SourceDocumentFacts";

const meta: Meta<typeof SourceDocumentFacts> = {
  title: "v3/Entitäten/Beleg/SourceDocumentFacts",
  component: SourceDocumentFacts,
};
export default meta;
type Story = StoryObj<typeof SourceDocumentFacts>;

/** Everything known: four facts in their fixed order, the summary below them. */
export const Filled: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <SourceDocumentFacts
        facts={{
          vendor: "ACME GmbH",
          invoiceNumber: "RE-4471",
          invoiceDate: "2026-08-26",
          gross: 1249.9,
          currency: "EUR",
          summary:
            "Bürobedarf und eine Bewirtung auf einem Beleg — der Beleg wird gesplittet gebucht.",
        }}
      />
    </div>
  ),
};

/**
 * A freshly arrived document knows almost nothing yet. Missing facts show the
 * em dash and keep their row — the reader sees *that* the vendor is unknown,
 * not a list that silently got shorter.
 */
export const Unvollstaendig: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <SourceDocumentFacts facts={{ invoiceNumber: "RE-4471", gross: null, currency: "EUR" }} />
    </div>
  ),
};

/** Where it is really used: inside the drawer and, later, inside the full view. */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <Card>
        <CardHead title="Beleg · ACME GmbH" sub="RE-4471" />
        <div style={{ padding: "var(--space-5)" }}>
          <SourceDocumentFacts
            facts={{
              vendor: "ACME GmbH",
              invoiceNumber: "RE-4471",
              invoiceDate: "2026-08-26",
              gross: 1249.9,
              currency: "EUR",
            }}
          />
        </div>
      </Card>
    </div>
  ),
};
