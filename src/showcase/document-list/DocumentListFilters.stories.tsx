import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { DataTable } from "@/ui/v3/patterns/DataTable";
import {
  DOCUMENT_LIST_COLUMNS,
  sourceDocumentColumns,
  sourceDocumentMinWidth,
} from "@/ui/v3/entities/source-document/source-document-columns";
import type { SourceDocumentVM } from "@/ui/v3/entities/source-document/SourceDocument";
import { documentFixture } from "../document/fixtures";
import { CLASSIFICATION_SCENARIOS } from "../document-classification/fixtures";
import { DocumentListFilters, EMPTY, type FilterState } from "./DocumentListFilters";

/**
 * The filters of the document list (0209, brief F329) in the six situations of
 * §4, above the real list (`DOCUMENT_LIST_COLUMNS` with the classification
 * picture). The category chips and the partner filter the rows here; the other
 * filters only show how they are set and named.
 */
const meta: Meta = { title: "Seiten/Belegliste/Filter", parameters: { layout: "padded" } };
export default meta;
type Story = StoryObj;

const ROWS = CLASSIFICATION_SCENARIOS.map((s, i) => ({
  doc: documentFixture({ id: `f-${s.id}`, counterparty: i % 5 === 0 ? "Hartje KG" : (s.title.split(" · ")[1] ?? s.title), fileName: `${s.title}.pdf` }),
  scenario: s,
}));
const BY_ID = new Map(ROWS.map((r) => [r.doc.id, r.scenario]));

const COUNTS = {
  presets: { open: 41, stuck: 9, client: 4, done: 294, all: 335 },
  categories: { performance: 184, payment: 40, foundation: 2, internal: 6, report: 4, none: 109 },
};

function Page({ initial, total = 335 }: { initial: FilterState; total?: number }) {
  const [state, setState] = useState(initial);
  const rows = ROWS.filter(
    (r) =>
      (state.categories.length === 0 || state.categories.includes(r.scenario.picture.identity.category)) &&
      (!state.partner || r.doc.counterparty === state.partner.name),
  ).map((r) => r.doc);
  const cols = sourceDocumentColumns({
    columns: DOCUMENT_LIST_COLUMNS,
    classificationPicture: (d) => {
      const s = BY_ID.get(d.id);
      return s ? { picture: s.picture, detail: s.detail } : null;
    },
  });
  // The list shows 20 invented rows; the count speaks for the real 335 so the
  // numbers read like the page.
  const shown = state === EMPTY ? total : Math.max(1, Math.round((rows.length / ROWS.length) * total * (state.preset === "all" ? 1 : 0.12)));
  return (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      <DocumentListFilters initial={initial} counts={COUNTS} result={{ shown, total }} onChange={setState} />
      <DataTable<SourceDocumentVM>
        rows={rows}
        columns={cols}
        rowKey={(d) => d.id}
        head={{ title: "Belege 2026", sub: "Musterbau Schneider GmbH & Co. KG" }}
        minWidth={sourceDocumentMinWidth(cols)}
        empty={{ title: "Kein Beleg passt zu diesen Filtern.", description: "Entfernen Sie einen Filter über seinen Chip oder setzen Sie alle zurück." }}
      />
    </div>
  );
}

/** 1 — nothing set: the quick filters with their counts, the category chips, search and one quiet „Filter". */
export const NoFilter: Story = { render: () => <Page initial={EMPTY} /> };

/** 2 — one quick filter: „Offen" pressed with its count. */
export const QuickFilter: Story = { render: () => <Page initial={{ ...EMPTY, preset: "open" }} /> };

/** 3 — quick filter and category: open ∩ payment documents, both visible as pressed chips, „x von y". */
export const QuickAndCategory: Story = { render: () => <Page initial={{ ...EMPTY, preset: "open", categories: ["payment"] }} /> };

/** 4 — amount and date set: two chips in words over the list, each removable, „Alle zurücksetzen". */
export const AmountAndDate: Story = {
  render: () => (
    <Page initial={{ ...EMPTY, amountFrom: 1000, amountTo: 2000, from: "2026-08-01", to: "2026-08-31", dateAxis: "document" }} />
  ),
};

/** 5 — partner from a row: the chip carries the name, not „ein Geschäftspartner". */
export const Partner: Story = { render: () => <Page initial={{ ...EMPTY, partner: { id: "bp-1", name: "Hartje KG" } }} /> };

/** Everything behind „Filter" set at once: „Filter (5)", every field as a chip in words. */
export const ManySet: Story = {
  render: () => (
    <Page
      initial={{
        ...EMPTY,
        preset: "open",
        q: "Telekom",
        from: "2026-08-01",
        to: "2026-08-31",
        dateAxis: "received",
        batch: "2026-0009",
        hasCase: "without",
        statuses: ["human_review", "bookable"],
      }}
    />
  ),
};

/** 6 — narrow (the review drawer, 36rem): the rows wrap, the handle „Filter (n)" keeps the rest. */
export const Narrow: Story = {
  render: () => (
    <div style={{ width: "36rem" }}>
      <Page initial={{ ...EMPTY, preset: "open", batch: "2026-0009" }} />
    </div>
  ),
};
