import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AppShell, TopBar } from "@/ui/v3/primitives/AppShell";
import { NavList, type NavSection } from "@/ui/v3/primitives/NavList";

import { doneStock, largeStock, midStock } from "./fixtures";
import { PartnerListPage } from "./partner-list";

/**
 * Die Geschäftspartner-Liste als Seite (0128, Seitenprofil `partner-liste.md`).
 *
 * **Ein Suchwerkzeug, kein Katalog**: sechstausend Partner liest niemand, man
 * sucht einen — nach Name, USt-IdNr. oder Kontonummer. Eine Liste und eine
 * Sonderansicht „Vorschläge"; keine Stat-Leiste. Alles ist klickbar: Suche,
 * Filter, Sortierung, Pager, die Kontonummer öffnet den Konto-Drawer, ein
 * Vorschlag lässt sich annehmen. Alle Daten sind erfunden.
 */
const meta: Meta<typeof PartnerListPage> = {
  title: "Seiten/Geschäftspartner/Liste",
  component: PartnerListPage,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof PartnerListPage>;

const NAV: NavSection[] = [
  {
    label: "Mandant",
    items: [
      { label: "Übersicht", href: "#overview" },
      { label: "Sachverhalte", href: "#cases" },
      { label: "Konten", href: "#accounts" },
      { label: "Geschäftspartner", href: "#partners" },
    ],
  },
];

/**
 * **Im Einsatz** — der größte Mandant, 6.396 Partner, fast alle Debitoren. Die
 * meistgenutzten stehen oben; 77 % haben keine Buchung und wandern ans Ende.
 * Der Reiter „Vorschläge" sagt mit seiner Zahl, ob dort etwas wartet.
 */
export const InUse: Story = {
  render: () => (
    <AppShell
      topbar={<TopBar crumb="Musterbau GmbH · 2026 · Geschäftspartner" />}
      sidebar={<NavList sections={NAV} activePath="#partners" />}
    >
      <PartnerListPage stock={largeStock} />
    </AppShell>
  ),
};

/**
 * **Suche nach der Nummer.** Wer „10433" eintippt, sucht den Partner dahinter
 * — die Suche trifft Kontonummern, nicht nur Namen. Die Nummer öffnet den
 * Konto-Drawer; die Liste bleibt stehen.
 */
export const SearchByNumber: Story = { render: () => <PartnerListPage stock={largeStock} initial="q=10433" /> };

/**
 * **Gleichnamige.** Drei „Musterfirma Gebäudeservice GmbH" — der Fall, an dem
 * die Seite laut Profil misslingen würde. Die Kontonummern und Orte in der
 * Zeile unterscheiden sie.
 */
export const SameName: Story = { render: () => <PartnerListPage stock={largeStock} initial="q=Gebäudeservice" /> };

/**
 * **Ohne Personenkonto** — der Filter statt der Stat-Leiste. Die zwölf Treffer
 * sind die Abrechner: nur die Verrechnungsspalte ist gefüllt, und genau so
 * erklären sie sich. Die heutige Leiste meldete dieselben zwölf als Mangel.
 */
export const WithoutAccount: Story = { render: () => <PartnerListPage stock={midStock} initial="role=none" /> };

/** **Keine Treffer** — der Leerfall nach Filter: was gefiltert ist, und der Weg zurück. */
export const NoResults: Story = { render: () => <PartnerListPage stock={largeStock} initial="q=Zeppelin" /> };

/** **Bestand leer** — für den Mandanten ist nichts importiert; der Weg führt ins Onboarding. */
export const EmptyStock: Story = { render: () => <PartnerListPage stock={[]} /> };

/**
 * **Vorschläge** — 18 Kreditoren, die Ludwig aus Belegen angelegt hat. „Annehmen"
 * öffnet den Dialog mit der reservierten 89xxxx-Nummer. Drei Ziffern sperren
 * den Knopf, eine vergebene Nummer (etwa 70001) meldet sich im Dialog, eine
 * neue legt das Konto an: die Zeile geht, der Zähler sinkt, ein Toast sagt,
 * wie viele Buchungen umgezogen sind.
 */
export const Proposals: Story = { render: () => <PartnerListPage stock={midStock} initial="view=proposals" /> };

/** **Keine Vorschläge offen** — der dritte Leerfall, und er ist ein Erfolg. */
export const ProposalsDone: Story = { render: () => <PartnerListPage stock={doneStock} initial="view=proposals" /> };

/** **Lädt und Fehler** — Reiter und Filter stehen, die Liste hat die Form ihres Inhalts. */
export const LoadingAndError: Story = {
  render: () => (
    // One column that may shrink: an `auto` grid column grows to the table's
    // minimum width and pushed the page sideways (acceptance 0128).
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "var(--space-6)" }}>
      <PartnerListPage stock={largeStock} live={false} loading />
      <PartnerListPage stock={largeStock} live={false} error="Die Geschäftspartner konnten nicht geladen werden." />
    </div>
  ),
};

/** **Schmal** — bei 1024 px scrollt die Tabelle in ihrer Karte, die Seite nicht. */
export const Narrow: Story = {
  render: () => (
    <div style={{ maxWidth: 1024 }}>
      <PartnerListPage stock={largeStock} />
    </div>
  ),
};
