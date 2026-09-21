import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { JournalEntryVM } from "@/ludwig/modules/entries/domain/journal-entry-vm";

import { Card, CardHead } from "../../primitives/Table";
import type { AiSource } from "./AiBookingNotes";
import { JournalEntryFacts, type JournalEntryFactsContext } from "./JournalEntryFacts";

const meta: Meta<typeof JournalEntryFacts> = {
  title: "v3/Entitäten/Buchungssatz/JournalEntryFacts",
  component: JournalEntryFacts,
};
export default meta;
type Story = StoryObj<typeof JournalEntryFacts>;

const entry = (over: Partial<JournalEntryVM> = {}): JournalEntryVM => ({
  journalEntryId: "je-4471",
  status: "proposed",
  origin: "ai_proposed",
  confidence: 0.92,
  bookingDate: "2026-08-26",
  rationale:
    "Konto und Kreditor wie bei der Rechnung desselben Lieferanten im Juni; das Kontoblatt 70021 zeigt für August keine Bewegung, die Rechnung war also noch nicht erfasst.",
  isLocked: false,
  blocked: false,
  currency: "EUR",
  createdAt: "2026-08-26T16:05:00Z",
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
  ...over,
});

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
};

const SOURCES: AiSource[] = [
  { key: "1", art: "document", label: "Rechnung RE-4471", quote: "Bürobedarf, Lieferung August 2026" },
  { key: "2", art: "history", label: "14 Buchungen desselben Kreditors, zuletzt 22.07.2026" },
];

const caseHref = (caseId: string) => `#case=${caseId}`;
const batchHref = (batchId: string) => `#batch=${batchId}`;

function Frame({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: 820 }}>
      <Card>
        <CardHead title={title} {...(sub ? { sub } : {})} />
        <div className="v3boxbody">{children}</div>
      </Card>
    </div>
  );
}

/**
 * A proposal of the agent, read whole: the facts, the lines in the batch
 * columns, the derivation with confidence, reasoning and sources, and the
 * context it belongs to.
 */
export const Filled: Story = {
  render: () => (
    <Frame title="Buchungssatz" sub="Vorschlag vom 26.08.2026">
      <JournalEntryFacts
        entry={entry()}
        context={CONTEXT}
        sources={SOURCES}
        judgeReasoning="Konto und Steuerschlüssel passen zur Präzedenz; keine Beanstandung."
        caseHref={caseHref}
      />
    </Frame>
  ),
};

/**
 * An entry from the client's own batch: no confidence, no reasoning, no
 * sources. The derivation stays one line — origin and nothing else — and the
 * groups that would be empty are **absent**.
 */
export const WithoutAi: Story = {
  render: () => (
    <Frame title="Buchungssatz" sub="aus dem Mandantenstapel">
      <JournalEntryFacts
        entry={entry({
          origin: "client_import",
          status: "accepted",
          confidence: null,
          rationale: null,
        })}
        context={{ importReference: "STAPEL-2026-08" }}
      />
    </Frame>
  ),
};

/** Accepted, exported, found again in DATEV — the way is derived, not read off `status`. */
export const Exported: Story = {
  render: () => (
    <Frame title="Buchungssatz" sub="in DATEV bestätigt">
      <JournalEntryFacts
        entry={entry({
          status: "accepted",
          exportedAt: "2026-09-01T08:00:00Z",
          exportFileName: "EXTF_Buchungsstapel_2026-08.csv",
          exportRef: "LW-4A19C2F0",
          exportBatchId: "batch-1",
          exportStapelnummer: "2026-08-001",
        })}
        context={{ ...CONTEXT, mirrorEntry: { label: "DATEV 01-2026/0002", href: "#mirror=1" } }}
        sources={SOURCES}
        batchHref={batchHref}
        caseHref={caseHref}
      />
    </Frame>
  ),
};

/** The entry that replaced one the judge had flagged — with the finding it answered. */
export const Repaired: Story = {
  render: () => (
    <Frame title="Buchungssatz" sub="Ersatz für einen beanstandeten Satz">
      <JournalEntryFacts
        entry={entry({
          repairedFrom: {
            judgeComment: "Der Vorgänger buchte auf 6800 statt auf 6815 — Bürobedarf ist kein Porto.",
            violatedCriteria: ["Kontenrahmen", "Präzedenz"],
          },
        })}
        context={CONTEXT}
        judgeReasoning="Nach der Korrektur stimmt das Konto mit der Präzedenz des Kreditors überein."
        sources={SOURCES}
      />
    </Frame>
  ),
};

/**
 * Der Storno-Satz (B-07): er hebt einen früheren auf und nennt ihn — als Weg,
 * nicht als rohe Id. Beide Sätze bleiben stehen; der ursprüngliche trägt
 * `reversed`, dieser den Verweis. Ohne `entryHref` sagt der Hinweis, was
 * geschah, bietet aber keinen Weg.
 */
export const Reversal: Story = {
  render: () => (
    <Frame title="Buchungssatz" sub="Storno">
      <JournalEntryFacts
        entry={entry({
          journalEntryId: "je-30",
          status: "accepted",
          origin: "system_reversal",
          confidence: null,
          rationale: null,
          reversesEntryId: "je-28",
          lines: entry().lines.map((l) => ({ ...l, side: l.side === "debit" ? "credit" : "debit" })),
        })}
        entryHref={(id) => `#entry=${id}`}
      />
    </Frame>
  ),
};

/** Locked and blocked: each says what follows from it, not just that it is so. */
export const LockedAndBlocked: Story = {
  render: () => (
    <Frame title="Buchungssatz" sub="festgeschrieben und blockiert">
      <JournalEntryFacts
        entry={entry({ status: "accepted", isLocked: true, blocked: true, confidence: null, rationale: null })}
        context={{ entryKind: "Zahlung" }}
      />
    </Frame>
  ),
};

/** The edges: a split over twelve lines, a long reasoning, a seven-figure amount. */
export const Edges: Story = {
  render: () => (
    <Frame title="Buchungssatz" sub="Ränder">
      <JournalEntryFacts
        entry={entry({
          rationale:
            "Die Rechnung enthält Positionen mit 7 % und 19 % Umsatzsteuer; der Agent teilt nach Steuersatz auf und bucht die Leergutpfand-Position gesondert. Die Präzedenz des Lieferanten deckt diese Aufteilung, und die Sammelrechnung des Vormonats war ebenso geteilt — die Kanzlei hatte sie unverändert übernommen.",
          lines: [
            ...Array.from({ length: 11 }, (_, i) => ({
              side: "debit" as const,
              accountNumber: `68${15 + i}`,
              accountName: `Aufwandskonto ${i + 1}`,
              amount: 111111.11,
              taxKey: i % 2 === 0 ? "9" : null,
              taxRatePercent: i % 2 === 0 ? 19 : null,
              lineText: `Position ${i + 1}`,
              externalDocumentNumber: "RE-4471",
            })),
            {
              side: "credit" as const,
              accountNumber: "70021",
              accountName: "Bürobedarf Meier GmbH",
              amount: 1222222.21,
              taxKey: null,
              taxRatePercent: null,
              lineText: "Sammelrechnung August",
              externalDocumentNumber: "RE-4471",
            },
          ],
        })}
        context={CONTEXT}
        sources={SOURCES}
      />
    </Frame>
  ),
};

/**
 * In use: `tone="bare"` inside a card that already has its own head — this is
 * how the drawer (0177) will show it.
 */
export const InUse: Story = {
  render: () => (
    <Frame title="RE-4471 · Bürobedarf Meier GmbH" sub="Buchungssatz zum Sachverhalt SV-118">
      <JournalEntryFacts
        entry={entry({ status: "accepted" })}
        context={CONTEXT}
        sources={SOURCES}
        judgeReasoning="Keine Beanstandung."
        caseHref={caseHref}
        batchHref={batchHref}
        accountHref={(account) => `#account=${account}`}
        tone="bare"
      />
    </Frame>
  ),
};
