import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import type { JournalEntryVM } from "@/ludwig/modules/entries/domain/journal-entry-vm";

import { Button } from "../../primitives/Button";
import { Card, CardHead } from "../../primitives/Table";
import type { AiSource } from "./AiBookingNotes";
import { JournalEntryDrawer } from "./JournalEntryDrawer";
import type { JournalEntryFactsContext } from "./JournalEntryFacts";

const meta: Meta<typeof JournalEntryDrawer> = {
  title: "v3/Entitäten/Buchungssatz/JournalEntryDrawer",
  component: JournalEntryDrawer,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof JournalEntryDrawer>;

const ENTRY: JournalEntryVM = {
  journalEntryId: "je-4471",
  status: "accepted",
  origin: "ai_proposed",
  confidence: 0.92,
  bookingDate: "2026-08-26",
  rationale:
    "Konto und Kreditor wie bei der Rechnung desselben Lieferanten im Juni; das Kontoblatt 70021 zeigt für August keine Bewegung.",
  isLocked: false,
  blocked: false,
  currency: "EUR",
  createdAt: "2026-08-26T16:05:00Z",
  exportedAt: "2026-09-01T08:00:00Z",
  exportStapelnummer: "2026-08-001",
  exportBatchId: "batch-1",
  exportRef: "LW-4A19C2F0",
  lines: [
    {
      side: "debit",
      accountNumber: "6815",
      accountName: "Bürobedarf",
      amount: 1049.5,
      taxKey: "9",
      taxRatePercent: 19,
      lineText: "Meier Bürobedarf August 2026",
      externalDocumentNumber: "RE-4471",
    },
    {
      side: "credit",
      accountNumber: "70021",
      accountName: "Bürobedarf Meier GmbH",
      amount: 1049.5,
      taxKey: null,
      taxRatePercent: null,
      lineText: "Meier Bürobedarf August 2026",
      externalDocumentNumber: "RE-4471",
    },
  ],
};

const CONTEXT: JournalEntryFactsContext = {
  entryKind: "Aufwand",
  documentGroup: "incoming_invoices",
  agentRun: "Agent · Lauf 4b19c2",
  stepCode: "3d",
  case: {
    caseId: "case-118",
    caseNumber: "SV-118",
    fiscalYear: 2026,
    title: "Eingangsrechnung Bürobedarf Meier GmbH",
    kind: null,
    counterpartyName: "Bürobedarf Meier GmbH",
    lifecycleStatus: null,
  },
  event: "Rechnung eingegangen · 26.08.2026",
  mirrorEntry: { label: "DATEV 01-2026/0002" },
};

const SOURCES: AiSource[] = [
  { key: "1", art: "document", label: "Rechnung RE-4471", quote: "Bürobedarf, Lieferung August 2026" },
  { key: "2", art: "history", label: "14 Buchungen desselben Kreditors" },
];

const noop = () => {};
const batchHref = (batchId: string) => `#batch=${batchId}`;

/** The whole entry, looked up from an account sheet — with the one way out in the foot. */
export const Open: Story = {
  render: () => (
    <JournalEntryDrawer
      open
      onClose={noop}
      entry={ENTRY}
      context={CONTEXT}
      sources={SOURCES}
      judgeReasoning="Konto und Steuerschlüssel passen zur Präzedenz; keine Beanstandung."
      caseHref="#case=case-118"
      batchHref={batchHref}
    />
  ),
};

/** While it loads: the shape of the content, not one box over everything — and no foot. */
export const Loading: Story = {
  render: () => <JournalEntryDrawer open onClose={noop} entry={null} loading caseHref="#case=case-118" />,
};

/** The error says what went wrong and keeps the way closed. */
export const Error: Story = {
  render: () => (
    <JournalEntryDrawer
      open
      onClose={noop}
      entry={null}
      error="Zeitüberschreitung beim Laden (je-4471)."
      caseHref="#case=case-118"
    />
  ),
};

/** Gone: a reversed entry that was replaced — the honest answer, with where to look. */
export const NotFound: Story = {
  render: () => <JournalEntryDrawer open onClose={noop} entry={null} caseHref="#case=case-118" />,
};

/**
 * Without a case: no foot at all. The case row stays in „Zusammenhang" as
 * text, so nothing is lost — only the way is missing, and the drawer does not
 * pretend otherwise.
 */
export const WithoutCase: Story = {
  render: () => (
    <JournalEntryDrawer open onClose={noop} entry={ENTRY} context={{ entryKind: "Aufwand" }} />
  ),
};

/**
 * The round trip: a button in the account sheet opens it, Escape closes it,
 * and the focus returns to the button.
 */
export const InUse: Story = {
  render: function Round() {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ padding: "var(--space-6)", maxWidth: 720 }}>
        <Card>
          <CardHead title="Kontoblatt 6815" sub="Bürobedarf · 2026" />
          <div className="v3boxbody">
            <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
              Buchung RE-4471 ansehen
            </Button>
          </div>
        </Card>
        <JournalEntryDrawer
          open={open}
          onClose={() => setOpen(false)}
          entry={ENTRY}
          context={CONTEXT}
          sources={SOURCES}
          caseHref="#case=case-118"
          batchHref={batchHref}
        />
      </div>
    );
  },
};
