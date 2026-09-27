import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";
import { MonoCell } from "@/ui/v3/primitives/Cells";
import { DocumentPage } from "./DocumentPage";
import { documentFixture } from "./fixtures";
import { InputTaxTab, type InputTaxVM } from "./InputTaxTab";

/**
 * The tab „Vorsteuer" of the document page (0206) — the check pattern embedded,
 * in its five states. Invented values; the rule codes follow the app's
 * catalogue (`docs/reference/input-tax-deduction/rule-catalog.md`).
 */
const meta: Meta<typeof DocumentPage> = {
  title: "Seiten/Beleg/Reiter Vorsteuer",
  component: DocumentPage,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof DocumentPage>;

const EXTRACTION: InputTaxVM["extraction"] = [
  ["Land des Lieferanten", "DE"],
  ["USt-IdNr.", <MonoCell key="u" value="DE 123 456 789" />],
  ["Steuerbetrag", "2.945,38 €"],
  ["Hinweis § 13b UStG", "keiner"],
  ["Positionen", "3 — Bauleistung 19 %, Material 19 %, Entsorgung 19 %"],
];

const NEEDS_FACTS: InputTaxVM = {
  verdict: { label: "Fakten klären", tone: "warning" },
  blockedTaxKeys: [],
  rules: [
    { code: "VST-03", title: "Ist der Leistungszeitraum angegeben?", result: "unknown", reason: "Auf der Rechnung steht kein Leistungsdatum; ohne es ist offen, in welchem Monat die Vorsteuer entsteht." },
    { code: "VST-05", title: "Ist die Leistung für das Unternehmen bezogen?", result: "unknown", reason: "Die Lieferadresse ist die Privatanschrift des Geschäftsführers — bitte klären, ob die Leistung betrieblich ist." },
    { code: "VST-01", title: "Ist es eine ordnungsgemäße Rechnung?", result: "pass", reason: "Name, Anschrift, Steuernummer, Rechnungsnummer und Datum sind vorhanden." },
    { code: "VST-02", title: "Ist die Steuer gesondert ausgewiesen?", result: "pass", reason: "19 % mit 2.945,38 € ausgewiesen." },
    { code: "VST-04", title: "Ist der Leistende Unternehmer?", result: "pass", reason: "USt-IdNr. DE 123 456 789 ist qualifiziert bestätigt." },
    { code: "VST-06", title: "Liegt ein Abzugsverbot vor?", result: "pass", reason: "Keine Bewirtung, kein Geschenk über 50 €, kein Fahrzeug." },
  ],
  facts: [
    { code: "business_use", label: "Leistung für das Unternehmen", value: "uncertain", source: "agent", rationale: "Lieferadresse privat, Leistungsbeschreibung betrieblich — Ludwig ist unsicher.", sourceFields: ["client_invoices.delivery_address", "client_invoices.line_items"] },
    { code: "service_date", label: "Leistungsdatum", value: "unknown", source: "derived", rationale: "Kein Datum auf der Rechnung gefunden.", sourceFields: ["client_invoices.service_date"] },
    { code: "proper_invoice", label: "Ordnungsgemäße Rechnung", value: "yes", source: "derived", rationale: "Alle Pflichtangaben erkannt.", sourceFields: ["client_invoices.vendor_name", "client_invoices.invoice_number"] },
    { code: "vendor_entrepreneur", label: "Leistender ist Unternehmer", value: "yes", source: "derived", rationale: "USt-IdNr. bestätigt am 12.09.2026.", sourceFields: ["client_invoices.vendor_ust_id"] },
    { code: "reverse_charge", label: "Steuerschuldnerschaft des Empfängers (§ 13b)", value: "no", source: "derived", rationale: "Kein Hinweis auf § 13b, Lieferant im Inland.", sourceFields: ["client_invoices.reverse_charge"] },
    { code: "hospitality", label: "Bewirtung", value: "not_applicable", source: "human", rationale: "Bauleistung, keine Bewirtung.", sourceFields: [] },
  ],
  notMachineChecked: [
    { code: "VST-09", title: "Gemischte Nutzung (Aufteilung)" },
    { code: "VST-11", title: "Kleinbetragsrechnung über 250 €" },
  ],
  assessment: { treatment: "domestic_taxed", status: "needs_agent", by: "agent", at: "2026-09-13T08:02:00+02:00", rationale: "Inländische Bauleistung mit 19 %; Betriebsbezug noch zu klären." },
  extraction: EXTRACTION,
};

const ALLOWED: InputTaxVM = {
  ...NEEDS_FACTS,
  verdict: { label: "Abzug möglich", tone: "success" },
  rules: NEEDS_FACTS.rules.map((r) => ({ ...r, result: "pass" as const, reason: r.result === "unknown" ? "Geklärt durch die Kanzlei am 14.09.2026." : r.reason })),
  facts: NEEDS_FACTS.facts.map((f) =>
    f.value === "uncertain" || f.value === "unknown" ? { ...f, value: "yes" as const, source: "human" as const, rationale: "Von der Kanzlei bestätigt." } : f,
  ),
  assessment: { ...NEEDS_FACTS.assessment, status: "decided", by: "human", at: "2026-09-14T10:30:00+02:00", rationale: "Betrieblich, Leistung im August 2026." },
};

const FORBIDDEN: InputTaxVM = {
  ...NEEDS_FACTS,
  verdict: { label: "Abzug gesperrt", tone: "danger" },
  blockedTaxKeys: ["9", "19"],
  rules: [
    { code: "VST-06", title: "Liegt ein Abzugsverbot vor?", result: "fail", reason: "Geschenk an einen Geschäftspartner über 50 € (§ 4 Abs. 5 Nr. 1 EStG) — die Vorsteuer ist nicht abziehbar." },
    ...NEEDS_FACTS.rules.filter((r) => r.code !== "VST-06" && r.result === "pass"),
  ],
  facts: [
    { code: "gift", label: "Geschenk über 50 €", value: "yes", source: "agent", rationale: "Präsentkorb 89,00 € netto an die Musterbau Schneider GmbH.", sourceFields: ["client_invoices.line_items"] },
    ...NEEDS_FACTS.facts.filter((f) => f.value === "yes" || f.value === "no"),
  ],
  notMachineChecked: [],
  assessment: { treatment: "domestic_taxed", status: "decided", by: "agent", at: "2026-09-13T08:02:00+02:00", rationale: "Geschenk, Abzugsverbot." },
};

const page = (children: ReactNode) => (
  <DocumentPage document={documentFixture()} tab="input_tax">
    {children}
  </DocumentPage>
);

/** Filled, the usual case: two rules to clarify, two facts open, the rest settled and folded. */
export const NeedsFacts: Story = { render: () => page(<InputTaxTab vm={NEEDS_FACTS} />) };

/** Everything settled: the verdict green, rules and facts each in one line. */
export const Allowed: Story = { render: () => page(<InputTaxTab vm={ALLOWED} />) };

/** A rule violated: red, the blocked tax keys as the consequence. */
export const Forbidden: Story = { render: () => page(<InputTaxTab vm={FORBIDDEN} />) };

/** Empty, never filled: no invoice data yet — why, and what will stand here. */
export const NoExtraction: Story = { render: () => page(<InputTaxTab vm={null} />) };

/** Loading: skeleton in the shape of the tab. */
export const Loading: Story = { render: () => page(<InputTaxTab vm={null} state="loading" />) };

/** The assessment failed: what, why, retry — the stored treatment is untouched. */
export const LoadError: Story = { render: () => page(<InputTaxTab vm={null} state="error" />) };
