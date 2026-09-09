import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DataTable } from "../../patterns/DataTable";
import {
  businessPartnerColumns,
  type BusinessPartnerColumn,
  type BusinessPartnerRowData,
} from "./business-partner-columns";

const meta: Meta = {
  title: "v3/Entitäten/Geschäftspartner/businessPartnerColumns",
};
export default meta;
type Story = StoryObj;

const partnerHref = (id: string) => `?partner=${id}`;
const accountHref = (n: string) => `?konto=${n}`;

/**
 * Der Bestand in sechs Zeilen: 14.950 Partner über sechs Mandanten, 77 % davon
 * ohne eine einzige Buchung. Die Werte sind erfunden, die Verhältnisse nicht.
 */
function partner(over: Partial<BusinessPartnerRowData> & { businessPartnerId: string }): BusinessPartnerRowData {
  return {
    legalName: "Musterfirma Immobilien GmbH",
    shortName: null,
    city: "Musterstadt",
    onboardingState: "confirmed",
    usageBookingCount: 12,
    lastBookingDate: "2026-08-01",
    creditorAccount: { accountNumber: "70001", isInternal: false },
    debtorAccount: null,
    clearingAccounts: [],
    ...over,
  };
}

const SECHS: BusinessPartnerRowData[] = [
  partner({ businessPartnerId: "p-1", shortName: "MUSTERIMMO" }),
  partner({
    businessPartnerId: "p-2",
    legalName: "Musterbau Handels GmbH",
    creditorAccount: null,
    debtorAccount: { accountNumber: "10042", isInternal: false },
    city: "Beispielhausen",
    usageBookingCount: 4,
    lastBookingDate: "2026-07-14",
  }),
  partner({
    businessPartnerId: "p-3",
    legalName: "Beispiel-Energie AG",
    debtorAccount: { accountNumber: "10007", isInternal: false },
    usageBookingCount: 231,
    lastBookingDate: "2026-08-31",
  }),
  partner({
    businessPartnerId: "p-4",
    legalName: "Muster Reisekosten Sammelstelle",
    creditorAccount: null,
    clearingAccounts: [
      { accountNumber: "1360", isInternal: true },
      { accountNumber: "1361", isInternal: true },
    ],
    city: null,
    usageBookingCount: 0,
    lastBookingDate: null,
  }),
  partner({
    businessPartnerId: "p-5",
    legalName: "Testbank eG",
    creditorAccount: null,
    onboardingState: "proposed",
    city: null,
    usageBookingCount: 0,
    lastBookingDate: null,
  }),
  partner({
    businessPartnerId: "p-6",
    legalName: "Musterhandwerk Schmidt e. K.",
    usageBookingCount: 0,
    lastBookingDate: null,
    onboardingState: "draft",
  }),
];

function Frame({
  rows,
  columns,
  sub,
}: {
  rows: BusinessPartnerRowData[];
  columns?: readonly BusinessPartnerColumn[];
  sub: string;
}) {
  return (
    <div style={{ maxWidth: 1500 }}>
      <DataTable<BusinessPartnerRowData>
        head={{ title: "Geschäftspartner", sub }}
        rows={rows}
        columns={businessPartnerColumns({
          partnerHref,
          accountHref,
          ...(columns ? { columns } : {}),
        })}
        rowKey={(p) => p.businessPartnerId}
        minWidth={1180}
      />
    </div>
  );
}

/**
 * Acht Spalten, sechs Zeilen: einer mit Kreditorkonto, einer mit Debitorkonto,
 * ein Abrechner (beide Nummern leer, zwei Verrechnungskonten), zwei ohne jedes
 * Konto und einer ohne Buchungen.
 *
 * **Kein Wort für die Rolle** — die drei Kontospalten sagen sie genauer, als
 * ein Wort es könnte: nicht nur welche Art, sondern welche Nummer. Und eine
 * leere Kontospalte bleibt leer: „hat keins" ist etwas anderes als „wir wissen
 * es nicht", und ein Gedankenstrich läse sich wie das zweite.
 */
export const Filled: Story = {
  render: () => <Frame rows={SECHS} sub="6 von 6.363 · der Bestand in seinen Verhältnissen" />,
};

/**
 * Ein kürzerer Satz über `columns`. Die Prop **wählt aus**, sie ordnet nicht
 * um: die Rangordnung des Profils gilt in jeder Form dieser Familie — hier
 * absichtlich in verdrehter Reihenfolge übergeben, und die Tabelle stellt sie
 * trotzdem wieder her.
 */
export const Narrow: Story = {
  render: () => (
    <Frame
      rows={SECHS}
      columns={["bookings", "partner", "creditorAccount"]}
      sub="drei Spalten, verdreht übergeben — die Ordnung bleibt die des Profils"
    />
  ),
};

/**
 * Die drei Reifegrade nebeneinander. Im Bestand: `confirmed` 14.912 ·
 * `proposed` 36 · `draft` 2 — deshalb steht die Marke in der Liste und nicht in
 * der Zelle, wo sie 99,7 % der Zeit dasselbe sagen würde.
 */
export const States: Story = {
  render: () => (
    <Frame
      rows={[SECHS[0]!, SECHS[4]!, SECHS[5]!]}
      columns={["partner", "onboarding", "bookings"]}
      sub="confirmed · proposed · draft"
    />
  ),
};

/**
 * Der Rand: ein Name mit 50 Zeichen (Maximum im Bestand), drei
 * Verrechnungskonten in einer Zelle, `usageBookingCount: 0` — die **0** steht
 * da, sie ist die nützlichste Aussage dieser Spalte —, und ein Ort, der fehlt.
 */
export const Edges: Story = {
  render: () => (
    <Frame
      rows={[
        partner({
          businessPartnerId: "e-1",
          legalName: "Musterfirma Immobilienverwaltung Nord GmbH & Co. KG",
          shortName: "Musterfirma Imm",
          city: "Beispielhausen an der Musterstraße",
          usageBookingCount: 0,
          lastBookingDate: null,
        }),
        partner({
          businessPartnerId: "e-2",
          legalName: "Muster Kartenabrechnung",
          creditorAccount: null,
          clearingAccounts: [
            { accountNumber: "1360", isInternal: true },
            { accountNumber: "1361", isInternal: true },
            { accountNumber: "1362", isInternal: true },
          ],
          city: null,
          usageBookingCount: 0,
          lastBookingDate: null,
        }),
      ]}
      sub="50 Zeichen · drei Verrechnungskonten · 0 Buchungen · kein Ort"
    />
  ),
};

/**
 * Im Einsatz: 25 Zeilen mit Pager und Spaltenkopf — so stellt 0128 sie. Der
 * Umfang ist der Punkt dieser Liste: p50 563, p90 6.363 Zeilen je Mandant.
 */
export const InUse: Story = {
  render: () => (
    <Frame
      rows={Array.from({ length: 25 }, (_, i) =>
        partner({
          businessPartnerId: `u-${i}`,
          legalName: `Musterfirma ${i + 1} GmbH`,
          creditorAccount: { accountNumber: `700${String(i + 10).padStart(2, "0")}`, isInternal: false },
          usageBookingCount: i % 4 === 0 ? 0 : i * 3,
          lastBookingDate: i % 4 === 0 ? null : "2026-08-12",
        }),
      )}
      sub="25 von 6.363"
    />
  ),
};
