import type { CaseFactsVM } from "@/ui/v3/entities/accounting-case/CaseFacts";
import type {
  CaseTimelineClarification,
  CaseTimelineEvent,
  CaseTimelineExpectation,
} from "@/ui/v3/entities/accounting-case/CaseTimeline";
import type { ClarificationVM } from "@/ui/v3/entities/clarification/Clarification";
import type { JournalLine } from "@/ui/v3/entities/journal-entry/JournalEntryCompact";
import type { Note } from "@/ui/v3/patterns/NoteFeed";

/**
 * Synthetische Sachverhalte für die Seiten-Stories (0152).
 *
 * **Keine echten Daten.** Namen sind erfunden und erkennbar so (Musterbau
 * GmbH, Beispiel-Energie AG, Testbank eG); Beträge sind glatt, Nummern frei
 * gewählt, das Jahr ist 2026. Der Referenzfall aus dem Brief F196 hat nur die
 * **Form** geliehen, keinen Inhalt.
 *
 * Ein Bauer je Baustein, und jede Story überschreibt nur, was sie beweist —
 * so ist ein Unterschied zwischen zwei Szenarien ein Unterschied im
 * Sachverhalt, nie darin, wie jemand die Fixture zusammengesetzt hat (die
 * Regel aus 0144).
 */

/** Der Referenztag aller Stories — Reife der Erwartungen, Zustand der Klärungen. */
export const HEUTE = "2026-08-05";

/** Der Fall selbst — eine Eingangsrechnung, an der ein Vorschlag hängt. */
export function fallFixture(over: Partial<CaseFactsVM> = {}): CaseFactsVM {
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
 * Der Beleg-Eingang mit seinem Vorschlag — das Ereignis, um das sich E1 dreht.
 *
 * `bookingState` ist die **zweite Marke am Ereignis**, kein eigener Eintrag:
 * ein Ereignis und seine Buchung sind ein Vorgang (0152, Frage 1).
 */
export const BELEG_EREIGNIS: CaseTimelineEvent = {
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
 * Die Spiegel-Buchung aus DATEV — dieselbe Reihe, sichtbar andere Quelle.
 *
 * Sie liegt **vor** dem Beleg: der Vormonat ist schon gebucht, und genau das
 * macht den Fall lesbar. Ohne sie stünde die Frage „hat das schon jemand
 * erfasst?" unbeantwortet auf der Seite.
 */
export const DATEV_EREIGNIS: CaseTimelineEvent = {
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

/** Die offene Zahlungserwartung — der einzige Eintrag in der Zukunft. */
export const ZAHLUNG_ERWARTET: CaseTimelineExpectation = {
  id: "ex-1",
  kind: "payment",
  dueDate: "2026-08-10",
  escalationLevel: 0,
  counterpartyName: "Musterbau Fahrzeugteile GmbH",
  amount: 25.41,
  currency: "EUR",
};

/** Eine beantwortete Rückfrage — sie steht im Strang, nicht in den Mängeln. */
export const KLAERUNG_BEANTWORTET: CaseTimelineClarification = {
  id: "cl-1",
  type: "question",
  title: "Gehören die Ersatzteile zum Firmenwagen oder zum Werkstattbestand?",
  raisedAt: "2026-08-01T09:12:00Z",
  answeredAt: "2026-08-02T14:30:00Z",
  severity: "optional",
  audience: "client",
};

/** Die Zeilen des Vorschlags: Aufwand gegen Kreditor, mit Automatikkonto. */
export const VORSCHLAG: JournalLine[] = [
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

/** Notizen am Fall — neueste oben, die Reihenfolge gehört dem Aufrufer. */
export const NOTES: Note[] = [
  {
    id: "n-1",
    at: "2026-08-02T14:30:00Z",
    author: "Mandant",
    text: "Die Ersatzteile gehören zum Firmenwagen, nicht zum Werkstattbestand.",
  },
  {
    id: "n-2",
    at: "2026-07-31T16:05:00Z",
    author: "Agent",
    text: "Beleg ohne Sachverhalt eingegangen, Fall eröffnet und Vorschlag gebucht.",
  },
];

/**
 * Die Rückfragen am Fall — eine offene, eine beantwortete.
 *
 * **Titel und Zustand, mehr nicht.** Die reiche Form mit Kontext, Frage und
 * Empfehlung gibt es im Bestand nur bei 9 % (Erhebung 2026-09-10); der
 * Regelfall ist genau das hier.
 */
export const CLARIFICATIONS: ClarificationVM[] = [
  {
    id: "cl-2",
    title: "Wurde die Rechnung schon bezahlt?",
    state: "open",
    severity: "required",
    type: "question",
    audience: "client",
    raisedAt: "2026-08-04T08:15:00Z",
    href: "?tab=rueckfragen&klaerung=cl-2",
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
  },
];

/**
 * Die Reiter der Seite, in der Reihenfolge aus dem Brief (F196 §3).
 *
 * **Zwei Namen sind gegenüber dem Brief geändert** (Owner 2026-09-10):
 * „Details" hieß nichts — jeder Reiter zeigt Details — und heißt jetzt
 * **Stammdaten**; „Verlauf" und „Ereignisse" klangen nach demselben, obwohl
 * das eine die Fachereignisse sind und das andere die Prüfspur (wer hat wann
 * was getan). Die Prüfspur heißt **Protokoll**.
 */
export const FALL_TABS = [
  { key: "uebersicht", label: "Übersicht" },
  { key: "stammdaten", label: "Stammdaten" },
  { key: "ereignisse", label: "Ereignisse" },
  { key: "rueckfragen", label: "Rückfragen" },
  { key: "plausibilitaet", label: "Plausibilität" },
  { key: "saldo", label: "Saldo & Konten" },
  { key: "datev", label: "DATEV-Wahrheit" },
  { key: "protokoll", label: "Protokoll" },
  { key: "rohdaten", label: "Rohdaten" },
];

export const tabHref = (key: string) => `?tab=${key}`;
export const listHref = "?liste=sachverhalte";
export const partnerHref = "?partner=bp-4711";
export const accountHref = (n: string) => `?account=${n}`;
export const eventHref = (id: string) => `?event=${id}`;
