import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BankTransactionPurpose } from "./BankTransactionPurpose";
import { AmountCell } from "../../primitives/Cells";
import { Card, CardHead, HeadRow, Row, Table } from "../../primitives/Table";

const meta: Meta<typeof BankTransactionPurpose> = {
  title: "v3/Entitäten/Kontoauszugsposition/BankTransactionPurpose",
  component: BankTransactionPurpose,
};
export default meta;
type Story = StoryObj<typeof BankTransactionPurpose>;

/** Ein echter Block, wie eine VR-Bank ihn liefert: sechs der sieben Schlüssel. */
const FULL =
  "EREF+0600496348 KREF+DA-77120 MREF+D-VR-50411866-0-001 " +
  "CRED+DE87ZZZ00000001701 PURP+RINP OAMT+1596,88 " +
  "SVWZ+Wartung Klimaanlage, Leistung 08/2026, Rechnung RE-4471";

/** Ein Zweck ohne Tag-Block — 10 % der Zeilen. Der Rohwert ist der Freitext. */
const PLAIN = "Dauerauftrag Miete Büro Musterstadt September 2026";

/**
 * Eine Zeile mit Ellipse; die Referenzen liegen hinter dem (i), zusammen mit
 * dem Originalwert. Das (i) ist ein Knopf und damit per Tastatur erreichbar.
 */
export const Inline: Story = {
  render: () => (
    <div style={{ maxWidth: 420, padding: "var(--space-6)" }}>
      <BankTransactionPurpose purpose={FULL} />
    </div>
  ),
};

/**
 * `variant="block"`: der Freitext steht ganz, darunter die Chips. `PURP` steht
 * als Code, sein `title` trägt das Wort — die Übersetzung kommt aus dem
 * Spiegel (`PURP_LABELS`), nicht aus einer Map in dieser Datei.
 */
export const Block: Story = {
  render: () => (
    <div style={{ maxWidth: 620, padding: "var(--space-6)" }}>
      <BankTransactionPurpose purpose={FULL} variant="block" />
    </div>
  ),
};

/** Ohne erkannten Tag-Block gibt es **kein** (i) — ein Info-Punkt ohne Inhalt. */
export const WithoutTags: Story = {
  render: () => (
    <div style={{ maxWidth: 420, padding: "var(--space-6)" }}>
      <BankTransactionPurpose purpose={PLAIN} />
    </div>
  ),
};

/** `purpose={null}` → „—". Der Zweck ist zu 100 % gefüllt; der Fall ist der Schutz. */
export const Empty: Story = {
  render: () => (
    <div style={{ padding: "var(--space-6)" }}>
      <BankTransactionPurpose purpose={null} />
    </div>
  ),
};

/**
 * Gesetzte `tags` gewinnen gegen das Nachparsen: derselbe Rohwert wie oben,
 * aber die Gegenpartei hat beim Import eine abweichende Mandatsreferenz
 * mitgeliefert — die steht im Chip, nicht die aus dem Text.
 */
export const TagsWin: Story = {
  render: () => (
    <div style={{ maxWidth: 620, padding: "var(--space-6)" }}>
      <BankTransactionPurpose
        purpose={FULL}
        tags={{ mref: "AUS-DEM-IMPORT-4711", abwa: "Musterbau GmbH & Co. KG" }}
        variant="block"
      />
    </div>
  ),
};

/**
 * Rand: ein Rohblock von 509 Zeichen, davon 360 Freitext — über dem
 * Höchstwert des Bestands (447 roh) und dem Vierfachen von p90 (84 Freitext).
 * Inline bleibt es eine Zeile mit Ellipse, im Popover steht der Block ganz
 * und mono.
 */
export const Raw: Story = {
  render: () => (
    <div style={{ maxWidth: 420, padding: "var(--space-6)" }}>
      <BankTransactionPurpose
        purpose={
          "EREF+2026-08-SAMMLER-0093117 KREF+NONREF MREF+D-VR-50411866-0-001 " +
          "CRED+DE87ZZZ00000001701 PURP+SUPP OAMT+12.480,55 ABWA+Musterbau GmbH & Co. KG " +
          "SVWZ+Sammelüberweisung August 2026 für die Rechnungen RE-4471, RE-4472, " +
          "RE-4488, RE-4501, RE-4517, RE-4522 und RE-4530 abzüglich der Gutschrift " +
          "GS-0091 und der Gutschrift GS-0104 sowie des vereinbarten Skontos von zwei " +
          "Prozent, Zahlungsziel laut Rahmenvertrag vom 14.03.2026, Ansprechpartner " +
          "Einkauf, Kostenstelle 4400, Freigabe durch die Geschäftsführung liegt vor"
        }
      />
    </div>
  ),
};

/**
 * Rand 2: ein Tag-Block **ohne SVWZ**. Die Ableitung fällt dann auf den ganzen
 * Block zurück — und genau der stünde damit an der Stelle, an der der Rohwert
 * nie stehen soll. Also steht dort „—": es gibt keinen Freitext, und die
 * Referenzen liegen hinter dem (i), wo sie hingehören.
 */
export const TagsOnly: Story = {
  render: () => (
    <div style={{ maxWidth: 420, padding: "var(--space-6)" }}>
      <BankTransactionPurpose purpose="EREF+0600496348 MREF+D-VR-50411866-0-001 CRED+DE87ZZZ00000001701" />
    </div>
  ),
};

/** Im Einsatz: die breiteste Spalte des Auszugs, neben Datum, Gegenpartei und Betrag. */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 900 }}>
      <Card>
        <CardHead title="Kontoauszug August 2026" sub="Commerzbank · 1210" />
        <Table cols="110px 200px 1fr 120px">
          <HeadRow>
            <span>Datum</span>
            <span>Gegenpartei</span>
            <span>Verwendungszweck</span>
            <span className="v2num">Betrag</span>
          </HeadRow>
          <Row>
            <span>26.08.2026</span>
            <span>Bürobedarf Meier GmbH</span>
            <BankTransactionPurpose purpose={FULL} />
            <AmountCell value={-1249.9} />
          </Row>
          <Row>
            <span>27.08.2026</span>
            <span>Musterbau GmbH</span>
            <BankTransactionPurpose purpose={PLAIN} />
            <AmountCell value={1800} />
          </Row>
          <Row>
            <span>28.08.2026</span>
            <span>Stadtwerke Musterstadt</span>
            <BankTransactionPurpose purpose={"EREF+SW-2026-08 SVWZ+Abschlag Strom 08/2026"} />
            <AmountCell value={-412} />
          </Row>
          {/* Die Zeile, die die Spalte sprengt: hier greift die Ellipse. */}
          <Row>
            <span>29.08.2026</span>
            <span>Musterbau GmbH</span>
            <BankTransactionPurpose
              purpose={
                "EREF+2026-08-SAMMLER-0093117 SVWZ+Sammelüberweisung August 2026 für die " +
                "Rechnungen RE-4471, RE-4472, RE-4488 und RE-4501 abzüglich der Gutschrift " +
                "GS-0091 sowie des vereinbarten Skontos von zwei Prozent"
              }
            />
            <AmountCell value={-12480.55} />
          </Row>
        </Table>
      </Card>
    </div>
  ),
};
