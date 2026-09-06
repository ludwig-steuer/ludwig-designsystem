import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { CaseListItem } from "@/ludwig/modules/accounting-cases/domain/case";
import { CaseRow } from "./CaseRow";
import { caseColumns, caseTracks, type CaseColumn } from "./case-columns";
import { StatusInfoButton } from "../../patterns/StatusInfoButton";
import { Card, CardHead, HeadRow, Table } from "../../primitives/Table";

const meta: Meta<typeof CaseRow> = {
  title: "v3/Entitäten/Sachverhalt/CaseRow",
  component: CaseRow,
};
export default meta;
type Story = StoryObj<typeof CaseRow>;

const href = (c: CaseListItem) => `#fall-${c.caseId}`;
const counterpartyHref = (c: CaseListItem) =>
  c.counterpartyName ? `#partner-${c.caseId}` : undefined;

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
  CASE({
    caseId: "c-4413",
    caseNumber: "2026-0413",
    kind: "outgoing_invoice",
    title: "Beratung Q2 2026",
    counterpartyName: "Musterbau GmbH",
    totalAmount: 1800,
    lifecycleStatus: "closed_accepted",
    disposition: "agent",
    openClarificationsCount: 0,
    documentEventsCount: 1,
    bankEventsCount: 2,
    openedAt: "2026-06-02",
    exportStatus: "exportiert",
  }),
  CASE({
    caseId: "c-4414",
    caseNumber: "2026-0414",
    kind: "recurring_charge",
    title: "Abschlag Strom 08/2026",
    counterpartyName: "Stadtwerke Musterstadt",
    totalAmount: 412,
    lifecycleStatus: "waiting_for_documents",
    disposition: "client",
    openClarificationsCount: 0,
    documentEventsCount: 0,
    bankEventsCount: 1,
    openedAt: "2026-08-28",
    exportStatus: null,
  }),
  CASE({
    caseId: "c-4415",
    caseNumber: "2026-0415",
    kind: "internal_transfer",
    title: null,
    counterpartyName: null,
    totalAmount: null,
    currency: null,
    lifecycleStatus: "needs_clarification",
    disposition: null,
    openClarificationsCount: 3,
    documentEventsCount: 0,
    bankEventsCount: 0,
    openedAt: "2026-09-01",
    exportStatus: null,
  }),
  CASE({
    caseId: "c-4416",
    caseNumber: "2026-0416",
    kind: "incoming_invoice",
    title: "Sanierung Serverraum, Teilrechnung 2 von 3",
    counterpartyName: "Handwerk Schulz KG",
    totalAmount: 2480.55,
    lifecycleStatus: "open",
    disposition: "accounting",
    openClarificationsCount: 0,
    documentEventsCount: 2,
    bankEventsCount: 1,
    openedAt: "2026-08-20",
    exportStatus: "teilweise",
  }),
];

const FULL = caseColumns({ href, counterpartyHref });

function Frame({
  children,
  columns = FULL,
  sub,
}: {
  children: React.ReactNode;
  columns?: typeof FULL;
  sub?: string;
}) {
  return (
    <div style={{ maxWidth: 1400 }}>
      <Card>
        <CardHead title="Sachverhalte" sub={sub ?? "Musterbau GmbH · Wirtschaftsjahr 2026"} />
        <Table cols={caseTracks(columns)} minWidth={1180}>
          <HeadRow>
            {columns.map((c) => (
              <span key={c.key} className={c.align === "end" ? "v2num" : undefined}>
                {c.header}
                {c.key === "state" ? <StatusInfoButton axis="sachverhalt" /> : null}
                {c.key === "disposition" ? <StatusInfoButton axis="disposition" /> : null}
                {c.key === "exportState" ? <StatusInfoButton axis="export_case" /> : null}
              </span>
            ))}
          </HeadRow>
          {children}
        </Table>
      </Card>
    </div>
  );
}

/** Alle zehn Punkte; die Zeile ist ein Link, und der Gegenpart ist der zweite. */
export const Filled: Story = {
  render: () => (
    <Frame>
      <CaseRow case={CASES[0]!} href={href} counterpartyHref={counterpartyHref} />
    </Frame>
  ),
};

/**
 * Der häufige Fall: kein Betrag (52 % Füllung), kein Gegenpart, keine
 * Zuständigkeit, kein Export. Jeder Punkt sagt „—" oder schweigt begründet,
 * statt zu fehlen — und der Anzeigename fällt auf Art plus Gegenpart zurück.
 */
export const Sparse: Story = {
  render: () => (
    <Frame sub="Musterbau GmbH · dünn besetzt">
      <CaseRow case={CASES[3]!} href={href} counterpartyHref={counterpartyHref} />
    </Frame>
  ),
};

/**
 * Derselbe Satz Zellen, zwei Auswahlen: der Reiter des Geschäftspartners
 * zeigt sechs Punkte und dafür das **Wirtschaftsjahr**, weil er über Jahre
 * hinweg listet. Die Auswahl ist **verdreht übergeben** — `columns` wählt aus,
 * es ordnet nicht.
 */
export const Columns: Story = {
  render: function Render() {
    const picked: CaseColumn[] = [
      "fiscalYear",
      "state",
      "amount",
      "openedAt",
      "number",
      "name",
    ];
    const cols = caseColumns({ href, columns: picked });
    return (
      <Frame columns={cols} sub="Bürobedarf Meier GmbH · alle Jahre">
        {CASES.slice(0, 3).map((c) => (
          <CaseRow key={c.caseId} case={c} href={href} columns={picked} />
        ))}
      </Frame>
    );
  },
};

/** Ohne `href`: kein `.v2rowlink`; der Gegenpart bleibt trotzdem klickbar. */
export const WithoutLink: Story = {
  render: () => (
    <Frame sub="Musterbau GmbH · ohne Ziel">
      <CaseRow case={CASES[0]!} counterpartyHref={counterpartyHref} />
    </Frame>
  ),
};

/**
 * Rand: ein 90-Zeichen-Name, ein Betrag über einer Million, drei offene
 * Klärungen und eine Nummer ohne Wirtschaftsjahr.
 */
export const Edges: Story = {
  render: () => (
    <Frame sub="Musterbau GmbH · Randfälle">
      <CaseRow
        case={CASE({
          caseId: "c-9001",
          title:
            "Sanierung des Serverraums samt Klimatechnik, Brandschutz und Zugangskontrolle, Bauabschnitt 2",
          totalAmount: 1284900.55,
          openClarificationsCount: 3,
        })}
        href={href}
        counterpartyHref={counterpartyHref}
      />
      <CaseRow
        case={CASE({
          caseId: "c-9002",
          caseNumber: null,
          fiscalYear: null,
          title: "Vortrag ohne Jahr",
          totalAmount: null,
        })}
        href={href}
        counterpartyHref={counterpartyHref}
      />
    </Frame>
  ),
};

/**
 * Im Einsatz: fünf Zeilen mit Kopf. Über jeder Zustandsspalte steht das (i)
 * ihrer Achse — Regel Z4 einmal komplett: `sachverhalt`, `disposition`,
 * `export_case`.
 */
export const InUse: Story = {
  render: () => (
    <Frame>
      {CASES.map((c) => (
        <CaseRow key={c.caseId} case={c} href={href} counterpartyHref={counterpartyHref} />
      ))}
    </Frame>
  ),
};
