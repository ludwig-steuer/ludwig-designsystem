import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import type {
  BusinessPartnerDetail,
  PartnerPersonalAccount,
} from "@/ludwig/modules/business-partners/domain/business-partner";

import { Button } from "../../primitives/Button";
import { FieldList } from "../../primitives/FieldList";
import { BusinessPartnerDrawer, type PartnerTab } from "./BusinessPartnerDrawer";

const meta: Meta<typeof BusinessPartnerDrawer> = {
  title: "v3/Entitäten/Geschäftspartner/BusinessPartnerDrawer",
  component: BusinessPartnerDrawer,
};
export default meta;
type Story = StoryObj<typeof BusinessPartnerDrawer>;

const tabHref = (t: PartnerTab) => `?partner=p-1&tab=${t}`;
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

function konto(over: Partial<PartnerPersonalAccount> & { accountId: string }): PartnerPersonalAccount {
  return {
    fiscalYear: 2026,
    fiscalYearStatus: "open",
    role: "creditor",
    accountNumber: "70001",
    accountName: "Musterfirma Immobilien GmbH",
    source: "onboarding_import",
    status: "active",
    datevSyncState: "synced",
    datevAccountId: null,
    datevAddresseeId: null,
    usageBookingCount: 12,
    lastBookingDate: "2026-08-01",
    isInternal: false,
    ...over,
  };
}

/** Der Drawer steht offen — so sieht ihn, wer aus einer Sachverhaltszeile kommt. */
function Offen({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: 720 }}>{children}</div>;
}

/**
 * Der Regelfall: Fakten, ein Personenkonto als **Liste**, vier Sachverhalte als
 * **Zahl mit Weg**, der Fuß-Knopf auf den Partner ohne Reiter.
 *
 * Vier Ziele also — drei „mehr dazu" plus der Fuß. Das weicht von A10 ab, und
 * zwar mit Absicht: wenn der Drawer eine Übersicht über drei Bereiche ist,
 * führt jeder Bereich woandershin, und ein einzelner Knopf zwänge die
 * Sachbearbeiterin, den Reiter noch einmal zu suchen, den sie gerade angesehen
 * hat.
 */
export const Filled: Story = {
  render: () => (
    <Offen>
      <BusinessPartnerDrawer
        open
        onClose={() => {}}
        partner={detail()}
        accounts={[konto({ accountId: "a-1" })]}
        caseCount={4}
        tabHref={tabHref}
        href="?partner=p-1"
        accountHref={accountHref}
      />
    </Offen>
  ),
};

/**
 * Der Partner **ohne jedes Personenkonto** — zwei von 14.950. Die Kontenliste
 * entfällt ganz, und mit ihr ihr Weg: ein Abriss ohne Deckung ist keine leere
 * Karte, sondern gar keine.
 */
export const WithoutAccounts: Story = {
  render: () => (
    <Offen>
      <BusinessPartnerDrawer
        open
        onClose={() => {}}
        partner={detail({
          legalName: "Testbank eG",
          shortName: null,
          creditorAccount: null,
          usageBookingCount: 0,
          lastBookingDate: null,
        })}
        accounts={[]}
        caseCount={1}
        tabHref={tabHref}
        href="?partner=p-1"
      />
    </Offen>
  ),
};

/**
 * Mit und ohne `renderBookingBehaviour`. Der dritte Abriss ist ein **Rückruf**,
 * keine Prop mit Daten: übliches Gegenkonto und üblicher Steuerschlüssel sind
 * im Bestand zu 0 % gefüllt und werden heute im Sichtmodell der Stapelabnahme
 * gerechnet, nicht am Partner. Fehlt der Rückruf, fehlt der Abriss — kein
 * Platzhalter, keine leere Karte.
 */
export const WithBehaviour: Story = {
  render: () => (
    <Offen>
      <BusinessPartnerDrawer
        open
        onClose={() => {}}
        partner={detail()}
        accounts={[konto({ accountId: "a-1" })]}
        caseCount={4}
        tabHref={tabHref}
        href="?partner=p-1"
        accountHref={accountHref}
        renderBookingBehaviour={() => (
          <div style={{ padding: 16 }}>
            <FieldList
              tone="bare"
              rows={[
                ["Bucht sonst auf", "6815 Bürobedarf"],
                ["Steuerschlüssel", "9"],
                ["Letzte Buchung", "1.800,00 € am 01.08.2026"],
              ]}
            />
          </div>
        )}
      />
    </Offen>
  ),
};

/**
 * Der häufigste Fall im Bestand: ein Konto, **kein** Sachverhalt, kein
 * Verhalten. **Ein** Abriss, nicht drei leere — 99 % der Partner haben keinen
 * Sachverhalt.
 */
export const Sparse: Story = {
  render: () => (
    <Offen>
      <BusinessPartnerDrawer
        open
        onClose={() => {}}
        partner={detail({
          legalName: "Musterhandwerk Schmidt e. K.",
          shortName: null,
          city: null,
          ustIds: [],
          usageBookingCount: 0,
          lastBookingDate: null,
          businessDescription: null,
        })}
        accounts={[konto({ accountId: "a-2", accountNumber: "70044", usageBookingCount: 0, lastBookingDate: null })]}
        tabHref={tabHref}
        href="?partner=p-1"
        accountHref={accountHref}
      />
    </Offen>
  ),
};

/**
 * Der Rundlauf: öffnen, schließen mit `Esc` oder Kreuz — und der Fokus kehrt
 * zum Knopf zurück, der ihn geöffnet hat (V10). Ohne das landet die Tastatur
 * wieder oben auf der Seite.
 */
export const Roundtrip: Story = {
  render: function Rundlauf() {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ minHeight: 720, padding: 24 }}>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Geschäftspartner nachschlagen
        </Button>
        <BusinessPartnerDrawer
          open={open}
          onClose={() => setOpen(false)}
          partner={detail()}
          accounts={[konto({ accountId: "a-1" })]}
          caseCount={4}
          tabHref={tabHref}
          href="?partner=p-1"
          accountHref={accountHref}
        />
      </div>
    );
  },
};
