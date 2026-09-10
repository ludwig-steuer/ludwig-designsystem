import type { BusinessPartnerDetail } from "@/ludwig/modules/business-partners/domain/business-partner";
import type { BusinessPartnerRowData } from "@/ui/v3/entities/business-partner/business-partner-columns";

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

/* ── The list (0128) ─────────────────────────────────────────────────── */

/** A list row, plus the VAT ids the search runs over (not a column). */
export type PartnerListRow = BusinessPartnerRowData & { ustIds: string[] };

const PREFIX = ["Musterfirma", "Beispiel", "Muster", "Test", "Musterbau", "Beispielhandel"];
const TRADE = ["Logistik", "Handel", "Immobilien", "Technik", "Bau", "Elektro", "Metall", "Garten", "Druck", "Reinigung", "Transport", "Beratung", "Medien", "Holz", "Sanitär"];
const PLACE = ["Nord", "Süd", "West", "Ost", "Mitte", "Hafen", "Berg", "Tal", "Land", "Stadt", "Rhein", "Main", "Elbe", "Weser", "Havel", "Ems", "Lahn", "Saale", "Mosel", "Ruhr", "Inn", "Isar", "Lech", "Neckar", "Oder", "Spree", "Werra", "Fulda", "Aller", "Leine"];
const FORM = ["GmbH", "KG", "AG", "e. K.", "GmbH & Co. KG"];
const CITY = ["Musterstadt", "Beispielhausen", "Testdorf", "Musterhafen", "Beispielberg", "Musterfeld"];
/** Bookings of a used partner, skewed the way the stock is: p90 6, max 4.298. */
const USAGE = [1, 2, 3, 4, 6, 9, 14, 25, 48, 110, 420, 4_298];

/**
 * A made-up name per index — unique for the first 13,500, so the generated
 * stock has no namesakes of its own; the ones a story needs are added on purpose.
 */
function partnerName(i: number): string {
  return `${PREFIX[i % 6]} ${TRADE[Math.floor(i / 6) % 15]} ${PLACE[Math.floor(i / 90) % 30]} ${FORM[Math.floor(i / 2_700) % 5]}`;
}

export interface StockSpec {
  size: number;
  /** The first `creditors` carry a creditor account, the rest a debtor account. */
  creditors: number;
  /** Billing providers: no personal account, clearing accounts only. */
  billing?: number;
  /** Proposed creditors with an internal 89xxxx number. */
  proposals?: number;
  drafts?: number;
  /** Per mille of partners with a VAT id. */
  ustPerMille?: number;
}

/** A client's partner stock; the proportions are the stock's, the values made up. */
export function partnerStock(spec: StockSpec): PartnerListRow[] {
  const { size, creditors, billing = 0, proposals = 0, drafts = 0, ustPerMille = 40 } = spec;
  return Array.from({ length: size }, (_, i): PartnerListRow => {
    const legalName = partnerName(i);
    const used = (i * 37) % 100 >= 77;
    const proposed = i >= size - proposals;
    const draft = !proposed && i >= size - proposals - drafts;
    const settles = i >= creditors && i < creditors + billing;
    const creditor = i < creditors || proposed;
    return {
      businessPartnerId: `bp-${i}`,
      legalName,
      shortName: legalName.toUpperCase().slice(0, 15),
      city: (i * 17) % 100 < 77 ? CITY[(i * 3) % 6]! : null,
      onboardingState: proposed ? "proposed" : draft ? "draft" : "confirmed",
      usageBookingCount: proposed ? i % 4 : used ? USAGE[(i * 7) % 12]! : 0,
      lastBookingDate:
        used && !proposed ? `2026-${String(1 + ((i * 5) % 8)).padStart(2, "0")}-${String(1 + ((i * 11) % 28)).padStart(2, "0")}` : null,
      creditorAccount: settles
        ? null
        : proposed
          ? { accountNumber: `89${String(i % 10_000).padStart(4, "0")}`, isInternal: true }
          : creditor
            ? { accountNumber: String(70_000 + i), isInternal: false }
            : null,
      debtorAccount: settles || creditor || draft ? null : { accountNumber: String(10_000 + i), isInternal: false },
      clearingAccounts: settles ? [{ accountNumber: String(1_360 + (i % 3)), isInternal: true }] : [],
      ustIds: (i * 13) % 1_000 < ustPerMille ? [`DE9${String(i).padStart(8, "0")}`] : [],
    };
  });
}

/** Three namesakes — the case the page profile measured: 149 rows share a name at the largest client. */
const NAMESAKES: PartnerListRow[] = [
  ["Musterstadt", "10901", 48],
  ["Beispielhausen", "11377", 3],
  [null, "12260", 0],
].map(([city, account, usage], k) => ({
  businessPartnerId: `bp-same-${k}`,
  legalName: "Musterfirma Gebäudeservice GmbH",
  shortName: "MUSTERFIRMA GEB",
  city: city as string | null,
  onboardingState: "confirmed",
  usageBookingCount: usage as number,
  lastBookingDate: (usage as number) > 0 ? "2026-07-22" : null,
  creditorAccount: null,
  debtorAccount: { accountNumber: account as string, isInternal: false },
  clearingAccounts: [],
  ustIds: [],
}));

/** The largest client: 6.396 partners, almost all debtors, 7 proposals. */
export const largeStock: PartnerListRow[] = [
  ...partnerStock({ size: 6_393, creditors: 108, proposals: 7, drafts: 1, ustPerMille: 1 }),
  ...NAMESAKES,
];
/** A mid-sized client: 572 partners, creditor-heavy, 12 billing providers, 18 proposals. */
export const midStock = partnerStock({ size: 572, creditors: 444, billing: 12, proposals: 18 });
/** A client whose proposals are all accepted. */
export const doneStock = partnerStock({ size: 544, creditors: 438 });
