import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TechnicalFields, type TechnicalField } from "./TechnicalFields";

const meta: Meta<typeof TechnicalFields> = {
  title: "v3/Primitives/Fläche/TechnicalFields",
  component: TechnicalFields,
};
export default meta;
type Story = StoryObj<typeof TechnicalFields>;

const FIELDS: TechnicalField[] = [
  { label: "status", value: "done", meaning: "Stand des Belegs; aus ihm leitet sich das Prozessbild ab." },
  { label: "review_reason", value: "—", meaning: "Warum der Beleg zur Prüfung liegt." },
  { label: "processing_stage", value: "interpreted", meaning: "Wie weit die Auslese gekommen ist: aufbereitet, ausgelesen, gedeutet." },
  { label: "job", value: "—", meaning: "Der Hintergrundauftrag, der gerade am Beleg arbeitet, und sein Stand." },
  { label: "done_via", value: "booking", meaning: "Auf welchem Weg der Beleg erledigt wurde: Buchung, Import oder von Hand." },
  { label: "entry_stage", value: "accepted", meaning: "Stand der Buchung auf dem Weg nach DATEV." },
  { label: "path", value: "invoice", meaning: "Welcher Ablauf für diese Belegart gilt." },
];

/** Closed by default: the plain-language view comes first (T4). */
export const Closed: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <TechnicalFields fields={FIELDS} />
    </div>
  ),
};

/** Open: field and value in mono, the meaning as ordinary text. */
export const Open: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <TechnicalFields fields={FIELDS} defaultOpen />
    </div>
  ),
};

/** A field without a meaning keeps its row; the third cell stays empty. */
export const WithoutMeaning: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <TechnicalFields fields={[...FIELDS.slice(0, 2), { label: "class_confidence", value: "0,94" }]} defaultOpen />
    </div>
  ),
};
