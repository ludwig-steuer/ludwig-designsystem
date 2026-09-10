import type { BusinessPartnerDetail } from "@/ludwig/modules/business-partners/domain/business-partner";

/**
 * Synthetische Geschäftspartner für die Seiten-Stories (0127).
 *
 * **Keine echten Daten.** Namen sind erfunden und erkennbar so (Musterfirma,
 * Beispielbau, Testhandel); keine echte USt-IdNr., keine Anschrift aus dem
 * Bestand. Kontonummern liegen im SKR-Bereich, sind aber frei gewählt.
 *
 * Ein Bauer mit dem Normalfall als Vorgabe — ein bestätigter Kreditor mit
 * Buchungen —, und jede Story überschreibt nur, was sie beweist. Die Zahlen
 * hinter den Fällen stehen im Seitenprofil `docs/seiten/partner-detail.md`:
 * 77 % der Partner haben **null** Buchungen, 99,9 % genau **ein**
 * Personenkonto, 12 von 14.950 sind Abrechner.
 */
export function partnerFixture(over: Partial<BusinessPartnerDetail> = {}): BusinessPartnerDetail {
  return {
    businessPartnerId: "bp-4711",
    clientId: "c-1",
    legalName: "Beispielbau Handels GmbH",
    shortName: "BEISPIELBAU HAN",
    vatProfile: "domestic_standard",
    typicalNature: "goods",
    onboardingState: "confirmed",
    usageBookingCount: 143,
    lastBookingDate: "2026-08-28",
    ustIds: ["DE000000000"],
    city: "Musterstadt",
    creditorAccount: { accountNumber: "70044", isInternal: false },
    debtorAccount: null,
    clearingAccounts: [],
    taxIds: [],
    addressLine1: "Industriestraße 8",
    postalCode: "12345",
    countryCode: "DE",
    websiteUrl: null,
    businessDescription: "Großhandel mit Baustoffen und Werkzeugen",
    vatNotes: null,
    typicalCurrency: null,
    typicalPaymentTermDays: null,
    typicalPaymentType: null,
    typicalTaxKeys: [],
    source: "onboarding_import",
    createdAt: "2026-01-15T09:00:00Z",
    updatedAt: "2026-08-28T11:20:00Z",
    normalizedName: "beispielbau handels gmbh",
    accountId: null,
    defaultDebitAccountNumber: null,
    profilingMetadata: null,
    ...over,
  };
}

/**
 * Die drei Reiter der Seite. **Drei, nicht fünf** — der Schnitt steht im
 * Seitenprofil: Konten ziehen in die Übersicht (Rang 2, p90 zwei Zeilen),
 * Belege und Sachverhalte werden Zähler (99–100 % ohne), „Technik" heißt
 * „Rohdaten" (D12).
 */
export const PARTNER_TABS = [
  { key: "uebersicht", label: "Übersicht" },
  { key: "details", label: "Details" },
  { key: "rohdaten", label: "Rohdaten" },
];

export const tabHref = (key: string) => `?tab=${key}`;
export const listHref = "?liste=partner";
export const accountHref = (n: string) => `?account=${n}`;

/** Die Wege der drei Zähler — in die Liste der Entität, auf diesen Partner gefiltert. */
export const casesHref = {
  cases: "?liste=sachverhalte&partner=bp-4711",
  documents: "?liste=belege&partner=bp-4711",
  journalEntries: "?liste=buchungen&partner=bp-4711",
};

/** Die Personenkonten je Wirtschaftsjahr — p90 sind zwei Zeilen. */
export const ACCOUNTS = [
  { year: 2026, number: "70044", role: "Kreditor", intern: false, journalEntries: 143 },
  { year: 2025, number: "70044", role: "Kreditor", intern: false, journalEntries: 208 },
];
