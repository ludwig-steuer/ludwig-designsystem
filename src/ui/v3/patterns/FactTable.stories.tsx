import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState, type ReactNode } from "react";

import type { FactSourceKind } from "@/ludwig/modules/fact-records/domain/fact-source";

import { Disclosure } from "../primitives/Disclosure";
import { Drawer } from "../primitives/Drawer";
import { Card, CardHead } from "../primitives/Table";
import { FactTable, type FactTableRow } from "./FactTable";
import { FactSourceKindMark, type ProvenanceSource } from "./Provenance";

const meta: Meta<typeof FactTable> = {
  title: "v3/Patterns/Prüfen/FactTable",
  component: FactTable,
};
export default meta;
type Story = StoryObj<typeof FactTable>;

/** The one mark of a kind of source (0247) — as every caller draws it. */
const kind = (source: FactSourceKind): ReactNode => <FactSourceKindMark kind={source} />;

const INVOICE: ProvenanceSource = {
  key: "doc",
  kind: kind("source_doc"),
  label: "Rechnung INV-2026-0412",
  locator: "S. 1",
  quote: "Annual subscription Cloud Workspace, 12 months",
  href: "#document=INV-2026-0412",
};
const PARTNER: ProvenanceSource = {
  key: "bp",
  kind: kind("business_partner"),
  label: "Nordlicht Software Ltd.",
  locator: "Feld Land",
  href: "#partner=nordlicht",
};
const HISTORY: ProvenanceSource = {
  key: "hist",
  kind: kind("vendor_history"),
  label: "Kreditor 70418, 11 Buchungen, zuletzt 14.10.2026",
};

/** One invoice line of a software subscription from Ireland (F678). */
const LINE_FACTS: FactTableRow[] = [
  { key: "supply_type", label: "Leistung", value: "Software-Abonnement", sources: [INVOICE] },
  { key: "supply_kind", label: "Art der Leistung", value: "Leistung, kein Gegenstand", sources: [INVOICE] },
  { key: "use", label: "Verwendung", value: "eigener Verbrauch", sources: [HISTORY] },
  { key: "net_amount", label: "Nettobetrag", value: "1.188,00 €", sources: [{ ...INVOICE, key: "doc-amount", quote: "Net total EUR 1,188.00" }] },
];

const PARTNER_FACTS: FactTableRow[] = [
  { key: "country", label: "Land des Lieferanten", value: "Irland", sources: [PARTNER] },
  { key: "vat_id", label: "USt-IdNr.", value: "IE3456789OH", sources: [{ ...INVOICE, key: "doc-vat", locator: "S. 1, Fußzeile", quote: "VAT No. IE3456789OH" }] },
  { key: "is_business", label: "Unternehmer", value: "ja", sources: [PARTNER] },
];

const MORE_FACTS: FactTableRow[] = [
  { key: "document_date", label: "Belegdatum", value: "03.11.2026", sources: [INVOICE] },
  { key: "service_period", label: "Leistungszeitraum", value: "01.11.2026–31.10.2027", sources: [INVOICE] },
  { key: "currency", label: "Währung", value: "EUR", sources: [INVOICE] },
  { key: "notice", label: "Hinweis auf der Rechnung", value: "Reverse Charge", sources: [{ ...INVOICE, key: "doc-rc", locator: "S. 1", quote: "Reverse charge: VAT to be accounted for by the recipient" }] },
];

/**
 * The normal case: facts of one invoice line, each with its source — kind,
 * name as link, the place inside it („S. 1") and the quote under the name.
 * Only the source is a target; the row has no hover.
 */
export const Filled: Story = {
  render: () => (
    <div style={{ maxWidth: 760 }}>
      <FactTable facts={LINE_FACTS} />
    </div>
  ),
};

/** Without a single source the column „Quelle" is absent, as in 0238. */
export const WithoutSources: Story = {
  render: () => (
    <div style={{ maxWidth: 760 }}>
      <FactTable facts={LINE_FACTS.map(({ sources: _s, ...f }) => f)} />
    </div>
  ),
};

function OpenSourceDemo() {
  const [opened, setOpened] = useState<string | null>(null);
  const open = (s: ProvenanceSource) => ({ ...s, href: null, onOpen: () => setOpened(`${s.label}${s.locator ? `, ${s.locator}` : ""}`) });
  return (
    <div style={{ maxWidth: 760, display: "grid", gap: "var(--space-3)" }}>
      <FactTable facts={PARTNER_FACTS.map((f) => ({ ...f, sources: (f.sources ?? []).map(open) }))} />
      <p className="lw-ui-hint" role="status">
        {opened ? `Geöffnet: ${opened}` : "Noch keine Quelle geöffnet."}
      </p>
    </div>
  );
}

/**
 * `onOpen`: a source opens **beside** the work (a drawer), so it is a button,
 * not a link. Tab runs from source to source in reading order.
 */
export const OpenSource: Story = { render: () => <OpenSourceDemo /> };

/**
 * The edges: a long label, a long value, three sources one under the other, a
 * long quote, no value („—"), and a contradiction — two rows with one label,
 * each with its own value and source (F678).
 */
export const Edge: Story = {
  render: () => (
    <div style={{ maxWidth: 760 }}>
      <FactTable
        facts={[
          {
            key: "long",
            label: "Leistungsempfänger schuldet die Steuer nach § 13b Abs. 1 UStG",
            value: "ja, sonstige Leistung eines im übrigen Gemeinschaftsgebiet ansässigen Unternehmers",
            sources: [
              { ...INVOICE, key: "a", quote: "Reverse charge: VAT to be accounted for by the recipient according to Article 196 of Council Directive 2006/112/EC" },
              PARTNER,
              { key: "law", kind: kind("law"), label: "§ 13b Abs. 1 UStG", href: "#law=13b" },
            ],
          },
          { key: "use", label: "Verwendung", value: null },
          { key: "country-doc", label: "Land des Lieferanten", value: "Irland", sources: [{ ...INVOICE, key: "c1", locator: "S. 1, Absender", quote: "Nordlicht Software Ltd., Dublin 2, Ireland" }] },
          { key: "country-bp", label: "Land des Lieferanten", value: "Deutschland", sources: [{ ...PARTNER, key: "c2" }] },
        ]}
      />
    </div>
  ),
};

/**
 * In use: the facts of one entry in the side panel of the review, one card
 * with a head per group (D14), the rest folded under „Weitere Angaben" — at
 * the drawer's width `md`. Cards, heads and the fold belong to the caller.
 */
export const InUse: Story = {
  render: () => (
    <Drawer open onClose={() => {}} size="md" title="Beruht auf">
      <div style={{ display: "grid", gap: "var(--space-4)" }}>
        <Card>
          <CardHead title="Rechnungsposition" headingLevel={3} />
          <FactTable facts={LINE_FACTS.map((f) => ({ ...f, certainty: f.key === "use" ? "inferred" : "explicit" }))} />
        </Card>
        <Card>
          <CardHead title="Geschäftspartner" headingLevel={3} />
          <FactTable
            facts={PARTNER_FACTS.map((f) => ({
              ...f,
              certainty: f.key === "is_business" ? "assumed" : f.key === "vat_id" ? "confirmed" : "explicit",
              validFrom: "2026-01-01",
            }))}
          />
        </Card>
        <Disclosure summary="Weitere Angaben" count={MORE_FACTS.length}>
          <Card>
            <CardHead title="Beleg" headingLevel={3} />
            <FactTable facts={MORE_FACTS} />
          </Card>
        </Disclosure>
      </div>
    </Drawer>
  ),
};

/**
 * S2 · the five steps of the axis `fact_certainty` side by side — each a grey
 * word, no colour and no dot. „unbekannt" carries no value. The head „Sicherheit"
 * opens the axis' legend under (i).
 */
export const Certainty: Story = {
  render: () => (
    <div style={{ maxWidth: 760 }}>
      <FactTable
        facts={[
          { key: "vat_id", label: "USt-IdNr. gültig", value: "ja, geprüft am 03.11.2026", certainty: "confirmed", sources: [{ key: "ext", kind: kind("external_service"), label: "Bestätigungsabfrage beim BZSt", locator: "03.11.2026, 10:14 Uhr" }] },
          { key: "country", label: "Land des Lieferanten", value: "Irland", certainty: "explicit", sources: [{ ...INVOICE, key: "c", locator: "S. 1, Absender", quote: "Dublin 2, Ireland" }] },
          { key: "supply_kind", label: "Art der Leistung", value: "Leistung, kein Gegenstand", certainty: "inferred", sources: [{ ...INVOICE, key: "k", quote: "Annual subscription Cloud Workspace" }] },
          { key: "is_business", label: "Unternehmer", value: "ja", certainty: "assumed", sources: [{ key: "def", kind: kind("default"), label: "Ltd. ohne Gegenangabe" }] },
          { key: "use", label: "Verwendung", value: null, certainty: "unknown" },
        ]}
      />
    </div>
  ),
};

/**
 * S2 · long-lived facts say how long they hold, under the value: from a date,
 * until a date, or both — partner facts open-ended, client facts per fiscal year.
 */
export const Validity: Story = {
  render: () => (
    <div style={{ maxWidth: 760 }}>
      <FactTable
        facts={[
          { key: "country", label: "Land des Lieferanten", value: "Irland", certainty: "explicit", validFrom: "2026-01-01", sources: [PARTNER] },
          { key: "taxation", label: "Versteuerung", value: "Soll-Versteuerung", certainty: "confirmed", validFrom: "2026-01-01", validTo: "2026-12-31" },
          { key: "small_business", label: "Kleinunternehmer", value: "nein", certainty: "confirmed", validTo: "2025-12-31" },
        ]}
      />
    </div>
  ),
};

/**
 * `marked` (0247): the facts a result rests on, picked by the reader — their
 * rows take the „selected" background, and each label is a focus target.
 */
export const Marked: Story = {
  render: () => (
    <div style={{ maxWidth: 760 }}>
      <FactTable facts={LINE_FACTS} marked={["supply_type", "use"]} />
    </div>
  ),
};
