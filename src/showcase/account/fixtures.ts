import type { AccountStatus } from "@/ludwig/modules/accounts/domain/account";
import type { AccountMonth } from "@/ludwig/modules/accounts/domain/account-entry";
import type {
  BusinessPartnerDetail,
  PartnerPersonalAccount,
} from "@/ludwig/modules/business-partners/domain/business-partner";
import type { AccountFactsVM } from "@/ui/v3/entities/account/Account";
import type { AccountEntry, AccountEntryOrigin } from "@/ui/v3/entities/account/AccountEntries";

import { partnerFixture } from "../partner/fixtures";

/**
 * Synthetic accounts for the page stories (0157).
 *
 * **No real data**: names are made up and recognisably so, amounts round,
 * account numbers from the SKR catalogue, the year 2026. A scenario is written
 * as a few series of movements; balance, counts and months are **derived**
 * from them here, once — so a tile and the list it filters cannot count
 * differently (I12).
 */

export const YEAR = 2026;

export const MONTH_SHORT = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
export const MONTH_LONG = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

export const ACCOUNT_TABS = [
  { key: "overview", label: "Übersicht" },
  { key: "details", label: "Details" },
  { key: "raw", label: "Rohdaten" },
];

/** R21: the clearing types whose balance should come back to zero. */
export const ZERO_TARGET: readonly string[] = [
  "payroll", "suspense", "money_transit", "credit_card", "employee_expense", "payment_gateway",
];

/** The keys of axis `verrechnungskonto`; the words come from the registry. */
export const CLEARING_TYPES = [
  "credit_card", "employee_expense", "payment_gateway", "payroll",
  "payroll_liability", "shareholder", "suspense", "money_transit",
] as const;

/** DATEV account function 12: the account is locked for postings (R18). */
export const LOCKED_FUNCTION = 12;

/**
 * What the side column and the details tab need and `AccountFactsVM` does not
 * carry yet — finding B5. The names are the ones agreed for the app spec
 * (ludwig-manager, 2026-09-10), so stories and spec say the same.
 */
export interface AccountMaster {
  status: AccountStatus;
  accountFrameworkCode: string;
  skrBaseCode: string | null;
  accountFunction: number | null;
  automaticTaxRate: number | null;
  /** Axis `verrechnungskonto`. */
  clearingAccountType: string | null;
  businessPartnerId: string | null;
  description: string | null;
  documentTerms: string[];
  embeddingCreatedAt: string | null;
}

const MASTER: AccountMaster = {
  status: "active",
  accountFrameworkCode: "SKR04",
  skrBaseCode: null,
  accountFunction: null,
  automaticTaxRate: null,
  clearingAccountType: null,
  businessPartnerId: null,
  description: null,
  documentTerms: [],
  embeddingCreatedAt: null,
};

export const profile = (
  description: string,
  documentTerms: string[],
  embeddingCreatedAt = "2026-06-12",
): Partial<AccountMaster> => ({ description, documentTerms, embeddingCreatedAt });

/** A movement with what its drawer shows beyond the row. */
export interface Movement extends AccountEntry {
  /** Ludwig side: when it went to DATEV. */
  exportedAt?: string | null;
  /** DATEV side: axis `mirror_match`. */
  matchState?: string | null;
  /** Ludwig proposals: the agent's reasoning. */
  rationale?: string | null;
}

export interface MonthRow extends AccountMonth {
  /** Movements in the month — B1 wants it from the same union as the list. */
  count: number;
}

export interface AccountScenario {
  facts: AccountFactsVM;
  master: AccountMaster;
  /** Newest first, each with its running balance within its own source. */
  entries: Movement[];
  months: MonthRow[];
  /** One signal for the whole record, or none (K8, K9). */
  signal?: { kicker: string; title: string; sub?: string; tone: "warning" | "danger" };
  pageSize: number;
}

/* ── Accounts the scenarios book against ─────────────────────────────── */

export interface KnownAccount {
  number: string;
  name: string;
  role: string;
  skrClassLabel: string;
  balance: number;
  count: number;
}

const KNOWN: KnownAccount[] = [];
function known(number: string, name: string, role: string, skrClassLabel: string, balance: number, count: number) {
  const account = { number, name, role, skrClassLabel, balance, count };
  KNOWN.push(account);
  return account;
}

export const CASH = known("1600", "Kasse", "general_ledger", "Umlaufvermögen", 3_412.8, 1_204);
export const BANK = known("1800", "Bank", "general_ledger", "Umlaufvermögen", 61_240, 2_318);
export const TRANSIT = known("1460", "Geldtransit", "general_ledger", "Umlaufvermögen", 0, 912);
export const INPUT_VAT = known("1406", "Abziehbare Vorsteuer 19 %", "general_ledger", "Umlaufvermögen", 8_214.4, 640);
export const VAT_PREPAYMENT = known("3820", "Umsatzsteuer-Vorauszahlungen", "general_ledger", "Verbindlichkeiten", -14_400, 12);
export const REVENUE = known("4400", "Erlöse 19 % USt", "revenue", "Erlöse", -246_300, 300);
export const GOODS_IN = known("5400", "Wareneingang 19 % Vorsteuer", "general_ledger", "Materialaufwand", 41_880, 212);
export const SALARIES = known("6020", "Gehälter", "general_ledger", "Personalaufwand", 138_600, 48);
export const OTHER_COSTS = known("6300", "Sonstige betriebliche Aufwendungen", "general_ledger", "Sonstige betr. Aufwendungen", 2_140, 37);
export const RENT = known("6310", "Miete (unbewegliche Wirtschaftsgüter)", "general_ledger", "Sonstige betr. Aufwendungen", 21_600, 12);
export const OFFICE = known("6815", "Bürobedarf", "general_ledger", "Sonstige betr. Aufwendungen", 3_240, 48);
export const CLOSING_COSTS = known("6827", "Abschluss- und Prüfungskosten", "general_ledger", "Sonstige betr. Aufwendungen", 2_900, 4);
export const BANK_FEES = known("6855", "Nebenkosten des Geldverkehrs", "general_ledger", "Sonstige betr. Aufwendungen", 216, 120);
export const OPENING = known("9000", "Saldenvorträge Sachkonten", "other", "Vorträge", 0, 312);
export const CUSTOMER = known("10101", "Muster-Handel KG", "debtor", "Debitoren", 1_190, 9);
export const CUSTOMER_ENERGY = known("10102", "Beispiel-Energie AG", "debtor", "Debitoren", 0, 64);
export const SUPPLIER = known("70101", "Musterbau GmbH", "creditor", "Kreditoren", -2_400, 14);
export const ENERGY = known("70102", "Beispiel-Energie AG", "creditor", "Kreditoren", -410, 18);
export const OFFICE_SUPPLIER = known("70103", "Büroversand Muster KG", "creditor", "Kreditoren", 0, 8);
export const SKR03_CASH = known("1000", "Kasse", "general_ledger", "Umlaufvermögen", 1_840, 96);
export const SKR03_GOODS_IN = known("3400", "Wareneingang 19 % Vorsteuer", "general_ledger", "Materialaufwand", 18_300, 30);
export const SKR03_REVENUE = known("8400", "Erlöse 19 % USt", "revenue", "Erlöse", -31_200, 30);

export const ref = (a: KnownAccount) => ({ number: a.number, name: a.name });

/** The facts of a contra account for its drawer; `null` = not in this year's chart. */
export function contraFacts(number: string): AccountFactsVM | null {
  const a = KNOWN.find((k) => k.number === number);
  if (!a) return null;
  return {
    accountNumber: a.number,
    accountName: a.name,
    accountingRole: a.role,
    fiscalYear: YEAR,
    currency: "EUR",
    datevBalance: a.balance,
    datevEntryCount: a.count,
    ludwigEntryCount: 0,
    ludwigOnlyCount: 0,
    ludwigOnlyAmount: null,
    openProposalCount: 0,
    usageBookingCount: a.count,
    lastBookingDate: "2026-07-31",
    totalDebit: 0,
    totalCredit: 0,
    skrClassLabel: a.skrClassLabel,
    syncState: "synced",
  };
}

/* ── Series of movements ─────────────────────────────────────────────── */

export const r2 = (n: number) => Math.round(n * 100) / 100;
const signed = (e: AccountEntry) => (e.debit ?? 0) - (e.credit ?? 0);
const byDate = (a: AccountEntry, b: AccountEntry) =>
  a.postingDate.localeCompare(b.postingDate) || a.id.localeCompare(b.id, "en", { numeric: true });

/** DATEV side = what the mirror holds; Ludwig side = what has not arrived there. */
export const sideOf = (origin: AccountEntryOrigin): "datev" | "ludwig" =>
  origin === "datev" || origin === "mirrored" ? "datev" : "ludwig";

/** `count` dates spread evenly over the months `from`–`to`, the first on day one. */
function spread(count: number, from: number, to: number): string[] {
  const day = 86_400_000;
  const start = Date.UTC(YEAR, from - 1, 1);
  const span = (Date.UTC(YEAR, to, 0) - start) / day + 1;
  return Array.from({ length: count }, (_, i) =>
    new Date(start + Math.floor((i * span) / count) * day).toISOString().slice(0, 10),
  );
}

export interface Series {
  count: number;
  origin: AccountEntryOrigin;
  /** First and last month the series is spread over. */
  months: [number, number];
  side: "debit" | "credit";
  text: string | readonly string[];
  /** Cycled together with `text`, so a text keeps its contra account. */
  contra: readonly KnownAccount[];
  /** Cycled — round amounts, as the fixture rule asks. */
  amounts: readonly number[];
  /** Prefix of the document number; the running number is appended. */
  document: string;
  status?: string;
  markOfOrigin?: string;
  /** Batch number; the month is put in front: `07-2026/0003`. */
  batch?: string;
  caseNumber?: string;
  exportedAt?: string;
  matchState?: string;
  rationale?: string;
}

export function movements(...all: Series[]): Movement[] {
  return all.flatMap((s, k) =>
    spread(s.count, s.months[0], s.months[1]).map((date, i): Movement => {
      const amount = s.amounts[i % s.amounts.length]!;
      return {
        id: `m${k}-${i}`,
        postingDate: date,
        documentNumber: `${s.document}${String(i + 1).padStart(4, "0")}`,
        text: typeof s.text === "string" ? s.text : s.text[i % s.text.length]!,
        contraAccounts: [ref(s.contra[i % s.contra.length]!)],
        debit: s.side === "debit" ? amount : null,
        credit: s.side === "credit" ? amount : null,
        origin: s.origin,
        status: s.status ?? null,
        markOfOrigin: s.markOfOrigin ?? null,
        batchId: s.batch ? `${date.slice(5, 7)}-${YEAR}/${s.batch}` : null,
        caseNumber: s.caseNumber ?? null,
        exportedAt: s.exportedAt ?? null,
        matchState: s.matchState ?? null,
        rationale: s.rationale ?? null,
      };
    }),
  );
}

/** One hand-written movement, for the edges. */
export function entry(over: Partial<Movement> & Pick<Movement, "id" | "postingDate">): Movement {
  return { documentNumber: null, text: null, contraAccounts: [], debit: null, credit: null, origin: "datev", ...over };
}

/**
 * Lets one side of the account land on `target`: the oldest movement on the
 * matching side absorbs the difference — with an opening balance in the
 * series, that is the opening balance.
 */
export function settle(entries: Movement[], side: "datev" | "ludwig", target: number): Movement[] {
  const own = entries.filter((e) => sideOf(e.origin) === side).sort(byDate);
  const delta = r2(target - own.reduce((sum, e) => sum + signed(e), 0));
  const pick = own.find((e) => (delta > 0 ? e.debit !== null : e.credit !== null));
  if (delta === 0 || !pick) return entries;
  return entries.map((e) =>
    e !== pick ? e : delta > 0 ? { ...e, debit: r2(e.debit! + delta) } : { ...e, credit: r2(e.credit! - delta) },
  );
}

/* ── The scenario ────────────────────────────────────────────────────── */

export interface ScenarioInput {
  number: string;
  name: string;
  role: "general_ledger" | "creditor" | "debtor" | "revenue" | "other";
  skrClassLabel: string;
  partnerName?: string;
  syncState?: string;
  master?: Partial<AccountMaster>;
  entries: Movement[];
  /** Overrides the derived DATEV balance — `null` = the mirror has none (K7). */
  datevBalance?: number | null;
  /** Across all years; defaults to the movements of this one. */
  usageBookingCount?: number;
  lastBookingDate?: string | null;
  signal?: AccountScenario["signal"];
  pageSize?: number;
}

export function scenario(input: ScenarioInput): AccountScenario {
  const running = { datev: 0, ludwig: 0 };
  const entries = [...input.entries]
    .sort(byDate)
    .map((e) => {
      const side = sideOf(e.origin);
      running[side] = r2(running[side] + signed(e));
      return { ...e, runningBalance: running[side] };
    })
    .reverse();

  const sum = (list: readonly Movement[], pick: (e: Movement) => number) =>
    r2(list.reduce((total, e) => total + pick(e), 0));
  const ludwigOnly = entries.filter((e) => e.origin === "ludwig");

  const facts: AccountFactsVM = {
    accountNumber: input.number,
    accountName: input.name,
    accountingRole: input.role,
    fiscalYear: YEAR,
    currency: "EUR",
    datevEntryCount: entries.filter((e) => sideOf(e.origin) === "datev").length,
    ludwigEntryCount: entries.filter((e) => e.origin !== "datev").length,
    ludwigOnlyCount: ludwigOnly.length,
    ludwigOnlyAmount: ludwigOnly.length > 0 ? sum(ludwigOnly, signed) : null,
    openProposalCount: entries.filter((e) => e.status === "proposed").length,
    usageBookingCount: input.usageBookingCount ?? entries.length,
    lastBookingDate:
      input.lastBookingDate !== undefined ? input.lastBookingDate : (entries[0]?.postingDate ?? null),
    datevBalance: input.datevBalance !== undefined ? input.datevBalance : running.datev,
    totalDebit: sum(entries, (e) => e.debit ?? 0),
    totalCredit: sum(entries, (e) => e.credit ?? 0),
    skrClassLabel: input.skrClassLabel,
    syncState: input.syncState ?? "synced",
    ...(input.partnerName ? { partnerName: input.partnerName } : {}),
  };

  const months = Array.from({ length: 12 }, (_, i): MonthRow => {
    const inMonth = entries.filter((e) => Number(e.postingDate.slice(5, 7)) === i + 1);
    return {
      month: i + 1,
      debit: sum(inMonth, (e) => e.debit ?? 0),
      credit: sum(inMonth, (e) => e.credit ?? 0),
      count: inMonth.length,
    };
  });

  return {
    facts,
    master: { ...MASTER, ...input.master },
    entries,
    months,
    pageSize: input.pageSize ?? 25,
    ...(input.signal ? { signal: input.signal } : {}),
  };
}

/** The word beside the balance: what the sign means on this kind of account. */
export function balanceWord(facts: AccountFactsVM, master: AccountMaster): string | null {
  if (master.clearingAccountType && ZERO_TARGET.includes(master.clearingAccountType)) return "Rest";
  const balance = facts.datevBalance ?? 0;
  if (facts.accountingRole === "creditor" && balance < 0) return "Verbindlichkeit";
  if (facts.accountingRole === "debtor" && balance > 0) return "Forderung";
  return null;
}

/** The business partner behind a personal account, for its drawer. */
export function partnerOf(s: AccountScenario): { partner: BusinessPartnerDetail; account: PartnerPersonalAccount } | null {
  const { facts, master } = s;
  if (!master.businessPartnerId || !facts.partnerName) return null;
  const role = facts.accountingRole === "debtor" ? "debtor" : "creditor";
  const own = { accountNumber: facts.accountNumber, isInternal: false };
  return {
    partner: partnerFixture({
      businessPartnerId: master.businessPartnerId,
      legalName: facts.partnerName,
      shortName: facts.partnerName.toUpperCase().slice(0, 15),
      creditorAccount: role === "creditor" ? own : null,
      debtorAccount: role === "debtor" ? own : null,
      usageBookingCount: facts.usageBookingCount,
      lastBookingDate: facts.lastBookingDate,
    }),
    account: {
      accountId: `a-${facts.accountNumber}`,
      fiscalYear: YEAR,
      fiscalYearStatus: "open",
      role,
      accountNumber: facts.accountNumber,
      accountName: facts.accountName ?? facts.accountNumber,
      source: "onboarding_import",
      status: "active",
      datevSyncState: "synced",
      datevAccountId: null,
      datevAddresseeId: null,
      usageBookingCount: facts.usageBookingCount,
      lastBookingDate: facts.lastBookingDate,
      isInternal: false,
    },
  };
}
