import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Decimal from "decimal.js";
import { money } from "@/ludwig/shared/money";
import { Amount } from "./Amount";
import { KpiGrid, KpiTile } from "./KpiTile";
import { Card, HeadRow, Row, Table } from "./Table";
import { AmountCell } from "./Cells";

const meta: Meta<typeof Amount> = { title: "v3/Primitives/Werte/Amount", component: Amount };
export default meta;
type Story = StoryObj<typeof Amount>;

const L = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{children}</div>
);

/** Dieselbe Zahl, drei Rollen: Zelle, Zeile, Kachel. Die Ziffern fluchten. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      <div>
        <L>sm — Zelle und Fließtext</L>
        <Amount value={1249.9} currency="EUR" size="sm" />
      </div>
      <div>
        <L>md — Zeile und Detail (Default)</L>
        <Amount value={1249.9} currency="EUR" />
      </div>
      <div>
        <L>lg — Kachel und Summe</L>
        <Amount value={1249.9} currency="EUR" size="lg" />
      </div>
      <div style={{ display: "grid", width: 160, textAlign: "right" }}>
        <L>untereinander</L>
        <Amount value={1249.9} currency="EUR" />
        <Amount value={84.5} currency="EUR" />
        <Amount value={42108.55} currency="EUR" />
      </div>
    </div>
  ),
};

/** Vorzeichen tragen **keine** Farbe (A7) — ein Minus ist ein Zeichen, kein
 *  Alarm. `signed` zeigt auch das Plus, für Abweichungen. */
export const Signs: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "baseline" }}>
      <Amount value={1249.9} currency="EUR" />
      <Amount value={-1249.9} currency="EUR" />
      <Amount value={312.4} currency="EUR" signed />
      <Amount value={-312.4} currency="EUR" signed />
      <Amount value={0} currency="EUR" />
    </div>
  ),
};

/** Farbe bekommt der Betrag nur, wenn die **Zahl** der Alarm ist. */
export const Tones: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "baseline" }}>
      <Amount value={1249.9} currency="EUR" />
      <Amount value={1249.9} currency="EUR" tone="muted" />
      <Amount value={1249.9} currency="EUR" tone="success" />
      <Amount value={1249.9} currency="EUR" tone="warning" />
      <Amount value={1249.9} currency="EUR" tone="danger" title="Differenz zum Beleg: 1.249,90 €" />
    </div>
  ),
};

/** Die Währung kommt aus dem Wert. Wer eine nackte Zahl gibt, muss sie nennen —
 *  `currency={null}` ist die Dezimalzahl ohne Währung. */
export const Currencies: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-3)" }}>
      <div>
        <L>Money (EUR)</L>
        <Amount value={money(new Decimal("1249.90"), "EUR")} />
      </div>
      <div>
        <L>Money (CHF)</L>
        <Amount value={money(new Decimal("1249.90"), "CHF")} />
      </div>
      <div>
        <L>nackte Zahl, Währung genannt</L>
        <Amount value={1249.9} currency="EUR" />
      </div>
      <div>
        <L>ohne Währung — Stückzahl, Menge</L>
        <Amount value={142} currency={null} />
      </div>
    </div>
  ),
};

/** `null` heißt „nicht bekannt" — und sieht anders aus als null Euro. */
export const Empty: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "baseline" }}>
      <div>
        <L>null</L>
        <Amount value={null} currency="EUR" />
      </div>
      <div>
        <L>0,00 €</L>
        <Amount value={0} currency="EUR" />
      </div>
    </div>
  ),
};

/** Im Einsatz: Kachel, Summenzeile, Tabelle und Fließtext — eine Regel. */
export const InUse: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-5)", maxWidth: 640 }}>
      <KpiGrid columns={3}>
        <KpiTile label="Summe Soll" value={<Amount value={42108.55} currency="EUR" size="lg" />} />
        <KpiTile label="Summe Haben" value={<Amount value={42108.55} currency="EUR" size="lg" />} />
        <KpiTile
          label="Differenz"
          value={<Amount value={0} currency="EUR" size="lg" tone="success" />}
        />
      </KpiGrid>
      <Card>
        <Table cols="120px 1fr 140px">
          <HeadRow>
            <span>Beleg</span>
            <span>Kreditor</span>
            <span className="v2num">Betrag</span>
          </HeadRow>
          <Row>
            <span>RE-4471</span>
            <span>Bürobedarf Meier GmbH</span>
            <AmountCell value={1249.9} />
          </Row>
          <Row>
            <span>RE-4472</span>
            <span>Stadtwerke Musterstadt</span>
            <AmountCell value={412} />
          </Row>
        </Table>
      </Card>
      <p style={{ fontSize: 13.5, margin: 0 }}>
        Der Stapel enthält 142 Sätze über <Amount value={42108.55} currency="EUR" size="sm" />,
        davon <Amount value={1249.9} currency="EUR" size="sm" /> ohne Beleg.
      </p>
    </div>
  ),
};
