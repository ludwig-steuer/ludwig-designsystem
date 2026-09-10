"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Button } from "../../primitives/Button";
import { Card, CardHead, HeadRow, Row, Table } from "../../primitives/Table";
import { TextButton } from "../../primitives/TextButton";
import { AccountCell } from "./Account";
import type { AccountFactsVM } from "./Account";
import { AccountDrawer } from "./AccountDrawer";
import type { AccountEntry } from "./AccountEntries";

const meta: Meta<typeof AccountDrawer> = {
  title: "v3/Entitäten/Konto/AccountDrawer",
  component: AccountDrawer,
};
export default meta;
type Story = StoryObj<typeof AccountDrawer>;

const FACTS: AccountFactsVM = {
  accountNumber: "1210",
  accountName: "Commerzbank",
  accountingRole: "general_ledger",
  fiscalYear: 2026,
  currency: "EUR",
  datevBalance: 184220.15,
  datevEntryCount: 2937,
  ludwigEntryCount: 41,
  openProposalCount: 2,
  usageBookingCount: 3_412,
  // Der Drawer lädt keine Monatswerte — deshalb stehen hier zwei Nullen,
  // und deshalb zeigt der Block die Zeile „Σ Soll / Σ Haben" dort nicht.
  totalDebit: 0,
  totalCredit: 0,
  ludwigOnlyCount: 4,
  ludwigOnlyAmount: 1475.6,
  lastBookingDate: "2026-08-31",
  syncState: "synced",
};

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
  },
];

const YEARS = [2024, 2025, 2026];

/** The round trip: closing, switching the year, loading more, opening the full view. */
export const Opened: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    const [year, setYear] = useState(2026);
    const [shown, setShown] = useState(2);
    const [log, setLog] = useState<string[]>([]);
    const note = (s: string) => setLog((l) => [s, ...l].slice(0, 4));

    return (
      <div style={{ minHeight: 620 }}>
        <Button onClick={() => setOpen(true)}>Konto 1210 ansehen</Button>
        <ul className="v2sub" style={{ marginTop: "var(--space-3)" }}>
          {log.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
        <AccountDrawer
          open={open}
          onClose={() => {
            setOpen(false);
            note("onClose");
          }}
          accountNumber="1210"
          facts={{ ...FACTS, fiscalYear: year }}
          entries={ENTRIES.slice(0, shown)}
          total={2937}
          onShowMore={() => {
            setShown((s) => s + 2);
            note("onShowMore");
          }}
          year={year}
          years={YEARS}
          onYearChange={(y) => {
            setYear(y);
            // A year change is a new question, not more of the same page.
            setShown(2);
            note(`onYearChange → ${y}`);
          }}
          onOpenFull={() => note("onOpenFull — /clients/…/2026/accounts/1210")}
          accountHref={(n) => `?account=${n}`}
        />
      </div>
    );
  },
};

/**
 * Loading: the surface has the shape of the content — a facts block and rows
 * with the column head in place. Title and year stay, the footer is empty and
 * therefore invisible.
 */
export const Loading: Story = {
  render: () => (
    <div style={{ minHeight: 620 }}>
      <AccountDrawer
        open
        onClose={() => {}}
        accountNumber="1210"
        facts={null}
        entries={[]}
        year={2026}
        years={YEARS}
        onYearChange={() => {}}
        onOpenFull={() => {}}
        loading
      />
    </div>
  ),
};

/** Loading failed — not the same as empty (V9). The footer stays empty. */
export const Error: Story = {
  render: () => (
    <div style={{ minHeight: 620 }}>
      <AccountDrawer
        open
        onClose={() => {}}
        accountNumber="1210"
        facts={null}
        entries={[]}
        year={2026}
        years={YEARS}
        onYearChange={() => {}}
        onOpenFull={() => {}}
        error="Zeitüberschreitung beim Laden des DATEV-Spiegels."
      />
    </div>
  ),
};

/**
 * The chart of accounts is a full copy per fiscal year (GLOSSARY F64), so an
 * account can exist in 2026 and not in 2024. The year switch stays usable —
 * it is the way out.
 */
export const NotFound: Story = {
  render: () => {
    const [year, setYear] = useState(2024);
    return (
      <div style={{ minHeight: 620 }}>
        <AccountDrawer
          open
          onClose={() => {}}
          accountNumber="1210"
          facts={year === 2024 ? null : { ...FACTS, fiscalYear: year }}
          entries={year === 2024 ? [] : ENTRIES}
          year={year}
          years={YEARS}
          onYearChange={setYear}
          onOpenFull={() => {}}
        />
      </div>
    );
  },
};

/** One fiscal year: no switch, the year stands as text in the meta line. */
export const OneYear: Story = {
  render: () => (
    <div style={{ minHeight: 620 }}>
      <AccountDrawer
        open
        onClose={() => {}}
        accountNumber="70032"
        facts={{
          ...FACTS,
          accountNumber: "70032",
          accountName: "Musterfirma GmbH",
          accountingRole: "creditor",
          partnerName: "Musterfirma GmbH",
          datevBalance: -8940.5,
          datevEntryCount: 27,
          ludwigOnlyCount: 0,
          ludwigOnlyAmount: null,
        }}
        entries={ENTRIES.slice(0, 2)}
        year={2026}
        years={[2026]}
        onYearChange={() => {}}
        onOpenFull={() => {}}
      />
    </div>
  ),
};

/**
 * As on the page: the drawer opens over a booking table, the table stays
 * visible behind it, and a click on a contra account **replaces** the content
 * — no second drawer stacks on top.
 */
export const InContext: Story = {
  render: () => {
    const [account, setAccount] = useState<string | null>(null);
    const [year, setYear] = useState(2026);
    return (
      <div style={{ minHeight: 620 }}>
        <Card>
          <CardHead title="Buchungen des Sachverhalts SV-2026-0311" />
          <Table cols="96px minmax(0, 1.4fr) minmax(0, 1fr)" minWidth={520}>
            <HeadRow>
              <span>Datum</span>
              <span>Buchungstext</span>
              <span>Konto</span>
            </HeadRow>
            <Row>
              <span>31.08.2026</span>
              <span>Reparatur März</span>
              <span>
                <AccountCell number="1210" name="Commerzbank" />{" "}
                <TextButton onClick={() => setAccount("1210")}>ansehen</TextButton>
              </span>
            </Row>
            <Row>
              <span>30.08.2026</span>
              <span>Miete August</span>
              <span>
                <AccountCell number="4210" name="Miete" />{" "}
                <TextButton onClick={() => setAccount("4210")}>ansehen</TextButton>
              </span>
            </Row>
          </Table>
        </Card>
        {account ? (
          <AccountDrawer
            open
            onClose={() => setAccount(null)}
            accountNumber={account}
            facts={{
              ...FACTS,
              accountNumber: account,
              accountName: account === "1210" ? "Commerzbank" : "Miete",
              fiscalYear: year,
            }}
            entries={ENTRIES}
            total={2937}
            year={year}
            years={YEARS}
            // A real switch, not a dead handler: the drawer changes, the
            // table behind it keeps its year, its rows and its scroll.
            onYearChange={setYear}
            onOpenFull={() => {}}
            // The contra accounts are links to the search param the app's
            // UrlDrawer reads (L3) — in Storybook nothing routes, so the
            // account swap is shown through the table instead: a click on the
            // second row replaces the content of **this** drawer, no second
            // one stacks on top.
            accountHref={undefined}
          />
        ) : null}
      </div>
    );
  },
};
