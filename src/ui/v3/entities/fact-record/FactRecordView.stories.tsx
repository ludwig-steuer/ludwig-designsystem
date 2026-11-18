import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import type { FactView, FactViewSource } from "@/ludwig/modules/fact-records/domain/fact-view";

import { Drawer } from "../../primitives/Drawer";
import { FactRecordView } from "./FactRecordView";

const meta: Meta<typeof FactRecordView> = {
  title: "v3/Entitäten/Faktensatz/FactRecordView",
  component: FactRecordView,
};
export default meta;
type Story = StoryObj<typeof FactRecordView>;

/* Fictitious: a software subscription from an Irish Ltd., reverse charge (F678). */

const INVOICE: FactViewSource = { kind: "source_doc", label: "Rechnung INV-2026-0412", locator: "S. 1", href: "#document=INV-2026-0412" };
const PARTNER: FactViewSource = { kind: "business_partner", label: "Nordlicht Software Ltd.", locator: "Feld Land", href: "#partner=nordlicht" };
const HISTORY: FactViewSource = { kind: "vendor_history", label: "Kreditor 70418, 11 Buchungen, zuletzt 14.10.2026" };
const CLIENT: FactViewSource = { kind: "client_profile", label: "Musterfirma GmbH", locator: "Feld Versteuerung", href: "#client=musterfirma" };

const BASE: FactView = {
  state: "ok",
  entry: {
    originMethod: "derivation",
    provisional: false,
    assumedCount: 1,
    lines: [
      { side: "debit", account: "4964 Aufwendungen für Lizenzen, Konzessionen", amount: "1.188,00 €", taxKey: "506", text: "Cloud Workspace 11/2026–10/2027" },
      { side: "credit", account: "70418 Nordlicht Software Ltd.", amount: "1.188,00 €", taxKey: null, text: null },
    ],
  },
  openPoints: [],
  result: [
    { key: "treatment", label: "Steuerbehandlung", value: "Leistungsempfänger schuldet die Steuer (§ 13b UStG)", basedOn: ["supplier_country", "supply_kind", "counterparty_is_business"] },
    { key: "tax_key", label: "Steuerschlüssel", value: "506", basedOn: ["supplier_country", "supply_kind"] },
    { key: "account", label: "Konto", value: "4964 Aufwendungen für Lizenzen, Konzessionen", basedOn: ["supply_type", "use"] },
  ],
  groups: [
    {
      group: "counterparty",
      facts: [
        { key: "supplier_country", label: "Land des Lieferanten", value: "Irland (EU-Ausland)", certainty: "explicit", sources: [PARTNER, { ...INVOICE, locator: "S. 1, Absender", quote: "Nordlicht Software Ltd., Dublin 2, Ireland" }], validFrom: "2026-01-01", usedForResult: true, decidedByAgent: false },
        { key: "counterparty_is_business", label: "Unternehmer", value: "ja", certainty: "assumed", sources: [{ kind: "default", label: "Ltd. ohne Gegenangabe" }], usedForResult: true, decidedByAgent: false },
        { key: "counterparty_vat_id", label: "USt-IdNr.", value: "IE3456789OH", certainty: "confirmed", sources: [{ kind: "external_service", label: "Bestätigungsabfrage beim BZSt", locator: "03.11.2026, 10:14 Uhr" }], usedForResult: false, decidedByAgent: false },
      ],
    },
    {
      group: "line",
      facts: [
        { key: "supply_type", label: "Was wurde gekauft", value: "Software-Abonnement", certainty: "explicit", sources: [{ ...INVOICE, quote: "Annual subscription Cloud Workspace, 12 months" }], usedForResult: true, decidedByAgent: false },
        { key: "supply_kind", label: "Art der Leistung", value: "Leistung, kein Gegenstand", certainty: "inferred", sources: [{ ...INVOICE, quote: "Annual subscription Cloud Workspace" }], usedForResult: true, decidedByAgent: true },
        { key: "use", label: "Verwendung", value: "eigener Verbrauch", certainty: "inferred", sources: [HISTORY], usedForResult: true, decidedByAgent: true },
      ],
    },
    {
      group: "document",
      facts: [
        { key: "service_date", label: "Leistungszeitraum", value: "01.11.2026 – 31.10.2027", certainty: "explicit", sources: [INVOICE], usedForResult: false, decidedByAgent: false },
        { key: "reverse_charge_notice", label: "Hinweis auf der Rechnung", value: "Reverse Charge", certainty: "explicit", sources: [{ ...INVOICE, quote: "Reverse charge: VAT to be accounted for by the recipient" }], usedForResult: false, decidedByAgent: false },
      ],
    },
    {
      group: "client",
      facts: [
        { key: "client_taxation_method", label: "Versteuerung", value: "Soll-Versteuerung", certainty: "confirmed", sources: [CLIENT], validFrom: "2026-01-01", validTo: "2026-12-31", usedForResult: false, decidedByAgent: false },
      ],
    },
  ],
};

const certain = (v: FactView): FactView => ({
  ...v,
  entry: v.entry ? { ...v.entry, assumedCount: 0 } : null,
  groups: v.groups.map((g) => ({
    ...g,
    facts: g.facts.map((f) =>
      f.certainty === "assumed"
        ? { ...f, certainty: "confirmed" as const, sources: [{ kind: "accounting_review" as const, label: "M. Weber, 12.11.2026" }] }
        : f,
    ),
  })),
});

const FRAME = { maxWidth: 600 };

/**
 * The normal case: entry with its origin, the result with „aus: …", one card
 * per group, one fact „angenommen" (neutral, no colour), the rest folded.
 */
export const WithAssumptions: Story = { render: () => <div style={FRAME}><FactRecordView view={BASE} /></div> };

/** Everything backed: nothing stands out, the view is calm. */
export const AllCertain: Story = { render: () => <div style={FRAME}><FactRecordView view={certain(BASE)} /></div> };

/**
 * Three open points on top: missing (the firm on turn), contradictory with two
 * sources each with its own value (Ludwig on turn), and one that blocks the
 * hand-over — the only red, and with its word.
 */
export const OpenPoint: Story = {
  render: () => (
    <div style={FRAME}>
      <FactRecordView
        view={{
          ...BASE,
          entry: BASE.entry ? { ...BASE.entry, provisional: true } : null,
          openPoints: [
            { id: "op-1", factKey: "use", label: "Verwendung", reason: "missing", detail: "Ob das Abonnement dem eigenen Betrieb dient, steht nirgends.", onTurn: "accounting", blocksHandover: false, evidence: [] },
            {
              id: "op-2",
              factKey: "supplier_country",
              label: "Land des Lieferanten",
              reason: "contradictory",
              detail: "Beleg und Stammdaten nennen verschiedene Länder.",
              onTurn: "ludwig",
              blocksHandover: false,
              evidence: [
                { ...INVOICE, locator: "S. 1, Absender", quote: "Dublin 2, Ireland", value: "Irland" },
                { ...PARTNER, value: "Deutschland" },
              ],
            },
            { id: "op-3", factKey: "counterparty_vat_id", label: "USt-IdNr.", reason: "uncertain", detail: "Die Bestätigungsabfrage beim BZSt ist abgelaufen.", onTurn: "client", blocksHandover: true, evidence: [] },
          ],
        }}
      />
    </div>
  ),
};

/** The entry rests on an open point: a hint under the entry, the point above it. */
export const Provisional: Story = {
  render: () => (
    <div style={FRAME}>
      <FactRecordView
        view={{
          ...BASE,
          entry: BASE.entry ? { ...BASE.entry, provisional: true } : null,
          openPoints: [{ id: "op-1", factKey: "use", label: "Verwendung", reason: "uncertain", detail: "Erschlossen aus den bisherigen Buchungen, nicht bestätigt.", onTurn: "accounting", blocksHandover: false, evidence: [] }],
        }}
      />
    </div>
  ),
};

/** Booked by hand: the origin says „Manuell", the facts stay visible. */
export const ByHand: Story = {
  render: () => (
    <div style={FRAME}>
      <FactRecordView view={{ ...BASE, entry: BASE.entry ? { ...BASE.entry, originMethod: "human" } : null }} />
    </div>
  ),
};

/** An entry from before booking from facts: a sentence, then today's reasoning — nothing gets lost. */
export const NoFactRecord: Story = {
  render: () => (
    <div style={FRAME}>
      <FactRecordView
        view={{ ...BASE, state: "no_fact_record", result: [], openPoints: [], groups: [], entry: BASE.entry ? { ...BASE.entry, originMethod: "model_agent" } : null }}
        legacy={
          <p className="lw-ui-text">
            Begründung: Konto wie bei den bisherigen Rechnungen dieses Lieferanten; § 13b, weil der Lieferant in Irland sitzt.
          </p>
        }
      />
    </div>
  ),
};

/** Loading: the form of the view in grey, the layout does not jump. */
export const Loading: Story = { render: () => <div style={FRAME}><FactRecordView view={BASE} load="loading" /></div> };

/** The error at its place: what · why · next step, with the way out. */
export const LoadError: Story = {
  render: () => (
    <div style={FRAME}>
      <FactRecordView view={BASE} load="error" onRetry={() => {}} />
    </div>
  ),
};

/**
 * Round trip of the back reference: a click on „Verwendung" under „Konto"
 * marks both facts the account rests on, moves focus to the first and says
 * so; the same click or Esc lifts the marking.
 */
export const BackReference: Story = { render: () => <div style={FRAME}><FactRecordView view={BASE} /></div> };

function InUseDemo() {
  const [opened, setOpened] = useState<string | null>(null);
  return (
    <Drawer open onClose={() => {}} size="md" title="Worauf die Buchung beruht" meta={opened ? `Geöffnet: ${opened}` : "Nordlicht Software Ltd. · 1.188,00 €"}>
      <FactRecordView
        view={BASE}
        openSource={(s) => (s.kind === "source_doc" ? () => setOpened(`${s.label}${s.locator ? `, ${s.locator}` : ""}`) : undefined)}
      />
    </Drawer>
  );
}

/** In use: the side panel at width `md`; a document opens beside the work, the rest links. */
export const InUse: Story = { render: () => <InUseDemo /> };
