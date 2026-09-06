import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AmountCell } from "../../primitives/Cells";
import { Card, CardHead, HeadRow, Row, Table } from "../../primitives/Table";
import { CaseCell } from "./CaseCell";
import type { CaseLink } from "./case-title";

const meta: Meta<typeof CaseCell> = {
  title: "v3/Entitäten/Sachverhalt/CaseCell",
  component: CaseCell,
};
export default meta;
type Story = StoryObj<typeof CaseCell>;

const href = (id: string) => `#sachverhalt-${id}`;

const ONE: CaseLink = {
  caseId: "c-2026-0412",
  caseNumber: "2026-0412",
  fiscalYear: 2026,
  title: "Wartung der Klimaanlage",
  kind: "incoming_invoice",
  counterpartyName: "Bürobedarf Meier GmbH",
  lifecycleStatus: "open",
};

const MANY: CaseLink[] = [
  { ...ONE, amount: 812.5, currency: "EUR" },
  {
    ...ONE,
    caseId: "c-2026-0413",
    caseNumber: "2026-0413",
    title: null,
    counterpartyName: "Stadtwerke Musterstadt",
    lifecycleStatus: "needs_clarification",
    amount: 96.2,
    currency: "EUR",
  },
  {
    ...ONE,
    caseId: "c-2026-0414",
    caseNumber: "2026-0414",
    title: "Reinigungspauschale September",
    counterpartyName: null,
    lifecycleStatus: "closed_accepted",
    amount: 341.2,
    currency: "EUR",
  },
];

/** Ein Fall: Anzeigename, Nummer, Zustand — alles in einer Zeile. */
export const Single: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <CaseCell cases={[ONE]} href={href} />
    </div>
  ),
};

/**
 * Drei Fälle mit Teilbetrag — die Fassung, die `KontoauszugView` heute
 * handgeschrieben führt (L-54). Der Betrag kommt aus der Zuordnung der
 * Bankzeile, nicht aus dem Sachverhalt.
 */
export const Many: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <CaseCell cases={MANY} href={href} />
    </div>
  ),
};

/**
 * Kein Fall ist eine Aussage: „offen" mit Weg in den Zuordnungs-Reiter, und
 * daneben dieselbe Zelle ohne `emptyHref` — dann steht das Wort ohne Weg,
 * aber nie ein Gedankenstrich.
 */
export const None: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "var(--space-6)" }}>
      <CaseCell cases={[]} href={href} emptyHref="#zuordnen" />
      <CaseCell cases={[]} href={href} />
    </div>
  ),
};

/** `showState={false}`, wo die Liste den Zustand in einer eigenen Spalte führt. */
export const WithoutState: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <CaseCell cases={[ONE]} href={href} showState={false} />
    </div>
  ),
};

/**
 * Die Kette des Anzeigenamens, vier Zeilen: mit Titel · ohne Titel (Art und
 * Gegenpart) · ohne beides (nur die Art) · ohne Nummer (die Kurz-ID tritt an
 * ihre Stelle, denn ein Fall ohne Nummer ist trotzdem einer).
 */
export const Fallbacks: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-3)", maxWidth: 420 }}>
      <CaseCell cases={[ONE]} href={href} />
      <CaseCell cases={[{ ...ONE, caseId: "c-b", title: null }]} href={href} />
      <CaseCell
        cases={[{ ...ONE, caseId: "c-c", title: null, counterpartyName: null }]}
        href={href}
      />
      <CaseCell
        cases={[{ ...ONE, caseId: "c-d4f9e1a2b3", caseNumber: null }]}
        href={href}
      />
    </div>
  ),
};

/** Im Einsatz: die Spalte „Sachverhalt" neben Beleg und Betrag. */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 900 }}>
      <Card>
        <CardHead title="Kontoauszug August 2026" sub="Commerzbank · 1210" />
        <Table cols="120px 1fr 260px 120px">
          <HeadRow>
            <span>Datum</span>
            <span>Gegenpartei</span>
            <span>Sachverhalt</span>
            <span className="v2num">Betrag</span>
          </HeadRow>
          <Row>
            <span>26.08.2026</span>
            <span>Bürobedarf Meier GmbH</span>
            <span>
              <CaseCell cases={[ONE]} href={href} />
            </span>
            <AmountCell value={1249.9} />
          </Row>
          <Row>
            <span>27.08.2026</span>
            <span>Stadtwerke Musterstadt</span>
            <span>
              <CaseCell cases={[]} href={href} emptyHref="#zuordnen" />
            </span>
            <AmountCell value={-412} />
          </Row>
          <Row>
            <span>29.08.2026</span>
            <span>Sammelüberweisung</span>
            <span>
              <CaseCell cases={MANY} href={href} />
            </span>
            <AmountCell value={1249.9} />
          </Row>
        </Table>
      </Card>
    </div>
  ),
};
