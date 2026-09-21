import type { BankTransactionRowData, CaseAssignment } from "./bank-transaction";

/**
 * Seven lines of one statement (0193, owner's examples via acto): Commerzbank,
 * account 1210, statement 004, April 2026. They cover Z0 to Z3, a split, an
 * incoming payment, „no booking required" and a planned charge. `settled` is
 * what the app's domain rule would say (L-340) — set by hand here, because
 * the set does not compute it.
 */

const assignment = (over: Partial<CaseAssignment> & Pick<CaseAssignment, "caseId" | "caseNumber" | "title">): CaseAssignment => ({
  fiscalYear: 2026,
  kind: "incoming_invoice",
  counterpartyName: null,
  lifecycleStatus: "open",
  amount: 0,
  currency: "EUR",
  eventBookingState: null,
  noBookingRequiredReason: null,
  ...over,
});

const line = (over: Partial<BankTransactionRowData> & Pick<BankTransactionRowData, "id" | "postingDate" | "amount">): BankTransactionRowData => ({
  currency: "EUR",
  counterpartyName: null,
  purpose: null,
  matchStage: null,
  cases: [],
  allocatedSum: 0,
  openClarificationsCount: 0,
  ...over,
});

/** The owner's seven example lines of statement 004 — for the excerpt and the list stories. */
export const STATEMENT_004: BankTransactionRowData[] = [
  line({
    id: "l1",
    postingDate: "2026-04-01",
    amount: -129.51,
    counterpartyName: "GRENKE AG",
    purpose:
      "12002815849 01.04.26-30.04.26 Rechnungsnummer 0000600372 EREF+116260207778912 MREF+02815849 CRED+DE54ZZZ00000007145 SVWZ+SEPA-Basislastschrift wiederholend",
    matchStage: "exact",
    cases: [assignment({ caseId: "c-0112", caseNumber: "2026-0112", title: "Leasing Kopierer GRENKE", amount: 129.51, eventBookingState: "posted" })],
    allocatedSum: 129.51,
    settled: true,
  }),
  line({
    id: "l2",
    postingDate: "2026-04-27",
    amount: 1800,
    counterpartyName: "Musterbau GmbH",
    purpose: "EREF+RE-2026-0338 SVWZ+Zahlung Rechnung RE-2026-0338",
    matchStage: "beleg",
    cases: [assignment({ caseId: "c-0338", caseNumber: "2026-0338", title: "Ausgangsrechnung Musterbau", kind: "outgoing_invoice", amount: 1800, eventBookingState: "proposed" })],
    allocatedSum: 1800,
    settled: false,
  }),
  line({
    id: "l3",
    postingDate: "2026-04-30",
    amount: -2480.55,
    counterpartyName: "Handwerk Schulz KG",
    purpose: "EREF+RE-8817 SVWZ+Sanierung Serverraum, Teilrechnung 2 von 3",
    matchStage: "near",
    cases: [assignment({ caseId: "c-0451", caseNumber: "2026-0451", title: "Sanierung Serverraum", amount: 2000, eventBookingState: null })],
    allocatedSum: 2000,
    openClarificationsCount: 1,
    settled: false,
  }),
  line({
    id: "l4",
    postingDate: "2026-04-29",
    amount: -89.9,
    purpose: "SVWZ+Kontoführungsentgelt April 2026",
    matchStage: "beyond_bookings",
    settled: false,
  }),
  line({
    id: "l5",
    postingDate: "2026-04-15",
    amount: -3570,
    counterpartyName: "Finanzamt München",
    purpose: "SVWZ+USt-VA 03/2026 St.-Nr. 143/123/45678 + LSt 03/2026",
    matchStage: "exact",
    cases: [
      assignment({ caseId: "c-0290", caseNumber: "2026-0290", title: "USt-Vorauszahlung 03/2026", kind: null, amount: 2850, eventBookingState: "posted" }),
      assignment({ caseId: "c-0291", caseNumber: "2026-0291", title: "Lohnsteuer 03/2026", kind: null, amount: 720, eventBookingState: "accepted" }),
    ],
    allocatedSum: 3570,
    settled: true,
  }),
  line({
    id: "l6",
    postingDate: "2026-04-13",
    amount: 24989.27,
    counterpartyName: "Fakir Technology Consultants GmbH",
    purpose: "TRANSFER / Interner Übertrag / DE91100101234994250419",
    matchStage: "exact",
    cases: [
      assignment({
        caseId: "c-0277",
        caseNumber: "2026-0277",
        title: "Umbuchung Qonto → Commerzbank",
        kind: "internal_transfer",
        amount: 24989.27,
        eventBookingState: null,
        noBookingRequiredReason: "Interner Übertrag zwischen eigenen Konten — beide Seiten stehen im Geldtransit.",
      }),
    ],
    allocatedSum: 24989.27,
    settled: true,
  }),
  line({
    id: "l7",
    postingDate: "2026-05-04",
    amount: -800,
    counterpartyName: "Max Mustermann Wohnung",
    purpose: "TRANSFER / Miete Arbeitszimmer / DE89370400440532013000",
    matchStage: null,
    cases: [assignment({ caseId: "c-0301", caseNumber: "2026-0301", title: "Miete Arbeitszimmer (Dauersachverhalt)", kind: "recurring_charge", amount: 800, eventBookingState: "planned" })],
    allocatedSum: 800,
    settled: false,
  }),
];

/**
 * The other direction of a split (0193, owner): **several payments, one
 * case** — an invoice of 2.480,55 € paid in two transfers. The same case
 * stands in both lines, each with its own event and its own booking state.
 */
export const TWO_PAYMENTS_ONE_CASE: BankTransactionRowData[] = [
  line({
    id: "p1",
    postingDate: "2026-04-10",
    amount: -2000,
    counterpartyName: "Handwerk Schulz KG",
    purpose: "EREF+RE-8817 SVWZ+Sanierung Serverraum, Abschlag",
    matchStage: "near",
    cases: [assignment({ caseId: "c-0451", caseNumber: "2026-0451", title: "Sanierung Serverraum", amount: 2000, eventBookingState: "posted" })],
    allocatedSum: 2000,
    settled: true,
  }),
  line({
    id: "p2",
    postingDate: "2026-04-30",
    amount: -480.55,
    counterpartyName: "Handwerk Schulz KG",
    purpose: "EREF+RE-8817 SVWZ+Sanierung Serverraum, Rest",
    matchStage: "near",
    cases: [assignment({ caseId: "c-0451", caseNumber: "2026-0451", title: "Sanierung Serverraum", amount: 480.55, eventBookingState: "proposed" })],
    allocatedSum: 480.55,
    settled: false,
  }),
];

/**
 * A collective payment over **six** cases — the most the app's allocation
 * core allows (0193, owner). The stock never had more than two; the cell has
 * to carry six anyway.
 */
export const SIX_CASE_SPLIT: BankTransactionRowData = line({
  id: "s6",
  postingDate: "2026-04-22",
  amount: -4312.4,
  counterpartyName: "Büro-Service Nord GmbH",
  purpose: "EREF+SAMMEL-0422 SVWZ+Sammelzahlung RE-1101 RE-1102 RE-1103 RE-1104 RE-1105 RE-1106",
  matchStage: "exact",
  cases: [
    assignment({ caseId: "c-1101", caseNumber: "2026-1101", title: "Druckerpapier März", amount: 412.4, eventBookingState: "posted" }),
    assignment({ caseId: "c-1102", caseNumber: "2026-1102", title: "Toner Farblaser", amount: 890, eventBookingState: "posted" }),
    assignment({ caseId: "c-1103", caseNumber: "2026-1103", title: "Bürostühle", amount: 1540, eventBookingState: "accepted" }),
    assignment({ caseId: "c-1104", caseNumber: "2026-1104", title: "Wartung Kopierer", amount: 620, eventBookingState: "proposed" }),
    assignment({ caseId: "c-1105", caseNumber: "2026-1105", title: "Ordner und Hefter", amount: 150, eventBookingState: "posted" }),
    assignment({ caseId: "c-1106", caseNumber: "2026-1106", title: "Kaffeemaschine Service", amount: 700, eventBookingState: "proposed" }),
  ],
  allocatedSum: 4312.4,
  settled: false,
});
