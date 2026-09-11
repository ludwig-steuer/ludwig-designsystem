import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StatusBadge } from "../../patterns/StatusBadge";
import { EntityHeader } from "../../patterns/EntityHeader";
import { CaseFacts, type CaseFactsVM } from "./CaseFacts";

const meta: Meta<typeof CaseFacts> = {
  title: "v3/Entitäten/Sachverhalt/CaseFacts",
  component: CaseFacts,
};
export default meta;
type Story = StoryObj<typeof CaseFacts>;

const accountHref = (nr: string) => `#konto-${nr}`;

const FULL: CaseFactsVM = {
  caseNumber: "2026-0412",
  kind: "incoming_invoice",
  lifecycleStatus: "open",
  openedAt: "2026-08-26",
  summary:
    "Rechnung über die Wartung der Klimaanlage, Leistung im August erbracht. " +
    "Der Betrag ist auf zwei Kostenstellen zu verteilen.",
  counterpartyPartnerId: "p-8812",
  counterpartyName: "Bürobedarf Meier GmbH",
  personalAccountNumber: "70021",
  documentNumberMode: "single",
  closedAt: null,
  counterpartySide: "creditor",
  batchOposReference: "OPOS-2026-08-114",
  createdByLabel: "Agent · Vorbereitungslauf",
  fiscalYear: 2026,
  expectedInterval: null,
  clearingAccountNumber: null,
  agentRunId: "run-8f21c4",
  exportBatchId: null,
};

/** Die Ränge 11–16 mit Werten; Partner und Konto sind Links. */
export const Filled: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <CaseFacts case={FULL} partnerHref="#partner-8812" accountHref={accountHref} />
    </div>
  ),
};

/**
 * Ein frisch gegründeter Fall — mit `all`, damit **alle drei** bedeutenden
 * Nullwerte zu sehen sind: „hat bewusst keins" beim Personenkonto, „bewusst
 * keine" bei der Gegenpartei-Seite, und dass „Kein Beleg zu erwarten" gesetzt
 * ist, ist selbst die Aussage. Der Rest fehlt still.
 */
export const Sparse: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <CaseFacts
        all
        case={{
          caseNumber: "2026-0501",
          kind: "internal_transfer",
          lifecycleStatus: "open",
          openedAt: "2026-09-05",
          personalAccountNumber: null,
          counterpartySide: null,
          documentNotRequiredReason:
            "Interne Umbuchung zwischen zwei Sachkonten — es gibt keinen Beleg dazu.",
        }}
      />
    </div>
  ),
};

/** `all` — bis Rang 24, in der Reihenfolge des Profils. Rang 25 gehört der Abnahmeliste. */
export const All: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <CaseFacts
        case={{
          ...FULL,
          closedAt: "2026-09-02",
          expectedInterval: "monatlich",
          clearingAccountNumber: "1370",
          exportBatchId: "2026-0042",
        }}
        all
        partnerHref="#partner-8812"
        accountHref={accountHref}
      />
    </div>
  ),
};

/**
 * `all` mit `technical={false}`: der Reiter „Stammdaten", wenn dieselbe Seite
 * einen Reiter „Technik" hat (Owner 2026-09-11). Anker, Angelegt von,
 * Buchungslauf und Buchungszyklus stehen dort, hier nicht.
 */
export const WithoutTechnical: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <CaseFacts
        case={{ ...FULL, exportBatchId: "2026-0042" }}
        all
        technical={false}
        partnerHref="#partner-8812"
        accountHref={accountHref}
      />
    </div>
  ),
};

/** `tone="bare"` unter einer Überschrift — die Fassung für Zone 3 des Drawers (0052). */
export const InDrawer: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <div className="v2doc__h">Kernfakten</div>
      <CaseFacts case={FULL} tone="bare" accountHref={accountHref} />
    </div>
  ),
};

/**
 * Rand: eine Zusammenfassung von **721** Zeichen — ein Zeichen über dem
 * Höchstwert des Bestands (720), nachgezählt und nicht behauptet. Sie kürzt
 * bei 160 und klappt auf; der volle Text steht **darunter**, nicht in einem
 * `title`, denn 700 Zeichen im Hover liest niemand.
 */
export const LongSummary: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <CaseFacts
        case={{
          ...FULL,
          summary:
            "Sammelrechnung über Bürobedarf, Bewirtung und eine Reinigungspauschale. " +
            "Die Bewirtung ist mit 70 zu 30 zu splitten, der Bürobedarf geht vollständig " +
            "auf 6815, die Reinigungspauschale gehört in den Folgemonat, weil die Leistung " +
            "erst im September erbracht wird. Der Beleg trägt zusätzlich eine " +
            "Skontovereinbarung von zwei Prozent bei Zahlung binnen zehn Tagen, die beim " +
            "Zahlungsabgleich zu berücksichtigen ist. Der Lieferschein liegt als zweite " +
            "Seite bei; die dritte Seite ist eine Kopie der Bestellung aus dem Juli und " +
            "gehört nicht zu diesem Vorgang. Die Kostenstelle für den Bürobedarf ist die " +
            "Verwaltung, für die Bewirtung der Vertrieb; beide stehen im Stammsatz des " +
            "Kreditors hinterlegt und deshalb hier nicht zu setzen.",
        }}
        accountHref={accountHref}
      />
    </div>
  ),
};

/**
 * Im Einsatz: unter dem Kopf. Der Kopf trägt die Ränge 1–4 (Name, Zustand,
 * Nummer, Betrag), die Fakten setzen bei 11 an — **nichts steht zweimal**.
 *
 * Deshalb steht hier auch kein `CardHead` über dem `EntityHeader`: zwei Köpfe
 * übereinander wiederholen Nummer und Gegenpart, und genau das war Befund B3.
 */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 860, display: "grid", gap: "var(--space-5)" }}>
      <EntityHeader
        overline="Eingangsrechnung · 2026-0412"
        title="Wartung der Klimaanlage"
        status={<StatusBadge axis="accounting_case" status="open" />}
        metric={{ label: "Gesamtbetrag", value: "1.249,90 €" }}
      />
      <CaseFacts case={FULL} partnerHref="#partner-8812" accountHref={accountHref} />
    </div>
  ),
};
