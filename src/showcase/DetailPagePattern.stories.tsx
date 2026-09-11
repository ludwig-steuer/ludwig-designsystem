import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ComponentType } from "react";

import { ScenarioPage as AccountScenarioPage } from "./account/scenario";
import { moneyTransit } from "./account/scenarios";
import { Annotated, type Pin } from "./Annotated";
import { ScenarioPage as CaseScenarioPage } from "./case/scenario";
import { proposalPending } from "./case/scenarios";
import { Clean } from "./document/DocumentInvoice.stories";

/**
 * The detail-page guideline in pictures (owner order 2026-09-11): three
 * reference pages with every slot, zone and building block named, each with
 * the rule of `docs/detailseiten-standard.md` that asks for it. The pages are
 * the existing scenes (0144, 0152, 0157), untouched; the labels lie on top.
 */
const meta: Meta = {
  title: "Muster/Detailseite",
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

const DocumentScene = Clean.render as unknown as ComponentType;

const DOCUMENT_PINS: readonly Pin[] = [
  { selector: ".v2pager", label: "RecordPager", rule: "D3 · Slot 1 Pager: woher, wohin, „3 von 117“" },
  { selector: ".v2ehead", label: "EntityHeader", rule: "D6, D7 · Kopf: Kennung, Name, ein Zustand; Aktionen oben rechts (D8)" },
  { selector: ".v2callout", label: "StatusCallout", rule: "D22 · Signal: eine Meldung oder keine" },
  { selector: ".v2tabs", label: "Tabs", rule: "D10, D11, D19 · Reiter: Übersicht zuerst, Rohdaten (`raw`) zuletzt" },
  { selector: ".v2card", match: "Rechnung", label: "SourceDocumentPreview", rule: "D17 · Gegenüberstellung (`split`): das Original links" },
  { selector: ".v2doc__facts", label: "SourceDocumentFacts · FieldList", rule: "D4 · Zone 3 Fakten; D25 Herkunft am Wert" },
  { selector: ".v3open__body, .v3open__none", label: "OpenPoints", rule: "D2, D21 · Zone 2 Mängel; leer ein Satz (D23)" },
  { selector: ".v2card", match: "Umsatzsteuer", label: "SourceDocumentVat", rule: "D15 · Zone 4 Abriss mit Weg in den Reiter" },
  { selector: ".v2tl", label: "Timeline · SourceDocumentHistory", rule: "D26 · Zone 5 Verlauf, die letzten Schritte" },
];

const CASE_PINS: readonly Pin[] = [
  { selector: ".v2pager", label: "RecordPager", rule: "D3 · Slot 1 Pager, die Liste mit ihren Filtern (D19)" },
  { selector: ".v2ehead", label: "EntityHeader", rule: "D6 · ein Zustand; D24 der Betrag einmal" },
  { selector: ".v2callout", label: "StatusCallout", rule: "D22 · ein Signal; der nächste Schritt als ein Knopf (D8)" },
  { selector: ".v2tabs", label: "Tabs", rule: "D18, D19 · Reiter je Art, „Technik“ (`technical`) zuletzt" },
  { selector: ".v3cols", label: "Columns · list-detail-aside", rule: "D17 · das Spaltenmuster der Übersicht" },
  { selector: ".v3cols__list", label: "CaseTimeline", rule: "Zone 5 · der fachliche Strang, links; nennt seine Quelle (§2.2)" },
  { selector: ".v3open__body, .v3open__none", label: "OpenPoints", rule: "D2, D21 · Zone 2: was an diesem Fall offen ist" },
  { selector: ".v2card", match: "Fehlende Freigaben", label: "JournalEntryCard · Freigabe", rule: "D9 · die Arbeitsfläche in Spalte 2" },
  { selector: ".v3notes", label: "NoteFeed", rule: "D20 · Randspalte: Notizen am Vorgang" },
  { selector: ".v2exp", label: "ExpectationRow", rule: "D20 · offene Erwartungen rechts, unter „Zu tun“ nur fällig" },
  { selector: ".v2card", match: "Rückfragen", label: "ClarificationList", rule: "D20 · Randspalte: Rückfragen" },
];

const ACCOUNT_PINS: readonly Pin[] = [
  { selector: ".v2pager", label: "RecordPager", rule: "D3 · Slot 1 Pager" },
  { selector: ".v2ehead", label: "EntityHeader", rule: "D6 · Kennung und Name, keine Ersatzmarke; D24 der Saldo einmal, im Kopf" },
  { selector: ".v2tabs", label: "Tabs", rule: "D19 · Rohdaten (`raw`) zuletzt; die Liste hat keinen eigenen Reiter (§5.2)" },
  { selector: ".v3open__body, .v3open__none", label: "OpenPoints", rule: "D21 · Zone 2 Mängel" },
  { selector: ".v2kpigrid", label: "KpiTile", rule: "D15 · Zahlen mit Weg, gezählt wie die Liste (I12)" },
  { selector: ".v2card", match: "Soll und Haben je Monat", label: "BarChart", rule: "D16 · Diagramm nur in Zone 4, ab vier Werten" },
  { selector: ".v3cols--main-aside", label: "Columns · main-aside", rule: "D17 · Stufe `table`; beim Umbruch die Randspalte oben" },
  { selector: ".v3cols__aside", match: "Alle Stammdaten", label: "FieldList · Disclosure", rule: "D20 · Randspalte kompakt: drei Zeilen, der Rest unter „Alle Stammdaten“" },
  { selector: ".v2card", match: "Bewegungen 2026", label: "DataTable · accountEntryColumns", rule: "D18, §5.2 · die Liste mit Rang 4 vollständig in der Übersicht" },
];

/**
 * **Beleg** — the reference invoice (0144, R1 „sauber"): `split` with the
 * original on the left. There is no signal in this scene; the legend says so.
 */
export const Document: Story = {
  name: "Beleg",
  render: () => (
    <Annotated pins={DOCUMENT_PINS}>
      <DocumentScene />
    </Annotated>
  ),
};

/**
 * **Sachverhalt** — the reference case of the brief (0152, E1 „der Vorschlag
 * steht"): the overview as `list-detail-aside` with strand, work surface and
 * margin.
 */
export const AccountingCase: Story = {
  name: "Sachverhalt",
  render: () => (
    <Annotated pins={CASE_PINS}>
      <CaseScenarioPage scenario={proposalPending} />
    </Annotated>
  ),
};

/**
 * **Konto** — the reference account (0157, K1): the list at rank 4 in the
 * overview, master data in a compact margin that breaks above the list.
 */
export const Account: Story = {
  name: "Konto",
  render: () => (
    <Annotated pins={ACCOUNT_PINS}>
      <AccountScenarioPage scenario={moneyTransit} />
    </Annotated>
  ),
};
