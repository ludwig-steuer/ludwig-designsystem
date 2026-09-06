import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { BankTransactionDrawer } from "./BankTransactionDrawer";
import { BankTransactionRow } from "./BankTransactionRow";
import { bankTransactionColumns, bankTransactionTracks } from "./bank-transaction-columns";
import type { BankTransactionDetailData, CaseAssignment } from "./bank-transaction";
import { Card, CardHead, HeadRow, Table } from "../../primitives/Table";

const meta: Meta<typeof BankTransactionDrawer> = {
  title: "v3/Entitäten/Kontoauszugsposition/BankTransactionDrawer",
  component: BankTransactionDrawer,
};
export default meta;
type Story = StoryObj<typeof BankTransactionDrawer>;

const caseHref = (id: string) => `#fall-${id}`;

const CASE: CaseAssignment = {
  caseId: "c-4412",
  caseNumber: "2026-0412",
  fiscalYear: 2026,
  title: "Wartung der Klimaanlage",
  kind: "incoming_invoice",
  counterpartyName: "Bürobedarf Meier GmbH",
  lifecycleStatus: "open",
  amount: 1249.9,
  currency: "EUR",
  eventBookingState: "proposed",
  noBookingRequiredReason: null,
};

const RECORD: BankTransactionDetailData = {
  id: "bt-1",
  postingDate: "2026-08-26",
  valueDate: "2026-08-27",
  amount: -1249.9,
  amountEur: -1249.9,
  currency: "EUR",
  counterpartyName: "Bürobedarf Meier GmbH",
  counterpartyIban: "DE44500105175407324931",
  counterpartyBic: "COBADEFFXXX",
  purpose:
    "EREF+0600496348 MREF+D-VR-50411866-0-001 PURP+SUPP " +
    "SVWZ+Wartung Klimaanlage, Leistung 08/2026, Rechnung RE-4471",
  matchStage: "exact",
  cases: [CASE],
  allocatedSum: 1249.9,
  openClarificationsCount: 0,
  source: "csv",
  importBatchLabel: "commerzbank-2026-08.csv",
  importedAt: "2026-09-01T06:12:00+02:00",
  externalId: null,
  rawPayload: { buchungstag: "26.08.2026", betrag: "-1249,90", waehrung: "EUR" },
};

/**
 * Alle vier Zonen. Zone 2 entfällt — eine Zahlung hat kein Original.
 *
 * Die Referenz ist **bewusst** eine andere als die id des Datensatzes
 * (`2026-08-26/1210/0093117` gegen `bt-1`): nur so beweist die Story, dass im
 * Kopf steht, was nachgeschlagen wurde, und nicht, was zurückkam.
 */
export const Filled: Story = {
  render: () => (
    <BankTransactionDrawer
      open
      onClose={() => {}}
      reference="2026-08-26/1210/0093117"
      record={RECORD}
      onOpenFull={() => {}}
      caseHref={caseHref}
    />
  ),
};

/**
 * Der 65-Prozent-Fall: keine Zuordnung, und deshalb führt Zone 5 **nicht**
 * „zum Fall", sondern „zuordnen". Ein Ausgang, der immer stimmt, statt zweier,
 * von denen einer meistens ins Leere zeigt.
 */
export const Unassigned: Story = {
  render: () => (
    <BankTransactionDrawer
      open
      onClose={() => {}}
      reference="bt-2"
      record={{ ...RECORD, cases: [], allocatedSum: 0, matchStage: "unclear_none" }}
      onOpenFull={() => {}}
      caseHref={caseHref}
    />
  ),
};

/**
 * Rand: eine Zahlung **ohne Gegenpartei** — 3 % der Zeilen. Der Kopf fällt auf
 * den Verwendungszweck zurück, nicht auf „Zahlung <Kennung>": das ist der Kopf
 * des Nicht-gefunden-Falls und würde einen geladenen Datensatz wie einen
 * fehlenden aussehen lassen.
 */
export const WithoutCounterparty: Story = {
  render: () => (
    <BankTransactionDrawer
      open
      onClose={() => {}}
      reference="2026-08-29/1210/0088111"
      record={{
        ...RECORD,
        counterpartyName: null,
        counterpartyIban: null,
        counterpartyBic: null,
        purpose: "SVWZ+Kontoführungsentgelt August 2026",
        amount: -89.9,
        amountEur: -89.9,
        cases: [],
        allocatedSum: 0,
      }}
      onOpenFull={() => {}}
      caseHref={caseHref}
    />
  ),
};

/**
 * `loading`: die Form des Inhalts — vier rahmenlose Blöcke mit denselben
 * Überschriften, nicht eine Karte, die beim Eintreffen wieder verschwindet.
 */
export const Loading: Story = {
  render: () => (
    <BankTransactionDrawer
      open
      onClose={() => {}}
      reference="bt-1"
      record={null}
      loading
      onOpenFull={() => {}}
      caseHref={caseHref}
    />
  ),
};

/**
 * Der Fehler steht statt Zone 3, **der Ausgang bleibt** — wie bei 0098. Er
 * führt aber in den **Kontoauszug**, nicht in die Zuordnung: ohne Datensatz
 * weiß der Drawer nicht, ob die Zahlung längst zugeordnet ist.
 */
export const Error: Story = {
  render: () => (
    <BankTransactionDrawer
      open
      onClose={() => {}}
      reference="bt-1"
      record={null}
      error="Zeitüberschreitung beim Laden"
      onOpenFull={() => {}}
      caseHref={caseHref}
    />
  ),
};

/**
 * `record={null}` ohne `loading` heißt **nicht gefunden**, nicht „lädt noch" —
 * und der Ausgang bietet nicht an, etwas zuzuordnen, das es nicht gibt.
 */
export const NotFound: Story = {
  render: () => (
    <BankTransactionDrawer
      open
      onClose={() => {}}
      reference="bt-9999"
      record={null}
      onOpenFull={() => {}}
      caseHref={caseHref}
    />
  ),
};

/** Rundlauf: öffnen, Esc, der Fokus kehrt an den Auslöser zurück. */
export const Interactive: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ padding: "var(--space-6)" }}>
        <button type="button" className="v2btn v2btn--ghost" onClick={() => setOpen(true)}>
          Zahlung ansehen
        </button>
        <BankTransactionDrawer
          open={open}
          onClose={() => setOpen(false)}
          reference="bt-1"
          record={RECORD}
          onOpenFull={() => {}}
          caseHref={caseHref}
        />
      </div>
    );
  },
};

/** Im Einsatz: aus dem Kontoauszug heraus — die Liste bleibt hinter dem Scrim. */
export const InUse: Story = {
  render: function Render() {
    const [ref, setRef] = useState<string | null>(null);
    const DEF = bankTransactionColumns({ caseHref });
    return (
      <div style={{ maxWidth: 1400 }}>
        <Card>
          <CardHead title="Kontoauszug August 2026" sub="Commerzbank · 1210" />
          <Table cols={bankTransactionTracks(DEF)} minWidth={1220}>
            <HeadRow>
              {DEF.map((c) => (
                <span key={c.key} className={c.align === "end" ? "v2num" : undefined}>
                  {c.header}
                </span>
              ))}
            </HeadRow>
            <BankTransactionRow
              transaction={RECORD}
              caseHref={caseHref}
              openHref="#zuordnen"
            />
            <BankTransactionRow
              transaction={{
                ...RECORD,
                id: "bt-2",
                cases: [],
                allocatedSum: 0,
                matchStage: "unclear_none",
                counterpartyName: "Stadtwerke Musterstadt",
                amount: -412,
              }}
              caseHref={caseHref}
              openHref="#zuordnen"
            />
          </Table>
        </Card>
        <div style={{ padding: "var(--space-4)" }}>
          <button type="button" className="v2btn v2btn--ghost" onClick={() => setRef("bt-1")}>
            Erste Zahlung nachschlagen
          </button>
        </div>
        {ref ? (
          <BankTransactionDrawer
            open
            onClose={() => setRef(null)}
            reference={ref}
            record={RECORD}
            onOpenFull={() => {}}
            caseHref={caseHref}
          />
        ) : null}
      </div>
    );
  },
};
