import {
  BANK,
  BANK_FEES,
  CASH,
  CLOSING_COSTS,
  CUSTOMER,
  ENERGY,
  entry,
  GOODS_IN,
  INPUT_VAT,
  movements,
  OFFICE_SUPPLIER,
  OPENING,
  OTHER_COSTS,
  profile,
  ref,
  RENT,
  REVENUE,
  CUSTOMER_ENERGY,
  SALARIES,
  scenario,
  settle,
  SKR03_CASH,
  SKR03_GOODS_IN,
  SKR03_REVENUE,
  SUPPLIER,
  TRANSIT,
  VAT_PREPAYMENT,
  type Movement,
} from "./fixtures";

/**
 * The twelve accounts of 0157 (F198 §7, K1–K12). Each is a handful of series;
 * the numbers the brief names — 110 only in Ludwig, 3.400 movements, a rest of
 * 1.240,50 — follow from the series, they are not typed in twice.
 */

const CARD_TEXTS = ["Geldtransit EC", "Geldtransit Visa", "Geldtransit Mastercard"];
const CARD_AMOUNTS = [120, 240, 85, 310, 60, 150];

/** K1 — the reference form: a money-transit clearing account, 110 proposals only in Ludwig. */
export const moneyTransit = scenario({
  number: "1460",
  name: "Kartenumsätze – Geldtransit",
  role: "general_ledger",
  skrClassLabel: "Umlaufvermögen",
  usageBookingCount: 1_874,
  master: {
    skrBaseCode: "1460",
    accountFunction: 10,
    clearingAccountType: "money_transit",
    ...profile(
      "Durchlaufkonto für Kartenzahlungen: Die Kasse gibt die EC- und Kreditkartenumsätze ab, die Bank schreibt sie gesammelt gut.",
      ["EC-Cash", "Kartenzahlung", "Kartenterminal", "Kreditkarte", "Sammelgutschrift", "Tagesabschluss"],
    ),
  },
  entries: settle(
    settle(
      movements(
        { count: 225, origin: "datev", months: [1, 7], side: "debit", text: CARD_TEXTS, contra: [CASH], amounts: CARD_AMOUNTS, document: "KS-", markOfOrigin: "KS", batch: "0003" },
        { count: 225, origin: "datev", months: [1, 7], side: "credit", text: CARD_TEXTS, contra: [BANK], amounts: CARD_AMOUNTS, document: "BA-", batch: "0003" },
        {
          count: 110,
          origin: "ludwig",
          months: [7, 7],
          side: "debit",
          text: CARD_TEXTS,
          contra: [CASH],
          amounts: [35],
          document: "KB-",
          status: "proposed",
          caseNumber: "2026-0412",
          rationale:
            "Der Kassenbericht Juli weist die Kartenumsätze aus. Gebucht wie die DATEV-Sätze Januar bis Juni: Kasse an Geldtransit, die Bank gleicht gesammelt aus.",
        },
      ),
      "datev",
      1_240.5,
    ),
    "ludwig",
    3_870,
  ),
});

/** K2 — the bank account with 3.400 movements, all four origins, five exported and not found. */
export const bankAccount = scenario({
  number: "1810",
  name: "Testbank eG Geschäftskonto",
  role: "general_ledger",
  skrClassLabel: "Umlaufvermögen",
  usageBookingCount: 21_480,
  pageSize: 50,
  master: {
    skrBaseCode: "1800",
    ...profile("Geschäftskonto bei der Testbank eG: alle Zahlungen des laufenden Geschäfts.", [
      "Kontoauszug", "Überweisung", "Lastschrift", "Gutschrift", "Sammelgutschrift",
    ]),
  },
  entries: settle(
    movements(
      { count: 1, origin: "datev", months: [1, 1], side: "debit", text: "Saldenvortrag", contra: [OPENING], amounts: [0], document: "EB-", markOfOrigin: "JA", batch: "0000" },
      {
        count: 1_619,
        origin: "datev",
        months: [1, 12],
        side: "debit",
        text: ["Kartenumsätze Sammelgutschrift", "Gutschrift Muster-Handel KG", "Zahlungseingang Beispiel-Energie AG"],
        contra: [TRANSIT, CUSTOMER, CUSTOMER_ENERGY],
        amounts: [480, 1_190, 2_380, 640, 95],
        document: "KA-",
        markOfOrigin: "KS",
        batch: "0001",
      },
      {
        count: 1_627,
        origin: "datev",
        months: [1, 12],
        side: "credit",
        text: ["Lastschrift Beispiel-Energie AG", "Überweisung Musterbau GmbH", "Gebühren Kontoführung", "Gehälter", "Umsatzsteuer-Vorauszahlung"],
        contra: [ENERGY, SUPPLIER, BANK_FEES, SALARIES, VAT_PREPAYMENT],
        amounts: [320, 1_450, 18, 2_200, 900],
        document: "KA-",
        markOfOrigin: "KS",
        batch: "0001",
      },
      { count: 3, origin: "datev", months: [1, 3], side: "credit", text: "Miete Lagerhalle", contra: [RENT], amounts: [1_800], document: "MI-", batch: "0001" },
      { count: 120, origin: "mirrored", months: [1, 11], side: "credit", text: "Zahlung Musterbau GmbH", contra: [SUPPLIER], amounts: [850, 1_200, 640], document: "ZA-", status: "posted", matchState: "matched_ludwig", batch: "0002" },
      { count: 5, origin: "exported", months: [11, 11], side: "credit", text: "Zahlung Beispiel-Energie AG", contra: [ENERGY], amounts: [320, 410], document: "ZE-", status: "accepted", exportedAt: "2026-11-28" },
      {
        count: 25,
        origin: "ludwig",
        months: [12, 12],
        side: "debit",
        text: "Kartenumsätze Sammelgutschrift",
        contra: [TRANSIT],
        amounts: [480, 95],
        document: "KL-",
        status: "proposed",
        rationale: "Die Gutschrift auf dem Kontoauszug entspricht der Summe der Kartenumsätze des Vortags auf 1460.",
      },
    ),
    "datev",
    48_210,
  ),
});

function office(withProfile: boolean) {
  return scenario({
    number: "6815",
    name: "Bürobedarf",
    role: "general_ledger",
    skrClassLabel: "Sonstige betr. Aufwendungen",
    usageBookingCount: 312,
    master: {
      skrBaseCode: "6815",
      automaticTaxRate: 19,
      ...(withProfile
        ? profile(
            "Laufender Bürobedarf: Papier, Toner, Ordner, Kleinmaterial. Keine Möbel und keine Geräte über 250 €.",
            ["Papier", "Toner", "Druckerpatrone", "Ordner", "Hefter", "Briefumschlag", "Kugelschreiber", "Notizblock", "Etiketten", "Klebeband", "Locher", "Tacker", "Registermappe", "Schreibwaren"],
            "2026-05-18",
          )
        : {}),
    },
    entries: movements(
      { count: 40, origin: "datev", months: [1, 12], side: "debit", text: ["Bürobedarf Papier", "Druckerpatronen", "Ordner und Hefter", "Briefumschläge"], contra: [BANK, SUPPLIER], amounts: [25, 40, 60, 85, 120], document: "RE-", markOfOrigin: "RE", batch: "0001" },
      { count: 8, origin: "mirrored", months: [2, 11], side: "debit", text: "Bürobedarf Online-Bestellung", contra: [OFFICE_SUPPLIER], amounts: [45, 90], document: "RL-", status: "posted", matchState: "matched_ludwig", batch: "0002" },
    ),
  });
}

/** K3 — an expense account where Ludwig and DATEV agree. */
export const expenseReconciled = office(true);

/** K10 — the same account without description and embedding. */
export const withoutLlmProfile = office(false);

/** K4 — a creditor with two open invoices. */
export const creditor = scenario({
  number: "70101",
  name: "Musterbau GmbH",
  role: "creditor",
  skrClassLabel: "Kreditoren",
  partnerName: "Musterbau GmbH",
  usageBookingCount: 58,
  master: {
    businessPartnerId: "bp-4711",
    ...profile("Lieferant für Baustoffe und Ersatzteile.", ["Baustoffe", "Ersatzteile", "Lieferschein"]),
  },
  entries: movements(
    { count: 8, origin: "datev", months: [1, 11], side: "credit", text: "Rechnung Musterbau GmbH", contra: [GOODS_IN], amounts: [1_200, 800, 1_500, 600, 950, 1_100, 1_300, 1_100], document: "RE-MB-", markOfOrigin: "RE", batch: "0001" },
    { count: 6, origin: "datev", months: [2, 10], side: "debit", text: "Zahlung Musterbau GmbH", contra: [BANK], amounts: [1_200, 800, 1_500, 600, 950, 1_100], document: "BA-", batch: "0001" },
  ),
});

/** K4b — the same form on the other side: a debtor with one invoice overdue. */
export const debtor = scenario({
  number: "10101",
  name: "Muster-Handel KG",
  role: "debtor",
  skrClassLabel: "Debitoren",
  partnerName: "Muster-Handel KG",
  usageBookingCount: 31,
  master: {
    businessPartnerId: "bp-5120",
    ...profile("Kunde im Großhandel, zahlt per Überweisung.", ["Ausgangsrechnung", "Zahlungseingang"]),
  },
  entries: movements(
    { count: 5, origin: "datev", months: [2, 11], side: "debit", text: "Ausgangsrechnung Muster-Handel KG", contra: [REVENUE], amounts: [2_380, 1_190, 595, 1_785, 1_190], document: "AR-", markOfOrigin: "RE", batch: "0001" },
    { count: 4, origin: "datev", months: [3, 10], side: "credit", text: "Zahlungseingang Muster-Handel KG", contra: [BANK], amounts: [2_380, 1_190, 595, 1_785], document: "BA-", batch: "0001" },
  ),
});

/** K5 — a revenue account, DATEV only: nothing to mark. */
export const revenueAccount = scenario({
  number: "4400",
  name: "Erlöse 19 % USt",
  role: "revenue",
  skrClassLabel: "Erlöse",
  usageBookingCount: 1_640,
  master: {
    skrBaseCode: "4400",
    automaticTaxRate: 19,
    ...profile("Umsatzerlöse zum Regelsteuersatz.", ["Ausgangsrechnung", "Rechnung", "Barverkauf"]),
  },
  entries: movements({
    count: 300,
    origin: "datev",
    months: [1, 12],
    side: "credit",
    text: ["Ausgangsrechnung Muster-Handel KG", "Ausgangsrechnung Beispiel-Energie AG", "Barverkauf"],
    contra: [CUSTOMER, CUSTOMER_ENERGY, CASH],
    amounts: [500, 1_200, 840, 2_100, 390],
    document: "AR-",
    markOfOrigin: "RE",
    batch: "0001",
  }),
});

/** K6 — in the chart, never booked. */
export const unused = scenario({
  number: "6640",
  name: "Bewirtungskosten",
  role: "general_ledger",
  skrClassLabel: "Sonstige betr. Aufwendungen",
  usageBookingCount: 0,
  lastBookingDate: null,
  master: { skrBaseCode: "6640", status: "inactive" },
  entries: [],
});

/** K7 — created in Ludwig, not yet known to DATEV. */
export const ludwigOnly = scenario({
  number: "890001",
  name: "Kaution Lagerhalle",
  role: "general_ledger",
  skrClassLabel: "Umlaufvermögen",
  syncState: "local_only",
  datevBalance: null,
  master: {
    ...profile("Mietkaution für die Lagerhalle, in drei Raten gezahlt.", ["Kaution", "Mietsicherheit"]),
  },
  entries: movements({ count: 3, origin: "ludwig", months: [6, 7], side: "debit", text: "Kaution Lagerhalle, Rate", contra: [BANK], amounts: [180], document: "KT-", status: "accepted" }),
});

/** K8 — a DATEV re-import no longer knows the account. */
export const disappeared = scenario({
  number: "6320",
  name: "Heizung",
  role: "general_ledger",
  skrClassLabel: "Sonstige betr. Aufwendungen",
  syncState: "disappeared",
  usageBookingCount: 64,
  master: { skrBaseCode: "6320", ...profile("Heizkosten der Betriebsräume.", ["Heizöl", "Fernwärme", "Gas"]) },
  entries: movements({ count: 12, origin: "datev", months: [1, 6], side: "debit", text: "Heizöl Beispiel-Energie AG", contra: [ENERGY], amounts: [480, 620], document: "RE-", markOfOrigin: "RE", batch: "0001" }),
  signal: {
    tone: "danger",
    kicker: "DATEV-Abgleich",
    title: "Ein DATEV-Re-Import kennt dieses Konto nicht mehr.",
    sub: "Die Bewegungen stammen aus dem letzten Stand, der es noch führte. Neue Buchungen auf dieses Konto kommen in DATEV nicht an.",
  },
});

/** K9 — a collective account locked by account function 12. */
export const locked = scenario({
  number: "1200",
  name: "Forderungen aus Lieferungen und Leistungen",
  role: "general_ledger",
  skrClassLabel: "Umlaufvermögen",
  usageBookingCount: 7_420,
  master: {
    skrBaseCode: "1200",
    accountFunction: 12,
    ...profile("Sammelkonto der Debitoren; DATEV führt es aus den Personenkonten.", ["Forderung", "Debitor"]),
  },
  entries: settle(
    movements(
      { count: 1, origin: "datev", months: [1, 1], side: "debit", text: "Saldenvortrag", contra: [OPENING], amounts: [0], document: "EB-", markOfOrigin: "JA", batch: "0000" },
      { count: 449, origin: "datev", months: [1, 12], side: "debit", text: "Sammelbuchung Debitoren", contra: [REVENUE], amounts: [1_190, 595, 2_380, 840], document: "SB-", markOfOrigin: "SV", batch: "0001" },
      { count: 450, origin: "datev", months: [1, 12], side: "credit", text: "Zahlungseingänge Debitoren", contra: [BANK], amounts: [1_190, 595, 2_380, 840], document: "ZE-", markOfOrigin: "SV", batch: "0001" },
    ),
    "datev",
    18_450,
  ),
  signal: {
    tone: "warning",
    kicker: "Kontenfunktion 12",
    title: "Für Buchungen gesperrt.",
    sub: "DATEV führt hier die Summen der Personenkonten; gebucht wird auf dem Debitor.",
  },
});

/** K11 — the same form in SKR03. */
export const skr03 = scenario({
  number: "1200",
  name: "Bank",
  role: "general_ledger",
  skrClassLabel: "Umlaufvermögen",
  usageBookingCount: 420,
  master: {
    accountFrameworkCode: "SKR03",
    skrBaseCode: "1200",
    ...profile("Hausbank, laufendes Geschäft.", ["Kontoauszug", "Überweisung", "Lastschrift"]),
  },
  entries: settle(
    movements(
      { count: 1, origin: "datev", months: [1, 1], side: "debit", text: "Saldenvortrag", contra: [OPENING], amounts: [0], document: "EB-", markOfOrigin: "JA", batch: "0000" },
      { count: 29, origin: "datev", months: [1, 12], side: "debit", text: ["Barverkauf eingezahlt", "Zahlungseingang Kunde"], contra: [SKR03_CASH, SKR03_REVENUE], amounts: [400, 1_190, 760], document: "KA-", batch: "0001" },
      { count: 30, origin: "datev", months: [1, 12], side: "credit", text: "Wareneinkauf Überweisung", contra: [SKR03_GOODS_IN], amounts: [620, 980], document: "KA-", batch: "0001" },
    ),
    "datev",
    12_480,
  ),
});

/** 60 characters — the EXTF limit of a posting text. */
const LONG_TEXT = "Wartungsvertrag Klimaanlage Halle 3, Quartal 2, inkl. Filter";
const FOUR_CONTRA = [SUPPLIER, INPUT_VAT, BANK, OTHER_COSTS].map(ref);

const EDGE_ENTRIES: Movement[] = [
  entry({ id: "k12-1", postingDate: "2026-07-14", documentNumber: "RE-2026-00418", text: LONG_TEXT, contraAccounts: FOUR_CONTRA, debit: 1_250, markOfOrigin: "RE", batchId: "07-2026/0002" }),
  entry({ id: "k12-2", postingDate: "2026-07-09", documentNumber: "RE-2026-00421", text: LONG_TEXT, contraAccounts: FOUR_CONTRA, debit: 1_250, origin: "ludwig", status: "proposed", caseNumber: "2026-0433", rationale: "Wartung wie im Vorquartal; die Rechnung nennt dieselbe Vertragsnummer." }),
  entry({ id: "k12-3", postingDate: "2026-06-30", documentNumber: "RE-2026-00377", text: "Nullrechnung Garantiefall Rolltor", contraAccounts: [ref(SUPPLIER)], debit: 0, markOfOrigin: "RE", batchId: "06-2026/0002" }),
  entry({ id: "k12-4", postingDate: "2026-06-12", documentNumber: "GS-2026-0031", text: "Gutschrift Reparatur, negativ gebucht", contraAccounts: [ref(SUPPLIER)], debit: -120, markOfOrigin: "RE", batchId: "06-2026/0001" }),
  entry({ id: "k12-5", postingDate: "2026-05-20", documentNumber: "RE-2026-00302", text: "Ersatzteile Hebebühne", contraAccounts: [ref(SUPPLIER)], debit: 480, markOfOrigin: "RE", batchId: "05-2026/0001" }),
  entry({ id: "k12-6", postingDate: "2026-03-03", documentNumber: "RE-2026-00118", text: "Reparatur Rolltor", contraAccounts: [ref(SUPPLIER)], debit: 890, markOfOrigin: "RE", batchId: "03-2026/0001" }),
  entry({ id: "k12-7", postingDate: "2026-02-11", documentNumber: "RE-2026-00064", text: "Prüfung Feuerlöscher", contraAccounts: [ref(CLOSING_COSTS)], debit: 240, markOfOrigin: "RE", batchId: "02-2026/0001" }),
];

/** K12 — the edges: a name of 50 characters, a text of 60, four contra accounts, 0,00 and a negative amount. */
export const longName = scenario({
  number: "6470",
  name: "Instandhaltung: Betriebs- und Geschäftsausstattung",
  role: "general_ledger",
  skrClassLabel: "Sonstige betr. Aufwendungen",
  usageBookingCount: 96,
  master: { skrBaseCode: "6470", ...profile("Reparaturen und Wartung an Maschinen, Toren und Anlagen.", ["Wartung", "Reparatur", "Ersatzteile"]) },
  entries: EDGE_ENTRIES,
});
