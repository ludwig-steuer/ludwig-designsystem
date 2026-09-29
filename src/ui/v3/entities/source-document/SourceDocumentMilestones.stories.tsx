import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  SourceDocumentMilestones,
  type DocumentMilestone,
  type MilestoneEntry,
  type UpcomingMilestone,
} from "./SourceDocumentMilestones";

const meta: Meta<typeof SourceDocumentMilestones> = {
  title: "v3/Entitäten/Beleg/SourceDocumentMilestones",
  component: SourceDocumentMilestones,
  decorators: [(Story) => <div style={{ width: 380 }}>{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof SourceDocumentMilestones>;

const accountHref = (n: string) => `#account=${n}`;

// Staging, client Willems 10160 — document f5d0155c (MAGURA, 51,35 €).
const MAGURA_ENTRY: MilestoneEntry = {
  key: "je-1",
  date: "2026-08-07",
  currency: "EUR",
  stage: "accepted",
  lines: [
    { side: "debit", accountNumber: "5404", accountName: "WE Fahrrad Ersatzteile 19% Vorsteuer", amount: 51.35 },
    { side: "credit", accountNumber: "71202", accountName: "MAGURA", amount: 51.35 },
  ],
};

const CASE: DocumentMilestone = {
  kind: "case",
  at: "2026-09-24",
  href: "#case=2026-0656",
  case: {
    caseId: "c-0656",
    caseNumber: "SV-2026-0656",
    fiscalYear: 2026,
    title: "MAGURA Rechnung 93874967",
    kind: "incoming_invoice",
    counterpartyName: "MAGURA",
    lifecycleStatus: "closed_accepted",
  },
};

const DONE: DocumentMilestone[] = [
  { kind: "done", at: "2026-09-24", via: "booking", reason: "Buchung erzeugt" },
  CASE,
  { kind: "entries", at: "2026-09-24", entries: [MAGURA_ENTRY] },
  { kind: "batch", at: "2026-09-25", batches: [{ key: "2026-0004", label: "08-2026-Ludwig", status: "review", href: "#batch=2026-0004" }] },
];

const AHEAD_EXPORT: UpcomingMilestone[] = [{ key: "export", label: "An DATEV übergeben" }];

/** A: done and booked, in the batch, not yet exported (MAGURA). */
export const Done: Story = {
  args: { milestones: DONE, upcoming: AHEAD_EXPORT, href: "#tab=history", accountHref },
};

/** B: nothing has happened yet — the usual way of an invoice, with the reason it waits (BICO, 689,03 €). */
export const NotStarted: Story = {
  args: {
    milestones: [],
    pathLabel: "Weg einer Rechnung",
    href: "#tab=history",
    upcoming: [
      { key: "case", label: "Sachverhalt zuordnen" },
      { key: "entries", label: "Buchen" },
      {
        key: "batch",
        label: "Stapel zuordnen",
        note: { level: "warning", text: "Das Rechnungsdatum 04.09.2026 liegt in keinem offenen Stapel. Der Beleg wartet auf den September-Stapel." },
      },
      { key: "export", label: "An DATEV übergeben" },
    ],
  },
};

/** Part reached, part ahead: assigned and booked, batch and export still to come. */
export const Mixed: Story = {
  args: {
    milestones: [CASE, { kind: "entries", at: "2026-09-24", entries: [{ ...MAGURA_ENTRY, stage: "proposed" }] }],
    upcoming: [{ key: "batch", label: "Stapel zuordnen" }, ...AHEAD_EXPORT],
    href: "#tab=history",
    accountHref,
  },
};

/** Handed over; the DUO filing failed — sign, word and message, the path under it. */
export const FilingFailed: Story = {
  args: {
    milestones: [
      ...DONE.slice(0, 3),
      { kind: "batch", at: "2026-09-25", batches: [{ key: "2026-0004", label: "08-2026-Ludwig", status: "mirrored", href: "#batch=2026-0004" }] },
      {
        kind: "export",
        at: "2026-09-26",
        filing: {
          status: "failed",
          message: "Der Ablageort ist im DUO-Werkzeug nicht erreichbar.",
          path: "DUO/10160/2026/08/Eingangsrechnungen/MAGURA_93874967.pdf",
        },
      },
    ],
    href: "#tab=history",
    accountHref,
  },
};

/** Five entries on one document: three stand, the rest is a way into the tab. */
export const ManyEntries: Story = {
  args: {
    milestones: [
      {
        kind: "entries",
        at: "2026-09-24",
        moreHref: "#tab=entries",
        entries: [1, 2, 3, 4, 5].map((i) => ({
          ...MAGURA_ENTRY,
          key: `je-${i}`,
          lines: MAGURA_ENTRY.lines.map((l) => ({ ...l, amount: 1234.56 * i })),
        })),
      },
    ],
    href: "#tab=history",
    accountHref,
  },
};

// Staging, Willems 10160 — statement 17a577a8, Münchner Bank.
const STATEMENT_IMPORT: DocumentMilestone = {
  kind: "import",
  at: "2026-09-09",
  account: { name: "Münchner Bank 107555539", iban: "DE30701900000107555539", href: "#payment-account=107555539" },
  period: { from: "2026-07-01", to: "2026-07-31" },
  balance: { opening: 53125.09, closing: 56666.67, currency: "EUR" },
  count: 145,
};

/** A statement: done by import, 144 of 145 transactions booked, all in one batch — counts, not entry lines. */
export const Statement: Story = {
  args: {
    milestones: [
      { kind: "done", at: "2026-09-09", via: "import", reason: null },
      STATEMENT_IMPORT,
      { kind: "transactions", booked: 144, total: 145, openHref: "#transactions=open" },
      { kind: "batch", batches: [{ key: "2026-0003", label: "07-2026-Ludwig", status: "confirmed", href: "#batch=2026-0003", count: 144 }] },
    ],
    upcoming: [{ key: "export", label: "An DATEV übergeben" }],
    href: "#tab=history",
  },
};

/** A statement imported with the check overridden, transactions in two batches. */
export const StatementOverridden: Story = {
  args: {
    milestones: [
      { ...STATEMENT_IMPORT, verification: { label: "Nur zeilengeprüft — die Saldenkette wurde übersteuert", level: "warning" } } as DocumentMilestone,
      { kind: "transactions", booked: 145, total: 145 },
      {
        kind: "batch",
        batches: [
          { key: "2026-0003", label: "07-2026-Ludwig", status: "confirmed", href: "#batch=2026-0003", count: 131 },
          { key: "2026-0004", label: "08-2026-Ludwig", status: "review", href: "#batch=2026-0004", count: 14 },
        ],
      },
    ],
    href: "#tab=history",
  },
};

/** A statement nothing has happened to — the way of a statement, the account missing. */
export const StatementNotStarted: Story = {
  args: {
    milestones: [],
    pathLabel: "Weg eines Kontoauszugs",
    href: "#tab=history",
    upcoming: [
      { key: "account", label: "Zahlungskonto bestimmen", note: { level: "warning", text: "Zu dieser IBAN ist kein Zahlungskonto angelegt." } },
      { key: "check", label: "Prüfen" },
      { key: "import", label: "Umsätze einlesen" },
      { key: "transactions", label: "Umsätze buchen" },
      { key: "batch", label: "Stapel zuordnen" },
      { key: "export", label: "An DATEV übergeben" },
    ],
  },
};

/** Nothing reached and no usual way known. */
export const Empty: Story = { args: { milestones: [], href: "#tab=history" } };

export const Loading: Story = { args: { milestones: [], loading: true, href: "#tab=history" } };

export const Error: Story = { args: { milestones: [], error: { onRetry: () => {} }, href: "#tab=history" } };
