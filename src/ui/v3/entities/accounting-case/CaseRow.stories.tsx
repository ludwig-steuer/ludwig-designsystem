import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { CaseListItem } from "@/ludwig/modules/accounting-cases/domain/case";
import { CaseRow } from "./CaseRow";
import { caseColumns, caseTracks, type CaseColumn } from "./case-columns";
import { Card, CardHead, HeadRow, Table } from "../../primitives/Table";

const meta: Meta<typeof CaseRow> = {
  title: "v3/Entitäten/Sachverhalt/CaseRow",
  component: CaseRow,
};
export default meta;
type Story = StoryObj<typeof CaseRow>;

const href = (c: CaseListItem) => `#fall-${c.caseId}`;
const counterpartyHref = (c: CaseListItem) =>
  c.counterpartyPartnerId ? `#partner-${c.counterpartyPartnerId}` : undefined;

const CASE = (over: Partial<CaseListItem> = {}): CaseListItem => ({
  caseId: "c-4412",
  caseNumber: "2026-0412",
  clientId: "cl-1",
  fiscalYear: 2026,
  kind: "incoming_invoice",
  title: "Wartung der Klimaanlage",
  summary: null,
  counterpartyName: "Bürobedarf Meier GmbH",
  counterpartyPartnerId: "bp-8841",
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
  exportStatus: "open",
  ...over,
});

const CASES: CaseListItem[] = [
  CASE(),
  CASE({
    caseId: "c-4413",
    counterpartyPartnerId: "bp-8842",
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
    exportStatus: "exported",
  }),
  CASE({
    caseId: "c-4414",
    // Without a resolved business partner (47 % have one, L-69): the
    // counterparty stays a name without a target, and the row shows no anchor.
    counterpartyPartnerId: null,
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
    counterpartyPartnerId: "bp-8844",
    caseNumber: "2026-0415",
    kind: "internal_transfer",
    title: null,
    counterpartyName: null,
    totalAmount: null,
    currency: null,
    lifecycleStatus: "needs_clarification",
    disposition: null,
    // The `Sparse` story's case: thin on master data **and** without a
    // clarification, as the spec's story table says. The edge with three open
    // ones is in `Edges` (M7b).
    openClarificationsCount: 0,
    documentEventsCount: 0,
    bankEventsCount: 0,
    openedAt: "2026-09-01",
    exportStatus: null,
  }),
  CASE({
    caseId: "c-4416",
    counterpartyPartnerId: "bp-8845",
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
    exportStatus: "partial",
  }),
];

const FULL = caseColumns({ href, counterpartyHref });
/**
 * The minimum width follows the **column set**, not a fixed number: fixed tracks
 * plus gaps plus padding plus the display name's floor from its own `minmax()`.
 * A fixed 1630 left two columns outside the card in `Columns` (0096, M3).
 */
function minWidth(columns: typeof FULL): number {
  const fest = columns.reduce((sum, c) => {
    const w = (c.width ?? "").trim();
    const px = /^(\d+)px$/.exec(w);
    if (px?.[1]) return sum + Number(px[1]);
    // A flexible track's floor lives **in the set**, not here: a number next to
    // it goes stale with the next commit (it did: 175 vs 200, 0096, N1). So the
    // floor is read from the `minmax()`.
    const floor = /^minmax\(\s*(\d+)px/.exec(w);
    return sum + (floor?.[1] ? Number(floor[1]) : 175);
  }, 0);
  return fest + (columns.length - 1) * 10 + 36;
}

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
        <Table cols={caseTracks(columns)} minWidth={minWidth(columns)}>
          <HeadRow>
            {columns.map((c) => (
              <span key={c.key} className={c.align === "end" ? "v2num" : undefined}>
                {c.header}
                {/* The (i) comes from the column set (`headerAside`), not a list here:
                    otherwise it stands at other columns than in `DataTable` (0096, M4). */}
                {c.headerAside}
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
 * Der dünn besetzte Fall: kein Betrag (52 % Füllung), kein Gegenpart, keine
 * Zuständigkeit, kein Export. Jeder Punkt sagt „—" oder schweigt begründet,
 * statt zu fehlen — und ohne Titel **und** ohne Gegenpart bleibt vom
 * Anzeigenamen die **Art** allein („Umbuchung"), so wie `caseTitle` es
 * vorsieht.
 *
 * Auch **ohne Klärung**: die Klärungsspalte bleibt stumm, so wie es die
 * Story-Tabelle der Spec verlangt. Der Rand mit drei offenen steht in `Edges`
 * — dieser Satz behauptete bis zur schlanken Abnahme 2026-09-08 das
 * Gegenteil, obwohl die Fixture längst auf 0 stand (M7b).
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
    // **The two counters too.** `documents` and `bankTransactions` had never
    // rendered in any story (0096, M5). §6 asks all values of an enum side by
    // side; they stand in a second set, because all thirteen columns burst the card.
    const counters: CaseColumn[] = ["name", "number", "documents", "bankTransactions", "state"];
    const counterCols = caseColumns({ href, columns: counters });
    return (
      <div style={{ display: "grid", gap: "var(--space-6)" }}>
        <Frame columns={cols} sub="Bürobedarf Meier GmbH · alle Jahre">
          {CASES.slice(0, 3).map((c) => (
            <CaseRow key={c.caseId} case={c} href={href} columns={picked} />
          ))}
        </Frame>
        <Frame columns={counterCols} sub="Mit den beiden Zählern: Belege und Bankzeilen">
          {CASES.slice(0, 3).map((c) => (
            <CaseRow key={c.caseId} case={c} href={href} columns={counters} />
          ))}
        </Frame>
      </div>
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
