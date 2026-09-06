import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BankTransactionCell } from "./BankTransactionCell";
import type { BankTransactionCellData } from "./bank-transaction";
import { Card, CardHead, HeadRow, Row, Table } from "../../primitives/Table";
import { StatusBadge } from "../../patterns/StatusBadge";
import { Time } from "../../primitives/Time";

const meta: Meta<typeof BankTransactionCell> = {
  title: "v3/Entitäten/Kontoauszugsposition/BankTransactionCell",
  component: BankTransactionCell,
};
export default meta;
type Story = StoryObj<typeof BankTransactionCell>;

const OUT: BankTransactionCellData = {
  id: "bt-1",
  postingDate: "2026-08-26",
  amount: -1249.9,
  currency: "EUR",
  counterpartyName: "Bürobedarf Meier GmbH",
  purpose:
    "EREF+0600496348 MREF+D-VR-50411866-0-001 " +
    "SVWZ+Wartung Klimaanlage, Leistung 08/2026, Rechnung RE-4471",
};

const IN: BankTransactionCellData = {
  id: "bt-2",
  postingDate: "2026-08-27",
  amount: 1800,
  currency: "EUR",
  counterpartyName: "Musterbau GmbH",
  purpose: "EREF+RE-2026-0338 SVWZ+Zahlung Rechnung RE-2026-0338",
};

/**
 * Ein Ausgang und ein Eingang nebeneinander — **beide in derselben Farbe**.
 * Das Vorzeichen ist die Richtung; Rot wäre Kritikalität, und ein Ausgang ist
 * kein Fehler.
 */
export const Filled: Story = {
  render: () => (
    <div style={{ maxWidth: 520, display: "grid", gap: "var(--space-5)", padding: "var(--space-6)" }}>
      <BankTransactionCell transaction={OUT} href="#bt-1" />
      <BankTransactionCell transaction={IN} href="#bt-2" />
    </div>
  ),
};

/**
 * Ohne Gegenpartei — 3 % der Zeilen — rückt der Zweck nach oben: dann **ist**
 * er die Identität. Eine zweite Zeile gibt es dann nicht.
 */
export const WithoutCounterparty: Story = {
  render: () => (
    <div style={{ maxWidth: 520, padding: "var(--space-6)" }}>
      <BankTransactionCell
        transaction={{ ...OUT, counterpartyName: null, amount: -89.9 }}
        href="#bt-3"
      />
    </div>
  ),
};

/**
 * `account`: das Zahlungskonto als dritte Angabe — nur kontofern. Im
 * Kontoauszug wäre es die Spalte, die die Seite ohnehin setzt.
 */
export const WithAccount: Story = {
  render: () => (
    <div style={{ maxWidth: 520, padding: "var(--space-6)" }}>
      <BankTransactionCell
        transaction={OUT}
        account={{ label: "Commerzbank · 1210", href: "#konto-1210" }}
        href="#bt-1"
      />
    </div>
  ),
};

/** Ohne `href`: kein `<a>` im DOM, die Zelle ist Text. */
export const Plain: Story = {
  render: () => (
    <div style={{ maxWidth: 520, padding: "var(--space-6)" }}>
      <BankTransactionCell transaction={OUT} />
    </div>
  ),
};

/**
 * Im Einsatz 1 — im Zeitstrahl eines Sachverhalts, wo `EventStack` sie heute
 * von Hand baut. Das Konto steht mit, weil es hier sonst niemand weiß.
 */
export const InUseTimeline: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <Card>
        <CardHead title="Verlauf" sub="Sachverhalt 2026-0412" />
        <div style={{ padding: "var(--space-5)", display: "grid", gap: "var(--space-5)" }}>
          <div>
            <div className="v2sub" style={{ marginBottom: "var(--space-2)" }}>
              <Time value="2026-08-26" format="date" length="long" size="sm" /> · Zahlung ausgegangen
            </div>
            <BankTransactionCell
              transaction={OUT}
              account={{ label: "Commerzbank · 1210", href: "#konto-1210" }}
              href="#bt-1"
            />
          </div>
          <div>
            <div className="v2sub" style={{ marginBottom: "var(--space-2)" }}>
              <Time value="2026-08-31" format="date" length="long" size="sm" /> · Teilerstattung
            </div>
            <BankTransactionCell
              transaction={{
                ...IN,
                id: "bt-4",
                postingDate: "2026-08-31",
                amount: 249.9,
                counterpartyName: "Bürobedarf Meier GmbH",
                purpose: "SVWZ+Gutschrift GS-0091 zu RE-4471",
              }}
              account={{ label: "Commerzbank · 1210", href: "#konto-1210" }}
              href="#bt-4"
            />
          </div>
        </div>
      </Card>
    </div>
  ),
};

/**
 * Im Einsatz 2 — die Gate-Zeile aus Schritt 4 der Stapelabnahme: Bezeichnung,
 * Betrag, das offene Gate. Die Zelle trägt die Bezeichnung, der Betrag steht
 * in ihr, und das Gate bleibt eine eigene Spalte — der Zustand gehört nicht
 * in die Zelle.
 */
export const InUseGate: Story = {
  render: () => (
    <div style={{ maxWidth: 900 }}>
      <Card>
        <CardHead title="Schritt 4 · Was noch offen ist" sub="Zwei Gates halten den Stapel" />
        <Table cols="1fr 200px">
          <HeadRow>
            <span>Position</span>
            <span>Gate</span>
          </HeadRow>
          <Row>
            <BankTransactionCell transaction={OUT} href="#bt-1" />
            <span>
              <StatusBadge axis="bank_match_stage" status="unclear_multi" />
            </span>
          </Row>
          <Row>
            <BankTransactionCell
              transaction={{ ...OUT, id: "bt-5", counterpartyName: null, amount: -412 }}
              href="#bt-5"
            />
            <span>
              <StatusBadge axis="bank_match_stage" status="unclear_none" />
            </span>
          </Row>
        </Table>
      </Card>
    </div>
  ),
};
