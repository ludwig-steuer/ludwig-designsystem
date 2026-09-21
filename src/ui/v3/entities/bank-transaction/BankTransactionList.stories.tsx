import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BankTransactionList } from "./BankTransactionList";
import { BankTransactionFoldout } from "./BankTransactionFacts";
import { STATEMENT_004 } from "./fixtures";
import type { BankTransactionRowData, CaseAssignment } from "./bank-transaction";
import { Amount } from "../../primitives/Amount";
import { FilterBar } from "../../primitives/FilterBar";
import { Field, Input, Select } from "../../primitives/Form";
import { Button } from "../../primitives/Button";
import { PageHeader } from "../../primitives/PageHeader";
import { PeriodJump, periodPage, type PeriodCount } from "../../primitives/PeriodJump";

const meta: Meta<typeof BankTransactionList> = {
  title: "v3/Entitäten/Kontoauszugsposition/BankTransactionList",
  component: BankTransactionList,
};
export default meta;
type Story = StoryObj<typeof BankTransactionList>;

const caseHref = (id: string) => `#fall-${id}`;
const listHref = (p: { sort?: string; dir?: string; page?: number }) =>
  `#auszug?sort=${p.sort ?? ""}&dir=${p.dir ?? ""}&page=${p.page ?? 1}`;

const CASE = (over: Partial<CaseAssignment> = {}): CaseAssignment => ({
  caseId: "c-4412",
  caseNumber: "2026-0412",
  fiscalYear: 2026,
  title: "Wartung der Klimaanlage",
  kind: "incoming_invoice",
  counterpartyName: "Bürobedarf Meier GmbH",
  lifecycleStatus: "open",
  amount: 1249.9,
  currency: "EUR",
  eventBookingState: "proposed",
  noBookingRequiredReason: null,
  ...over,
});

const T = (over: Partial<BankTransactionRowData> = {}): BankTransactionRowData => ({
  id: "bt-1",
  postingDate: "2026-08-26",
  amount: -1249.9,
  currency: "EUR",
  counterpartyName: "Bürobedarf Meier GmbH",
  purpose: "EREF+0600496348 SVWZ+Wartung Klimaanlage, Rechnung RE-4471",
  matchStage: "exact",
  cases: [CASE()],
  allocatedSum: 1249.9,
  openClarificationsCount: 0,
  ...over,
});

// Descending, as the head says and the profile prescribes: the latest booking
// date on top.
const ROWS: BankTransactionRowData[] = [
  T({ id: "bt-5", postingDate: "2026-08-30", amount: -2480.55, counterpartyName: "Handwerk Schulz KG", purpose: "EREF+RE-8817 SVWZ+Sanierung Serverraum, Teilrechnung 2 von 3", matchStage: "near", cases: [CASE({ caseId: "c-8817", caseNumber: "2026-0451", title: "Sanierung Serverraum", amount: 2000, eventBookingState: null })], allocatedSum: 2000, openClarificationsCount: 1 }),
  T({ id: "bt-4", postingDate: "2026-08-29", amount: -89.9, counterpartyName: null, purpose: "SVWZ+Kontoführungsentgelt August 2026", matchStage: "beyond_bookings", cases: [], allocatedSum: 0 }),
  T({ id: "bt-3", postingDate: "2026-08-28", amount: -412, counterpartyName: "Stadtwerke Musterstadt", purpose: "EREF+SW-2026-08 SVWZ+Abschlag Strom 08/2026", matchStage: "unclear_none", cases: [], allocatedSum: 0 }),
  T({ id: "bt-2", postingDate: "2026-08-27", amount: 1800, counterpartyName: "Musterbau GmbH", purpose: "EREF+RE-2026-0338 SVWZ+Zahlung Rechnung RE-2026-0338", matchStage: "beleg", cases: [CASE({ caseId: "c-338", caseNumber: "2026-0338", title: "Ausgangsrechnung Musterbau", amount: 1800, eventBookingState: "posted" })], allocatedSum: 1800 }),
  T(),
];

const HEAD = { title: "Kontoauszug", sub: "Commerzbank · 1210 · 01.08. bis 31.08.2026" };
const PAGER = { page: 1, pageSize: 25, totalItems: 251, totalPages: 11 };

/** Fünf von 251: Sortierung am Kopf, Pager darunter, „offen" als Wort mit Weg. */
export const Filled: Story = {
  render: () => (
    <div style={{ maxWidth: 1460 }}>
      <BankTransactionList
        transactions={ROWS}
        caseHref={caseHref}
        openHref="#zuordnen"
        listHref={listHref}
        sort={{ key: "postingDate", dir: "desc" }}
        pager={PAGER}
        head={HEAD}
      />
    </div>
  ),
};

/**
 * Der Weg in den Drawer (0103): das Seitenprofil nennt „eine Zahlung
 * nachschlagen, ohne die Liste zu verlassen" **oft** und gibt ihm einen Klick.
 * `rowHref` und `expand` schließen sich aus — das ist die Regel von
 * `DataTable`: eine Zeile, die aufklappt, springt nicht auch noch.
 */
export const RowLink: Story = {
  render: () => (
    <div style={{ maxWidth: 1460 }}>
      <BankTransactionList
        transactions={ROWS}
        caseHref={caseHref}
        openHref="#zuordnen"
        head={HEAD}
        rowHref={(t) => `#zahlung-${t.id}`}
      />
    </div>
  ),
};

/**
 * `expand`: die Aufteilung einer Z3-Zeile steht **unter** ihr. Nur 4 % der
 * Zeilen haben etwas darin — deshalb sagt der Aufrufer, was drinsteht, und
 * nicht die Liste.
 */
export const Expanded: Story = {
  render: () => (
    <div style={{ maxWidth: 1460 }}>
      <BankTransactionList
        transactions={ROWS}
        caseHref={caseHref}
        openHref="#zuordnen"
        head={HEAD}
        expand={(t) =>
          t.cases.length > 0 ? (
            <div style={{ display: "grid", gap: "var(--space-2)" }}>
              {t.cases.map((c) => (
                <div key={c.caseId} style={{ display: "flex", justifyContent: "space-between", maxWidth: 480 }}>
                  <span>
                    {c.caseNumber} · {c.title}
                  </span>
                  <Amount value={c.amount ?? null} currency={t.currency} size="sm" />
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", maxWidth: 480, fontWeight: 600 }}>
                <span>zugeordnet</span>
                <Amount value={t.allocatedSum} currency={t.currency} size="sm" />
              </div>
            </div>
          ) : (
            <span className="v2muted">Diese Zahlung gehört noch keinem Sachverhalt.</span>
          )
        }
      />
    </div>
  ),
};

/**
 * Leer heißt hier **weder Erfolg noch Lücke**: ein Konto, auf dem im Zeitraum
 * kein Geld bewegt wurde, ist nicht fertig und nicht kaputt. Deshalb trägt der
 * Satz keinen Haken.
 */
export const Empty: Story = {
  render: () => (
    <div style={{ maxWidth: 1460 }}>
      <BankTransactionList transactions={[]} caseHref={caseHref} head={HEAD} />
    </div>
  ),
};

/** Leer wegen des Filters — ein anderer Satz und ein Weg zurück. */
export const EmptyAfterFilter: Story = {
  render: () => (
    <div style={{ maxWidth: 1460 }}>
      <BankTransactionList
        transactions={[]}
        caseHref={caseHref}
        head={HEAD}
        filtered={{ summary: "Miete · nur offene", resetHref: "#alle" }}
      />
    </div>
  ),
};

/** Lädt und Fehler — beide gehören der Liste, nicht der Zeile. */
export const LoadingAndError: Story = {
  render: () => (
    <div style={{ maxWidth: 1460, display: "grid", gap: "var(--space-6)" }}>
      <BankTransactionList transactions={[]} caseHref={caseHref} head={HEAD} loading />
      <BankTransactionList
        transactions={[]}
        caseHref={caseHref}
        head={HEAD}
        error={{
          message:
            "Der Kontoauszug konnte nicht geladen werden. Der Import-Lauf vom 01.09. ist noch nicht durch.",
          retry: <Button onClick={() => {}}>Erneut laden</Button>,
        }}
      />
    </div>
  ),
};

/**
 * Der Saldo steht **unter** der Liste, nie in der Zeile: ein laufender Saldo je
 * Zeile stimmt nur bei genau einer Sortierung und keinem Filter — und diese
 * Liste ist beides. Solange die Zahlen fehlen (L-58), bleibt der Fuß eine
 * benannte Lücke.
 */
export const WithFooter: Story = {
  render: () => (
    <div style={{ maxWidth: 1460 }}>
      <BankTransactionList
        transactions={ROWS}
        caseHref={caseHref}
        openHref="#zuordnen"
        head={HEAD}
        footer={
          <span className="v2sub">
            Saldo zum 31.08.2026: noch nicht verfügbar — die Zahlen stehen am Import-Lauf,
            nicht an der Zeile (Befund L-58).
          </span>
        }
      />
    </div>
  ),
};

/**
 * Rand: die **breitesten** Werte, die jede Spalte tragen kann — der längste
 * Text der Achse `bank_match_stage` („außerhalb des Bestands"), der längste
 * der Achse `ereignis` („Keine Buchung nötig") in einer Zeile mit zwei
 * Sachverhalten, ein dreistelliger Klärungszähler, ein siebenstelliger Betrag
 * und ein Zweck ohne Leerzeichen. Die festen Spuren sind daran gemessen; ein
 * Wert, der über seine Spur läuft, steht sonst im Nachbarn.
 */
export const Extremes: Story = {
  render: () => (
    <div style={{ maxWidth: 1460 }}>
      <BankTransactionList
        transactions={[
          T({
            id: "x-1",
            counterpartyName: null,
            // The long part is in **SVWZ**, not the EREF chain: the column shows the
            // plain text, the chain goes into the foldout (0085, finding 2).
            purpose:
              "EREF+VERTRAGSNUMMER-2026-000441827-RATE-014-VON-036 SVWZ+Leasingrate Fuhrpark 014 von 036, Fahrzeug MUS-AB 1234, Sonderzahlung anteilig verrechnet",
            matchStage: "beyond_bookings",
            amount: -1234567.89,
            openClarificationsCount: 128,
            cases: [
              CASE({ caseId: "c-a", caseNumber: "2026-0412", eventBookingState: null, noBookingRequiredReason: "private_expense" }),
              CASE({ caseId: "c-b", caseNumber: "2026-0413", eventBookingState: "open" }),
            ],
            allocatedSum: 1000000,
          }),
          T({
            id: "x-2",
            counterpartyName: "Musterbau Generalunternehmung Süddeutschland GmbH & Co. KG",
            matchStage: "alias",
            amount: 9999999.99,
            cases: [CASE({ caseId: "c-c", eventBookingState: "accepted" })],
          }),
        ]}
        caseHref={caseHref}
        openHref="#zuordnen"
        head={HEAD}
      />
    </div>
  ),
};

/** Im Einsatz: die Seite mit Kopf und Filter über der Karte. */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 1460, display: "grid", gap: "var(--space-4)" }}>
      <PageHeader
        overline="Musterbau GmbH · Wirtschaftsjahr 2026"
        title="Commerzbank · 1210"
        description="Auszug 004 · April 2026. Drei von sieben Zahlungen sind gebucht."
      />
      {/* Search, the assignment filter and — since 0193 — „nicht gebucht": the
          question the statement is read for. The filter belongs to the page
          (URL); the list shows its result. */}
      <FilterBar resetHref="#alle">
        <Field label="Suche" htmlFor="q">
          <Input id="q" type="search" placeholder="Zweck, IBAN, Betrag" />
        </Field>
        <Field label="Zuordnung" htmlFor="z">
          <Select id="z" defaultValue="alle">
            <option value="alle">alle</option>
            <option value="offen">nur offene</option>
          </Select>
        </Field>
        <Field label="Buchung" htmlFor="b">
          <Select id="b" defaultValue="alle">
            <option value="alle">alle</option>
            <option value="nicht-gebucht">nicht gebucht</option>
          </Select>
        </Field>
      </FilterBar>
      <BankTransactionList
        transactions={STATEMENT_004}
        caseHref={caseHref}
        openHref="#zuordnen"
        listHref={listHref}
        sort={{ key: "postingDate", dir: "desc" }}
        pager={{ page: 1, pageSize: 25, totalItems: 7, totalPages: 1 }}
        head={{ title: "Kontoauszug", sub: "Commerzbank · 1210 · 01.04. bis 30.04.2026" }}
        booked={{ booked: 3, total: 7 }}
        expand={(t) => <BankTransactionFoldout transaction={t} caseHref={caseHref} />}
      />
    </div>
  ),
};

// The year of the account, counted by month under the page's filter (0194).
const MONTHS: PeriodCount[] = [
  { date: "2025-05", count: 21 },
  { date: "2025-06", count: 19 },
  { date: "2025-07", count: 24 },
  { date: "2025-08", count: 16 },
  { date: "2025-09", count: 22 },
  { date: "2025-10", count: 18 },
  { date: "2025-11", count: 23 },
  { date: "2025-12", count: 31 },
  { date: "2026-01", count: 12 },
  { date: "2026-02", count: 19 },
  { date: "2026-03", count: 26 },
  { date: "2026-04", count: 7 },
];

/**
 * **Sprung zu einem Monat** (0194) — die Sonderansicht, die nur erscheint, wo
 * die Seite sie ausdrücklich einbaut: unter dem Filter, über der Liste. Jede
 * Säule führt über `periodPage` auf die Seite, auf der ihr Monat beginnt;
 * „Springe zu" nimmt ein Datum. Nur bei Sortierung nach Buchungsdatum — nach
 * Betrag sortiert gibt es keinen „Punkt März". Die Zeilen sind der
 * April-Ausschnitt der Fixture, nicht eine volle Seite von 25.
 */
export const JumpToMonth: Story = {
  render: () => (
    <div style={{ maxWidth: 1460, display: "grid", gap: "var(--space-4)" }}>
      <PageHeader overline="Musterbau GmbH · Wirtschaftsjahr 2026" title="Commerzbank · 1210" />
      <FilterBar resetHref="#alle">
        <Field label="Suche" htmlFor="q2">
          <Input id="q2" type="search" placeholder="Zweck, IBAN, Betrag" />
        </Field>
        <Field label="Buchung" htmlFor="b2">
          <Select id="b2" defaultValue="alle">
            <option value="alle">alle</option>
            <option value="nicht-gebucht">nicht gebucht</option>
          </Select>
        </Field>
      </FilterBar>
      <PeriodJump
        periods={MONTHS}
        href={(month) =>
          listHref({ sort: "postingDate", dir: "desc", page: periodPage(MONTHS, month, { pageSize: 25, dir: "desc" }) })
        }
        current={{ from: "2026-04-30", to: "2026-04-01" }}
        unit={["Zahlung", "Zahlungen"]}
        ariaLabel="Kontoauszug: zu einem Monat springen"
        dateForm={{ action: "#auszug", name: "ab", hidden: { sort: "postingDate", dir: "desc" } }}
      />
      <BankTransactionList
        transactions={STATEMENT_004}
        caseHref={caseHref}
        openHref="#zuordnen"
        listHref={listHref}
        sort={{ key: "postingDate", dir: "desc" }}
        pager={{ page: 1, pageSize: 25, totalItems: 238, totalPages: 10 }}
        head={{ title: "Kontoauszug", sub: "Commerzbank · 1210 · 01.05.2025 bis 30.04.2026" }}
        booked={{ booked: 201, total: 238 }}
        expand={(t) => <BankTransactionFoldout transaction={t} caseHref={caseHref} />}
      />
    </div>
  ),
};

/**
 * **„x von y gebucht"** im Kopf (0193): gezählt vom Aufrufer mit der Regel der
 * Domäne (L-340), über den ganzen Filter, nicht über diese Seite. In der
 * Spalte Buchung je Zeile der Haken oder das, was sie aufhält. Standardspalten
 * nach 0193 — die DATEV-Historie ist nicht mehr dabei.
 */
export const Booked: Story = {
  render: () => (
    <BankTransactionList
      transactions={STATEMENT_004}
      caseHref={(id) => `#fall-${id}`}
      openHref="#zuordnen"
      head={{ title: "Commerzbank · 1210", sub: "April 2026" }}
      booked={{ booked: 3, total: 7 }}
    />
  ),
};

/**
 * Zuschaltbar (0193): Valuta, IBAN, Quelle und Import stehen im Drawer; die
 * **DATEV-Historie** schaltet der Aufrufer als Spalte zu, wo die Prüffrage vor
 * dem Lauf gestellt wird. Hier derselbe Auszug mit ihr.
 */
export const OptionalColumns: Story = {
  render: () => (
    <BankTransactionList
      transactions={STATEMENT_004}
      caseHref={(id) => `#fall-${id}`}
      head={{ title: "Commerzbank · 1210", sub: "mit DATEV-Historie" }}
      columns={["postingDate", "counterparty", "purpose", "cases", "eventState", "matchStage", "clarifications", "amount"]}
    />
  ),
};
