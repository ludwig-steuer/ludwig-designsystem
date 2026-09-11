import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState, type ReactNode } from "react";

import { buildRulePreview } from "@/ludwig/modules/recurring-rules/domain/booking-preview";
import { accrualAmount, accrualSides } from "@/ludwig/modules/recurring-rules/domain/rule";
import type { RuleDraft } from "@/ludwig/modules/recurring-rules/domain/rule-draft";
import {
  describeRecurringRule,
  describeRuleSchedule,
} from "@/ludwig/modules/recurring-rules/domain/rule-summary";

import type { CaseFactsVM } from "@/ui/v3/entities/accounting-case/CaseFacts";
import { CaseTimeline } from "@/ui/v3/entities/accounting-case/CaseTimeline";
import { ClarificationList, toTodoItem, type ClarificationVM } from "@/ui/v3/entities/clarification/Clarification";
import { ClarificationCard } from "@/ui/v3/entities/clarification/ClarificationCard";
import { DocumentNumberRegister } from "@/ui/v3/entities/document-number/DocumentNumberRegister";
import { REGISTER, SOURCE_LABEL, STATE_LABEL } from "@/ui/v3/entities/document-number/fixtures";
import { JournalEntryCard } from "@/ui/v3/entities/journal-entry/JournalEntryCompact";
import { OpenItemRow } from "@/ui/v3/entities/open-item/OpenItemRow";
import type { OpenItem } from "@/ui/v3/entities/open-item/open-item";
import { OpenItemLinkRow, openItemLinkTracks } from "@/ui/v3/entities/open-item-link/OpenItemLinkRow";
import { rule } from "@/ui/v3/entities/recurring-rule/fixtures";
import { RecurringRuleEditor, type RecurringRuleAccounts } from "@/ui/v3/entities/recurring-rule/RecurringRuleEditor";
import { RecurringRuleFacts } from "@/ui/v3/entities/recurring-rule/RecurringRuleFacts";
import type { LogEntry } from "@/ui/v3/patterns/Log";
import { LogBrowser } from "@/ui/v3/patterns/LogBrowser";
import { CheckItems, type CheckItem } from "@/ui/v3/patterns/Review";
import { StatusBadge } from "@/ui/v3/patterns/StatusBadge";
import { StatusInfoButton } from "@/ui/v3/patterns/StatusInfoButton";
import { Button } from "@/ui/v3/primitives/Button";
import { EmptyState } from "@/ui/v3/primitives/EmptyState";
import { FieldList } from "@/ui/v3/primitives/FieldList";
import { RawRecord } from "@/ui/v3/primitives/RawRecord";
import { Card, CardHead, HeadRow, Row, Table } from "@/ui/v3/primitives/Table";

import { CasePage } from "./CasePage";
import {
  CLARIFICATION_ANSWERED,
  CLARIFICATIONS,
  DATEV_EVENT,
  DOCUMENT_EVENT,
  PAYMENT_EXPECTED,
  PROPOSAL,
  TODAY,
  accountHref,
} from "./fixtures";
import { recurringWithRule } from "./collective-scenarios";
import { bracket, proposalPending, recurringWithoutRule } from "./scenarios";
import { Columns } from "@/ui/v3/patterns/Columns";
import { MonoCell } from "@/ui/v3/primitives/Cells";
import { Disclosure } from "@/ui/v3/primitives/Disclosure";
import { SourceDocumentDrawer } from "@/ui/v3/entities/source-document/SourceDocumentDrawer";
import { SourceDocumentList } from "@/ui/v3/entities/source-document/SourceDocumentList";
import type { SourceDocumentVM } from "@/ui/v3/entities/source-document/SourceDocument";
import { documentFixture, MUSTER_PDF } from "../document/fixtures";
import { useHash } from "../hash";
import { TodoList, type TodoItem } from "@/ui/v3/patterns/TodoList";

/**
 * Die Reiter der Sachverhaltsseite — P3 aus 0152.
 *
 * Je Reiter eine Story: oben der Inhalt am Referenzfall, darunter derselbe
 * Reiter **ohne Daten** mit seinem Leerzustand. Ein Leerzustand ist ein Satz
 * mit Grund, kein Strich. Der Reiter „Stammdaten" steht unter Einzelfall.
 */
const meta: Meta<typeof CasePage> = {
  title: "Seiten/Sachverhalt/Reiter",
  component: CasePage,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof CasePage>;

const accountingCase = proposalPending.accountingCase;

/** The tab body: content first, then the same tab without data. */
function Tab({
  tab,
  children,
  empty,
  of = accountingCase,
}: {
  tab: string;
  children: ReactNode;
  empty: ReactNode;
  /** Another case than the reference — a tab that belongs to one kind only. */
  of?: CaseFactsVM;
}) {
  return (
    <CasePage accountingCase={of} tab={tab}>
      <div className="v2stack">
        {children}
        <div className="lw-overline">Leerzustand</div>
        {empty}
      </div>
    </CasePage>
  );
}

/**
 * **Ereignisse** — der ganze Strang, Ludwig und DATEV in einer Reihe; rechts
 * der gewählte Eintrag mit seiner Buchung, so wie in der Übersicht
 * (`list-detail`). Leer: „Noch nichts geschehen." — der Satz des Strangs
 * selbst.
 */
export const Events: Story = {
  render: () => (
    <Tab
      tab="ereignisse"
      empty={
        <Card>
          <CardHead title="Ereignisse" sub="keine" />
          <div className="v3boxbody">
            <CaseTimeline events={[]} today={TODAY} />
          </div>
        </Card>
      }
    >
      <Columns
        pattern="list-detail"
        list={
          <Card>
            <CardHead title="Ereignisse" sub="drei Einträge, eine Erwartung" />
            <div className="v3boxbody">
              <CaseTimeline
                events={[DATEV_EVENT, DOCUMENT_EVENT]}
                clarifications={[CLARIFICATION_ANSWERED]}
                expectations={[PAYMENT_EXPECTED]}
                today={TODAY}
                selectedId={DOCUMENT_EVENT.id}
              />
            </div>
          </Card>
        }
        main={
          <Card>
            <CardHead title="Rechnung 93846778" sub="31.07.2026 · Vorschlag" />
            <div className="v3boxbody">
              <JournalEntryCard lines={PROPOSAL} currency="EUR" accountHref={accountHref} />
            </div>
          </Card>
        }
      />
    </Tab>
  ),
};

const withDetail = (c: ClarificationVM) =>
  c.state === "open"
    ? { ...c, text: "Auf dem Konto ist für Juli kein Abgang an den Lieferanten zu finden.", answerKind: "yes_no" as const, answerOptions: ["Ja", "Nein"] }
    : { ...c, text: "Der Mandant hat geantwortet: die Ersatzteile gehören zum Firmenwagen.", answerKind: "single_choice" as const, answerOptions: ["Firmenwagen", "Werkstattbestand"] };

/**
 * The questions as items to work through (`toTodoItem`, `TodoList`) — the list
 * row itself is not a link, and the tab is where they get answered. J/K stay
 * with the record pager of the page.
 */
function ClarificationsTab() {
  const items = CLARIFICATIONS.map(toTodoItem).filter((i): i is TodoItem => i !== null);
  const [selectedId, setSelectedId] = useState<string | null>(items[0]?.id ?? null);
  const selected = CLARIFICATIONS.find((c) => c.id === selectedId) ?? null;
  return (
    <Tab
      tab="rueckfragen"
      empty={
        <Card>
          <CardHead title="Rückfragen" sub="keine" />
          <div className="v3boxbody">
            <ClarificationList
              clarifications={[]}
              empty={{ title: "Keine Rückfragen.", hint: "Der Agent fragt nach, wenn ihm etwas fehlt — bis dahin bleibt dieser Reiter leer." }}
            />
          </div>
        </Card>
      }
    >
      <Columns
        pattern="list-detail"
        list={
          <Card>
            <CardHead title="Rückfragen" sub="1 offen · 1 beantwortet" />
            <div className="v3boxbody">
              <TodoList groups={[{ label: "Rückfragen", items }]} selectedId={selectedId} onSelect={setSelectedId} hotkeys={false} />
            </div>
          </Card>
        }
        main={
          selected ? (
            <ClarificationCard
              clarification={withDetail(selected)}
              mode={selected.state === "open" ? "answer" : "read"}
              onAnswer={async () => {}}
            />
          ) : (
            <EmptyState inline title="Keine Rückfrage gewählt." />
          )
        }
      />
    </Tab>
  );
}

/**
 * The documents the reference case rests on, linked through its events — one
 * invoice, which is the p90 of the stock (profile `accounting-case`).
 */
const CASE_DOCUMENTS: SourceDocumentVM[] = [
  documentFixture({
    id: "d-93846778",
    fileName: "Rechnung-93846778.pdf",
    counterparty: "Musterbau Fahrzeugteile GmbH",
    documentDate: "2026-07-16",
    receivedDate: "2026-07-31",
    completedAt: null,
    completedVia: null,
    caseNumber: "2026-0334",
    detail: { kind: "invoice", number: "93846778", gross: 25.41, currency: "EUR", net: 21.35, vat: 4.06, dueDate: "2026-08-10" },
  }),
];

function DocumentsTab() {
  const hash = useHash("", true);
  const open = CASE_DOCUMENTS.find((d) => d.id === hash.params.get("document")) ?? null;
  return (
    <Tab
      tab="documents"
      empty={
        <>
          <Card>
            <CardHead title="Belege" sub="keiner verbunden" />
            <div className="v3boxbody">
              <SourceDocumentList documents={[]} />
            </div>
          </Card>
          <Card>
            <CardHead title="Belege" sub="keiner zu erwarten" />
            <div className="v3boxbody">
              <SourceDocumentList
                documents={[]}
                emptyKind="not-expected"
                reason="Interne Umbuchung zwischen zwei Sachkonten — es gibt keinen Beleg dazu."
              />
            </div>
          </Card>
        </>
      }
    >
      <Card>
        <CardHead title="Belege" sub="1 Beleg · über das Ereignis vom 31.07." />
        <SourceDocumentList documents={CASE_DOCUMENTS} href={(d) => hash.href({ document: d.id })} />
      </Card>
      <SourceDocumentDrawer
        open={open !== null}
        onClose={() => hash.go({ document: null })}
        reference={open?.fileName ?? ""}
        record={
          open
            ? { document: open, previewUrl: MUSTER_PDF, summary: "Ersatzteile für den Firmenwagen, geliefert am 16.07." }
            : null
        }
        onOpenFull={() => {}}
      />
    </Tab>
  );
}

/**
 * **Belege** — jeder Beleg, auf den sich der Fall stützt (Owner 2026-09-11),
 * als Liste wie die Belegliste im Hauptmenü; ein Klick öffnet den Beleg-Drawer
 * über der Seite (D13). Leer: zwei Sätze, denn „keiner verbunden" ist eine
 * Lücke und „keiner zu erwarten" ein Erfolg mit Grund.
 */
export const Documents: Story = { render: () => <DocumentsTab /> };

/**
 * **Rückfragen** — Liste und Detail, wie die Rückfragen-Liste der Kanzlei
 * (Owner 2026-09-11: Reiter je Art wie die Hauptseiten). Links jede Rückfrage
 * mit ihrem Zustand, rechts die gewählte — die offene zum Beantworten, die
 * beantwortete zum Lesen. Leer: warum es keine gibt.
 */
export const Clarifications: Story = { render: () => <ClarificationsTab /> };

const CHECKS: CheckItem[] = [
  { code: "P1", question: "Stimmt der Betrag mit dem Beleg überein?", reason: "25,41 € auf Beleg und Buchung.", state: "green" },
  { code: "P2", question: "Ist die Rechnung schon in DATEV gebucht?", reason: "Im Spiegel steht nur die Gutschrift vom Juni.", state: "green" },
  { code: "P3", question: "Trägt der Fall mehr als eine Belegnummer?", reason: "Zwei Kandidaten im Register — keine ist entschieden.", state: "yellow" },
  { code: "P4", question: "Passt die Umsatzsteuer zum Konto?", reason: "Automatikkonto 5404 mit 19 %, kein Schlüssel nötig.", state: "green" },
  { code: "P5", question: "Liegt eine Dublette vor?", reason: "Noch nicht geprüft — läuft mit dem nächsten Abgleich.", state: "open" },
];

/**
 * **Plausibilität** — die Prüfpunkte P1–P5, das Belegnummern-Register und,
 * seit dem Schnitt nach Zielgruppe (Owner 2026-09-11), **Saldo & Konten**:
 * Personenkonto, offene Posten, Ausgleich. Alles eine Frage — geht es auf?
 * Bestandene Punkte stehen zusammen in einer Zeile, Befunde einzeln.
 */
export const Plausibility: Story = {
  render: () => (
    <Tab
      tab="plausibilitaet"
      empty={
        <>
          <Card>
            <CardHead title="Plausibilität" sub="nicht geprüft" />
            <div className="v3boxbody">
              <EmptyState
                inline
                title="Noch nicht geprüft."
                description="Die Prüfpunkte laufen, sobald ein Beleg oder eine Buchung am Fall hängt."
              />
            </div>
          </Card>
        <Card>
          <CardHead title="Saldo & Konten" sub="kein Personenkonto" />
          <div className="v3boxbody">
            <EmptyState
              inline
              title="Kein Personenkonto am Fall."
              description="Der Sachverhalt bucht bewusst ohne Personenkonto — ein Saldo entsteht erst mit einem Konto."
            />
          </div>
        </Card>
        </>
      }
    >
      <Columns
        pattern="main-aside"
        width="table"
        main={
          <div className="v2stack">
      <Card>
        <CardHead title="Prüfpunkte" sub="1 Befund · 1 offen · 3 bestanden" />
        <div className="v3boxbody">
          <CheckItems items={CHECKS} />
        </div>
      </Card>
      <Card>
        <CardHead title="Belegnummern-Register" sub="bekannte Nummern dieses Falls" />
        <div className="v3boxbody">
          <DocumentNumberRegister entries={REGISTER} onPick={() => {}} sourceLabel={SOURCE_LABEL} stateLabel={STATE_LABEL} />
        </div>
      </Card>
      <OpenItemsCard title="Offene Posten" sub={`Stichtag ${TODAY.split("-").reverse().join(".")}`} items={[openItem()]} />
      <Card>
        <CardHead title="Ausgleich" sub="1 Klammer" />
        <Table cols={openItemLinkTracks} minWidth={980}>
          <HeadRow>
            <span>Klammer</span>
            <span>Belegfeld</span>
            <span className="v2num">Rechnung</span>
            <span className="v2num">Zahlung</span>
            <span className="v2num">zugeordnet</span>
            <span>Herkunft</span>
            <span>Zustand</span>
          </HeadRow>
          <OpenItemLinkRow link={PAID.link} invoice={PAID.invoice} payment={PAID.payment} />
        </Table>
      </Card>
          </div>
        }
        aside={
      <Card>
        <CardHead title="Personenkonto 71202" sub="Musterbau Fahrzeugteile GmbH" />
        <div className="v3boxbody">
          <FieldList
            tone="bare"
            split
            rows={[
              ["Soll", "21,82 €"],
              ["Haben", "47,23 €"],
              ["Saldo", "25,41 € Haben"],
              ["Stand", "05.08.2026"],
            ]}
          />
        </div>
      </Card>
        }
      />
    </Tab>
  ),
};

const OPEN_ITEM_COLS = "90px 100px 130px 100px 100px minmax(0, 1fr) 120px 190px 130px 130px";

const openItem = (over: Partial<OpenItem> = {}): OpenItem => ({
  kind: "creditor",
  personalAccount: "71202",
  externalDocumentNumber: "93846778",
  invoiceDate: "2026-07-16",
  dueDate: "2026-08-10",
  grossAmount: 25.41,
  openAtCutoff: 25.41,
  amountApprox: false,
  clearedAfterCutoff: false,
  description: "Ersatzteile Firmenwagen",
  dunningLevel: null,
  ...over,
});

function OpenItemsCard({ title, sub, items }: { title: string; sub: string; items: OpenItem[] }) {
  return (
    <Card>
      <CardHead title={title} sub={sub} />
      <Table cols={OPEN_ITEM_COLS} minWidth={1300}>
        <HeadRow>
          <span>Art</span>
          <span>Konto</span>
          <span>Belegnummer</span>
          <span>Datum</span>
          <span>Fällig</span>
          <span>Buchungstext</span>
          <span>Mahnstufe</span>
          <span>
            Ausgleich <StatusInfoButton axis="opos_ausgleich" />
          </span>
          <span className="v2num">Brutto</span>
          <span className="v2num">Offen</span>
        </HeadRow>
        {items.map((item) => (
          <OpenItemRow key={`${item.personalAccount}-${item.externalDocumentNumber}`} item={item} asOf={TODAY} />
        ))}
      </Table>
    </Card>
  );
}

const PAID = bracket(1, "93846778 · Musterbau Fahrzeugteile GmbH", "noch keine Zahlung", 25.41, "71202", {
  invoice: "2026-07-31",
  payment: "2026-08-10",
});

const LOG: LogEntry[] = [
  { id: "l1", at: "2026-07-31T16:02:00Z", message: "Sachverhalt aus dem Beleg eröffnet", actor: { kind: "agent", label: "Agent" }, depth: 1, level: "info" },
  { id: "l2", at: "2026-07-31T16:03:00Z", message: "Beleg 93846778 angehängt", actor: { kind: "agent", label: "Agent" }, depth: 1, level: "info" },
  { id: "l3", at: "2026-07-31T16:05:00Z", message: "Buchung vorgeschlagen: 5404 an 71202", actor: { kind: "agent", label: "Agent" }, depth: 2, level: "info", code: "booking.proposed" },
  { id: "l4", at: "2026-07-31T16:05:30Z", message: "Judge: bestätigt, keine Dublette", actor: { kind: "agent", label: "Judge" }, depth: 2, level: "info", code: "booking.judged_by_agent" },
  { id: "l5", at: "2026-08-01T09:12:00Z", message: "Rückfrage an den Mandanten gestellt", actor: { kind: "agent", label: "Agent" }, depth: 1, level: "info" },
  { id: "l6", at: "2026-08-02T14:30:00Z", message: "Rückfrage beantwortet", actor: { kind: "user", label: "Mandant" }, depth: 1, level: "info" },
  { id: "l7", at: "2026-07-31T16:04:10Z", message: "Schritt classify → propose", actor: { kind: "system", label: "System" }, depth: 3, level: "debug", code: "step.edge" },
];

/* ── Wiederkehr: the rent rule behind `RecurringWithRule` ─────────────────── */

const RENT = rule({
  id: "r-8801",
  caseId: "c-0044",
  expectedDirection: "payment_in",
  matchCounterpartyName: recurringWithRule.accountingCase.counterpartyName ?? null,
  matchAmount: 1190,
  personalAccountNumber: "10870",
  importReference: "datev-wk:20260044",
  datevDocumentNumber: "20260044",
  template: {
    counterAccountNumber: "8400",
    taxKey: null,
    taxRatePercent: null,
    description: "Miete Halle Musterstraße 12",
    lines: null,
    amount: 1190,
  },
});
const RENT_AMOUNT = accrualAmount(RENT) ?? 0;
const RENT_SIDES = accrualSides("payment_in");
/** The rule carries numbers only; the caller knows the names (L-255). */
const RENT_BUILT = buildRulePreview({
  bookingMode: RENT.bookingMode,
  direction: RENT.expectedDirection,
  counterAccount: { accountNumber: "8400", accountName: "Erlöse 19 % USt" },
  personalAccount: { accountNumber: "10870", accountName: "Beispiel-Mieter GmbH" },
  bankAccount: null,
  lines: null,
  taxKey: null,
  amount: RENT_AMOUNT,
});
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const pad = (n: number) => String(n).padStart(2, "0");

/** The last direct debit of `RecurringWithoutRule`, as the draft the offer opens with. */
const ENERGY_DRAFT: RuleDraft = {
  expectedDirection: "payment_out",
  matchCounterpartyName: recurringWithoutRule.accountingCase.counterpartyName ?? null,
  matchCounterpartyIban: null,
  matchAmount: 142,
  matchAmountTolerance: 0,
  matchAmountTolerancePercent: null,
  matchPurposeRegex: null,
  matchContractNumber: null,
  matchDocumentTextRegex: null,
  expectedInterval: "monthly",
  expectedDayOfMonth: 4,
  bookingMode: "book_on_payment",
  personalAccountNumber: null,
  paymentAccountId: null,
  matchingNote: null,
  isActive: true,
  template: {
    counterAccountNumber: "4240",
    taxKey: null,
    taxRatePercent: null,
    description: "Abschlag Strom",
    lines: null,
    amount: 142,
  },
};
const ENERGY_ACCOUNTS: RecurringRuleAccounts = {
  candidates: {
    partner: [{ number: "4240", name: "Gas, Strom, Wasser", reason: "Zuletzt bei dieser Gegenpartei" }],
    all: [
      { number: "4240", name: "Gas, Strom, Wasser" },
      { number: "1200", name: "Bank" },
    ],
  },
};

/** The empty state of the tab is an offer: prefilled from the last payment, created in the editor (0135). */
function RuleOffer() {
  const [editing, setEditing] = useState(false);
  if (editing)
    return (
      <RecurringRuleEditor
        defaultValue={ENERGY_DRAFT}
        accounts={ENERGY_ACCOUNTS}
        summary={describeRecurringRule({
          bookingMode: ENERGY_DRAFT.bookingMode,
          direction: ENERGY_DRAFT.expectedDirection,
          matchCounterpartyName: ENERGY_DRAFT.matchCounterpartyName,
          matchCounterpartyIban: ENERGY_DRAFT.matchCounterpartyIban,
          matchAmount: ENERGY_DRAFT.matchAmount,
          matchAmountTolerance: ENERGY_DRAFT.matchAmountTolerance,
        })}
        onSubmit={async () => setEditing(false)}
        onCancel={() => setEditing(false)}
      />
    );
  return (
    <EmptyState
      inline
      title="Noch keine Regel."
      description="Bis dahin schlägt der Agent jede Lastschrift einzeln vor. Aus der letzten angelegt, bucht das Regelwerk monatlich auf 4240 — die Felder sind vorbefüllt."
      action={
        <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
          Regel aus der Lastschrift vom 04.08. anlegen
        </Button>
      }
    />
  );
}

/**
 * **Wiederkehr** — nur beim Dauersachverhalt; Regelwerk und Zuordnung sind
 * **ein** Reiter (F196 O2). Oben die Regel als Satz mit Vorschau, darunter,
 * was das Regelwerk gebucht hat und welche Zahlung jeweils dazugehört.
 *
 * Leer heißt hier: ein Dauerfall **ohne** Regel, drei von vier im Bestand.
 * Der Leerzustand ist ein Angebot, vorbefüllt aus der letzten Lastschrift —
 * kein Vorwurf. Ein Klick öffnet den Editor.
 */
export const Recurrence: Story = {
  render: () => (
    <Tab
      tab="regelwerk"
      of={recurringWithRule.accountingCase}
      empty={
        <Card>
          <CardHead title="Wiederkehr" sub={`${recurringWithoutRule.accountingCase.counterpartyName ?? ""} · ohne Regel`} />
          <div className="v3boxbody">
            <RuleOffer />
          </div>
        </Card>
      }
    >
      <Columns
        pattern="split"
        main={
      <Card>
        <CardHead title="Regel" sub="aus dem Onboarding-Import" />
        <div className="v3boxbody">
          <RecurringRuleFacts
            rule={RENT}
            summary={describeRecurringRule({
              bookingMode: RENT.bookingMode,
              direction: RENT.expectedDirection,
              matchCounterpartyName: RENT.matchCounterpartyName,
              matchCounterpartyIban: RENT.matchCounterpartyIban,
              matchAmount: RENT.matchAmount,
              matchAmountTolerance: RENT.matchAmountTolerance,
            })}
            schedule={describeRuleSchedule(RENT)}
            preview={{
              lines: [
                { side: RENT_SIDES.personalSide, accountNumber: "10870", accountName: "Beispiel-Mieter GmbH", amount: RENT_AMOUNT },
                { side: RENT_SIDES.counterSide, accountNumber: "8400", accountName: "Erlöse 19 % USt", amount: RENT_AMOUNT },
              ],
              automatic: RENT_BUILT.automatic,
              note: RENT_BUILT.note,
            }}
            accountHref={accountHref}
          />
        </div>
      </Card>
        }
        aside={
      <Card>
        <CardHead title="Gebucht vom Regelwerk" sub="zwölf Abgrenzungen, elf Zahlungen zugeordnet" />
        <Table cols="110px 160px minmax(0, 1fr)" minWidth={520}>
          <HeadRow>
            <span>Periode</span>
            <span>Abgrenzung</span>
            <span>Zahlung</span>
          </HeadRow>
          {MONTHS.map((m) => (
            <Row key={m}>
              <span>{pad(m)}/2026</span>
              <StatusBadge axis="buchung" status={m === 12 ? "proposed" : "posted"} info={false} />
              <span>{m === 12 ? "noch keine eingegangen" : `Zahlungseingang vom 03.${pad(m)}.2026`}</span>
            </Row>
          ))}
        </Table>
      </Card>
        }
      />
    </Tab>
  ),
};

/** What the master data leaves to this tab — only rows with a value, as `CaseFacts` does. */
function originRows(c: CaseFactsVM): [ReactNode, ReactNode][] {
  const rows: [ReactNode, ReactNode][] = [];
  if (c.batchOposReference) rows.push(["Anker", <MonoCell key="a" value={c.batchOposReference} />]);
  if (c.createdByLabel) rows.push(["Angelegt von", c.createdByLabel]);
  if (c.agentRunId) rows.push(["Buchungslauf", <MonoCell key="r" value={c.agentRunId} />]);
  if (c.exportBatchId) rows.push(["Buchungszyklus", <MonoCell key="b" value={c.exportBatchId} />]);
  return rows;
}

/**
 * **Technik** — was Prüfung und Support lesen, nicht die Sachbearbeitung
 * (Owner 2026-09-11: Reiter nach Zielgruppe). Untereinander: was DATEV zu
 * diesem Fall kennt, das Protokoll in drei Tiefen, die Herkunft des
 * Datensatzes und — eingeklappt — die Rohdaten. Leer: je Block sein Satz.
 */
export const Technical: Story = {
  render: () => (
    <Tab
      tab="technical"
      empty={
        <>
          <Card>
            <CardHead title="DATEV-Wahrheit" sub="nichts gefunden" />
            <div className="v3boxbody">
              <EmptyState
                inline
                title="DATEV kennt zu diesem Fall noch nichts."
                description="Nach dem nächsten Export und Abgleich stehen hier die gespiegelten Buchungen."
              />
            </div>
          </Card>
          <Card>
            <CardHead title="Protokoll" sub="keine Einträge" />
            <div className="v3boxbody">
              <LogBrowser entries={[]} emptyText="Noch kein Eintrag im Protokoll — der Fall ist gerade erst angelegt." />
            </div>
          </Card>
        </>
      }
    >
      <Columns
        pattern="main-aside"
        width="table"
        main={
          <div className="v2stack">
      <Card>
        <CardHead title="DATEV-Wahrheit · Gutschrift" sub="30.06.2026 · Stapel 06-2026" />
        <div className="v3boxbody">
          <JournalEntryCard
            lines={[
              { side: "debit", accountNumber: "71202", accountName: "Musterbau Fahrzeugteile GmbH", amount: 21.82, text: "Gutschrift" },
              { side: "credit", accountNumber: "5404", accountName: "Wareneingang 19 % VSt", amount: 21.82, text: "Gutschrift" },
            ]}
            currency="EUR"
            accountHref={accountHref}
          />
          <p className="v2muted" style={{ margin: 0 }}>
            Diese Buchung steht in DATEV. Ludwig zeigt sie, ändert sie nicht.
          </p>
        </div>
      </Card>
      <OpenItemsCard
        title="Offene Posten laut DATEV"
        sub="Stand des Spiegels 01.08.2026"
        items={[openItem({ externalDocumentNumber: "GS-2026-0630", invoiceDate: "2026-06-30", dueDate: null, grossAmount: 21.82, openAtCutoff: 0, clearedAfterCutoff: true, description: "Gutschrift Juni" })]}
      />
      <Card>
        <CardHead title="Protokoll" sub="7 Einträge in drei Tiefen" />
        <div className="v3boxbody">
          <LogBrowser entries={LOG} initialView={2} />
        </div>
      </Card>
          </div>
        }
        aside={
          <div className="v2stack">
      <Card>
        <CardHead title="Herkunft des Datensatzes" sub="wer ihn angelegt hat, in welchem Lauf" />
        <div className="v3boxbody">
          <FieldList tone="bare" rows={originRows(accountingCase)} />
        </div>
      </Card>
      <Card>
        <CardHead title="Rohdaten" sub="client_accounting_case · 1 Datensatz" />
        <div className="v3boxbody">
          <Disclosure summary="Datensatz anzeigen">
            <RawRecord
              record={{
                id: "c-0334",
                case_number: "2026-0334",
                kind: "incoming_invoice",
                lifecycle_status: "open",
                disposition: "agent",
                counterparty_partner_id: "bp-4711",
                personal_account_number: "71202",
                document_number_mode: "single",
                opened_at: "2026-07-31",
                closed_at: null,
                agent_run_id: "run-4b19c2",
                export_batch_id: null,
              }}
            />
          </Disclosure>
        </div>
      </Card>
          </div>
        }
      />
    </Tab>
  ),
};
