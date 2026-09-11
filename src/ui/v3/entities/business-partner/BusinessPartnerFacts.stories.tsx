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

const accountHref = (n: string) => `?account=${n}`;

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
 * **Das USt-Profil steht jetzt dabei** (L-223, erledigt am 2026-09-10). Es
 * hat auf seine Wörter gewartet: `PARTNER_VAT_PROFILE_LABEL` lag privat in
 * `MasterDataTab.tsx`, und `domestic_reverse_charge` roh hingeschrieben hätte
 * eine Auskunft behauptet, die es der Kanzlei nicht gibt.
 *
 * Es steht **vor** der typischen Lieferung, weil es die stärkere Antwort auf
 * dieselbe Frage ist: gefüllt bei 11 % des Bestands, aber bei 75 % der
 * Partner, auf die überhaupt gebucht wird. `unknown` fällt weg — ein Profil,
 * das niemand bestimmt hat, ist keines, und eine leere Zeile machte aus
 * „nicht angesehen" ein „hat keins".
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

/**
 * Mit `underHead`: die Fakten unter dem Kopf der eigenen Seite — die
 * Übersicht des Partners. Name, Ort und das Konto, unter dem gebucht wird,
 * stehen dort schon; hier fallen sie weg (D7, Owner 2026-09-11). Übrig bleibt,
 * was der Kopf nicht sagt: Kurzname, USt-IdNr., Bewegung.
 *
 * Rechts der Abrechner ohne Personenkonto: sein Kopf nennt die
 * Verrechnungskonten, also fallen sie hier. Der Drawer hat keinen solchen Kopf
 * und zeigt weiter alles (`Filled`).
 */
export const UnderHead: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "start" }}>
      <Frame sub="unter dem Kopf — Name, Ort, Kreditorkonto stehen dort">
        <BusinessPartnerFacts partner={detail()} underHead accountHref={accountHref} />
      </Frame>
      <Frame sub="der Abrechner — der Kopf nennt die Verrechnungskonten">
        <BusinessPartnerFacts
          partner={detail({
            legalName: "Beispiel-Payments B.V.",
            shortName: null,
            city: null,
            ustIds: [],
            creditorAccount: null,
            clearingAccounts: [{ accountNumber: "1370", isInternal: false }],
          })}
          underHead
          accountHref={accountHref}
        />
      </Frame>
    </div>
  ),
};
