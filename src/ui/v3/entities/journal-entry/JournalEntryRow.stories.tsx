import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DataTable } from "../../patterns/DataTable";
import { Card, CardHead, HeadRow, Table } from "../../primitives/Table";
import { JournalEntryRow } from "./JournalEntryRow";
import {
  journalEntryColumns,
  journalEntryTracks,
  type JournalEntryColumn,
} from "./journal-entry-columns";
import type { JournalEntryRowData } from "./journal-entry";

const meta: Meta<typeof JournalEntryRow> = {
  title: "v3/Entitäten/Buchungssatz/JournalEntryRow",
  component: JournalEntryRow,
};
export default meta;
type Story = StoryObj<typeof JournalEntryRow>;

const entry = (over: Partial<JournalEntryRowData> = {}): JournalEntryRowData => ({
  entryId: "je-4471",
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
  confidence: 0.92,
  lineCount: 2,
  documentGroup: "incoming_invoices",
  ...over,
});

const accountHref = (number: string) => `#account=${number}`;
const caseHref = (caseId: string) => `#case=${caseId}`;
const entryHref = (entryId: string) => `#entry=${entryId}`;

function ShortList({
  rows,
  columns,
  title,
  sub,
  ...ways
}: {
  rows: readonly JournalEntryRowData[];
  columns?: readonly JournalEntryColumn[];
  title: string;
  sub?: string;
  accountHref?: (n: string) => string;
  entryHref?: (id: string) => string;
}) {
  const cols = journalEntryColumns(columns ? { columns } : {});
  return (
    <Card>
      <CardHead title={title} {...(sub ? { sub } : {})} />
      <Table cols={journalEntryTracks(columns)} minWidth={1180}>
        <HeadRow>
          {cols.map((c) => (
            <span key={c.key} className={c.align === "end" ? "v2num" : undefined}>
              {c.header}
              {c.headerAside}
            </span>
          ))}
        </HeadRow>
        {rows.map((row) => (
          <JournalEntryRow
            key={row.entryId}
            entry={row}
            {...(columns ? { columns } : {})}
            {...ways}
          />
        ))}
      </Table>
    </Card>
  );
}

/**
 * The full row: date, document number 1, booking text, the two accounts, tax
 * key, amount, the way to DATEV and the origin with its confidence.
 */
export const Filled: Story = {
  render: () => <ShortList title="Buchungen" sub="Stapel 2026-08-001" rows={[entry()]} />,
};

/**
 * The five values of `journal_entry_datev_stage` — derived, never read off
 * `status`: exported counts once the export happened, „in DATEV" once the
 * mirror found it again.
 */
export const Stages: Story = {
  render: () => (
    <ShortList
      title="Weg nach DATEV"
      rows={[
        entry({ entryId: "s1", status: "proposed" }),
        entry({ entryId: "s2", status: "accepted" }),
        entry({ entryId: "s3", status: "accepted", exportedAt: "2026-09-01T08:00:00Z" }),
        entry({
          entryId: "s4",
          status: "accepted",
          exportedAt: "2026-09-01T08:00:00Z",
          datevMirrorEntryId: "dm-1",
        }),
        entry({ entryId: "s5", status: "reversed" }),
      ]}
    />
  ),
};

/**
 * The four origins. Only a proposal carries a confidence; an entry imported
 * from the client's batch has none — and shows none instead of a zero.
 */
export const Origins: Story = {
  render: () => (
    <ShortList
      title="Herkunft"
      rows={[
        entry({ entryId: "o1", origin: "ai_proposed", confidence: 0.92 }),
        entry({ entryId: "o2", origin: "recurring_rule", confidence: null }),
        entry({ entryId: "o3", origin: "manual", confidence: null }),
        entry({ entryId: "o4", origin: "client_import", confidence: null, status: "accepted" }),
      ]}
    />
  ),
};

/** The same cells in `DataTable`, with the case column and its way. */
export const Columns: Story = {
  render: () => (
    <DataTable
      columns={journalEntryColumns({
        columns: [
          "bookingDate",
          "belegfeld1",
          "bookingText",
          "accounts",
          "amount",
          "datevStage",
          "origin",
          "case",
        ],
        accountHref,
        caseHref,
      })}
      rows={[entry(), entry({ entryId: "je-4472", caseId: null, caseNumber: null, origin: "client_import", confidence: null })]}
      rowKey={(e) => e.entryId}
      head={{ title: "Inhalt des Stapels", sub: "Eingangsrechnungen" }}
      empty={{ title: "Der Stapel ist leer." }}
      minWidth={1180}
    />
  ),
};

/**
 * The edges: a booking text of 124 characters (cut at 60, the whole one in the
 * `title`), an entry with five lines — where „A an B" would be wrong, the cell
 * counts —, a missing document number 1 and a seven-figure amount.
 */
export const Edges: Story = {
  render: () => (
    <ShortList
      title="Ränder"
      rows={[
        entry({
          entryId: "e1",
          buchungstext:
            "Wartung und Instandhaltung der Produktionsanlage Halle 2 einschließlich Ersatzteilen laut Rahmenvertrag, Abrechnung August",
        }),
        entry({ entryId: "e2", lineCount: 5, belegfeld1: null, amount: 1234567.89 }),
      ]}
    />
  ),
};

/**
 * In use: the entries of a case, in a card, with the way to the account drawer
 * and into the entry itself — the whole row is the link.
 */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 1100 }}>
      <ShortList
        title="Buchungen"
        sub="zu diesem Sachverhalt"
        columns={["bookingDate", "belegfeld1", "bookingText", "accounts", "amount", "datevStage", "origin"]}
        rows={[
          entry(),
          entry({ entryId: "je-4473", bookingDate: "2026-08-30", amount: 1249.9, origin: "manual", confidence: null, status: "accepted", debitAccountNumber: "70021", debitAccountName: "Bürobedarf Meier GmbH", creditAccountNumber: "1200", creditAccountName: "Bank", buchungstext: "Zahlung Meier August", belegfeld1: "RE-4471", vatKey: null, vatRatePercent: null }),
        ]}
        accountHref={accountHref}
        entryHref={entryHref}
      />
    </div>
  ),
};
