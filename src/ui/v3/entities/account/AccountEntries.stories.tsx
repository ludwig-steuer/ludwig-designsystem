"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Button } from "../../primitives/Button";
import { Drawer } from "../../primitives/Drawer";
import { TextButton } from "../../primitives/TextButton";
import { DataTable } from "../../patterns/DataTable";
import {
  AccountEntryList,
  accountEntryColumns,
  type AccountEntry,
} from "./AccountEntries";

const meta: Meta<typeof AccountEntryList> = {
  title: "v3/Entitäten/Konto/AccountEntries",
  component: AccountEntryList,
};
export default meta;
type Story = StoryObj<typeof AccountEntryList>;

/** All four origins, so the rule for the mark is visible in one look. */
const ENTRIES: AccountEntry[] = [
  {
    id: "e1",
    postingDate: "2026-08-31",
    documentNumber: "RE-4471",
    text: "Reparatur März",
    contraAccounts: [{ number: "4400", name: "Erlöse 19 % USt" }],
    debit: 1475.6,
    credit: null,
    origin: "datev",
    batchId: "2026-08-A",
    markOfOrigin: "RE",
  },
  {
    id: "e2",
    postingDate: "2026-08-30",
    documentNumber: "RE-4470",
    text: "Miete August",
    contraAccounts: [{ number: "4210", name: "Miete" }],
    debit: null,
    credit: 890.0,
    origin: "mirrored",
    batchId: "2026-08-A",
    status: "posted",
    markOfOrigin: "WK",
  },
  {
    id: "e3",
    postingDate: "2026-08-29",
    documentNumber: "RE-4469",
    text: "Telekom Februar",
    contraAccounts: [{ number: "6805", name: "Telefon" }],
    debit: 89.0,
    credit: null,
    origin: "exported",
    batchId: "2026-08-B",
    status: "accepted",
  },
  {
    id: "e4",
    postingDate: "2026-08-28",
    documentNumber: "RE-4468",
    text: "Bürobedarf",
    contraAccounts: [{ number: "6815", name: "Bürobedarf" }],
    debit: 145.0,
    credit: null,
    origin: "ludwig",
    status: "proposed",
  },
  {
    id: "e5",
    postingDate: "2026-08-27",
    documentNumber: "AR-2026-118",
    text: "Sammelrechnung",
    contraAccounts: [
      { number: "4400", name: "Erlöse 19 % USt" },
      { number: "4300", name: "Erlöse 7 % USt" },
      { number: "4830", name: "Sonstige Erlöse" },
    ],
    debit: null,
    credit: 2380.4,
    origin: "datev",
    batchId: "2026-08-A",
    caseNumber: "SV-2026-0311",
    markOfOrigin: "SV",
  },
  {
    id: "e6",
    postingDate: "2026-08-26",
    documentNumber: "EB-2026",
    text: "Saldenvortrag",
    contraAccounts: [{ number: "9000", name: "Saldenvorträge Sachkonten" }],
    debit: 92140.55,
    credit: null,
    origin: "datev",
    batchId: "2026-01-EB",
    markOfOrigin: "JA",
  },
];

/**
 * Six movements of account 1210, all four origins present. The 98 % normal
 * case — „nur in DATEV" — carries no mark at all; only the rows with a Ludwig
 * entry behind them do, and the one that was exported but never arrived gets
 * the real chip.
 */
export const Filled: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <AccountEntryList entries={ENTRIES} currency="EUR" accountHref={(n) => `?account=${n}`} />
    </div>
  ),
};

/**
 * The same rows through both variants. `compact` has seven columns for the
 * drawer, `full` adds batch, booking state and DATEV mark for the page —
 * and neither of them carries a running balance: over two sources it would
 * mix what is booked with what is not there yet (Owner 2026-09-04). With one
 * source it comes back — `Balance`.
 */
export const Variants: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-6)" }}>
      <div style={{ maxWidth: 720 }}>
        <div className="v2sub">compact — sieben Spalten, für den Drawer</div>
        <AccountEntryList entries={ENTRIES} currency="EUR" />
      </div>
      <div>
        <div className="v2sub">full — zehn Spalten, für die Seite</div>
        <DataTable
          rows={ENTRIES}
          columns={accountEntryColumns({ currency: "EUR", variant: "full" })}
          rowKey={(e) => e.id}
          head={{ title: "Konto 1210 · Bewegungen 2026" }}
          density="compact"
          minWidth={1080}
        />
      </div>
    </div>
  ),
};

/**
 * The running balance, back **with one source** (0157): filtered to the DATEV
 * side it is the balance in DATEV after each movement. The page turns the
 * column on; the list draws what it is given.
 */
export const Balance: Story = {
  render: () => {
    const datevSide = ENTRIES.filter((e) => e.origin === "datev" || e.origin === "mirrored");
    // Oldest first to sum up, newest first to show.
    let running = 0;
    const rows = [...datevSide]
      .reverse()
      .map((e) => {
        running = Math.round((running + (e.debit ?? 0) - (e.credit ?? 0)) * 100) / 100;
        return { ...e, runningBalance: running };
      })
      .reverse();
    return (
      <DataTable
        rows={rows}
        columns={accountEntryColumns({ currency: "EUR", variant: "full", balance: true })}
        rowKey={(e) => e.id}
        head={{ title: "Konto 1210 · Bewegungen 2026", sub: "Herkunft: DATEV" }}
        density="compact"
      />
    );
  },
};

/** „Mehr laden" with the stock counter — the bank account has 2.937 movements. */
export const LoadMore: Story = {
  render: () => {
    const [shown, setShown] = useState(3);
    return (
      <div style={{ maxWidth: 720 }}>
        <AccountEntryList
          entries={ENTRIES.slice(0, shown)}
          currency="EUR"
          total={2937}
          more={
            <Button size="sm" variant="secondary" onClick={() => setShown((s) => s + 3)}>
              Mehr laden
            </Button>
          }
        />
      </div>
    );
  },
};

/**
 * Nothing booked. That is a finding, not a filter problem (T6) — so the text
 * names the year and offers no button: the list is read-only.
 */
export const Empty: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <AccountEntryList
        entries={[]}
        currency="EUR"
        empty={{ title: "Auf diesem Konto ist im Wirtschaftsjahr 2026 nichts gebucht." }}
      />
    </div>
  ),
};

/** Loading: rows in the shape of the content, the column head stays in place. */
export const Loading: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <AccountEntryList entries={[]} currency="EUR" loading />
    </div>
  ),
};

/** Loading failed — that is not the same as empty (V9). */
export const Error: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <AccountEntryList
        entries={[]}
        currency="EUR"
        error={{
          message: "Der Konto-Auszug für 1210 konnte nicht geladen werden: Zeitüberschreitung.",
          retry: <TextButton onClick={() => {}}>Erneut versuchen</TextButton>,
        }}
      />
    </div>
  ),
};

/**
 * The proof for A11: **one** column source, two brackets. Above the same
 * columns inside a `Drawer` (as 0068 uses them), below inside `DataTable`
 * with its pager. Nothing is defined twice.
 */
export const InUse: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div style={{ display: "grid", gap: "var(--space-6)", minHeight: 520 }}>
        <div>
          <Button onClick={() => setOpen(true)}>Konto 1210 ansehen</Button>
        </div>
        <DataTable
          rows={ENTRIES}
          columns={accountEntryColumns({ currency: "EUR", variant: "full" })}
          rowKey={(e) => e.id}
          head={{ title: "Konto 1210 · Bewegungen 2026", meta: "2.937 Bewegungen" }}
          density="compact"
          minWidth={1080}
          pager={{ page: 1, pageSize: 25, totalItems: 2937, totalPages: 118 }}
          href={(p) => `?page=${p.page ?? 1}`}
        />
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          title="Konto 1210"
          meta="Commerzbank · Sachkonto · 2.937 in DATEV, 4 nur in Ludwig"
          size="lg"
        >
          <AccountEntryList
            entries={ENTRIES}
            currency="EUR"
            total={2937}
            accountHref={(n) => `?account=${n}`}
            more={
              <Button size="sm" variant="secondary" onClick={() => {}}>
                Mehr laden
              </Button>
            }
          />
        </Drawer>
      </div>
    );
  },
};

/**
 * The edges: a 60-character posting text, four contra accounts („+3"),
 * `0,00 €` as a real value, a negative amount, the leading zero of `0420`,
 * and an entry without document number and without text.
 */
export const Edges: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <AccountEntryList
        currency="EUR"
        entries={[
          {
            id: "x1",
            postingDate: "2026-08-31",
            documentNumber: "RE-4471-2026-08-31-KORREKTUR",
            text: "Korrektur der doppelt erfassten Position aus dem Vormonat",
            contraAccounts: [
              { number: "0420", name: "Betriebs- und Geschäftsausstattung, geringwertig" },
              { number: "1576", name: "Vorsteuer 19 %" },
              { number: "6815", name: "Bürobedarf" },
              { number: "4400", name: "Erlöse 19 % USt" },
            ],
            debit: 0,
            credit: null,
            origin: "ludwig",
          },
          {
            id: "x2",
            postingDate: "2026-08-30",
            documentNumber: null,
            text: null,
            contraAccounts: [],
            debit: null,
            credit: -19.0,
            origin: "datev",
          },
        ]}
      />
    </div>
  ),
};
