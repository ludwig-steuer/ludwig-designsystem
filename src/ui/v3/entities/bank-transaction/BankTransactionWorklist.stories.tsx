import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { BankTransactionWorklist } from "./BankTransactionWorklist";
import type { BankTransactionRowData } from "./bank-transaction";
import type { BulkAction } from "../../primitives/Selection";
import { Button } from "../../primitives/Button";
import { PageHeader } from "../../primitives/PageHeader";

const meta: Meta<typeof BankTransactionWorklist> = {
  title: "v3/Entitäten/Kontoauszugsposition/BankTransactionWorklist",
  component: BankTransactionWorklist,
};
export default meta;
type Story = StoryObj<typeof BankTransactionWorklist>;

const caseHref = (id: string) => `#fall-${id}`;

const T = (over: Partial<BankTransactionRowData>): BankTransactionRowData => ({
  id: "bt-1",
  postingDate: "2026-08-26",
  amount: -412,
  currency: "EUR",
  counterpartyName: "Stadtwerke Musterstadt",
  purpose: "EREF+SW-2026-08 SVWZ+Abschlag Strom 08/2026",
  matchStage: "unclear_none",
  cases: [],
  allocatedSum: 0,
  openClarificationsCount: 0,
  ...over,
});

// Newest first — the profile's sort order.
const OPEN: BankTransactionRowData[] = [
  T({ id: "o-4", postingDate: "2026-08-31", amount: -1799, counterpartyName: "Fuhrpark Leasing AG", purpose: "EREF+VERTRAG-2026-000441827 SVWZ+Leasingrate 14 von 36", matchStage: "no_account" }),
  T({ id: "o-3", postingDate: "2026-08-28", amount: 240, counterpartyName: "Musterbau GmbH", purpose: "SVWZ+Gutschrift Retoure", matchStage: "unclear_multi" }),
  T({ id: "o-2", postingDate: "2026-08-27", amount: -89.9, counterpartyName: null, purpose: "SVWZ+Kontoführungsentgelt August 2026", matchStage: "beyond_bookings" }),
  T({ id: "o-1" }),
];

const HEAD = { title: "Offene Zahlungen", sub: "Commerzbank · 1210 · 4 von 251" };

/**
 * Die beiden Sammelaktionen im Rundlauf. **Welcher** Sachverhalt es wird,
 * entscheidet der Aufrufer: der `CasePicker` (0084) ist nicht gebaut, und eine
 * Liste, die selbst einen öffnete, entschiede etwas, das ihr nicht gehört.
 */
export const Filled: Story = {
  render: function Render() {
    const [last, setLast] = useState<string | null>(null);
    const actions: BulkAction[] = [
      {
        label: "Neuen Sachverhalt anlegen",
        hotkey: "N",
        action: async (keys) => {
          setLast(`Neuer Sachverhalt aus ${keys.length} Zahlung(en)`);
        },
      },
      {
        label: "Bestehendem zuordnen",
        action: async (keys) => {
          setLast(`${keys.length} Zahlung(en) an den Sachverhalt des Aufrufers`);
        },
      },
    ];
    return (
      <div style={{ maxWidth: 1250, display: "grid", gap: "var(--space-3)" }}>
        <BankTransactionWorklist
          transactions={OPEN}
          caseHref={caseHref}
          head={HEAD}
          bulkActions={actions}
        />
        <span className="v2sub">{last ?? "Noch nichts ausgelöst."}</span>
      </div>
    );
  },
};

/**
 * **Erweitern, nicht umordnen.** Der Vorgabesatz ist Datum · Gegenpartei ·
 * Verwendungszweck · Sachverhalt · Betrag; hier kommt `matchStage` dazu — und
 * `columns` wird **verwürfelt** übergeben. Die Kopfzeile steht trotzdem in der
 * Reihenfolge des Katalogs: `columns` wählt aus, es ordnet nicht um.
 *
 * Der Satz muss dafür eine **Obermenge** der Vorgabe sein. Vorher fehlte
 * `cases` darin, und die Story zeigte fünf Spalten mit DATEV **anstelle** des
 * Sachverhalts — bewiesen war damit „ordnet nicht um", nicht „erweitert"
 * (Abnahme 2026-09-07, M2 und M3).
 */
export const WithMatchStage: Story = {
  render: () => (
    <div style={{ maxWidth: 1250 }}>
      <BankTransactionWorklist
        transactions={OPEN}
        caseHref={caseHref}
        head={HEAD}
        columns={["matchStage", "amount", "purpose", "cases", "postingDate", "counterparty"]}
        bulkActions={[]}
      />
    </div>
  ),
};

/**
 * Der **zweite Aufrufer**: die Konfigurationsseite eines Bankkontos listet
 * *jede* Zahlung, nicht nur die offenen — 500 Zeilen am Stück. Deshalb reicht
 * die Liste Sortierung und Pager durch, obwohl der erste Aufrufer sie selten
 * braucht: 500 Zeilen ohne Pager sind keine Liste, sondern eine Abschneidung.
 * In dieser Grundgesamtheit ist die Sachverhalts-Spalte auch gefüllt.
 */
export const AllOfAnAccount: Story = {
  render: () => (
    <div style={{ maxWidth: 1250 }}>
      <BankTransactionWorklist
        transactions={[
          ...OPEN.slice(0, 2),
          T({
            id: "a-1",
            postingDate: "2026-08-26",
            amount: -1249.9,
            counterpartyName: "Bürobedarf Meier GmbH",
            purpose: "EREF+0600496348 SVWZ+Wartung Klimaanlage",
            matchStage: "exact",
            cases: [
              {
                caseId: "c-4412",
                caseNumber: "2026-0412",
                fiscalYear: 2026,
                title: "Wartung der Klimaanlage",
                kind: "incoming_invoice",
                counterpartyName: "Bürobedarf Meier GmbH",
                lifecycleStatus: "open",
                amount: 1249.9,
                currency: "EUR",
                eventBookingState: "posted",
                noBookingRequiredReason: null,
              },
            ],
            allocatedSum: 1249.9,
          }),
          // Without counterparty — then the purpose carries the row link (N4). Before
          // 2026-09-07 no story of this list showed it.
          T({
            id: "a-2",
            postingDate: "2026-08-25",
            amount: -89.9,
            counterpartyName: null,
            purpose: "SEPA-Lastschrift Kartenzahlung 8842",
            matchStage: "none",
          }),
        ]}
        caseHref={caseHref}
        openHref="#zuordnen"
        head={{ title: "Zahlungen", sub: "Commerzbank · 1210 · alle 500" }}
        bulkActions={[]}
        // The configuration page looks rows up — the way into the detail belongs
        // here. The link sits on the counterparty, not the date.
        rowHref={(t) => `#zahlung-${t.id}`}
        listHref={(p) => `#konto?sort=${p.sort ?? ""}&dir=${p.dir ?? ""}&page=${p.page ?? 1}`}
        sort={{ key: "postingDate", dir: "desc" }}
        pager={{ page: 1, pageSize: 100, totalItems: 500, totalPages: 5 }}
      />
    </div>
  ),
};

/** Nichts offen ist hier ein **Erfolg** — und sagt es mit dem Haken. */
export const Empty: Story = {
  render: () => (
    <div style={{ maxWidth: 1250 }}>
      <BankTransactionWorklist
        transactions={[]}
        caseHref={caseHref}
        head={{ title: "Offene Zahlungen", sub: "Commerzbank · 1210 · 0 von 251 offen" }}
        bulkActions={[]}
        total={251}
      />
    </div>
  ),
};

/** Lädt und Fehler — der Fehler nennt Ursache und nächsten Schritt (T5). */
export const LoadingAndError: Story = {
  render: () => (
    <div style={{ maxWidth: 1250, display: "grid", gap: "var(--space-6)" }}>
      <BankTransactionWorklist transactions={[]} caseHref={caseHref} head={HEAD} bulkActions={[]} loading />
      <BankTransactionWorklist
        transactions={[]}
        caseHref={caseHref}
        head={HEAD}
        bulkActions={[]}
        error={{
          message:
            "Die offenen Zahlungen konnten nicht geladen werden. Der Abgleich-Lauf vom 01.09. steht noch aus.",
          retry: <Button onClick={() => {}}>Erneut laden</Button>,
        }}
      />
    </div>
  ),
};

/**
 * Im Einsatz: die Seite gruppiert nach Konto und stellt **je Konto eine**
 * Liste. Das Gruppieren gehört der Seite — sie weiß, welche Konten es gibt;
 * die Liste weiß nur ihres.
 */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 1250, display: "grid", gap: "var(--space-5)" }}>
      <PageHeader
        overline="Musterbau GmbH · Wirtschaftsjahr 2026"
        title="Offene Zahlungen"
        description="Sechs Zahlungen auf zwei Konten gehören noch keinem Sachverhalt."
      />
      <BankTransactionWorklist
        transactions={OPEN}
        caseHref={caseHref}
        head={{ title: "Commerzbank · 1210", sub: "4 offen" }}
        bulkActions={[]}
      />
      <BankTransactionWorklist
        transactions={[T({ id: "s-1", postingDate: "2026-08-29", amount: -55.4, counterpartyName: "Deutsche Post AG", purpose: "SVWZ+Porto August", matchStage: "unclear_none" }), T({ id: "s-2", postingDate: "2026-08-30", amount: -18.9, counterpartyName: null, purpose: "SVWZ+Kartenzahlung 30.08.2026", matchStage: "unclear_none" })]}
        caseHref={caseHref}
        head={{ title: "Sparkasse · 1220", sub: "2 offen" }}
        bulkActions={[]}
      />
    </div>
  ),
};
