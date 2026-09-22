import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { RowAction } from "../../patterns/DataTable";
import { JournalEntryList, journalEntriesByDocumentGroup } from "./JournalEntryList";
import type { JournalEntryRowData } from "./journal-entry";

const meta: Meta<typeof JournalEntryList> = {
  title: "v3/Entitäten/Buchungssatz/JournalEntryList",
  component: JournalEntryList,
};
export default meta;
type Story = StoryObj<typeof JournalEntryList>;

const entry = (over: Partial<JournalEntryRowData> & { entryId: string }): JournalEntryRowData => ({
  clientId: "c-1",
  cycleId: "cy-2026-08",
  bookingDate: "2026-08-26",
  amount: 1249.9,
  currency: "EUR",
  debitAccountNumber: "6815",
  debitAccountName: "Bürobedarf",
  creditAccountNumber: "70021",
  creditAccountName: "Bürobedarf Meier GmbH",
  vatKey: "9",
  vatRatePercent: 19,
  belegfeld1: "RE-4471",
  buchungstext: "Meier Bürobedarf August 2026",
  origin: "ai_proposed",
  status: "proposed",
  exportedAt: null,
  datevMirrorEntryId: null,
  isLocked: false,
  caseId: "case-118",
  caseNumber: "SV-118",
  caseFiscalYear: 2026,
  caseTitle: "Eingangsrechnung Bürobedarf Meier GmbH",
  confidence: 0.92,
  lineCount: 2,
  documentGroup: "incoming_invoices",
  ...over,
});

const BATCH: JournalEntryRowData[] = [
  entry({ entryId: "b1" }),
  entry({ entryId: "b2", documentGroup: "incoming_invoices", belegfeld1: "RE-4472", amount: 89.9 }),
  entry({
    entryId: "b3",
    documentGroup: "bank",
    buchungstext: "Zahlung Meier August",
    debitAccountNumber: "70021",
    debitAccountName: "Bürobedarf Meier GmbH",
    creditAccountNumber: "1200",
    creditAccountName: "Bank",
    origin: "recurring_rule",
    confidence: null,
    status: "accepted",
  }),
  entry({
    entryId: "b4",
    documentGroup: "outgoing_invoices",
    buchungstext: "Ausgangsrechnung Musterbau",
    belegfeld1: "AR-2026-118",
    amount: 5400,
    origin: "manual",
    confidence: null,
  }),
  entry({
    entryId: "b5",
    documentGroup: null,
    buchungstext: "Umbuchung Verrechnungskonto",
    belegfeld1: null,
    origin: "client_import",
    confidence: null,
    status: "accepted",
    caseId: null,
    caseNumber: null,
  }),
];

const caseHref = (caseId: string) => `#case=${caseId}`;
const accountHref = (number: string) => `#account=${number}`;
const taxKeyHref = (taxKey: string) => `#taxKey=${taxKey}`;
const entryHref = (entryId: string) => `#entry=${entryId}`;
const listHref = () => "#list";

const CASE_COLUMNS = [
  "bookingDate",
  "belegfeld1",
  "bookingText",
  "accounts",
  "amount",
  "datevStage",
  "origin",
] as const;

/**
 * Job 1 — the content of a batch: one section per document group, in the order
 * the batch is filed in, each with its count. Entries without a group come
 * last. The whole row leads into the entry.
 */
export const InBatch: Story = {
  render: () => (
    <JournalEntryList
      groups={journalEntriesByDocumentGroup(BATCH)}
      head={{ title: "Inhalt des Stapels", sub: "2026-08-001", meta: "5 Sätze" }}
      columns={[
        "bookingDate",
        "belegfeld1",
        "bookingText",
        "accounts",
        "amount",
        "datevStage",
        "origin",
        "case",
      ]}
      caseHref={caseHref}
      accountHref={accountHref}
      entryHref={entryHref}
    />
  ),
};

/** Job 2 — the bookings of a case: flat, two entries, and no case column. */
export const AtCase: Story = {
  render: () => (
    <JournalEntryList
      entries={[BATCH[0]!, BATCH[2]!]}
      head={{ title: "Buchungen", sub: "zu diesem Sachverhalt" }}
      columns={CASE_COLUMNS}
      accountHref={accountHref}
      entryHref={entryHref}
    />
  ),
};

/**
 * Job 3 — a bucket of the export: flat with pager and sorting, and the one row
 * action that belongs to an exported entry.
 */
export const InBucket: Story = {
  render: () => {
    const actions = (row: JournalEntryRowData): RowAction[] => [
      {
        label: "Stornieren",
        tone: "danger",
        action: async () => {},
        confirm: {
          title: `Buchung ${row.belegfeld1 ?? row.entryId} stornieren?`,
          body: "Die Buchung bleibt im Stapel stehen und bekommt einen Gegensatz. DATEV zeigt beide.",
          confirmLabel: "Stornieren",
        },
      },
    ];
    return (
      <JournalEntryList
        entries={BATCH.map((e) => ({ ...e, status: "accepted", exportedAt: "2026-09-01T08:00:00Z" }))}
        pager={{ page: 1, pageSize: 25, totalItems: 343, totalPages: 14 }}
        sort={{ key: "bookingDate", dir: "desc" }}
        href={listHref}
        head={{ title: "Exportiert", sub: "August 2026", meta: "343 Sätze" }}
        rowActions={actions}
        caseHref={caseHref}
        accountHref={accountHref}
        taxKeyHref={taxKeyHref}
      />
    );
  },
};

/**
 * The three empty cases say three different things: an empty batch is a
 * question, a case without bookings is normal, and an empty „exportierbar" is
 * a success — that one carries `done`.
 */
export const Empty: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 24 }}>
      <JournalEntryList
        entries={[]}
        head={{ title: "Inhalt des Stapels", sub: "2026-09-001" }}
        empty={{ title: "Der Stapel ist leer.", description: "Der Buchungslauf hat für diesen Zeitraum noch nichts gebucht." }}
      />
      <JournalEntryList
        entries={[]}
        head={{ title: "Buchungen", sub: "zu diesem Sachverhalt" }}
        columns={CASE_COLUMNS}
        empty={{ title: "Noch keine Buchung." }}
      />
      <JournalEntryList
        entries={[]}
        head={{ title: "Exportierbar", sub: "August 2026" }}
        empty={{ title: "Nichts exportierbar.", description: "Alle freigegebenen Sätze sind übergeben.", done: true }}
      />
    </div>
  ),
};

/** Empty **after** a filter: what is filtered, and the way back (T6). */
export const Filtered: Story = {
  render: () => (
    <JournalEntryList
      entries={[]}
      head={{ title: "Inhalt des Stapels", sub: "2026-08-001" }}
      filtered={{ summary: "Herkunft: manuell · Weg nach DATEV: storniert", resetHref: "#reset" }}
      empty={{ title: "Kein Satz passt zu diesem Filter." }}
    />
  ),
};

/** Loading keeps head and column head in place; the error offers a way on (I7). */
export const LoadingAndError: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 24 }}>
      <JournalEntryList entries={[]} head={{ title: "Inhalt des Stapels", sub: "lädt" }} loading />
      <JournalEntryList
        entries={[]}
        head={{ title: "Inhalt des Stapels", sub: "2026-08-001" }}
        error={{ message: "Die Sätze des Stapels konnten nicht geladen werden." }}
      />
    </div>
  ),
};
