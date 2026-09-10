import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { HoverCard } from "../../primitives/Popover";
import { Card, CardHead, HeadRow, Row, Table } from "../../primitives/Table";
import { AccountCell, AccountFacts, type AccountFactsVM } from "./Account";

/**
 * Every story shows both exports one below the other: what fits into a
 * foreign row, and what the facts add.
 */
const meta: Meta<typeof AccountFacts> = {
  title: "v3/Entitäten/Konto/Account",
  component: AccountFacts,
};
export default meta;
type Story = StoryObj<typeof AccountFacts>;

const BANK: AccountFactsVM = {
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
  totalDebit: 0,
  totalCredit: 0,
  ludwigOnlyCount: 4,
  ludwigOnlyAmount: 1475.6,
  lastBookingDate: "2026-08-31",
  syncState: "synced",
};

function Pair({
  facts,
  cell,
}: {
  facts: AccountFactsVM;
  cell: { number: string; name?: string | null };
}) {
  return (
    <div style={{ maxWidth: 520, display: "grid", gap: "var(--space-5)" }}>
      <div>
        <div className="v2sub">AccountCell</div>
        <AccountCell number={cell.number} name={cell.name} />
      </div>
      <div>
        <div className="v2sub">AccountFacts</div>
        <AccountFacts facts={facts} />
      </div>
    </div>
  );
}

/** The normal case: a bank account with 2.937 movements, four of them only in Ludwig. */
export const Filled: Story = {
  render: () => <Pair facts={BANK} cell={{ number: "1210", name: "Commerzbank" }} />,
};

/**
 * The master-data set for the side column of the account page (0157): the
 * tiles above it carry balance, delta and last booking, so this block does
 * not say them a second time.
 */
export const WithoutFigures: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <AccountFacts
        facts={{
          ...BANK,
          totalDebit: 612_004.2,
          totalCredit: 427_784.05,
          skrClassLabel: "Finanz- und Privatkonten",
        }}
        figures={false}
      />
    </div>
  ),
};

/**
 * A freshly imported account knows almost nothing. Missing values keep their
 * row and show the em dash — the reader sees *that* the balance is unknown,
 * not a list that silently got shorter.
 */
export const Incomplete: Story = {
  render: () => (
    <Pair
      facts={{
        ...BANK,
        accountName: null,
        datevBalance: null,
        datevEntryCount: 0,
        ludwigOnlyCount: 0,
        ludwigOnlyAmount: null,
        lastBookingDate: null,
      }}
      cell={{ number: "1210", name: null }}
    />
  ),
};

/** A creditor account: the partner row appears, the chip changes. */
export const PersonalAccount: Story = {
  render: () => (
    <Pair
      facts={{
        ...BANK,
        accountNumber: "70032",
        accountName: "Musterfirma GmbH",
        accountingRole: "creditor",
        datevBalance: -8940.5,
        datevEntryCount: 27,
        ludwigOnlyCount: 2,
        ludwigOnlyAmount: 1190.0,
        partnerName: "Musterfirma GmbH",
      }}
      cell={{ number: "70032", name: "Musterfirma GmbH" }}
    />
  ),
};

/**
 * Everything Ludwig booked has arrived in DATEV. The follow-up row is **gone**
 * — not „0 nur in Ludwig", which would be a question without an answer.
 */
export const DatevOnly: Story = {
  render: () => (
    <Pair
      facts={{ ...BANK, ludwigOnlyCount: 0, ludwigOnlyAmount: null }}
      cell={{ number: "1210", name: "Commerzbank" }}
    />
  ),
};

/**
 * An account Ludwig created and DATEV does not know yet (15 of 41.570 on
 * staging). Only then does the second chip appear — in the normal case the
 * row is not there at all.
 */
export const SyncPending: Story = {
  render: () => (
    <Pair
      facts={{
        ...BANK,
        accountNumber: "890001",
        accountName: "Neuer Kreditor (Platzhalter)",
        accountingRole: "creditor",
        datevBalance: null,
        datevEntryCount: 0,
        ludwigOnlyCount: 1,
        ludwigOnlyAmount: 357.0,
        lastBookingDate: null,
        syncState: "local_only",
      }}
      cell={{ number: "890001", name: "Neuer Kreditor (Platzhalter)" }}
    />
  ),
};

/**
 * Where they really stand: the cell as a contra account in a booking row, and
 * the facts as the content of a `HoverCard` over the same cell — the case
 * `HoverCard` names in its own `@when` („the account behind an account
 * number") and had no content for until now.
 */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 760, display: "grid", gap: "var(--space-5)" }}>
      <Card>
        <CardHead title="Buchungen des Sachverhalts" />
        <Table cols="96px minmax(0, 1.4fr) minmax(0, 1fr)" minWidth={520}>
          <HeadRow>
            <span>Datum</span>
            <span>Buchungstext</span>
            <span>Gegenkonto</span>
          </HeadRow>
          <Row>
            <span>31.08.2026</span>
            <span>Reparatur März</span>
            <AccountCell number="1210" name="Commerzbank" href="?account=1210" />
          </Row>
          <Row>
            <span>30.08.2026</span>
            <span>Miete August</span>
            <HoverCard content={<AccountFacts facts={BANK} />}>
              <AccountCell number="4210" name="Miete" href="?account=4210" />
            </HoverCard>
          </Row>
        </Table>
      </Card>
    </div>
  ),
};

/**
 * The edges: a 50-character name (cut, full name in the `title`), the leading
 * zero of `0420`, a negative balance, `0,00 €` as a real value, and a
 * six-digit placeholder number.
 */
export const Edges: Story = {
  render: () => (
    <div style={{ maxWidth: 520, display: "grid", gap: "var(--space-5)" }}>
      <div>
        <div className="v2sub">AccountCell — lange Namen, führende Null</div>
        <div style={{ display: "grid", gap: "var(--space-2)" }}>
          <AccountCell
            number="0420"
            name="Betriebs- und Geschäftsausstattung, geringwertig"
          />
          <AccountCell number="890001" name="Systemseitig angelegtes Kreditorkonto" />
          <AccountCell number="1000" />
        </div>
      </div>
      <div>
        <div className="v2sub">AccountFacts — Saldo 0,00 € und negativ</div>
        <AccountFacts
          facts={{
            ...BANK,
            accountNumber: "0420",
            accountName: "Betriebs- und Geschäftsausstattung, geringwertige Wirtschaftsgüter",
            datevBalance: 0,
            datevEntryCount: 1,
            ludwigOnlyCount: 12,
            ludwigOnlyAmount: -4180.9,
          }}
        />
      </div>
    </div>
  ),
};
