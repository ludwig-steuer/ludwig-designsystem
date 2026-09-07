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

const meta: Meta<typeof LedgerAccountView> = {
  title: "v3/Entitäten/Konto/LedgerAccountView",
  component: LedgerAccountView,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof LedgerAccountView>;

const FACTS: AccountFactsVM = {
  accountNumber: "4930",
  accountName: "Bürobedarf",
  role: "general_ledger",
  fiscalYear: 2026,
  currency: "EUR",
  datevBalance: 18_442.19,
  datevCount: 47,
  ludwigOnlyCount: 3,
  ludwigOnlyAmount: 612.4,
  lastBookingDate: "2026-08-26",
  debitTotal: 21_442.19,
  creditTotal: 3_000.0,
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
 * **Alle vier Herkunftsklassen**, weil sie Rang 5 des Seitenprofils
 * beantworten („sagen Ludwig und DATEV dasselbe?"): nur in DATEV · von Ludwig
 * gebucht und bestätigt · von Ludwig exportiert und noch nicht
 * wiedergefunden · nur in Ludwig. Ein Zeichen je Zeile, kein zweiter Status
 * (R1) — der Abgleich je Zeile (`mirror_match`) ist Ausbau.
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
 * Das Bankkonto der Rand-Story. **Ein** Objekt für Kopf, Kennzahlen und
 * Randspalte: zwei Spreads waren zwei verschiedene DATEV-Salden desselben
 * Kontos auf einem Bildschirm — genau der Fall, den das Seitenprofil als
 * Misslingen der Seite nennt („wenn sie die zwei Quellen für eine hält").
 */
const BANK: AccountFactsVM = {
  // Jedes Feld, das die Zahlen dieses Kontos betrifft — sonst zeigt die Karte
  // den Kopf des einen und die Summen des anderen Kontos (Abnahme 0063, M3).
  ...FACTS,
  accountNumber: "1210",
  accountName: "Bank Commerzbank",
  role: "bank",
  skrClassLabel: "Finanz- und Privatkonten",
  datevBalance: -184_221.55,
  datevCount: 3400,
  ludwigOnlyCount: 128,
  ludwigOnlyAmount: 41_882.9,
  debitTotal: 612_004.2,
  creditTotal: 796_225.75,
  lastBookingDate: "2026-08-31",
};

/** Ein Konto ohne jede Bewegung im Jahr — auch die letzte Buchung fehlt. */
const UNUSED: AccountFactsVM = {
  ...FACTS,
  accountNumber: "4650",
  accountName: "Bewirtungskosten",
  skrClassLabel: "Sonstige betriebliche Aufwendungen",
  datevBalance: null,
  datevCount: 0,
  ludwigOnlyCount: 0,
  ludwigOnlyAmount: null,
  lastBookingDate: null,
  // Ohne Bewegung gibt es auch keine Summen: „0 Buchungen" und daneben eine
  // Σ-Zeile aus dem Nachbarkonto war der Fehler (M3).
  debitTotal: 0,
  creditTotal: 0,
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
      status={<StatusBadge axis="konto_typ" status={facts.role} info={false} />}
      actions={<TextButton onClick={() => {}}>Zum Kontenplan →</TextButton>}
    />
  );
}

/**
 * Rang 2, wie der Owner ihn am 2026-09-04 entschieden hat: **DATEV führt,
 * Ludwig ist das Delta.** Kein zweiter, gleichrangiger Saldo — zwei gleich
 * große Zahlen nebeneinander laden dazu ein, sie zu addieren, und ein
 * vereinigter Saldo verbirgt genau die Abweichung, wegen der jemand hier ist.
 */
function Summary({ facts }: { facts: AccountFactsVM }) {
  return (
    <KpiGrid>
      {/* **Eine** führende Zahl. Das Delta steht in ihrer Unterzeile, nicht
          als gleich große Kachel daneben: zwei gleich große Zahlen laden dazu
          ein, sie zu addieren — und genau das sagt die Spec selbst. */}
      <KpiTile
        label={`Saldo in DATEV ${facts.fiscalYear}`}
        value={formatAmount(facts.datevBalance, facts.currency)}
        sub={
          facts.ludwigOnlyCount > 0
            ? `${formatCount(facts.datevCount)} Buchungen · + ${facts.ludwigOnlyCount} nur in Ludwig (${formatAmount(facts.ludwigOnlyAmount, facts.currency)})`
            : `${formatCount(facts.datevCount)} Buchungen im Spiegel`
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

function Movements({ entries }: { entries: AccountEntry[] }) {
  // **Ohne „Stapel".** Der volle Satz ist für eine Seite ohne Randspalte
  // gedacht; hier nimmt `aside` 440 px, und gemessen lag der Zustands-Chip
  // dahinter im Querlauf — Rang 5 wäre unsichtbar gewesen. Der Stapel ist
  // Rang 8 und die einzige Spalte, deren Verlust nichts kostet: die Nummer
  // steht im Drawer der Buchung.
  // **Der kompakte Satz, nicht der volle.** Neben dem 440-px-Strang bleiben
  // der Liste gemessen 674 px auf der Seite (1440) und 514 bei 1280 — ein Satz
  // mit 1180 verlangte dort mehr, als da ist, und die Haben-Spalte stand bei
  // keiner Breite im Bild (Abnahme 0063). Der Strang trägt die Fakten; die
  // Liste daneben beantwortet „was ist gebucht": Datum, Beleg, Text,
  // Gegenkonto, Soll, Haben. Buchungszustand, Stapel und DATEV gehören in den
  // vollen Satz, den die Ansicht **ohne** Strang zeigt.
  const cols = accountEntryColumns({ currency: "EUR", variant: "compact" });
  return (
    <DataTable<AccountEntry>
      rows={entries}
      columns={cols}
      rowKey={(e) => e.id}
      head={{ title: "Bewegungen 2026", sub: "beide Quellen, neueste zuerst" }}
      minWidth={620}
      // **Rang 5, zweite Hälfte.** Das Herkunfts-Zeichen unterscheidet drei
      // Klassen; die vierte — „nur in Ludwig, noch nicht in DATEV" — ist die
      // **gedämpfte Zeile** (Owner-Entscheid 2026-09-04). Ohne sie sahen eine
      // gebuchte und eine ungebuchte Zeile gleich aus; `AccountEntryList`
      // macht es im Drawer seit je so.
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
        chart={
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
        }
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
        <Movements entries={ENTRIES} />
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
    // Derselbe kompakte Satz wie in `Filled`: der Strang steht daneben, und
    // ein Satz mit 1180 verlöre auch hier seine rechten Spalten (M2).
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
            // Auch hier: die vierte Klasse von Rang 5 ist die gedämpfte Zeile
            // (Owner-Entscheid 2026-09-04). Ohne sie sahen vier Zeilen gleich
            // aus — der Mangel, den `Filled` schon behoben hatte (M4).
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
        tabs={<Tabs items={TABS} active="konto" ariaLabel="Ansichten des Kontos" />}
        aside={<AccountFacts facts={FACTS} />}
      >
        <Movements entries={ENTRIES} />
      </LedgerAccountView>
    </AppShell>
  ),
};
