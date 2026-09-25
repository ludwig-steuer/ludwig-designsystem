import type {
  BankBalanceComparison,
  DormantAccount,
  ManualAmount,
  SourcedAmount,
} from "./types";

/**
 * The scenarios of F298 §7 (0202). Synthetic and consistent in themselves:
 * per source `old + movement = new`, and the contributions of the
 * explanation plus the remainder give the released difference „new" —
 * `pnpm check:bank-balance` holds them to it. No name and no amount from
 * staging.
 *
 * Type imports only: the check runs this file in plain Node.
 */

/** „Today" of every story — the form rejects a cut-off after it. */
export const TODAY = "2026-09-25";

const AUGUST = { from: "2026-08-01", to: "2026-08-31" };
const STATEMENT_DOC = "#document=00000000-0000-4000-8000-0000000d0c01";

function at(
  amount: number,
  asOf: string,
  sourceLabel: string,
  sourceDetail: string | null = null,
  href: string | null = null,
): SourcedAmount {
  return { amount, asOf, sourceLabel, sourceDetail, href };
}

function coverage(parts: Partial<BankBalanceComparison["coverage"]>): BankBalanceComparison["coverage"] {
  return {
    transactionCount: 0,
    booked: 0,
    proposedOnly: 0,
    noProposal: 0,
    noCase: 0,
    waived: 0,
    bookingsWithoutTransactionCount: 0,
    ...parts,
  };
}

const NO_STATEMENT: BankBalanceComparison["statement"] = {
  movement: null,
  old: null,
  new: null,
  coveredFrom: null,
  coveredTo: null,
};

/* ── S1 · everything released, statement with balances ─────────────── */

const s1Ledger = {
  old: at(23480.15, "2026-07-31", "DATEV bis 31.07.", "Abruf 14.09.2026 21:42"),
  movement: 1920.55,
  movementCount: 41,
  new: at(25400.7, "2026-08-31", "DATEV + Ludwig freigegeben", "Abruf 14.09.2026 21:42"),
};

export const s1Fits: BankBalanceComparison = {
  paymentAccountId: "00000000-0000-4000-8000-000000000a00",
  label: "1200 · Sparkasse Musterstadt Geschäftskonto",
  kind: "bank",
  period: AUGUST,
  coverage: coverage({ transactionCount: 41, booked: 41 }),
  ledger: { released: s1Ledger, withProposals: s1Ledger },
  proposalsOutsidePeriod: [],
  statement: {
    movement: { amount: 1920.55, count: 41 },
    old: at(23480.15, "2026-07-31", "Anfangssaldo Datei", "Auszug 01.08.–31.08., importiert 02.09.2026", STATEMENT_DOC),
    new: at(25400.7, "2026-08-31", "Endsaldo Datei", "Auszug 01.08.–31.08., importiert 02.09.2026", STATEMENT_DOC),
    coveredFrom: "2026-08-01",
    coveredTo: "2026-08-31",
  },
  manual: { old: null, new: null },
  verdict: { released: "fits", withProposals: "fits" },
  explanation: [],
  remainder: 0,
  headline: {
    released: "Passt — Alt, Bewegung und Neu stimmen mit dem Auszug überein.",
    withProposals: "Passt — Alt, Bewegung und Neu stimmen mit dem Auszug überein.",
  },
};

/* ── S2 · proposals only (the reference case, synthetic) ────────────── */

const toStep3 = { label: "Zu Schritt 3 — freigeben", href: "#step=3&account=1800" };

export const s2ProposalsOnly: BankBalanceComparison = {
  paymentAccountId: "00000000-0000-4000-8000-000000000a01",
  label: "1800 · Musterbank Giro",
  kind: "bank",
  period: AUGUST,
  coverage: coverage({ transactionCount: 64, proposedOnly: 64 }),
  ledger: {
    released: {
      old: at(41250, "2026-07-31", "DATEV bis 31.07.", "Abruf 14.09.2026 21:42"),
      movement: 0,
      movementCount: 0,
      new: at(41250, "2026-08-31", "DATEV + Ludwig freigegeben", "Abruf 14.09.2026 21:42"),
    },
    withProposals: {
      old: at(41250, "2026-07-31", "DATEV bis 31.07. inkl. Vorschläge"),
      movement: -5380.4,
      movementCount: 64,
      new: at(35869.6, "2026-08-31", "inkl. 64 Vorschläge"),
    },
  },
  proposalsOutsidePeriod: [],
  statement: {
    movement: { amount: -5380.4, count: 64 },
    old: at(41250, "2026-08-02", "Anfangssaldo Datei", "Auszug 03.08.–22.09., importiert 24.09.2026", STATEMENT_DOC),
    new: at(
      35869.6,
      "2026-08-31",
      "Endsaldo Datei, zurückgerechnet",
      "Endsaldo 22.09. 31.330,00 € − Umsätze nach 31.08.",
      STATEMENT_DOC,
    ),
    coveredFrom: "2026-08-03",
    coveredTo: "2026-09-22",
  },
  manual: { old: null, new: null },
  verdict: { released: "fits_with_proposals", withProposals: "fits" },
  explanation: [
    {
      key: "proposed_only",
      level: "warning",
      amount: 5380.4,
      count: 64,
      text: "64 Vorschläge über 5.380,40 € noch nicht freigegeben — erklären die ganze Differenz",
      action: toStep3,
    },
  ],
  remainder: 0,
  headline: {
    released: "Passt erst mit Vorschlägen — 64 Vorschläge über 5.380,40 € in Schritt 3 freigeben.",
    withProposals: "Passt nur mit Vorschlägen — ohne sie fehlen 5.380,40 €.",
  },
};

/* ── S3 · S2 plus a July proposal that DATEV already has ────────────── */

export const s3ProposalFromLastMonth: BankBalanceComparison = {
  ...s2ProposalsOnly,
  ledger: {
    released: s2ProposalsOnly.ledger.released,
    withProposals: {
      old: at(41201.8, "2026-07-31", "DATEV bis 31.07. inkl. Vorschläge", "inkl. 1 Vorschlag vom 21.07."),
      movement: -5380.4,
      movementCount: 64,
      new: at(35821.4, "2026-08-31", "inkl. 65 Vorschläge"),
    },
  },
  proposalsOutsidePeriod: [
    {
      bookingDate: "2026-07-21",
      amount: -48.2,
      counterparty: "Tankstelle Nord",
      caseNumber: "2026-0497",
      alreadyInDatev: true,
    },
  ],
  verdict: { released: "fits_with_proposals", withProposals: "differs" },
  explanation: [
    {
      key: "proposed_only",
      level: "warning",
      amount: 5380.4,
      count: 64,
      text: "64 Vorschläge über 5.380,40 € noch nicht freigegeben",
      action: toStep3,
    },
    {
      // Outside the released calculation: it is not released, and DATEV
      // already counts the transaction. It only moves the figures with proposals.
      key: "proposal_outside_period_in_datev",
      level: "warning",
      amount: null,
      count: 1,
      text: "1 Vorschlag vom 21.07.2026 (Tankstelle Nord, −48,20 €) steckt schon im DATEV-Stand — eine Freigabe würde doppelt buchen",
      action: { label: "Sachverhalt 2026-0497 öffnen", href: "#case=2026-0497" },
    },
  ],
  headline: {
    released: "Passt erst mit Vorschlägen — aber 1 Vorschlag aus dem Juli würde doppelt buchen.",
    withProposals:
      "Weicht mit Vorschlägen um −48,20 € ab — 1 Vorschlag aus dem Juli steckt schon im DATEV-Stand und würde doppelt buchen.",
  },
};

/* ── S4 / S5 · file without balances, then a balance of one's own ────── */

const s4Ledger = {
  old: at(15000, "2026-07-31", "DATEV bis 31.07.", "Abruf 01.09.2026 07:00"),
  movement: -2210,
  movementCount: 18,
  new: at(12790, "2026-08-31", "DATEV + Ludwig freigegeben", "Abruf 01.09.2026 07:00"),
};

export const s4NoBalancesInFile: BankBalanceComparison = {
  paymentAccountId: "00000000-0000-4000-8000-000000000a04",
  label: "1810 · Volksbank Mittelland Tagesgeld",
  kind: "bank",
  period: AUGUST,
  coverage: coverage({ transactionCount: 18, booked: 18 }),
  ledger: { released: s4Ledger, withProposals: s4Ledger },
  proposalsOutsidePeriod: [],
  // A CSV without balances and without a PDF: the movement has no link.
  statement: {
    movement: { amount: -2210, count: 18 },
    old: null,
    new: null,
    coveredFrom: "2026-08-01",
    coveredTo: "2026-08-31",
  },
  manual: { old: null, new: null },
  verdict: { released: "not_checkable", withProposals: "not_checkable" },
  explanation: [],
  remainder: null,
  headline: {
    released: "Bewegung passt. Alt und Neu nicht prüfbar — die Auszugsdatei trägt keine Salden. Kontostand hinterlegen.",
    withProposals:
      "Bewegung passt. Alt und Neu nicht prüfbar — die Auszugsdatei trägt keine Salden. Kontostand hinterlegen.",
  },
};

const paperStatement: ManualAmount = {
  ...at(12790, "2026-08-31", "Papierauszug", "M. Muster, 02.09.2026"),
  source: "paper_statement",
  by: "M. Muster",
  at: "2026-09-02T08:15:00Z",
  note: "Auszug Nr. 8/2026",
};

export const s5ManualBalance: BankBalanceComparison = {
  ...s4NoBalancesInFile,
  manual: { old: null, new: paperStatement },
  verdict: { released: "fits", withProposals: "fits" },
  remainder: 0,
  headline: {
    released: "Passt — Bewegung stimmt mit den Umsätzen, Neu mit Ihrem Papierauszug.",
    withProposals: "Passt — Bewegung stimmt mit den Umsätzen, Neu mit Ihrem Papierauszug.",
  },
};

/* ── S6 · own balance differs, explained by unbooked transactions ───── */

const s6Ledger = {
  old: at(8000, "2026-07-31", "DATEV bis 31.07.", "Abruf 14.09.2026 21:42"),
  movement: -3100,
  movementCount: 30,
  new: at(4900, "2026-08-31", "DATEV + Ludwig freigegeben", "Abruf 14.09.2026 21:42"),
};

export const s6Explained: BankBalanceComparison = {
  paymentAccountId: "00000000-0000-4000-8000-000000000a06",
  label: "1820 · Postbank Giro",
  kind: "bank",
  period: AUGUST,
  coverage: coverage({ transactionCount: 32, booked: 30, noProposal: 2 }),
  ledger: { released: s6Ledger, withProposals: s6Ledger },
  proposalsOutsidePeriod: [],
  statement: {
    movement: { amount: -3350, count: 32 },
    old: null,
    new: null,
    coveredFrom: "2026-08-01",
    coveredTo: "2026-08-31",
  },
  manual: {
    old: null,
    new: {
      ...at(4650, "2026-08-31", "Online-Banking", "M. Muster, 03.09.2026"),
      source: "online_banking",
      by: "M. Muster",
      at: "2026-09-03T09:40:00Z",
      note: null,
    },
  },
  verdict: { released: "explained", withProposals: "explained" },
  explanation: [
    {
      key: "unbooked_transactions",
      level: "warning",
      amount: 250,
      count: 2,
      text: "2 Umsätze über −250,00 € ohne Buchungsvorschlag — erklären die ganze Differenz",
      action: { label: "Umsätze anzeigen", href: "#account=1820&reason=unbooked" },
    },
  ],
  remainder: 0,
  headline: {
    released: "Differenz 250,00 € — erklärt durch 2 Umsätze ohne Buchung.",
    withProposals: "Differenz 250,00 € — erklärt durch 2 Umsätze ohne Buchung.",
  },
};

/* ── S7 · a remainder stays, with proposals too ─────────────────────── */

const s7Ledger = {
  old: at(20000, "2026-07-31", "DATEV bis 31.07.", "Abruf 14.09.2026 21:42"),
  movement: -1150,
  movementCount: 22,
  new: at(18850, "2026-08-31", "DATEV + Ludwig freigegeben", "Abruf 14.09.2026 21:42"),
};

export const s7Differs: BankBalanceComparison = {
  paymentAccountId: "00000000-0000-4000-8000-000000000a07",
  label: "1830 · Commerzbank Kontokorrent",
  kind: "bank",
  period: AUGUST,
  coverage: coverage({ transactionCount: 23, booked: 22, noCase: 1, bookingsWithoutTransactionCount: 1 }),
  ledger: { released: s7Ledger, withProposals: s7Ledger },
  proposalsOutsidePeriod: [],
  statement: {
    movement: { amount: -1470, count: 23 },
    old: at(20000, "2026-07-31", "Anfangssaldo Datei", "Auszug 01.08.–31.08., importiert 01.09.2026", STATEMENT_DOC),
    new: at(18530, "2026-08-31", "Endsaldo Datei", "Auszug 01.08.–31.08., importiert 01.09.2026", STATEMENT_DOC),
    coveredFrom: "2026-08-01",
    coveredTo: "2026-08-31",
  },
  manual: { old: null, new: null },
  verdict: { released: "differs", withProposals: "differs" },
  explanation: [
    {
      key: "bookings_without_transaction",
      level: "warning",
      amount: 150,
      count: 1,
      text: "1 Buchung über 150,00 € ohne Umsatz",
      action: { label: "Buchung anzeigen", href: "#account=1830&reason=no_transaction" },
    },
    {
      key: "unbooked_transactions",
      level: "notice",
      amount: 120,
      count: 1,
      text: "1 Umsatz über −120,00 € ohne Sachverhalt",
      action: { label: "Umsatz öffnen", href: "#transactionId=00000000-0000-4000-8000-0000000b7001" },
    },
    {
      key: "remainder",
      level: "error",
      amount: 50,
      count: null,
      text: "50,00 € nicht erklärbar — Buchung ohne Beleg, Konto-Verwechslung oder Fremdbuchung in DATEV",
      action: { label: "Buchungen auf 1830 anzeigen", href: "#account=1830" },
    },
  ],
  remainder: 50,
  headline: {
    released: "50,00 € nicht erklärbar — 270,00 € der Differenz von 320,00 € sind erklärt.",
    withProposals: "50,00 € nicht erklärbar — 270,00 € der Differenz von 320,00 € sind erklärt.",
  },
};

/* ── S8 · no statement, no own balance ──────────────────────────────── */

const s8Ledger = {
  old: at(-3412.8, "2026-07-31", "Buchungen bis 31.07.", "noch kein DATEV-Abruf"),
  movement: -210,
  movementCount: 1,
  new: at(-3622.8, "2026-08-31", "Ludwig freigegeben", "noch kein DATEV-Abruf"),
};

const requestStatement = { label: "Auszug nachfordern", href: "#step=1&request=statements" };

export const s8NotCheckable: BankBalanceComparison = {
  paymentAccountId: "00000000-0000-4000-8000-000000000a08",
  label: "1840 · Deutsche Bank Kontokorrent",
  kind: "bank",
  period: AUGUST,
  coverage: coverage({ bookingsWithoutTransactionCount: 1 }),
  ledger: { released: s8Ledger, withProposals: s8Ledger },
  proposalsOutsidePeriod: [],
  statement: NO_STATEMENT,
  manual: { old: null, new: null },
  verdict: { released: "not_checkable", withProposals: "not_checkable" },
  explanation: [
    {
      key: "no_statement",
      level: "notice",
      amount: null,
      count: null,
      text: "Für August liegt kein Kontoauszug vor",
      action: requestStatement,
    },
  ],
  remainder: null,
  headline: {
    released: "Nicht prüfbar — kein Auszug mit Salden und kein eigener Kontostand. Kontostand hinterlegen.",
    withProposals: "Nicht prüfbar — kein Auszug mit Salden und kein eigener Kontostand. Kontostand hinterlegen.",
  },
};

/* ── S9 · the statement ends before the period does ─────────────────── */

const s9Ledger = {
  old: at(6100, "2026-07-31", "DATEV bis 31.07.", "Abruf 14.09.2026 21:42"),
  movement: -940,
  movementCount: 12,
  new: at(5160, "2026-08-31", "DATEV + Ludwig freigegeben", "Abruf 14.09.2026 21:42"),
};

export const s9StatementEndsEarly: BankBalanceComparison = {
  paymentAccountId: "00000000-0000-4000-8000-000000000a09",
  label: "1850 · Sparda-Bank Giro",
  kind: "bank",
  period: AUGUST,
  coverage: coverage({ transactionCount: 9, booked: 9, bookingsWithoutTransactionCount: 3 }),
  ledger: { released: s9Ledger, withProposals: s9Ledger },
  proposalsOutsidePeriod: [],
  statement: {
    movement: { amount: -720, count: 9 },
    old: at(6100, "2026-07-31", "Anfangssaldo Datei", "Auszug 01.08.–22.08., importiert 24.08.2026", STATEMENT_DOC),
    new: at(5380, "2026-08-22", "Endsaldo Datei", "Auszug 01.08.–22.08., importiert 24.08.2026", STATEMENT_DOC),
    coveredFrom: "2026-08-01",
    coveredTo: "2026-08-22",
  },
  manual: { old: null, new: null },
  verdict: { released: "not_checkable", withProposals: "not_checkable" },
  explanation: [
    {
      key: "statement_ends_early",
      level: "notice",
      amount: null,
      count: null,
      text: "Der Auszug endet am 22.08.2026 — für 23.08. bis 31.08. fehlen die Umsätze",
      action: requestStatement,
    },
  ],
  remainder: null,
  headline: {
    released: "Alt passt. Neu nicht prüfbar — der Auszug endet am 22.08.2026. Auszug bis 31.08. nachfordern.",
    withProposals: "Alt passt. Neu nicht prüfbar — der Auszug endet am 22.08.2026. Auszug bis 31.08. nachfordern.",
  },
};

/* ── S10 · earlier batches not in DATEV yet, client batch in the balance ── */

const OTHER_BATCHES = "DATEV bis 31.07. + Stapel 2026-0003, noch nicht in DATEV + Mandantenstapel Kasse";

const s10Ledger = {
  old: at(112345.67, "2026-07-31", OTHER_BATCHES, "Abruf 14.09.2026 21:42"),
  movement: 18765.43,
  movementCount: 214,
  new: at(131111.1, "2026-08-31", `${OTHER_BATCHES} + Ludwig freigegeben`, "Abruf 14.09.2026 21:42"),
};

export const s10OtherBatches: BankBalanceComparison = {
  paymentAccountId: "00000000-0000-4000-8000-000000000a10",
  label: "1860 · Kreissparkasse Musterland-Nord Geschäftsgirokonto Filiale Hauptstraße",
  kind: "bank",
  period: AUGUST,
  coverage: coverage({ transactionCount: 214, booked: 214 }),
  ledger: { released: s10Ledger, withProposals: s10Ledger },
  proposalsOutsidePeriod: [],
  statement: {
    movement: { amount: 18765.43, count: 214 },
    old: at(112345.67, "2026-07-31", "Anfangssaldo Datei", "Auszug 01.08.–31.08., importiert 03.09.2026", STATEMENT_DOC),
    new: at(131111.1, "2026-08-31", "Endsaldo Datei", "Auszug 01.08.–31.08., importiert 03.09.2026", STATEMENT_DOC),
    coveredFrom: "2026-08-01",
    coveredTo: "2026-08-31",
  },
  manual: { old: null, new: null },
  verdict: { released: "fits", withProposals: "fits" },
  explanation: [],
  remainder: 0,
  headline: {
    released: "Passt — Alt, Bewegung und Neu stimmen mit dem Auszug überein.",
    withProposals: "Passt — Alt, Bewegung und Neu stimmen mit dem Auszug überein.",
  },
};

/* ── S11 · cash and money in transit ────────────────────────────────── */

const cashLedger = {
  old: at(3850, "2026-07-31", "DATEV bis 31.07.", "Abruf 14.09.2026 21:42"),
  movement: 250,
  movementCount: 14,
  new: at(4100, "2026-08-31", "DATEV + Kassenbuch Mandantenstapel"),
};

export const s11Cash: BankBalanceComparison = {
  paymentAccountId: "00000000-0000-4000-8000-000000000a11",
  label: "1600 · Kasse",
  kind: "cash",
  period: AUGUST,
  coverage: coverage({}),
  ledger: { released: cashLedger, withProposals: cashLedger },
  proposalsOutsidePeriod: [],
  statement: NO_STATEMENT,
  manual: { old: null, new: null },
  verdict: { released: "optional", withProposals: "optional" },
  explanation: [],
  remainder: null,
  headline: {
    released: "Wird nicht monatlich geprüft. Kassenbestand 31.08.2026: 4.100,00 € (DATEV bis 31.07. + Kassenbuch Mandantenstapel).",
    withProposals:
      "Wird nicht monatlich geprüft. Kassenbestand 31.08.2026: 4.100,00 € (DATEV bis 31.07. + Kassenbuch Mandantenstapel).",
  },
};

const transitLedger = {
  old: at(28760.4, "2026-07-31", "DATEV bis 31.07.", "Abruf 14.09.2026 21:42"),
  movement: 1450,
  movementCount: 37,
  new: at(30210.4, "2026-08-31", "DATEV + Ludwig freigegeben"),
};

export const s11Transit: BankBalanceComparison = {
  paymentAccountId: "00000000-0000-4000-8000-000000000a12",
  label: "1461 · Geldtransit Kartenzahlungen",
  kind: "money_transit",
  period: AUGUST,
  coverage: coverage({}),
  ledger: { released: transitLedger, withProposals: transitLedger },
  proposalsOutsidePeriod: [],
  statement: NO_STATEMENT,
  manual: { old: null, new: null },
  verdict: { released: "optional", withProposals: "optional" },
  explanation: [],
  remainder: null,
  headline: {
    released: "Geldtransit offen: 30.210,40 € — ist jederzeit möglich, wird nicht monatlich geprüft.",
    withProposals: "Geldtransit offen: 30.210,40 € — ist jederzeit möglich, wird nicht monatlich geprüft.",
  },
};

/* ── S12 · dormant accounts ─────────────────────────────────────────── */

const DORMANT_NAMES = [
  "Sparkasse Festgeld 2019",
  "Volksbank Mietkaution Halle 3",
  "Postbank Sparbuch",
  "Commerzbank Darlehen 4711",
  "ING Tagesgeld",
  "DKB Kreditkarte alt",
  "Sparkasse Avalkonto",
  "Volksbank Treuhandkonto Kaution",
  "Hypovereinsbank USD-Konto",
  "Targobank Ratenkredit",
  "Sparda-Bank Mietkaution Wohnung 2",
  "Deutsche Bank Wertpapierverrechnung",
  "Comdirect Tagesgeld",
  "Sparkasse Bausparkonto",
  "Volksbank Gewinnsparen",
  "Postbank Festgeld 2021",
  "Santander Autokredit",
  "Norisbank Rücklage",
  "Consorsbank Tagesgeld",
  "Sparkasse Sonderkonto Förderung",
];

export const dormantAccounts: DormantAccount[] = DORMANT_NAMES.map((name, i) => ({
  paymentAccountId: `00000000-0000-4000-8000-0000000d${String(i).padStart(4, "0")}`,
  label: `${1870 + i} · ${name}`,
  // The fourth one went quiet this month; the others have been still for long.
  lastTransactionDate: i === 3 ? "2026-07-28" : i % 5 === 0 ? null : `202${4 + (i % 2)}-12-31`,
  wentQuiet: i === 3,
}));

/** Every comparison, for the arithmetic check. */
export const allComparisons: Record<string, BankBalanceComparison> = {
  s1Fits,
  s2ProposalsOnly,
  s3ProposalFromLastMonth,
  s4NoBalancesInFile,
  s5ManualBalance,
  s6Explained,
  s7Differs,
  s8NotCheckable,
  s9StatementEndsEarly,
  s10OtherBatches,
  s11Cash,
  s11Transit,
};
