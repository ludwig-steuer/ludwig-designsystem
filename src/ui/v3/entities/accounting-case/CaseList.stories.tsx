import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { CaseListItem } from "@/ludwig/modules/accounting-cases/domain/case";
import { CaseList, type CaseListTab } from "./CaseList";
import type { CaseColumn } from "./case-columns";
import { AppShell, TopBar } from "../../primitives/AppShell";
import { FilterBar } from "../../primitives/FilterBar";
import { Field, Input, Select } from "../../primitives/Form";
import { NavList, type NavSection } from "../../primitives/NavList";
import { PageHeader } from "../../primitives/PageHeader";
import { Tabs, type TabItem } from "../../primitives/Nav";

const meta: Meta<typeof CaseList> = {
  title: "v3/Entitäten/Sachverhalt/CaseList",
  component: CaseList,
};
export default meta;
type Story = StoryObj<typeof CaseList>;

const href = (c: CaseListItem) => `#fall-${c.caseId}`;
const listHref = (patch: { sort?: string; dir?: string; page?: number }) =>
  `#liste?sort=${patch.sort ?? ""}&dir=${patch.dir ?? ""}&page=${patch.page ?? 1}`;

const CASE = (over: Partial<CaseListItem> = {}): CaseListItem => ({
  caseId: "c-4412",
  caseNumber: "2026-0412",
  clientId: "cl-1",
  fiscalYear: 2026,
  kind: "incoming_invoice",
  title: "Wartung der Klimaanlage",
  summary: null,
  counterpartyName: "Bürobedarf Meier GmbH",
  currency: "EUR",
  totalAmount: 1249.9,
  lifecycleStatus: "open",
  disposition: "accounting",
  documentEventsCount: 1,
  bankEventsCount: 1,
  openClarificationsCount: 1,
  hasOpenDocumentRequest: false,
  openedAt: "2026-08-26",
  closedAt: null,
  exportStatus: "offen",
  ...over,
});

const CASES: CaseListItem[] = [
  CASE(),
  CASE({ caseId: "c-4413", caseNumber: "2026-0413", kind: "outgoing_invoice", title: "Beratung Q2 2026", counterpartyName: "Musterbau GmbH", totalAmount: 1800, lifecycleStatus: "closed_accepted", disposition: "agent", openClarificationsCount: 0, openedAt: "2026-06-02", exportStatus: "exportiert" }),
  CASE({ caseId: "c-4414", caseNumber: "2026-0414", kind: "recurring_charge", title: "Abschlag Strom 08/2026", counterpartyName: "Stadtwerke Musterstadt", totalAmount: 412, lifecycleStatus: "waiting_for_documents", disposition: "client", openClarificationsCount: 0, openedAt: "2026-08-28", exportStatus: null }),
  CASE({ caseId: "c-4415", caseNumber: "2026-0415", kind: "internal_transfer", title: null, counterpartyName: null, totalAmount: null, currency: null, lifecycleStatus: "needs_clarification", disposition: null, openClarificationsCount: 3, openedAt: "2026-09-01", exportStatus: null }),
  CASE({ caseId: "c-4416", caseNumber: "2026-0416", title: "Sanierung Serverraum, Teilrechnung 2 von 3", counterpartyName: "Handwerk Schulz KG", totalAmount: 2480.55, openClarificationsCount: 0, openedAt: "2026-08-20", exportStatus: "teilweise" }),
];

const PAGER = { page: 1, pageSize: 25, totalItems: 190, totalPages: 8 };

/** Der Normalfall: fünf von 190, Sortierung am Kopf, Pager darunter. */
export const Filled: Story = {
  render: () => (
    <div style={{ maxWidth: 1620 }}>
      <CaseList
        tab="laufend"
        cases={CASES}
        href={href}
        counterpartyHref={(c) => (c.counterpartyName ? `#partner-${c.caseId}` : undefined)}
        listHref={listHref}
        sort={{ key: "openedAt", dir: "desc" }}
        pager={PAGER}
        head={{ sub: "Musterbau GmbH · Wirtschaftsjahr 2026" }}
      />
    </div>
  ),
};

/**
 * Die vier Reiter nebeneinander — **derselbe** Spaltensatz, vier Leerfälle.
 * Drei davon sind ein **Erfolg** und sagen das auch; nur „alle" ist eine
 * Lücke, denn ein Jahr ohne einen einzigen Sachverhalt hat nicht angefangen.
 */
export const TabsSideBySide: Story = {
  name: "Tabs",
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-6)", maxWidth: 1620 }}>
      {(["laufend", "belege", "klaerung", "alle"] as CaseListTab[]).map((tab) => (
        <CaseList key={tab} tab={tab} cases={[]} href={href} />
      ))}
    </div>
  ),
};

/** „Nichts offen" ist ein **Erfolg** — mit dem Haken, nicht mit einem Achselzucken. */
export const Empty: Story = {
  render: () => (
    <div style={{ maxWidth: 1620 }}>
      <CaseList tab="laufend" cases={[]} href={href} head={{ sub: "Musterbau GmbH · 2026" }} />
    </div>
  ),
};

/**
 * Der **fünfte** Leerfall, den die Seite heute nicht kennt: leer wegen des
 * Filters, nicht wegen des Bestands. Er hat einen eigenen Satz und einen Weg
 * zurück — genau diese Unterscheidung sagt, ob man fertig ist.
 */
export const EmptyAfterFilter: Story = {
  render: () => (
    <div style={{ maxWidth: 1620 }}>
      <CaseList
        tab="laufend"
        cases={[]}
        href={href}
        filtered={{ summary: "Bürobedarf · Dauersachverhalt", resetHref: "#alle" }}
      />
    </div>
  ),
};

/** Lädt: Kopf und Spaltenkopf bleiben stehen — sie sind die Zusage, was kommt. */
export const Loading: Story = {
  render: () => (
    <div style={{ maxWidth: 1620 }}>
      <CaseList tab="laufend" cases={[]} href={href} loading />
    </div>
  ),
};

/** Fehler: der Satz und **ein** Weg, es erneut zu versuchen. */
export const Error: Story = {
  render: () => (
    <div style={{ maxWidth: 1620 }}>
      <CaseList
        tab="laufend"
        cases={[]}
        href={href}
        error={{ message: "Die Sachverhalte konnten nicht geladen werden. Die Abfrage lief in eine Zeitüberschreitung." }}
      />
    </div>
  ),
};

/**
 * Der kürzere Satz des Partner-Reiters: sechs Punkte statt zehn, dafür das
 * **Wirtschaftsjahr** — weil diese Liste ihr Jahr verlässt.
 */
export const Columns: Story = {
  render: () => {
    const picked: CaseColumn[] = ["name", "state", "number", "amount", "openedAt", "fiscalYear"];
    return (
      <div style={{ maxWidth: 1180 }}>
        <CaseList
          tab="alle"
          cases={CASES.slice(0, 3)}
          href={href}
          columns={picked}
          minWidth={900}
          head={{ title: "Sachverhalte", sub: "Bürobedarf Meier GmbH · alle Jahre" }}
        />
      </div>
    );
  },
};

const SECTIONS: NavSection[] = [
  { label: "Arbeit", items: [{ href: "/cases", label: "Sachverhalte", count: 190 }, { href: "/documents", label: "Belege" }, { href: "/banks", label: "Bank", count: 2, alarm: true }] },
  { label: "Stammdaten", items: [{ href: "/accounts", label: "Konten" }, { href: "/partners", label: "Geschäftspartner" }] },
];

const TABS: TabItem[] = [
  { key: "laufend", label: "Laufende Sachverhalte", count: 190 },
  { key: "belege", label: "Wartet auf Unterlagen", count: 19 },
  { key: "klaerung", label: "Zur Bearbeitung", count: 34, alarm: true },
  { key: "alle", label: "Alle Sachverhalte", count: 915 },
];

/**
 * Im Einsatz: die ganze Seite. **Die Reiterleiste und der Filter stehen
 * außerhalb der Liste** — die Seite kennt die Zähler aller vier
 * Grundgesamtheiten, die Liste kennt nur ihre eigene.
 */
export const InUse: Story = {
  render: () => (
    <AppShell
      sidebar={
        <>
          <div className="sb__logo">Ludwig</div>
          <NavList sections={SECTIONS} activePath="/cases" />
        </>
      }
      topbar={<TopBar crumb="Musterbau GmbH · 2026" />}
    >
      <PageHeader
        overline="Musterbau GmbH · Wirtschaftsjahr 2026"
        title="Sachverhalte"
        description="190 offen. Wer am Zug ist, steht in der Spalte für die Zuständigkeit."
      />
      <Tabs items={TABS} active="laufend" ariaLabel="Sachverhaltsliste" />
      {/* Der Filter steht **über** der Karte und gehört der Seite — `DataTable`
          hält das in seinem `@instead` fest, und `CaseList` bringt ihn nicht
          mit. */}
      <FilterBar resetHref="#alle">
        <Field label="Suche" htmlFor="q">
          <Input id="q" type="search" placeholder="Nummer, Gegenpart, Beleg" />
        </Field>
        <Field label="Art" htmlFor="art">
          <Select id="art" defaultValue="alle">
            <option value="alle">alle</option>
            <option value="dauer">Dauersachverhalt</option>
            <option value="einmalig">einmalig</option>
          </Select>
        </Field>
      </FilterBar>
      <CaseList
        tab="laufend"
        cases={CASES}
        href={href}
        counterpartyHref={(c) => (c.counterpartyName ? `#partner-${c.caseId}` : undefined)}
        listHref={listHref}
        sort={{ key: "openedAt", dir: "desc" }}
        pager={PAGER}
      />
    </AppShell>
  ),
};
