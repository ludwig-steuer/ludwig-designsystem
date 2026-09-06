import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Landmark } from "lucide-react";
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

/**
 * Zwei Wege, die sonst keine Story trägt: `sepaTags` aus dem Import gewinnen
 * gegen das Nachparsen (MREF steht als „AUS-DEM-IMPORT-4711"), und `account`
 * **ohne** `href` — ein Konto, das genannt, aber nicht verlinkt wird.
 */
export const TagsAndPlainAccount: Story = {
  render: () => (
    <div style={{ maxWidth: 520, padding: "var(--space-6)" }}>
      <BankTransactionCell
        transaction={{ ...OUT, sepaTags: { mref: "AUS-DEM-IMPORT-4711" } }}
        account={{ label: "Commerzbank · 1210" }}
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
 *
 * Unten daneben **dieselbe** Zahlung in der alten Fassung
 * (`EventStack.BankTransactionBlock`), damit die Ablösung nachprüfbar ist.
 * Was die alte kann und die neue nicht: das Landmark-Icon in der 44-px-Kachel.
 * Was die neue kann und die alte nicht: den **Betrag** (die alte zeigt ihn gar
 * nicht), das **Jahr** im Datum, den Zweck über `BankTransactionPurpose` mit
 * Zugang zu den Referenzen — und sie sagt, dass das Datum das Buchungsdatum
 * ist.
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
          <div>
            <div className="v2sub" style={{ marginBottom: "var(--space-2)" }}>
              Zum Vergleich: die alte Fassung derselben Zahlung
            </div>
            <OldBlock />
          </div>
        </div>
      </Card>
    </div>
  ),
};

/**
 * `EventStack.BankTransactionBlock` der App, nachgebaut mit ihren Inline-Maßen
 * — nur für den Vergleich in `InUseTimeline`, nicht als Baustein.
 */
function OldBlock() {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 6,
          background: "var(--color-bg-soft)",
          color: "var(--color-text-subtle)",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        <Landmark size={18} strokeWidth={1.5} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500 }}>Bürobedarf Meier GmbH</div>
        <div
          style={{
            fontSize: 11.5,
            color: "var(--color-text-muted)",
            display: "flex",
            gap: 8,
            marginTop: 2,
          }}
        >
          <span>Commerzbank · 1210</span>
          <span>26.08.</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 4 }}>
          Wartung Klimaanlage, Leistung 08/2026, Rechnung RE-4471
        </div>
      </div>
    </div>
  );
}

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
