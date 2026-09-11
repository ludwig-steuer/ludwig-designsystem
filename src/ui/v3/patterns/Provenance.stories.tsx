import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { EntityIcon } from "../Icons";
import { FieldList } from "../primitives/FieldList";
import { Card, CardHead, HeadRow, Row, Table } from "../primitives/Table";
import { StatusBadge } from "./StatusBadge";
import { ProvenanceMark, ProvenanceNote, type Provenance, type ProvenanceSource } from "./Provenance";

const meta: Meta<typeof ProvenanceNote> = {
  title: "v3/Patterns/Prüfen/Provenance",
  component: ProvenanceNote,
};
export default meta;
type Story = StoryObj<typeof ProvenanceNote>;

/** The origin as the caller's axis says it — here the one of the journal entry. */
const origin = (status: string) => <StatusBadge axis="buchung_origin" status={status} info={false} />;

/** Icon and word of a source kind — the caller's word list, drawn from the icon registry. */
const kind = (entity: "source-document" | "bank-transaction" | "journal-entry" | "recurring-rule", word: string) => (
  <>
    <EntityIcon entity={entity} />
    {word}
  </>
);

const SOURCES: ProvenanceSource[] = [
  { key: "1", kind: kind("source-document", "Beleg"), label: "Rechnung 93846778", quote: "Rechnung vom 16.07.2026 über 25,41 EUR", href: "#document=93846778" },
  { key: "2", kind: kind("journal-entry", "Bisherige Buchungen"), label: "Kreditor 71202, 14 Buchungen, zuletzt 22.06.2026" },
  { key: "3", kind: kind("bank-transaction", "Kontoauszug"), label: "Zahlung vom 30.07.2026", href: "#bank=30-07" },
];

const PROPOSAL: Provenance = {
  origin: origin("ai_proposed"),
  actor: "Agent · Lauf 4b19c2",
  at: "2026-07-31T16:05:00Z",
  rule: { code: "S3.expense.vendor_precedent", sentence: "Konto nach der Präzedenz dieses Lieferanten." },
  confidence: { level: "green", value: 0.92 },
  rationale:
    "Konto und Kreditor wie bei der Rechnung desselben Lieferanten im Juni; das Kontoblatt 71202 zeigt für Juli keine Bewegung, die Rechnung war also noch nicht erfasst.",
  sources: SOURCES,
};

/**
 * The derivation of a machine proposal: collapsed it names origin,
 * confidence, who and when; open, in fixed order, origin · rule · confidence ·
 * reason · sources. A source with a way is a link, one without is text.
 */
export const Note: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16, maxWidth: 640 }}>
      <ProvenanceNote provenance={PROPOSAL} />
      <ProvenanceNote provenance={PROPOSAL} defaultOpen />
    </div>
  ),
};

/**
 * Five origins as marks side by side — the word comes from the axis
 * `buchung_origin`, the pattern has no word list of its own. Only the proposal
 * carries a confidence; the reason sits in the hover.
 */
export const Origins: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center" }}>
      <ProvenanceMark provenance={PROPOSAL} />
      <ProvenanceMark
        provenance={{ origin: origin("recurring_rule"), rule: { code: "rule-8801", sentence: "Monatlich am 1., Miete Halle Musterstraße 12." } }}
      />
      <ProvenanceMark provenance={{ origin: origin("manual"), rationale: "Von Hand erfasst: Barauslage ohne Beleg im System." }} />
      <ProvenanceMark provenance={{ origin: origin("client_import"), rationale: "Aus dem Buchungsstapel des Mandanten übernommen." }} />
      <ProvenanceMark provenance={{ origin: origin("system_reversal"), rationale: "Gegenbuchung zu RE-4410, am 02.08. storniert." }} />
    </div>
  ),
};

/**
 * The mark beside the value it explains: in a field list and in a table cell,
 * with the reason in the hover and the way to the derivation.
 */
export const Mark: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16, maxWidth: 560 }}>
      <FieldList
        rows={[
          [
            "Konto",
            <span key="k" style={{ display: "inline-flex", flexWrap: "wrap", justifyContent: "flex-end", gap: 12, alignItems: "center" }}>
              5404 Wareneingang 19 %
              <ProvenanceMark provenance={PROPOSAL} href="#provenance" />
            </span>,
          ],
          [
            "Belegnummer",
            <span key="b" style={{ display: "inline-flex", flexWrap: "wrap", justifyContent: "flex-end", gap: 12, alignItems: "center" }}>
              93846778
              <ProvenanceMark
                provenance={{ origin: <span>aus dem Beleg</span>, rationale: "Die Rechnungsnummer steht im Kopf des Belegs." }}
                reason="Belegfeld 1 ist die Rechnungsnummer aus dem Kopf des Belegs."
              />
            </span>,
          ],
        ]}
      />
      <Card>
        <Table cols="minmax(0, 1fr) auto max-content">
          <HeadRow>
            <span>Rechnung</span>
            <span>Konto</span>
            <span>Herkunft</span>
          </HeadRow>
          <Row>
            <span>93846778 · Musterfirma GmbH</span>
            <span>5404</span>
            <ProvenanceMark provenance={PROPOSAL} href="#provenance" />
          </Row>
          <Row>
            <span>RE-4410 · Musterbau GmbH</span>
            <span>6815</span>
            <ProvenanceMark provenance={{ origin: origin("system_reversal"), rationale: "Gegenbuchung zu RE-4410, am 02.08. storniert." }} />
          </Row>
        </Table>
      </Card>
    </div>
  ),
};

/** Corrected by hand: who and when, beginning open — the correction is the reason to look. */
export const Corrected: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <ProvenanceNote
        defaultOpen
        provenance={{
          origin: origin("manual"),
          actor: "Agent · Lauf 4b19c2",
          at: "2026-08-14T09:12:00Z",
          rationale: "Konto von 6815 auf 6830 geändert — eine Beratungsleistung, kein Bürobedarf.",
          corrected: { by: "Anna Muster", at: "2026-08-15T10:40:00Z" },
        }}
      />
    </div>
  ),
};

/** Only the origin: no empty reason row, no empty rule row — what is missing is absent. */
export const Sparse: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <ProvenanceNote provenance={{ origin: origin("client_import") }} defaultOpen />
    </div>
  ),
};

/**
 * In use: the open-item allocation. `matched_by` and `rationale` are filled in
 * 100 % of the rows and readable nowhere today — the row shows `matched_by`
 * raw and the reason not at all. `matched_by` has no axis, so the origin here
 * is a word of the caller.
 */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <Card>
        <CardHead title="Ausgleich" sub="RE-4471 → Zahlung vom 30.08.2026 · 1.249,90 €" />
        <div style={{ padding: 16 }}>
          <ProvenanceNote
            provenance={{
              origin: <span>Abgleich</span>,
              actor: "Nachtlauf",
              at: "2026-08-31T02:10:00Z",
              rule: { code: "belegfeld_exact", sentence: "Belegnummer und Betrag stimmen genau überein." },
              rationale: "Die Zahlung nennt RE-4471 im Verwendungszweck und deckt den offenen Posten auf den Cent.",
              sources: [
                { key: "b", kind: kind("bank-transaction", "Kontoauszug"), label: "Zahlung vom 30.08.2026", quote: "RE-4471 Musterbau GmbH" },
                { key: "r", kind: kind("source-document", "Beleg"), label: "Rechnung RE-4471", href: "#document=RE-4471" },
              ],
            }}
          />
        </div>
      </Card>
    </div>
  ),
};

/** The edge at 360 px: a 700-character reason, twelve sources, a long rule code. */
export const Edges: Story = {
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <ProvenanceNote
        defaultOpen
        provenance={{
          ...PROPOSAL,
          rule: { code: "S3.expense.vendor_precedent.split_by_tax_rate.fallback_manual_review", sentence: "Aufteilung nach Steuersatz, sonst Prüfung von Hand." },
          rationale: `${"Die Rechnung enthält Positionen mit 7 % und 19 % Umsatzsteuer; der Agent teilt nach Steuersatz auf und bucht die Leergutpfand-Position gesondert. ".repeat(5)}Die Präzedenz des Lieferanten deckt diese Aufteilung.`,
          sources: Array.from({ length: 12 }, (_, i) => ({
            key: `e-${i}`,
            kind: kind("journal-entry", "Bisherige Buchungen"),
            label: `Buchung ${i + 1} desselben Kreditors, Juni 2026`,
          })),
        }}
      />
    </div>
  ),
};
