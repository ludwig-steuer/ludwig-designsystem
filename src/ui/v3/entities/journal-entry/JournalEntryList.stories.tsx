import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { RowAction } from "../../patterns/DataTable";
import type { MirrorEntryVM } from "../datev-mirror-entry/MirrorEntry";
import { JournalEntryList, journalEntriesByDocumentGroup } from "./JournalEntryList";
import { entryRowFromJournalEntry, entryRowFromMirror, type EntryRow } from "./journal-entry-columns";
import type { JournalEntryRowData } from "./journal-entry";

const meta: Meta<typeof JournalEntryList> = {
  title: "v3/Entitäten/Buchungssatz/JournalEntryList",
  component: JournalEntryList,
};
export default meta;
type Story = StoryObj<typeof JournalEntryList>;

type Source = JournalEntryRowData & { sourceDocId?: string | null; batch?: EntryRow["batch"] };

const source = (over: Partial<Source> & { entryId: string }): Source => ({
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
  sourceDocId: "doc-4471",
  batch: { id: "2026-0009", label: "08-2026-Ludwig" },
  ...over,
});
const entry = (over: Partial<Source> & { entryId: string }): EntryRow => entryRowFromJournalEntry(source(over));

const BATCH: EntryRow[] = [
  entry({ entryId: "b1" }),
  entry({ entryId: "b2", documentGroup: "incoming_invoices", belegfeld1: "RE-4472", amount: 89.9, sourceDocId: null }),
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
    sourceDocId: null,
  }),
];

const caseHref = (caseId: string) => `#case=${caseId}`;
const accountHref = (number: string) => `#account=${number}`;
const taxKeyHref = (taxKey: string) => `#taxKey=${taxKey}`;
const entryHref = (entryId: string) => `#entry=${entryId}`;
const documentHref = (documentId: string) => `#document=${documentId}`;
const batchHref = (batchId: string) => `#batch=${batchId}`;
const listHref = () => "#list";
const HREFS = { caseHref, accountHref, taxKeyHref, entryHref, documentHref, batchHref };

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
      without={["batch"]}
      totals={{ amount: "8.428,70 €" }}
      {...HREFS}
    />
  ),
};

/**
 * Compact — the account card „Neueste Buchungen": five rows, no pager, at
 * 600 px. Soll and Haben collapse into „Konten", the document is sign and
 * number; everything else is one click away in the entry drawer.
 */
export const Compact: Story = {
  render: () => (
    <div style={{ width: 600 }}>
      <JournalEntryList entries={BATCH} variant="compact" head={{ title: "Neueste Buchungen", sub: "auf 6815" }} {...HREFS} />
    </div>
  ),
};

const mirror = (over: Partial<MirrorEntryVM> & { id: string }): EntryRow =>
  entryRowFromMirror({
    description: "Meier Bürobedarf August 2026",
    amount: 1249.9,
    currency: "EUR",
    postingDate: "2026-08-26",
    matchState: "matched_ludwig",
    externalDocumentNumber: "RE-4471",
    sequenceId: "2026-08-003",
    lines: [
      { side: "debit", accountNumber: "6815", accountName: "Bürobedarf", amount: 1249.9, contraAccountNumber: "70021" },
      { side: "credit", accountNumber: "70021", accountName: "Bürobedarf Meier GmbH", amount: 1249.9 },
    ],
    ...over,
  });

/** DATEV's records in the same table: the state is „DATEV-Abgleich", there is no origin column. */
export const Mirror: Story = {
  render: () => (
    <JournalEntryList
      entries={[
        mirror({ id: "m1", sourceDocId: "doc-4471" } as Partial<MirrorEntryVM> & { id: string }),
        mirror({ id: "m2", matchState: "new_unprocessed", externalDocumentNumber: "8812", description: "Tankstelle Aral" }),
        mirror({
          id: "m3",
          matchState: "unclear",
          externalDocumentNumber: null,
          description: "Sammelbuchung Lohn August",
          amount: 18422.5,
          lines: [
            { side: "debit", accountNumber: "6020", accountName: "Gehälter", amount: 15200, contraAccountNumber: "3720" },
            { side: "debit", accountNumber: "6110", accountName: "Gesetzliche soziale Aufwendungen", amount: 3222.5, contraAccountNumber: "3740" },
          ],
        }),
      ]}
      source="datev"
      head={{ title: "Buchungen in DATEV", sub: "August 2026" }}
      {...HREFS}
    />
  ),
};

/** Job 2 — the bookings of a case: flat, two entries, and no case column. */
export const AtCase: Story = {
  render: () => (
    <JournalEntryList
      entries={[BATCH[0]!, BATCH[2]!]}
      head={{ title: "Buchungen", sub: "zu diesem Sachverhalt" }}
      without={["case"]}
      {...HREFS}
    />
  ),
};

/**
 * Job 3 — a bucket of the export: flat with pager and sorting, and the one row
 * action that belongs to an exported entry.
 */
export const InBucket: Story = {
  render: () => {
    const actions = (row: EntryRow): RowAction[] => [
      {
        label: "Stornieren",
        tone: "danger",
        action: async () => {},
        confirm: {
          title: `Buchung ${row.documentNumber ?? row.id} stornieren?`,
          body: "Die Buchung bleibt im Stapel stehen und bekommt einen Gegensatz. DATEV zeigt beide.",
          confirmLabel: "Stornieren",
        },
      },
    ];
    return (
      <JournalEntryList
        entries={BATCH.map((e) => ({ ...e, state: "exported" }))}
        pager={{ page: 1, pageSize: 25, totalItems: 343, totalPages: 14 }}
        sort={{ key: "date", dir: "desc" }}
        href={listHref}
        head={{ title: "Exportiert", sub: "August 2026", meta: "343 Sätze" }}
        rowActions={actions}
        without={["batch"]}
        {...HREFS}
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
        without={["case"]}
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
