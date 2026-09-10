import type { BusinessPartnerDetail } from "@/ludwig/modules/business-partners/domain/business-partner";

/**
 * Synthetic business partners for the page stories (0127). **No real data**:
 * made-up names, no real VAT id or address, account numbers freely chosen in
 * the SKR range.
 *
 * One builder with the typical case as default — a confirmed creditor with
 * entries — and each story overrides only what it proves. The numbers behind
 * the cases are in `docs/seiten/partner-detail.md`: 77 % of partners have no
 * entries, 99.9 % exactly one personal account, 12 of 14,950 are billing
 * providers.
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
 * The page's three tabs — **three, not five** (page profile): accounts move
 * into the overview, documents and cases become counters, "Technik" is called
 * "Rohdaten" (D12).
 */
export const PARTNER_TABS = [
  { key: "uebersicht", label: "Übersicht" },
  { key: "details", label: "Details" },
  { key: "rohdaten", label: "Rohdaten" },
];

export const tabHref = (key: string) => `?tab=${key}`;
export const listHref = "?liste=partner";
export const accountHref = (n: string) => `?account=${n}`;

/** Where the three counters lead — the entity's list, filtered to this partner. */
export const casesHref = {
  cases: "?liste=sachverhalte&partner=bp-4711",
  documents: "?liste=belege&partner=bp-4711",
  journalEntries: "?liste=buchungen&partner=bp-4711",
};

/** The personal accounts per fiscal year — p90 is two rows. */
export const ACCOUNTS = [
  { year: 2026, number: "70044", role: "Kreditor", intern: false, journalEntries: 143 },
  { year: 2025, number: "70044", role: "Kreditor", intern: false, journalEntries: 208 },
];
