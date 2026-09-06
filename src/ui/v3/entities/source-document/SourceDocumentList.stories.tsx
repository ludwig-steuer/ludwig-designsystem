import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SourceDocumentList } from "./SourceDocumentList";
import type { SourceDocumentVM } from "./SourceDocument";
import { Card, CardHead } from "../../primitives/Table";

const meta: Meta<typeof SourceDocumentList> = {
  title: "v3/Entitäten/Beleg/SourceDocumentList",
  component: SourceDocumentList,
};
export default meta;
type Story = StoryObj<typeof SourceDocumentList>;

const DOCS: SourceDocumentVM[] = [
  {
    id: "d1",
    fileName: "RE-4471-Bürobedarf-Meier.pdf",
    sourceDocType: "invoice",
    classDocumentForm: "commercial_invoice",
    counterparty: "Bürobedarf Meier GmbH",
    detail: { kind: "invoice", number: "RE-4471", gross: 1249.9, currency: "EUR" },
    documentDate: "2026-08-26",
    receivedDate: "2026-08-27",
    completedAt: "2026-08-30T09:12:00Z",
    completedVia: "booking",
    docCategory: "performance",
    docDirection: "inbound",
    caseNumber: "2026-0412",
    href: "#beleg-1",
  },
  {
    id: "d2",
    fileName: "Lieferschein-LS-8842.pdf",
    sourceDocType: "other",
    classDocumentForm: "delivery_note",
    counterparty: "Bürobedarf Meier GmbH",
    documentDate: "2026-08-24",
    receivedDate: "2026-08-27",
    completedAt: null,
    docCategory: "performance",
    docDirection: "inbound",
    caseNumber: "2026-0412",
    href: "#beleg-2",
  },
];

function Frame({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: 1180 }}>
      <Card>
        <CardHead title={title} sub={sub} />
        {children}
      </Card>
    </div>
  );
}

/** Zwei Belege am Sachverhalt — p90 ist eins, mehr als drei sind die Ausnahme. */
export const Filled: Story = {
  render: () => (
    <Frame title="Belege" sub="Sachverhalt 2026-0412">
      <SourceDocumentList documents={DOCS} />
    </Frame>
  ),
};

/**
 * Der erste Leerfall: eine **Lücke**. Es fehlt etwas, das kommen soll — der
 * Satz sagt, dass es noch kommt.
 */
export const Empty: Story = {
  render: () => (
    <Frame title="Belege" sub="Sachverhalt 2026-0415">
      <SourceDocumentList documents={[]} />
    </Frame>
  ),
};

/**
 * Der zweite Leerfall: ein **Erfolg**. „Kein Beleg zu erwarten" ist eine
 * Aussage mit Begründung, und genau deshalb kann die Liste die beiden Fälle
 * nicht selbst unterscheiden — der Aufrufer sagt, welcher gilt.
 */
export const NotExpected: Story = {
  render: () => (
    <Frame title="Belege" sub="Sachverhalt 2026-0501">
      <SourceDocumentList
        documents={[]}
        emptyKind="not-expected"
        reason="Interne Umbuchung zwischen zwei Sachkonten — es gibt keinen Beleg dazu."
      />
    </Frame>
  ),
};

/** Im Einsatz: die Teilbelege unter einem zerlegten Sammel-PDF. */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 1180, display: "grid", gap: "var(--space-5)" }}>
      <Frame title="Sammel-PDF" sub="Scan-2026-08-31.pdf · 12 Seiten, in 2 Belege zerlegt">
        <SourceDocumentList
          documents={DOCS}
          href={(d) => `#teilbeleg-${d.id}`}
        />
      </Frame>
    </div>
  ),
};
