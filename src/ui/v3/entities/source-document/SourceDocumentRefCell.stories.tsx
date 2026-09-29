import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SourceDocumentRefCell } from "./SourceDocumentRefCell";

const meta: Meta<typeof SourceDocumentRefCell> = {
  title: "v3/Entitäten/Beleg/SourceDocumentRefCell",
  component: SourceDocumentRefCell,
};
export default meta;
type Story = StoryObj<typeof SourceDocumentRefCell>;

const documentHref = (id: string) => `#document=${id}`;

const CASES = [
  { label: "zugeordnet", props: { number: "RE-4471", documentId: "doc-4471" } },
  { label: "zugeordnet, ohne Nummer", props: { number: null, documentId: "doc-4472" } },
  { label: "Nummer, kein Beleg", props: { number: "8814", documentId: null } },
  { label: "nichts", props: { number: null, documentId: null } },
];

/** The three states side by side, in both widths. */
export const States: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "200px 140px 140px", gap: "var(--space-3)", alignItems: "start" }}>
      <strong>Zustand</strong>
      <strong>full</strong>
      <strong>compact</strong>
      {CASES.map((c) => [
        <span key={`${c.label}-l`}>{c.label}</span>,
        <SourceDocumentRefCell key={`${c.label}-f`} {...c.props} documentHref={documentHref} />,
        <SourceDocumentRefCell key={`${c.label}-c`} {...c.props} documentHref={documentHref} variant="compact" />,
      ])}
    </div>
  ),
};

/** Without `documentHref` the linked state stays text — sign and number, no way. */
export const WithoutWay: Story = { args: { number: "RE-4471", documentId: "doc-4471" } };

/** A long document number is cut, the sign stays. */
export const LongNumber: Story = {
  render: () => (
    <div style={{ width: 112 }}>
      <SourceDocumentRefCell number="2026-08-RE-000447188" documentId="doc-1" documentHref={documentHref} />
    </div>
  ),
};
