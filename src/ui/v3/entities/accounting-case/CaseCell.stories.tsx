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
const LANG = "Wartung der Klimaanlage im Obergeschoss, zweiter Bauabschnitt";

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

/**
 * Die zwei Anordnungen nebeneinander, in **derselben** schmalen Spur (200 px).
 *
 * `inline` ist die Vorgabe und die Anordnung für Zeilen: alles auf einer
 * Linie, die Kennung führt, der Name gibt nach. `stacked` ist die alte Form
 * für Karten und Faktentafeln — der Name behält seinen Platz, der Rest rückt
 * eine Zeile tiefer und macht die Zeile doppelt so hoch.
 *
 * Der Unterschied ist der Grund für den Owner-Entscheid vom 2026-09-07: eine
 * Liste liest sich über ihre Zeilenhöhe, und eine Zelle, die 24 px höher ist
 * als ihre Nachbarn, ist ein Signal ohne Bedeutung.
 */
export const Layouts: Story = {
  render: () => (
    <div style={{ maxWidth: 620 }}>
      <Card>
        <CardHead title="Dieselbe Spur, zwei Anordnungen" sub="200 px, langer Name" />
        <Table cols="110px 200px 1fr">
          <HeadRow>
            <span>Anordnung</span>
            <span>Sachverhalt</span>
            <span>Was passiert</span>
          </HeadRow>
          <Row>
            <span>inline</span>
            <span>
              <CaseCell cases={[{ ...ONE, title: LANG }]} href={href} />
            </span>
            <span>Eine Zeile, der Name mit Ellipse</span>
          </Row>
          <Row>
            <span>stacked</span>
            <span>
              <CaseCell cases={[{ ...ONE, title: LANG }]} href={href} layout="stacked" />
            </span>
            <span>Der Name behält seinen Platz, der Rest bricht um</span>
          </Row>
        </Table>
      </Card>
    </div>
  ),
};

/**
 * Rand: ein langer Name **in einer schmalen Spalte** — der Fall, den die
 * übrigen Stories nicht treffen, weil sie ihre Zellen in ein weites Raster
 * legen. Hier muss die Ellipse greifen, der Chip darf den Nachbarn nicht
 * überdrucken, und der Name behält seine acht Zeichen (Abnahme 0095).
 */
export const NarrowColumn: Story = {
  render: () => (
    <div style={{ maxWidth: 620 }}>
      <Card>
        <CardHead title="Belege" sub="Schmale Spalte, lange Namen" />
        <Table cols="110px 200px 1fr">
          <HeadRow>
            <span>Datum</span>
            <span>Sachverhalt</span>
            <span className="v2num">Betrag</span>
          </HeadRow>
          <Row>
            <span>26.08.2026</span>
            <span>
              <CaseCell
                cases={[
                  {
                    ...ONE,
                    title:
                      "Wartung der Klimaanlage im Obergeschoss, zweiter Bauabschnitt",
                  },
                ]}
                href={href}
              />
            </span>
            <AmountCell value={1249.9} />
          </Row>
          <Row>
            <span>29.08.2026</span>
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
