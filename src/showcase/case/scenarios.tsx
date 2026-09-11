import type { OpenItemLink } from "@/ludwig/modules/datev-truth/domain/open-item";
import type { CaseTimelineEvent } from "@/ui/v3/entities/accounting-case/CaseTimeline";
import { CaseCell } from "@/ui/v3/entities/accounting-case/CaseCell";
import type { JournalLine } from "@/ui/v3/entities/journal-entry/JournalEntryCompact";
import { StatusBadge } from "@/ui/v3/patterns/StatusBadge";
import { TextButton } from "@/ui/v3/primitives/TextButton";

import {
  CLARIFICATION_ANSWERED,
  CLARIFICATIONS,
  DATEV_EVENT,
  DOCUMENT_EVENT,
  NOTES,
  PAYMENT_EXPECTED,
  PROPOSAL,
  TODAY,
  caseFixture,
  tabHref,
} from "./fixtures";
import type { CaseScenario, ScenarioBracket } from "./scenario";

/**
 * The scenarios of 0152, one object each. The data form of every scenario comes
 * from the staging survey of 2026-09-10 (1,094 cases); names, amounts and
 * numbers are made up.
 */

const event = (
  id: string,
  kind: string,
  date: string,
  title: string,
  amount: number | null,
  state: string,
  extra: Partial<CaseTimelineEvent> = {},
): CaseTimelineEvent => ({ id, kind, date, title, amount, currency: "EUR", state, ...extra });

const line = (
  side: JournalLine["side"],
  accountNumber: string,
  accountName: string,
  amount: number,
  text: string,
  extra: Partial<JournalLine> = {},
): JournalLine => ({ side, accountNumber, accountName, amount, text, ...extra });

/** One clearing bracket between an invoice and a payment. */
export const bracket = (
  n: number,
  invoiceLabel: string,
  paymentLabel: string,
  amount: number,
  accountNumber: string,
  dates: { invoice: string; payment: string },
): ScenarioBracket => {
  const link: OpenItemLink = {
    id: `oil-${n}`,
    caseId: null,
    accountNumber,
    belegfeldValue: invoiceLabel.split(" ")[0] ?? null,
    belegfeldState: "computed",
    amountAllocated: amount,
    matchedBy: "Abgleich",
    rationale: null,
    orphanedAt: null,
    invoiceJournalEntryId: `je-inv-${n}`,
    invoiceMirrorEntryId: null,
    paymentJournalEntryId: `je-pay-${n}`,
    paymentMirrorEntryId: null,
  };
  return {
    link,
    invoice: { entryId: `je-inv-${n}`, label: invoiceLabel, date: dates.invoice, amount },
    payment: { entryId: `je-pay-${n}`, label: paymentLabel, date: dates.payment, amount },
  };
};

const AGENT_SOURCES = [
  { key: "1", art: "beleg" as const, quote: "Rechnung vom 16.07.2026 über 25,41 EUR", onOpen: () => {} },
  { key: "2", art: "history" as const, label: "Kreditor 71202, 14 Buchungen, zuletzt 22.06.2026" },
];

/* ── E1 · E1b — the reference case (wave 1) ─────────────────────────────── */

export const proposalPending: CaseScenario = {
  accountingCase: caseFixture({ disposition: "agent" }),
  today: TODAY,
  signal: { kicker: "Nächster Schritt", title: "Der Buchungsvorschlag wartet auf Ihre Prüfung.", action: "Prüfen" },
  headerAction: "Beleg anhängen",
  timelineSub: "alles zu diesem Fall",
  events: [DOCUMENT_EVENT],
  clarifications: [CLARIFICATION_ANSWERED],
  expectations: [PAYMENT_EXPECTED],
  todo: {
    sub: "1 offen · 1 Freigabe",
    points: [
      {
        key: "payment",
        title: "Die Zahlung an Musterbau Fahrzeugteile GmbH steht aus.",
        hint: "25,41 € · fällig am 10.08.2026, in 5 Tagen · noch keine Mahnung — danach fragt Ludwig beim Mandanten nach.",
        ways: ["Erwartung aufheben"],
      },
    ],
    approval: { caption: "Buchungsvorschlag vom 31.07.", lines: PROPOSAL },
  },
  details: {
    [DOCUMENT_EVENT.id]: {
      title: "Rechnung 93846778",
      sub: "31.07.2026 · Beleg mit Vorschlag",
      lines: PROPOSAL,
      origin: "agent",
      ai: {
        verdict: "confirm",
        confidence: "green",
        rationale:
          "Konto und Kreditor wie bei der Rechnung desselben Lieferanten im Juni; das Kontoblatt 71202 zeigt für Juli keine Bewegung.",
        judgeReasoning: "Kein Vorgriff, keine Dublette. Konto und Kreditor stimmen mit der Präzedenz überein.",
        sources: AGENT_SOURCES,
      },
      actions: ["Freigeben", "Ändern"],
    },
  },
  notes: NOTES,
  clarificationList: CLARIFICATIONS,
};

export const withDatevEntry: CaseScenario = {
  ...proposalPending,
  signal: undefined,
  headerAction: undefined,
  timelineSub: "Ludwig und DATEV in einer Reihe",
  events: [DATEV_EVENT, DOCUMENT_EVENT],
  clarifications: [],
  details: {
    ...proposalPending.details,
    [DATEV_EVENT.id]: {
      title: "Gutschrift aus DATEV",
      sub: "30.06.2026 · aus dem Spiegel übernommen",
      lines: [
        line("debit", "71202", "Musterbau Fahrzeugteile GmbH", 21.82, "Gutschrift"),
        line("credit", "5404", "Wareneingang 19 % VSt", 21.82, "Gutschrift"),
      ],
      origin: "datev",
    },
  },
  initialSelection: DATEV_EVENT.id,
};

/* ── Wave 2 — the single cases ──────────────────────────────────────────── */

/** A1 (29 %) — an open item carried over from DATEV: one event, no entry. */
export const openItemCarryover: CaseScenario = {
  accountingCase: caseFixture({
    caseNumber: "2026-0187",
    kind: "outgoing_invoice",
    openedAt: "2026-06-01",
    summary: "Offener Posten aus DATEV übernommen: Ausgangsrechnung vom 18.04., die der Kunde noch nicht bezahlt hat.",
    counterpartyName: "Beispielbau Handels GmbH",
    counterpartyPartnerId: "bp-2210",
    personalAccountNumber: "10412",
    counterpartySide: "debtor",
    createdByLabel: "System · OPOS-Übernahme",
    batchOposReference: "mirror-opos:10412/2026-0418",
    agentRunId: null,
    disposition: "agent",
    totalAmount: 1190,
    currency: "EUR",
  }),
  today: TODAY,
  timelineSub: "ein Ereignis",
  events: [
    event("ev-a1", "open_item_carryover", "2026-06-01", "Offener Posten RE-2026-0418 übernommen", 1190, "no_booking_required", {
      stateNote: "Keine Buchung nötig: gebucht ist der Posten in DATEV, Ludwig führt ihn nur weiter.",
    }),
  ],
  todo: {
    sub: "nichts offen",
    points: [],
    emptyText: "Nichts zu tun: Ludwig wartet auf die Zahlung des Kunden. Kommt sie, gleicht der Agent den Posten aus.",
    facts: {
      title: "Herkunft",
      rows: [
        ["Offener Posten", "aus DATEV, Stichtag 01.06.2026"],
        ["Anker", "mirror-opos:10412/2026-0418"],
        ["Weiter", <TextButton key="d" href={tabHref("datev")}>DATEV-Wahrheit ansehen</TextButton>],
      ],
    },
  },
  details: {
    "ev-a1": {
      title: "Offener Posten RE-2026-0418",
      sub: "01.06.2026 · aus DATEV übernommen",
      origin: "none",
      note: "Keine Buchung nötig — der Posten ist in DATEV gebucht. Ludwig führt ihn weiter, bis die Zahlung kommt.",
    },
  },
  notes: [],
  clarificationList: [],
};

/** A3 (10 %) with point 6 — document and payment, both booked and exported. */
export const completeAndExported: CaseScenario = {
  accountingCase: caseFixture({
    caseNumber: "2026-0291",
    openedAt: "2026-07-02",
    lifecycleStatus: "closed_accepted",
    closedAt: "2026-07-31",
    summary: "Rechnung über Bremsbeläge, am 16.07. überwiesen.",
    exportBatchId: "stapel-07-2026",
    disposition: "agent",
    totalAmount: 214.2,
    currency: "EUR",
  }),
  today: TODAY,
  timelineSub: "zwei Ereignisse",
  events: [
    event("ev-a3-doc", "document_received", "2026-07-02", "Rechnung 93840211 eingegangen", 214.2, "posted", { bookingState: "posted" }),
    event("ev-a3-pay", "payment_out", "2026-07-16", "Überweisung an Musterbau Fahrzeugteile GmbH", -214.2, "posted", { bookingState: "posted" }),
  ],
  todo: {
    sub: "nichts offen",
    points: [],
    emptyText: "Nichts offen: beide Ereignisse sind gebucht, die Klammer ist ausgeglichen.",
    facts: {
      title: "Stand",
      rows: [
        ["DATEV-Export", <StatusBadge key="e" axis="export_case" status="exportiert" info={false} />],
        ["Stapel", "07-2026, übergeben am 01.08.2026"],
        ["Ausgleich", "Rechnung und Zahlung gleichen sich aus — Rest 0,00 €"],
      ],
    },
  },
  details: {
    "ev-a3-doc": {
      title: "Rechnung 93840211",
      sub: "02.07.2026 · gebucht und exportiert",
      lines: [
        line("debit", "5404", "Wareneingang 19 % VSt", 214.2, "Bremsbeläge", { automaticRate: 19 }),
        line("credit", "71202", "Musterbau Fahrzeugteile GmbH", 214.2, "Rechnung 93840211"),
      ],
      origin: "agent",
      ai: { verdict: "confirm", confidence: "green", judgeReasoning: "Konto und Kreditor wie in den Vormonaten." },
    },
    "ev-a3-pay": {
      title: "Überweisung an Musterbau Fahrzeugteile GmbH",
      sub: "16.07.2026 · gebucht und exportiert",
      lines: [
        line("debit", "71202", "Musterbau Fahrzeugteile GmbH", 214.2, "Zahlung 93840211"),
        line("credit", "1200", "Bank", 214.2, "Zahlung 93840211"),
      ],
      origin: "agent",
      ai: { verdict: "confirm", confidence: "green", judgeReasoning: "Betrag und Belegnummer stimmen mit der Rechnung überein." },
      brackets: [
        bracket(1, "93840211 · Musterbau Fahrzeugteile GmbH", "Überweisung Testbank 1210", 214.2, "71202", {
          invoice: "2026-07-02",
          payment: "2026-07-16",
        }),
      ],
    },
  },
  notes: [],
  clarificationList: [],
};

/** A6 (8 %, 75 % of all recurring cases) — recurring without a rule. */
export const recurringWithoutRule: CaseScenario = {
  accountingCase: caseFixture({
    caseNumber: "2026-0355",
    kind: "recurring_charge",
    openedAt: "2026-07-03",
    summary: "Monatlicher Abschlag für Strom, abgebucht per Lastschrift.",
    counterpartyName: "Beispiel-Energie AG",
    counterpartyPartnerId: "bp-3301",
    personalAccountNumber: "71877",
    disposition: "agent",
    totalAmount: null,
  }),
  today: TODAY,
  signal: { kicker: "Nächster Schritt", title: "Der Vorschlag zur August-Lastschrift wartet auf Ihre Prüfung.", action: "Prüfen" },
  timelineSub: "zwei Lastschriften",
  events: [
    event("ev-a6-1", "payment_out", "2026-07-03", "Lastschrift Beispiel-Energie AG", -142, "posted", { bookingState: "posted" }),
    event("ev-a6-2", "payment_out", "2026-08-04", "Lastschrift Beispiel-Energie AG", -142, "proposed", { bookingState: "proposed" }),
  ],
  todo: {
    sub: "1 Freigabe · Regel möglich",
    points: [
      {
        key: "rule",
        title: "Für diesen Dauersachverhalt gibt es noch keine Regel.",
        hint: "Aus der letzten Lastschrift anlegen: monatlich, 142,00 €, 4240 an 1200 — die Vorschläge kämen dann vom Regelwerk.",
        state: "info",
        ways: ["Regel anlegen"],
      },
    ],
    approval: {
      caption: "Vorschlag zur Lastschrift vom 04.08.",
      lines: [
        line("debit", "4240", "Gas, Strom, Wasser", 142, "Abschlag August", { automaticRate: 19 }),
        line("credit", "1200", "Bank", 142, "Lastschrift Beispiel-Energie AG"),
      ],
    },
  },
  details: {
    "ev-a6-1": {
      title: "Lastschrift Beispiel-Energie AG",
      sub: "03.07.2026 · gebucht",
      lines: [
        line("debit", "4240", "Gas, Strom, Wasser", 142, "Abschlag Juli", { automaticRate: 19 }),
        line("credit", "1200", "Bank", 142, "Lastschrift Beispiel-Energie AG"),
      ],
      origin: "agent",
      ai: { verdict: "confirm", confidence: "green", judgeReasoning: "Wie der Abschlag im Juni." },
    },
    "ev-a6-2": {
      title: "Lastschrift Beispiel-Energie AG",
      sub: "04.08.2026 · Vorschlag",
      lines: [
        line("debit", "4240", "Gas, Strom, Wasser", 142, "Abschlag August", { automaticRate: 19 }),
        line("credit", "1200", "Bank", 142, "Lastschrift Beispiel-Energie AG"),
      ],
      origin: "agent",
      ai: {
        verdict: "confirm",
        confidence: "green",
        rationale: "Derselbe Abschlag wie im Juli, gleiche Gegenpartei, gleicher Betrag.",
        judgeReasoning: "Kein Vorgriff, keine Dublette.",
      },
      actions: ["Freigeben", "Ändern"],
    },
  },
  notes: [],
  clarificationList: [],
};

const awaitingDocumentBase: CaseScenario = {
  accountingCase: caseFixture({
    caseNumber: "2026-0402",
    lifecycleStatus: "waiting_for_documents",
    openedAt: "2026-07-22",
    summary: "Zwei Abbuchungen ohne Rechnung; Ludwig hat die Rechnung beim Mandanten angefordert.",
    counterpartyName: "Testhandel Bürobedarf KG",
    counterpartyPartnerId: "bp-4410",
    personalAccountNumber: "71450",
    disposition: "agent",
    totalAmount: 86,
    currency: "EUR",
  }),
  today: TODAY,
  headerAction: "Beleg anhängen",
  timelineSub: "zwei Abbuchungen, eine Erwartung",
  events: [
    event("ev-a7-1", "payment_out", "2026-07-22", "Abbuchung Testhandel Bürobedarf KG", -43, "proposed", { bookingState: "proposed" }),
    event("ev-a7-2", "payment_out", "2026-07-29", "Abbuchung Testhandel Bürobedarf KG", -43, "proposed", { bookingState: "proposed" }),
  ],
  expectations: [
    { id: "ex-a7", kind: "document", dueDate: "2026-08-19", escalationLevel: 0, counterpartyName: "Testhandel Bürobedarf KG", amount: 86, currency: "EUR" },
  ],
  todo: {
    sub: "1 Beleg fehlt",
    points: [
      {
        key: "document",
        title: "Die Rechnung von Testhandel Bürobedarf KG fehlt.",
        hint: "Erbeten bis 19.08.2026, in 14 Tagen · noch keine Mahnung — der Mandant ist gefragt.",
        state: "open",
        ways: ["Beleg anhängen", "Erledigt", "Aufheben"],
      },
    ],
  },
  details: Object.fromEntries(
    ["ev-a7-1", "ev-a7-2"].map((id, i) => [
      id,
      {
        title: "Abbuchung Testhandel Bürobedarf KG",
        sub: `${i === 0 ? "22.07." : "29.07."}2026 · Vorschlag gegen das Personenkonto`,
        lines: [
          line("debit", "71450", "Testhandel Bürobedarf KG", 43, "Abbuchung ohne Rechnung"),
          line("credit", "1200", "Bank", 43, "Abbuchung ohne Rechnung"),
        ],
        origin: "agent" as const,
        ai: {
          verdict: "confirm_with_note" as const,
          confidence: "yellow" as const,
          judgeReasoning: "Gegen das Personenkonto, bis die Rechnung da ist — dann folgt das Sachkonto.",
        },
      },
    ]),
  ),
  notes: [
    { id: "n-a7", at: "2026-07-30T09:00:00Z", author: "Agent", text: "Rechnung beim Mandanten angefordert; zwei Abbuchungen über je 43,00 €." },
  ],
  clarificationList: [],
};

/** A7 with point 2 — waiting for the document; the case waits on someone else. */
export const awaitingDocument: CaseScenario = awaitingDocumentBase;

/** Point 2, the one escalation in stock — level 1, overdue. */
export const awaitingDocumentEscalated: CaseScenario = {
  ...awaitingDocumentBase,
  expectations: [
    { id: "ex-a7", kind: "document", dueDate: "2026-07-29", escalationLevel: 1, counterpartyName: "Testhandel Bürobedarf KG", amount: 86, currency: "EUR" },
  ],
  todo: {
    sub: "1 Beleg überfällig",
    points: [
      {
        key: "document",
        title: "Die Rechnung von Testhandel Bürobedarf KG ist überfällig.",
        hint: "Erbeten bis 29.07.2026, seit 7 Tagen überfällig · einmal gemahnt (Stufe 1).",
        state: "error",
        ways: ["Beleg anhängen", "Erledigt", "Aufheben"],
      },
    ],
  },
};

/** A8 (11 %) — outgoing invoice with the customer's payment. */
export const outgoingWithPayment: CaseScenario = {
  accountingCase: caseFixture({
    caseNumber: "2026-0377",
    kind: "outgoing_invoice",
    openedAt: "2026-07-10",
    summary: "Ausgangsrechnung über Wartungsarbeiten; der Kunde hat am 02.08. überwiesen.",
    counterpartyName: "Beispielbau Handels GmbH",
    counterpartyPartnerId: "bp-2210",
    personalAccountNumber: "10412",
    counterpartySide: "debtor",
    disposition: "agent",
    totalAmount: 2380,
    currency: "EUR",
  }),
  today: TODAY,
  signal: { kicker: "Nächster Schritt", title: "Der Zahlungseingang wartet auf Ihre Prüfung.", action: "Prüfen" },
  timelineSub: "Rechnung und Zahlung",
  events: [
    event("ev-a8-doc", "document_received", "2026-07-10", "Ausgangsrechnung AR-2026-0377", 2380, "posted", { bookingState: "posted" }),
    event("ev-a8-pay", "payment_in", "2026-08-02", "Überweisung Beispielbau Handels GmbH", 2380, "proposed", { bookingState: "proposed" }),
  ],
  todo: {
    sub: "1 Freigabe",
    points: [],
    emptyText: "Nichts offen außer der Freigabe darunter.",
    approval: {
      caption: "Vorschlag zum Zahlungseingang vom 02.08.",
      lines: [
        line("debit", "1200", "Bank", 2380, "Zahlung AR-2026-0377"),
        line("credit", "10412", "Beispielbau Handels GmbH", 2380, "Zahlung AR-2026-0377"),
      ],
    },
  },
  details: {
    "ev-a8-doc": {
      title: "Ausgangsrechnung AR-2026-0377",
      sub: "10.07.2026 · gebucht",
      lines: [
        line("debit", "10412", "Beispielbau Handels GmbH", 2380, "AR-2026-0377"),
        line("credit", "8400", "Erlöse 19 % USt", 2380, "Wartung Juli", { automaticRate: 19 }),
      ],
      origin: "agent",
      ai: { verdict: "confirm", confidence: "green", judgeReasoning: "Erlöskonto wie bei den Wartungsrechnungen im Frühjahr." },
    },
    "ev-a8-pay": {
      title: "Überweisung Beispielbau Handels GmbH",
      sub: "02.08.2026 · Vorschlag",
      lines: [
        line("debit", "1200", "Bank", 2380, "Zahlung AR-2026-0377"),
        line("credit", "10412", "Beispielbau Handels GmbH", 2380, "Zahlung AR-2026-0377"),
      ],
      origin: "agent",
      ai: {
        verdict: "confirm",
        confidence: "green",
        rationale: "Verwendungszweck nennt AR-2026-0377, der Betrag stimmt auf den Cent.",
        judgeReasoning: "Gleicht die offene Rechnung vollständig aus.",
      },
      brackets: [
        bracket(1, "AR-2026-0377 · Beispielbau Handels GmbH", "Überweisung Testbank 1210", 2380, "10412", {
          invoice: "2026-07-10",
          payment: "2026-08-02",
        }),
      ],
      actions: ["Freigeben", "Ändern"],
    },
  },
  notes: [],
  clarificationList: [],
};

const OPEN_QUESTION = {
  id: "cl-q1",
  title: "Bohrhammer für 500 € — geringwertig oder Anlagevermögen?",
  state: "open" as const,
  severity: "required" as const,
  type: "question" as const,
  audience: "accounting" as const,
  raisedAt: "2026-07-28T10:00:00Z",
  href: "?tab=rueckfragen&klaerung=cl-q1",
};

/** Point 1 — a question is open and the firm is on turn (43 cases). */
export const clarificationOpenFirm: CaseScenario = {
  accountingCase: caseFixture({
    caseNumber: "2026-0368",
    lifecycleStatus: "needs_clarification",
    openedAt: "2026-07-28",
    summary: "Rechnung über einen Akku-Bohrhammer; offen ist, ob sofort Aufwand oder Anlagevermögen.",
    counterpartyName: "Musterbau Werkzeuge GmbH",
    counterpartyPartnerId: "bp-5120",
    personalAccountNumber: "71630",
    disposition: "accounting",
    totalAmount: 595,
    currency: "EUR",
  }),
  today: TODAY,
  timelineSub: "ein Beleg, eine Rückfrage",
  events: [
    event("ev-q-doc", "document_received", "2026-07-28", "Rechnung WZ-2026-118 eingegangen", 595, "blocked", {
      stateNote: "Gebucht wird, sobald die Rückfrage beantwortet ist.",
    }),
  ],
  clarifications: [
    { id: "cl-q1", type: "question", title: OPEN_QUESTION.title, raisedAt: OPEN_QUESTION.raisedAt, severity: "required", audience: "accounting" },
  ],
  todo: {
    sub: "1 Rückfrage",
    points: [
      {
        key: "question",
        title: "Die Rückfrage zur Rechnung WZ-2026-118 ist offen.",
        hint: "Ohne Antwort bucht der Agent nicht — die Antwort steht rechts zur Auswahl.",
        state: "question",
      },
    ],
  },
  details: {
    "ev-q-doc": {
      title: "Rechnung WZ-2026-118",
      sub: "28.07.2026 · wartet auf die Antwort",
      origin: "none",
      note: "Noch kein Vorschlag: der Agent bucht, sobald die Rückfrage beantwortet ist.",
    },
  },
  notes: [],
  clarificationList: [OPEN_QUESTION],
  answerable: {
    ...OPEN_QUESTION,
    text: "Die Rechnung nennt einen Akku-Bohrhammer für 500,00 € netto.",
    context: "Netto 500,00 € liegt genau an der Grenze; der Mandant hat 2025 ähnliche Geräte sofort in den Aufwand gebucht.",
    question: "Soll der Bohrhammer als geringwertiges Wirtschaftsgut sofort in den Aufwand oder ins Anlagevermögen?",
    recommendation: "Sofort in den Aufwand (4855), wie im Vorjahr.",
    answerKind: "single_choice",
    answerOptions: ["Geringwertig, sofort Aufwand (4855)", "Anlagevermögen (0480)"],
    allowFreeText: true,
    sources: [{ kind: "source_doc", label: "Rechnung WZ-2026-118", href: "#" }],
  },
};

/** Point 3 — the agent withdrew its proposal (85 entries in stock). */
export const proposalWithdrawn: CaseScenario = {
  accountingCase: caseFixture({
    caseNumber: "2026-0349",
    openedAt: "2026-07-24",
    summary: "Frachtrechnung; der erste Vorschlag ist zurückgezogen, weil eine Gutschrift dazugehört.",
    counterpartyName: "Beispiel-Logistik GmbH",
    counterpartyPartnerId: "bp-6602",
    personalAccountNumber: "71511",
    disposition: "agent",
    totalAmount: 318.5,
    currency: "EUR",
  }),
  today: TODAY,
  timelineSub: "ein Beleg",
  events: [
    event("ev-w-doc", "document_received", "2026-07-24", "Rechnung BL-55120 eingegangen", 318.5, "open", {
      bookingState: "reversed",
      stateNote: "Der Agent hat seinen Vorschlag am 25.07. zurückgezogen und bucht neu, sobald die Gutschrift zugeordnet ist.",
    }),
  ],
  todo: {
    sub: "kein Vorschlag",
    points: [
      {
        key: "withdrawn",
        title: "Es gibt keinen gültigen Vorschlag.",
        hint: "Der Agent hat seinen Vorschlag vom 24.07. am 25.07. zurückgezogen. Er bucht neu, sobald die Gutschrift GS-2231 zugeordnet ist — zu tun ist hier nichts.",
        state: "returned",
      },
    ],
  },
  details: {
    "ev-w-doc": {
      title: "Rechnung BL-55120",
      sub: "24.07.2026 · Vorschlag zurückgezogen",
      lines: [
        line("debit", "4730", "Ausgangsfrachten", 318.5, "Fracht Juli", { automaticRate: 19 }),
        line("credit", "71511", "Beispiel-Logistik GmbH", 318.5, "BL-55120"),
      ],
      origin: "none",
      note: "Zurückgezogen am 25.07.2026 — der Vorschlag steht hier zum Nachlesen und gilt nicht mehr.",
    },
  },
  notes: [
    { id: "n-w", at: "2026-07-25T08:10:00Z", author: "Agent", text: "Vorschlag zurückgezogen: zur Rechnung gehört die Gutschrift GS-2231." },
  ],
  clarificationList: [],
};

/** Point 4 — merged into another case (14 cases, `closed_superseded`). */
export const superseded: CaseScenario = {
  accountingCase: caseFixture({
    caseNumber: "2026-0311",
    lifecycleStatus: "closed_superseded",
    openedAt: "2026-07-18",
    closedAt: "2026-07-20",
    summary: "Doppelt angelegt; beim Zusammenführen in 2026-0334 aufgegangen.",
    disposition: "agent",
  }),
  today: TODAY,
  timelineSub: "ein ersetztes Ereignis",
  events: [
    event("ev-s-doc", "document_received", "2026-07-18", "Rechnung 93846778 eingegangen", 25.41, "superseded", { superseded: true }),
  ],
  todo: {
    sub: "nichts offen",
    points: [],
    emptyText: "Nichts zu tun: dieser Sachverhalt ist in 2026-0334 aufgegangen.",
    facts: {
      title: "Ersetzt",
      rows: [
        [
          "Nachfolger",
          <CaseCell
            key="c"
            cases={[
              {
                caseId: "c-0334",
                caseNumber: "2026-0334",
                fiscalYear: 2026,
                title: null,
                kind: "incoming_invoice",
                counterpartyName: "Musterbau Fahrzeugteile GmbH",
                lifecycleStatus: "open",
              },
            ]}
            href={(id) => `?fall=${id}`}
          />,
        ],
        ["Zusammengeführt", "20.07.2026 vom Agenten"],
      ],
    },
  },
  details: {
    "ev-s-doc": {
      title: "Rechnung 93846778",
      sub: "18.07.2026 · ersetzt",
      origin: "none",
      note: "Ersetzt — das Ereignis lebt im Sachverhalt 2026-0334 weiter.",
    },
  },
  notes: [],
  clarificationList: [],
};

const judgeCase = (over: Parameters<typeof caseFixture>[0]) =>
  caseFixture({ kind: "incoming_invoice", disposition: "agent", currency: "EUR", ...over });

/** Point 7 — the judge flags the proposal. */
export const judgeFlagged: CaseScenario = {
  accountingCase: judgeCase({
    caseNumber: "2026-0371",
    openedAt: "2026-08-01",
    summary: "Werkstattrechnung mit Ersatzteilen und Arbeitslohn.",
    counterpartyName: "Beispiel-Autohaus GmbH",
    counterpartyPartnerId: "bp-7130",
    personalAccountNumber: "71733",
    totalAmount: 1428,
  }),
  today: TODAY,
  signal: { kicker: "Nächster Schritt", title: "Der Judge beanstandet den Vorschlag — bitte prüfen.", action: "Prüfen", tone: "warning" },
  timelineSub: "ein Beleg",
  events: [
    event("ev-f-doc", "document_received", "2026-08-01", "Rechnung WS-88120 eingegangen", 1428, "proposed", { bookingState: "proposed" }),
  ],
  todo: {
    sub: "1 beanstandet · 1 Freigabe",
    points: [
      {
        key: "judge",
        title: "Der Judge beanstandet den Vorschlag.",
        hint: "BU-Schlüssel 9 auf dem Automatikkonto 4540 — die Vorsteuer entstünde doppelt.",
        state: "warning",
        ways: ["Vorschlag ändern"],
      },
    ],
    approval: {
      caption: "Vorschlag vom 01.08. — vom Judge beanstandet",
      lines: [
        line("debit", "4540", "Kfz-Reparaturen", 1428, "Werkstattrechnung WS-88120", { taxKey: "9", automaticRate: 19 }),
        line("credit", "71733", "Beispiel-Autohaus GmbH", 1428, "WS-88120"),
      ],
    },
  },
  details: {
    "ev-f-doc": {
      title: "Rechnung WS-88120",
      sub: "01.08.2026 · Vorschlag, beanstandet",
      lines: [
        line("debit", "4540", "Kfz-Reparaturen", 1428, "Werkstattrechnung WS-88120", { taxKey: "9", automaticRate: 19 }),
        line("credit", "71733", "Beispiel-Autohaus GmbH", 1428, "WS-88120"),
      ],
      origin: "agent",
      ai: {
        verdict: "flag",
        confidence: "yellow",
        rationale: "Konto wie bei den Werkstattrechnungen desselben Autohauses im Mai und Juni.",
        judgeReasoning: "Schlüssel 9 auf einem Automatikkonto: die Vorsteuer wird doppelt gezogen. Schlüssel entfernen oder ein Konto ohne Automatik wählen.",
      },
      actions: ["Ändern", "Trotzdem freigeben"],
    },
  },
  notes: [],
  clarificationList: [],
};

/** Point 7 — the judge adjusted the proposal before it reached the firm. */
export const judgeAdjusted: CaseScenario = {
  accountingCase: judgeCase({
    caseNumber: "2026-0372",
    openedAt: "2026-08-03",
    summary: "Kontoführungsentgelt der Hausbank für Juli.",
    counterpartyName: "Testbank eG",
    counterpartyPartnerId: "bp-0101",
    personalAccountNumber: "71021",
    totalAmount: 59.5,
  }),
  today: TODAY,
  signal: { kicker: "Nächster Schritt", title: "Der Buchungsvorschlag wartet auf Ihre Prüfung.", action: "Prüfen" },
  timelineSub: "ein Beleg",
  events: [
    event("ev-j-doc", "document_received", "2026-08-03", "Entgeltaufstellung Juli", 59.5, "proposed", { bookingState: "proposed" }),
  ],
  todo: {
    sub: "1 Freigabe",
    points: [],
    emptyText: "Nichts offen außer der Freigabe darunter.",
    approval: {
      caption: "Vorschlag vom 03.08. — vom Judge angepasst",
      lines: [
        line("debit", "4970", "Nebenkosten des Geldverkehrs", 59.5, "Kontoführung Juli"),
        line("credit", "71021", "Testbank eG", 59.5, "Entgeltaufstellung Juli"),
      ],
    },
  },
  details: {
    "ev-j-doc": {
      title: "Entgeltaufstellung Juli",
      sub: "03.08.2026 · Vorschlag, vom Judge angepasst",
      lines: [
        line("debit", "4970", "Nebenkosten des Geldverkehrs", 59.5, "Kontoführung Juli"),
        line("credit", "71021", "Testbank eG", 59.5, "Entgeltaufstellung Juli"),
      ],
      origin: "agent",
      ai: {
        verdict: "adjust",
        confidence: "green",
        rationale: "Kontoführungsentgelt der Hausbank, monatlich.",
        judgeReasoning: "Konto 4970 statt 4900, wie in den Vormonaten; Buchungstext auf die Entgeltaufstellung angepasst.",
      },
      actions: ["Freigeben", "Ändern"],
    },
  },
  notes: [],
  clarificationList: [],
};

/* ── Brief F196 §7, matched against the stock on 2026-09-11 ─────────────── */

/** E6 — the agent handed the case to the firm without a question (27 open cases with `disposition = accounting`). */
export const handedToFirm: CaseScenario = {
  accountingCase: caseFixture({
    caseNumber: "2026-0377",
    openedAt: "2026-07-29",
    summary: "Abbuchung ohne Rechnungsnummer; zwei offene Rechnungen desselben Lieferanten passen gleich gut.",
    counterpartyName: "Beispiel-Versand GmbH",
    counterpartyPartnerId: "bp-7020",
    personalAccountNumber: "71733",
    disposition: "accounting",
    totalAmount: 734.8,
    currency: "EUR",
  }),
  today: TODAY,
  signal: {
    kicker: "Nächster Schritt",
    title: "Der Agent hat den Fall an die Kanzlei übergeben: welche Rechnung ist bezahlt?",
    action: "Selbst zuordnen",
  },
  timelineSub: "eine Abbuchung",
  events: [
    event("ev-h-pay", "payment_out", "2026-07-29", "Abbuchung Beispiel-Versand GmbH", -734.8, "blocked", {
      stateNote: "Nicht gebucht: der Agent hat an die Kanzlei übergeben.",
    }),
  ],
  todo: {
    sub: "an die Kanzlei übergeben",
    points: [
      {
        key: "handed",
        title: "Zwei offene Rechnungen passen zur Abbuchung.",
        hint: "RE-4410 und RE-4471 lauten auf denselben Betrag, die Abbuchung nennt keine Nummer. Ordnen Sie selbst zu, oder geben Sie den Fall mit einem Hinweis an den Agenten zurück.",
        state: "returned",
        ways: ["Selbst zuordnen", "An den Agenten zurückgeben"],
      },
    ],
  },
  details: {
    "ev-h-pay": {
      title: "Abbuchung Beispiel-Versand GmbH",
      sub: "29.07.2026 · nicht gebucht",
      origin: "none",
      note: "Kein Vorschlag: statt zwischen zwei gleich guten offenen Posten zu raten, hat der Agent an die Kanzlei übergeben.",
    },
  },
  notes: [
    {
      id: "n-h",
      at: "2026-07-29T09:40:00Z",
      author: "Agent",
      text: "An die Kanzlei übergeben: RE-4410 und RE-4471 sind beide offen und gleich hoch, die Abbuchung nennt keine Rechnungsnummer.",
    },
  ],
  clarificationList: [],
};

/** E9 — just founded from a bank line: no counterparty (about 5 % of cases), so no account, no proposal, no amount. */
export const newWithoutCounterparty: CaseScenario = {
  accountingCase: caseFixture({
    caseNumber: "2026-0419",
    openedAt: "2026-08-04",
    summary: null,
    counterpartyName: null,
    counterpartyPartnerId: null,
    personalAccountNumber: null,
    counterpartySide: null,
    createdByLabel: "Agent · aus einer Bankzeile",
    disposition: "agent",
    totalAmount: null,
  }),
  today: TODAY,
  timelineSub: "eine Abbuchung",
  events: [event("ev-n-pay", "payment_out", "2026-08-04", "SEPA-Lastschrift ohne Namen", -49.9, "open")],
  todo: {
    sub: "2 offen",
    points: [
      {
        key: "counterparty",
        title: "Der Gegenpart fehlt.",
        hint: "Die Lastschrift nennt nur eine Gläubiger-ID, und kein Geschäftspartner trägt sie. Mit dem Partner steht auch das Personenkonto fest.",
        state: "open",
        ways: ["Partner wählen"],
      },
      {
        key: "booking",
        title: "Die Abbuchung ist nicht gebucht.",
        hint: "Der Agent schlägt vor, sobald der Gegenpart feststeht.",
        state: "open",
      },
    ],
  },
  details: {
    "ev-n-pay": {
      title: "SEPA-Lastschrift ohne Namen",
      sub: "04.08.2026 · nicht gebucht",
      origin: "none",
      note: "Noch kein Vorschlag: ohne Gegenpart kennt der Agent das Konto nicht.",
    },
  },
  notes: [],
  clarificationList: [],
};
