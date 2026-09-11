import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LedgerAccountView } from "./LedgerAccountView";
import { AccountFacts, type AccountFactsVM } from "./Account";
import { accountEntryColumns, type AccountEntry } from "./AccountEntries";
import { formatAmount, formatCount } from "../../format";
import { Time } from "../../primitives/Time";
import { BarChart, type Bar } from "../../primitives/BarChart";
import { EmptyState } from "../../primitives/EmptyState";
import { KpiGrid, KpiTile } from "../../primitives/KpiTile";
import { AppShell, TopBar } from "../../primitives/AppShell";
import { NavList, type NavSection } from "../../primitives/NavList";
import { Tabs } from "../../primitives/Nav";
import { RecordPager } from "../../primitives/RecordPager";
import { Skeleton } from "../../primitives/Skeleton";
import { Banner } from "../../primitives/Banner";
import { TextButton } from "../../primitives/TextButton";
import { Card, CardHead } from "../../primitives/Table";
import { EntityIcon } from "../../Icons";
import { DataTable } from "../../patterns/DataTable";
import { EntityHeader } from "../../patterns/EntityHeader";
import { StatusBadge } from "../../patterns/StatusBadge";
import { MASTER_FIELDS } from "./fixtures";

const meta: Meta<typeof LedgerAccountView> = {
  title: "v3/Entitäten/Konto/LedgerAccountView",
  component: LedgerAccountView,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof LedgerAccountView>;

const FACTS: AccountFactsVM = {
  ...MASTER_FIELDS,
  accountNumber: "4930",
  accountName: "Bürobedarf",
  accountingRole: "general_ledger",
  fiscalYear: 2026,
  currency: "EUR",
  datevBalance: 18_442.19,
  ludwigEntryCount: 41,
  openProposalCount: 2,
  usageBookingCount: 3_412,
  datevEntryCount: 47,
  ludwigOnlyCount: 3,
  ludwigOnlyAmount: 612.4,
  lastBookingDate: "2026-08-26",
  totalDebit: 21_442.19,
  totalCredit: 3_000.0,
  skrClassLabel: "Sonstige betr. Aufwendungen",
};

const E = (over: Partial<AccountEntry> & { id: string }): AccountEntry => ({
  postingDate: "2026-08-26",
  documentNumber: "RE-4471",
  text: "Bürobedarf Meier GmbH",
  contraAccounts: [{ number: "70001", name: "Bürobedarf Meier GmbH" }],
  debit: 1249.9,
  credit: null,
  origin: "exported",
  markOfOrigin: "RE",
  ...over,
});

/**
 * **All four origin classes**, answering rank 5 ("do Ludwig and DATEV agree?"):
 * only in DATEV · booked by Ludwig and confirmed · exported by Ludwig, not yet
 * found again · only in Ludwig. One sign per row, no second status (R1).
 */
const ENTRIES: AccountEntry[] = [
  E({ id: "e1" }),
  E({ id: "e2", postingDate: "2026-08-22", documentNumber: "RE-4468", text: "Kaffeeröster Nord GmbH", debit: 214.2, contraAccounts: [{ number: "70014" }], origin: "datev" }),
  E({ id: "e3", postingDate: "2026-08-19", documentNumber: null, text: "Storno RE-4455", debit: null, credit: 89.9, origin: "mirrored", markOfOrigin: "SV" }),
  E({ id: "e4", postingDate: "2026-08-14", documentNumber: "RE-4460", text: "Schreibwaren Süd", debit: 612.4, origin: "ludwig", status: "proposed", markOfOrigin: null }),
];

const MONTHS: Bar[] = [
  { label: "Jan", value: 1240, secondary: 90 },
  { label: "Feb", value: 980, secondary: 0 },
  { label: "Mär", value: 2110, secondary: 140 },
  { label: "Apr", value: 1740, secondary: 0 },
  { label: "Mai", value: 890, secondary: 62 },
  { label: "Jun", value: 2430, secondary: 0 },
  { label: "Jul", value: 1980, secondary: 210 },
  { label: "Aug", value: 2076, secondary: 89 },
  { label: "Sep", value: 0, secondary: 0 },
  { label: "Okt", value: 0, secondary: 0 },
  { label: "Nov", value: 0, secondary: 0 },
  { label: "Dez", value: 0, secondary: 0 },
];

/**
 * The bank account of the edge story. **One** object for head, figures and side
 * column: two spreads showed two different DATEV balances of one account.
 */
const BANK: AccountFactsVM = {
  // Every field concerning this account's numbers — or the card shows one
  // account's head and another's totals (0063, M3).
  ...FACTS,
  accountNumber: "1210",
  accountName: "Bank Commerzbank",
  // `general_ledger`, not "bank": the `konto_typ` axis knows only
  // general_ledger | creditor | debtor | revenue | other, and `role: string` lets
  // a raw value through the typecheck (0063). The bank account's kind is the
  // SKR class next to it.
  accountingRole: "general_ledger",
  skrClassLabel: "Finanz- und Privatkonten",
  datevBalance: -184_221.55,
  datevEntryCount: 3400,
  ludwigOnlyCount: 128,
  ludwigOnlyAmount: 41_882.9,
  totalDebit: 612_004.2,
  totalCredit: 796_225.75,
  lastBookingDate: "2026-08-31",
};

/** An account without any movement in the year — the last entry is missing too. */
const UNUSED: AccountFactsVM = {
  ...FACTS,
  accountNumber: "4650",
  accountName: "Bewirtungskosten",
  skrClassLabel: "Sonstige betriebliche Aufwendungen",
  datevBalance: null,
  datevEntryCount: 0,
  ludwigOnlyCount: 0,
  ludwigOnlyAmount: null,
  lastBookingDate: null,
  // Without movement there are no totals: "0 Buchungen" next to a Σ row from the
  // neighbouring account was the mistake (M3).
  totalDebit: 0,
  totalCredit: 0,
};

const SECTIONS: NavSection[] = [
  {
    label: "Arbeit",
    items: [
      { href: "/cases", label: "Sachverhalte", count: 14 },
      { href: "/documents", label: "Belege", count: 102 },
      { href: "/banks", label: "Bank", count: 2, alarm: true },
    ],
  },
  {
    label: "Stammdaten",
    items: [
      { href: "/accounts", label: "Konten" },
      { href: "/partners", label: "Geschäftspartner" },
    ],
  },
];

const TABS = [
  { key: "konto", label: "Konto", href: "#konto" },
  { key: "llm", label: "LLM-Profil", href: "#llm" },
];

const PAGER = (
  <RecordPager
    back={{ href: "#konten", label: "Konten" }}
    position={412}
    total={6212}
    label="Konto"
    prevHref="#konto-4920"
    nextHref="#konto-4940"
  />
);

function Head({ facts }: { facts: AccountFactsVM }) {
  return (
    <EntityHeader
      icon={<EntityIcon entity="ledger-account" size={20} />}
      overline={`Konto · Musterbau GmbH · ${facts.fiscalYear}`}
      title={`${facts.accountNumber} ${facts.accountName ?? ""}`.trim()}
      status={<StatusBadge axis="konto_typ" status={facts.accountingRole} info={false} />}
      actions={<TextButton onClick={() => {}}>Zum Kontenplan →</TextButton>}
    />
  );
}

/**
 * Rank 2 as the owner decided it on 2026-09-04: **DATEV leads, Ludwig is the
 * delta.** No second, equal balance — two equal numbers invite adding them, and a
 * merged balance hides exactly the deviation someone came for.
 */
function Summary({ facts }: { facts: AccountFactsVM }) {
  return (
    <KpiGrid>
      {/* **One** leading number. The delta is in its sub line, not an equal tile
          next to it (the spec says so itself). */}
      <KpiTile
        label={`Saldo in DATEV ${facts.fiscalYear}`}
        value={formatAmount(facts.datevBalance, facts.currency)}
        sub={
          facts.ludwigOnlyCount > 0
            ? `${formatCount(facts.datevEntryCount)} Buchungen · + ${facts.ludwigOnlyCount} nur in Ludwig (${formatAmount(facts.ludwigOnlyAmount, facts.currency)})`
            : `${formatCount(facts.datevEntryCount)} Buchungen im Spiegel`
        }
      />
      <KpiTile
        label="Letzte Buchung"
        value={<Time value={facts.lastBookingDate ?? null} format="date" />}
        sub="im Spiegel"
      />
    </KpiGrid>
  );
}

/** Rank 3 — the history. In `Filled` and `InUse`, so the height criterion is
 *  measurable where the view really stands. */
function Chart() {
  return (
    <Card>
      <CardHead title="Verlauf 2026" sub="Soll und Haben je Monat" />
      <div style={{ padding: "var(--space-4)" }}>
        <BarChart
          bars={MONTHS}
          layout="grouped"
          format={(v) => formatAmount(v, "EUR")}
          highlight="Aug"
          primaryLabel="Soll"
          secondaryLabel="Haben"
          ariaLabel="Soll und Haben je Monat 2026"
        />
      </div>
    </Card>
  );
}

function Movements({ entries, full = false }: { entries: AccountEntry[]; full?: boolean }) {
  // **Next to the strand the compact set, without it the full one.** Beside the
  // 440 px side column the list gets 1,134 px (1440) and 974 px (1280); the full
  // set's three extra columns need 300 px more (0063). Without the strand the
  // full set fits every track but the contra account, shortened with `title`.
  //
  // **No "Stapel" in the compact set**: the state chip would sit in the
  // horizontal scroll. The batch is rank 8 and costs nothing to drop — its number
  // is in the entry's drawer.
  const cols = accountEntryColumns({ currency: "EUR", variant: full ? "full" : "compact" });
  return (
    <DataTable<AccountEntry>
      rows={entries}
      columns={cols}
      rowKey={(e) => e.id}
      head={{ title: "Bewegungen 2026", sub: "beide Quellen, neueste zuerst" }}
      minWidth={620}
      // **Rank 5, second half.** The origin sign tells three classes apart; the
      // fourth — "only in Ludwig, not yet in DATEV" — is the **muted row** (owner
      // decision 2026-09-04).
      rowClassName={(e) => (e.origin === "ludwig" ? "v2ae__row--draft" : undefined)}
      empty={{ title: "Auf diesem Konto ist im Jahr 2026 nichts gebucht." }}
    />
  );
}

/**
 * Der volle Fall. **Eine** Bewegungsliste, nicht zwei: die Frage ist eine —
 * was liegt auf dem Konto —, die Quelle ist eine Eigenschaft der Zeile. Erst
 * so wird Rang 5 („sagen Ludwig und DATEV dasselbe?") in der Zeile sichtbar,
 * über die Herkunft-Spalte aus 0067.
 */
export const Filled: Story = {
  render: () => (
    <div style={{ padding: "var(--space-5)", maxWidth: 1600 }}>
      <LedgerAccountView
        pager={PAGER}
        header={<Head facts={FACTS} />}
        summary={<Summary facts={FACTS} />}
        chart={<Chart />}
        tabs={<Tabs items={TABS} active="konto" ariaLabel="Ansichten des Kontos" />}
        aside={<AccountFacts facts={FACTS} />}
      >
        <Movements entries={ENTRIES} />
      </LedgerAccountView>
    </div>
  ),
};

/**
 * **Drei Slots weniger**: keine Randspalte, kein Pager, keine Reiter. Die
 * Bewegungen nehmen die ganze Breite, und die zwei leeren Zeilen fallen
 * **samt Abstand** — ein Konto, das niemand aus einer Liste geöffnet hat,
 * darf nicht aussehen, als fehlte dort etwas.
 */
export const WithoutFacts: Story = {
  render: () => (
    <div style={{ padding: "var(--space-5)", maxWidth: 1600 }}>
      <LedgerAccountView header={<Head facts={FACTS} />} summary={<Summary facts={FACTS} />}>
        {/* The only story without a side column — so the **full** column set
            fits: booking state, batch and DATEV join (`variant: "full"`). */}
        <Movements entries={ENTRIES} full />
      </LedgerAccountView>
    </div>
  ),
};

/**
 * Der zweite Reiter: derselbe Rahmen, anderer Inhalt. Der View lädt nichts —
 * das LLM-Profil holt die Seite, wenn dieser Reiter aktiv ist.
 */
export const OtherTab: Story = {
  render: () => (
    <div style={{ padding: "var(--space-5)", maxWidth: 1600 }}>
      <LedgerAccountView
        pager={PAGER}
        header={<Head facts={FACTS} />}
        tabs={<Tabs items={TABS} active="llm" ariaLabel="Ansichten des Kontos" />}
      >
        <EmptyState
          inline
          title="LLM-Profil"
          description="Beschreibung, Belegbegriffe und Embedding-Status — die Seite lädt sie, wenn dieser Reiter aktiv ist."
        />
      </LedgerAccountView>
    </div>
  ),
};

/**
 * Ein Konto ohne Bewegung im Jahr: **ein Befund, kein Fehler** — und kein
 * Erfolg. Der Verlauf fällt weg, statt zwölf leere Balken zu zeigen.
 */
export const Empty: Story = {
  render: () => (
    <div style={{ padding: "var(--space-5)", maxWidth: 1600 }}>
      <LedgerAccountView
        pager={PAGER}
        header={<Head facts={UNUSED} />}
        summary={<Summary facts={UNUSED} />}
        tabs={<Tabs items={TABS} active="konto" ariaLabel="Ansichten des Kontos" />}
        aside={<AccountFacts facts={UNUSED} />}
      >
        <Movements entries={[]} />
      </LedgerAccountView>
    </div>
  ),
};

/** Lädt und Fehler — beide gehören dem Inhalt: Kopf, Zahlen und Reiter bleiben. */
export const LoadingAndError: Story = {
  render: () => (
    <div style={{ padding: "var(--space-5)", maxWidth: 1600, display: "grid", gap: "var(--space-6)" }}>
      <LedgerAccountView
        pager={PAGER}
        header={<Head facts={FACTS} />}
        summary={<Summary facts={FACTS} />}
        tabs={<Tabs items={TABS} active="konto" ariaLabel="Ansichten des Kontos" />}
      >
        <Skeleton lines={6} label="Bewegungen werden geladen …" />
      </LedgerAccountView>

      <LedgerAccountView
        pager={PAGER}
        header={<Head facts={FACTS} />}
        summary={<Summary facts={FACTS} />}
        tabs={<Tabs items={TABS} active="konto" ariaLabel="Ansichten des Kontos" />}
      >
        <Banner tone="danger" title="Die Bewegungen konnten nicht geladen werden">
          Der DATEV-Spiegel wird gerade neu aufgebaut.{" "}
          <TextButton onClick={() => {}}>Erneut versuchen</TextButton>
        </Banner>
      </LedgerAccountView>
    </div>
  ),
};

/**
 * Rand: das Bankkonto mit **3.400** Bewegungen im Jahr. Der Pager ist keine
 * Zier — p99 liegt bei 250, das Maximum bei 3.400, und ohne ihn wäre die
 * Seite eine Abschneidung.
 */
export const Edges: Story = {
  render: () => {
    // The same compact set as in `Filled`: the strand stands next to it (M2).
    const cols = accountEntryColumns({ currency: "EUR", variant: "compact" });
    return (
      <div style={{ padding: "var(--space-5)", maxWidth: 1600 }}>
        <LedgerAccountView
          pager={PAGER}
          header={<Head facts={BANK} />}
          summary={<Summary facts={BANK} />}
          tabs={<Tabs items={TABS} active="konto" ariaLabel="Ansichten des Kontos" />}
          aside={<AccountFacts facts={BANK} />}
        >
          <DataTable<AccountEntry>
            rows={ENTRIES}
            columns={cols}
            rowKey={(e) => e.id}
            head={{ title: "Bewegungen 2026", sub: "beide Quellen, neueste zuerst" }}
            minWidth={620}
            sort={{ key: "postingDate", dir: "desc" }}
            // Here too the fourth class of rank 5 is the muted row (owner
            // decision 2026-09-04) — without it four rows looked alike (M4).
            rowClassName={(e) => (e.origin === "ludwig" ? "v2ae__row--draft" : undefined)}
            href={(p) => `#konto?page=${p.page ?? 1}`}
            pager={{ page: 1, pageSize: 50, totalItems: 3400, totalPages: 68 }}
            empty={{ title: "Nichts gebucht." }}
          />
        </LedgerAccountView>
      </div>
    );
  },
};

/**
 * Im Einsatz: die ganze Seite, wie die App sie zeigt — Sidebar, Kopfleiste,
 * das Konto darin. Erst hier hat die Ansicht die Breite, die sie auf der
 * Seite bekommt: bei 1440 × 900 sind es **1.136 px** innen, nicht die 1.400
 * des Story-Rahmens. Genau diese Story hat in 0071 den Fehler gezeigt, den
 * ein Layout-Kriterium im Story-Rahmen nicht zeigen kann — und `spec-schreiben`
 * §6 führt sie deshalb als festen Summanden.
 */
export const InUse: Story = {
  render: () => (
    <AppShell
      sidebar={
        <>
          <div className="sb__logo">Ludwig</div>
          <NavList sections={SECTIONS} activePath="/accounts" />
        </>
      }
      topbar={<TopBar crumb="Musterbau GmbH · 2026" />}
    >
      <LedgerAccountView
        pager={PAGER}
        header={<Head facts={FACTS} />}
        summary={<Summary facts={FACTS} />}
        chart={<Chart />}
        tabs={<Tabs items={TABS} active="konto" ariaLabel="Ansichten des Kontos" />}
        aside={<AccountFacts facts={FACTS} />}
      >
        <Movements entries={ENTRIES} />
      </LedgerAccountView>
    </AppShell>
  ),
};
