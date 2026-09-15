import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Card, CardFoot, CardHead, HeadRow, Row, Table } from "../primitives/Table";
import { AmountCell } from "../primitives/Cells";
import { BalanceCheck } from "./BalanceCheck";

/**
 * Does it add up? The same arithmetic in five places — the statement against
 * its closing balance, the clearing account against zero, debit against
 * credit. The component adds the lines and subtracts the target; the caller
 * brings the figures and the words.
 */
const meta: Meta<typeof BalanceCheck> = {
  title: "v3/Patterns/Prüfen/BalanceCheck",
  component: BalanceCheck,
};
export default meta;
type Story = StoryObj<typeof BalanceCheck>;

/**
 * The bank statement: opening balance plus incoming minus outgoing against the
 * closing balance. It adds up, so the result line is a sentence with a mark —
 * and **not** a second „0,00 €".
 */
export const Statement: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <BalanceCheck
        currency="EUR"
        lines={[
          { key: "opening", label: "Anfangssaldo", value: 12480.55, hint: "31.07.2026, aus dem Vorauszug" },
          { key: "in", label: "Eingänge", value: 8213.9, hint: "14 Zeilen" },
          { key: "out", label: "Ausgänge", value: -6902.45, hint: "31 Zeilen" },
        ]}
        target={{ label: "Endsaldo laut Auszug", value: 13792 }}
      />
    </div>
  ),
};

/**
 * The clearing account has to come to nothing. The target is a zero the caller
 * names — the component has no opinion about what a target is.
 */
export const Clearing: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <BalanceCheck
        currency="EUR"
        balanced="Das Verrechnungskonto ist leer."
        lines={[
          { key: "in", label: "Aus dem Stapel gebucht", value: 4312 },
          { key: "out", label: "An die Debitoren ausgeglichen", value: -4312 },
        ]}
        target={{ label: "Sollsaldo", value: 0 }}
      />
    </div>
  ),
};

/**
 * Debit against credit of one journal entry — the same component, only the
 * words change. This is the „Rest" line of the booking grid, said once.
 */
export const Entry: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <BalanceCheck
        currency="EUR"
        lines={[
          { key: "expense", label: "5404 Wareneingang 19 %", value: 1512.61 },
          { key: "tax", label: "1576 Vorsteuer 19 %", value: 287.39 },
        ]}
        target={{ label: "Haben · 71202 Musterfirma GmbH", value: 1800 }}
      />
    </div>
  ),
};

/**
 * It does not add up: above the default — the signed difference and the word
 * that says which way (V7). Below a sentence of the caller: it stands
 * **instead of** the figure, because it names the amount itself.
 */
export const Off: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16, maxWidth: 480 }}>
      <BalanceCheck
        currency="EUR"
        lines={[
          { key: "opening", label: "Anfangssaldo", value: 12480.55 },
          { key: "in", label: "Eingänge", value: 8213.9 },
          { key: "out", label: "Ausgänge", value: -6914.85 },
        ]}
        target={{ label: "Endsaldo laut Auszug", value: 13792 }}
      />
      <BalanceCheck
        currency="EUR"
        lines={[
          { key: "opening", label: "Anfangssaldo", value: 12480.55 },
          { key: "in", label: "Eingänge", value: 8213.9 },
          { key: "out", label: "Ausgänge", value: -6914.85 },
        ]}
        target={{ label: "Endsaldo laut Auszug", value: 13792 }}
        off={(difference) => `Dem Auszug fehlen ${Math.abs(difference).toFixed(2).replace(".", ",")} € — vermutlich eine Zeile, die noch nicht gebucht ist.`}
      />
    </div>
  ),
};

/**
 * The edge at 360 px: seven digits, a negative opening balance, and the
 * tolerance — four tenths of a cent still add up, six do not.
 */
export const Edges: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16, maxWidth: 360 }}>
      <BalanceCheck
        currency="EUR"
        lines={[
          { key: "opening", label: "Anfangssaldo", value: -1284902.17, hint: "Kontokorrent, ausgeschöpft" },
          { key: "in", label: "Eingänge", value: 2004318.44 },
        ]}
        target={{ label: "Endsaldo laut Auszug", value: 719416.27 }}
      />
      <BalanceCheck
        currency="EUR"
        lines={[{ key: "sum", label: "Summe der Zeilen", value: 1000.004, hint: "genau 1.000,004 € — vier Tausendstel unter der Grenze" }]}
        target={{ label: "Endsaldo laut Auszug", value: 1000 }}
      />
      <BalanceCheck
        currency="EUR"
        lines={[{ key: "sum", label: "Summe der Zeilen", value: 1000.006, hint: "genau 1.000,006 € — ein Tausendstel darüber" }]}
        target={{ label: "Endsaldo laut Auszug", value: 1000 }}
      />
    </div>
  ),
};

/**
 * In use at the statement: the movements in the card, the check in its foot
 * with `tone="bare"` — the card already has the frame, a second one would be a
 * box in a box.
 */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <Card>
        <CardHead title="Kontoauszug 8/2026" sub="Musterbank · Geschäftskonto · 45 Zeilen" />
        <Table cols="max-content minmax(0, 1fr) max-content">
          <HeadRow>
            <span>Datum</span>
            <span>Verwendungszweck</span>
            <span className="v2num">Betrag</span>
          </HeadRow>
          <Row>
            <span>03.08.2026</span>
            <span>Musterfirma GmbH · RE-4471</span>
            <AmountCell value={-1249.9} currency="EUR" />
          </Row>
          <Row>
            <span>14.08.2026</span>
            <span>Musterbau GmbH · Abschlag 2</span>
            <AmountCell value={4980} currency="EUR" />
          </Row>
          <Row>
            <span>29.08.2026</span>
            <span>Dauerauftrag Miete Halle</span>
            <AmountCell value={-1800} currency="EUR" />
          </Row>
        </Table>
        <CardFoot>
          <BalanceCheck
            tone="bare"
            currency="EUR"
            lines={[
              { key: "opening", label: "Anfangssaldo", value: 12480.55 },
              { key: "in", label: "Eingänge", value: 8213.9 },
              { key: "out", label: "Ausgänge", value: -6902.45 },
            ]}
            target={{ label: "Endsaldo laut Auszug", value: 13792 }}
          />
        </CardFoot>
      </Card>
    </div>
  ),
};
