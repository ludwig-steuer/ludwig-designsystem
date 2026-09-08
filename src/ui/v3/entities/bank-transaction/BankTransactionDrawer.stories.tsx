import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { BankTransactionList } from "./BankTransactionList";
import { BankTransactionDrawer } from "./BankTransactionDrawer";
import type { BankTransactionDetailData, CaseAssignment } from "./bank-transaction";

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
 *
 * Hier läuft auch der **Rundlauf** von `onOpenFull`: die Prop entscheidet mit
 * `("case" | "assign" | "statement", caseId?)`, wohin es geht, und acht Stories
 * gaben ihr eine leere Funktion — der Klick tat nachweislich nichts (Abnahme
 * 0103, M1). Die Zeile darunter zeigt, was ankommt.
 */
export const Unassigned: Story = {
  render: function Render() {
    const [ziel, setZiel] = useState<string | null>(null);
    return (
      <>
        <BankTransactionDrawer
          open
          onClose={() => {}}
          // Referenz und Buchungstag sagen **denselben** Tag: die Kennung
          // beginnt mit dem Buchungstag, und wenn der Kopf darunter einen
          // anderen nennt, widerspricht sich der Drawer in seinen ersten zwei
          // Zeilen (Wiederabnahme 0103, M3).
          reference="2026-08-27/1210/0093121"
          record={{
            ...RECORD,
            postingDate: "2026-08-27",
            cases: [],
            allocatedSum: 0,
            matchStage: "unclear_none",
          }}
          onOpenFull={(exit, caseId) => setZiel(`${exit}${caseId ? ` · ${caseId}` : ""}`)}
          caseHref={caseHref}
        />
        <p className="v2muted" style={{ padding: "var(--space-4)" }}>
          {ziel ? `Weiter zu: ${ziel}` : "Noch nichts ausgelöst."}
        </p>
      </>
    );
  },
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
        // Derselbe Tag wie in der Referenz darüber (M3).
        postingDate: "2026-08-29",
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
      reference="2026-08-26/1210/0093117"
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
      reference="2026-08-26/1210/0093117"
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
      reference="2026-08-30/1210/0093140"
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
          reference="2026-08-26/1210/0093117"
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
    const [ziel, setZiel] = useState<string | null>(null);
    return (
      <div style={{ maxWidth: 1400 }}>
        {/* **Die Liste, nicht ihr Nachbau.** Die Story hatte `Table` mit
            `minWidth={1400}` von Hand aufgesetzt und die Zahl aus
            `BankTransactionList.tsx` abgeschrieben — eine zweite Wahrheit
            neben einer gepflegten (Wiederabnahme 0103, M7). Jetzt steht hier
            die Liste selbst; ihre Vorgabe gilt. */}
        <BankTransactionList
          transactions={[
            RECORD,
            {
              ...RECORD,
              id: "bt-2",
              cases: [],
              allocatedSum: 0,
              matchStage: "unclear_none",
              counterpartyName: "Stadtwerke Musterstadt",
              amount: -412,
            },
          ]}
          caseHref={caseHref}
          openHref="#zuordnen"
          head={{ title: "Kontoauszug August 2026", sub: "Commerzbank · 1210" }}
        />
        <div style={{ padding: "var(--space-4)", display: "flex", gap: "var(--space-3)" }}>
          {/* Die **Referenz**, nicht die id des Datensatzes: `reference` ist,
              was der Aufrufer nachschlägt — Buchungstag, Konto, laufende
              Nummer. `bt-1` ist unsere Fixture-id und stand hier zwei Runden
              lang; genau die Verwechslung, gegen die `reference` gebaut wurde
              (Wiederabnahme 0103, M3). Sie stimmt jetzt mit `RECORD` überein:
              derselbe Buchungstag, dasselbe Konto. */}
          <button
            type="button"
            className="v2btn v2btn--ghost"
            onClick={() => setRef("2026-08-26/1210/0093117")}
          >
            Erste Zahlung nachschlagen
          </button>
        </div>
        {ref ? (
          <BankTransactionDrawer
            open
            onClose={() => setRef(null)}
            reference={ref}
            record={RECORD}
            // **Beide Angaben, nicht nur der Ausgang.** Der Fuß reicht
            // `(exit, caseId)` durch, und `caseId` war in keiner Story je
            // gesetzt — bewiesen war nur `("assign")` ohne Argument
            // (Wiederabnahme 0103, M6). `RECORD` trägt einen zugeordneten
            // Fall, also kommt hier seine Kennung an.
            onOpenFull={(exit, caseId) => {
              setZiel(`${exit}${caseId ? ` · ${caseId}` : " · ohne Fall"}`);
              setRef(null);
            }}
            caseHref={caseHref}
          />
        ) : null}
        {ziel ? (
          <p className="lw-body-sm" style={{ padding: "0 var(--space-4)" }}>
            Der Fuß hat übergeben: <strong>{ziel}</strong>
          </p>
        ) : null}
      </div>
    );
  },
};
