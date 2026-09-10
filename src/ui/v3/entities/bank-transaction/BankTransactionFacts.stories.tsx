import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BankTransactionFacts } from "./BankTransactionFacts";
import type { BankTransactionDetailData, CaseAssignment } from "./bank-transaction";
import { Card, CardHead } from "../../primitives/Table";
import { EntityHeader } from "../../patterns/EntityHeader";

const meta: Meta<typeof BankTransactionFacts> = {
  title: "v3/Entitäten/Kontoauszugsposition/BankTransactionFacts",
  component: BankTransactionFacts,
};
export default meta;
type Story = StoryObj<typeof BankTransactionFacts>;

const caseHref = (id: string) => `#fall-${id}`;

const CASE = (over: Partial<CaseAssignment> = {}): CaseAssignment => ({
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
  ...over,
});

const FULL: BankTransactionDetailData = {
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
    "EREF+0600496348 KREF+DA-77120 MREF+D-VR-50411866-0-001 " +
    "CRED+DE87ZZZ00000001701 PURP+SUPP OAMT+1249,90 ABWA+Musterbau GmbH & Co. KG " +
    "SVWZ+Wartung Klimaanlage, Leistung 08/2026, Rechnung RE-4471",
  matchStage: "exact",
  cases: [CASE()],
  allocatedSum: 1249.9,
  openClarificationsCount: 0,
  source: "csv",
  importBatchLabel: "commerzbank-2026-08.csv",
  importedAt: "2026-09-01T06:12:00+02:00",
  externalId: null,
  rawPayload: {
    buchungstag: "26.08.2026",
    wertstellung: "27.08.2026",
    betrag: "-1249,90",
    waehrung: "EUR",
    auftraggeber: "Bürobedarf Meier GmbH",
    iban: "DE44500105175407324931",
    parsed_sepa_tags: { eref: "0600496348", purp: "SUPP" },
  },
};

/**
 * Alle fünf Blöcke in der Reihenfolge des Profils. Der EUR-Wert **fehlt** —
 * er ist identisch zum Betrag, und eine Zeile „Betrag (EUR): 1.249,90 €"
 * neben „Betrag: 1.249,90 €" sagt nichts.
 */
export const Filled: Story = {
  render: () => (
    <div style={{ maxWidth: 720, padding: "var(--space-6)" }}>
      <BankTransactionFacts transaction={FULL} caseHref={caseHref} />
    </div>
  ),
};

/**
 * Der Zuordnungs-Block sagt bei null Fällen einen **Satz**, keine Lücke — 65 %
 * der Positionen sind dieser Fall, und das ist die Frage, wegen der jemand den
 * Auszug öffnet.
 */
export const Unassigned: Story = {
  render: () => (
    <div style={{ maxWidth: 720, padding: "var(--space-6)" }}>
      <BankTransactionFacts
        transaction={{ ...FULL, cases: [], allocatedSum: 0, matchStage: "unclear_none" }}
        caseHref={caseHref}
      />
    </div>
  ),
};

/**
 * Ohne SEPA-Tags — 10 % der Zeilen — fehlt die Chip-Reihe **ganz**, nicht als
 * leere Zeile. Der Zweck steht als Freitext.
 */
export const WithoutTags: Story = {
  render: () => (
    <div style={{ maxWidth: 720, padding: "var(--space-6)" }}>
      <BankTransactionFacts
        transaction={{ ...FULL, purpose: "Dauerauftrag Miete Büro Musterstadt September 2026" }}
        caseHref={caseHref}
      />
    </div>
  ),
};

/**
 * Die Fassung für den Drawer (0103): `blocks` ohne „Import", `tone="bare"`.
 * Die Reihenfolge der übrigen vier ändert sich dadurch nicht.
 */
export const InDrawer: Story = {
  render: () => (
    <div style={{ maxWidth: 620, padding: "var(--space-6)" }}>
      <BankTransactionFacts
        transaction={FULL}
        caseHref={caseHref}
        blocks={["payment", "purpose", "counterparty", "assignment"]}
        tone="bare"
      />
    </div>
  ),
};

/** Rang 18 als `RawRecord`, nicht als Feldliste — sieben Schlüssel, alphabetisch. */
export const RawPayload: Story = {
  render: () => (
    <div style={{ maxWidth: 720, padding: "var(--space-6)" }}>
      <BankTransactionFacts
        transaction={FULL}
        caseHref={caseHref}
        blocks={["import"]}
      />
    </div>
  ),
};

/**
 * Rand: drei Sachverhalte mit Teilbeträgen, und ein Rest bleibt. Der
 * Buchungs-Zustand steht **je Fall** — zwei sind vorgeschlagen, an einem wird
 * bewusst nicht gebucht.
 */
export const Split: Story = {
  render: () => (
    <div style={{ maxWidth: 720, padding: "var(--space-6)" }}>
      <BankTransactionFacts
        transaction={{
          ...FULL,
          amount: -2480.55,
          amountEur: -2480.55,
          // The original amount belongs to **this** story's amount. In `FULL` it
          // contradicted three stories (M5) — a fixture disputing its own amount
          // reads like a bug.
          purpose: FULL.purpose?.replace("OAMT+1249,90", "OAMT+2480,55") ?? null,
          cases: [
            CASE({ amount: 1200 }),
            CASE({
              caseId: "c-4488",
              caseNumber: "2026-0488",
              title: "Ersatzteile Kompressor",
              amount: 800,
              eventBookingState: "posted",
            }),
            CASE({
              caseId: "c-4501",
              caseNumber: "2026-0501",
              title: "Porto und Nebenkosten",
              amount: 180,
              eventBookingState: null,
              noBookingRequiredReason: "Sammelbuchung am Monatsende, hier keine Einzelbuchung.",
            }),
          ],
          allocatedSum: 2180,
          openClarificationsCount: 2,
          matchStage: "split",
        }}
        caseHref={caseHref}
      />
    </div>
  ),
};

/**
 * Die drei Ränder, die nur diese Form zeigt — und die der Zeile fehlen:
 *
 * 1. **Ohne Namen.** Die Gegenpartei-Zeile bleibt stehen und sagt „ohne
 *    Namen", statt zu verschwinden wie IBAN und BIC. Das ist die **zweite**
 *    Ausnahme zur Weglass-Regel: der Gegenpart ist die Identität, sein Fehlen
 *    ist eine Aussage über die Zeile, kein fehlendes Detail (3 % der Zeilen).
 * 2. **Der EUR-Wert bei Abweichung.** Er erscheint nur, wenn er vom Betrag
 *    abweicht — hier eine Zahlung in Franken. In den anderen Stories fehlt er,
 *    und das ist die andere Hälfte desselben Nachweises.
 * 3. **Die offenen DATEV-Klassen mit ihrem Wort.** Drei stehen hier —
 *    `beyond_bookings` („außerhalb des Bestands": kein Befund, nur keine
 *    Vergleichsgrundlage), `no_account` und `unclear_multi` —, die vierte
 *    (`unclear_none`) in `Unassigned`. Diese vier Wörter sind der Zuwachs
 *    dieser Form gegenüber der Zeile (Befund B2); in der Zeile sind sie
 *    unsichtbar.
 */
export const Edges: Story = {
  render: () => (
    <div style={{ maxWidth: 720, display: "grid", gap: "var(--space-5)", padding: "var(--space-6)" }}>
      <BankTransactionFacts
        transaction={{
          ...FULL,
          counterpartyName: null,
          currency: "CHF",
          amount: -1350,
          amountEur: -1421.55,
          matchStage: "beyond_bookings",
          cases: [],
          allocatedSum: 0,
        }}
        caseHref={caseHref}
      />
      <BankTransactionFacts
        transaction={{
          ...FULL,
          matchStage: "no_account",
          cases: [],
          allocatedSum: 0,
        }}
        caseHref={caseHref}
      />
      <BankTransactionFacts
        transaction={{ ...FULL, matchStage: "unclear_multi", cases: [], allocatedSum: 0 }}
        caseHref={caseHref}
      />
    </div>
  ),
};

/**
 * Im Einsatz: unter einem Kopf. **Nichts steht zweimal** — der Kopf trägt die
 * Identität (Gegenpartei und wo sie herkommt), die Fakten alles Übrige.
 *
 * Auch das **Datum** gehört den Fakten, nicht dem Kopf: es ist ein Faktum,
 * kein Name. Der Kopf trug es bis zur Wiederabnahme 0102 als „gebucht am
 * 26.08.2026", und damit stand `26.08.2026` an beiden Stellen — gemessen bei
 * 700, 1100, 1400 und 1920 px. Der Satz „nichts steht zweimal" war der
 * Nachweis, den diese Story schuldet.
 *
 * Der Betrag steht ebenfalls nicht im Kopf: `blocks` schneidet ganze Blöcke,
 * und der Block „Zahlung" beginnt mit ihm.
 */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 760, display: "grid", gap: "var(--space-5)", padding: "var(--space-6)" }}>
      <EntityHeader
        overline="Kontoauszugsposition · Commerzbank · 1210"
        title="Bürobedarf Meier GmbH"
      />
      <Card>
        <CardHead title="Alles zu dieser Zahlung" />
        <div style={{ padding: "var(--space-5)" }}>
          <BankTransactionFacts
            transaction={FULL}
            caseHref={caseHref}
            tone="bare"
            // Without the counterparty block: the name is already in the head,
            // and IBAN and BIC belong to it — alone they would be a field list
            // without a subject.
            blocks={["payment", "purpose", "assignment", "import"]}
          />
        </div>
      </Card>
    </div>
  ),
};
