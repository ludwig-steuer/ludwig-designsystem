import type { CaseFactsVM } from "@/ui/v3/entities/accounting-case/CaseFacts";
import type {
  CaseTimelineClarification,
  CaseTimelineEvent,
  CaseTimelineExpectation,
} from "@/ui/v3/entities/accounting-case/CaseTimeline";
import type { JournalLine } from "@/ui/v3/entities/journal-entry/JournalEntryCompact";
import type { ScenarioClarification } from "./scenario";

/**
 * Synthetic cases for the page stories (0152).
 *
 * **No real data**: names are made up and recognisably so, amounts round,
 * numbers arbitrary, the year is 2026. One builder per building block, and each
 * story overrides only what it proves — so two scenarios differ in the case,
 * never in how someone assembled the fixture (0144).
 */

/** The reference day of all stories — decides expectation maturity and clarification state. */
export const TODAY = "2026-08-05";

/** The case itself — an incoming invoice with a proposal. */
export function caseFixture(over: Partial<CaseFactsVM> = {}): CaseFactsVM {
  return {
    caseNumber: "2026-0334",
    kind: "incoming_invoice",
    lifecycleStatus: "open",
    openedAt: "2026-07-31",
    summary:
      "Rechnung über Ersatzteile für den Firmenwagen, geliefert am 16.07. " +
      "Der Lieferant bucht seit Januar auf dasselbe Konto.",
    counterpartyPartnerId: "bp-4711",
    counterpartyName: "Musterbau Fahrzeugteile GmbH",
    personalAccountNumber: "71202",
    documentNumberMode: "single",
    closedAt: null,
    counterpartySide: "creditor",
    batchOposReference: null,
    createdByLabel: "Agent · Vorbereitungslauf",
    fiscalYear: 2026,
    expectedInterval: null,
    clearingAccountNumber: null,
    agentRunId: "run-4b19c2",
    exportBatchId: null,
    ...over,
  };
}

/**
 * The document receipt with its proposal — the event E1 revolves around.
 * `bookingState` is the **second mark on the event**, not an entry of its own:
 * an event and its booking are one transaction (0152, question 1).
 */
export const DOCUMENT_EVENT: CaseTimelineEvent = {
  id: "ev-1",
  kind: "document_received",
  date: "2026-07-31",
  title: "Rechnung 93846778 eingegangen",
  amount: 25.41,
  currency: "EUR",
  state: "proposed",
  bookingState: "proposed",
};

/**
 * The mirrored entry from DATEV — same strand, visibly different source. It
 * lies **before** the document: last month is already booked, which answers
 * "has anyone recorded this yet?".
 */
export const DATEV_EVENT: CaseTimelineEvent = {
  id: "ev-0",
  kind: "open_item_carryover",
  date: "2026-06-30",
  title: "Gutschrift desselben Kreditors",
  amount: 21.82,
  currency: "EUR",
  state: "posted",
  source: "datev",
  bookingState: "posted",
};

/** The open payment expectation — the only entry in the future. */
export const PAYMENT_EXPECTED: CaseTimelineExpectation = {
  id: "ex-1",
  kind: "payment",
  dueDate: "2026-08-10",
  escalationLevel: 0,
  counterpartyName: "Musterbau Fahrzeugteile GmbH",
  amount: 25.41,
  currency: "EUR",
};

/** An answered clarification — it stands in the strand, not among the defects. */
export const CLARIFICATION_ANSWERED: CaseTimelineClarification = {
  id: "cl-1",
  type: "question",
  title: "Gehören die Ersatzteile zum Firmenwagen oder zum Werkstattbestand?",
  raisedAt: "2026-08-01T09:12:00Z",
  answeredAt: "2026-08-02T14:30:00Z",
  severity: "optional",
  audience: "client",
};

/** The proposal's lines: expense against creditor, with an automatic account. */
export const PROPOSAL: JournalLine[] = [
  {
    side: "debit",
    accountNumber: "5404",
    accountName: "Wareneingang 19 % VSt",
    amount: 25.41,
    automaticRate: 19,
    text: "Ersatzteile Firmenwagen",
  },
  {
    side: "credit",
    accountNumber: "71202",
    accountName: "Musterbau Fahrzeugteile GmbH",
    amount: 25.41,
    text: "Rechnung 93846778",
  },
];

/**
 * A note as the table stores it: `type = 'comment'`, the whole content in the
 * text — none of the 30 in stock carries context or facts (survey
 * 2026-09-18). Audience and severity are required columns and mean nothing
 * here, as in the table.
 */
export const note = (
  id: string,
  raisedAt: string,
  sourceModule: "agent" | "web",
  title: string,
  text: string,
): ScenarioClarification => ({
  id,
  type: "comment",
  title,
  text,
  raisedAt,
  sourceModule,
  state: "open",
  severity: "optional",
  audience: "accounting",
});

/** Notes on the case — one by the firm, one by the agent. */
export const NOTES: ScenarioClarification[] = [
  note(
    "n-1",
    "2026-08-02T14:30:00Z",
    "web",
    "Telefonat mit dem Mandanten",
    "Die Ersatzteile gehören zum Firmenwagen, nicht zum Werkstattbestand.",
  ),
  note(
    "n-2",
    "2026-07-31T16:05:00Z",
    "agent",
    "Fall eröffnet und Vorschlag gebucht",
    "Beleg ohne Sachverhalt eingegangen; der Agent hat den Fall eröffnet und den Vorschlag gebucht.",
  ),
];

/**
 * The clarifications of the case — one open, one answered. Title, state and a
 * text only: the rich form (context, question, recommendation) exists in just
 * 9 % of the stock (survey 2026-09-10).
 */
export const CLARIFICATIONS: ScenarioClarification[] = [
  {
    id: "cl-2",
    title: "Wurde die Rechnung schon bezahlt?",
    state: "open",
    severity: "required",
    type: "question",
    audience: "client",
    raisedAt: "2026-08-04T08:15:00Z",
    href: "?tab=rueckfragen&klaerung=cl-2",
    text: "Auf dem Konto ist für Juli kein Abgang an den Lieferanten zu finden.",
    answerKind: "yes_no",
    answerOptions: ["Ja", "Nein"],
  },
  {
    id: "cl-1",
    title: "Gehören die Ersatzteile zum Firmenwagen oder zum Werkstattbestand?",
    state: "answered",
    severity: "optional",
    type: "question",
    audience: "client",
    raisedAt: "2026-08-01T09:12:00Z",
    answeredAt: "2026-08-02T14:30:00Z",
    href: "?tab=rueckfragen&klaerung=cl-1",
    text: "Der Mandant hat geantwortet: die Ersatzteile gehören zum Firmenwagen.",
    answerKind: "single_choice",
    answerOptions: ["Firmenwagen", "Werkstattbestand"],
  },
];

/**
 * The page's tabs in the brief's order (F196 §3), with two renames by the
 * owner (2026-09-10): "Details" → **Stammdaten**, and the audit trail
 * "Verlauf" → **Protokoll**, so it no longer sounds like "Ereignisse".
 */
/**
 * Split by audience (owner 2026-09-11): the clerk's tabs first, then one tab for
 * audit and support — DATEV truth, log and raw data.
 */
export const FALL_TABS = [
  { key: "overview", label: "Übersicht" },
  { key: "events", label: "Ereignisse" },
  // Every document the case rests on (owner 2026-09-11). Keys are the app's
  // where it has the tab (F210: `CASE_TABS`), English where only the set has it.
  { key: "documents", label: "Belege" },
  { key: "clarifications", label: "Rückfragen" },
  // Balances and accounts answer the same question as the checks: does it add up?
  { key: "plausibility", label: "Plausibilität" },
  // Rule and assignment in one tab (F196 O2); only a recurring case has it.
  { key: "rules", label: "Wiederkehr" },
  { key: "master_data", label: "Stammdaten" },
  { key: "technical", label: "Technik" },
];

export const tabHref = (key: string) => `?tab=${key}`;
// The list comes back with its own filter parameters, as the app passes them
// (`listContextToParams`) — the case list's default is active, for accounting.
export const listHref = "?state=active&disposition=accounting";
export const partnerHref = "?partner=bp-4711";
export const accountHref = (n: string) => `?account=${n}`;
export const eventHref = (id: string) => `?event=${id}`;
