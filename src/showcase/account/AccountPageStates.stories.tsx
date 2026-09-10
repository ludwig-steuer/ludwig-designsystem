import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";

import { AppShell, TopBar } from "@/ui/v3/primitives/AppShell";
import { Banner } from "@/ui/v3/primitives/Banner";
import { Button } from "@/ui/v3/primitives/Button";
import { EmptyState } from "@/ui/v3/primitives/EmptyState";
import { NavList, type NavSection } from "@/ui/v3/primitives/NavList";
import { Skeleton } from "@/ui/v3/primitives/Skeleton";
import { Columns } from "@/ui/v3/patterns/Columns";

import { AccountPage } from "./AccountPage";
import { DetailsTab, RawTab, ScenarioPage } from "./scenario";
import { bankAccount, moneyTransit, unused, withoutLlmProfile } from "./scenarios";

/**
 * Die Seite selbst — Zustände, die keinem Konto gehören (0157, P1–P6): im
 * Einsatz, lädt/Fehler/nicht gefunden, alle Reiter, die Drawer, Suche und
 * Filter, schmal.
 */
const meta: Meta<typeof AccountPage> = {
  title: "Seiten/Konto/Seite",
  component: AccountPage,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof AccountPage>;

const NAV: NavSection[] = [
  {
    label: "Mandant",
    items: [
      { label: "Übersicht", href: "#overview" },
      { label: "Belege", href: "#documents" },
      { label: "Sachverhalte", href: "#cases" },
      { label: "Konten", href: "#accounts" },
    ],
  },
];

const noTab = () => "#";

function Labelled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section>
      <div className="lw-overline" style={{ padding: "var(--space-4) var(--space-5) 0" }}>
        {label}
      </div>
      {children}
    </section>
  );
}

/**
 * **P1 — im Einsatz.** K1 in der ganzen Anwendung, Pager „Konten · bebucht"
 * auf 12 von 316, `J`/`K` blättern. Die Abnahmefrage: stehen Kopf, Mängel,
 * Kacheln und der Anfang der Liste bei 1280 und 1440 × 900 über der Falz?
 */
export const InUse: Story = {
  render: () => (
    <AppShell
      topbar={<TopBar crumb="Musterbau GmbH · 2026" />}
      sidebar={<NavList sections={NAV} activePath="#accounts" />}
    >
      <ScenarioPage scenario={moneyTransit} />
    </AppShell>
  ),
};

/**
 * **P2 — lädt, Fehler, nicht gefunden.** Beim Laden steht der Kopf mit der
 * Nummer — sie kam mit der Adresse —, Kacheln und Liste haben die Form ihres
 * Inhalts. Der Fehler behält den Kopf und bietet „Erneut laden". „Nicht
 * gefunden" nennt das Jahr und führt in den Kontenplan und in die Jahre, in
 * denen es das Konto gibt.
 */
export const LoadingErrorNotFound: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-6)" }}>
      <Labelled label="lädt">
        <AccountPage facts={moneyTransit.facts} master={moneyTransit.master} tabHref={noTab} loading>
          <Columns
            pattern="main-aside"
            width="table"
            main={
              <div className="v2stack">
                <Skeleton lines={2} />
                <Skeleton lines={3} />
                <Skeleton lines={10} label="Bewegungen werden geladen …" />
              </div>
            }
            aside={<Skeleton lines={8} />}
          />
        </AccountPage>
      </Labelled>
      <Labelled label="Fehler">
        <AccountPage facts={moneyTransit.facts} master={moneyTransit.master} tabHref={noTab} loading>
          <Banner tone="danger" title="Das Konto konnte nicht geladen werden.">
            Der DATEV-Spiegel antwortet gerade nicht.{" "}
            <Button variant="secondary" size="sm">
              Erneut laden
            </Button>
          </Banner>
        </AccountPage>
      </Labelled>
      <Labelled label="nicht gefunden">
        <div style={{ padding: "var(--space-5)" }}>
          <EmptyState
            inline
            title="Konto 4711 gibt es im Wirtschaftsjahr 2026 nicht."
            description="Im Kontenrahmen steht es 2024 und 2025."
            action={
              <>
                <Button variant="secondary" size="sm" href="#accounts">
                  Zum Kontenplan
                </Button>{" "}
                <Button variant="tertiary" size="sm" href="#year-2025">
                  Konto 4711 in 2025
                </Button>
              </>
            }
          />
        </div>
      </Labelled>
    </div>
  ),
};

/**
 * **P3 — alle Reiter.** Details mit den zwei Werten, die hier ein Mensch
 * ändert — Verrechnungskonto (bestätigt mit Grund) und Beschreibung —, darunter
 * der Leerzustand ohne LLM-Profil. Rohdaten: drei Quellen, leise; leer ist dort
 * nur die Anreicherung.
 */
export const AllTabs: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-6)" }}>
      <AccountPage facts={moneyTransit.facts} master={moneyTransit.master} tab="details" tabHref={noTab}>
        <div className="v2stack">
          <DetailsTab scenario={moneyTransit} />
          <div className="lw-overline">Leerzustand</div>
          <DetailsTab scenario={withoutLlmProfile} />
        </div>
      </AccountPage>
      <AccountPage facts={moneyTransit.facts} master={moneyTransit.master} tab="raw" tabHref={noTab}>
        <div className="v2stack">
          <RawTab scenario={moneyTransit} />
          <div className="lw-overline">Leerzustand</div>
          <RawTab scenario={unused} />
        </div>
      </AccountPage>
    </div>
  ),
};

const FIRST_PROPOSAL = moneyTransit.entries.find((e) => e.origin === "ludwig")!.id;

/**
 * **P4 — die Drawer.** Die Seite öffnet mit einem Ludwig-Vorschlag im Drawer:
 * der Buchungssatz als Karte, Zustand, Begründung, die große Ansicht in der
 * Klappe, der Weg zum Sachverhalt im Fuß. Eine DATEV-Zeile öffnet denselben
 * Drawer mit Spiegel-Zustand statt Begründung; ein Gegenkonto (1600) den
 * Konto-Drawer. Den Partner-Drawer zeigt der Kreditor (K4). `Esc` schließt,
 * die Liste bleibt, wo sie war.
 */
export const Drawers: Story = {
  render: () => <ScenarioPage scenario={moneyTransit} initial={`entry=${FIRST_PROPOSAL}`} />,
};

/**
 * **P5 — Suche und Filter** am Bankkonto (K2). Drei Stände: die Suche
 * „Miete" findet 3; der Filter „exportiert" zeigt 5 und — eine Quelle — die
 * Saldospalte; eine Suche ohne Treffer zeigt den Leerfall **nach Filter** mit
 * Zurücksetzen, nicht den Leerfall des Jahres.
 */
export const SearchAndFilter: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-6)" }}>
      <Labelled label="Suche „Miete“">
        <ScenarioPage scenario={bankAccount} initial="q=Miete" live={false} />
      </Labelled>
      <Labelled label="Herkunft: exportiert">
        <ScenarioPage scenario={bankAccount} initial="origin=exported" live={false} />
      </Labelled>
      <Labelled label="ohne Treffer">
        <ScenarioPage scenario={bankAccount} initial="q=Pacht" live={false} />
      </Labelled>
    </div>
  ),
};

/**
 * **P6 — schmal.** K1 bei 1024 px: die Randspalte fällt unter die
 * Hauptfläche, nichts fällt weg.
 */
export const Narrow: Story = {
  render: () => (
    <div style={{ maxWidth: 1024 }}>
      <ScenarioPage scenario={moneyTransit} />
    </div>
  ),
};
