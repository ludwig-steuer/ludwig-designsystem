import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { FilterBar } from "../../primitives/FilterBar";
import { Field, Input, Select } from "../../primitives/Form";
import { PageHeader } from "../../primitives/PageHeader";
import { TextButton } from "../../primitives/TextButton";
import { caseLink } from "./fixtures";
import { RecurringRuleOverview } from "./RecurringRuleOverview";
import type { RecurringRuleListRow } from "./recurring-rule-columns";

const meta: Meta<typeof RecurringRuleOverview> = {
  title: "v3/Entitäten/Wiederkehr-Regel/RecurringRuleOverview",
  component: RecurringRuleOverview,
};
export default meta;
type Story = StoryObj<typeof RecurringRuleOverview>;

const ruleHref = (rule: RecurringRuleListRow) => `#fall-${rule.case?.caseId}-regelwerk`;
const accountHref = (number: string) => `#konto-${number}`;
const listHref = () => "#sortiert";

/** The imported rule of the stock: monthly, day 1, accrued, active. */
function row(over: Partial<RecurringRuleListRow> & { id: string }): RecurringRuleListRow {
  return {
    counterpartyName: "Musterfirma Immobilien GmbH",
    counterpartyIban: null,
    bookingMode: "accrue_then_settle",
    isActive: true,
    amount: 1800,
    interval: "monthly",
    direction: "payment_out",
    case: caseLink(),
    counterAccount: { accountNumber: "4210", accountName: "Miete" },
    personalAccount: { accountNumber: "70001", accountName: "Musterfirma Immobilien GmbH" },
    documentNumberStrategy: "period_key",
    ...over,
  };
}

/**
 * Acht Regeln eines Mandanten, sortiert wie die Query: Gültigkeit zuerst.
 * Darin **die drei Auffälligkeiten**, wegen derer es die Seite gibt — die
 * Versicherung ohne Personenkonto, die zwei Regeln an der Untermiete, und
 * ganz unten die abgeschaltete Reinigung. Dazu die eine Regel mit der
 * Belegnummern-Strategie `fixed`, die ab der zweiten Periode den
 * OPOS-Ausgleich bricht.
 */
const EIGHT: RecurringRuleListRow[] = [
  row({ id: "r-1" }),
  row({
    id: "r-2",
    counterpartyName: "Stadtwerke Musterstadt",
    amount: 89.9,
    case: caseLink({ caseId: "c-4501", caseNumber: "2026-0501", title: "Strom Musterstraße 12" }),
    counterAccount: { accountNumber: "4240", accountName: "Gas, Strom, Wasser" },
    personalAccount: { accountNumber: "70012", accountName: "Stadtwerke Musterstadt" },
    documentNumberStrategy: "from_document",
  }),
  // Die zweite Auffälligkeit: eine Regel ohne Personenkonto. Sie kann nicht
  // sollstellen — und genau das steht als Wort in ihrer Zeile.
  row({
    id: "r-3",
    counterpartyName: "Musterversicherung AG",
    bookingMode: "book_on_payment",
    amount: 412.5,
    interval: "quarterly",
    case: caseLink({ caseId: "c-4520", caseNumber: "2026-0520", title: "Betriebshaftpflicht" }),
    counterAccount: { accountNumber: "4360", accountName: "Versicherungen" },
    personalAccount: null,
  }),
  // Die dritte: zwei Regeln an einem Sachverhalt. Sie stehen nebeneinander,
  // weil die Query nach Sachverhaltsnummer sortiert — und beide tragen die
  // Marke, damit man sie auch einzeln erkennt.
  row({
    id: "r-4",
    counterpartyName: "Mustermieter GmbH",
    direction: "payment_in",
    amount: 950,
    case: caseLink({
      caseId: "c-4544",
      caseNumber: "2026-0544",
      title: "Untermiete Musterstraße 12",
    }),
    caseRuleCount: 2,
    counterAccount: { accountNumber: "8105", accountName: "Erlöse Vermietung" },
    personalAccount: { accountNumber: "10004", accountName: "Mustermieter GmbH" },
  }),
  row({
    id: "r-5",
    counterpartyName: "Mustermieter GmbH",
    bookingMode: "match_only",
    direction: "payment_in",
    amount: 120,
    case: caseLink({
      caseId: "c-4544",
      caseNumber: "2026-0544",
      title: "Untermiete Musterstraße 12",
    }),
    caseRuleCount: 2,
    counterAccount: null,
    personalAccount: { accountNumber: "10004", accountName: "Mustermieter GmbH" },
  }),
  row({
    id: "r-6",
    counterpartyName: "Telefon Muster AG",
    amount: 74.9,
    case: caseLink({ caseId: "c-4562", caseNumber: "2026-0562", title: "Telefon und Internet" }),
    counterAccount: { accountNumber: "4920", accountName: "Telefon" },
    personalAccount: { accountNumber: "70031", accountName: "Telefon Muster AG" },
    documentNumberStrategy: "from_document",
  }),
  row({
    id: "r-7",
    counterpartyName: "Musterleasing GmbH",
    amount: 289,
    case: caseLink({ caseId: "c-4577", caseNumber: "2026-0577", title: "Leasing Lieferwagen" }),
    counterAccount: { accountNumber: "4570", accountName: "Leasing Kfz" },
    personalAccount: { accountNumber: "70044", accountName: "Musterleasing GmbH" },
    documentNumberStrategy: "fixed",
  }),
  // Die erste Auffälligkeit: sie steht still. Ein Wort, kein Ton — eine Regel
  // darf abgeschaltet sein, das ist kein Fehler.
  row({
    id: "r-8",
    counterpartyName: "Musterreinigung e. K.",
    isActive: false,
    amount: 240,
    case: caseLink({ caseId: "c-4588", caseNumber: "2026-0588", title: "Unterhaltsreinigung" }),
    counterAccount: { accountNumber: "4250", accountName: "Raumkosten" },
    personalAccount: { accountNumber: "70052", accountName: "Musterreinigung e. K." },
  }),
];

/**
 * Der Normalfall: acht von 30 Regeln, sortiert nach Gültigkeit (der Pfeil
 * steht am aktiven Kopf), die ganze Zeile führt in den Regelwerk-Reiter ihres
 * Sachverhalts, beide Konten führen ins Kontenblatt. Im Fuß steht die größere
 * Zahl: **15 Dauersachverhalte haben noch keine Regel** — mit ihrem Weg
 * dorthin.
 */
export const Filled: Story = {
  render: () => (
    <div style={{ maxWidth: 1700 }}>
      <RecurringRuleOverview
        rules={EIGHT}
        ruleHref={ruleHref}
        accountHref={accountHref}
        casesWithoutRule={{ count: 15, href: "#dauersachverhalte-ohne-regel" }}
        total={30}
        sort={{ key: "validity", dir: "desc" }}
        href={listHref}
      />
    </div>
  ),
};

/**
 * Der Leerfall ist hier der **Normalfall**: fünf von sechs Mandanten tragen
 * keine einzige Regel. Links der übliche Fall — die Zahl der Dauersachverhalte
 * macht daraus eine Aussage und führt dorthin. Rechts der Mandant, der auch
 * keinen Dauersachverhalt hat: dann steht der Satz ohne Zahl und ohne Weg,
 * denn „0 Dauersachverhalte, keiner mit Regel" ist genauso wenig eine Aussage
 * wie „Keine Einträge".
 */
export const Empty: Story = {
  render: () => (
    <div style={{ maxWidth: 1700, display: "grid", gap: "var(--space-5)" }}>
      <RecurringRuleOverview
        rules={[]}
        ruleHref={ruleHref}
        casesWithoutRule={{ count: 15, href: "#dauersachverhalte-ohne-regel" }}
        total={0}
      />
      <RecurringRuleOverview
        rules={[]}
        ruleHref={ruleHref}
        casesWithoutRule={{ count: 0, href: "#dauersachverhalte-ohne-regel" }}
        total={0}
      />
    </div>
  ),
};

/**
 * Leer nach Filter — ein anderer Zustand als „noch keine Regel angelegt": hier
 * gibt es 30 Regeln, nur keine, die dem Filter entspricht. Der Text nennt den
 * Filter und den Weg zurück; im Kopf steht „0 von 30 Regeln".
 */
export const EmptyAfterFilter: Story = {
  render: () => (
    <div style={{ maxWidth: 1700 }}>
      <RecurringRuleOverview
        rules={[]}
        ruleHref={ruleHref}
        accountHref={accountHref}
        casesWithoutRule={{ count: 15, href: "#dauersachverhalte-ohne-regel" }}
        total={30}
        filtered={{ summary: "Gültigkeit: inaktiv · Buchungsweise: nur zuordnen", resetHref: "#alle" }}
        sort={{ key: "validity", dir: "desc" }}
        href={listHref}
      />
    </div>
  ),
};

/**
 * Lädt: Kopf und die zehn Spaltenköpfe bleiben stehen, darunter fünf
 * Skelettzeilen. Wer die Köpfe wegnimmt, lässt die Seite springen, sobald die
 * Zeilen da sind (I7).
 */
export const Loading: Story = {
  render: () => (
    <div style={{ maxWidth: 1700 }}>
      <RecurringRuleOverview
        rules={[]}
        ruleHref={ruleHref}
        accountHref={accountHref}
        total={30}
        loading
        sort={{ key: "validity", dir: "desc" }}
        href={listHref}
      />
    </div>
  ),
};

/** Fehler: ein Satz, der sagt was war, und **ein** Weg, es noch einmal zu versuchen. */
export const Error: Story = {
  render: () => (
    <div style={{ maxWidth: 1700 }}>
      <RecurringRuleOverview
        rules={[]}
        ruleHref={ruleHref}
        total={30}
        error={{
          message: "Das Regelwerk konnte nicht geladen werden.",
          retry: <TextButton href="#neu-laden">Erneut laden</TextButton>,
        }}
      />
    </div>
  ),
};

/**
 * Im Einsatz: der Reiter „Wiederkehr-Regeln" der Konfigurationsseite —
 * Seitenkopf, Filterzeile, Karte. Die **Filterzeile bleibt bei der Seite**:
 * sie hält den Zustand, liest die URL und kennt die Werte. Gemessen wird bei
 * dieser Breite, nicht bei der des Story-Rahmens.
 */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 1700, display: "grid", gap: "var(--space-4)" }}>
      <PageHeader
        overline="Musterbau GmbH · Konfiguration"
        title="Wiederkehr-Regeln"
        description="Was dieser Mandant automatisch bucht. Geändert wird eine Regel am Sachverhalt."
      />
      <FilterBar resetHref="#alle" activeCount={1}>
        <Field label="Gegenpartei" htmlFor="q">
          <Input id="q" type="search" placeholder="Name oder IBAN" />
        </Field>
        <Field label="Gültigkeit" htmlFor="g">
          <Select id="g" defaultValue="alle">
            <option value="alle">alle</option>
            <option value="aktiv">nur aktive</option>
            <option value="inaktiv">nur stillstehende</option>
          </Select>
        </Field>
        <Field label="Buchungsweise" htmlFor="b">
          <Select id="b" defaultValue="alle">
            <option value="alle">alle</option>
            <option value="accrue_then_settle">Sollstellung</option>
            <option value="book_on_payment">bei Zahlung</option>
            <option value="match_only">nur zuordnen</option>
          </Select>
        </Field>
      </FilterBar>
      <RecurringRuleOverview
        rules={EIGHT}
        ruleHref={ruleHref}
        accountHref={accountHref}
        casesWithoutRule={{ count: 15, href: "#dauersachverhalte-ohne-regel" }}
        total={30}
        sort={{ key: "case", dir: "asc" }}
        href={listHref}
      />
    </div>
  ),
};

/**
 * Der obere Rand: **30** Zeilen — mehr Regeln hat der größte Mandant im
 * Bestand nicht. Darin eine Gegenpartei mit 46 Zeichen, eine Regel **ohne
 * Kriterium** (weder Name noch IBAN — sie greift bei keiner Zahlung), eine
 * ohne Rhythmus, ein Betrag `null`, ein Sachverhalt ohne Titel und eine Regel
 * ohne beide Konten.
 *
 * Die Wortlücke, die diese Story bis zum 2026-09-09 mitzeigte, gibt es nicht
 * mehr: die vier Wortlisten stehen seit dem Spiegellauf in der Domäne und sind
 * über ihren Schlüsseltyp **vollständig**. Ein Wert ohne Wort ist damit kein
 * Fall der Darstellung mehr, sondern ein Typfehler.
 */
export const Edges: Story = {
  render: () => (
    <div style={{ maxWidth: 1700 }}>
      <RecurringRuleOverview
        rules={[
          row({
            id: "e-0",
            counterpartyName: "Musterfirma Immobilienverwaltung Nord GmbH KG",
            amount: null,
            interval: null,
            documentNumberStrategy: "fixed",
          }),
          row({
            id: "e-1",
            counterpartyName: null,
            counterpartyIban: null,
            isActive: false,
            counterAccount: null,
            personalAccount: null,
            case: caseLink({ caseId: "c-9000", caseNumber: "2026-0900", title: null }),
          }),
          row({
            id: "e-2",
            counterpartyName: null,
            counterpartyIban: "DE02120300000000202051",
            direction: null,
            case: caseLink({ caseId: "c-9001", caseNumber: "2026-0901", title: "Darlehen Muster" }),
          }),
          ...Array.from({ length: 27 }, (_, i) =>
            row({
              id: `e-${i + 3}`,
              counterpartyName: `Musterfirma ${i + 3} GmbH`,
              amount: 100 + i * 37.5,
              case: caseLink({
                caseId: `c-${5000 + i}`,
                caseNumber: `2026-${String(600 + i).padStart(4, "0")}`,
                title: `Dauersachverhalt ${i + 3}`,
              }),
              counterAccount: { accountNumber: "4210", accountName: "Miete" },
              personalAccount: { accountNumber: `700${String(60 + i).padStart(2, "0")}`, accountName: `Musterfirma ${i + 3} GmbH` },
            }),
          ),
        ]}
        ruleHref={ruleHref}
        accountHref={accountHref}
        casesWithoutRule={{ count: 74, href: "#dauersachverhalte-ohne-regel" }}
        total={30}
        sort={{ key: "case", dir: "asc" }}
        href={listHref}
      />
    </div>
  ),
};
