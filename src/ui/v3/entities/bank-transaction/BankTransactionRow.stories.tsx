import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BankTransactionRow } from "./BankTransactionRow";
import { bankTransactionColumns, bankTransactionTracks } from "./bank-transaction-columns";
import type { BankTransactionRowData, CaseAssignment } from "./bank-transaction";
import { Card, CardHead, HeadRow, Table } from "../../primitives/Table";
import { StatusInfoButton } from "../../patterns/StatusInfoButton";

const meta: Meta<typeof BankTransactionRow> = {
  title: "v3/Entitäten/Kontoauszugsposition/BankTransactionRow",
  component: BankTransactionRow,
};
export default meta;
type Story = StoryObj<typeof BankTransactionRow>;

const caseHref = (id: string) => `#fall-${id}`;

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

const BASE: BankTransactionRowData = {
  id: "bt-1",
  postingDate: "2026-08-26",
  amount: -1249.9,
  currency: "EUR",
  counterpartyName: "Bürobedarf Meier GmbH",
  purpose:
    "EREF+0600496348 MREF+D-VR-50411866-0-001 " +
    "SVWZ+Wartung Klimaanlage, Leistung 08/2026, Rechnung RE-4471",
  matchStage: "exact",
  cases: [CASE()],
  allocatedSum: 1249.9,
  openClarificationsCount: 0,
};

/**
 * Kopf und Spaltenmaße kommen aus **demselben** Satz wie die Zellen — sonst
 * schiebt sich der Kopf gegen die Zeile, sobald eine Breite sich ändert.
 */
const DEF = bankTransactionColumns({ caseHref: () => "#" });
const COLS = bankTransactionTracks(DEF);

function Frame({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div style={{ maxWidth: 1400 }}>
      <Card>
        <CardHead title="Kontoauszug August 2026" sub={sub ?? "Commerzbank · 1210"} />
        <Table cols={COLS} minWidth={1400}>
          <HeadRow>
            {DEF.map((c) => (
              <span key={c.key} className={c.align === "end" ? "v2num" : undefined}>
                {c.header}
                {/* Das (i) kommt aus dem Spaltensatz, nicht aus einer Liste
                    hier: von Hand gehängt fehlt ihm der Abstand, den die Regel
                    setzt — gemessen 0 px statt 4 (Abnahme 0101, M5). */}
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

/**
 * Alle acht Punkte: ein zugeordneter Fall, die DATEV-Stufe als Wort, der
 * Buchungs-Zustand des **Ereignisses** — nicht der des Sachverhalts.
 */
export const Filled: Story = {
  render: () => (
    <Frame>
      <BankTransactionRow transaction={BASE} caseHref={caseHref} openHref="#zuordnen" />
    </Frame>
  ),
};

/**
 * Z0 — die 65 %, um die es geht. „offen" steht als Wort mit Weg, nie als
 * Gedankenstrich. Buchung und Klärung bleiben leer: ohne Fall gibt es kein
 * Ereignis, an dem ein Zustand hinge.
 */
export const Unassigned: Story = {
  render: () => (
    <Frame sub="Commerzbank · 1210 — noch nicht zugeordnet">
      <BankTransactionRow
        transaction={{
          ...BASE,
          id: "bt-2",
          cases: [],
          allocatedSum: 0,
          matchStage: "unclear_none",
          counterpartyName: "Stadtwerke Musterstadt",
          purpose: "EREF+SW-2026-08 SVWZ+Abschlag Strom 08/2026",
          amount: -412,
        }}
        caseHref={caseHref}
        openHref="#zuordnen"
      />
    </Frame>
  ),
};

/**
 * Z3 — zwei Fälle, und ein Rest bleibt offen: 1.249,90 € minus 900,00 € minus
 * 200,00 € sind 149,90 €. Die Marke nennt genau diesen Wert, gerechnet von
 * `restOf()` aus dem Spiegel.
 */
export const Split: Story = {
  render: () => (
    <Frame sub="Commerzbank · 1210 — aufgeteilt">
      <BankTransactionRow
        transaction={{
          ...BASE,
          id: "bt-3",
          cases: [
            CASE({ amount: 900 }),
            CASE({
              caseId: "c-4488",
              caseNumber: "2026-0488",
              title: "Ersatzteile Kompressor",
              amount: 200,
              eventBookingState: null,
            }),
          ],
          allocatedSum: 1100,
          openClarificationsCount: 2,
        }}
        caseHref={caseHref}
        openHref="#zuordnen"
      />
    </Frame>
  ),
};

/**
 * `columns`: derselbe Satz Zellen, zwei Auswahlen. Die Worklist lässt
 * Zuordnung und Buchungs-Zustand weg — sie zeigt ja gerade die unzugeordneten
 * — und nimmt dafür das Konto auf, weil sie kontoübergreifend ist.
 */
export const Columns: Story = {
  render: () => (
    <div style={{ maxWidth: 1000 }}>
      <Card>
        <CardHead title="Worklist" sub="Alle Konten · nicht zugeordnet" />
        <Table
          cols={bankTransactionTracks(
            bankTransactionColumns({
              caseHref: () => "#",
              columns: ["postingDate", "counterparty", "purpose", "account", "matchStage", "amount"],
            }),
          )}
        >
          <HeadRow>
            <span>Datum</span>
            <span>Gegenpartei</span>
            <span>Verwendungszweck</span>
            <span>Konto</span>
            <span className="v2sth">
              DATEV-Historie <StatusInfoButton axis="bank_match_stage" />
            </span>
            <span className="v2num">Betrag</span>
          </HeadRow>
          <BankTransactionRow
            transaction={{ ...BASE, cases: [], allocatedSum: 0, matchStage: "beyond_bookings" }}
            caseHref={caseHref}
            accountLabel="Commerzbank · 1210"
            // **Verdreht übergeben**: `columns` wählt aus, es ordnet nicht —
            // die Zeile steht trotzdem in der Reihenfolge der Familie.
            columns={["amount", "matchStage", "account", "purpose", "counterparty", "postingDate"]}
          />
          <BankTransactionRow
            transaction={{
              ...BASE,
              id: "bt-9",
              cases: [],
              allocatedSum: 0,
              matchStage: "unclear_multi",
              counterpartyName: "Musterbau GmbH",
              amount: 1800,
              purpose: "EREF+RE-2026-0338 SVWZ+Zahlung Rechnung RE-2026-0338",
            }}
            caseHref={caseHref}
            accountLabel="Qonto · 4021"
            // **Verdreht übergeben**: `columns` wählt aus, es ordnet nicht —
            // die Zeile steht trotzdem in der Reihenfolge der Familie.
            columns={["amount", "matchStage", "account", "purpose", "counterparty", "postingDate"]}
          />
        </Table>
      </Card>
    </div>
  ),
};

/** `expanded`: die Unterzeilen je Fall mit Teilbetrag und der Summe darunter. */
export const Expanded: Story = {
  render: () => (
    <Frame sub="Commerzbank · 1210 — aufgeklappt">
      <BankTransactionRow
        transaction={{
          ...BASE,
          id: "bt-3",
          cases: [
            CASE({ amount: 900 }),
            CASE({
              caseId: "c-4488",
              caseNumber: "2026-0488",
              title: "Ersatzteile Kompressor",
              amount: 200,
              eventBookingState: null,
            }),
          ],
          allocatedSum: 1100,
        }}
        expanded
        caseHref={caseHref}
        openHref="#zuordnen"
      />
    </Frame>
  ),
};

/**
 * Im Einsatz: sechs Zeilen, wie der Auszug sie zeigt. Ein Eingang und fünf
 * Ausgänge — **alle Beträge in derselben Farbe**, das Vorzeichen ist die
 * Richtung. Über den Zustandsspalten steht das (i) der Achse (Z4).
 */
export const InUse: Story = {
  render: () => (
    <Frame>
      {[
        BASE,
        { ...BASE, id: "b2", postingDate: "2026-08-27", amount: 1800, counterpartyName: "Musterbau GmbH", purpose: "EREF+RE-2026-0338 SVWZ+Zahlung Rechnung RE-2026-0338", matchStage: "beleg", cases: [CASE({ caseId: "c-338", caseNumber: "2026-0338", title: "Ausgangsrechnung Musterbau", amount: 1800, eventBookingState: "posted" })], allocatedSum: 1800 },
        { ...BASE, id: "b3", postingDate: "2026-08-28", amount: -412, counterpartyName: "Stadtwerke Musterstadt", purpose: "EREF+SW-2026-08 SVWZ+Abschlag Strom 08/2026", matchStage: "no_account", cases: [], allocatedSum: 0 },
        { ...BASE, id: "b4", postingDate: "2026-08-29", amount: -89.9, counterpartyName: null, purpose: "SVWZ+Kontoführungsentgelt August 2026", matchStage: "exact", cases: [], allocatedSum: 0 },
        { ...BASE, id: "b5", postingDate: "2026-08-30", amount: -2480.55, counterpartyName: "Handwerk Schulz KG", purpose: "EREF+RE-8817 SVWZ+Sanierung Serverraum, Teilrechnung 2 von 3", matchStage: "near", cases: [CASE({ caseId: "c-8817", caseNumber: "2026-0451", title: "Sanierung Serverraum", amount: 2000, eventBookingState: null })], allocatedSum: 2000, openClarificationsCount: 1 },
        { ...BASE, id: "b6", postingDate: "2026-08-31", amount: -74.2, counterpartyName: "Deutsche Post AG", purpose: "SVWZ+Porto August 2026", matchStage: "beyond_bookings", cases: [CASE({ caseId: "c-9001", caseNumber: "2026-0499", title: "Porto", amount: 74.2, eventBookingState: null, noBookingRequiredReason: "Sammelbuchung am Monatsende, hier keine Einzelbuchung." })], allocatedSum: 74.2 },
      ].map((t) => (
        <BankTransactionRow key={t.id} transaction={t} caseHref={caseHref} openHref="#zuordnen" />
      ))}
    </Frame>
  ),
};
