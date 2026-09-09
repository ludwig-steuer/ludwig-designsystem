import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { BusinessPartnerDetail } from "@/ludwig/modules/business-partners/domain/business-partner";

import { Card, CardHead } from "../../primitives/Table";
import { BusinessPartnerFacts } from "./BusinessPartnerFacts";

const meta: Meta<typeof BusinessPartnerFacts> = {
  title: "v3/Entitäten/Geschäftspartner/BusinessPartnerFacts",
  component: BusinessPartnerFacts,
};
export default meta;
type Story = StoryObj<typeof BusinessPartnerFacts>;

const accountHref = (n: string) => `?konto=${n}`;

function detail(over: Partial<BusinessPartnerDetail> = {}): BusinessPartnerDetail {
  return {
    businessPartnerId: "p-1",
    clientId: "c-1",
    legalName: "Musterfirma Immobilien GmbH",
    shortName: "MUSTERIMMO",
    vatProfile: "domestic_standard",
    typicalNature: "service",
    onboardingState: "confirmed",
    usageBookingCount: 12,
    lastBookingDate: "2026-08-01",
    ustIds: ["DE000000000"],
    city: "Musterstadt",
    creditorAccount: { accountNumber: "70001", isInternal: false },
    debtorAccount: null,
    clearingAccounts: [],
    taxIds: [],
    addressLine1: "Musterstraße 12",
    postalCode: "12345",
    countryCode: null,
    websiteUrl: null,
    businessDescription: "Verwaltung und Vermietung eigener Immobilien",
    vatNotes: null,
    typicalCurrency: null,
    typicalPaymentTermDays: null,
    typicalPaymentType: null,
    typicalTaxKeys: [],
    source: "onboarding_import",
    createdAt: "2026-01-15T09:00:00Z",
    updatedAt: "2026-08-01T11:00:00Z",
    normalizedName: null,
    accountId: null,
    defaultDebitAccountNumber: null,
    profilingMetadata: null,
    ...over,
  };
}

function Frame({ children, sub }: { children: React.ReactNode; sub: string }) {
  return (
    <div style={{ maxWidth: 620 }}>
      <Card>
        <CardHead title="Geschäftspartner" sub={sub} />
        <div style={{ padding: 16 }}>{children}</div>
      </Card>
    </div>
  );
}

/**
 * Der Regelfall ohne `all`: **Wer**, **Konten**, **Bewegung**. Der Kurzname
 * steht, weil „MUSTERIMMO" etwas sagt, was der Name nicht sagt — wäre er eine
 * Kürzung des Namens, entfiele er.
 */
export const Filled: Story = {
  render: () => (
    <Frame sub="die kurze Form — so zeigt der Drawer sie">
      <BusinessPartnerFacts partner={detail()} accountHref={accountHref} />
    </Frame>
  ),
};

/**
 * Mit `all`: dazu **Verhalten** und **Herkunft**. „Dienstleistung" kommt seit
 * dem Spiegellauf vom 2026-09-09 aus `PARTNER_NATURE_LABEL` — vorher hätten
 * 924 Partner hier ein `undefined` getragen (L-222).
 *
 * **Das USt-Profil fehlt bewusst.** Seine Wörter leben privat in
 * `MasterDataTab.tsx` (L-223); eine lokale Map wäre R1 verletzt, und
 * `domestic_standard` roh hingeschrieben behauptet eine Auskunft, die es der
 * Kanzlei nicht gibt.
 *
 * **Der Reifegrad steht in „Herkunft"**, nicht oben: er ist zu 99,7 %
 * `confirmed`, und eine Marke, die fast immer dasselbe sagt, gehört nicht an
 * die erste Stelle. Wo er abweicht, sagt er etwas über die Herkunft des
 * Satzes, nicht über den Partner.
 */
export const All: Story = {
  render: () => (
    <Frame sub="die ganze Form — so zeigt der View sie">
      <BusinessPartnerFacts partner={detail()} all accountHref={accountHref} />
    </Frame>
  ),
};

/**
 * Der häufigste Fall im Bestand: ein Konto, **keine** Buchung, sonst nichts.
 * Zwei Gruppen, drei Zeilen — keine leeren Striche. 77 % der 14.950 Partner
 * sehen so aus.
 *
 * Die **0** bei den Buchungen steht da: sie ist bei dieser Verteilung die
 * nützlichste Aussage der ganzen Karte.
 */
export const Sparse: Story = {
  render: () => (
    <Frame sub="ein Konto, keine Buchung, sonst nichts">
      <BusinessPartnerFacts
        partner={detail({
          legalName: "Musterhandwerk Schmidt e. K.",
          shortName: null,
          city: null,
          ustIds: [],
          usageBookingCount: 0,
          lastBookingDate: null,
          businessDescription: null,
          typicalNature: "unknown",
        })}
        accountHref={accountHref}
      />
    </Frame>
  ),
};

/**
 * Der Satz des Aufrufers über der ersten Gruppe. Heute genau einer: ein
 * Partner ohne Personenkonto wird nirgends bebucht — im Bestand sind das
 * **zwei von 14.950**, und genau deshalb lohnt der Hinweis, wenn er zutrifft.
 */
export const Hints: Story = {
  render: () => (
    <Frame sub="ein Partner ohne jedes Personenkonto">
      <BusinessPartnerFacts
        partner={detail({
          legalName: "Testbank eG",
          shortName: null,
          creditorAccount: null,
          usageBookingCount: 0,
          lastBookingDate: null,
        })}
        hints={["Ohne Personenkonto: dieser Partner wird nirgends bebucht."]}
        accountHref={accountHref}
      />
    </Frame>
  ),
};

/**
 * Der Rand: ein Name mit 50 Zeichen, eine Beschreibung mit 101 (das Maximum im
 * Bestand), drei Verrechnungskonten in einer Zeile — und ein Ort, der fehlt,
 * während eine Anschrift steht. Die Zeile „Anschrift" setzt sich aus dem
 * zusammen, was da ist.
 */
export const Edges: Story = {
  render: () => (
    <Frame sub="50 Zeichen · 101 Zeichen · drei Verrechnungskonten · kein Ort">
      <BusinessPartnerFacts
        partner={detail({
          legalName: "Musterfirma Immobilienverwaltung Nord GmbH & Co. KG",
          shortName: "Musterfirma Imm",
          city: null,
          creditorAccount: null,
          clearingAccounts: [
            { accountNumber: "1360", isInternal: true },
            { accountNumber: "1361", isInternal: true },
            { accountNumber: "1362", isInternal: true },
          ],
          businessDescription:
            "Verwaltung, Vermietung und Verpachtung eigener Immobilien sowie die Betreuung fremder Objekte",
          onboardingState: "proposed",
        })}
        all
        accountHref={accountHref}
      />
    </Frame>
  ),
};
