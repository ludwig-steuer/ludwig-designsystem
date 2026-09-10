import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import type { PartnerPersonalAccount } from "@/ludwig/modules/business-partners/domain/business-partner";
import { BusinessPartnerDrawer } from "@/ui/v3/entities/business-partner/BusinessPartnerDrawer";
import { AppShell, TopBar } from "@/ui/v3/primitives/AppShell";
import { Banner } from "@/ui/v3/primitives/Banner";
import { Button } from "@/ui/v3/primitives/Button";
import { EmptyState } from "@/ui/v3/primitives/EmptyState";
import { NavList, type NavSection } from "@/ui/v3/primitives/NavList";
import { Skeleton } from "@/ui/v3/primitives/Skeleton";

import { partnerFixture } from "../partner/fixtures";
import { CasePage } from "./CasePage";
import { listHref } from "./fixtures";
import { ScenarioPage } from "./scenario";
import { proposalPending } from "./scenarios";

/**
 * Die Seite selbst — Zustände, die keinem Fall gehören (0152, P1, P2, P4).
 *
 * „Leer nach Filter" ist nicht anwendbar: die Seite hat keinen Filter. P3
 * (alle Reiter mit Inhalt und Leerzustand) folgt als eigener Teil.
 */
const meta: Meta<typeof CasePage> = {
  title: "Seiten/Sachverhalt/Seite",
  component: CasePage,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof CasePage>;

const NAV: NavSection[] = [
  {
    label: "Mandant",
    items: [
      { label: "Übersicht", href: "/uebersicht" },
      { label: "Belege", href: "/belege" },
      { label: "Sachverhalte", href: "/sachverhalte" },
      { label: "Konten", href: "/konten" },
    ],
  },
];

/**
 * **P1 — im Einsatz.** Der Referenzfall in der ganzen Anwendung, mit
 * Navigation und dem Pager auf `3/117`. Die Abnahmefrage: stehen Kopf, Signal,
 * Fakten und der Anfang des Strangs bei 1280 und 1440 × 900 über der Falz?
 */
export const InUse: Story = {
  render: () => (
    <AppShell
      topbar={<TopBar crumb="Musterbau GmbH · 2026" />}
      sidebar={<NavList sections={NAV} activePath="/sachverhalte" />}
    >
      <ScenarioPage scenario={proposalPending} />
    </AppShell>
  ),
};

/**
 * **P2 — lädt, Fehler, nicht gefunden.** Drei der fünf Pflichtzustände
 * nebeneinander. Die Ladefläche hat die **Form des Inhalts** — Kopf, drei
 * Spalten —, der Fehler nennt den nächsten Schritt, und „nicht gefunden"
 * führt zurück in die Liste.
 */
export const LoadingErrorNotFound: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 40, padding: 24 }}>
      <div>
        <div className="v2muted" style={{ marginBottom: 8 }}>lädt</div>
        <div style={{ display: "grid", gap: 16 }}>
          <Skeleton lines={3} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr 0.8fr", gap: 16 }}>
            <Skeleton lines={8} />
            <Skeleton lines={8} />
            <Skeleton lines={5} />
          </div>
        </div>
      </div>

      <div>
        <div className="v2muted" style={{ marginBottom: 8 }}>Fehler</div>
        <Banner tone="danger" title="Der Sachverhalt konnte nicht geladen werden.">
          Die Verbindung zur Datenbank ist abgerissen. Laden Sie die Seite neu; bleibt es dabei,
          hilft nur ein Blick in die Protokolle.
        </Banner>
      </div>

      <div>
        <div className="v2muted" style={{ marginBottom: 8 }}>nicht gefunden</div>
        <EmptyState
          inline
          title="Diesen Sachverhalt gibt es nicht."
          description="Er wurde zusammengeführt oder gelöscht, oder die Kennung in der Adresse stimmt nicht."
          action={
            <Button variant="secondary" size="sm" href={listHref}>
              Zurück zu den Sachverhalten
            </Button>
          }
        />
      </div>
    </div>
  ),
};

const ACCOUNT: PartnerPersonalAccount = {
  accountId: "a-71202",
  fiscalYear: 2026,
  fiscalYearStatus: "open",
  role: "creditor",
  accountNumber: "71202",
  accountName: "Musterbau Fahrzeugteile GmbH",
  source: "onboarding_import",
  status: "active",
  datevSyncState: "synced",
  datevAccountId: null,
  datevAddresseeId: null,
  usageBookingCount: 14,
  lastBookingDate: "2026-06-22",
  isInternal: false,
};

/**
 * **P4 — der Partner als Drawer.** Wer im Kopf auf die Gegenpartei klickt,
 * bleibt auf der Seite: der Partner öffnet **über** ihr (D13), `Esc` schließt,
 * und die Stelle im Fall bleibt, wo sie war.
 */
export const PartnerDrawer: Story = {
  render: function Render() {
    const [open, setOpen] = useState(true);
    return (
      <>
        <ScenarioPage scenario={proposalPending} />
        <BusinessPartnerDrawer
          open={open}
          onClose={() => setOpen(false)}
          partner={partnerFixture({
            businessPartnerId: "bp-4711",
            legalName: "Musterbau Fahrzeugteile GmbH",
            shortName: "MUSTERBAU FAHRZ",
          })}
          accounts={[ACCOUNT]}
          caseCount={3}
          tabHref={(tab) => `?partner=bp-4711&tab=${tab}`}
          href="?partner=bp-4711"
          accountHref={(n) => `?account=${n}`}
        />
      </>
    );
  },
};
