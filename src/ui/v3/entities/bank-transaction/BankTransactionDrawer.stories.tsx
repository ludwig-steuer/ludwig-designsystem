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
    const [target, setTarget] = useState<string | null>(null);
    return (
      <>
        <BankTransactionDrawer
          open
          onClose={() => {}}
          // Reference and booking day name the **same** day: the id starts with the
          // booking day, and a different day in the head below would make the
          // drawer contradict itself in its first two lines (0103, M3).
          reference="2026-08-27/1210/0093121"
          record={{
            ...RECORD,
            postingDate: "2026-08-27",
            cases: [],
            allocatedSum: 0,
            matchStage: "unclear_none",
          }}
          onOpenFull={(exit, caseId) => setTarget(`${exit}${caseId ? ` · ${caseId}` : ""}`)}
          caseHref={caseHref}
        />
        <p className="v2muted" style={{ padding: "var(--space-4)" }}>
          {target ? `Weiter zu: ${target}` : "Noch nichts ausgelöst."}
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
        // The same day as in the reference above (M3).
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
        <button type="button" className="v2btn v2btn--tertiary v2btn--sm" onClick={() => setOpen(true)}>
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
    const [target, setTarget] = useState<string | null>(null);
    return (
      // 1500 and not 1400: copying the list's own number would be a second
      // truth again (acceptance M4). The frame is deliberately **wider** than
      // the table's minimum width — that is how the story shows it does not
      // scroll.
      <div style={{ maxWidth: 1500 }}>
        {/* **The list, not a rebuild of it.** The story used to set up `Table` with
            a copied `minWidth={1400}` — a second truth next to a maintained one
            (0103, M7). Now the list itself stands here. */}
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
          {/* The **reference**, not the record id: `reference` is what the caller
              looks up — booking day, account, running number. `bt-1` is our
              fixture id; confusing the two is what `reference` exists against
              (0103, M3). It now matches `RECORD`. */}
          <button
            type="button"
            className="v2btn v2btn--tertiary v2btn--sm"
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
            // **Both values, not only the exit.** The foot passes `(exit, caseId)`,
            // and `caseId` was set in no story (0103, M6). `RECORD` carries an
            // assigned case, so its id arrives here.
            onOpenFull={(exit, caseId) => {
              setTarget(`${exit}${caseId ? ` · ${caseId}` : " · ohne Fall"}`);
              setRef(null);
            }}
            caseHref={caseHref}
          />
        ) : null}
        {target ? (
          <p className="lw-body-sm" style={{ padding: "0 var(--space-4)" }}>
            Der Fuß hat übergeben: <strong>{target}</strong>
          </p>
        ) : null}
      </div>
    );
  },
};
