import type { ClarificationVM } from "@/ui/v3/entities/clarification/Clarification";
import type {
  CaseTimelineClarification,
  CaseTimelineEvent,
} from "@/ui/v3/entities/accounting-case/CaseTimeline";
import type { JournalLine } from "@/ui/v3/entities/journal-entry/JournalEntryCompact";
import { StatusBadge } from "@/ui/v3/patterns/StatusBadge";
import { TextButton } from "@/ui/v3/primitives/TextButton";

import { TODAY, caseFixture, tabHref } from "./fixtures";
import type { CaseScenario, EventDetail } from "./scenario";
import { bracket } from "./scenarios";

/**
 * Wave 3 of 0152: collective cases, recurring cases and the edges. Data forms
 * from the staging survey of 2026-09-10; names, amounts and numbers are made up.
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

const pad = (n: number, width = 2) => String(n).padStart(width, "0");
const dayOf = (start: string, offset: number) => {
  const d = new Date(`${start}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
};
const euro = (n: number) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ── A5 — the client's own batch: 508 events, 12 open questions ──────────── */

const BATCH_TEXTS = ["Kasse", "Wareneinkauf", "Bewirtung", "Porto", "Kfz-Kosten", "Bürobedarf"];
const BATCH_EVENTS: CaseTimelineEvent[] = Array.from({ length: 508 }, (_, i) => {
  const incoming = i % 3 === 0;
  const amount = ((i * 37) % 900) + 10;
  return event(
    `ev-b-${pad(i + 1, 3)}`,
    incoming ? "payment_in" : "payment_out",
    dayOf("2026-01-02", Math.floor((i * 210) / 508)),
    `Stapelzeile ${pad(i + 1, 3)} · ${BATCH_TEXTS[i % BATCH_TEXTS.length]}`,
    incoming ? amount : -amount,
    "proposed",
    { bookingState: "proposed" },
  );
});

const BATCH_QUESTIONS: ClarificationVM[] = Array.from({ length: 12 }, (_, i) => ({
  id: `cl-b-${pad(i + 1)}`,
  title: `Stapelzeile ${pad((i + 1) * 41, 3)}: Konto 1590 — was steckt dahinter?`,
  state: "open" as const,
  severity: "required" as const,
  type: "question" as const,
  audience: "accounting" as const,
  raisedAt: `2026-08-0${1 + (i % 4)}T09:${pad(i * 4)}:00Z`,
  href: `?tab=rueckfragen&klaerung=cl-b-${pad(i + 1)}`,
}));

const batchDetail = (e: CaseTimelineEvent): EventDetail => {
  const amount = Math.abs(e.amount ?? 0);
  const incoming = e.kind === "payment_in";
  return {
    title: e.title,
    sub: `${e.date.split("-").reverse().join(".")} · aus dem Stapel des Mandanten`,
    lines: incoming
      ? [line("debit", "1000", "Kasse", amount, e.title), line("credit", "8400", "Erlöse 19 % USt", amount, e.title, { automaticRate: 19 })]
      : [line("debit", "4980", "Sonstiger Betriebsbedarf", amount, e.title), line("credit", "1000", "Kasse", amount, e.title)],
    origin: "client_import",
  };
};

/** A5 (9 %) — the client booked in their own software; the firm accepts. */
export const clientBatch: CaseScenario = {
  accountingCase: caseFixture({
    caseNumber: "2026-0101",
    kind: "adjustment_only",
    title: "Mandantenstapel 2026",
    lifecycleStatus: "needs_clarification",
    openedAt: "2026-01-02",
    summary: "Buchungsstapel des Mandanten aus seiner eigenen Software; die Kanzlei nimmt ab.",
    counterpartyName: null,
    counterpartyPartnerId: null,
    personalAccountNumber: null,
    counterpartySide: null,
    documentNumberMode: "multiple",
    createdByLabel: "System · Stapelimport",
    agentRunId: null,
    disposition: "accounting",
    totalAmount: null,
  }),
  today: TODAY,
  signal: { kicker: "Nächster Schritt", title: "12 Rückfragen zum Mandantenstapel warten auf die Kanzlei.", action: "Rückfragen öffnen" },
  timelineSub: "508 Stapelzeilen, 12 Rückfragen",
  events: BATCH_EVENTS,
  clarifications: BATCH_QUESTIONS.map(
    (c): CaseTimelineClarification => ({ id: c.id, type: "question", title: c.title, raisedAt: c.raisedAt, severity: "required", audience: "accounting" }),
  ),
  timelineLimit: 20,
  todo: {
    sub: "12 Rückfragen · 508 Vorschläge",
    points: [
      {
        key: "questions",
        title: "12 Rückfragen zum Stapel sind offen.",
        hint: "Alle an die Kanzlei; ohne Antwort bleiben die betroffenen Zeilen Vorschlag.",
        state: "question",
        ways: ["Rückfragen öffnen"],
      },
      {
        key: "accept",
        title: "508 Buchungen aus dem Mandantenstapel warten auf Abnahme.",
        hint: "Gebucht hat der Mandant selbst — kein Agent, kein Judge. Abgenommen wird in der Stapelabnahme, nicht zeilenweise hier.",
        state: "open",
        ways: ["Zur Stapelabnahme"],
      },
    ],
  },
  details: Object.fromEntries(BATCH_EVENTS.map((e) => [e.id, batchDetail(e)])),
  notes: [],
  clarificationList: BATCH_QUESTIONS,
};

/* ── A9 — recurring case with a rule: twelve accruals ───────────────────── */

const RULE_SENTENCE =
  "Monatlich am 1. erwartet Ludwig einen Zahlungseingang von Beispiel-Mieter GmbH über 1.190,00 €; gebucht wird 10870 an 8400, Beleg je Periode.";
const rent = (text: string): JournalLine[] => [
  line("debit", "10870", "Beispiel-Mieter GmbH", 1190, text),
  line("credit", "8400", "Erlöse 19 % USt", 1190, text, { automaticRate: 19 }),
];
const rentPayment = (text: string): JournalLine[] => [
  line("debit", "1200", "Bank", 1190, text),
  line("credit", "10870", "Beispiel-Mieter GmbH", 1190, text),
];

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const RULE_EVENTS: CaseTimelineEvent[] = [
  event("ev-r-doc", "document_received", "2026-01-01", "Dauerrechnung Miete 2026", 1190, "no_booking_required", {
    stateNote: "Keine Buchung nötig: die Dauerrechnung trägt die Regel, gebucht wird je Monat.",
  }),
  ...MONTHS.map((m) =>
    event(`ev-r-acc-${pad(m)}`, "accrual", `2026-${pad(m)}-01`, `Miete ${pad(m)}/2026 abgegrenzt`, 1190, m === 12 ? "proposed" : "posted", {
      bookingState: m === 12 ? "proposed" : "posted",
    }),
  ),
  ...MONTHS.filter((m) => m < 12).map((m) =>
    event(`ev-r-pay-${pad(m)}`, "payment_in", `2026-${pad(m)}-03`, "Zahlungseingang Beispiel-Mieter GmbH", 1190, "posted", { bookingState: "posted" }),
  ),
];

/** A9 (3 %; point 8) — twelve accruals by the rule, no judge; `needs_review` is the only hint. */
export const recurringWithRule: CaseScenario = {
  accountingCase: caseFixture({
    caseNumber: "2026-0044",
    kind: "recurring_charge",
    openedAt: "2026-01-01",
    summary: "Miete für die Halle Musterstraße 12, monatlich am 1. fällig; gebucht wird vom Regelwerk.",
    counterpartyName: "Beispiel-Mieter GmbH",
    counterpartyPartnerId: "bp-8801",
    personalAccountNumber: "10870",
    counterpartySide: "debtor",
    expectedInterval: "monthly",
    agentRunId: null,
    disposition: "agent",
    totalAmount: null,
  }),
  today: "2026-12-10",
  timelineSub: "Dauerrechnung, zwölf Abgrenzungen, elf Zahlungen",
  events: RULE_EVENTS,
  todo: {
    sub: "1 Freigabe vom Regelwerk",
    points: [],
    emptyText: "Nichts offen außer der Dezember-Buchung darunter.",
    approval: {
      caption: "Abgrenzung 12/2026 vom Regelwerk",
      lines: rent("Miete 12/2026"),
      hint: "Das Regelwerk bittet um einen Blick (needs_review) — es ist der einzige Hinweis an dieser Buchung. Keine Begründung, keine Quellen, kein Judge: die Erklärung ist die Regel.",
    },
    facts: {
      title: "Regel",
      rows: [
        ["Regel", RULE_SENTENCE],
        ["Rhythmus", "monatlich am 1., seit 01/2026"],
        ["Herkunft", <StatusBadge key="o" axis="buchung_origin" status="recurring_rule" info={false} />],
        ["Weiter", <TextButton key="w" href={tabHref("regelwerk")}>Regel ansehen</TextButton>],
      ],
    },
  },
  details: Object.fromEntries([
    [
      "ev-r-doc",
      {
        title: "Dauerrechnung Miete 2026",
        sub: "01.01.2026 · trägt die Regel",
        origin: "none",
        note: "Keine Buchung nötig: die Dauerrechnung begründet die monatlichen Buchungen des Regelwerks.",
      } satisfies EventDetail,
    ],
    ...MONTHS.map((m): [string, EventDetail] => [
      `ev-r-acc-${pad(m)}`,
      {
        title: `Miete ${pad(m)}/2026`,
        sub: `01.${pad(m)}.2026 · ${m === 12 ? "Vorschlag vom Regelwerk" : "gebucht vom Regelwerk"}`,
        lines: rent(`Miete ${pad(m)}/2026`),
        origin: "rule",
        rule: { sentence: RULE_SENTENCE, period: `${pad(m)}/2026`, needsReview: m === 12 },
        ...(m === 12 ? { actions: ["Freigeben", "Ändern"] } : {}),
      },
    ]),
    ...MONTHS.filter((m) => m < 12).map((m): [string, EventDetail] => [
      `ev-r-pay-${pad(m)}`,
      {
        title: "Zahlungseingang Beispiel-Mieter GmbH",
        sub: `03.${pad(m)}.2026 · gebucht`,
        lines: rentPayment(`Miete ${pad(m)}/2026`),
        origin: "agent",
        ai: { verdict: "confirm", confidence: "green", judgeReasoning: "Betrag und Periode stimmen mit der Abgrenzung überein." },
      },
    ]),
  ]),
  notes: [],
  clarificationList: [],
};

/* ── A10 — clearing group on a clearing account (point 9, S15) ─────────── */

const payouts = (last: number): CaseTimelineEvent[] =>
  Array.from({ length: 12 }, (_, i) =>
    event(`ev-g-${pad(i + 1)}`, "payment_in", dayOf("2026-07-03", i * 2), `Auszahlung Beispiel-Payments ${pad(i + 1)}/12`, i === 11 ? last : 400, "posted", {
      bookingState: "posted",
    }),
  );

const clearingBase = (last: number): Omit<CaseScenario, "todo"> => {
  const events = [
    event("ev-g-doc", "document_received", "2026-07-31", "Monatsabrechnung Juli", 4800, "posted", { bookingState: "posted" }),
    ...payouts(last),
  ];
  return {
    accountingCase: caseFixture({
      caseNumber: "2026-0250",
      kind: "internal_transfer",
      title: "Auszahlungen Zahlungsdienstleister Juli",
      openedAt: "2026-07-03",
      summary: "Zwölf Auszahlungen des Zahlungsdienstleisters gegen seine Monatsabrechnung.",
      counterpartyName: "Beispiel-Payments B.V.",
      counterpartyPartnerId: "bp-9100",
      personalAccountNumber: null,
      clearingAccountNumber: "1360",
      clearingAccountName: "Geldtransit",
      clearingAccountType: "central_settlement",
      clearingBalance: last - 400,
      documentNumberMode: "multiple",
      disposition: "agent",
      totalAmount: 4400 + last,
      currency: "EUR",
    }),
    today: TODAY,
    timelineSub: "eine Abrechnung, zwölf Auszahlungen",
    events,
    details: Object.fromEntries(
      events.map((e): [string, EventDetail] => [
        e.id,
        e.kind === "document_received"
          ? {
              title: "Monatsabrechnung Juli",
              sub: "31.07.2026 · gebucht",
              lines: [line("debit", "1360", "Geldtransit", 4800, "Abrechnung Juli"), line("credit", "10999", "Sammeldebitor Zahlungsdienst", 4800, "Abrechnung Juli")],
              origin: "agent",
              ai: { verdict: "confirm", confidence: "green", judgeReasoning: "Gegen das Verrechnungskonto, wie im Juni." },
            }
          : {
              title: e.title,
              sub: `${e.date.split("-").reverse().join(".")} · gebucht`,
              lines: [line("debit", "1200", "Bank", e.amount ?? 0, e.title), line("credit", "1360", "Geldtransit", e.amount ?? 0, e.title)],
              origin: "agent",
              ai: { verdict: "confirm", confidence: "green", judgeReasoning: "Auszahlung des Zahlungsdienstleisters gegen das Verrechnungskonto." },
            },
      ]),
    ),
    notes: [],
    clarificationList: [],
  };
};

/** A10 (2 %; point 9) — the rest is open: 12,40 € on the clearing account. */
export const clearingGroup: CaseScenario = {
  ...clearingBase(412.4),
  todo: {
    sub: "Rest 12,40 €",
    points: [
      {
        key: "rest",
        title: "Der Saldo ist nicht ausgeglichen: Rest 12,40 €.",
        hint: "Verrechnungskonto 1360 Geldtransit · zwölf Auszahlungen über 4.812,40 € gegen die Abrechnung über 4.800,00 €.",
        state: "warning",
        ways: ["Saldo & Konten ansehen"],
      },
    ],
    facts: {
      title: "Verrechnung",
      rows: [
        ["Verrechnungskonto", "1360 Geldtransit"],
        ["Art", "Zentralregulierung"],
        ["Rest", "12,40 €"],
      ],
    },
  },
};

/** A10 — the same group, balanced: nothing left to do. */
export const clearingGroupBalanced: CaseScenario = {
  ...clearingBase(400),
  accountingCase: { ...clearingBase(400).accountingCase, lifecycleStatus: "closed_accepted", closedAt: "2026-08-01" },
  todo: {
    sub: "ausgeglichen",
    points: [],
    emptyText: "Ausgeglichen: zwölf Auszahlungen gegen die Abrechnung, Rest 0,00 €.",
    facts: {
      title: "Verrechnung",
      rows: [
        ["Verrechnungskonto", "1360 Geldtransit"],
        ["Art", "Zentralregulierung"],
        ["Rest", "0,00 €"],
      ],
    },
  },
};

/* ── Point 10 — collective payment, document number mode "multiple" ─────── */

const INVOICES = Array.from({ length: 12 }, (_, i) => ({
  id: `ev-p-inv-${pad(i + 1)}`,
  number: `9384${pad(1200 + i * 17, 4)}`,
  date: dayOf("2026-01-08", i * 14),
  amount: Math.round((180 + ((i * 53) % 420) + 0.35 * i) * 100) / 100,
}));
const POOL_TOTAL = Math.round(INVOICES.reduce((s, x) => s + x.amount, 0) * 100) / 100;

/** Point 10 — one payment clears twelve invoices; the brackets are the visible element. */
export const collectivePayment: CaseScenario = {
  accountingCase: caseFixture({
    caseNumber: "2026-0266",
    openedAt: "2026-01-08",
    summary: "Sammelzahlung über zwölf Rechnungen aus dem ersten Halbjahr (OPOS-Pool).",
    documentNumberMode: "multiple",
    disposition: "agent",
    totalAmount: POOL_TOTAL,
    currency: "EUR",
  }),
  today: TODAY,
  signal: { kicker: "Nächster Schritt", title: "Die Sammelzahlung wartet auf Ihre Prüfung.", action: "Prüfen" },
  timelineSub: "zwölf Rechnungen, eine Sammelzahlung",
  events: [
    ...INVOICES.map((x) =>
      event(x.id, "document_received", x.date, `Rechnung ${x.number} eingegangen`, x.amount, "posted", { bookingState: "posted" }),
    ),
    event("ev-p-pay", "payment_out", "2026-07-15", "Sammelüberweisung an Musterbau Fahrzeugteile GmbH", -POOL_TOTAL, "proposed", {
      bookingState: "proposed",
    }),
  ],
  todo: {
    sub: "1 Freigabe · 12 Klammern",
    points: [],
    emptyText: "Nichts offen außer der Freigabe darunter.",
    approval: {
      caption: "Sammelzahlung vom 15.07.",
      lines: [
        line("debit", "71202", "Musterbau Fahrzeugteile GmbH", POOL_TOTAL, "Sammelzahlung 12 Rechnungen"),
        line("credit", "1200", "Bank", POOL_TOTAL, "Sammelzahlung 12 Rechnungen"),
      ],
    },
    facts: {
      title: "Belegnummern",
      rows: [
        ["Modus", <StatusBadge key="m" axis="belegnummern_modus" status="multiple" info={false} />],
        ["Klammern", `12, zusammen ${euro(POOL_TOTAL)} € — Rest 0,00 €`],
      ],
    },
  },
  details: {
    ...Object.fromEntries(
      INVOICES.map((x): [string, EventDetail] => [
        x.id,
        {
          title: `Rechnung ${x.number}`,
          sub: `${x.date.split("-").reverse().join(".")} · gebucht`,
          lines: [
            line("debit", "5404", "Wareneingang 19 % VSt", x.amount, `Rechnung ${x.number}`, { automaticRate: 19 }),
            line("credit", "71202", "Musterbau Fahrzeugteile GmbH", x.amount, `Rechnung ${x.number}`),
          ],
          origin: "agent",
          ai: { verdict: "confirm", confidence: "green", judgeReasoning: "Konto und Kreditor wie bei den übrigen Rechnungen des Lieferanten." },
        },
      ]),
    ),
    "ev-p-pay": {
      title: "Sammelüberweisung an Musterbau Fahrzeugteile GmbH",
      sub: "15.07.2026 · Vorschlag über zwölf Rechnungen",
      lines: [
        line("debit", "71202", "Musterbau Fahrzeugteile GmbH", POOL_TOTAL, "Sammelzahlung 12 Rechnungen"),
        line("credit", "1200", "Bank", POOL_TOTAL, "Sammelzahlung 12 Rechnungen"),
      ],
      origin: "agent",
      ai: {
        verdict: "confirm",
        confidence: "green",
        rationale: "Der Verwendungszweck nennt zwölf Rechnungsnummern; die Summe stimmt auf den Cent.",
        judgeReasoning: "Jede Rechnung wird vollständig ausgeglichen, keine bleibt offen.",
      },
      brackets: INVOICES.map((x, i) =>
        bracket(i + 1, `${x.number} · Musterbau Fahrzeugteile GmbH`, "Sammelüberweisung Testbank 1210", x.amount, "71202", {
          invoice: x.date,
          payment: "2026-07-15",
        }),
      ),
      actions: ["Freigeben", "Ändern"],
    },
  },
  notes: [],
  clarificationList: [],
  initialSelection: "ev-p-pay",
};

/* ── A11 — expense report: many receipts, one reimbursement ─────────────── */

const RECEIPT_TEXTS = ["Tankbeleg", "Parkgebühr", "Hotel", "Bahnticket", "Bewirtung", "Taxi"];
const RECEIPTS = Array.from({ length: 36 }, (_, i) =>
  event(
    `ev-e-${pad(i + 1)}`,
    "document_received",
    dayOf("2026-07-01", Math.floor(i * 0.8)),
    `${RECEIPT_TEXTS[i % RECEIPT_TEXTS.length]} ${pad(i + 1)}`,
    Math.round((12 + ((i * 29) % 140) + 0.4 * i) * 100) / 100,
    "posted",
    { bookingState: "posted" },
  ),
);
const RECEIPT_TOTAL = Math.round(RECEIPTS.reduce((s, e) => s + (e.amount ?? 0), 0) * 100) / 100;

/** A11 (1 %) — an expense report: 36 receipts, one reimbursement, one receipt missing. */
export const expenseReport: CaseScenario = {
  accountingCase: caseFixture({
    caseNumber: "2026-0312",
    kind: "expense_report",
    title: "Reisekosten Außendienst Juli",
    openedAt: "2026-07-01",
    summary: "Monatliche Reisekostenabrechnung des Außendienstes, per Überweisung erstattet.",
    counterpartyName: null,
    counterpartyPartnerId: null,
    personalAccountNumber: "1590",
    disposition: "agent",
    totalAmount: RECEIPT_TOTAL,
    currency: "EUR",
  }),
  today: TODAY,
  timelineSub: "36 Belege, eine Erstattung",
  events: [
    ...RECEIPTS,
    event("ev-e-pay", "payment_out", "2026-08-02", "Erstattung Reisekosten Juli", -RECEIPT_TOTAL, "posted", { bookingState: "posted" }),
  ],
  expectations: [{ id: "ex-e", kind: "document", dueDate: "2026-08-20", escalationLevel: 0, counterpartyName: null, amount: 64.2, currency: "EUR" }],
  timelineLimit: 20,
  todo: {
    sub: "1 Beleg fehlt",
    points: [
      {
        key: "receipt",
        title: "Ein Tankbeleg über 64,20 € fehlt.",
        hint: "Erbeten bis 20.08.2026, in 15 Tagen · noch keine Mahnung.",
        state: "open",
        ways: ["Beleg anhängen", "Aufheben"],
      },
    ],
  },
  details: Object.fromEntries(
    RECEIPTS.map((e): [string, EventDetail] => [
      e.id,
      {
        title: e.title,
        sub: `${e.date.split("-").reverse().join(".")} · gebucht`,
        lines: [
          line("debit", "4660", "Reisekosten Arbeitnehmer", e.amount ?? 0, e.title),
          line("credit", "1590", "Durchlaufende Posten", e.amount ?? 0, e.title),
        ],
        origin: "agent",
        ai: { verdict: "confirm", confidence: "green", judgeReasoning: "Reisekosten gegen das Durchlaufkonto der Abrechnung." },
      },
    ]),
  ),
  notes: [],
  clarificationList: [],
};

/* ── A12 · A13 — contract and a case without any event ─────────────────── */

/** A12 / E8 — a contract: nothing is booked from it directly; it founds the monthly rates. */
export const contract: CaseScenario = {
  accountingCase: caseFixture({
    caseNumber: "2026-0029",
    kind: "contract",
    openedAt: "2026-03-01",
    summary: "Leasingvertrag für einen Transporter, 36 Monate, 489,00 € monatlich.",
    counterpartyName: "Beispiel-Leasing AG",
    counterpartyPartnerId: "bp-2929",
    personalAccountNumber: "71990",
    expectedInterval: "monthly",
    disposition: "agent",
    totalAmount: null,
  }),
  today: TODAY,
  timelineSub: "ein Vertrag, eine geplante Rate",
  events: [
    event("ev-c-doc", "document_received", "2026-03-01", "Leasingvertrag LV-2026-0815 eingegangen", null, "no_booking_required", {
      stateNote: "Keine Buchung nötig: ein Vertrag wird nicht gebucht, er begründet die monatlichen Raten.",
    }),
    event("ev-c-plan", "accrual", "2026-09-01", "Leasingrate 09/2026", 489, "planned"),
  ],
  todo: {
    sub: "nichts offen",
    points: [],
    emptyText: "Nichts zu tun: der Vertrag ist erfasst, die Raten folgen je Monat.",
    facts: {
      title: "Vertrag",
      rows: [
        ["Laufzeit", "03/2026 bis 02/2029, 36 Monate"],
        ["Rate", "489,00 € monatlich"],
        ["Nächste Rate", "01.09.2026"],
      ],
    },
  },
  details: {
    "ev-c-doc": {
      title: "Leasingvertrag LV-2026-0815",
      sub: "01.03.2026 · Vertrag",
      origin: "none",
      note: "Keine Buchung nötig: ein Vertrag wird nicht gebucht, er begründet die monatlichen Raten.",
    },
    "ev-c-plan": {
      title: "Leasingrate 09/2026",
      sub: "01.09.2026 · geplant",
      origin: "none",
      note: "Geplant: gebucht wird die Rate, wenn ihr Monat beginnt.",
    },
  },
  notes: [],
  clarificationList: [],
};

/** A13 (4 %, 41 cases) — a case without a single event is real, not a story state. */
export const noEvents: CaseScenario = {
  accountingCase: caseFixture({
    caseNumber: "2026-0415",
    kind: "recurring_charge",
    openedAt: "2026-07-01",
    summary: null,
    counterpartyName: "Beispiel-Versicherung AG",
    counterpartyPartnerId: "bp-4040",
    personalAccountNumber: null,
    createdByLabel: "System · Onboarding-Import",
    agentRunId: null,
    disposition: "agent",
    totalAmount: null,
  }),
  today: TODAY,
  timelineSub: "noch nichts",
  events: [],
  todo: {
    sub: "kein Ereignis",
    points: [
      {
        key: "empty",
        title: "Diesem Sachverhalt ist noch kein Ereignis zugeordnet.",
        hint: "Angelegt aus dem Onboarding-Import; ein Beleg oder eine Zahlung kommt, sobald der Agent sie findet.",
        state: "info",
        ways: ["Beleg zuordnen", "Zahlung zuordnen"],
      },
    ],
  },
  details: {},
  notes: [],
  clarificationList: [],
};
